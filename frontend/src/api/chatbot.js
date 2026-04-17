import axios from "axios";

const CHATBOT_API = "http://localhost:5001/api/chatbot";

export const sendChatbotMessage = async (message) => {
  console.log("Sending message to chatbot API:", message);
  const messages = [{ role: "user", content: message }];
  if (!message?.trim()) {
    throw new Error("Message is required");
  }

  try {
    const response = await axios.post(CHATBOT_API, { messages });
    return response.data;
  } catch (error) {
    const fallback = error.response?.data?.message || "Unable to reach the AI assistant";
    throw new Error(fallback);
  }
};
