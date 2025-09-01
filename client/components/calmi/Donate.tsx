import { useMemo, useState } from "react";

const PAYSTACK_KEY_STORAGE = "calmi_paystack_public_key";

const DEFAULT_AMOUNTS = [5, 10, 100];

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function Donate({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [key, setKey] = useState<string>(() => localStorage.getItem(PAYSTACK_KEY_STORAGE) || "");
  const [amount, setAmount] = useState<number | "">(10);
  const [email, setEmail] = useState(defaultEmail);

  const save = () => localStorage.setItem(PAYSTACK_KEY_STORAGE, key.trim());

  const pay = () => {
    if (!window.PaystackPop) {
      alert("Paystack script not loaded yet. Please try again in a moment.");
      return;
    }
    if (!key) {
      alert("Please add your Paystack public key.");
      return;
    }
    const cents = Math.round(Number(amount || 0) * 100);
    if (!cents) {
      alert("Enter a valid amount.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key,
      email: email || `donor+${Date.now()}@example.com`,
      amount: cents,
      currency: "USD",
      callback: function (_response: any) {
        alert("Thank you for supporting Calmi! Your payment was processed.");
      },
      onClose: function () {
        // noop
      },
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
          <button onClick={pay} className="h-10 px-4 rounded-lg text-white bg-primary hover:brightness-110">Donate</button>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm">Paystack Public Key</label>
        <div className="flex gap-2 mt-1">
          <input type="text" className="flex-1 px-3 py-2 rounded-lg border bg-background" value={key} onChange={(e) => setKey(e.target.value)} placeholder="pk_test_..." />
          <button onClick={save} className="px-3 py-2 rounded-lg border hover:bg-secondary">Save</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Stored locally only. Required to process payments via Paystack.</p>
      </div>
    </section>
  );
}
