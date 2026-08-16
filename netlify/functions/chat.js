const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  try {

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "ANSH AI Function Running"
        })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const messages = body.messages || [];

    const prompt = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join("\n");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
        answer: response.text
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