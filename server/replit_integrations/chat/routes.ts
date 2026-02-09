import type { Express, Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `You are the Innova Trials AI Assistant — a knowledgeable, professional helper for a clinical research site evaluation platform.

Your role:
- Help administrators understand how to use the platform (managing sites, evaluation setup, scoring, exporting results, activity logs)
- Help research sites understand the evaluation process and questionnaire
- Answer questions about clinical research site assessments, GCP compliance, and regulatory requirements
- Provide guidance on evaluation criteria categories: Infrastructure, Staff, Quality Systems, Regulatory, Experience, Technology, etc.

Guidelines:
- Be concise and helpful. Use simple, professional language.
- If asked about platform-specific features, explain how to navigate and use them.
- If asked about clinical research topics, provide accurate general information.
- Always respond in English.
- Do not make up specific data about sites or scores — refer users to the platform's data pages.
- Format responses with markdown when helpful (bullet points, bold text, etc.)`;

export function registerChatRoutes(app: Express): void {
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_tokens: 1024,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error in chat:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });
}

