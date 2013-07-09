
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
    // var fs = require('graceful-fs')
    //   , mime = require('mime')
    //   , url = filename.replace(dirname, '')

    // if (! s3) {
    //   s3 = knox.createClient({ key: options.key
    //   , secret: options.secret
    //   , bucket: options.bucket
    //   , region: options.region
    //   })
    // }

    // fs.stat(filename, function(err, stats){
    //   if (err) return callback(err)

    //   console.log('sending', url)

    //   var headers = { 'content-type': mime.lookup(filename)
    //       , 'content-length': stats.size
    //       , 'x-amz-acl': 'public-read'
    //       }
    //     , req = s3.put(url, headers)

    //   fs.createReadStream(filename).pipe(req)

    //   callback(null, req)
    // })

    setTimeout(callback, 1000)

  }

  function fire(){
    while(current < options.concurrency && pending.length > 0) {
      // start at the top
      var filename = pending.shift()

      console.log('uploading =>', filename)

      beam
      .put(filename, function(){
        console.log('finished =>',filename)

        current--

        // pipe the finished req
        beam.queue(filename)

        // upload another one if there are any pending
        if(pending.length > 0) beam.fire()
      })
      // .on('response', function(res){
      //   var req = this
      // })

      // request(function(err, res){
      //   if (err) return beam.emit('error', err)

      //   var req = this
      //     , concat = require('concat-stream')

      //   // check res code
      //   // console.log('res', res)
      //   // httpVersion: '1.1',
      //   // complete: false,
      //   // headers:
      //   //  { 'x-amz-request-id': '36A61983D4DD9BD7',
      //   //    'x-amz-id-2': 'MLI4Di/Ve7y6ORKvYpMMw3DJYbUzzKHCA6e1VsiMVurO7kTfYbE1e0pvkb1G3TJZ',
      //   //    'content-type': 'application/xml',
      //   //    'transfer-encoding': 'chunked',
      //   //    date: 'Mon, 08 Jul 2013 22:50:01 GMT',
      //   //    connection: 'close',
      //   //    server: 'AmazonS3' },
      //   // trailers: {},
      //   // readable: true,
      //   // _paused: false,
      //   // _pendings: [],
      //   // _endEmitted: false,
      //   // url: '',
      //   // method: null,
      //   // statusCode: 403,

      //   // might have error info
      //   res.pipe(concat(function(data){
      //     console.log('req.url', data.toString())
      //   }))



      //   res.on('end', function(){
      //     console.log('req.end', req.url)
      //     current--

      //     // pipe the finished req
      //     beam.queue(req.url)

      //     // upload another one if there are any pending
      //     if(requests.length > 0) beam.fire()
      //   })
      // })

      current++
    }
  }
}


// function Queue(){
//   this.items = []
//   this.results = []
//   this.running = 0
//   this.limit = 5
// }

// Queue.prototype.push = function(filename){
//   this.items.push(filename)
//   this.run()
// }

// Queue.prototype.upload = function(filename, callback){
//   console.log('uploading', filename)
//   setTimeout(function(){ callback('finished ' + filename) }, 1000)
// }

// Queue.prototype.end = function(){
//   console.log('done uploading everything')
//   console.log(this.results)
// }

// Queue.prototype.run = function(){
//   var queue = this

//   while(queue.running < queue.limit && queue.items.length > 0) {
//     // grabs the top item
//     var item = queue.items.shift()

//     queue.upload(item, function(result) {
//       queue.results.push(result)

//       queue.running--

//       // upload another one if there are any pending
//       if(queue.items.length > 0) {
//         queue.run()
//       } else if(queue.running == 0) {
//         queue.end()
//       }

//     })

//     queue.running++
//   }
// }
