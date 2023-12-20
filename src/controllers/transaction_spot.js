const TransactionSpot = require('../models/TransactionSpot')
const Transaction = require('../models/Transaction')
const Warehouse = require('../models/Warehouse')
const response = require('../utils/response')
const geocode = require('../utils/geocode');
const User = require('../models/User');

exports.create_transaction_spot = async (req, res) => {
  try {
    const {
      name,
      location,
      warehouse,
      transaction_manager
    } = req.body;
    const geocodeInfo = await geocode.getPostalCode(location.detail + ', ' + location.district + ', ' + location.city)
    const existPostalCode = await TransactionSpot.findOne({ postal_code: geocodeInfo.postcode })
    if (existPostalCode) {
      return response.response_fail(res, response.BAD_REQUEST, 'Postal code already exist')
    }
    location.lat = geocodeInfo.lat
    location.long = geocodeInfo.lon
    await TransactionSpot.create({
      name,
      location,
      postal_code: geocodeInfo.postcode,
      warehouse,
      transaction_manager,
      transaction_employees: []
    })
    return response.response_success(res, response.OK, 'Create transaction spot successfully')
  } catch (err) {
    console.log(err)
    err.file = 'transaction_spot.js'
    err.function = 'create_transaction_spot'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.get_transaction_spot = async (req, res) => {
  try {
    if(!req.params.id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction spot id')
    const transactionSpot = await TransactionSpot.findById(req.params.id).populate('transaction_manager').populate('transaction_employees').populate('warehouse')
    return response.response_success(res, response.OK, transactionSpot)
  } catch (err) {
    err.file = 'transaction_spot.js'
    err.function = 'get_transaction_spot'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.get_all_transaction_spot = async (req, res) => {
  try {
    const transactionSpot = await TransactionSpot.find().populate('transaction_manager').populate('transaction_employees').populate('warehouse')
    return response.response_success(res, response.OK, transactionSpot)
  } catch (err) {
    err.file = 'transaction_spot.js'
    err.function = 'get_all_transaction_spot'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.set_manager = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id
    const manager_id = req.body.manager_id
    if (!id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_spot_id is required')
    }
    if (!manager_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'manager_id is required')
    }
    const transactionSpot = await TransactionSpot.findById(id)
    if (!transactionSpot) {
      return response.response_fail(res, response.NOT_FOUND, 'Transaction_spot not found')
    }
    const manager = await User.findById(manager_id)
    if (!manager) {
      return response.response_fail(res, response.NOT_FOUND, 'manager not found')
    }
    if (manager.workplace?.workplace_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'manager already have workplace')
    }
    if (transactionSpot.transaction_manager) {
      return response.response_fail(res, response.BAD_REQUEST, 'transaction_spot already have manager')
    }
    await TransactionSpot.findByIdAndUpdate(id, { transaction_manager: manager_id })
    await User.findByIdAndUpdate(manager_id, { $set: { 'workplace.workplace_id': id, 'workplace.workplace_name': 'TRANSACTION' } })
    return response.response_success(res, response.OK, 'set transaction manager success')
  } catch (err) {
    err.file = 'transaction_spot.js'
    err.function = 'set_manager'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.remove_manager = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id
    if (!id) {
      return response.response_fail(res, response.BAD_REQUEST, 'transaction_spot_id is required')
    }
    const transactionSpot = await TransactionSpot.findById(id)
    if (!transactionSpot) {
      return response.response_fail(res, response.BAD_REQUEST, 'transaction_spot not found')
    }
    const manager = await User.findById(transactionSpot.transaction_manager)
    if (!manager) {
      return response.response_fail(res, response.NOT_FOUND, 'manager not found')
    }
    await TransactionSpot.findByIdAndUpdate(id, { transaction_manager: null })
    await User.findByIdAndUpdate(manager._id, { $set: { 'workplace.workplace_id': undefined } })
  } catch (err) {
    err.file = 'transaction_spot.js'
    err.function = 'remove_manager'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.get_unconfirmed_transaction = async (req, res) => {
  try {
    const transaction_spot_id = req.params.transaction_spot_id
    if (!transaction_spot_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_spot_id is required')
    }
    const transaction_spot = await TransactionSpot.findById(transaction_spot_id)
    if (!transaction_spot) {
      return response.response_fail(res, response.NOT_FOUND, 'transaction_spot not found')
    }
    const unconfirmed_transactions = await Transaction.find({ _id: { $in: transaction_spot.unconfirm_transactions } })
      .populate('sender')
      .populate('receiver')
      .populate('source_transaction_spot')
      .populate('destination_transaction_spot')
    return response.response_success(res, response.OK, unconfirmed_transactions)
  } catch (err) {
    err.file = 'transaction_spot.js'
    err.function = 'get_unconfirmed_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.get_to_client_transaction = async (req, res) => {
  try {
    const transaction_spot_id = req.params.transaction_spot_id
    if (!transaction_spot_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_spot_id is required')
    }
    const transaction_spot = await TransactionSpot.findById(transaction_spot_id)
    if (!transaction_spot) {
      return response.response_fail(res, response.NOT_FOUND, 'transaction_spot not found')
    }
    const to_client_transactions = await Transaction.find({ _id: { $in: transaction_spot.to_client_transactions } })
      .populate('sender')
      .populate('receiver')
      .populate('source_transaction_spot')
      .populate('destination_transaction_spot')
    return repsponse.response_success(res, response.OK, to_client_transactions)
  } catch (err) {
    err.file = 'transaction_spot.js'
    err.function = 'get_to_client_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}