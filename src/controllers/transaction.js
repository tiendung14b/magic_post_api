const response = require('../utils/response')
const Transaction = require('../models/Transaction')
const TransactionSpot = require('../models/TransactionSpot')
const geocode = require('../utils/geocode')

const COST_PER_METRE = 100

const find_nearest_transaction_spot = async (address) => {
  try {
    const geocode_info = await geocode.get_geocode_by_address(address)
    const { lat, lon } = geocode_info
    const transaction_spots = await TransactionSpot.find()
    let nearest_transaction_spot = null
    let min_distance = Infinity
    transaction_spots.forEach(function loop(transaction_spot) {
      const distance = geocode.calcDistance(lat, lon, transaction_spot.location.lat, transaction_spot.location.long)
      if (transaction_spot.postal_code == geocode_info.postal_code) {
        nearest_transaction_spot = transaction_spot
        loop.stop = true
        return
      }
      if (!loop.stop && distance < min_distance) {
        min_distance = distance
        nearest_transaction_spot = transaction_spot
      }
    })
    return {
      nearest_transaction_spot,
      min_distance
    }
  } catch (error) {
    error.file = 'transaction_spot.js'
    error.function = 'find_nearest_transaction_spot'
    throw error
  }
}

exports.create_transaction = async (req, res) => {
  try {
    const {
      sender,
      receiver,
      list_package,
      source_transaction_spot,
      transaction_type,
      prepaid
    } = req.body
    if (!sender || !receiver || !list_package || !source_transaction_spot || !transaction_type) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing field')
    }
    // all transaction spot except source transaction spot
    const { nearest_transaction_spot, min_distance } = await find_nearest_transaction_spot(
      receiver.address.detail + ', ' + receiver.address.district + ', ' + receiver.address.city
    )
    if (!nearest_transaction_spot) {
      return response.response_fail(res, response.NOT_FOUND, 'Địa điểm nhận hàng chưa được hỗ trợ')
    }
    const destination_transaction_spot = nearest_transaction_spot._id
    const shipping_cost = min_distance * COST_PER_METRE
    if (!destination_transaction_spot) {
      return response.response_fail(res, response.NOT_FOUND, 'Địa điểm gửi hàng chưa được hỗ trợ')
    }
    const data = await Transaction.create({
      sender,
      receiver,
      list_package,
      source_transaction_spot,
      destination_transaction_spot,
      transaction_type,
      shipping_cost,
      prepaid
    })
    await TransactionSpot.findByIdAndUpdate(source_transaction_spot, {
      $push: {
        from_client_transactions: data._id
      }
    })
    return response.response_success(res, response.OK, data)
  } catch (error) {
    error.file = 'transaction_spot.js'
    error.function = 'create_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}

exports.get_transaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    return response.response_success(res, transaction)
  } catch (error) {
    error.file = 'transaction_spot.js'
    error.function = 'get_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}

exports.send_to_warehouse = async (req, res) => {
  try {
    const { transaction_id } = req.body
    if (!transaction_id || !warehouse_id) {
      return response.response_fail(res, response.BAD_REQUEST, 'Missing field')
    }
    const transaction = await Transaction.findById(transaction_id)
    if (!transaction) {
      return response.response_fail(res, response.NOT_FOUND, 'Transaction not found')
    }
    const warehouse = await Warehouse.findById(transaction.warehouse)
    if (!warehouse) {
      return response.response_fail(res, response.NOT_FOUND, 'You need set warehouse for this transaction first')
    }
    return response.response_success(res, 'Send to warehouse success')
  } catch (error) {
    error.file = 'transaction_spot.js'
    error.function = 'send_to_warehouse'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}