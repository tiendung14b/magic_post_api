const mongoose = require('mongoose');

const deliverSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  transactions: [mongoose.Schema.Types.ObjectId],
  phone_number: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Deliver', deliverSchema);
