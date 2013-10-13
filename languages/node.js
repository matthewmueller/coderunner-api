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
 * Run
 */

exports.run = 'ln -s ../node_modules/ node_modules; npm install -s > /dev/null; node .';
// exports.run = 'npm install -s > /dev/null; node .';
