import express from "express";
import {
    startConversation,
    sendMessage,
    getMessages,
    getConversations,
    markAsRead,
    getUnreadCount
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all conversations for current user
router.get("/conversations", getConversations);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Start/get a conversation with another user
router.post("/conversation", startConversation);

// Get messages for a conversation
router.get("/conversation/:conversationId/messages", getMessages);

// Mark messages as read
router.put("/conversation/:conversationId/read", markAsRead);

// Send a message (REST fallback, mainly use socket)
router.post("/message", sendMessage);

export default router;
