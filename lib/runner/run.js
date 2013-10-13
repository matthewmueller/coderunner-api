/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:runner:run');
var path = require('path');
var join = path.join;
var args = require('args');
var shelly = require('shelly');
var ms = require('ms');
var co = require('co');
var cp = require('child_process');
var fs = require('co-fs');
var readFile = fs.readFile;
var rmFile = fs.unlink;
var conf = require('conf');
var moduleVolume = conf['module volume'];

/**
 * Expose `run`
 */

module.exports = (!!args.insecure) ? insecure : secure;

/**
 * Secure run
 */

function secure(ctx, fn) {
  var lang = ctx.lang;
  var installer = ctx.installer;
  var args = [];

  args.push('docker run');

  // add the script volume to the container
  args.push('-v', [ctx.cwd, '/home'].join(':'));

  // add installer volume to the container
  var localvolume = join(moduleVolume, installer);
  args.push('-v', [localvolume, '/' + installer].join(':'));

  // add memory limit (5mb)
  // Not supported (by default) in ubuntu 12.04 or 13.04
  //args.push('-m', '5242880');

  // set the working directory
  args.push('-w', '/home');

  // add a cpu limit (10%)
  args.push('-c', 100);

  // run the docker container
  var run = co(function *() {
    var cidfile = yield exec('mktemp -u');
    cidfile = cidfile.stdout.trim();

    // add the cid file
    args.push('-cidfile', cidfile);

    // Add the runner and command
    args.push(ctx.lang + '-runner2');

    // Add the command
    args.push('sh -c', '"' + ctx.cmd + '"');

    var res = { stdout: '', stderr: '' };

    // run docker
    try {
      res = yield exec(args.join(' '), {
        timeout: ms('15s')
      });
    } catch (e) {
      if (e.killed) throw new Error('script took too long to run.');
      else throw e;
    } finally {
      // cleanup
      var cid = yield readFile(cidfile, 'utf8');
      yield exec('docker kill ' + cid);
      yield exec('docker rm ' + cid);
      yield rmFile(cidfile);
    }

    return res;
  });

  run(function(err, res) {
    if (err) return fn(err);
    return fn(null, res);
  });

}

/**
 * Insecure run
 */

function insecure(ctx, fn) {
  var opts = {};
  opts.cwd = ctx.cwd;

  cp.exec(ctx.cmd, opts, function(err, stdout, stderr) {
    if (err) return fn(err);
    return fn(null, {
      stderr: stderr,
      stdout: stdout
    });
  });
}

/**
 * exec for co
 */

function exec(cmd, opts){
  return function(done){
    var p = cp.exec(cmd, opts, function(err, stdout, stderr){
      done(err, {
        stdout: stdout,
        stderr: stderr
      });
    });

    p.stdin.end();
  }
};
