const express = require('express')
const route = express.Router()
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const userController = require('../controllers/user')
const cors = require('cors')

route.use(cors({
  origin: "*"
}))

route.use(body_parse.json())

// for test
route.post('/get_token', userController.get_token)

// for test
route.get('/get_info/:_id', auth.authToken, userController.get_info)

// route.post('/create_warehouse_manager', auth.authDirector, userController.create_warehouse_manager)

// route.post('/create_transaction_manager', auth.authDirector)

route.get('/get_list_manager', auth.authDirector, userController.get_all_manager)

route.post('/manager', auth.authDirector, userController.create_manager)

route.get('/manager', auth.authDirector, userController.get_all_manager)

route.post('/warehouse_employee', auth.authWarehouseManager, userController.create_warehouse_employee)

route.post('/transaction_employee', auth.authTransactionSpotManager, userController.create_transaction_employee)

route.put('/password', auth.authToken, userController.update_password)

route.put('/user', auth.authDirector, userController.update_user)

route.put('/warehouse_employee', auth.authWarehouseManager, userController.update_warehouse_employee)

route.put('/transaction_employee', auth.authTransactionSpotManager, userController.update_transaction_employee)

route.delete('/user', auth.authDirector, userController.delete_user)

route.delete('/warehouse_employee', auth.authWarehouseManager, userController.delete_warehouse_employee)

route.delete('/transaction_employee', auth.authTransactionSpotManager, userController.delete_transaction_employee)

module.exports = route