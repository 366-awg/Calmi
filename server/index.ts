import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAiChat } from "./routes/ai-chat";
import { handlePublicConfig } from "./routes/public-config";
import { verifyPaystack } from "./routes/paystack";
import { handlePaystackWebhook } from "./routes/paystack-webhook";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  // Mount webhook BEFORE JSON parsing to preserve raw body for signature verification
  app.post("/api/paystack/webhook", express.raw({ type: "*/*" }), handlePaystackWebhook);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/ai-chat", handleAiChat);
  app.get("/api/public-config", handlePublicConfig);
  app.post("/api/paystack/verify", verifyPaystack);

  return app;
}
