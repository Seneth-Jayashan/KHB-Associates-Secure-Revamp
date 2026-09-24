const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const deliverController = require('../controller/deliver'); // Make sure the path is correct

// Define your routes
router.get('/delivers', authMiddleware(['admin']), deliverController.getDeliver); 
router.get('/deliver', authMiddleware(['admin', 'deliver']), deliverController.getDeliverById);
router.get('/deliveries', authMiddleware(['admin', 'deliver']), deliverController.getDeliveries);
router.get('/alldeliveries', authMiddleware(['admin', 'deliver']), deliverController.getAllDeliveries);
router.get('/deliverycount', authMiddleware(['admin']), deliverController.getDeliveryCount);
router.get('/analytics', authMiddleware(['admin']), deliverController.getDeliveryAnalytics);


router.post('/signup', authMiddleware(['admin']), upload.single("profile_image"), deliverController.addDeliver);

router.put('/updatedeliver', authMiddleware(['admin', 'deliver']), upload.single("profile_image"), deliverController.updateDeliver);
router.put('/updatepassword', authMiddleware(['admin', 'deliver']), deliverController.updatePassword);

router.put('/updateorderstatus/:order_id', authMiddleware(['admin', 'deliver']), deliverController.updateOrderStatus);

router.delete('/deletecount', authMiddleware(['admin']), deliverController.deleteStat);


// Export the router instance
module.exports = router;
