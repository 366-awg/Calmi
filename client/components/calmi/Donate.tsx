import { useEffect, useState } from "react";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const DEFAULT_AMOUNTS = [5, 10, 100];

export default function Donate({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [amount, setAmount] = useState<number | "">(10);
  const [email, setEmail] = useState(defaultEmail);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/public-config");
        const j = await r.json();
        setPublicKey(j?.paystackPublicKey || null);
        if (!j?.paystackPublicKey) {
          console.warn("Calmi: PAYSTACK_PUBLIC_KEY is not configured on the server.");
        }
      } catch (e) {
        console.warn("Failed to load public config", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.PaystackPop) return;
    let s = document.getElementById("paystack-inline-js") as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = "paystack-inline-js";
      s.src = "https://js.paystack.co/v1/inline.js";
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onerror = () => console.warn("Failed to load Paystack JS");
      document.body.appendChild(s);
    }
  }, []);

  function ensurePaystackLoaded(timeoutMs = 8000) {
    return new Promise<void>((resolve, reject) => {
      if (typeof window !== "undefined" && window.PaystackPop) return resolve();
      const started = Date.now();
      const check = () => {
        if (window.PaystackPop) return resolve();
        if (Date.now() - started > timeoutMs) return reject(new Error("Paystack JS not loaded"));
        setTimeout(check, 150);
      };
      const s = document.getElementById("paystack-inline-js") as HTMLScriptElement | null;
      if (s) {
        s.addEventListener("load", () => resolve(), { once: true });
      }
      check();
    });
  }

  const pay = async () => {
    try {
      await ensurePaystackLoaded();
    } catch (e) {
      alert("Payments unavailable: Paystack JS not loaded yet.");
      return;
    }
    if (!publicKey) {
      alert("Payments are temporarily unavailable. (Server missing PAYSTACK_PUBLIC_KEY)");
      return;
    }
    const cents = Math.round(Number(amount || 0) * 100);
    if (!cents) {
      alert("Enter a valid amount.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email || `donor+${Date.now()}@example.com`,
      amount: cents,
      currency: "USD",
      callback: async function (response: any) {
        try {
          const v = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          });
          const data = await v.json();
          if (v.ok && (data?.data?.status === "success" || data?.status === true)) {
            alert("Thank you for supporting Calmi! Your payment was verified.");
          } else {
            alert("Payment received but verification failed. We'll review this shortly.");
          }
        } catch (e) {
          alert("Payment received. Verification could not be completed right now.");
        }
      },
      onClose: function () {},
    });
    handler.openIframe();
  };

  return (
    <section id="donate" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">Support Us</h2>
      <p className="text-sm text-muted-foreground mb-4">Your donation helps keep Calmi free and supports mental health resources.</p>
      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-sm">Amount (USD)</label>
          <div className="flex gap-2 mt-1">
            {DEFAULT_AMOUNTS.map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={`px-3 py-2 rounded-lg border hover:bg-secondary ${amount === a ? "bg-secondary" : ""}`}>${a}</button>
            ))}
          </div>
          <input type="number" min={1} className="mt-2 w-full px-3 py-2 rounded-lg border bg-background" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm">Email (for receipt)</label>
          <input type="email" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="flex gap-2 md:justify-end">
          <button onClick={pay} disabled={!publicKey} className={`h-10 px-4 rounded-lg text-white ${publicKey ? "bg-primary hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Donate</button>
        </div>
      </div>
      {!publicKey && (
        <p className="mt-3 text-xs text-muted-foreground">Payments unavailable: server is missing PAYSTACK_PUBLIC_KEY. Developer action required.</p>
      )}
    </section>
  );
}
