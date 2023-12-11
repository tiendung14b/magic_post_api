const express = require('express')
const route = express.Router()
const test = require('./test')
const warehouseRoute = require('./warehouse')
const userRoute = require('./user')
const geocodeRoute = require('./geocode')

route.use('/test', test)
route.use('/warehouse', warehouseRoute)
route.use('/user', userRoute)
route.use('/geocode', geocodeRoute)

module.exports = route