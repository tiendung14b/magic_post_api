const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: String,
  address: {
    type: String,
    required: true
  },
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

const transactionSchema = new mongoose.Schema({
  transaction_tracker: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  transaction_qr_tracker: {
    type: String,
    required: true
  },
  sender: clientSchema,
  receiver: clientSchema,
  list_package: [packageSchema],
  source_postal_code: {
    type: String,
    required: true
  },
  destination_postal_code: {
    type: String,
    required: true
  },
  receive_date: {
    type: Date,
    required: true
  },
  send_date: {
    type: Date,
    required: true
  },
  transaction_type: {
    type: String,
    required: true
  },
  shipping_cost: {
    type: Number,
    required: true
  },
  prepaid: Number
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
