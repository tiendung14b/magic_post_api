const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const transactionController = require('../controllers/transaction')
const cors = require('cors')

router.use(cors({
  origin: "*"
}))

router.use(body_parse.json())

router.post('/', auth.authTransactionSpotEmployee, transactionController.create_transaction)
router.get('/get_info/:id', auth.authTransactionSpotEmployee, transactionController.get_transaction)