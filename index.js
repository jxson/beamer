
module.exports = function(dir, opts){
  var powerwalk = require('powerwalk')
    , beam = beamer(dir)

  if (opts) beam.configure(opts)

  // stream filenames to the uploader
  powerwalk(dir)
  .pipe(beam)

  return beam
}

function beamer(dir){
  var path = require('path')
    , dirname = path.resolve(process.cwd(), dir)
    , through = require('through')
    , beam = through(write)
    , options = { concurrency: 5
      , region: 'us-west-1'
      , dirname: process.cwd()
      , gzip: true
      }
    , current = 0
    , pending = []
    , knox = require('knox')
    , s3

  beam.configure = configure
  beam.put = put
  beam.fire = fire

  return beam

  // data gets piped here via through
  function write(filename){
    pending.push(filename)
    beam.fire()
  }

  function configure(opts){
    var ignore = [ 'argv', 'cooked', 'original' ]

    for (var k in opts) { if (ignore.indexOf(k) === -1) options[k] = opts[k] }

    return beam
  }

  function put(filename, callback){
    var fs = require('graceful-fs')
      , mime = require('mime')
      , url = filename.replace(dirname, '')

    // TODO: validate config

    if (! s3) { // lazily define
      s3 = knox.createClient({ key: options.key
      , secret: options.secret
      , bucket: options.bucket
      , region: options.region
      })
    }

    fs.stat(filename, function(err, stats){
      if (err) return beam.emit('error', err)

      var headers = { 'content-type': mime.lookup(filename)
          , 'content-length': stats.size
          , 'x-amz-acl': 'public-read'
          }
        , req = s3.put(url, headers)

      fs.createReadStream(filename).pipe(req)

      callback(req)
    })
  }

  function fire(){
    while(current < options.concurrency && pending.length > 0) {
      // start at the top
      var filename = pending.shift()

      beam.put(filename, function(req){
        req.on('response', function(res){ beam.emit('response', res )})
        req.on('response', function(res){
          var concat = require('concat-stream')

          res.pipe(concat(function(data){
            // if (! data) return
            // console.log(req.url, data.toString())
          }))

          res.on('end', function(){
            current--

            // pipe the finished req
            beam.queue(req.url)

            // upload another one if there are any pending
            if(pending.length > 0) beam.fire()
          })
        })
      })

      current++
    }
  }
}
