
const geocoder = require('../utils/geocode')
const response = require('../utils/response')

const calcDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // metres
  const φ1 = lat1 * Math.PI / 180 // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // in metres
}

exports.get_geocode_by_address = async (req, res) => {
  try {
    const result = await geocoder(options).geocode(req.body.address)
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getPostalCode = async (req, res) => {
  try {
    const result = await geocoder.getPostalCode(req.body.address)
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.reverseGeocode = async (req, res) => {
  try {
    const result = await geocoder.reverseGeocode(req.body.lat, req.body.lng)
    return response.response_success(res, response.OK, result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


exports.getDistance = async (req, res) => {
  try {
    const result = await geocoder.getDistance(req.body.lat1, req.body.lng1, req.body.lat2, req.body.lng2)
    return response.response_success(res, response.OK, result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}