require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const routes = require('./src/routes')
const app = express()
const cors = require('cors')

mongoose.connect(process.env.MONGODB)
  .then(res => {
    console.log('connect database successfully')
  })
  .catch(err => {
    console.error(err)
  })

app.use('/api', routes)

var port = normalizePort(process.env.PORT || '8000');

app.listen(port, () => {
  console.log('run server...')
})

/* Normalize a port into a number, string, or false.*/

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}