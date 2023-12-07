const mongoose = require('mongoose');

const transactionSpotSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  location: {
    type: String, 
    required: true
  },
  postal_code: {
    type: String,
    required: true,
    index: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  transaction_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transaction_employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  shipment_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  unconfirm_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  delivery_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  sending_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  transaction_histories: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  failed_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }]
});

const TransactionSpot = mongoose.model('TransactionSpot', transactionSpotSchema);

module.exports = TransactionSpot;
