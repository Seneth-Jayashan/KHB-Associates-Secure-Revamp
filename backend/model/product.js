const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter Schema to keep track of `product_id`
const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.models.counter || mongoose.model("counter", counterSchema);

// brand Schema
const productSchema = new Schema({
  product_id: { type: Number, unique: true },
  product_name: { type: String, required: true },
  product_description: { type: String, required: true },
  product_status: { type: String, enum: ['active', 'draft'], default: "active" },
  product_price: { type: Number, required: true },
  product_image: { type: String, required: true },
  product_category_id: { type: Number, required: true },
  product_category_name: { type: String },
  product_brand_id: { type: Number, required: true },
  product_brand_name: { type: String },
  stock_count: {type: Number, default: 0},
  created_at: { type: Date, default: Date.now },
});

// Pre-save middleware to auto-increment `product_id`
productSchema.pre('save', async function (next) {
  if (!this.isNew) return next(); // Only run when creating a new document

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "product_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create a new counter document if it doesn't exist
    );
    this.product_id = counter.value; // Assign the incremented value to `product_id`
    next();
  } catch (error) {
    next(error);
  }
});

const Product = mongoose.model("product", productSchema);

module.exports = Product;
