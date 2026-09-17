const OTSalary = require("../model/salary");

// Create a new OT and Salary entry
const createOTSalary = async (req, res) => {
  const { employeeId, otHours } = req.body;
  if (!employeeId || otHours === undefined) {
    return res.status(400).json({ message: "Employee ID and OT Hours are required." });
  }
  try {
    const newOTSalary = new OTSalary({ employeeId, otHours });
    const savedOTSalary = await newOTSalary.save();
    res.status(200).json(savedOTSalary);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Update OT and Salary entry
const updateOTSalary = async (req, res) => {
  const { otHours } = req.body;
  if (otHours === undefined) {
    return res.status(400).json({ message: "OT Hours are required." });
  }
  try {
    const updatedOTSalary = await OTSalary.findByIdAndUpdate(
      req.params.id,
      { otHours },
      { new: true }
    );
    if (!updatedOTSalary) return res.status(404).json({ message: "OT and Salary entry not found." });
    res.status(200).json(updatedOTSalary);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get all OT and Salary entries
const getAllOTSalary = async (req, res) => {
  try {
    const otSalaries = await OTSalary.find();
    res.status(200).json(otSalaries);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete OT and Salary entry
const deleteOTSalary = async (req, res) => {
  try {
    const otSalary = await OTSalary.findByIdAndDelete(req.params.id);
    if (!otSalary) return res.status(404).json({ message: "OT and Salary entry not found." });
    res.status(200).json({ message: "OT and Salary entry deleted successfully." });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createOTSalary,
  updateOTSalary,
  getAllOTSalary,
  deleteOTSalary,
};
