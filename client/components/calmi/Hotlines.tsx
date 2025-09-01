import { useMemo, useState } from "react";

interface Country { name: string; iso2: string; localNote?: string }

const COUNTRIES: Country[] = [
  { name: "United States", iso2: "us", localNote: "Text HOME to 741741" },
  { name: "United Kingdom", iso2: "gb", localNote: "Text HOME to 85258" },
  { name: "Canada", iso2: "ca", localNote: "Text HOME to 686868" },
  { name: "Ireland", iso2: "ie", localNote: "Text HOME to 50808" },
  { name: "Australia", iso2: "au" },
  { name: "Kenya", iso2: "ke" },
  { name: "India", iso2: "in" },
  { name: "South Africa", iso2: "za" },
];

function faHUrl(iso2: string) {
  return `https://findahelpline.com/${iso2.toLowerCase()}`;
}

export default function Hotlines() {
  const [selected, setSelected] = useState(0);
  const c = COUNTRIES[selected];

  return (
    <section id="hotlines" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">Global Mental Health Support</h2>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="text-sm">Country</label>
          <select className="mt-1 w-full px-3 py-2 rounded-lg border bg-background" value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
            {COUNTRIES.map((cc, i) => (
              <option key={cc.iso2} value={i}>{cc.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 md:justify-end">
          <a href={faHUrl(c.iso2)} target="_blank" className="h-10 px-4 rounded-lg text-white bg-primary hover:brightness-110 flex items-center">Open Directory</a>
        </div>
      </div>

      {c.localNote && (
        <p className="mt-3 text-sm">Crisis Text Line: <span className="font-medium">{c.localNote}</span> (SMS). Learn more: <a href="https://en.wikipedia.org/wiki/Crisis_Text_Line" target="_blank" className="underline text-primary">Wikipedia</a></p>
      )}

      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <a className="p-3 rounded-lg border bg-background hover:bg-secondary" target="_blank" href={faHUrl(c.iso2)}>
          <p className="font-medium">Find A Helpline</p>
          <p className="text-xs text-muted-foreground">Global directory of over 1,300 hotlines in 130+ countries</p>
        </a>
        <a className="p-3 rounded-lg border bg-background hover:bg-secondary" target="_blank" href="https://befrienders.org">
          <p className="font-medium">Befrienders Worldwide</p>
          <p className="text-xs text-muted-foreground">Global suicide prevention helpline network</p>
        </a>
        <a className="p-3 rounded-lg border bg-background hover:bg-secondary" target="_blank" href="https://findahelpline.com">
          <p className="font-medium">Explore More</p>
          <p className="text-xs text-muted-foreground">Search by city/region for localized resources</p>
        </a>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">If you are in immediate danger, contact your local emergency number.</p>
    </section>
  );
}
