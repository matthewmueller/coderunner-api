/**
 * Module Dependencies
 */

var assert = require('better-assert');
var supertest = require('supertest');
var dtoj = require('./dtoj');
var dir = __dirname + '/node/';
var app = require('..');

/**
 * Tests
 */

describe('node/', function () {

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
          assert(7 == res.text.length)
          done(err);
        });
    });
  });

});
