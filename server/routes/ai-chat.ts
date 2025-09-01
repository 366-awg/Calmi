import { RequestHandler } from "express";

interface ChatRequestBody {
  message: string;
  history?: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  max_new_tokens?: number;
}

const DEFAULT_MODEL = "meta-llama/Llama-3.2-1B-Instruct";

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

    const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
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
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: "Upstream HF error", details: text });
    }

    const data = (await resp.json()) as Array<{ generated_text: string }> | any;
    let reply = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text.trim();
    } else if (typeof data === "object" && data?.generated_text) {
      reply = String(data.generated_text).trim();
    } else {
      reply = JSON.stringify(data);
    }

    // Safety guard: trim overly long replies
    reply = reply.slice(0, 3000);

    res.status(200).json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
};
