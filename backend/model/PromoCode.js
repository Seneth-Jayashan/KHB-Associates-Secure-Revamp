const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// PromoCode Schema
const promoCodeSchema = new Schema({
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Use existing model if already created, otherwise create a new one
const PromoCode = mongoose.models.promocodes || mongoose.model("promocodes", promoCodeSchema);

module.exports = PromoCode;
