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

exports.get_token = async (req, res) => {
  try {
    const user = req.body
    if (!user.phone_number || !user.password) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing required fields.')
    }
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
        return response.response_success(res, response.CREATED, data)
        //mail.send_password('Cấp mật khẩu mới', req.password, user.email)
      })
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
    if (!req.body.phone_number) return response.response_fail(res, response.BAD_REQUEST, 'Where phone number?')
    const userModelFields = ['last_name', 'first_name', 'email', 'password', 'urlAvatar']
    const workplaceFields = ['workplace_name', 'workplace_id', 'role']
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
    //console.log(updateFieldObj);
    const mess = await User.updateOne({phone_number: req.body.phone_number}, updateFieldObj)/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    return response.response_success(res, response.OK, mess)
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

exports.delete_user = async (req, res) => {
  try {
    if (!req.body.phone_number) return response.response_fail(res, response.BAD_REQUEST, 'Where phone number?')
    const user = await User.findOne({phone_number: req.body.phone_number})
    if (!user) return response.response_fail(res, response.NOT_FOUND, 'phone no exist')
    const mess1 = await User.deleteOne({phone_number: req.body.phone_number})/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    let mess2 = ''
    if (user.workplace.workplace_id && user.workplace.workplace_name) {
      switch (user.workplace.workplace_name) {
        case 'WAREHOUSE':
          const warehouse = await Warehouse.findById(user.workplace.workplace_id)
          if (!warehouse) {mess2 += 'warehouseless?'; break;}
          switch (user.workplace.role) {
            case 'WAREHOUSE_MANAGER':
              if (!warehouse.warehouse_manager.equals(user._id)) {mess2 += 'not manager, identity thief?'; break;}
              await Warehouse.findByIdAndUpdate(warehouse._id, {warehouse_manager: "000000000000000000000000"})
              mess2 += 'remove manager from warehouse'
              break;
            default:
              if (!warehouse.warehouse_employees.includes(user._id)) {mess2 += 'this user doesnt belong here, identity thief?'; break}
              await Warehouse.findByIdAndUpdate(warehouse._id, { $pull: {warehouse_employees: user._id}})/* .catch((err) => {
                return response.response_fail(res, response.CONFLICT, err)
              }) */
              mess2 += 'remove employee from warehouse'
              break;
          }
          break;
        case 'TRANSACTION':
          const transactionSpot = await TransactionSpot.findById(user.workplace.workplace_id)
          if (!transactionSpot) {mess2 += 'transactionSpotless?'; break;}
          switch (user.workplace.role) {
            case 'TRANSACTION_MANAGER':
              if (!transactionSpot.transaction_manager.equals(user._id)) {mess2 += 'not manager, identity thief?'; break;}
              await TransactionSpot.findByIdAndUpdate(transactionSpot._id, {transaction_manager: "000000000000000000000000"})
              mess2 += 'remove manager from transactionSpot'
              break;
            default:
              if (!transactionSpot.transaction_employees.includes(user._id)) {mess2 += 'this user doesnt belong here, identity thief?'; break}
              await TransactionSpot.findByIdAndUpdate(transactionSpot._id, { $pull: {transaction_employees: user._id}})/* .catch((err) => {
                return response.response_fail(res, response.CONFLICT, err)
              }) */
              mess2 += 'remove employee from transactionSpot'
              break;
          }
          break;
      }
    } else mess2 += 'homeless?'
    mess1.message = mess2
    return response.response_success(res, response.OK, mess1)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'delete_user'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.delete_warehouse_employee = async (req, res) => {
  try {
    const warehouse = req.warehouse
    if (!req.body.phone_number) return response.response_fail(res, response.BAD_REQUEST, 'Where phone number?')
    const employee = await User.findOne({phone_number: req.body.phone_number})
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'phone no exist')
    if (!warehouse.warehouse_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'not your slave')
    const mess = await User.deleteOne({phone_number: req.body.phone_number})/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    await Warehouse.findByIdAndUpdate(warehouse._id, { $pull: {warehouse_employees: employee._id}})/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    return response.response_success(res, response.OK, mess)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'delete_warehouse_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.delete_transaction_employee = async (req, res) => {
  try {
    const transactionSpot = req.transactionSpot
    if (!req.body.phone_number) return response.response_fail(res, response.BAD_REQUEST, 'Where phone number?')
    const employee = await User.findOne({phone_number: req.body.phone_number})
    if (!employee) return response.response_fail(res, response.NOT_FOUND, 'phone no exist')
    if (!transactionSpot.transaction_employees.includes(employee._id)) return response.response_fail(res, response.UNAUTHORIZED, 'not your slave')
    const mess = await User.deleteOne({phone_number: req.body.phone_number})/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    await TransactionSpot.findByIdAndUpdate(transactionSpot._id, { $pull: {transaction_employees: employee._id}})/* .catch((err) => {
      return response.response_fail(res, response.CONFLICT, err)
    }) */
    return response.response_success(res, response.OK, mess)
  } catch (err) {
    err.file = 'controller/user.js'
    err.function = 'delete_transaction_employee'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}