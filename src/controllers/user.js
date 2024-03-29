const User = require('../models/User')
const Warehouse = require('../models/Warehouse')
const TransactionSpot = require('../models/TransactionSpot')
const Deliver = require('../models/Deliver')
const response = require('../utils/response')
const role = require('../utils/role')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mail = require('../utils/mail')
const usefulStuff = require('../utils/usefulStuff')

exports.create_director = async (req, res) => {
  try {
    const {
      last_name,
      first_name,
      email,
      phone_number,
      password,
      urlAvatar
    } = req.body
    const hash_password = await bcrypt.hash(password, 10)
    const user = {
      last_name,
      first_name,
      email,
      phone_number,
      password: hash_password,
      urlAvatar
    }
    user.workplace = {
      workplace_name: 'DIRECTOR',
      role: 'DIRECTOR'
    }
    await User.create(user)
    return response.response_success(res, response.CREATED, user)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'creat_director'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.get_info = async (req, res) => {
  try {
    const _id = req.params._id;
    const userData = await User.findById(_id)
    if (!userData) {
      return response.response_fail(res, response.NOT_FOUND, "invalid id")
    }
    userData.password = undefined
    return response.response_success(res, response.OK, userData)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'get_info'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }       
}

exports.get_all_manager = async (req, res) => {
  try {
    const users = await User.find({ 'workplace.role': { $in: [role.WAREHOUSE_MANAGER, role.TRANSACTION_MANAGER] } })
    response.response_success(res, response.OK, users)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'get_all_manager'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.get_token = async (req, res) => {
  try {
    const user = req.body
    if (!user.phone_number || !user.password) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    const dataUser = await User.findOne({ phone_number: user.phone_number })
    if (!dataUser) return response.response_fail(res, response.NOT_FOUND, 'Account not exist!')
    const match = await bcrypt.compare(user.password, dataUser.password)
    if (!match) return response.response_fail(res, response.NOT_FOUND, 'Password is incorrect.')
    /* if (user.password != dataUser.password) return response.response_fail(res, response.NOT_FOUND, 'Password is incorrect.') */
    //  token includes 3 fields: _id, role, work_place
    //  client will decide what to do with role and load data from workplace
    const access_token = jwt.sign({
      _id: dataUser._id,
      workplace: dataUser.workplace,
    }, process.env.JWT_SECRET, { expiresIn: '24h' })
    return response.response_success(res, response.OK, { access_token: access_token })
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'get_token'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.create_manager = async (req, res) => {
  try {
    const existData = await User.findOne({ phone_number: req.body.phone_number })
    if (existData) {
      return response.response_fail(res, response.CONFLICT, 'Phone number already exist.')
    }
    req.password = (Math.random() + 1).toString(36).substring(6)
    const hash_password = await bcrypt.hash(req.password, 10)
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      workplace: {
        workplace_name: req.body.workplace?.workplace_name,
        workplace_id: req.body.workplace?.workplace_id,
        role: req.body.workplace?.role
      },
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    const checkResult = usefulStuff.checkField(user)
    if (checkResult.hasWrongField) return response.response_fail(res, response.BAD_REQUEST, checkResult.message)
    await User.create(user)
    mail.send_password(req.password, user.email)
    return response.response_success(res, response.CREATED, user)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_warehouse_manager'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.create_warehouse_employee = async (req, res) => {
  try {
    const warehouse = req.warehouse
    /* if(!warehouse) return response.response_error(res, response.INTERNAL_SERVER_ERROR, err) */
    req.password = (Math.random() + 1).toString(36).substring(6)
    const hash_password = await bcrypt.hash(req.password, 10)
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      workplace: {
        workplace_name: "WAREHOUSE",
        workplace_id: warehouse._id,
        role: "WAREHOUSE_EMPLOYEE"
      },
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    const checkResult = usefulStuff.checkField(user)
    if (checkResult.hasWrongField) return response.response_fail(res, response.BAD_REQUEST, checkResult.message)
    const newUser = await User.create(user)
    mail.send_password(req.password, user.email)
    await Warehouse.findByIdAndUpdate(warehouse._id, { $addToSet: {warehouse_employees: newUser._id}})
    return response.response_success(res, response.CREATED, newUser)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.create_transaction_employee = async (req, res) => {
  try {
    const transactionSpot = req.transactionSpot
    /* if(!transactionSpot) return response.response_error(res, response.INTERNAL_SERVER_ERROR, err) */
    req.password = (Math.random() + 1).toString(36).substring(6)
    const hash_password = await bcrypt.hash(req.password, 10)
    const user = {
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      workplace: {
        workplace_name: "TRANSACTION",
        workplace_id: transactionSpot._id,
        role: "TRANSACTION_EMPLOYEE"
      },
      password: hash_password,
      urlAvatar: req.body.urlAvatar
    }
    const checkResult = usefulStuff.checkField(user)
    if (checkResult.hasWrongField) return response.response_fail(res, response.BAD_REQUEST, checkResult.message)
    const newUser = await User.create(user)
    await TransactionSpot.findByIdAndUpdate(transactionSpot._id, { $addToSet: { transaction_employees: newUser._id } }, null)
    mail.send_password(req.password, user.email)
    return response.response_success(res, response.CREATED, newUser)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_transaction_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_password = async (req, res) => {
  try {
    const { phone_number, old_password, new_password } = req.body
    if (!old_password || !new_password) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    const user = await User.findOne({ phone_number: phone_number })
    const match = await bcrypt.compare(old_password, user.password)
    if (!match) return response.response_fail(res, response.NOT_FOUND, 'Password is incorrect.')
    await User.findOneAndUpdate({ phone_number: phone_number }, { password: await bcrypt.hash(new_password, 10) })
    return response.response_success(res, response.OK, 'Update password successfully')
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_password'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.send_reset_password_token = async (req, res) => {
  try {
    const { phone_number } = req.body
    const user = await User.findOne({ phone_number: phone_number })
    if (!user) {
      return response.response_fail(res, response.NOT_FOUND, 'Phone number not exist.')
    }
    const verify_code = (Math.random() + 1).toString(36).substring(6)
    const hash_verify_code = await bcrypt.hash(verify_code, 10)
    await User.findOneAndUpdate({ phone_number: phone_number }, { reset_password_token: hash_verify_code })
    response.response_success(res, response.OK, "Send verify code successfully")
    await mail.send_verify_code(verify_code, user.email)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'get_reset_password_token'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.reset_password = async (req, res) => {
  try {
    const { phone_number, verify_code } = req.body
    const user = await User.findOne({ phone_number: phone_number })
    if (!user) {
      return response.response_fail(res, response.NOT_FOUND, 'Phone number not exist.')
    }
    const match = await bcrypt.compare(verify_code, user.reset_password_token)
    // const match = verify_code == user.reset_password_token
    if (!match) {
      return response.response_fail(res, response.NOT_FOUND, 'Verify code is incorrect.')
    }
    const new_password = Math.random().toString(36).substring(6)
    const hash_password = await bcrypt.hash(new_password, 10)
    await User.updateOne({ phone_number: phone_number }, { password: hash_password })
    response.response_success(res, response.OK, "Reset password successfully")
    await mail.send_reset_password(new_password, user.email)  
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'reset_password'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_user = async (req, res) => {
  try {
    if (!req.params.id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: id')
    const user = await User.findById(req.params.id)
    if (!user) return response.response_fail(res, response.NOT_FOUND, 'user doesn\'t exist')
    const userModelFields = ['last_name', 'first_name', 'email', 'password', 'url_avatar']
    let updateFieldObj = {}
    Object.keys(req.body).forEach((key) => {
      if (userModelFields.includes(key) && req.body[key]) {
        updateFieldObj[key] = req.body[key]
      }
    })
    const checkResult = usefulStuff.checkField(updateFieldObj)
    if (checkResult.hasWrongField) return response.response_fail(res, response.BAD_REQUEST, checkResult.message)
    await User.findByIdAndUpdate(user._id, updateFieldObj)
    return response.response_success(res, response.OK, "Update user successfully")
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_user'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_warehouse_employee = async (req, res) => {
  try {
    if (!req.params.user_id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    const warehouse = req.warehouse
    if (!warehouse) return response.response.response_fail(res, response.response.INTERNAL_SERVER_ERROR, 'middleware error: missing warehouse object')
    if (!req.body.user_id) return response.response_fail(res, response.BAD_REQUEST, 'Where is user if?')
    const employee = await User.findById(req.params.user_id)
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'user doesn\'t exist')
    if (!warehouse.warehouse_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'this employee isn\'t in this warehouse')
    const userModelFields = ['last_name', 'first_name', 'email', 'password', 'urlAvatar']
    let updateFieldObj = {}
    Object.keys(req.body).forEach((key) => {
      if (userModelFields.includes(key) && req.body[key]) {
        updateFieldObj[key] = req.body[key]
      }
    })
    const checkResult = usefulStuff.checkField(updateFieldObj)
    if (checkResult.hasWrongField) return response.response_fail(res, response.BAD_REQUEST, checkResult.message)
    await User.findByIdAndUpdate(employee._id, updateFieldObj)
    return response.response_success(res, response.OK, 'update warehouse employee successfully')
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_transaction_employee = async (req, res) => {
  try {
    if (!req.params.user_id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    const transactionSpot = req.transactionSpot
    if (!transactionSpot) return response.response.response_fail(res, response.response.INTERNAL_SERVER_ERROR, 'middleware error: missing transaction spot object')
    if (!req.body.user_id) return response.response_fail(res, response.BAD_REQUEST, 'Where is user id?')
    const employee = await User.findById(req.params.user_id)
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'user doesn\'t exist')
    if (!transactionSpot.transaction_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'this employee isn\'t in this transaction spot')
    const userModelFields = ['last_name', 'first_name', 'email', 'password', 'urlAvatar']
    let updateFieldObj = {}
    Object.keys(req.body).forEach((key) => {
      if (userModelFields.includes(key) && req.body[key]) {
        updateFieldObj[key] = req.body[key]
      }
    })
    const checkResult = usefulStuff.checkField(updateFieldObj)
    if (checkResult.hasWrongField) return response.response_fail(res, response.BAD_REQUEST, checkResult.message)
    await User.findByIdAndUpdate(employee._id, updateFieldObj)
    return response.response_success(res, response.OK, 'update transaction employee successfully')
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.delete_manager = async (req, res) => {
  try {
    if (!req.params.user_id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    const user = await User.findById(req.params.user_id)
    if (!user) {
      return response.response_fail(res, response.NOT_FOUND, 'User doesn\'t exist')
    }
    await User.deleteOne({ _id: req.params.user_id })
    // remove user from workplace follow role
    if (user.workplace.role == role.WAREHOUSE_MANAGER) {
      await Warehouse.findByIdAndUpdate(user.workplace.workplace_id, { warehouse_manager: null })
    } else if (user.workplace.role == role.TRANSACTION_MANAGER) {
      await TransactionSpot.findByIdAndUpdate(user.workplace.workplace_id, { transaction_manager: null })
    }
    return response.response_success(res, response.OK, 'Delete user successfully')
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'delete_manager'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.delete_warehouse_employee = async (req, res) => {
  try {
    const warehouse = req.warehouse
    if (!warehouse) return response.response.response_fail(res, response.response.INTERNAL_SERVER_ERROR, 'middleware error: missing warehouse object')
    const user_id = req.params.user_id
    if (!user_id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    const employee = await User.findById(user_id)
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'employee doens\'t exist')
    if (!warehouse.warehouse_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'this employee isn\'t in this warehouse')
    await User.findByIdAndDelete(employee._id)
    await Warehouse.findByIdAndUpdate(warehouse._id, { $pull: {warehouse_employees: employee._id}})
    return response.response_success(res, response.OK, 'delete warehouse employee success')
  } catch (err) {s
    err.file = 'controller/user.js'
    err.function = 'delete_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.delete_transaction_employee = async (req, res) => {
  try {
    const transactionSpot = req.transactionSpot
    if (!transactionSpot) return response.response.response_fail(res, response.response.INTERNAL_SERVER_ERROR, 'middleware error: missing transaction spot object')
    const user_id = req.params.user_id
    if (!user_id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    const employee = await User.findById(user_id)
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'employee doens\'t exist')
    if (!transactionSpot.transaction_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'this employee isn\'t in this transaction spot')
    await User.findByIdAndDelete(employee._id)
    await TransactionSpot.findByIdAndUpdate(transactionSpot._id, { $pull: {transaction_employees: employee._id}})
    return response.response_success(res, response.OK, 'delete transaction employee success')
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'delete_transaction_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}