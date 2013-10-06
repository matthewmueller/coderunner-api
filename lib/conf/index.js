/**
 * Module Dependencies
 */

var path = require('path');
var join = path.join;
var project = join(__dirname, '../../');
var home = process.env.HOME;
var c = module.exports = require('c.js')();

/**
 * All
 */

c.server({
  'project': project,
  'script volume': join(project, 'scripts/')
});

/**
 * Production
 */

var prod = c.env('production');

prod.server({
  'script volume': join(home, 'scripts/')
});

/**
 * Private
 */

var private = c.import(require('./private'));

/**
 * Write
 */

c.write(__dirname + '/client.js');
