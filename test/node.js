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
    this.timeout(10000);
    var json = dtoj(dir + 'spawn');
    it('should not allow rogue processes', function(done) {

      supertest(app)
        .post('/node')
        .send({ files: json })
        .expect(200)
        .end(function(err, res) {
          console.log('text', res.text);
          done();
          // if (err) return done(err);
          // console.log(res.status);
          // console.log(res.text);
          // done();
        })
    });

  });

});
