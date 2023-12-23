const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  time: {
    type: Date,
    default: Date.now()
  }
});

const WarehouseSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  warehouse_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  warehouse_employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  transaction_spots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionSpot'
  }],
  // current transactions waiting to be delivered to here
  unconfirm_transactions_from_warehouse: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  unconfirm_transactions_from_transaction_spot: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  // current transactions inside warehouse to deliver later
  inwarehouse_transactions_to_warehouse: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  inwarehouse_transactions_to_transaction_spot: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  // history of transactions received from other places
  received_transactions_history: [historySchema],
  // history of transactions sent to other places
  sent_transactions_history: [historySchema]
});

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

module.exports = Warehouse;
