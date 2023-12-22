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
router.delete('/remove_manager/:transaction_spot_id', auth.authDirector, transactionSpotController.remove_manager)

router.get('/get_all_employee/:transaction_spot_id', auth.authTransactionSpotEmployee, transactionSpotController.get_all_employee)


router.post('/send_to_warehouse', auth.authTransactionSpotEmployee, transactionSpotController.send_to_warehouse)
router.post('/confirm_transaction', auth.authTransactionSpotEmployee, transactionSpotController.confirm_transaction)
router.post('/confirm_delivery', auth.authTransactionSpotEmployee, transactionSpotController.confirm_delivery)

router.get('/get_from_client_transactions/:transaction_spot_id', transactionSpotController.get_from_client_transaction)
router.get('/get_unconfirmed/:transaction_spot_id', auth.authWarehouseEmployee, transactionSpotController.get_unconfirmed_transaction)
router.get('/get_to_client_transactions/:transaction_spot_id', transactionSpotController.get_to_client_transaction)
router.get('/sending_history/:transaction_spot_id', transactionSpotController.get_sending_history)
router.get('/get_all_delivery_transaction/:transaction_spot_id', auth.authTransactionSpotEmployee, transactionSpotController.get_all_delivery)

module.exports = router