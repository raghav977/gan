import React, { useEffect, useRef, useState } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [callType, setCallType] = useState(null); // "audio" | "video"

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Send message
  const sendMessage = () => {
    if (!text.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), text, own: true }
    ]);
    setText("");
  };

  // Start audio or video call
  const startCall = async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video"
      });

      streamRef.current = stream;
      setCallType(type);

      if (type === "video") {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Permission denied");
    }
  };

  // End call
  const endCall = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCallType(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-3 flex justify-between items-center">
        <h2 className="font-semibold">Chat Test</h2>
        <div className="space-x-3">
          <button onClick={() => startCall("audio")}>📞</button>
          <button onClick={() => startCall("video")}>🎥</button>
        </div>
      </div>

      {/* Video Preview */}
      {callType === "video" && (
        <div className="bg-black flex justify-center p-2">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-64 rounded-md"
          />
        </div>
      )}

      {/* Audio Call Indicator */}
      {callType === "audio" && (
        <div className="bg-green-100 text-green-700 p-2 text-center">
          🎧 Audio Call Active
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.own ? "justify-end" : "justify-start"}`}
          >
            <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-xs">
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-full"
        >
          Send
        </button>
      </div>

      {/* End Call Button */}
      {callType && (
        <button
          onClick={endCall}
          className="absolute bottom-20 right-4 bg-red-500 text-white px-4 py-2 rounded-full"
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default Chat;
