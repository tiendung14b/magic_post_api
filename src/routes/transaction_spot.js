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

router.post('/', auth.authDirector, transactionSpotController.create_transaction_spot)
router.get('/get_info/:id', auth.authDirector, transactionSpotController.get_transaction_spot)
router.get('/get_all', auth.authDirector, transactionSpotController.get_all_transaction_spot)
router.put('/set_manager/:transaction_spot_id', auth.authDirector, transactionSpotController.set_manager)


module.exports = router