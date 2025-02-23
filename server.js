const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory cache for non-streaming responses
const cache = new Map();

// Route to handle AI requests via OpenRouter's DeepSeek API
app.post("/ask", async (req, res) => {
    try {
        const userQuestion = req.body.question;

        if (!userQuestion) {
            return res.status(400).json({ error: "Question is required!" });
        }

        // Check cache for non-streaming responses
        if (cache.has(userQuestion)) {
            return res.json({ answer: cache.get(userQuestion) });
        }

        // Send request to DeepSeek via OpenRouter
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: userQuestion }],
                max_tokens: 1024,
                temperature: 0.7,
                stream: true, // Enable streaming
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                responseType: "stream", // Stream the response
            }
        );

        // Stream the response to the frontend
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        let fullResponse = ""; // To store the complete response for caching

        response.data.on("data", (chunk) => {
            const lines = chunk.toString().split("\n");
            lines.forEach((line) => {
                if (line.startsWith("data:")) {
                    try {
                        const data = JSON.parse(line.slice(5));
                        const content = data.choices?.[0]?.delta?.content;
                        if (content) {
                            fullResponse += content; // Append to the full response
                            res.write(`data: ${JSON.stringify({ answer: content })}\n\n`);
                        }
                    } catch (error) {
                        console.error("Error parsing chunk:", error);
                    }
                }
            });
        });

        response.data.on("end", () => {
            // Cache the full response for future use
            cache.set(userQuestion, fullResponse);
            res.end();
        });

        response.data.on("error", (error) => {
            console.error("Streaming error:", error);
            res.status(500).json({ error: "Streaming failed." });
        });
    } catch (error) {
        console.error("Error response:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get response from OpenRouter DeepSeek API" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});