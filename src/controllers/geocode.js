const geocoder = require('node-geocoder')

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.MAPS_API_KEY,
  formatter: null
}

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

