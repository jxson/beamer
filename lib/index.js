
var through = require('through')
  , beamer = require('./beamer')

module.exports = function(dir, opts){
  var powerwalk = require('powerwalk')
    , beam = beamer(dir, opts)
    , stream = through(write, end)
    , queue = require('./queue')
    , q

  // expose/proxy to the beam's configure method
  stream.configure = function(options){
    beam.configure(options)
    return this
  }

  // proxy beam events to the stream
  beam.on('response', function(res){
    stream.emit('response', res)
  })

  powerwalk(dir)
  .pipe(stream)

  return stream

  // filenames piped here from powerwalk
  function write(filename){
    if (! q) { // lazzzy, better to wait until the last minute for config
      q = queue(upload, beam.options.concurrency)
      q.on('end', function(){
        // TODO: hook up deletion etc then fire end event
        stream.emit('end')
      })
    }

    var task = { method: 'PUT'
        , filename: filename
        }

    q.push(task, function(err){
      if (err) return stream.emit('error', err)
      // TODO: EMIT a better data obj, maybe a report object
      stream.emit('data', filename)
    })
  }

  // noop read stream end
  function end(){}

  function upload(task, callback){
    if (task.method === 'PUT') beam.put(task.filename, callback)
  }
}
