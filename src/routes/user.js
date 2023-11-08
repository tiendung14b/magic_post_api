const express = require('express')
const route = express.Router()
const jwt = require('jsonwebtoken')
const role = require('../utils/role')
const response = require('../utils/response')
const User = require('../models/User')
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const bcrypt = require('bcrypt')
const userController = require('../controllers/user')
const cors = require('cors')

route.use(cors({
  origin: "*"
}))

route.use(body_parse.json())

// for test
route.get('/gettoken', (req, res) => {
  try {
    
  } catch (err) {
    response.response_fail(res, response.INTERNAL_SERVER_ERROR, err)
  }
})

// for test
route.get('/get_info/:_id', userController.get_info)

route.post('/create_user', auth.authDirector)

route.post('create_warehouse_employee', auth.authWarehouseManager)

route.post('create_transaction_employee')

route.put('/update_password/:id')

route.post('/update_user', auth.authDirector)

route.post('update_warehouse_employee/:id', auth.authWarehouseManager)

route.post('update_transaction_employee/:id', auth.authWarehouseManager)

module.exports = route