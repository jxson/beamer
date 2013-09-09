
var knox = require('knox')
  , fs = require('graceful-fs')
  // TODO: mime needs to be exposed so users can add media types
  , mime = require('mime')
  , concat = require('concat-stream')
  , path = require('path')
  , EE = require('events').EventEmitter

module.exports = function(dir, opts){
  var dirname = path.resolve(process.cwd(), dir)
    , beam = new EE()

  beam.options = { concurrency: 5
  , region: 'us-west-1'
  , dirname: process.cwd()
  , gzip: true
  }

  beam.configure = function(opts){
    var ignore = [ 'argv', 'cooked', 'original' ]

    for (var k in opts) {
      if (ignore.indexOf(k) === -1) beam.options[k] = opts[k]
    }

    return beam
  }

  beam.validate = function(){
    var required = [ 'bucket', 'key', 'secret' ]
      , missing = []

    required.forEach(function(key){
      if (! beam.options[key]) missing.push(key)
    })

    if (missing.length > 0) {
      throw new Error('Missing required options: ' + missing.join(', '))
    }
  }

  beam.put = function(filename, callback){
    if (! beam.client) { // more lazy definitions
      beam.validate()
      beam.client = knox.createClient({ key: beam.options.key
      , secret: beam.options.secret
      , bucket: beam.options.bucket
      , region: beam.options.region
      })
    }

    fs.stat(filename, function(err, stats){
      if (err) return beam.emit('error', err)

      var url = filename.replace(dirname, '')
        , headers = { 'content-type': mime.lookup(filename)
          , 'content-length': stats.size
          , 'x-amz-acl': 'public-read'
          }
        , req = beam.client.put(url, headers)

      req.filename = filename

      fs.createReadStream(filename)
      .on('error', callback)
      .pipe(req)
      .on('error', callback)
      .on('response', function(res){
        if (! res.req) res.req = req

        res.pipe(concat(function(data){
          if (! data) return beam.emit('response', res)
          if (res.statusCode < 400) return beam.emit('response', res)

          // if things went this far something is wrong...
          var ps = require('xml2js').parseString
            , options = { explicitArray: false
              , explicitRoot: false
              }

          ps(data, options, function(err, xml){
            if (err) return callback(err)

            var message = [ res.statusCode
                , xml['Code']
                , '\n '
                , req.method
                , req.url
                , '\n '
                , xml['Message']
                ].join(' ')

            res.body = xml

            beam.emit('response', res)
            callback(new Error(message))
          })
        }))

        res.on('end', callback)
      })
    })
  }

  if (opts) beam.configure(opts)

  return beam
}
