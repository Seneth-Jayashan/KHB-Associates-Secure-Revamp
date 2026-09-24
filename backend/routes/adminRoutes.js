const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controller/admin'); // Make sure the path is correct

// Define your routes
router.get('/admins', authMiddleware(['admin']), adminController.getAdmin); 
router.get('/admin', authMiddleware(['admin']), adminController.getAdminById);
router.post('/signup', authMiddleware(['admin']), upload.single("profile_image"), adminController.addAdmin);
router.put('/updateadmin', authMiddleware(['admin']), upload.single("profile_image"), adminController.updateAdmin);
router.put('/updatepassword', authMiddleware(['admin']), adminController.updatePassword);

// Export the router instance
module.exports = router;
