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
route.get('/get_info/:_id', userController.get_info)

// route.post('/create_warehouse_manager', auth.authDirector, userController.create_warehouse_manager)

// route.post('/create_transaction_manager', auth.authDirector)

route.post('/create_manager', auth.authDirector, userController.create_manager)

route.post('/create_warehouse_employee', auth.authWarehouseManager, userController.create_warehouse_employee)

route.post('/create_transaction_employee', auth.authTransactionSpotManager, userController.create_transaction_employee)

route.put('/update_password/:id')
    
route.post('/update_user', auth.authDirector)

route.post('update_warehouse_employee/:id', auth.authWarehouseManager)

route.post('update_transaction_employee/:id', auth.authWarehouseManager)

module.exports = route