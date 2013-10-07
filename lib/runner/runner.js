/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:runner');
var install = require('./install');
var run = require('./run');
var language = require('language');

/**
 * Export `Runner`
 */

module.exports = Runner;

/**
 * Initialize `Runner`
 */

function Runner(lang) {
  if (!(this instanceof Runner)) return new Runner(lang);
  this.cmds = language(lang);
  if (!this.cmds) return false;
}

/**
 * Add the volume cwd
 */

Runner.prototype.cwd = function(cwd) {
  this._cwd = cwd;
}

/**
 * Add the files to runner
 */

Runner.prototype.files = function(files) {
  this._files = files;
}

/**
 * Install
 */

// Runner.prototype.install = function(fn) {
//   var cmd = this.cmds.install;
//   if (!cmd) return fn();

//   var ctx = {}
//   ctx.cwd = this._cwd;

//   if ('function' == typeof cmd) {
//     cmd(this._files, ctx, function(err, command) {
//       if (err) return fn(err);
//       else if (!command) return fn();
//       ctx.cmd = command;
//       install(ctx, fn);
//     });
//   } else {
//     ctx.cmd = cmd;
//     install(ctx, fn);
//   }
// };

/**
 * Run
 */

Runner.prototype.run = function(fn) {
  var cmd = this.cmds.run;
  if (!cmd) return fn();

  var ctx = {};
  ctx.cwd = this._cwd;

  if ('function' == typeof cmd) {
    cmd(this._files, ctx, function(err, command) {
      if (err) return fn(err);
      else if (!command) return fn();
      ctx.cmd = command;
      run(ctx, fn);
    });
  } else {
    ctx.cmd = cmd;
    run(ctx, fn);
  }
};
