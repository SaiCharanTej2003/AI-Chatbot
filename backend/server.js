/**
 * Simple backend that proxies chat messages to Groq's OpenAI-compatible chat completions endpoint.
 * No auth, no DB.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { invokeGroq } from "./groqClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "ok", message: "Virtual Chatbot (Groq) backend (simple)" }));

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: "messages must be an array" });

    const groqResp = await invokeGroq(messages);

    // Try to extract assistant text (OpenAI-like shape)
    let assistantContent = null;
    if (groqResp?.choices?.[0]?.message?.content) {
      assistantContent = groqResp.choices[0].message.content;
    } else if (groqResp?.choices?.[0]?.delta?.content) {
      assistantContent = groqResp.choices[0].delta.content;
    } else if (groqResp?.output) {
      assistantContent = groqResp.output;
    } else {
      assistantContent = JSON.stringify(groqResp);
    }

    res.json({ assistant: assistantContent, raw: groqResp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Simple Groq backend running on port ${PORT}`);
});
