/**
 * Module dependencies
 */

var debug = require('debug')('coderunner:runner');
var Emitter = require('emitter-component');
var cp = require('child_process');
var args = require('args');
var spawn = cp.spawn;
var co = require('co');
var exec = require('co-exec');
var fs = require('co-fs');

/**
 * Export `Runner`
 */

module.exports = Runner;

/**
 * Initialize `Runner`
 */

function Runner(ctx) {
  if (!(this instanceof Runner)) return new Runner(ctx);
  this.ctx = ctx;
}

/**
 * Mixin `Emitter`
 */

Emitter(Runner.prototype);

/**
 * Run the command
 *
 * - secure: use docker
 * - insecure: use spawn
 *
 * @param {String} cmd
 * @return {Function}
 */

Runner.prototype.run = function(cmd) {
  return (!!args.insecure) ? this.insecure(cmd) : this.secure(cmd);
}

/**
 * Run in docker
 *
 * @param {String} cmd
 * @return {Function}
 * @api public
 */

Runner.prototype.secure = function(cmd) {
  var self = this;
  var ctx = this.ctx;
  var timeout = ctx.timeout || 10000;
  var image = ctx.language + '-runner';
  var args = ['run'];

  // set the working directory
  args.push('-w', '/home');

  // add a cpu limit (10%)
  args.push('-c', 100);

  // add in the volume
  args.push('-v', [ctx.cwd, '/home'].join(':'));

  // create the cidfile
  function *cidfile() {
    var cidfile = yield exec('mktemp -u');
    cidfile = cidfile.trim();
    args.push('-cidfile', cidfile);
    return cidfile;
  }

  // run the command
  function run(fn) {
    // Add the runner and command
    args.push(image);

    // Add the command
    args.push('sh', '-c', cmd);

    debug('running: docker %s', args.join(' '))

    // spawn the process
    var docker = spawn('docker', args);

    // set a timeout of 20s
    var to = setTimeout(function() {
      debug('timeout triggered after: %s', timeout);
      docker.kill();
    }, timeout);

    // listen for stdout
    docker.stdout.on('data', function(stdout) {
      self.emit('stdout', stdout.toString());
    });

    // listen for stderr
    docker.stderr.on('data', function(stderr) {
      self.emit('stderr', stderr.toString());
    });

    // close the child process
    docker.on('close', function(code) {
      clearTimeout(to);
      var err = (0 == code) ? undefined : new Error('docker returned with error: ' + code);
      if (err) {
        self.emit('error', err);
        fn(err);
      } else {
        self.emit('end');
        fn();
      }
    });

    // close stdin immediately
    docker.stdin.end();
  }

  // cleanup after docker
  function *cleanup(cidfile) {
    var cid = yield fs.readFile(cidfile, 'utf8');
    yield exec('docker kill ' + cid);
    yield exec('docker rm' + cid);
    yield fs.unlink(cidfile);
  }

  // create cidfile, run docker, cleanup
  return function *() {
    var cid = yield cidfile;
    try {
      yield run;
    } catch(e) {
      throw e;
    } finally {
      // cleanup regardless if there was an error or not.
      yield cleanup(cid);
    }
  };
};


/**
 * Insecure command
 *
 * @param {String} cmd
 * @return {Function}
 * @api public
 */

Runner.prototype.insecure = function(cmd) {
  var self = this;
  var ctx = this.ctx;
  var opts = {};
  opts.cwd = ctx.cwd;

  return function(fn) {
    var sh = spawn('sh', ['-ec', cmd], opts);

    sh.stdout.on('data', function(stdout) {
      self.emit('stdout', stdout.toString());
    });

    sh.stderr.on('data', function(stderr) {
      self.emit('stderr', stderr.toString());
    });

    sh.on('close', function(code) {
      var err = (0 == code) ? false : new Error(cmd + ' exited with code: ' + code);
      if (err) {
        self.emit('error', err);
        fn(err);
      } else {
        self.emit('end');
        fn();
      }
    })

    // close stdin
    sh.stdin.end();
  }
};

