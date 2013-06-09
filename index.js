
module.exports = function(dirname, options) {
  var EE = require('events').EventEmitter
    , extend = require('util')._extend
    , proto = extend({ configure: configure
      , validate: validate
      , options: { region: 'us-west-1'
        , dirname: process.cwd()
        , gzip: true
        }
      , fire: fire
      }, EE.prototype)
    , beam = Object.create(proto)

  if (options) beam.configure(options)

  process.nextTick(function(){
    beam.fire(dirname)
  })

  return beam
}

function configure(opts){
  var beam = this
    , ignore = [ 'argv', 'cooked', 'original' ]

  for (key in opts) {
    if (ignore.indexOf(key) === -1) beam.options[key] = opts[key]
  }

  return beam
}

function fire(dirname){
  var beam = this

  beam.validate()

  var path = require('path')
    , dirname = path.resolve(beam.options.dirname, dirname)
    , powerwalk = require('powerwalk')
    , knox = require('knox')
    , s3 = knox.createClient({ key: beam.options.key
      , secret: beam.options.secret
      , bucket: beam.options.bucket
      , region: beam.options.region
      })
    , local = []
    , queue = []
    , stats = { uploaded: 0
      , deleted: 0
      }

  beam.emit('start')

  powerwalk(dirname)
  .on('error', function(err){ beam.emit('error', err )})
  .on('stat', function(file){ queue.push(file) })
  .on('end', function(){
    queue.forEach(send)
  })

  function send(file){
    var fs = require('graceful-fs')
      , mime = require('mime')
      , url = file.filename.replace(dirname, '')
      , req = s3.put(url, { 'content-length': file.stats.size
        , 'content-type': mime.lookup(file.filename)
        , 'x-amz-acl': 'public-read'
        })

    local.push(url)

    req.on('error', function(err){ beam.emit('error', err) })

    req.on('response', function(res){
      var data = ''

      res.setEncoding('utf8');
      res.on('data', function(chunk){
        data += chunk
      })
      .on('end', function(){
        beam.emit('PUT', url)
        finish()
      })
    })

    fs
    .createReadStream(file.filename)
    .pipe(req)
  }

  // this needs to wait for all requests to comeback before firing
  function finish(){
    stats.uploaded++

    if (stats.uploaded !== queue.length) return // wait till next time

    s3.list(function(err, list){
      if (err) return beam.emit('error', err)

      var remove = list['Contents']
          .map(function(obj){
            var key = '/' + obj['Key']

            if (local.indexOf(key) === -1) return key
          })
          .filter(function(key){
            if (key) return key
          })

      if (remove.length === 0) beam.emit('end', stats)

      remove.forEach(function(obj){
        console.log('delete', obj)
      })
    })
  }
}

function validate(){
  var beam = this
    , required = [ 'bucket', 'key', 'secret' ]
    , missing = []

  required.forEach(function(key){
    if (! beam.options[key]) missing.push(key)
  })

  if (missing.length > 0) {
    var message = 'Missing required options: ' + missing.join(', ')
    beam.emit('error', new Error(message))
  }
}

