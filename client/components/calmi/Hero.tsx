export default function Hero() {
  return (
    <section className="text-center py-10 md:py-16 space-y-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-sky-600 to-emerald-600 text-transparent bg-clip-text">Find Your Calm</h1>
      <p className="max-w-2xl mx-auto text-muted-foreground">Calmi is your gentle companion for tough moments. Chat with an empathetic AI, breathe with guidance, listen to soothing music, and keep a private journal.</p>
      <div className="flex items-center justify-center gap-3">
        <a href="#chat" className="px-5 py-2.5 rounded-lg text-white bg-primary hover:brightness-110">Start Chat</a>
        <a href="#breathing" className="px-5 py-2.5 rounded-lg border hover:bg-secondary">Try Breathing</a>
      </div>
    </section>
  );
}
