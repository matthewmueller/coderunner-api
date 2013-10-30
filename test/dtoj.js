/**
 * Module Dependencies
 */

// var co = require('co');
// var fs = require('co-fs');
var fs = require('fs');
var path = require('path');
var join = path.join;

/**
 * Export
 */

module.exports = dtoj;

/**
 * dtoj sync
 */

function dtoj(dir) {
  var out = {};
  var files = fs.readdirSync(dir);

  files.forEach(function(file) {
    if (file[0] == '.') return;
    try {
      out[file] = fs.readFileSync(join(dir, file), 'utf8');
    } catch(e) {}
  });

  return out;
}

/**
 * Initialize `dtoj`
 *
 * @param {String} dir
 * @param {Function} fn
 */

// function dtoj(dir, fn) {
//   co(function *() {
//     var out = {};
//     var files = yield fs.readdir(dir);

//     var contents = yield each(files, function(file) {
//       return fs.readFile(join(dir, file), 'utf8');
//     });

//     files.forEach(function(file, i) {
//       out[file] = contents[i];
//     });

//     return out;
//   })(fn);
// }

// /**
//  * Parallel each function from Julian Gruber
//  */

// function each(arr, fn) {
//   return arr.map(function(el, i, all) {
//     return fn(el, i, all);
//   });
// }



// var json = dtoj(__dirname + '/node');
// console.log(json);
