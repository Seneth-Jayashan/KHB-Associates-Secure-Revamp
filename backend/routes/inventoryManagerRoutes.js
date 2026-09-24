const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const managerController = require('../controller/inventory_manager'); // Make sure the path is correct

// Define your routes
router.get('/managers', authMiddleware(['admin']), managerController.getInventoryManager); 
router.get('/manager', authMiddleware(['admin', 'inventory_manager']), managerController.getInventoryManagerById);
router.post('/signup', authMiddleware(['admin']), upload.single("profile_image"), managerController.addInventoryManager);
router.put('/updatemanager', authMiddleware(['admin', 'inventory_manager']), upload.single("profile_image"), managerController.updateInventoryManager);
router.put('/updatepassword', authMiddleware(['admin', 'inventory_manager']), managerController.updatePassword);

// Export the router instance
module.exports = router;
