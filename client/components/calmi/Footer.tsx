export default function Footer() {
  return (
    <footer className="mt-10 border-t">
      <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between">
        <p>© {new Date().getFullYear()} Calmi. For support, seek professional help when needed.</p>
        <a href="#top" className="hover:text-primary">Back to top ↑</a>
      </div>
    </footer>
  );
}
