const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification');
const Notification = require('../model/notification');

// Get notifications for a specific user
router.get('/user/:user_id', notificationController.getNotificationsForUser);

// Delete a specific notification
router.delete('/:id', notificationController.deleteNotification);

// Clear all notifications for a specific user
router.delete('/user/:user_id', notificationController.clearNotificationsForUser);

module.exports = router;