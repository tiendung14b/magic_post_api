const { default: mongoose } = require('mongoose')
const moongoose = require('mongoose')
const { reset } = require('nodemon')

const workplaceSchema = new moongoose.Schema({
  workplace_name: {
    type: String,
    enum: ["DIRECTOR", "WAREHOUSE", "TRANSACTION"]
  },
  join_at: {
    type: Date,
  },
  workplace_id: mongoose.Schema.Types.ObjectId,
  role: {
    type: String,
    enum: ["DIRECTOR", "WAREHOUSE_MANAGER", "TRANSACTION_MANAGER", "WAREHOUSE_EMPLOYEE", "TRANSACTION_EMPLOYEE", "DELIVER"],
    required: true
  }
})

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
    type: String,
    require: true,
    index: {
      unique: true,
    }
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  password: {
    type: String,
    required: true
  },
  reset_password_token: String,
  workplace: {
    type: workplaceSchema,
  },
  url_avatar: String
})

module.exports = moongoose.model('User', userSchema)