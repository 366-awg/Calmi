import { useMemo, useState } from "react";

interface Hotline { country: string; phone: string; website: string }

const HOTLINES: Hotline[] = [
  { country: "United States", phone: "988", website: "https://988lifeline.org" },
  { country: "United Kingdom", phone: "+44 116 123", website: "https://www.samaritans.org/" },
  { country: "Canada", phone: "1-833-456-4566", website: "https://talksuicide.ca/" },
  { country: "Australia", phone: "13 11 14", website: "https://www.lifeline.org.au/" },
  { country: "Kenya", phone: "+254 719 973 999", website: "https://befrienderskenya.org/" },
  { country: "India", phone: "9152987821", website: "https://www.aasra.info/" },
  { country: "South Africa", phone: "0800 567 567", website: "https://www.sadag.org/" },
];

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

export default function Hotlines() {
  const [selected, setSelected] = useState(0);
  const h = HOTLINES[selected];

  const onCallClick = () => {
    if (isMobile()) {
      window.location.href = `tel:${h.phone.replace(/\s+/g, "")}`;
    } else {
      window.open(h.website, "_blank");
    }
  };

  return (
    <section id="hotlines" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">Global Mental Health Hotlines</h2>
      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="text-sm">Country</label>
          <select className="mt-1 w-full px-3 py-2 rounded-lg border bg-background" value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
            {HOTLINES.map((c, i) => (
              <option key={c.country} value={i}>{c.country}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 md:justify-end">
          <button onClick={onCallClick} className="h-10 px-4 rounded-lg text-white bg-primary hover:brightness-110">{isMobile() ? "Call" : "Open Website"}</button>
        </div>
      </div>
      <div className="mt-3 p-3 rounded-lg border bg-background">
        <p className="text-sm">Helpline: <span className="font-medium">{h.phone}</span></p>
        <a href={h.website} target="_blank" className="text-xs text-primary underline break-all">{h.website}</a>
      </div>
    </section>
  );
}
