const express = require('express')
const route = express.Router()
const test = require('./test')
const warehouseRoute = require('./warehouse')
const userRoute = require('./user')

route.use('/test', test)
route.use('/warehouse', warehouseRoute)
route.use('/user', userRoute)

module.exports = route