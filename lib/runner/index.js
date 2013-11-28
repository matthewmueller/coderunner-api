/**
 * Module dependencies
 */

var debug = require('debug')('coderunner:runner');
var Emitter = require('emitter-component');
var volume = require('volume');
var co = require('co');
var language = require('language');
var Command = require('command');

/**
 * Export `Runner`
 */

module.exports = Runner;

/**
 * Initialize `Runner`
 *
 * @param {Object} ctx
 * @return {Runner} [description]
 */

function Runner(ctx) {
  if (!(this instanceof Runner)) return new Runner(ctx);
  this.ctx = ctx;
  this.cmd = language(ctx.language);
}

/**
 * Mixin `Emitter`
 */

Emitter(Runner.prototype);

/**
 * Run the code
 *
 * @api public
 */

Runner.prototype.run = function(fn) {
  var self = this;
  var ctx = this.ctx;
  var cmd = this.cmd;

  co(function *() {
    ctx.cwd = yield self.write(ctx.files);

    // install dependencies if we have a dependency file
    if (cmd.dependencies && ctx.files[cmd.dependencies]) {
      yield self.install(ctx);
    }

    return yield self.execute(ctx);
  })(fn);
};

/**
 * Write the files to the volume
 *
 * @api private
 */

Runner.prototype.write = function() {
  return volume(this.ctx.files);
};

/**
 * Install dependencies
 *
 * @api private
 */

Runner.prototype.install = function() {
  var self = this;
  var ctx = this.ctx;
  var cmd = this.cmd;

  ctx.timeout = 60000;
  var installer = new Command(ctx);

  installer.on('stdout', function(stdout) {
    debug('stdout (install): %s', stdout);
    self.emit('install stdout', stdout);
  });

  installer.on('stderr', function(stderr) {
    debug('stderr (install): %s', stderr);
    self.emit('install stderr', stderr);
  });

  cmd = ('string' == typeof cmd.install) ? cmd.install : cmd.install.join(';');
  debug('install command: %s', cmd);
  return installer.run(cmd);
}

/**
 * Execute the code
 *
 * @api private
 */

Runner.prototype.execute = function() {
  var self = this;
  var ctx = this.ctx;
  var cmd = this.cmd;

  ctx.timeout = 15000;
  var runner = new Command(ctx);

  runner.on('stdout', function(stdout) {
    debug('stdout (running): %s', stdout);
    self.emit('run stdout', stdout);
  });

  runner.on('stderr', function(stderr) {
    debug('stderr (running): %s', stderr);
    self.emit('run stderr', stderr);
  });

  cmd = ('string' == typeof cmd.run) ? cmd.run : cmd.run.join(';');
  debug('run command: %s', cmd);
  return runner.run(cmd);
};
