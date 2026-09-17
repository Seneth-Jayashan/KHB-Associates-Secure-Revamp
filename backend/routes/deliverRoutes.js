const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware');
const deliverController = require('../controller/deliver'); // Make sure the path is correct

// Define your routes
router.get('/delivers', deliverController.getDeliver); 
router.get('/deliver',deliverController.getDeliverById);
router.get('/deliveries', deliverController.getDeliveries);
router.get('/alldeliveries', deliverController.getAllDeliveries);
router.get('/deliverycount', deliverController.getDeliveryCount);
router.get('/analytics', deliverController.getDeliveryAnalytics);


router.post('/signup', upload.single("profile_image"), deliverController.addDeliver);

router.put('/updatedeliver', upload.single("profile_image"), deliverController.updateDeliver);
router.put('/updatepassword', deliverController.updatePassword);

router.put('/updateorderstatus/:order_id', deliverController.updateOrderStatus);

router.delete('/deletecount', deliverController.deleteStat);


// Export the router instance
module.exports = router;
