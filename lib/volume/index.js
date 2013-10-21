/**
 * Module dependencies
 */

var debug = require('debug')('coderunner-api:volume');
var path = require('path');
var join = path.join;
var fs = require('co-fs');
var writeFile = fs.writeFile;
var conf = require('conf');
var mkdirp = require('mkdirp');
var co = require('co');
var uid = require('uid');

/**
 * Export `volume`
 */

module.exports = volume;

/**
 * Initialize `volume`
 */

function volume(files) {
  var root = conf['script volume'];
  var id = uid(8);
  var dir = join(root, id);
  var writes = [];

  // add the files
  for(var file in files) {
    var path = join(dir, file);
    debug('adding file to volume: %s', path);
    writes[writes.length] = fs.writeFile(path, files[file]);
  }

  return function *() {
    // make the dir if it doesn't already exist
    yield mkdir(dir);

    // write the files in parallel
    yield writes;

    debug('written files to volume: %s', dir);
    return dir;
  };
}

/**
 * Handle mkdirp yielding
 */

function mkdir(dir) {
  return function(done) {
    mkdirp(dir, done);
  }
}
