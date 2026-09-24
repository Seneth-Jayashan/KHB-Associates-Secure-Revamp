const express = require("express");
const router = express.Router();
const {
  createOTSalary,
  updateOTSalary,
  getAllOTSalary,
  deleteOTSalary,
} = require("../controller/salary");
const authMiddleware = require('../middleware/authMiddleware');

// Create a new OT and Salary entry
router.post("/", authMiddleware(['admin']), createOTSalary);

// Update OT and Salary entry
router.put("/:id", authMiddleware(['admin']), updateOTSalary);

// Get all OT and Salary entries
router.get("/", authMiddleware(['admin']), getAllOTSalary);

// Delete OT and Salary entry
router.delete("/:id", authMiddleware(['admin']), deleteOTSalary);

module.exports = router;
