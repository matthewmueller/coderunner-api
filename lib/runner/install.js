/**
 * Module Dependencies
 */

var debug = require('debug')('coderunner:runner:install');
var exec = require('child_process').exec;
var args = require('args');

/**
 * Expose `install`
 */

module.exports = (!!args.insecure) ? insecure : secure;

/**
 * Secure install
 */

function secure(ctx, fn) {

}

/**
 * Insecure install
 *
 * @todo make streaming
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
