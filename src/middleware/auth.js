const jwt = require('jsonwebtoken')
const response = require('../utils/response')
const Warehouse = require('../models/Warehouse')
const role = require('../utils/role')
const TransactionSpot = require('../models/TransactionSpot')

// payload is user's data include _id and role
// implement handle auth depend on the role of user

exports.authDirector = (req, res, next) => {
  const token = req.headers.access_token
  if (!token)
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  try {
    let user = undefined
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (!err) user = payload
      if (user?.workplace.role != role.DIRECTOR)
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      req.user = payload
      next()
    })
  } catch (error) {
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}

exports.authWarehouseManager = async (req, res, next) => {
  const token = req.headers.access_token
  if (!token) 
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  let user = undefined
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    try {
      if (!err) user = payload
      if (user?.workplace.role != role.WAREHOUSE_MANAGER) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      // check if this user can access to warehouse or not
      const warehouse = await Warehouse.findById(user.workplace.workplace_id)
      if (!warehouse) return response.response_fail(res, response.NOT_FOUND, 'invalid warehouse_id')
      if (warehouse.warehouse_manager != user._id) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      req.user = user
      req.warehouse = warehouse
      next()
    } catch (err) {
      err.file = 'auth.js'
      response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
  })
}

exports.authWarehouseEmployee = async (req, res, next) => {
  const token = req.headers.access_token
  if (!token) 
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  let user = undefined
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    try {
      if (!err) user = payload
      if (user?.workplace.role != role.WAREHOUSE_EMPLOYEE) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      // check if this user can access to warehouse or not
      const warehouse = await Warehouse.findById(user.workplace.workplace_id)
      if (!warehouse) return response.response_fail(res, response.NOT_FOUND, 'invalid warehouse_id')
      // check if this user is an employee of warehouse
      if (!warehouse.warehouse_employees.includes(user._id)) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      req.user = user
      req.warehouse = warehouse
      next()
    } catch (err) {
      response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
  })
}

exports.authTransactionSpotManager = async (req, res, next) => {
  const token = req.headers.access_token
  if (!token) 
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  let user = undefined
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    try {
      if (!err) user = payload
      if (user?.workplace.role != role.TRANSACTION_MANAGER) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      // check if this user can access to warehouse or not
      const transactionSpot = await TransactionSpot.findById(user.workplace.workplace_id)
      if (!transactionSpot) return response.response_fail(res, response.NOT_FOUND, 'invalid transactionSpot_id')
      // const transactionSpot = await TransactionSpot.findOne({ transaction_manager: user._id })
      // if (!transactionSpot) return response.response_fail(res, response.NOT_FOUND, 'manager is transactionSpotless')
      req.user = user
      req.transactionSpot = transactionSpot
      next()
    } catch (err) {
      response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
  })
}

exports.authTransactionSpotEmployee = async (req, res, next) => {
  const token = req.headers.access_token
  if (!token) 
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  let user = undefined
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    try {
      if (!err) user = payload
      if (user?.workplace.role != role.TRANSACTION_EMPLOYEE) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      // check if this user can access to warehouse or not
      const transactionSpot = await TransactionSpot.findById(user.workplace.workplace_id)
      if (!transactionSpot) return response.response_fail(res, response.NOT_FOUND, 'invalid transactionSpot_id')
      // check if this user is an employee of transaction Spots
      if (!transactionSpot.transaction_employees.includes(user._id)) {
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      }
      req.user = user
      req.transactionSpot = transactionSpot
      next()
    } catch (err) {
      response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
    }
  })
}

exports.authDelivery = (req, res, next) => {
  const token = req.headers.access_token
  if (!token)
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  try {
    let user = undefined
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (!err) user = payload
      if (user?.workplace.role != role.DELIVER)
        return response.response_fail(res, response.FORBIDDEN, 'forbidden request')
      req.user = payload
      next()
    })
  } catch (error) {
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}

exports.authToken = (req, res, next) => {
  const token = req.headers.access_token
  if (!token)
    return response.response_fail(res, response.UNAUTHORIZED, 'unauthorized')
  try {
    let user = undefined
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        return response.response_fail(res, response.UNAUTHORIZED, 'token expired')
      }
      user = payload
      if (!user) return response.response_fail(res, response.UNAUTHORIZED, 'sumthin wong with yo ID')
      req.user = payload
      next()
    })
  } catch (err) {
    err.file = 'auth.js'
    err.function = 'authToken'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}