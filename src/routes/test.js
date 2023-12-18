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

route.post('/doSomething', auth.authWarehouseManager, async (req, res) => {
    try {
        const warehouse = req.warehouse
        await Warehouse.updateOne({_id: warehouse._id}, { $addToSet: {warehouse_employees: "656df0871d50d8be529c836a"}}, null).catch((err) => {
            response.response_fail(res, response.CONFLICT, err)
          })
        response.response_success(res, response.CREATED, "You did it")
    } catch (err) {
        response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
})

route.post('/create_director', async (req, res) => {
    const { email, password, first_name, last_name, phone_number, workplace } = req.body
    const hash_password = await bcrypt.hash(password, 10);
    try {
        const user = await User.create({
            email,
            password: hash_password,
            first_name,
            last_name,
            phone_number,
            workplace
        })
        response.response_success(res, response.OK, user)
    } catch (err) {
        response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
})


route.post('/testR', auth.authWarehouseManager)

module.exports = route