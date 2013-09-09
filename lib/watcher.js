
// has the beamer api but repeats on an interval instead of being a one time
// thing
module.exports = function(dirname) {
  var beamer = require('./')
    , EE = require('events').EventEmitter
    , watcher = new EE()
    , config

  watcher.configure = function(_config){
    config = _config
    return watcher
  }

  var worker

  process.nextTick(function(){
    worker = timer(check, 500)
    worker.start()
  })

  return watcher

  function check(){
    var powerwalk = require('powerwalk')
      , uploading = false

    powerwalk(dirname)
    .on('file', function(filename){
      // prevents this from firing for everyfile since we are only interested
      // in detecting if beamer should run in the dir or not
      if (uploading) return
      uploading = true
      worker.stop()

      beamer(dirname)
      .configure(config)
      .on('error', function(err){ watcher.emit('error', err ) })
      .on('response', function(res){ watcher.emit('response', res ) })
      .on('end', function(){
        worker.start()
      })

    })
  }
}

function timer(fn, interval){
  var worker = this

  worker.running = false

  worker.start = function(){
    if (worker.running) return
    worker.running = true
    worker.id = setInterval(fn, interval)
  }

  worker.stop = function(){
    worker.running = false
    clearInterval(worker.id)
  }

  return worker
}
