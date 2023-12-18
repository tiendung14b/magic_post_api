const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const transactionSpotController = require('../controllers/transaction_spot')
const cors = require('cors')

router.use(cors({
  origin: "*"
}))

router.use(body_parse.json())

router.post('/create', auth.authDirector, transactionSpotController.create_transaction_spot)

module.exports = router