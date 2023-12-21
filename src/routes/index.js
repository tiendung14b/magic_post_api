const express = require('express')
const route = express.Router()
const test = require('./test')
const userRoute = require('./user')
const geocodeRoute = require('./geocode')
const warehouseRoute = require('./warehouse')
const transactionSpotRoute = require('./transaction_spot')
const transactionRoute = require('./transaction')

route.use('/test', test)
route.use('/user', userRoute)
route.use('/geocode', geocodeRoute)
route.use('/warehouse', warehouseRoute)
route.use('/transaction_spot', transactionSpotRoute)
route.use('/transaction', transactionRoute)

module.exports = route