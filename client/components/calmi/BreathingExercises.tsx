import { useEffect, useMemo, useRef, useState } from "react";

interface Technique { name: string; pattern: [number, number, number, number]; instructions: string[]; benefits: string[] }

const TECHNIQUES: Technique[] = [
  {
    name: "Box Breathing (4-4-4-4)",
    pattern: [4, 4, 4, 4],
    instructions: [
      "Inhale through your nose for 4 seconds",
      "Hold for 4 seconds",
      "Exhale gently for 4 seconds",
      "Hold empty for 4 seconds",
    ],
    benefits: ["Balances the nervous system", "Great for quick calm", "Improves focus"],
  },
  {
    name: "4-7-8 Breathing",
    pattern: [4, 7, 8, 0],
    instructions: [
      "Inhale through your nose for 4 seconds",
      "Hold for 7 seconds",
      "Exhale slowly for 8 seconds",
      "Repeat",
    ],
    benefits: ["Eases anxiety", "Supports sleep", "Relaxes body"],
  },
];

export default function BreathingExercises() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = TECHNIQUES[idx];
  const [inhale, hold1, exhale, hold2] = current.pattern;

  useEffect(() => {
    if (!running) return;
    let phaseDurations = [inhale, hold1, exhale, hold2].map((s) => Math.max(0, s));
    let p = 0;
    let remaining = phaseDurations[p];

    const tick = () => {
      if (!running) return;
      setPhase(p as any);
      setCount((c) => c + 1);
      if (remaining <= 0) {
        p = ((p + 1) % 4) as any;
        remaining = phaseDurations[p];
      }
      remaining -= 1;
      timerRef.current = window.setTimeout(tick, 1000);
    };

    tick();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [running, idx]);

  const label = ["Inhale", "Hold", "Exhale", "Hold"][phase];

  const scale = (() => {
    if (phase === 0) return 1.15; // inhale expand
    if (phase === 2) return 0.85; // exhale shrink
    return 1; // holds
  })();

  return (
    <section id="breathing" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-primary">Breathing Exercises</h2>
        <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="px-3 py-2 rounded-lg border bg-background">
          {TECHNIQUES.map((t, i) => (
            <option key={t.name} value={i}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-56 w-56 md:h-72 md:w-72 rounded-full border-2 flex items-center justify-center"
               style={{
                 boxShadow: "0 0 0 12px hsl(var(--accent) / 0.4), 0 0 0 24px hsl(var(--accent) / 0.2)",
                 transform: `scale(${scale})`,
                 transition: "transform 1s ease-in-out",
               }}>
            <div className="text-center">
              <p className="text-2xl font-semibold">{label}</p>
              <p className="text-sm text-muted-foreground">Follow the animation</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => setRunning((r) => !r)} className="px-4 py-2 rounded-lg text-white bg-primary hover:brightness-110">{running ? "Pause" : "Start"}</button>
            <button onClick={() => { setRunning(false); setPhase(0); setCount(0); }} className="px-3 py-2 rounded-lg border hover:bg-secondary">Reset</button>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">How to do it</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {current.instructions.map((it) => <li key={it}>{it}</li>)}
          </ul>
          <h3 className="font-medium mt-4 mb-2">Benefits</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {current.benefits.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
