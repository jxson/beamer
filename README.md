# beamer - currently a WIP: may not work as advertised ;) [![Build Status](https://travis-ci.org/jxson/beamer.png)](https://travis-ci.org/jxson/beamer) [![Dependency Status](https://david-dm.org/jxson/beamer.png)](https://david-dm.org/jxson/beamer)

CLI and node.js module for syncing local directories to S3.

# Features

* sync local directory

# TODO:

* upload specific files
* gzipping
* custom media types (expose mime look up and addition)
* custom headers (cache-control, etc)
* track objects and see if there is a mismatch for deleting
* md5s for tracking what has been sent and what hasn't?
* error recovery (exponential back off)

# Example

# API

upload everything in a local directory

    var beamer = require('beamer')

    beamer(dirname)
    .configure({ bucket: <your bucket>
    , key: <your AWS key>
    , secret: <your AWS secret>
    })
    .on('error', function(err){ throw err })
    .on('response', function(res){
      console.log(res.req.method, res.statusCode, res.req.url)
    })
    .on('end', function(){
      console.log('all done!')
    })

# CLI

# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
