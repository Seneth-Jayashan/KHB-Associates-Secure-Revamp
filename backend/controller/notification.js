const mongoose = require('mongoose');
const Notification = require('../model/notification');

// --- Authorization (CWE-639) ---
// Notifications belong to the authenticated user (req.user.id from the JWT).
const FORBIDDEN = { message: 'Access denied. You do not have permission' };
const isNotOwner = (req, userId) => Number(userId) !== Number(req.user.id);

// Get Notifications for a Specific User
exports.getNotificationsForUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (isNotOwner(req, user_id)) return res.status(403).json(FORBIDDEN);

    const notifications = await Notification.find({ user_id: Number(user_id) }).sort({ created_at: -1 });

    if (!notifications.length) {
      return res.status(404).json({ message: 'No notifications found for this user.' });
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ getNotificationsForUser Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a Specific Notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification id.' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    if (isNotOwner(req, notification.user_id)) return res.status(403).json(FORBIDDEN);

    await notification.deleteOne();

    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('❌ deleteNotification Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Clear All Notifications for a Specific User
exports.clearNotificationsForUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (isNotOwner(req, user_id)) return res.status(403).json(FORBIDDEN);

    const result = await Notification.deleteMany({ user_id: Number(user_id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No notifications found for this user to delete.' });
    }

    res.status(200).json({ message: 'All notifications cleared successfully.' });
  } catch (error) {
    console.error('❌ clearNotificationsForUser Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
