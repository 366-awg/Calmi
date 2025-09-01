import { RequestHandler } from "express";

const BASE = "https://api.paystack.co";

export const verifyPaystack: RequestHandler = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ error: "Server missing PAYSTACK_SECRET_KEY env var." });
    }
    const { reference } = req.method === "POST" ? req.body || {} : req.query;
    if (!reference || typeof reference !== "string") {
      return res.status(400).json({ error: "Missing 'reference'" });
    }
    const resp = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(502).json({ error: "Upstream error", details: data });
    res.status(200).json(data);
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
};
