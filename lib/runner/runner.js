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
 * Install
 */

Runner.prototype.install = function(fn) {
  var cmd = this.cmds.install;
  if (!cmd) return fn();

  var ctx = {}
  ctx.cwd = this._cwd;
  ctx.cmd = cmd;

  install(ctx, fn);
};

/**
 * Run
 */

Runner.prototype.run = function(fn) {
  var cmd = this.cmds.run;
  if (!cmd) return fn();

  var ctx = {}
  ctx.cwd = this._cwd;
  ctx.cmd = cmd;

  run(ctx, fn);
};
