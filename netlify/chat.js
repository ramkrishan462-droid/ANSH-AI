const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

exports.handler = async function (event) {

  // Only POST allowed
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {

    const body = JSON.parse(event.body || "{}");

    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "No messages received"
        })
      };
    }

    const prompt = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join("\n");

    const response = await ai.models.generateContent({

      model: "gemini-3.5-flash-lite",

      contents: `
You are ANSH AI.

Rules:
- Hindi → Hindi answer
- English → English answer
- Hinglish → Hinglish answer
- Be friendly
- Give complete code when requested

${prompt}
`

    });

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        answer: response.text || "AI ने कोई response नहीं दिया।"
      })
    };

  } catch (error) {

    console.error("GEMINI ERROR:", error);

    return {
      statusCode: 500,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        error: error.message || "Gemini request failed"
      })
    };

  }

};