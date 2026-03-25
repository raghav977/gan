import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Get all conversations for current user
export const getConversations = async () => {
    const response = await axios.get(
        `${API_URL}/api/chat/conversations`,
        getAuthHeaders()
    );
    return response.data;
};

// Start or get a conversation with another user
export const startConversation = async (otherUserId) => {
    const response = await axios.post(
        `${API_URL}/api/chat/conversation`,
        { otherUserId },
        getAuthHeaders()
    );
    return response.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
    const response = await axios.get(
        `${API_URL}/api/chat/conversation/${conversationId}/messages?page=${page}&limit=${limit}`,
        getAuthHeaders()
    );
    return response.data;
};

// Mark messages as read
export const markAsRead = async (conversationId) => {
    const response = await axios.put(
        `${API_URL}/api/chat/conversation/${conversationId}/read`,
        {},
        getAuthHeaders()
    );
    return response.data;
};

// Get unread message count
export const getUnreadCount = async () => {
    const response = await axios.get(
        `${API_URL}/api/chat/unread-count`,
        getAuthHeaders()
    );
    return response.data;
};

// Send message via REST (fallback if socket fails)
export const sendMessageRest = async (conversationId, receiverId, content, messageType = 'text') => {
    const response = await axios.post(
        `${API_URL}/api/chat/message`,
        { conversationId, receiverId, content, messageType },
        getAuthHeaders()
    );
    return response.data;
};
