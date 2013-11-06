/**
 * Module Dependencies
 */

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
