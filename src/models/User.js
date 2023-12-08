const { default: mongoose } = require('mongoose')
const moongoose = require('mongoose')

const workplaceSchema = new moongoose.Schema({
  workplace_name: {
    type: String,
    enum: ["DIRECTOR", "WAREHOUSE", "TRANSACTION"]
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
  password: {
    type: String,
    required: true
  },
  workplace: {
    type: workplaceSchema,
  },
  urlAvatar: String
})

module.exports = moongoose.model('User', userSchema)