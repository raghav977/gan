import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MdVideoCall, MdCall, MdSend, MdSearch, MdArrowBack } from "react-icons/md";
import { selectUser } from "../../../../store/slices/authSlice";
import {
    selectConversations,
    selectMessages,
    selectOnlineUsers,
    selectTypingUsers,
    selectCurrentConversation,
    setConversations,
    setMessages,
    setCurrentConversation,
} from "../../../../store/slices/chatSlice";
import {
    joinConversation,
    leaveConversation,
    sendSocketMessage,
    emitTyping,
    emitStopTyping,
    markMessagesRead
} from "../../../../services/socket.service";
import { getConversations, getMessages } from "../../../../api/chat.api";
import VideoCallModal from "../../../../components/chat/VideoCallModal";
import Header from "../../../../components/Header";

export default function UserMessagePage() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const conversations = useSelector(selectConversations);
    const messages = useSelector(selectMessages);
    const onlineUsers = useSelector(selectOnlineUsers);
    const typingUsers = useSelector(selectTypingUsers);
    const currentConversation = useSelector(selectCurrentConversation);

    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState("");
    const [composer, setComposer] = useState("");
    const [loading, setLoading] = useState(true);
    const [callType, setCallType] = useState(null);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const listRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const result = await getConversations();
                dispatch(setConversations(result.data || []));
            } catch (err) {
                console.error("Error fetching conversations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [dispatch]);

    // Handle conversation selection
    const handleSelectConversation = async (conv) => {
        // Leave previous conversation room
        if (currentConversation) {
            leaveConversation(currentConversation.id);
        }

        setSelected(conv);
        setMobileShowChat(true);
        dispatch(setCurrentConversation(conv));
        joinConversation(conv.id);

        // Fetch messages for this conversation
        try {
            const result = await getMessages(conv.id);
            dispatch(setMessages(result.data.messages || []));
            markMessagesRead(conv.id);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (!selected) return;

        emitTyping(selected.id, selected.otherParticipant?.id);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(selected.id);
        }, 2000);
    }, [selected]);

    // Send message
    const sendMessage = (e) => {
        e?.preventDefault();
        const text = composer.trim();
        if (!text || !selected) return;

        emitStopTyping(selected.id);

        sendSocketMessage({
            conversationId: selected.id,
            receiverId: selected.otherParticipant?.id,
            content: text,
            messageType: "text"
        });

        setComposer("");
    };

    // Start call
    const handleStartCall = (type) => {
        setCallType(type);
        setShowVideoCall(true);
    };

    // Back to conversation list (mobile)
    const handleBack = () => {
        setMobileShowChat(false);
        setSelected(null);
        dispatch(setCurrentConversation(null));
    };

    // Filter conversations by search
    const filtered = conversations.filter((c) =>
        c.otherParticipant?.username?.toLowerCase().includes(query.toLowerCase())
    );

    // Check if the other participant is online
    const isOnline = (userId) => onlineUsers.includes(userId);

    // Check if someone is typing in the current conversation
    const isTyping = selected && typingUsers[selected.id];

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT - Conversations List */}
                <div className={`w-full md:w-80 bg-white border-r flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-lg">Messages</h2>
                    </div>

                    <div className="p-3">
                        <div className="relative">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
                            <div className="text-6xl mb-4">💬</div>
                            <p className="text-center">No conversations yet</p>
                            <p className="text-sm text-center mt-2">Start a conversation with a trainer from their profile</p>
                        </div>
                    ) : (
                        <ul className="overflow-auto divide-y flex-1">
                            {filtered.map((conv) => {
                                const other = conv.otherParticipant;
                                const lastMsg = conv.lastMessage;
                                const online = isOnline(other?.id);

                                return (
                                    <li
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${
                                            selected?.id === conv.id ? "bg-yellow-50" : ""
                                        }`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                                                {other?.username?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            {online && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium truncate">{other?.username || "Trainer"}</div>
                                                <div className="text-xs text-gray-400">
                                                    {lastMsg?.createdAt
                                                        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                                              hour: "2-digit",
                                                              minute: "2-digit"
                                                          })
                                                        : ""}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-500 truncate">
                                                    {lastMsg
                                                        ? lastMsg.senderId === user?.id
                                                            ? `You: ${lastMsg.content}`
                                                            : lastMsg.content
                                                        : "No messages yet"}
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* RIGHT - Chat Area */}
                <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
                    {!selected ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="bg-white border-b p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Back button for mobile */}
                                    <button
                                        onClick={handleBack}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <MdArrowBack size={24} />
                                    </button>
                                    
                                    <div className="relative">
                                        <div className="w-11 h-11 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                                            {selected.otherParticipant?.username?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        {isOnline(selected.otherParticipant?.id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold">
                                            {selected.otherParticipant?.username || "Trainer"}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {isOnline(selected.otherParticipant?.id)
                                                ? "Online"
                                                : "Offline"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleStartCall("audio")}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                                        title="Audio call"
                                    >
                                        <MdCall size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleStartCall("video")}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                                        title="Video call"
                                    >
                                        <MdVideoCall size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div ref={listRef} className="flex-1 overflow-auto p-4 md:p-6 space-y-4 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="text-center text-sm text-gray-400 mt-12">
                                        No messages yet. Say hello! 👋
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.senderId === user?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] md:max-w-[70%] p-3 rounded-2xl ${
                                                        isMe
                                                            ? "bg-yellow-500 text-white rounded-br-md"
                                                            : "bg-white border rounded-bl-md shadow-sm"
                                                    }`}
                                                >
                                                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                                    <div
                                                        className={`text-xs mt-2 ${
                                                            isMe ? "text-yellow-100" : "text-gray-400"
                                                        } text-right`}
                                                    >
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                                        </div>
                                        <span>Typing...</span>
                                    </div>
                                )}
                            </div>

                            {/* Composer */}
                            <form onSubmit={sendMessage} className="bg-white border-t p-4 flex items-center gap-3">
                                <input
                                    value={composer}
                                    onChange={(e) => {
                                        setComposer(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!composer.trim()}
                                    className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <MdSend size={20} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Video Call Modal */}
            {showVideoCall && selected && (
                <VideoCallModal
                    trainer={{
                        userId: selected.otherParticipant?.id,
                        username: selected.otherParticipant?.username
                    }}
                    callType={callType}
                    onClose={() => {
                        setShowVideoCall(false);
                        setCallType(null);
                    }}
                />
            )}
        </div>
    );
}
