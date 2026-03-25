import { io } from 'socket.io-client';
import { store } from '../store/store';
import {
    setConnected,
    setOnlineUsers,
    updateUserOnline,
    addMessage,
    setTypingUser,
    setIncomingCall,
    setCallAccepted,
    setCallEnded,
    incrementUnreadCount
} from '../store/slices/chatSlice';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

let socket = null;

export const connectSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        store.dispatch(setConnected(true));
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
        store.dispatch(setConnected(false));
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        store.dispatch(setConnected(false));
    });

    // Online users
    socket.on('online-users', (users) => {
        store.dispatch(setOnlineUsers(users));
    });

    socket.on('user-online', ({ userId, online }) => {
        store.dispatch(updateUserOnline({ userId, online }));
    });

    // Messages
    socket.on('new-message', (message) => {
        store.dispatch(addMessage(message));
    });

    socket.on('message-notification', ({ conversationId, message }) => {
        const state = store.getState();
        // Only increment if not viewing this conversation
        if (state.chat.currentConversation?.id !== conversationId) {
            store.dispatch(incrementUnreadCount());
        }
    });

    socket.on('message-sent', (message) => {
        console.log('Message sent successfully:', message.id);
    });

    socket.on('message-error', ({ error }) => {
        console.error('Message error:', error);
    });

    // Typing indicators
    socket.on('user-typing', ({ userId, conversationId }) => {
        store.dispatch(setTypingUser({ conversationId, userId, isTyping: true }));
    });

    socket.on('user-stop-typing', ({ userId, conversationId }) => {
        store.dispatch(setTypingUser({ conversationId, userId, isTyping: false }));
    });

    // Video call events
    socket.on('incoming-call', ({ signal, from, callerName, callType }) => {
        store.dispatch(setIncomingCall({ signal, from, callerName, callType }));
    });

    socket.on('call-accepted', ({ signal }) => {
        store.dispatch(setCallAccepted(true));
        // Signal will be handled by the VideoCall component
        if (window.handleCallAccepted) {
            window.handleCallAccepted(signal);
        }
    });

    socket.on('call-rejected', () => {
        store.dispatch(setCallEnded(true));
    });

    socket.on('call-ended', () => {
        store.dispatch(setCallEnded(true));
    });

    socket.on('user-offline', ({ userId }) => {
        console.log('User is offline:', userId);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        store.dispatch(setConnected(false));
    }
};

export const getSocket = () => socket;

// Socket emit helpers
export const joinConversation = (conversationId) => {
    socket?.emit('join-conversation', conversationId);
};

export const leaveConversation = (conversationId) => {
    socket?.emit('leave-conversation', conversationId);
};

export const sendSocketMessage = (data) => {
    socket?.emit('send-message', data);
};

export const emitTyping = (conversationId, receiverId) => {
    socket?.emit('typing', { conversationId, receiverId });
};

export const emitStopTyping = (conversationId) => {
    socket?.emit('stop-typing', { conversationId });
};

export const markMessagesRead = (conversationId) => {
    socket?.emit('mark-read', { conversationId });
};

// Video call helpers
export const callUser = (userToCall, signalData, callerName, callType) => {
    const state = store.getState();
    socket?.emit('call-user', {
        userToCall,
        signalData,
        from: state.auth.user.id,
        callerName,
        callType
    });
};

export const answerCall = (to, signal) => {
    socket?.emit('answer-call', { to, signal });
};

export const rejectCall = (to) => {
    socket?.emit('reject-call', { to });
};

export const endCall = (to) => {
    socket?.emit('end-call', { to });
};

export const sendIceCandidate = (to, candidate) => {
    socket?.emit('ice-candidate', { to, candidate });
};
