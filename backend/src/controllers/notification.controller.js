import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "../services/notification.service.js";

export const getNotificationsController = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await getUserNotifications(req.user.id, {
            page: Number(page),
            limit: Number(limit)
        });

        res.status(200).json({
            data: data.items,
            meta: {
                total: data.total,
                page: data.page,
                limit: data.limit
            }
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            message: "Failed to load notifications"
        });
    }
};

export const markNotificationReadController = async (req, res) => {
    try {
        const notification = await markNotificationRead(req.user.id, req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ data: notification });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({
            message: "Failed to update notification"
        });
    }
};

export const markAllNotificationsReadController = async (req, res) => {
    try {
        await markAllNotificationsRead(req.user.id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error marking notifications read:", error);
        res.status(500).json({
            message: "Failed to update notifications"
        });
    }
};
