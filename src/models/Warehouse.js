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
  shipment_transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  delivery_transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  unconfirm_transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

module.exports = Warehouse;
