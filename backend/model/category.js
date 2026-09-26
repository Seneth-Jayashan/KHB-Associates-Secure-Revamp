const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter Schema to keep track of `category_id`
const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.models.counter || mongoose.model("counter", counterSchema);


// Category Schema
const categorySchema = new Schema({
  category_id: { type: Number, unique: true },
  category_name: { type: String, required: true },
  category_description: { type: String, required: true },
  category_image: { type: String, required: true },
  category_brand_id: {type: Number, required: true},
  category_brand_name: {type: String},
  category_status: { type: String,enum: ['active', 'inactive'], default: "active" },
  product_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

// Pre-save middleware to auto-increment `category_id`
categorySchema.pre('save', async function (next) {
  if (!this.isNew) return next(); // Only run when creating a new document

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "category_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create a new counter document if it doesn't exist
    );
    this.category_id = counter.value; // Assign the incremented value to `category_id`
    next();
  } catch (error) {
    next(error);
  }
});

const Category = mongoose.model("category", categorySchema);

module.exports = Category;
