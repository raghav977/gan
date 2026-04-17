import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPEN_ROUTER;

const systemPrompt =
  "You are a helpful assistant for the fitness gym. Provide concise, friendly answers and guide users to key features like courses, trainers, and fitness programs and diet for the user when relevant.";

export const chatbotController = async (req, res) => {
  try {
    console.log("Received chatbot request with body:", req.body);

    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        message: "Messages array is required",
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.sitename.com",
          "X-Title": "SiteName",
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      }
    );

    const chatCompletion = await response.json();

    console.log("Chat completion response:", chatCompletion);

    if (chatCompletion.error) {
      return res.status(500).json({
        message: chatCompletion.error.message,
      });
    }

    res.status(200).json({
      message: chatCompletion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing chatbot request:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};