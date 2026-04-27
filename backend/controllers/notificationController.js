const Notification = require('../models/Notification');
const AdminNotification = require('../models/AdminNotification');

// @desc    Get notifications
const getNotifications = async (req, res) => {
    try {
        const { id, role } = req.user;
        let data;

        if (role === 'super_admin' || role === 'admin') {
            data = await AdminNotification.find().sort({ createdAt: -1 }).limit(50);
        } else {
            data = await Notification.find({ user_id: id }).sort({ createdAt: -1 }).limit(50);
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark read
const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const Model = (role === 'super_admin' || role === 'admin') ? AdminNotification : Notification;
        
        await Model.findByIdAndUpdate(id, { is_read: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotifications, markRead };
