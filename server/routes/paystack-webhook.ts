import { RequestHandler } from "express";
import crypto from "crypto";

export const handlePaystackWebhook: RequestHandler = (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });

    const signature = req.header("x-paystack-signature") || "";
    const raw = req.body instanceof Buffer ? (req.body as any) : Buffer.from(String(req.body || ""));
    const computed = crypto.createHmac("sha512", secret).update(raw).digest("hex");
    if (computed !== signature) return res.status(401).json({ error: "Invalid signature" });

    // In real app, act on event types like charge.success here
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
};
