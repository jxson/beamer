
module.exports = function(dirname) {
  var EE = require('events').EventEmitter
    , extend = require('util')._extend
    , proto = extend({ configure: configure
      , options: {}
      , upload: upload
      }, EE.prototype)
    , beam = Object.create(proto)

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
  // * validate the config
  //   * required values for key, secret, bucket
  //   * set defaults region, headers, gzip
  // * normalize the dirname/ filename
  // * statfiles and start keeping track
  // * start uploading everything
  // * read a list of objects in the bucket and delete what isn't available locally
}
