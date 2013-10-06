/**
 * Module Dependencies
 */

var path = require('path');
var join = path.join;
var basename = path.basename;
var extname = path.extname;
var fs = require('fs');
var readdir = fs.readdirSync;
var conf = require('conf');
var dir = join(conf.project, 'languages');

/**
 * Cache the languages
 */

var languages = {};

readdir(dir).forEach(function(l) {
  var path = join(dir, l);
  var key = basename(l, extname(l));
  languages[key] = require(path);
});

/**
 * Expose `language`
 */

module.exports = language;

/**
 * Fetch the language
 */

function language(l) {
  return languages[l] || false;
}
