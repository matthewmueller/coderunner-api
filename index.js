/**
 * Module dependencies.
 */

var debug = require('debug')('coderunner')
var express = require('express');
var engine = require('engine.io');
var es = new engine.Server();
var IO = require('io-server');
var app = express();
var server = module.exports = require('http').createServer(app);
var args = require('args');
var port = args.port || 9000;
var co = require('co');
var volume = require('volume');
var language = require('language');
var Runner = require('runner');

/**
 * Configuration
 */

app.use(express.favicon(__dirname + '/favicon.ico'));
app.use(express.json());
app.use(express.query());
app.use('/engine.io', es.handleRequest.bind(es));

app.configure('production', function() {
  app.use(express.compress());
});

app.configure('development', function(){
  app.use(express.logger('dev'));
});

/**
 * Handle the websocket upgrade
 */

server.on('upgrade', function(req, socket, head) {
  es.handleUpgrade(req, socket, head);
});

/**
 * Handle the websocket connection
 */

es.on('connection', IO)

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
 * - node.js: curl --data @test/node/fast.json \
 *              -H "Content-Type: application/json" \
 *              http://localhost:8080/node
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
      err = buf.install.stderr.join('') || buf.run.stderr.join('') || err.toString();
      return res.send(500, { error: err });
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
 * Socket
 */

IO.on('run', function(body) {
  var io = this;

  // create a new runner
  var runner = new Runner({
    language: body.language,
    files: body.files
  });

  runner.on('install stdout', function(stdout) {
    if (body.verbose) io.emit('install stdout', stdout);
  });

  runner.on('install stderr', function(stderr) {
    io.emit('install stderr', stderr);
  });

  runner.on('run stdout', function(stdout) {
    io.emit('run stdout', stdout);
  });

  runner.on('run stderr', function(stderr) {
    io.emit('run stderr', stderr);
  });

  runner.run(done);

  function done(err) {
    if (err) io.emit('error', err);
    io.emit('end');
  }
});

/**
 * Environment configurations
 */

app.configure(function() {
  app.use(express.errorHandler());
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
