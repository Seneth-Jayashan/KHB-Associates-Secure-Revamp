const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// stock Schema
const stockSchema = new Schema({
  product_id: { type: Number, required: true },
  product_name: {type: String, required: true},
  brand_id: {type: Number, required: true},
  category_id: {type: Number , required: true},
  change_date: {type: Date, default: Date.now},
  quantity: { type: Number, required: true },
  type: {type: String, enum:["add", "remove","sold"], default:"add"}
});

const Stock = mongoose.model("stock", stockSchema);

module.exports = Stock;
