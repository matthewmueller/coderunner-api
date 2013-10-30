/**
 * Module Dependencies
 */

var cp = require('child_process');
var spawn = cp.spawn;

/**
 * Be evil
 */

var cmd = 'sh';
var args = ['-c', 'while true; do echo \"hi\" >> test.txt; sleep 2; done'];
var child = spawn(cmd, args, { detached: true });
child.unref();

process.stdout.write(child.pid.toString());
