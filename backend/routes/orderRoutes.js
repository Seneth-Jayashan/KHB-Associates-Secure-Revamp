const express = require('express');
const router = express.Router();
const orderController = require('../controller/order');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Create a new order (with payment slip upload)
router.post('/create', authMiddleware(['customer']), uploadMiddleware.single('payment_slip'), orderController.createOrder);

// Get orders for a specific user
router.get('/user/:user_id', authMiddleware(['customer']), orderController.getUserOrders);

// Get all orders 
router.get('/all', authMiddleware(['admin', 'inventory_manager']), orderController.getAllOrders);

// Update order status 
router.put('/update/:order_id', authMiddleware(['admin', 'inventory_manager', 'deliver']), orderController.updateOrderStatus);

// Cancel an order
router.put('/cancel/:order_id', authMiddleware(['customer', 'admin']), orderController.cancelOrder);

// Get aggregated analytics data (Admin)
router.get('/analytics', authMiddleware(['admin']), orderController.getAnalytics);

// Get order details by order ID
router.get('/:order_id', authMiddleware(['customer', 'admin', 'inventory_manager', 'deliver']), orderController.getOrderById);

// Get user order summary
router.get('/user/summary/:user_id', authMiddleware(['customer']), orderController.getUserOrderSummary);  // New route for order summary


module.exports = router;
