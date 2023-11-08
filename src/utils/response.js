exports.UNAUTHORIZED = 401;
exports.INTERNAL_SERVER_ERROR = 500;
exports.OK = 200;
exports.CREATED = 201;
exports.NO_CONTENT = 204;
exports.BAD_REQUEST = 400;
exports.NOT_FOUND = 404;
exports.CONFLICT = 409;
exports.FORBIDDEN = 403;
exports.UNPROCESSABLE_ENTITY = 422;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers too */
};

exports.response_success = (res, status_code, data) => {
  console.log('success')
  return res.status(status_code).json({
    status: 'success',
    result: data
  });
}

exports.response_error = (res, status_code, error) => {
  console.log('error')
  return res.status(status_code).json({
    status: 'error',
    message: error.message
  });
}

exports.response_fail = (res, status_code, message) => {
  console.log('fail')
  return res.status(status_code).json({
    status: 'fail',
    message: message
  });
}
