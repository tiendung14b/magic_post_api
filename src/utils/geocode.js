const geocoder = require('node-geocoder')
const axios = require('axios')

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.MAPS_API_KEY,
  formatter: null
}

exports.calcDistance = (lat1, lon1, lat2, lon2) => {
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


exports.get_geocode_by_address = async (address) => {
  try {
    const result = await geocoder(options).geocode(address)
    return result
  } catch (err) {
    throw err
  }
}

exports.getPostalCode = async (address) => {
  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&lang=vi&limit=2&format=json&apiKey=45cdd854b9f946d291b981313826017d`;
    const response = await axios.get(url)
    const data = response.data;
    return data.results[0]
  } catch (err) {
    err.file = 'geocode.js'
    err.function = 'getPostalCode'
    throw err
  }
}

exports.reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=45cdd854b9f946d291b981313826017d`;
    const response = await axios.get(url)
    const data = response.data;
    return data
  } catch (err) {
    throw err
  }
}

