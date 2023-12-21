const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    required: true
  }
});

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: String,
  address: {
    type: locationSchema,
    required: true
  } ,
  phoneNumber: {
    type: String,
    required: true
  }
})

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['DOCUMENT', 'PACKAGE'],
    default: 'PACKAGE'
  },
  weight: Number,
  package_value: Number,
  postage: Number,
  quantity: Number,
})

const statusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'WAITING'],
    default: 'WAITING'
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  }
}) 

const transactionSchema = new mongoose.Schema({
  transaction_qr_tracker: {
    type: String,
  },
  sender: clientSchema,
  receiver: clientSchema,
  list_package: [packageSchema],
  source_transaction_spot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionSpot',
    required: true
  },
  destination_transaction_spot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionSpot',
    required: true
  },
  receive_date: {
    type: Date,
  },
  send_date: {
    type: Date,
    required: true,
    default: Date.now()
  },
  transaction_type: {
    type: String,
    required: true
  },
  shipping_cost: {
    type: Number,
    required: true
  },
  status: [statusSchema],
  prepaid: Number
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
