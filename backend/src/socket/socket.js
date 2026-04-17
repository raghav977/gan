import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMessageService, markMessagesAsReadService } from "../services/chat.service.js";
import { createNotification } from "../services/notification.service.js";

dotenv.config();

// Store online users: { userId: socketId }
const onlineUsers = new Map();
let ioInstance = null;

export const emitNotificationEvent = (userId, notification) => {
    if (!ioInstance || !notification) return;
    ioInstance.to(`user-${userId}`).emit("notification:new", notification);
};

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    ioInstance = io;

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            // Use SECRET_KEY to match the token generation in validation.js
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            console.error("Socket auth error:", err.message);
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId} (${socket.userRole})`);

        // Add user to online users map
        onlineUsers.set(userId, socket.id);

        // Join user's personal room (user-{userId})
        socket.join(`user-${userId}`);

        // Broadcast online status
        io.emit("user-online", { userId, online: true });

        // Send list of online users to the connected user
        socket.emit("online-users", Array.from(onlineUsers.keys()));

        // Handle joining a conversation room
        socket.on("join-conversation", (conversationId) => {
            socket.join(`conversation-${conversationId}`);
            console.log(`User ${userId} joined conversation ${conversationId}`);
        });

        // Handle leaving a conversation room
        socket.on("leave-conversation", (conversationId) => {
            socket.leave(`conversation-${conversationId}`);
            console.log(`User ${userId} left conversation ${conversationId}`);
        });

        // Handle sending a message
        socket.on("send-message", async (data) => {
            try {
                const { conversationId, receiverId, content, messageType = 'text' } = data;

                // Save message to database
                const message = await sendMessageService(
                    conversationId,
                    userId,
                    receiverId,
                    content,
                    messageType
                );

                // Emit to the conversation room
                io.to(`conversation-${conversationId}`).emit("new-message", message);

                // Persist notification for the receiver
                const notification = await createNotification({
                    userId: receiverId,
                    actorId: userId,
                    type: "MESSAGE",
                    title: "New message",
                    body: `${message?.sender?.username || "Someone"} sent you a message`,
                    metadata: {
                        conversationId,
                        messageId: message.id
                    }
                });

                // Emit socket notification + legacy message notification event
                emitNotificationEvent(receiverId, notification);
                io.to(`user-${receiverId}`).emit("message-notification", {
                    conversationId,
                    message
                });

                // Confirm to sender
                socket.emit("message-sent", message);

            } catch (err) {
                console.error("Error sending message:", err);
                socket.emit("message-error", { error: err.message });
            }
        });

        // Handle typing indicator
        socket.on("typing", ({ conversationId, receiverId }) => {
            socket.to(`conversation-${conversationId}`).emit("user-typing", {
                userId,
                conversationId
            });
        });

        // Handle stop typing
        socket.on("stop-typing", ({ conversationId }) => {
            socket.to(`conversation-${conversationId}`).emit("user-stop-typing", {
                userId,
                conversationId
            });
        });

        // Handle marking messages as read
        socket.on("mark-read", async ({ conversationId }) => {
            try {
                await markMessagesAsReadService(conversationId, userId);
                
                // Notify the other user that messages have been read
                io.to(`conversation-${conversationId}`).emit("messages-read", {
                    conversationId,
                    readBy: userId
                });
            } catch (err) {
                console.error("Error marking messages as read:", err);
            }
        });

        // Handle video call signaling
        socket.on("call-user", ({ userToCall, signalData, from, callerName, callType }) => {
            const receiverSocketId = onlineUsers.get(userToCall);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("incoming-call", {
                    signal: signalData,
                    from,
                    callerName,
                    callType
                });
            } else {
                socket.emit("user-offline", { userId: userToCall });
            }
        });

        // Handle answering a call
        socket.on("answer-call", ({ to, signal }) => {
            const callerSocketId = onlineUsers.get(to);
            if (callerSocketId) {
                io.to(callerSocketId).emit("call-accepted", { signal });
            }
        });

        // Handle call rejection
        socket.on("reject-call", ({ to }) => {
            const callerSocketId = onlineUsers.get(to);
            if (callerSocketId) {
                io.to(callerSocketId).emit("call-rejected");
            }
        });

        // Handle ending a call
        socket.on("end-call", ({ to }) => {
            const otherSocketId = onlineUsers.get(to);
            if (otherSocketId) {
                io.to(otherSocketId).emit("call-ended");
            }
        });

        // Handle ICE candidates
        socket.on("ice-candidate", ({ to, candidate }) => {
            const receiverSocketId = onlineUsers.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("ice-candidate", { candidate, from: userId });
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
            onlineUsers.delete(userId);
            io.emit("user-online", { userId, online: false });
        });
    });

    return io;
};

// Helper to check if a user is online
export const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};

// Helper to get socket ID for a user
export const getSocketId = (userId) => {
    return onlineUsers.get(userId);
};

