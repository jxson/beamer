
var knox = require('knox')
  , config = require('./config')
  , concat = require('concat-stream')

module.exports = clean

function clean(bucket, callback){
  var client = knox.createClient({ key: config.key
      , secret: config.secret
      , bucket: bucket
      })

  client.list(function(err, data){
    if (err) return callback(err)

    var zap = data['Contents']
        .map(function(o){ return o['Key'] }) // only get the keys

    if (zap.length === 0) return callback()

    client.deleteMultiple(zap, function(err, res){
      if (err) return callback(err)
      if (res.statusCode < 400) return callback(null, res) // yey

      // probably an error of some kind if things went this far
      res.pipe(concat(function(data){
        var ps = require('xml2js').parseString
          , options = { explicitArray: false
            , explicitRoot: false
            }

        ps(data, options, function(err, xml){
          if (err) return callback(err)

          var message = 'AWS Responded '
              + res.statusCode
              + ': '
              + xml['Code']
              + ' => '
              +  xml['Message']
            , error = new Error(message)

          res.body = xml

          callback(error, res)
        })
      }))

    })
  })
}
