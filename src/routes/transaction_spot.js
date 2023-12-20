const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const transactionSpotController = require('../controllers/transaction_spot')
const cors = require('cors')
const transactionController = require('../controllers/transaction')

router.use(cors({
  origin: "*"
}))

router.use(body_parse.json())

router.post('/', auth.authDirector, transactionSpotController.create_transaction_spot)
router.get('/get_info/:id', auth.authDirector, transactionSpotController.get_transaction_spot)
router.get('/get_all', auth.authDirector, transactionSpotController.get_all_transaction_spot)
router.put('/set_manager/:transaction_spot_id', auth.authDirector, transactionSpotController.set_manager)
router.delete('/:id', auth.authDirector, transactionSpotController.remove_manager)

router.post('/send_to_warehouse', auth.authTransactionSpotEmployee, transactionController.send_to_warehouse)


module.exports = router