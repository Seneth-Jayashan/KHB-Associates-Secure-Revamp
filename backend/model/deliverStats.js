const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverStatsSchema = new Schema({
  deliver_id: { type: String, required: true, unique: true },
  delivery_count: { type: Number, default: 0 },
});

const DeliverStats = mongoose.model('DeliverStats', deliverStatsSchema);
module.exports = DeliverStats;
