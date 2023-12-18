const User = require('../models/User')
const Warehouse = require('../models/Warehouse')
const TransactionSpot = require('../models/TransactionSpot')
const Deliver = require('../models/Deliver')
const response = require('../utils/response')
const role = require('../utils/role')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mail = require('../utils/mail')

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
    const importantFields = ['last_name', 'first_name', 'email', 'phone_number', 'role']
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
    let hasEmptyField = false
    Object.keys(user).forEach((key) => {
      if (importantFields.includes(key) && !user[key]) {
        hasEmptyField = true
      }
    })
    if (hasEmptyField || !user.workplace.role) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    await User.create(user)
    mail.send_password('Cấp mật khẩu mới', req.password, user.email)
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
    const importantFields = ['last_name', 'first_name', 'email', 'phone_number', 'role']
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
    let hasEmptyField = false
    Object.keys(user).forEach((key) => {
      if (importantFields.includes(key) && !user[key]) {
        hasEmptyField = true
      }
    })
    if (hasEmptyField) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    const newUser = await User.create(user)
      .then((data) => {
        //mail.send_password('Cấp mật khẩu mới', req.password, user.email)
        return data
      })
      /* .catch((err) => {
        return response.response_fail(res, response.CONFLICT, err.message)
      }) */
    await Warehouse.findByIdAndUpdate(warehouse._id, { $addToSet: {warehouse_employees: newUser._id}})/* .catch((err) => {
        return response.response_fail(res, response.CONFLICT, err)
      }) */
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
    const importantFields = ['last_name', 'first_name', 'email', 'phone_number', 'role']
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
    let hasEmptyField = false
    Object.keys(user).forEach((key) => {
      if (importantFields.includes(key) && !user[key]) {
        hasEmptyField = true
      }
    })
    if (hasEmptyField) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
    const newUser = await User.create(user)
      .then((data) => {
        //mail.send_password('Cấp mật khẩu mới', req.password, user.email)
        return data
      })
      /* .catch((err) => {
        return response.response_fail(res, response.CONFLICT, err.message)
      }) */
    await TransactionSpot.findByIdAndUpdate(transactionSpot._id, { $addToSet: {transaction_employees: newUser._id}}, null)/* .catch((err) => {
        return response.response_fail(res, response.CONFLICT, err)
      }) */
    return response.response_success(res, response.CREATED, newUser)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'create_transaction_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_password = async (req, res) => {
  try {
    const user = req.user
    await User.findByIdAndUpdate(user._id, {password: req.body.password})/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    return response.response_success(res, response.OK, 'successfully update password')
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_password'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_user = async (req, res) => {
  try {
    if (!req.params.id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: id')
    }
    console.log(req.body);
    await User.updateOne({ _id: req.params.id }, req.body)
    return response.response_success(res, response.OK, "Update user successfully")
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_user'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_warehouse_employee = async (req, res) => {
  try {
    const warehouse = req.warehouse
    if (!req.body.phone_number) return response.response_fail(res, response.BAD_REQUEST, 'Where phone number?')
    const employee = await User.findOne({phone_number: req.body.phone_number})
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'phone no exist')
    if (!warehouse.warehouse_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'not your slave')
    const userModelFields = ['last_name', 'first_name', 'email', 'password', 'urlAvatar']
    const workplaceFields = ['role']
    let updateFieldObj = {}
    Object.keys(req.body).forEach((key) => {
      if (userModelFields.includes(key) && req.body[key]) {
        updateFieldObj[key] = req.body[key]
      }
    })
    if(req.body.workplace) {updateFieldObj.workplace = {}; Object.keys(req.body.workplace).forEach((key) => {
      if (workplaceFields.includes(key) && req.body.workplace[key]) {
        updateFieldObj.workplace[key] = req.body.workplace[key]
      }
    })}
    const mess = await User.updateOne({phone_number: req.body.phone_number}, updateFieldObj)/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    return response.response_success(res, response.OK, mess)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'update_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.update_transaction_employee = async (req, res) => {
  try {
    const transactionSpot = req.transactionSpot
    if (!req.body.phone_number) return response.response_fail(res, response.BAD_REQUEST, 'Where phone number?')
    const employee = await User.findOne({phone_number: req.body.phone_number})
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'phone no exist')
    if (!transactionSpot.transaction_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'not your slave')
    const userModelFields = ['last_name', 'first_name', 'email', 'password', 'urlAvatar']
    const workplaceFields = ['role']
    let updateFieldObj = {}
    Object.keys(req.body).forEach((key) => {
      if (userModelFields.includes(key) && req.body[key]) {
        updateFieldObj[key] = req.body[key]
      }
    })
    if (req.body.workplace) {
      updateFieldObj.workplace = {}; 
      Object.keys(req.body.workplace).forEach((key) => {
      if (workplaceFields.includes(key) && req.body.workplace[key]) {
        updateFieldObj.workplace[key] = req.body.workplace[key]
      }
    })}
    const mess = await User.updateOne({phone_number: req.body.phone_number}, updateFieldObj)/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    return response.response_success(res, response.OK, mess)
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
      return response.response_fail(res, response.NOT_FOUND, 'User no longer exist')
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
    const id = req.params.user_id
    if (!id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    }
    const employee = await User.findById(id)
    if (!employee) {
      return response.response_fail(res, response.NOT_FOUND, 'User no longer exist')
    }
    await User.deleteOne({ _id: id })
    return response.response_success(res, response.OK, mess)
  } catch (err) {s
    err.file = 'controller/user.js'
    err.function = 'delete_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.delete_transaction_employee = async (req, res) => {
  try {
    const id = req.params.user_id
    if (!id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: user_id')
    }
    const employee = await User.findById(id)
    if (!employee) {
      return response.response_fail(res, response.NOT_FOUND, 'User no longer exist')
    }
    await User.deleteOne({ _id: id })
    return response.response_success(res, response.OK, mess)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'delete_transaction_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}