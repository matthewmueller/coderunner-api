/**
 * Module dependencies
 */

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
    self.emit('install stdout', stdout);
  });

  installer.on('stderr', function(stderr) {
    self.emit('install stderr', stderr);
  });

  return installer.run(cmd.install);
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
    self.emit('run stdout', stdout);
  });

  runner.on('stderr', function(stderr) {
    self.emit('run stderr', stderr);
  });

  return runner.run(cmd.run);
};
