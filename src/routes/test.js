const express = require('express')
const mongoose = require('mongoose');
const route = express.Router()
const body_parse = require('body-parser')
const cors = require('cors')
const User = require('../models/User')
const Warehouse = require('../models/Warehouse')
const TransactionSpot = require('../models/TransactionSpot')
const response = require('../utils/response');
const auth = require('../middleware/auth');
const userController = require('../controllers/user')
const bcrypt = require('bcrypt')

route.use(cors({
    origin: "*"
  }))
  
route.use(body_parse.json())

route.post('/doSomething', async (req, res) => {
    try {
        const warehouse = {
            name: 'test zone',
            warehouse_manager: '000000000000000000000000'
        }
        await Warehouse.create(warehouse)

        response.response_success(res, response.CREATED, "You did it")
    } catch (err) {
        response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
})

route.post('/testR', auth.authWarehouseManager)

module.exports = route