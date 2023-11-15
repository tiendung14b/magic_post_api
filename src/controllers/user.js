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
    const dataUser = await User.findOne({ phone_number: user.phone_number })
    if (!dataUser) return response.response_fail(res, response.NOT_FOUND, 'Account not exist!')
    // const match = await bcrypt.compare(user.password, dataUser.password)
    const match = (dataUser.password == user.password)
    /* console.log(user.password, dataUser.password) */
    if (!match) return response.response_fail(res, response.NOT_FOUND, 'Password is incorrect.')
    let work_place;
    if (dataUser.role == role.WAREHOUSE_MANAGER) {
      work_place = await Warehouse.findOne({ warehouse_manager: dataUser._id })
      if (!work_place) return response.response_fail(res, response.NOT_FOUND, 'manager is warehouseless')
    }
    if (dataUser.role == role.TRANSACTION_MANAGER) {
      work_place = await TransactionSpot.findOne({ transaction_manager: dataUser._id })
      if (!work_place) return response.response_fail(res, response.NOT_FOUND, 'manager is transactionSpotless')
    }
    const access_token = jwt.sign({ _id: dataUser._id, role: dataUser.role, work_place: work_place._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
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
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      role: req.body.role,
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    if (!user.last_name || !user.first_name || !user.email || !user.phone_number || !user.role || !user.password) {
      response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    User.create(user)
      .then((data) => {
        response.response_success(res, response.CREATED, data)
        mail('Cấp mật khẩu mới', req.password, user.email)
      })
      .catch((err) => {
        response.response_fail(res, response.CONFLICT, err)
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