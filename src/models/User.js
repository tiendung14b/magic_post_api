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
  email: String,
  phone_number: Number,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['DIRECTOR', 'WAREHOUE_MANAGER', 'WAREHOUSE_EMPLOYEE', 'TRANSACTION_MANAGER', 'TRANSACTION_EMPLOYEE', 'DELIVER', 'GUEST'],
    default: 'user'
  },
})

module.exports = moongoose.model('User', userSchema)