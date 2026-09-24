const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const supporterController = require('../controller/customerSupporter'); // Make sure the path is correct

// Define your routes
router.get('/supporters', authMiddleware(['admin']), supporterController.getCustomerSupporter); 
router.get('/supporter', authMiddleware(['admin', 'customer_supporter']), supporterController.getCustomerSupporterById);
router.post('/signup', authMiddleware(['admin']), upload.single("profile_image"), supporterController.addCustomerSupporter);
router.put('/updatesupporter', authMiddleware(['admin', 'customer_supporter']), upload.single("profile_image"), supporterController.updateCustomerSupporter);
router.put('/updatepassword', authMiddleware(['admin', 'customer_supporter']), supporterController.updatePassword);

// Export the router instance
module.exports = router;
