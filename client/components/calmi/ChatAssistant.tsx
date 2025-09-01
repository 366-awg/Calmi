import { useEffect, useMemo, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
}


function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        setSupported(true);
        try {
          const r = new SR();
          r.continuous = false;
          r.lang = "en-US";
          r.interimResults = false;
          r.onresult = (e: any) => {
            const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
            (window as any).__calmi_sr_result = transcript;
          };
          r.onend = () => setListening(false);
          recognitionRef.current = r;
        } catch (e) {
          setSupported(false);
        }
      }
    } catch {
      setSupported(false);
    }
  }, []);

  const start = () => {
    if (!recognitionRef.current) return;
    try {
      (window as any).__calmi_sr_result = "";
      setListening(true);
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
  };

  const getResult = () => (window as any).__calmi_sr_result || "";

  return { supported, listening, start, stop, getResult };
}

function speak(text: string) {
  if (typeof window === "undefined") return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch {}
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [creativity, setCreativity] = useState(0.8);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");

  const { supported: sttSupported, listening, start, stop, getResult } = useSpeechRecognition();

  const canSend = input.trim().length > 0 && !loading;

  const send = async () => {
    if (!canSend) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: input.trim(), ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg.text, history: messages.map(({ role, text }) => ({ role, content: text })), temperature: creativity, input_mode: inputMode }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed");
      const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", text: data.reply || "", ts: Date.now() };
      setMessages((m) => [...m, aiMsg]);
      if (ttsEnabled && aiMsg.text) speak(aiMsg.text);
    } catch (e: any) {
      const errText = e?.message || "Something went wrong";
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: `I couldn't reach the AI service. Please try again later.`, ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onMicClick = async () => {
    if (!sttSupported) return;
    if (!listening) { setInputMode("voice"); start(); }
    else { stop(); }
  };

  useEffect(() => {
    if (!listening) {
      const result = getResult();
      if (result) setInput((v) => (v ? v + " " : "") + result);
      setInputMode("text");
    }
  }, [listening]);


  return (
    <section id="chat" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-primary">AI Chat Assistant</h2>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} />
            <span className="text-muted-foreground">Speak replies</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">Creativity</span>
            <input type="range" min={0} max={1.3} step={0.05} value={creativity} onChange={(e) => setCreativity(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <div className="h-72 md:h-80 overflow-y-auto rounded-lg border bg-background p-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Say hello to Calmi. I can listen and offer gentle guidance. Your messages are processed by an AI service.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`${m.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-flex max-w-[85%] md:max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-secondary-foreground rounded-bl-sm"}`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border bg-white/70 dark:bg-background outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Type a message... or use the mic"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          onClick={onMicClick}
          className={`px-3 py-2 rounded-lg border ${sttSupported ? "hover:bg-secondary" : "opacity-50 cursor-not-allowed"}`}
          title={sttSupported ? (listening ? "Stop" : "Speak") : "Speech-to-text not supported"}
        >
          {listening ? "Stop" : "🎤"}
        </button>
        <button onClick={send} disabled={!canSend} className={`px-4 py-2 rounded-lg text-white ${canSend ? "bg-primary hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs text-muted-foreground p-3 rounded-lg border bg-background">
          Tips: For immediate calm, try a 4-7-8 breath. If you may be in danger, contact local emergency services or a helpline below.
        </div>
      </div>
    </section>
  );
}
