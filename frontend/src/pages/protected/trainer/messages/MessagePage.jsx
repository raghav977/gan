import React, { useEffect, useRef, useState } from "react";
import VideoCall from "./components/VideoCall"

const MOCK_CLIENTS = [
  { id: "1", name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "2", name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "3", name: "Mike Johnson", avatar: "https://randomuser.me/api/portraits/men/76.jpg" },
];

const MOCK_MESSAGES = {
  "1": [
    { id: "m1", from: "them", text: "Hey, ready for today's session?", ts: "2025-12-14T08:12:00Z" },
    { id: "m2", from: "me", text: "Yes — let's focus on legs.", ts: "2025-12-14T08:13:10Z" },
  ],
  "2": [
    { id: "m1", from: "them", text: "Sent my food diary.", ts: "2025-12-13T10:00:00Z" },
  ],
  "3": [],
};

export default function MessagePage() {
  const [clients] = useState(MOCK_CLIENTS);
  const [selected, setSelected] = useState(clients[0]);
  const [query, setQuery] = useState("");
  const [messagesMap, setMessagesMap] = useState(MOCK_MESSAGES);
  const [composer, setComposer] = useState("");
  const [callType, setCallType] = useState(null); // "video" | "audio" | null
  const listRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when selected or messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [selected, messagesMap[selected?.id]?.length]);

  const sendMessage = (e) => {
    e?.preventDefault();
    const text = composer.trim();
    if (!text) return;
    const id = Math.random().toString(36).slice(2, 9);
    const msg = { id, from: "me", text, ts: new Date().toISOString() };
    setMessagesMap((prev) => {
      const next = { ...prev };
      next[selected.id] = [...(next[selected.id] || []), msg];
      return next;
    });
    setComposer("");
    // simulate reply
    setTimeout(() => {
      const reply = {
        id: Math.random().toString(36).slice(2, 9),
        from: "them",
        text: `Got your message: "${text}"`,
        ts: new Date().toISOString(),
      };
      setMessagesMap((prev) => {
        const next = { ...prev };
        next[selected.id] = [...(next[selected.id] || []), reply];
        return next;
      });
    }, 700 + Math.random() * 900);
  };

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="h-screen flex bg-gray-100">
      {/* LEFT - Clients */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Messages</h2>
        </div>

        <div className="p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <ul className="overflow-auto divide-y flex-1">
          {filtered.map((c) => {
            const last = (messagesMap[c.id] || []).slice(-1)[0];
            return (
              <li
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                  selected.id === c.id ? "bg-gray-50" : ""
                }`}
              >
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-slate-400">{last ? new Date(last.ts).toLocaleTimeString() : ""}</div>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {last ? (last.from === "me" ? `You: ${last.text}` : last.text) : "No messages yet"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT - Chat */}
      <div className="flex-1 flex flex-col">
        {/* header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={selected.avatar} alt={selected.name} className="w-11 h-11 rounded-full object-cover" />
            <div>
              <div className="font-semibold">{selected.name}</div>
              <div className="text-xs text-slate-400">Last seen recently</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCallType("audio")}
              className="px-3 py-2 rounded-full bg-white border hover:bg-gray-50"
              title="Start audio call"
            >
              📞
            </button>
            <button
              onClick={() => setCallType("video")}
              className="px-3 py-2 rounded-full bg-white border hover:bg-gray-50"
              title="Start video call"
            >
              🎥
            </button>
          </div>
        </div>

        {/* messages area */}
        <div ref={listRef} className="flex-1 overflow-auto p-6 space-y-4">
          {(messagesMap[selected.id] || []).length === 0 && (
            <div className="text-center text-sm text-slate-400 mt-12">No messages yet. Say hello 👋</div>
          )}

          {(messagesMap[selected.id] || []).map((m) => {
            const isMe = m.from === "me";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-xl ${isMe ? "bg-blue-600 text-white" : "bg-white border"}`}
                >
                  <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                  <div className={`text-xs mt-2 ${isMe ? "text-blue-100" : "text-slate-400"} text-right`}>
                    {new Date(m.ts).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* composer */}
        <form onSubmit={sendMessage} className="bg-white border-t p-4 flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"
            onClick={() => alert("Attach not implemented")}
          >
            📎
          </button>

          <input
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 border rounded-full text-sm"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Send
          </button>
        </form>
      </div>

      {/* Video / Audio call modal (mock) */}
      {callType && (
        <VideoCall
          type={callType === "video" ? "video" : "audio"}
          trainer={{ name: selected.name }}
          onClose={() => setCallType(null)}
        />
      )}
    </div>
  );
}