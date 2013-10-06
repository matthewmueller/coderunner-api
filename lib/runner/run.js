/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:runner:run');
var exec = require('child_process').exec;
var args = require('args');

/**
 * Expose `run`
 */

module.exports = (!!args.insecure) ? insecure : secure;

/**
 * Secure run
 */

function secure(ctx, fn) {

}

/**
 * Insecure run
 */

function insecure(ctx, fn) {
  var opts = {};
  opts.cwd = ctx.cwd;

  exec(ctx.cmd, opts, function(err, stdout, stderr) {
    if (err) return fn(err);
    if (stderr) return fn(new Error(stderr));
    return fn(null, stdout || '');
  });
}
