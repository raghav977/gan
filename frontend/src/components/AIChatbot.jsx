import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { TbMessageChatbot } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { FiSend } from "react-icons/fi";
import { sendChatbotMessage } from "../api/chatbot";

const quickPrompts = [
  "How do I enroll in a course?",
  "What payment methods do you accept?",
  "Tell me about trainer support",
  "How can I track my progress?"
];

const knowledgeBase = [
  {
    keywords: ["course", "enroll", "enrollment"],
    response:
      "To enroll, open the course detail page and hit the yellow enroll button. If you're already logged in, you'll see the eSewa checkout right away; otherwise, create an account first."
  },
  {
    keywords: ["product", "gear", "shop"],
    response:
      "Product purchases happen through your cart. Add any item, head to My Products > Cart, and proceed with the secure eSewa payment link to finish checkout."
  },
  {
    keywords: ["payment", "esewa", "refund"],
    response:
      "We currently accept eSewa. Once the green success screen appears, we automatically verify the transaction and unlock your items. For help with refunds, share the transaction UUID with support."
  },
  {
    keywords: ["trainer", "mentor", "support"],
    response:
      "Every enrolled learner can chat with assigned trainers, submit tasks, and get feedback inside the dashboard's Trainers and Todos sections."
  },
  {
    keywords: ["progress", "dashboard", "track"],
    response:
      "Visit Dashboard > My Courses to resume lectures, review completion stats, and access any pending assignments from your trainers."
  }
];

const defaultResponse =
  "I'm here to help with courses, trainers, and payments. Try asking about enrolling, purchasing products, or connecting with your mentor.";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      content: "Hi there! I'm the TKH assistant. Ask me anything about courses, trainers, or payments or even your diets."
    }
  ]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isOpen]);

  const generateFallback = useMemo(
    () => (text) => {
      const normalized = text.toLowerCase();
      const match = knowledgeBase.find((item) =>
        item.keywords.some((keyword) => normalized.includes(keyword))
      );
      const base = match ? match.response : defaultResponse;
      return `${base}\n\n(Using offline tips while we reconnect to the AI service.)`;
    },
    []
  );

  const pushMessage = useCallback((role, content) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}-${Math.random()}`,
        role,
        content
      }
    ]);
  }, []);

  const handleSend = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text) return;

      pushMessage("user", text);
      setInput("");
      setIsThinking(true);

      try {
        const response = await sendChatbotMessage(text);
        const reply = response?.message?.trim();
        pushMessage("bot", reply || generateFallback(text));
      } catch (error) {
        const fallback = `${generateFallback(text)}\n\n(Error: ${error.message})`;
        pushMessage("bot", fallback);
      } finally {
        setIsThinking(false);
      }
    },
    [generateFallback, input, pushMessage]
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-yellow-100 overflow-hidden flex flex-col">
          <header className="bg-linear-to-r from-yellow-500 to-yellow-400 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiRobot2Line size={22} />
              <div>
                <p className="text-sm uppercase tracking-wide opacity-80">AI assistant</p>
                <p className="text-lg font-semibold">Need help?</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition"
              aria-label="Close chatbot"
            >
              <IoMdClose size={20} />
            </button>
          </header>

          <div className="px-4 pt-4 flex flex-col gap-3 text-sm text-gray-600">
            <p className="text-gray-500">
              Ask a question or tap a quick prompt below. Answers are powered by TKH's AI assistant.
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={containerRef}
            className="mt-4 px-4 flex-1 max-h-72 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-yellow-200"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%] ${
                    message.role === "user"
                      ? "bg-yellow-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-700 rounded-bl-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="text-xs text-gray-400 italic">Assistant is typing…</div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="mt-4 border-t border-gray-100 px-4 py-3 flex items-center gap-2"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question…"
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={1}
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white rounded-xl p-3 hover:bg-yellow-600 transition disabled:opacity-50"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full bg-yellow-500 text-white shadow-xl flex items-center gap-3 px-5 py-3 font-semibold hover:bg-yellow-600 transition"
      >
        <TbMessageChatbot size={22} />
        {isOpen ? "Close chat" : "Ask AI"}
      </button>
    </div>
  );
};

export default AIChatbot;
