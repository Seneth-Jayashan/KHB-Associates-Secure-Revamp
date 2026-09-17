const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
  },
  customer_id: {
    type: String,
    required: true,
  },
  deliver_id: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Not Delivered','Delivered'],
    default: 'Not Delivered'
  }
});

module.exports = mongoose.model("Delivery", deliverySchema);



