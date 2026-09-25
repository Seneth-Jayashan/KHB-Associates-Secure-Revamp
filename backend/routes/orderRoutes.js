const express = require('express');
const router = express.Router();
const orderController = require('../controller/order');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Authorization (CWE-639): identity comes from the verified JWT (req.user);
// ownership of user/order resources is enforced in the controller.

// Create a new order (with payment slip upload) - customers only
router.post('/create', authMiddleware(['customer']), uploadMiddleware.single('payment_slip'), orderController.createOrder);

// Get orders for a specific user - owner (customer) or admin
router.get('/user/:user_id', authMiddleware(['customer', 'admin']), orderController.getUserOrders);

// Get all orders - admin only
router.get('/all', authMiddleware(['admin']), orderController.getAllOrders);

// Update order status - admin only
router.put('/update/:order_id', authMiddleware(['admin']), orderController.updateOrderStatus);

// Cancel an order - owner (customer) or admin
router.put('/cancel/:order_id', authMiddleware(['customer', 'admin']), orderController.cancelOrder);

// Get aggregated analytics data - admin only
router.get('/analytics', authMiddleware(['admin']), orderController.getAnalytics);

// Get order details by order ID - owner (customer), assigned deliver, or admin
router.get('/:order_id', authMiddleware(['customer', 'admin', 'deliver']), orderController.getOrderById);

// Get user order summary - owner (customer) or admin
router.get('/user/summary/:user_id', authMiddleware(['customer', 'admin']), orderController.getUserOrderSummary);


module.exports = router;
