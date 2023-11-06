require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const routes = require('./src/routes')
const app = express()

mongoose.connect(process.env.MONGODB)
  .then(res => {
    console.log('connect database successfully')
  })
  .catch(err => {
    console.error(err)
  })

app.use('/api', routes)

app.listen(8000, () => {
  console.log('run server...')
})