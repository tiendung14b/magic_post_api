const response = require('../utils/response')
const Transaction = require('../models/Transaction')
const TransactionSpot = require('../models/TransactionSpot')
const geocode = require('../utils/geocode')
const qrcode = require('qrcode')
const axios = require('axios')
const uploadImage = require('../utils/upload_image')

const COST_PER_METRE = 0.1

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
      transaction_qr_tracker,
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
    const source_transaction_spot_info = await TransactionSpot.findById(source_transaction_spot)
    if (!source_transaction_spot_info) {
      return response.response_fail(res, response.NOT_FOUND, "Invalid source transaction spot id")
    }
    // all transaction spot except source transaction spot
    const { nearest_transaction_spot, min_distance } = await find_nearest_transaction_spot(
      receiver.address.detail + ', ' + receiver.address.district + ', ' + receiver.address.city
    )
    if (!nearest_transaction_spot || min_distance == Infinity || min_distance > 10000) {
      return response.response_fail(res, response.NOT_FOUND, 'Địa điểm nhận hàng chưa được hỗ trợ')
    }
    const destination_transaction_spot = nearest_transaction_spot._id
    const shipping_cost = geocode.calcDistance(
      source_transaction_spot_info.location.lat,
      source_transaction_spot_info.location.long,
      nearest_transaction_spot.location.lat,
      nearest_transaction_spot.location.long
    ) * COST_PER_METRE
    if (!destination_transaction_spot) {
      return response.response_fail(res, response.NOT_FOUND, 'Địa điểm gửi hàng chưa được hỗ trợ')
    }
    const status = {
      status: 'WAITING',
      date: new Date(),
      location: source_transaction_spot_info.name
    }
    const data = await Transaction.create({
      sender,
      receiver,
      list_package,
      source_transaction_spot,
      destination_transaction_spot,
      transaction_type,
      shipping_cost,
      prepaid,
      status: [status]
    })
    await TransactionSpot.findByIdAndUpdate(source_transaction_spot, {
      $push: {
        from_client_transactions: data._id
      }
    })
    let qr_code = await qrcode.toDataURL(transaction_qr_tracker + data._id.toString())
    const url = await uploadImage(qr_code)
    await Transaction.findByIdAndUpdate(data._id, {
      transaction_qr_tracker: url
    })
    return response.response_success(res, response.OK, {...data, transaction_qr_tracker: url})
  } catch (error) {
    error.file = 'transaction_spot.js'
    error.function = 'create_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}

exports.get_transaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      return response.response_fail(res, response.NOT_FOUND, 'Transaction not found')
    }
    return response.response_success(res, response.OK, transaction)
  } catch (error) {
    error.file = 'transaction.js'
    error.function = 'get_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}

