import { useEffect, useMemo, useState } from "react";

interface Entry { id: string; date: string; mood: string; text: string }

const STORAGE = "calmi_journal_entries";
const MOODS = ["Calm", "Happy", "Okay", "Anxious", "Sad", "Angry"];

function load(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(entries: Entry[]) {
  localStorage.setItem(STORAGE, JSON.stringify(entries));
}

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>(() => load());
  const [mood, setMood] = useState("Calm");
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    const e: Entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mood,
      text: text.trim(),
    };
    const next = [e, ...entries].slice(0, 200);
    setEntries(next);
    save(next);
    setText("");
  };

  return (
    <section id="journal" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">Personal Journal</h2>
      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2">
          <textarea className="w-full h-32 md:h-40 px-3 py-2 rounded-lg border bg-background" placeholder="How are you feeling today?" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-2 flex items-center gap-2">
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="px-3 py-2 rounded-lg border bg-background">
              {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={add} className="px-4 py-2 rounded-lg text-white bg-primary hover:brightness-110">Save Entry</button>
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto rounded-lg border bg-background p-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet. Write your first thoughts above.</p>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="p-2 rounded-lg hover:bg-secondary">
                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleString()}</p>
                <p className="text-sm"><span className="px-2 py-0.5 rounded-full bg-accent mr-2">{e.mood}</span>{e.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
