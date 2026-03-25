import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MdVideoCall, MdCall, MdSend, MdClose } from "react-icons/md";
import { selectIsAuthenticated, selectUser } from "../../store/slices/authSlice";
import {
    selectMessages,
    selectOnlineUsers,
    selectTypingUsers,
    setMessages,
    setCurrentConversation,
} from "../../store/slices/chatSlice";
import {
    joinConversation,
    leaveConversation,
    sendSocketMessage,
    emitTyping,
    emitStopTyping,
    markMessagesRead
} from "../../services/socket.service";
import { startConversation, getMessages } from "../../api/chat.api";
import PleaseLogin from "../PleaseLogin";
import VideoCallModal from "./VideoCallModal";

function ChatModal({ trainer, onClose }) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const messages = useSelector(selectMessages);
    const onlineUsers = useSelector(selectOnlineUsers);
    const typingUsers = useSelector(selectTypingUsers);

    const [conversation, setConversation] = useState(null);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [callType, setCallType] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const isTrainerOnline = onlineUsers.includes(trainer?.userId);
    const isTyping = conversation && typingUsers[conversation.id];

    // Initialize conversation
    useEffect(() => {
        const initConversation = async () => {
            if (!isAuthenticated || !trainer?.userId) {
                console.log("Cannot init conversation:", { isAuthenticated, trainerId: trainer?.userId });
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("Starting conversation with trainer:", trainer.userId);
                const result = await startConversation(trainer.userId);
                console.log("Conversation result:", result);
                setConversation(result.data);
                dispatch(setCurrentConversation(result.data));

                joinConversation(result.data.id);

                const messagesResult = await getMessages(result.data.id);
                dispatch(setMessages(messagesResult.data.messages || []));

                markMessagesRead(result.data.id);
            } catch (err) {
                console.error("Error initializing conversation:", err);
                // Still set loading to false even on error
            } finally {
                setLoading(false);
            }
        };

        initConversation();

        return () => {
            if (conversation) {
                leaveConversation(conversation.id);
                dispatch(setCurrentConversation(null));
            }
        };
    }, [isAuthenticated, trainer?.userId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleTyping = useCallback(() => {
        if (!conversation) return;

        emitTyping(conversation.id, trainer.userId);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(conversation.id);
        }, 2000);
    }, [conversation, trainer?.userId]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const text = inputText.trim();
        if (!text || !conversation || sending) return;

        setSending(true);
        emitStopTyping(conversation.id);

        try {
            sendSocketMessage({
                conversationId: conversation.id,
                receiverId: trainer.userId,
                content: text,
                messageType: "text"
            });

            setInputText("");
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

    const handleStartCall = (type) => {
        setCallType(type);
        setShowVideoCall(true);
    };

    if (!isAuthenticated) {
        return <PleaseLogin message="Please login to chat with trainers" />;
    }

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 w-96 h-125 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-linear-to-r from-yellow-500 to-yellow-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                {trainer?.username?.[0]?.toUpperCase() || "T"}
                            </div>
                            {isTrainerOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold">{trainer?.username || "Trainer"}</h3>
                            <p className="text-xs opacity-80">
                                {isTrainerOnline ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleStartCall("audio")}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                            title="Audio Call"
                        >
                            <MdCall size={20} />
                        </button>
                        <button
                            onClick={() => handleStartCall("video")}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                            title="Video Call"
                        >
                            <MdVideoCall size={24} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <MdClose size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>No messages yet. Say hello! 👋</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-3/4 px-4 py-2 rounded-2xl ${
                                                isMe
                                                    ? "bg-yellow-500 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                                            }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    isMe ? "text-yellow-100" : "text-gray-400"
                                                }`}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}

                    {isTyping && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                            <span>Typing...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                if (conversation) handleTyping();
                            }}
                            placeholder={loading ? "Connecting..." : "Type a message..."}
                            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || sending || !conversation || loading}
                            className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <MdSend size={20} />
                        </button>
                    </div>
                </form>
            </div>

            {showVideoCall && (
                <VideoCallModal
                    trainer={trainer}
                    callType={callType}
                    onClose={() => {
                        setShowVideoCall(false);
                        setCallType(null);
                    }}
                />
            )}
        </>
    );
}

export default ChatModal;