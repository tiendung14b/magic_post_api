const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  warehouse_id: {
    type: String,
    required: true,
    unique: true
  },
  transaction_spots: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  warehouse_manager: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  warehouse_employees: [mongoose.Schema.Types.ObjectId],
  shipment_transactions: [mongoose.Schema.Types.ObjectId],
  delivery_transactions: [mongoose.Schema.Types.ObjectId],
  unconfirm_transactions: [mongoose.Schema.Types.ObjectId]
});

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

module.exports = Warehouse;
