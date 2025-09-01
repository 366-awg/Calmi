import { useEffect, useMemo, useRef, useState } from "react";

type Track = { title: string; artist: string; url: string; duration?: string };

const TRACKS: Track[] = [
  { title: "Ocean Waves", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4b1f3c80a3.mp3?filename=waves-ambient-110582.mp3", duration: "2:54" },
  { title: "Peaceful Piano", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_efb3be7d47.mp3?filename=peaceful-piano-110624.mp3", duration: "3:10" },
  { title: "Forest Birds", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2022/03/28/audio_0c6b8a9f7f.mp3?filename=forest-lullaby-112199.mp3", duration: "2:20" },
];

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const onPlayPause = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const onEnded = () => {
    setCurrentIndex((i) => (i + 1) % TRACKS.length);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const selectTrack = (i: number) => {
    setCurrentIndex(i);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const track = TRACKS[currentIndex];

  return (
    <section id="music" className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border p-4 md:p-6 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">Calming Music Player</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Now Playing</p>
              <p className="font-medium">{track.title}</p>
              <p className="text-sm text-muted-foreground">{track.artist} • {track.duration}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => selectTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length)} className="px-3 py-2 rounded-lg border hover:bg-secondary">⏮</button>
              <button onClick={onPlayPause} className="px-4 py-2 rounded-lg text-white bg-primary hover:brightness-110">{isPlaying ? "Pause" : "Play"}</button>
              <button onClick={() => selectTrack((currentIndex + 1) % TRACKS.length)} className="px-3 py-2 rounded-lg border hover:bg-secondary">⏭</button>
            </div>
          </div>
          <div className="mt-4">
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">Volume</p>
          </div>
          <audio ref={audioRef} src={track.url} onEnded={onEnded} preload="none" />
        </div>
        <div className="rounded-xl border bg-background p-2 max-h-56 overflow-y-auto">
          {TRACKS.map((t, i) => (
            <button key={t.url} onClick={() => selectTrack(i)} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-secondary ${i === currentIndex ? "bg-secondary" : ""}`}>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.artist} • {t.duration}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
