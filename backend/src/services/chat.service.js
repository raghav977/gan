import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import user from "../models/usersModels.js";
import { Op } from "sequelize";

// Get or create conversation between two users
export const getOrCreateConversation = async (userId1, userId2) => {
    try {
        // Find existing conversation
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { participantOneId: userId1, participantTwoId: userId2 },
                    { participantOneId: userId2, participantTwoId: userId1 }
                ]
            }
        });

        // Create if doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                participantOneId: userId1,
                participantTwoId: userId2
            });
        }

        return conversation;
    } catch (err) {
        console.error("Error in getOrCreateConversation:", err);
        throw err;
    }
};

// Send a message
export const sendMessageService = async (conversationId, senderId, receiverId, content, messageType = 'text') => {
    try {
        const message = await Message.create({
            conversationId,
            senderId,
            receiverId,
            content,
            messageType
        });

        // Update conversation's lastMessageAt
        await Conversation.update(
            { lastMessageAt: new Date() },
            { where: { id: conversationId } }
        );

        // Fetch message with sender info
        const fullMessage = await Message.findByPk(message.id, {
            include: [
                {
                    model: user,
                    as: 'sender',
                    attributes: ['id', 'username', 'email']
                }
            ]
        });

        return fullMessage;
    } catch (err) {
        console.error("Error in sendMessageService:", err);
        throw err;
    }
};

// Get messages for a conversation
export const getMessagesService = async (conversationId, page = 1, limit = 50) => {
    try {
        const offset = (page - 1) * limit;

        const { rows, count } = await Message.findAndCountAll({
            where: { conversationId },
            include: [
                {
                    model: user,
                    as: 'sender',
                    attributes: ['id', 'username', 'email']
                }
            ],
            order: [['createdAt', 'ASC']],
            limit,
            offset
        });

        return {
            messages: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
    } catch (err) {
        console.error("Error in getMessagesService:", err);
        throw err;
    }
};

// Get all conversations for a user (only those with messages)
export const getConversationsService = async (userId) => {
    try {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { participantOneId: userId },
                    { participantTwoId: userId }
                ],
                // Only get conversations that have at least one message
                lastMessageAt: {
                    [Op.ne]: null
                }
            },
            include: [
                {
                    model: user,
                    as: 'participantOne',
                    attributes: ['id', 'username', 'email', 'role']
                },
                {
                    model: user,
                    as: 'participantTwo',
                    attributes: ['id', 'username', 'email', 'role']
                },
                {
                    model: Message,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: user,
                            as: 'sender',
                            attributes: ['id', 'username']
                        }
                    ]
                }
            ],
            order: [['lastMessageAt', 'DESC']]
        });

        // Filter out conversations that have no messages
        const conversationsWithMessages = conversations.filter(conv => conv.messages && conv.messages.length > 0);

        // Get unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversationsWithMessages.map(async (conv) => {
                const unreadCount = await Message.count({
                    where: {
                        conversationId: conv.id,
                        receiverId: userId,
                        isRead: false
                    }
                });

                // Get the other participant
                const otherParticipant = conv.participantOneId === userId
                    ? conv.participantTwo
                    : conv.participantOne;

                return {
                    id: conv.id,
                    otherParticipant,
                    lastMessage: conv.messages[0] || null,
                    lastMessageAt: conv.lastMessageAt,
                    unreadCount
                };
            })
        );

        return conversationsWithUnread;
    } catch (err) {
        console.error("Error in getConversationsService:", err);
        throw err;
    }
};

// Mark messages as read
export const markMessagesAsReadService = async (conversationId, userId) => {
    try {
        await Message.update(
            { isRead: true, readAt: new Date() },
            {
                where: {
                    conversationId,
                    receiverId: userId,
                    isRead: false
                }
            }
        );
        return { success: true };
    } catch (err) {
        console.error("Error in markMessagesAsReadService:", err);
        throw err;
    }
};

// Get unread message count for a user
export const getUnreadCountService = async (userId) => {
    try {
        const count = await Message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
        return count;
    } catch (err) {
        console.error("Error in getUnreadCountService:", err);
        throw err;
    }
};
