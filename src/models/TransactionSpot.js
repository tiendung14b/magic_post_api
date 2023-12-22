const mongoose = require('mongoose');
const { response_success } = require('../utils/response');

const locationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  long: {
    type: Number,
    required: true
  },
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

const transactionSpotSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  location: {
    type: locationSchema,
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
  // transaction received from client
  from_client_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  // transaction waiting to be received from warehouse
  unconfirm_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  // received transaction to ship to client
  to_client_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }], 
  // transactions successfully delivered to client
  success_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  // transactions fail to delivered to client
  failed_transactions: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  // history of transaction received from client to send away
  sending_history: [{
    type: mongoose.Schema.Types.ObjectId
  }]
});

const TransactionSpot = mongoose.model('TransactionSpot', transactionSpotSchema);

module.exports = TransactionSpot;
