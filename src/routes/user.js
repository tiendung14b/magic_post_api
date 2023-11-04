const express = require('express')
const route = express.Router()
const jwt = require('jsonwebtoken')
const role = require('../utils/role')
const response = require('../utils/response')
const User = require('../models/User')

// for test
route.get('/gettoken', (req, res) => {
  try {
    const access_token = jwt.sign(
      { _id: '6544c70a64c20039cfc70ee9', role: role.WAREHOUSE_MANAGER },
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    )
    res.json({
      access_token: access_token
    })
  } catch (err) {
    response.response_fail(res, response.INTERNAL_SERVER_ERROR, err)
  }
})

// for test
route.get('/getuser', async (req, res) => {
  const user = await User.find()
  res.json(user)
})

// for test
route.post('/postuser', async (req, res) => {
  try {
    await User.create({
      "last_name": "Smith",
      "first_name": "John",
      "email": "john.smith@example.com",
      "phone_number": 1234567890,
      "password": "mysecurepassword",
      "role": "TRANSACTION_MANAGER"
    })
    res.json({message: 'success'})
  } catch {
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
})

module.exports = route