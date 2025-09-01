export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-background/50 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-extrabold text-xl text-primary">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-sky-300 to-emerald-300" />
          Calmi
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#chat" className="hover:text-primary">Chat</a>
          <a href="#breathing" className="hover:text-primary">Breathing</a>
          <a href="#donate" className="hover:text-primary">Donate</a>
          <a href="#hotlines" className="hover:text-primary">Hotlines</a>
          <a href="#journal" className="hover:text-primary">Journal</a>
        </nav>
      </div>
    </header>
  );
}
