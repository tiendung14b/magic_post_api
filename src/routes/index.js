const express = require('express')
const route = express.Router()
const warehouseRoute = require('./warehouse')
const userRoute = require('./user')

route.use('/warehouse', warehouseRoute)
route.use('/user', userRoute)

module.exports = route