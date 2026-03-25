import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    socket: null,
    isConnected: false,
    conversations: [],
    currentConversation: null,
    messages: [],
    onlineUsers: [],
    unreadCount: 0,
    typingUsers: {},
    // Video call state
    incomingCall: null,
    callAccepted: false,
    callEnded: false,
    loading: false,
    error: null
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        setConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action) => {
            const exists = state.conversations.find(c => c.id === action.payload.id);
            if (!exists) {
                state.conversations.unshift(action.payload);
            }
        },
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            const exists = state.messages.find(m => m.id === action.payload.id);
            if (!exists) {
                state.messages.push(action.payload);
            }
            // Update conversation's last message
            const convIndex = state.conversations.findIndex(
                c => c.id === action.payload.conversationId
            );
            if (convIndex !== -1) {
                state.conversations[convIndex].lastMessage = action.payload;
                // Move to top
                const [conv] = state.conversations.splice(convIndex, 1);
                state.conversations.unshift(conv);
            }
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        updateUserOnline: (state, action) => {
            const { userId, online } = action.payload;
            if (online) {
                if (!state.onlineUsers.includes(userId)) {
                    state.onlineUsers.push(userId);
                }
            } else {
                state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
            }
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        decrementUnreadCount: (state, action) => {
            state.unreadCount = Math.max(0, state.unreadCount - (action.payload || 1));
        },
        setTypingUser: (state, action) => {
            const { conversationId, userId, isTyping } = action.payload;
            if (isTyping) {
                state.typingUsers[conversationId] = userId;
            } else {
                delete state.typingUsers[conversationId];
            }
        },
        // Video call reducers
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload;
        },
        setCallAccepted: (state, action) => {
            state.callAccepted = action.payload;
        },
        setCallEnded: (state, action) => {
            state.callEnded = action.payload;
            state.incomingCall = null;
            state.callAccepted = false;
        },
        resetCall: (state) => {
            state.incomingCall = null;
            state.callAccepted = false;
            state.callEnded = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        resetChat: (state) => {
            return { ...initialState };
        }
    }
});

export const {
    setSocket,
    setConnected,
    setConversations,
    addConversation,
    setCurrentConversation,
    setMessages,
    addMessage,
    setOnlineUsers,
    updateUserOnline,
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    setTypingUser,
    setIncomingCall,
    setCallAccepted,
    setCallEnded,
    resetCall,
    setLoading,
    setError,
    resetChat
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectSocket = (state) => state.chat.socket;
export const selectIsConnected = (state) => state.chat.isConnected;
export const selectConversations = (state) => state.chat.conversations;
export const selectCurrentConversation = (state) => state.chat.currentConversation;
export const selectMessages = (state) => state.chat.messages;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectUnreadCount = (state) => state.chat.unreadCount;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectIncomingCall = (state) => state.chat.incomingCall;
export const selectCallAccepted = (state) => state.chat.callAccepted;
export const selectCallEnded = (state) => state.chat.callEnded;
