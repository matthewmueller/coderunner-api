/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app);
var args = require('args');
var port = args.port || 8080;
var co = require('co');
var volume = require('volume');
var Runner = require('runner');
var language = require('language');

/**
 * Configuration
 */

app.use(express.favicon(__dirname + '/favicon.ico'));
app.use(express.json());

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

app.post('/', function(req, res, next) {
  var body = req.body;
  if (!body.language) return next();
  req.url = '/' + body.language;
  next();
});

app.post('/:lang', function(req, res, next) {
  var body = req.body;
  if (!body.files) return res.send(400, { error: 'no files to run.' });

  var lang = req.params.lang;
  var cmd = language(lang);
  if (!cmd) return res.send(500, { error: 'language not supported.' });

  // add the context
  var ctx = {};
  ctx.files = body.files;
  ctx.language = body.language;

  // run the script
  var go = co(function *() {

    // write files
    ctx.cwd = yield volume(body.files);

    // Install
    ctx.timeout = 30000;
    var installer = new Runner(ctx);

    installer.on('stdout', function(stdout) {
      res.write(stdout);
    });

    installer.on('stderr', function(stderr) {
      res.write(stderr);
    });

    yield installer.run(cmd.install);

    // Run
    ctx.timeout = 10000;
    var runner = new Runner(ctx);

    runner.on('stdout', function(stdout) {
      res.write(stdout);
    });

    runner.on('stderr', function(stderr) {
      res.write(stderr);
    });

    return yield runner.run(cmd.run);
  });

  go(function(err, result) {
    if (err) {
      res.statusCode = 500;
      return res.end(err.toString());
    } else {
      res.statusCode = 200;
      return res.end(result);
    }
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

if (!module.parent) {
  server.listen(port, function() {
    console.log('listening on port %s', port);
  });
}

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

/**
 * Wrap the co functions
 *
 * TODO: move out
 */

function wrap(fn, ctx){
  return function(){
    var args = [].slice.call(arguments);
    ctx = ctx || this;
    return function(done){
      args.push(done);
      fn.apply(ctx, args);
    }
  }
}
