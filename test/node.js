/**
 * Module Dependencies
 */

var https = require('https');
var assert = require('better-assert');
var supertest = require('supertest');
var dtoj = require('./dtoj');
var dir = __dirname + '/node/';
var IO = require('io-component');
var app = require('..');

/**
 * Create a server to listen on
 *
 * TODO: have supertest also rely on this server.
 */

var addr = app.address();
if (!addr) app.listen(0);
var port = app.address().port;
var protocol = app instanceof https.Server ? 'https' : 'http';
var address = protocol + '://127.0.0.1:' + port + '/';

/**
 * Tests
 */

describe('node/', function () {
  var io;

  before(function(done) {
    io = IO(address);
    io.socket.on('open', done);
  });

  beforeEach(function() {
    io = io.channel();
  });

  describe('hello-world/', function() {
    this.timeout(1000);
    var json = dtoj(dir + 'hello-world');

    it('should handle projects with no package.json', function(done) {
      supertest(app)
        .post('/node')
        .send({ files: json })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          assert('hello world!' == res.text);
          done();
        })
    });

    it('should handle a websocket connection', function(done) {
      var obj = {};
      var stdout = '';
      obj.language = 'node';
      obj.files = json;

      io.emit('run', obj);

      io.on('run stdout', function(so) {
        stdout += so;
      });

      io.on('end', function() {
        assert('hello world!' == stdout);
        done();
      });

    });
  });

  describe('spawn/', function() {
    this.timeout(20000);
    var json = dtoj(dir + 'spawn');
    it('should clean up forked processes', function(done) {

      supertest(app)
        .post('/node')
        .send({ files: json })
        .expect(200)
        .end(function(err, res) {
          // TODO: verified it with ps aux | grep "sh", but
          // should be able to check it programmatically
          done(err);
        });
    });

  });

  describe('loop/', function() {
    this.timeout(20000);
    var json = dtoj(dir + 'loop');
    it('should handle infinite loops', function(done) {

      supertest(app)
        .post('/node')
        .send({ files: json })
        .expect(200)
        .end(done);
    });
  });

  describe('simple-dependency/', function() {
    var json = dtoj(dir + 'simple-dependency');
    it('should install dependencies, and return result', function(done) {

      supertest(app)
        .post('/node')
        .send({ files: json })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          assert(/\w{7}/.test(res.text));
          done(err);
        });
    });

    it('should handle a websocket connection with verbose', function(done) {
      var obj = {};
      var install = '';
      var run = '';
      obj.language = 'node';
      obj.files = json;
      obj.verbose = true;

      io.emit('run', obj);

      io.on('install stdout', function(so) {
        install += so;
      });

      io.on('run stdout', function(so) {
        run += so;
      });

      io.on('end', function() {
        assert(~install.indexOf('uid@'));
        assert(/\w{7}/.test(run));
        done();
      });

    });
  });

});
