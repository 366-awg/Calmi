import { RequestHandler } from "express";

export const handlePublicConfig: RequestHandler = (_req, res) => {
  const huggingFaceConfigured = Boolean(process.env.HUGGING_FACE_API_KEY);
  const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY || null;
  res.status(200).json({ huggingFaceConfigured, paystackPublicKey });
};
