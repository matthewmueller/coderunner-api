/**
 * Module dependencies.
 */

var path = require('path');
var join = path.join;
var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app);
var conf = require('conf');
var args = require('args');
var port = args.port || 8080;
var co = require('co');
var Volume = require('volume');
var Runner = require('runner/runner.js');

/**
 * Configuration
 */

app.use(express.favicon(__dirname + '/favicon.ico'));
app.use(express.bodyParser());

app.configure('production', function() {
  app.use(express.compress());
});

app.configure('development', function(){
  app.use(express.logger('dev'));
});

/**
 * Routes
 *
 * Test commands:
 *
 * - node.js: curl --data @test/json/node.json -H "Content-Type: application/json" http://localhost:8080/node
 */

app.post('/:lang', function(req, res, next) {
  var runner = new Runner(req.params.lang);
  var body = req.body;
  if (!runner) return res.send(500, { error: 'language not supported.' });
  if (!body.files) return res.send(400, { error: 'no files to run.' });

  runner.files(body.files);

  // volume
  var volume = new Volume(conf['script volume']);
  var write = co.wrap(volume.write, volume);

  // runner
  // var install = co.wrap(runner.install, runner);
  var run = co.wrap(runner.run, runner);

  // run the script
  var go = co(function *() {

    // write files
    yield write(body.files);

    // give the runner the volume directory
    runner.cwd(volume.path);

    // run the code
    var result = yield run();

    // return the result
    return result;
  });

  go(function(err, result) {
    if (err) return res.send(500, { error: err });
    if (result.stderr) return res.send(400, { stderr: result.stderr });
    return res.send(200, result.stdout);
  });
});

/**
 * Environment configurations
 */

app.configure('development', function() {
  app.use(express.errorHandler());
});

// TODO: make more user-friendly & log
app.configure('production', function() {
  // build once
  build(function(err) {
    if (err) throw(err);
  });

  app.use(function(err, req, res, next) {
    res.redirect('/');
  });
});

/**
 * Listen
 */

server.listen(port, function() {
  console.log('listening on port %s', port);
});

/**
 * Graceful shutdown
 */

function shutdown() {
  console.log('server: shutting down');
  server.close(function(){
    console.log('server: exiting');
    setTimeout(function() {
      process.exit();
    }, 2000);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);
