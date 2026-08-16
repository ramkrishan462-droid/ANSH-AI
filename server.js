const express = require("express");
const path = require("path");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {

    const messages = req.body.messages || [];

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

    res.json({
      answer: response.text
    });

  } catch (error) {

    console.error("GEMINI ERROR:", error);

    res.status(500).json({
      error: error.message || "Gemini request failed"
    });

  }
});

app.listen(PORT, () => {
  console.log("ANSH AI READY");
  console.log("http://localhost:3000");
});