
var powerwalk = require('powerwalk')
  , through = require('through')
  , path = require('path')

module.exports = function(dir, opts){
  console.log('dir', dir)

  var dirname = path.resolve(process.cwd(), dir)
    , stats = {}
    , uploader = through(write, end)
    , queue = new Queue

  console.log('dirname', dirname)

  // stream filenames to the uploader
  powerwalk(dirname)
  .pipe(uploader)

  return uploader

  // piping powerwalk's filenames
  function write(filename){
    queue.push(filename)
  }

  function end(){

    // this.emit('end', stats)
  }
}

function Queue(){
  this.items = []
  this.results = []
  this.running = 0
  this.limit = 5
}

Queue.prototype.push = function(filename){
  this.items.push(filename)
  this.run()
}

Queue.prototype.upload = function(filename, callback){
  console.log('uploading', filename)
  setTimeout(function(){ callback('finished ' + filename) }, 1000)
}

Queue.prototype.end = function(){
  console.log('done uploading everything')
  console.log(this.results)
}

Queue.prototype.run = function(){
  var queue = this

  while(queue.running < queue.limit && queue.items.length > 0) {
    // grabs the top item
    var item = queue.items.shift()

    queue.upload(item, function(result) {
      queue.results.push(result)

      queue.running--

      // upload another one if there are any pending
      if(queue.items.length > 0) {
        queue.run()
      } else if(queue.running == 0) {
        queue.end()
      }

    })

    queue.running++
  }
}
