
var assert = require('assert')
  , path = require('path')
  , clean = require('./support/clean')
  , beamer = require('../')
  , request = require('superagent')

describe('beam(dirname)', function(){
  var base = 'http://test-beam-directory.s3-us-west-1.amazonaws.com'

  before(function(done){
    clean('test-beam-directory', function(err){
      if (err) return done(err)

      var dirname = path.resolve(__dirname, './fixtures/test-beam-directory')
        , config = require('./support/config')
        , options = { bucket: 'test-beam-directory'
          , key: config.key
          , secret: config.secret
          }

      beamer(dirname, options)
      .on('error', done)
      .on('end', done)
    })
  })

  it('successfully uploads css', function(done){
    request
    .get(base + '/bundle.css')
    .end(function(err, res){
      if (err) return done(err)

      assert.equal(res.status, 200)
      assert.equal(res.type, 'text/css')
      assert.ok(parseInt(res.headers['content-length']) > 0
      , 'Should have content-length > 0')

      done()
    })
  })

  it('successfully uploads javascript', function(done){
    request
    .get(base + '/bundle.js')
    .end(function(err, res){
      if (err) return done(err)

      assert.equal(res.status, 200)
      assert.equal(res.type, 'application/javascript')
      assert.ok(parseInt(res.headers['content-length']) > 0
      , 'Should have content-length > 0')

      done()
    })
  })

  it('successfully uploads images', function(done){
    request
    .get(base + '/frank.jpg')
    .end(function(err, res){
      if (err) return done(err)

      assert.equal(res.status, 200)
      assert.equal(res.type, 'image/jpeg')
      assert.ok(parseInt(res.headers['content-length']) > 0
      , 'Should have content-length > 0')

      done()
    })
  })

  it('successfully uploads html', function(done){
    request
    .get(base + '/index.html')
    .end(function(err, res){
      if (err) return done(err)

      assert.equal(res.status, 200)
      assert.equal(res.type, 'text/html')
      assert.ok(parseInt(res.headers['content-length']) > 0
      , 'Should have content-length > 0')

      done()
    })
  })
})
