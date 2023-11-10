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

exports.response_success = (res, status_code, data) => {
  return res.status(status_code).json({
    status: 'success',
    result: data
  });
}

exports.response_error = (res, status_code, error) => {
  return res.status(status_code).json({
    status: 'error',
    message: error.message
  });
}

exports.response_fail = (res, status_code, message) => {
  return res.status(status_code).json({
    status: 'fail',
    message: message
  });
}
