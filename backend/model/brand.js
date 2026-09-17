const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter Schema to keep track of `brand_id`
const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.model("counter", counterSchema);

// brand Schema
const brandSchema = new Schema({
  brand_id: { type: Number, unique: true },
  brand_name: { type: String, required: true },
  brand_description: { type: String, required: true },
  brand_image: { type: String, required: true },
  brand_status: { type: String, enum: ['active', 'draft'], default: "active" },
  category_count: {type: Number, default:0},
  created_at: { type: Date, default: Date.now },
});

// Pre-save middleware to auto-increment `brand_id`
brandSchema.pre('save', async function (next) {
  if (!this.isNew) return next(); // Only run when creating a new document

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "brand_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create a new counter document if it doesn't exist
    );
    this.brand_id = counter.value; // Assign the incremented value to `brand_id`
    next();
  } catch (error) {
    next(error);
  }
});

const Brand = mongoose.model("brand", brandSchema);

module.exports = Brand;
