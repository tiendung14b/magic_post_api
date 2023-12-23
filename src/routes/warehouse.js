const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const warehouseController = require('../controllers/warehouse')
const cors = require('cors')

router.use(cors({
  origin: "*"
}))

router.use(body_parse.json())

router.post('/', auth.authDirector, warehouseController.create_warehouse)

router.get('/all', auth.authDirector, warehouseController.get_all_warehouse)

router.put('/manager/:warehouse_id', auth.authDirector, warehouseController.set_manager)

router.delete('/manager/:warehouse_id', auth.authDirector, warehouseController.remove_manager)

router.get('/my_warehouse', auth.authWarehouseManager, warehouseController.get_my_warehouse)

router.get('/employee_warehouse', auth.authWarehouseEmployee, warehouseController.get_employee_warehouse)

router.get('/:id', auth.authDirector, warehouseController.get_warehouse)

router.put('/transaction_from_warehouse/:transaction_id', auth.authWarehouseEmployee, warehouseController.receive_transaction_from_warehouse)

router.put('/transaction_from_transaction_spot/:transaction_id', auth.authWarehouseEmployee, warehouseController.receive_transaction_from_transaction_spot)

router.put('/transaction_to_warehouse/:transaction_id', auth.authWarehouseEmployee, warehouseController.send_transaction_to_warehouse)

router.put('/transaction_to_transaction_spot/:transaction_id', auth.authWarehouseEmployee, warehouseController.send_transaction_to_transaction_spot)

module.exports = router