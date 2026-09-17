const mongoose = require("mongoose");

const otSalarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  otHours: {
    type: Number,
    required: true,
    default: 0,
  },
  salary: {
    type: Number,
    required: true,
    default: function () {
      return 30000 + this.otHours * 200; // Basic salary + OT (200 per hour)
    },
  },
});

otSalarySchema.pre("save", function (next) {
  this.salary = 30000 + this.otHours * 200; // Recalculate salary before saving
  next();
});

otSalarySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.otHours !== undefined) {
    update.salary = 30000 + update.otHours * 200; // Recalculate salary before updating
  }
  next();
});

module.exports = mongoose.model("OTSalary", otSalarySchema);
