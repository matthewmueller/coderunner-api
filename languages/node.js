/**
 * Install
 */

// exports.install = function(files, ctx, fn) {
//   var pkg = files['package.json'];
//   if (!pkg) return fn(null, false);
//   var deps = JSON.parse(pkg).dependencies;
//   if (!deps) return fn(null, false);

//   var arr = [];
//   for(var dep in deps) {
//     arr.push(dep + '@' + deps[dep]);
//   }

//   fn(null, 'npm install -s ' + arr.join(' '));
// }

/**
 * Install
 */

exports.install = 'npm install -s';

/**
 * Dependency file
 */

exports.dependencies = 'package.json';

/**
 * Run
 */

exports.run = 'node .';
