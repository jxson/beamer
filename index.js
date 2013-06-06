
module.exports = function(dirname, options) {
  var EE = require('events').EventEmitter
    , extend = require('util')._extend
    , proto = extend({ configure: configure
      , validate: validate
      , options: { region: 'us-west-1'
        , dirname: process.cwd()
        , gzip: true
        }
      , upload: upload
      }, EE.prototype)
    , beam = Object.create(proto)

  if (options) beam.configure(options)

  process.nextTick(function(){
    beam.upload(dirname)
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

function upload(dirname){
  var beam = this

  beam.validate()

  //   * set defaults region, headers, gzip
  // * normalize the dirname/ filename
  // * statfiles and start keeping track
  // * start uploading everything
  // * read a list of objects in the bucket and delete what isn't available locally
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
