import {
    getOrCreateConversation,
    sendMessageService,
    getMessagesService,
    getConversationsService,
    markMessagesAsReadService,
    getUnreadCountService
} from "../services/chat.service.js";
import http from "../http/response.js";

// Get or create conversation
export const startConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return http.badRequest(res, "Other user ID is required");
        }

        const conversation = await getOrCreateConversation(userId, otherUserId);

        return http.ok(res, "Conversation retrieved", conversation);
    } catch (err) {
        console.error("Error in startConversation:", err);
        return http.serverError(res, "Failed to start conversation", err.message);
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { conversationId, receiverId, content, messageType } = req.body;

        if (!conversationId || !receiverId || !content) {
            return http.badRequest(res, "Conversation ID, receiver ID, and content are required");
        }

        const message = await sendMessageService(conversationId, senderId, receiverId, content, messageType);

        return http.created(res, "Message sent", message);
    } catch (err) {
        console.error("Error in sendMessage:", err);
        return http.serverError(res, "Failed to send message", err.message);
    }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const result = await getMessagesService(conversationId, parseInt(page), parseInt(limit));

        return http.ok(res, "Messages retrieved", result);
    } catch (err) {
        console.error("Error in getMessages:", err);
        return http.serverError(res, "Failed to get messages", err.message);
    }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await getConversationsService(userId);

        return http.ok(res, "Conversations retrieved", conversations);
    } catch (err) {
        console.error("Error in getConversations:", err);
        return http.serverError(res, "Failed to get conversations", err.message);
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        await markMessagesAsReadService(conversationId, userId);

        return http.ok(res, "Messages marked as read");
    } catch (err) {
        console.error("Error in markAsRead:", err);
        return http.serverError(res, "Failed to mark messages as read", err.message);
    }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await getUnreadCountService(userId);

        return http.ok(res, "Unread count retrieved", { count });
    } catch (err) {
        console.error("Error in getUnreadCount:", err);
        return http.serverError(res, "Failed to get unread count", err.message);
    }
};
