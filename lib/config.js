
module.exports = { get: get, set: set }

var path = require('path')
  , file = path.resolve('./.beam')
  , ini = require('ini')
  , fs = require('graceful-fs')

function get(key, callback){
  if (typeof key === 'function') {
    callback = key
    key = undefined
  }


  fs.readFile(file, 'utf8', function(err, data){
    if (err && err.code !== 'ENOENT') return callback(err)

    var config = data ? ini.parse(data) : {}

    if (key)  return callback(null, config[key])
    else      return callback(null, config)
  })
}

function set(key, value, callback){
  get(function(err, config){
    if (err) return callback(err)
    console.log('before', config)
    config[key] = value

    var data = ini.stringify(config)
    fs.writeFile(file, data, function(err){
      if (err) return callback(err)
      console.log('after', config)
      callback(null, config)
    })
  })
}



//   var

//   config[params.key] = params.value

//   fs.writeFile('./.beam', ini.stringify(config), function(err){
//     if (err) throw err
//   })
// })
