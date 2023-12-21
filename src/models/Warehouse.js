const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  transaction_spots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionSpot'
  }],
  warehouse_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  warehouse_employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // history of transactions received from transaction spot
  received_transactions_history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  // current transactions waiting to be delivered to here
  unconfirm_transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  // current transactions inside warehouse
  inwarehouse_transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  // history of transactions sent to transaction spot
  sent_transactions_history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

module.exports = Warehouse;
