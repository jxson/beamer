
module.exports = function(worker, concurrency){
  var assert = require('assert')
    , EE = require('events').EventEmitter
    , tasks = []
    , workers = 0
    , concurrency = concurrency || 5
    , queue = new EE()

  assert.ok(worker, 'Does not work without a worker')

  queue.push = function(task, callback) {
    tasks.push({ task: task, callback: callback })
    queue.process()
  }

  queue.process = function(){
    while(workers < concurrency && tasks.length) {
      var item = tasks.shift()

      workers++

      worker(item.task, function(){
        workers--

        item.callback.apply(item.task, arguments)

        if (tasks.length > 0) queue.process()
        else if (workers === 0) queue.emit('end')
      })
    }
  }

  return queue
}
