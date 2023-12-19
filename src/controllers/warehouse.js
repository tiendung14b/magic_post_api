const TransactionSpot = require('../models/TransactionSpot')
const Transaction = require('../models/Transaction')
const Warehouse = require('../models/Warehouse')
const response = require('../utils/response')
const geocode = require('../utils/geocode');
const User = require('../models/User');

exports.create_warehouse = async (req, res) => {
  try {
    const {
      name,
      location,
      warehouse_manager
    } = req.body;
    await Warehouse.create({
      name,
      location,
        
      transaction_spots: [],
      warehouse_manager,
      warehouse_employees: []
    })
    return response.response_success(res, response.OK, 'Create warehouse successfully')
  } catch (err) {
    err.file = 'warehouse.js'
    err.function = 'create_warehouse'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.get_warehouse = async (req, res) => {
  try {
    if(!req.params.id) return response.response_fail(res, response.BAD_REQUEST, 'Missing params: warehouse id')
    const warehouse = await Warehouse.findById(req.params.id).populate('warehouse_manager').populate('warehouse_employees').populate('transaction_spots')
    return response.response_success(res, response.OK, warehouse)
  } catch (err) {
    err.file = 'warehouse.js'
    err.function = 'get_warehouse'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.get_all_warehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.find().populate('warehouse_manager').populate('warehouse_employees').populate('transaction_spots')
    return response.response_success(res, response.OK, warehouse)
  } catch (err) {
    err.file = 'warehouse.js'
    err.function = 'get_all_warehouse'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.set_manager = async (req, res) => {
  try {
    const id = req.params.warehouse_id
    const manager_id = req.body.manager_id
    if (!id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: warehouse_id is required')
    }
    if (!manager_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'manager_id is required')
    }
    const warehouse = await Warehouse.findById(id)
    if (!warehouse) {
      return response.response_fail(res, response.NOT_FOUND, 'Warehouse not found')
    }
    const manager = await User.findById(manager_id)
    if (!manager) {
      return response.response_fail(res, response.NOT_FOUND, 'manager not found')
    }
    if (manager.workplace?.workplace_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'manager already have workplace')
    }
    if (warehouse.warehouse_manager) {
      return response.response_fail(res, response.BAD_REQUEST, 'warehouse already have manager')
    }
    await Warehouse.findByIdAndUpdate(id, { warehouse_manager: manager_id })
    await User.findByIdAndUpdate(manager_id, { $set: { 'workplace?.workplace_id': id, 'workplace?.workplace_name': 'WAREHOUSE' } })
    return response.response_success(res, response.OK, 'set warehouse manager success')
  } catch (err) {
    err.file = 'warehouse.js'
    err.function = 'set_manager'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

