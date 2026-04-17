import Notification from "../models/notification.model.js";

export const createNotification = async ({
    userId,
    actorId = null,
    type = "GENERAL",
    title,
    body,
    metadata = {}
}) => {
    const notification = await Notification.create({
        userId,
        actorId,
        type,
        title,
        body,
        metadata
    });

    return notification.get({ plain: true });
};

export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;

    const { rows, count } = await Notification.findAndCountAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });

    return {
        items: rows.map((notification) => notification.get({ plain: true })),
        total: count,
        page: Number(page),
        limit: Number(limit)
    };
};

export const markNotificationRead = async (userId, notificationId) => {
    const notification = await Notification.findOne({
        where: {
            id: notificationId,
            userId
        }
    });

    if (!notification) {
        return null;
    }

    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }

    return notification.get({ plain: true });
};

export const markAllNotificationsRead = async (userId) => {
    await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId, isRead: false } }
    );

    return { success: true };
};
