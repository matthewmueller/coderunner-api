/**
 * Module dependencies.
 */

var debug = require('debug')('coderunner')
var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app);
var args = require('args');
var port = args.port || 8080;
var co = require('co');
var volume = require('volume');
var language = require('language');
var Runner = require('runner');

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
 * Insecure warning
 */

if (args.insecure) {
  console.warn('\033[33mWarning: this server is running in insecure mode\033[m');
}

/**
 * Routes
 *
 * Test commands:
 *
 * - node.js: curl --data @test/node/fast.json -H "Content-Type: application/json" http://localhost:8080/node
 */

app.post('/', function(req, res, next) {
  var body = req.body;
  if (!body.language) return next();
  req.url = '/' + body.language;
  next();
});

app.post('/:lang', function(req, res, next) {
  var lang = req.params.lang;
  var cmd = language(lang);
  if (!cmd) return res.send(500, { error: 'language not supported.' });
  var body = req.body;
  if (!body.files) return res.send(400, { error: 'no files to run.' });

  var runner = new Runner({
    language: lang,
    files: body.files
  });

  var buf = {
    install: { stdout: [], stderr: [] },
    run: { stdout: [], stderr: [] }
  };

  runner.on('install stdout', function(stdout) {
    buf.install.stdout.push(stdout);
  });

  runner.on('install stderr', function(stderr) {
    buf.install.stderr.push(stderr);
  });

  runner.on('run stdout', function(stdout) {
    buf.run.stdout.push(stdout);
  });

  runner.on('run stderr', function(stderr) {
    buf.run.stderr.push(stderr);
  });

  runner.run(done);

  // handle response
  function done(err, result) {
    if (err) {
      return res.send(500, { error: err.toString() });
    } else if (buf.install.stderr.length) {
      return res.send(500, { error: buf.install.stderr.join('') });
    } else if (buf.run.stderr.length) {
      return res.send(500, { error: buf.run.stderr.join('') });
    }

    if (body.verbose) {
      buf.run.stdout = buf.install.stdout.concat(buf.run.stdout);
    }

    res.send(200, buf.run.stdout.join(''));
  }
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
    console.log('Listening on port %s', port);
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
