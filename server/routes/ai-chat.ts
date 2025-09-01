import { RequestHandler } from "express";

interface ChatRequestBody {
  message: string;
  history?: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  max_new_tokens?: number;
}

const DEFAULT_MODEL = "gpt2";

function buildPrompt(body: ChatRequestBody) {
  const system =
    "You are Calmi, a kind, empathetic mental health companion. You respond briefly, with validation, gentle guidance, and safety. You are not a replacement for professional help. Avoid clinical diagnoses. Encourage breathing, grounding, and reaching out for help if needed.";
  const history = body.history ?? [];
  const convo = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: body.message },
  ];
  // Simple chat-style to prompt-format conversion
  const prompt = convo
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");
  return prompt + "\n\nASSISTANT:";
}

export const handleAiChat: RequestHandler = async (req, res) => {
  try {
    const body = (req.body || {}) as ChatRequestBody;
    if (!body.message || typeof body.message !== "string") {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const token = process.env.HUGGING_FACE_API_KEY || (req.headers["x-hf-key"] as string);
    if (!process.env.HUGGING_FACE_API_KEY && !token) {
      return res.status(500).json({
        error:
          "Calmi server is missing HUGGING_FACE_API_KEY. Set it as an environment variable on the server.",
      });
    }

    const model = body.model || DEFAULT_MODEL;
    const temperature = body.temperature ?? 0.7;
    const max_new_tokens = Math.min(Math.max(body.max_new_tokens ?? 300, 32), 512);

    const prompt = buildPrompt(body);

    async function callOnce() {
      return fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature,
            max_new_tokens,
            return_full_text: false,
          },
          options: { wait_for_model: true },
        }),
      });
    }

    let resp = await callOnce();
    if (resp.status === 503) {
      await new Promise((r) => setTimeout(r, 2500));
      resp = await callOnce();
    }

    if (!resp.ok) {
      const text = await resp.text();
      const reply = buildFallback(body.message);
      res.setHeader("X-Calmi-Source", "fallback");
      return res.status(200).json({ reply });
    }

    const data = (await resp.json()) as Array<{ generated_text: string }> | any;
    let reply = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text.trim();
    } else if (typeof data === "object" && data?.generated_text) {
      reply = String(data.generated_text).trim();
    } else {
      reply = typeof data === "string" ? data : JSON.stringify(data);
    }

    reply = reply.slice(0, 3000);

    if (!reply || reply === "{}") {
      // Fallback if response is empty
      reply = buildFallback(body.message);
      res.setHeader("X-Calmi-Source", "fallback");
      return res.status(200).json({ reply });
    }

    res.setHeader("X-Calmi-Source", "hf");
    res.status(200).json({ reply });
  } catch (err: any) {
    const message = (req.body as any)?.message || "";
    const reply = buildFallback(String(message));
    res.setHeader("X-Calmi-Source", "fallback");
    res.status(200).json({ reply });
  }
};

function buildFallback(userText: string) {
  const t = (userText || "").slice(0, 400);
  const suggestions = [
    "Try a 4-7-8 breath: inhale 4, hold 7, exhale 8.",
    "Notice 5 things you can see, 4 you can touch, 3 you can hear.",
    "If you're in danger or may harm yourself, contact a local emergency line or a helpline below.",
  ];
  const tip = suggestions[Math.floor(Math.random() * suggestions.length)];
  return `I hear you. ${t ? `You said: “${t}”. ` : ""}You're not alone. Let's take one small step: ${tip}`;
}
