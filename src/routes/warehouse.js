const express = require('express')
const route = express.Router()
const body_parser = require('body-parser')
const auth = require('../middleware/auth')

// just for the test
route.get('/testauth/:transactionSpot_id', auth.authTransactionSpotEmployee, (req, res) => {
  res.json({
    message: 'test success'
  })
})

module.exports = route