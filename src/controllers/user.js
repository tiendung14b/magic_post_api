const User = require('../models/User')
const response = require('../utils/response')

exports.get_info = async (req, res) => {
  try {
    const _id = req.params._id;
    const userData = await User.findById(_id)
    console.log(userData)
    if (!userData) {
      response.response_fail(res, response.NOT_FOUND, "invalid id")
    }
    response.response_success(res, response.OK, userData)
  } catch (err) {
    response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }       
}

