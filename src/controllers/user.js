const User = require('../models/User')
const Warehouse = require('../models/Warehouse')
const TransactionSpot = require('../models/TransactionSpot')
const response = require('../utils/response')
const role = require('../utils/role')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mail = require('../utils/mail')

exports.get_info = async (req, res) => {
  try {
    const _id = req.params._id;
    const userData = await User.findById(_id)
    console.log(userData)
    if (!userData) {
      response.response_fail(res, response.NOT_FOUND, "invalid id")
    }
    response.response_success(res, response.OK, userData)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'get_info'
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }       
}

exports.get_token = async (req, res) => {
  try {
    const user = req.body
    if (!user.phone_number || !user.password) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    console.log(user)
    const dataUser = await User.findOne({ phone_number: user.phone_number })
    if (!dataUser) return response.response_fail(res, response.NOT_FOUND, 'Account not exist!')
    // const match = await bcrypt.compare(user.password, dataUser.password)
    const match = (dataUser.password == user.password) 
    if (!match) return response.response_fail(res, response.NOT_FOUND, 'Password is incorrect.')
    //  token includes 3 fields: _id, role, work_place
    //  client will decide what to do with role and load data from workplace
    const access_token = jwt.sign({
      _id: dataUser._id,
      workplace: dataUser.workplace,
    }, process.env.JWT_SECRET, { expiresIn: '1h' })
    response.response_success(res, response.OK, { access_token: access_token })
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'get_token'
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.create_manager = async (req, res) => {
  try {
    req.password = (Math.random() + 1).toString(36).substring(6)
    const hash_password = await bcrypt.hash(req.password, 10)
    const importantFields = ['last_name', 'first_name', 'email', 'phone_number', 'role']
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      workplace: {
        workplace_name: req.body.workplace.workplace_name,
        workplace_id: req.body.workplace.workplace_id,
        role: req.body.workplace.role
      },
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    console.log(user)
    let hasEmptyField = false
    Object.keys(user).forEach((key) => {
      if (importantFields.includes(key) && !user[key]) {
        hasEmptyField = true
      }
    })
    if (hasEmptyField) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    User.create(user)
      .then((data) => {
        response.response_success(res, response.CREATED, data)
        mail.send_password('Cấp mật khẩu mới', req.password, user.email)
      })
      .catch((err) => {
        response.response_fail(res, response.CONFLICT, err.message)
      })
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_warehouse_manager'
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.create_warehouse_employee = async (req, res) => {
  try {
    const warehouse = req.warehouse
    if(!warehouse) response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    req.password = (Math.random() + 1).toString(36).substring(6)
    const hash_password = await bcrypt.hash(req.password, 10)
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      role: role.WAREHOUSE_EMPLOYEE,
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    if (!user.last_name || !user.first_name || !user.email || !user.phone_number || !user.role || !user.password) {
      response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    const newUser = await User.create(user).catch((err) => {
        response.response_fail(res, response.CONFLICT, err)
      })
    await Warehouse.updateOne({_id: warehouse._id}, { $addToSet: {warehouse_employees: newUser._id}}, null).catch((err) => {
        response.response_fail(res, response.CONFLICT, err)
      })
    response.response_success(res, response.CREATED, newUser)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_warehouse_employee'
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.create_transaction_employee = async (req, res) => {
  try {
    const transactionSpot = req.transactionSpot
    if(!transactionSpot) response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    req.password = (Math.random() + 1).toString(36).substring(6)
    const hash_password = await bcrypt.hash(req.password, 10)
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      role: role.TRANSACTION_EMPLOYEE,
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    if (!user.last_name || !user.first_name || !user.email || !user.phone_number || !user.role || !user.password) {
      response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    const newUser = await User.create(user).catch((err) => {
        response.response_fail(res, response.CONFLICT, err)
      })
    await TransactionSpot.updateOne({_id: transactionSpot._id}, { $addToSet: {transaction_employees: newUser._id}}, null).catch((err) => {
        response.response_fail(res, response.CONFLICT, err)
      })
    response.response_success(res, response.CREATED, newUser)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_transaction_employee'
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}