const response = require('../utils/response')
const Transaction = require('../models/Transaction')
const TransactionSpot = require('../models/TransactionSpot')
const geocode = require('../utils/geocode')

const COST_PER_METRE = 100

const find_nearest_transaction_spot = async (address) => {
  const geocode_info = await geocode.get_geocode_by_address(address)
  const { lat, lon } = geocode_info
  const transaction_spots = await TransactionSpot.find()
  let nearest_transaction_spot = null
  let min_distance = Infinity
  transaction_spots.forEach(function loop(transaction_spot) {
    const distance = geocode.calcDistance(lat, lon, transaction_spot.lat, transaction_spot.lon)
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
    const sourceTransactionSpot = await TransactionSpot.findById(source_transaction_spot)
    // all transaction spot except source transaction spot
    const { nearest_transaction_spot, min_distance } = await find_nearest_transaction_spot(receiver.address)
    const destination_transaction_spot = nearest_transaction_spot._id
    const shipping_cost = min_distance * COST_PER_METRE
    if (!sourceTransactionSpot) {
    }
    if (!destinationTransactionSpot) {
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
    return response.response_success(res, data)
  } catch (error) {
    error.file = 'transaction_spot.js'
    error.function = 'create_transaction'
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error)
  }
}