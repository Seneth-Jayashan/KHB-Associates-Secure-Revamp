// userRoutes.js
const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const customerController = require('../controller/customer'); // Make sure the path is correct

// Define your routes
router.get('/users', authMiddleware(['admin']), customerController.getCustomers); 
router.get('/user', authMiddleware(['admin', 'customer']), customerController.getCustomerById);
router.post('/signup', upload.single("profile_image"), customerController.addCustomer);
router.put('/updatecustomer', authMiddleware(['admin', 'customer']), upload.single("profile_image"), customerController.updateCustomer);
router.put('/updatepassword', authMiddleware(['admin', 'customer']), customerController.updatePassword);

router.get('/customer' , authMiddleware(['admin', 'customer']), customerController.getCustomerNameById);

router.delete('/delete', authMiddleware(['admin', 'customer']), customerController.deleteCustomer);

// Export the router instance
module.exports = router;
