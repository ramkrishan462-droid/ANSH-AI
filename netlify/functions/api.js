"use strict";

const express = require("express");
const serverless = require("serverless-http");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(
    express.json({
        limit: "20mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "20mb"
    })
);

// ==========================================
// GEMINI
// ==========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ==========================================
// HEALTH
// ==========================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "online",
        app: "ANSH AI",
        textAI: true,
        imageAI: true
    });

});

// ==========================================
// STATUS
// ==========================================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        status: "online",
        app: "ANSH AI",
        textAI: true,
        imageAI: true,
        imageRoute: "/api/generate-image",
        analyzeRoute: "/api/analyze-image"
    });

});

// ==========================================
// TEXT AI
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const messages =
            Array.isArray(req.body.messages)
                ? req.body.messages
                : [];

        const message =
            String(req.body.message || "").trim();

        if (!messages.length && !message) {

            return res.status(400).json({
                success: false,
                error: "No message received."
            });

        }

        let conversation = "";

        if (messages.length) {

            conversation =
                messages
                    .slice(-20)
                    .map(msg => {

                        const role =
                            msg.role === "assistant"
                                ? "ANSH AI"
                                : "User";

                        return `${role}: ${String(
                            msg.content || ""
                        )}`;

                    })
                    .join("\n\n");

        }

        if (
            message &&
            !conversation.includes(message)
        ) {

            conversation +=
                `\n\nUser: ${message}`;

        }

        const response =
            await ai.models.generateContent({

                model:
                    "gemini-3.5-flash-lite",

                contents: `

You are ANSH AI.

You are a helpful, intelligent and friendly AI assistant.

Language rules:

- Hindi question = Hindi answer.
- English question = English answer.
- Hinglish question = Hinglish answer.
- Understand Hindi written in Devanagari.
- Understand Hindi written using English letters.

Rules:

- Be helpful.
- Be accurate.
- Explain clearly.
- Give step-by-step instructions when requested.
- Give complete working code when requested.
- Never reveal API keys.

Conversation:

${conversation}

`
            });

        const answer =
            response.text ||
            "Sorry, I could not generate an answer.";

        return res.json({

            success: true,

            answer: answer,

            text: answer

        });

    }

    catch (error) {

        console.error(
            "TEXT AI ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Text AI request failed."

        });

    }

});

// ==========================================
// IMAGE GENERATION
// ==========================================

app.post(
    "/api/generate-image",
    async (req, res) => {

        try {

            const prompt =
                String(
                    req.body.prompt ||
                    req.body.message ||
                    ""
                ).trim();

            if (!prompt) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Please enter an image prompt."

                });

            }

            console.log(
                "IMAGE REQUEST:",
                prompt
            );

            /*
             * YAHAN tumhara image-generation
             * provider/API code aayega.
             *
             * Abhi agar tum FAL use kar rahe ho,
             * FAL_KEY Netlify Environment Variable
             * mein hona chahiye.
             */

            const { fal } =
                require("@fal-ai/client");

            if (!process.env.FAL_KEY) {

                return res.status(500).json({

                    success: false,

                    error:
                        "FAL_KEY is missing in Netlify Environment Variables."

                });

            }

            fal.config({
                credentials:
                    process.env.FAL_KEY
            });

            const result =
                await fal.subscribe(
                    "fal-ai/flux/schnell",
                    {
                        input: {
                            prompt: prompt
                        },
                        logs: true
                    }
                );

            console.log(
                "FAL RESULT:",
                result
            );

            const images =
                result?.data?.images ||
                [];

            if (!images.length) {

                return res.status(500).json({

                    success: false,

                    error:
                        "Image provider ne image return nahi ki."

                });

            }

            const imageUrl =
                images[0]?.url;

            if (!imageUrl) {

                return res.status(500).json({

                    success: false,

                    error:
                        "Image URL nahi mila."

                });

            }

            return res.json({

                success: true,

                image:
                    imageUrl,

                text:
                    "🎨 Image created successfully by ANSH AI."

            });

        }

        catch (error) {

            console.error(
                "IMAGE GENERATION ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    error?.message ||
                    "Image generation failed."

            });

        }

    }
);

// ==========================================
// IMAGE ANALYSIS
// ==========================================

app.post(
    "/api/analyze-image",
    async (req, res) => {

        try {

            const image =
                req.body.image;

            const message =
                String(
                    req.body.message ||
                    "Describe this image."
                );

            if (!image) {

                return res.status(400).json({

                    success: false,

                    error:
                        "No image received."

                });

            }

            const response =
                await ai.models.generateContent({

                    model:
                        "gemini-3.5-flash-lite",

                    contents: [

                        {
                            text: message
                        },

                        {
                            inlineData: {

                                mimeType:
                                    "image/jpeg",

                                data:
                                    image.replace(
                                        /^data:image\/[^;]+;base64,/,
                                        ""
                                    )

                            }

                        }

                    ]

                });

            const answer =
                response.text ||
                "I could not analyze this image.";

            return res.json({

                success: true,

                text:
                    answer,

                answer:
                    answer

            });

        }

        catch (error) {

            console.error(
                "IMAGE ANALYSIS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    error?.message ||
                    "Image analysis failed."

            });

        }

    }
);

// ==========================================
// 404
// ==========================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                `API endpoint not found: ${req.method} ${req.originalUrl}`

        });

    }
);

// ==========================================
// NETLIFY FUNCTION
// ==========================================

module.exports.handler =
    serverless(app);