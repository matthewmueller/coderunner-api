/**
 * Module dependencies
 */

var path = require('path');
var join = path.join;
var fs = require('co-fs');
var conf = require('conf');
var mkdirp = require('mkdirp');
var co = require('co');
var uid = require('uid')

/**
 * Export `Volume`
 */

module.exports = Volume;

/**
 * Initialize `Volume`
 */

function Volume(path) {
  if (!(this instanceof Volume)) return new Volume(path);
  this.id = uid(8);
  this.path = join(path, this.id);
  mkdirp.sync(this.path);
}

/**
 * Write a file to the volume
 *
 * @TODO: handle individual writes
 */

Volume.prototype.write = function(files, fn) {
  var writes = [];
  for(var file in files) {
    var path = join(this.path, file);
    writes[writes.length] = fs.writeFile(path, files[file], 'utf8');
  }

  // write to path
  co(function *() {
    var err = yield writes;
    // loop through errors
    for (var i = 0, len = err.length; i < len; i++) if (err[i]) return fn(err[i]);
    return fn();
  });
};
