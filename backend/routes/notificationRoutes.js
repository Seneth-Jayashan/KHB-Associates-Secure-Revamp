const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification');
const authMiddleware = require('../middleware/authMiddleware');

// CWE-639: any authenticated role, but only for their OWN notifications (enforced in controller)
const anyRole = authMiddleware(['admin', 'customer', 'inventory_manager', 'customer_supporter', 'deliver']);

// Get notifications for a specific user
router.get('/user/:user_id', anyRole, notificationController.getNotificationsForUser);

// Delete a specific notification
router.delete('/:id', anyRole, notificationController.deleteNotification);

// Clear all notifications for a specific user
router.delete('/user/:user_id', anyRole, notificationController.clearNotificationsForUser);

module.exports = router;
