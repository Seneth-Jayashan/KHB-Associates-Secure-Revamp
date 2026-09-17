const express = require("express");
const router = express.Router();
const {
  createOTSalary,
  updateOTSalary,
  getAllOTSalary,
  deleteOTSalary,
} = require("../controller/salary");

// Create a new OT and Salary entry
router.post("/", createOTSalary);

// Update OT and Salary entry
router.put("/:id", updateOTSalary);

// Get all OT and Salary entries
router.get("/", getAllOTSalary);

// Delete OT and Salary entry
router.delete("/:id", deleteOTSalary);

module.exports = router;
