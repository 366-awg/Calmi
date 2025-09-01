import { RequestHandler } from "express";

interface ChatRequestBody {
  message: string;
  history?: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  max_new_tokens?: number;
  input_mode?: "text" | "voice";
}

const DEFAULT_MODEL = "gpt2";

function buildPrompt(body: ChatRequestBody) {
  const system =
    "You are Calmi, a kind, empathetic mental health companion. You respond briefly, with validation, gentle guidance, and safety. You are not a replacement for professional help. Avoid clinical diagnoses. Encourage breathing, grounding, and reaching out for help if needed. Provide 2-4 concrete, respectful suggestions when helpful. Vary your wording to avoid repetition.";
  const history = body.history ?? [];
  const prefix = body.input_mode === "voice" ? "The user spoke out loud. Be gentle and concise." : "The user typed their message.";
  const convo = [
    { role: "system", content: system },
    { role: "system", content: prefix },
    ...history,
    { role: "user", content: body.message },
  ];
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
    const temperature = Math.max(0, Math.min(body.temperature ?? 0.8, 1.3));
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
      const reply = buildFallback(body.message, body.history, body.input_mode);
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
    const reply = buildFallback(String(message), (req.body as any)?.history, (req.body as any)?.input_mode);
    res.setHeader("X-Calmi-Source", "fallback");
    res.status(200).json({ reply });
  }
};

function buildFallback(userText: string, hist: ChatRequestBody["history"] = [], inputMode?: string) {
  const text = (userText || "").trim();
  const lastUser = [...(hist || [])].reverse().find((m) => m.role === "user")?.content;
  const topic = detectTopic(text || lastUser || "");

  const openings = [
    "I'm here with you.",
    "I hear you.",
    "Thanks for sharing that.",
    "That sounds really tough.",
  ];
  const open = openings[Math.floor(Math.random() * openings.length)];

  const tips = topicTips(topic);
  const picked = pickN(tips, 3);

  const modeNote = inputMode === "voice" ? "If it's okay, let's go one small step at a time." : "Take your time—no rush.";

  const lead = text ? `You said: “${truncate(text, 220)}”. ` : "";
  return [
    `${open} ${lead}${modeNote}`.trim(),
    "Here are a few gentle ideas:",
    ...picked.map((t) => `• ${t}`),
  ].join("\n");
}

function detectTopic(t: string) {
  const s = t.toLowerCase();
  if (/panic|attack|hypervent|short of breath/.test(s)) return "panic";
  if (/anxious|anxiety|worried|nervous|overwhelm/.test(s)) return "anxiety";
  if (/sad|depress|down|hopeless|cry/.test(s)) return "low";
  if (/sleep|insomnia|tired|can'?t sleep/.test(s)) return "sleep";
  if (/angry|anger|frustrat|irritat/.test(s)) return "anger";
  return "general";
}

function topicTips(topic: string): string[] {
  switch (topic) {
    case "panic":
      return [
        "Try 4-4-4-4 box breathing: inhale 4, hold 4, exhale 4, hold 4.",
        "Name 5 things you see around you to re-anchor in the present.",
        "Place a hand on your chest and feel it rise and fall.",
        "Remind yourself: panic peaks and passes—you're safe right now.",
      ];
    case "anxiety":
      return [
        "Write down the worry and one tiny next step you can take.",
        "Relax your jaw and shoulders; take a slower breath out than in.",
        "Limit news/social scrolling for a short while.",
        "Try the 5-4-3-2-1 grounding technique.",
      ];
    case "low":
      return [
        "Reach out to someone you trust, even a short message.",
        "Step outside for 2 minutes of daylight if possible.",
        "Drink a glass of water and have a small snack.",
        "If thoughts of harm arise, contact a helpline listed below.",
      ];
    case "sleep":
      return [
        "Try a 4-7-8 breath for a minute as you lie down.",
        "Dim screens and lower lights; let your eyes rest.",
        "Note one worry on paper, promise to revisit tomorrow.",
        "Play gentle white noise to reduce sudden sounds.",
      ];
    case "anger":
      return [
        "Pause and splash cool water on your face or wrists.",
        "Exhale slowly through pursed lips; count to 5.",
        "Name the feeling without judging it; it will pass.",
        "Move your body—walk, stretch, or shake out tension.",
      ];
    default:
      return [
        "Try 4-7-8 breathing for a minute.",
        "Notice 5 things you can see, 4 you can touch, 3 you can hear.",
        "Sip water and relax your shoulders.",
        "If in danger or at risk, contact a local emergency line or helpline below.",
      ];
  }
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
