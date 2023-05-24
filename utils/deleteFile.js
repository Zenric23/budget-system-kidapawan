const fs = require('fs');

const deleteFile = (path) => new Promise((resolve, reject)=> {
    fs.unlink(path, (err)=> {
      if(err) reject(err)
      resolve(path)
    })  
  })

module.exports = deleteFile
