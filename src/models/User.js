const moongoose = require('mongoose')

const userSchema = new moongoose.Schema({
  last_name: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    require: true
  },
  phone_number: {
    type: Number,
    require: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['DIRECTOR', 'WAREHOUSE_MANAGER', 'WAREHOUSE_EMPLOYEE', 'TRANSACTION_MANAGER', 'TRANSACTION_EMPLOYEE', 'DELIVER', 'GUEST'],
    default: 'user'
  },
  urlAvatar: String
})

module.exports = moongoose.model('User', userSchema)