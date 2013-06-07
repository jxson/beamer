
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

  powerwalk(dirname)
  .on('error', function(err){ beam.emit('error', err )})
  .on('stat', send)
  .on('end', finish)

  //   * set defaults region, headers, gzip
  // * normalize the dirname/ filename
  // * statfiles and start keeping track
  // * start uploading everything
  // * read a list of objects in the bucket and delete what isn't available
  // locally

  function send(file){
    var fs = require('graceful-fs')
      , mime = require('mime')
      , url = file.filename.replace(dirname, '')

    if (! beam.s3) {
      var knox = require('knox')

      beam.s3 = knox.createClient({ key: beam.options.key
      , secret: beam.options.secret
      , bucket: beam.options.bucket
      , region: beam.options.region
      })
    }

    console.log('beam.options.bucket', beam.options.bucket)

    // console.log('beam.s3', beam.s3)

    var req = beam.s3.put(url, { 'content-length': file.stats.size
        , 'content-type': mime.lookup(file.filename)
        , 'x-amz-acl': 'public-read'
        })

    // artifact.sh.s3.amazonaws.com

    console.log('sending filename', url)

    req.on('response', function(res){
      console.log('res.statusCode', res.statusCode)
      console.log('res.headers', res.headers)

      var data = ''

      res.setEncoding('utf8');
      res.on('data', function(chunk){
        data += chunk
      })
      .on('end', function(){
        console.log('data', data)
      })
    })

    fs
    .createReadStream(file.filename)
    .pipe(req)

  }

  function finish(){

  }
}

function validate(){
  var beam = this
    , valid = true
    , required = [ 'bucket', 'key', 'secret' ]
    , missing = []

  required.forEach(function(key){
    if (! beam.options[key]) missing.push(key)
  })

  if (missing.length > 0) {
    var message = 'Missing required options: ' + missing.join(', ')
    beam.emit('error', new Error(message))
  }

  // if (! valid) beam.emit('error', new Error(message))
}

