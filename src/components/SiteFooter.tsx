export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-purple text-purple-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            City Councillor
          </div>
          <div className="mt-1 text-2xl font-extrabold text-magenta">
            Shelley Carroll <span className="text-white/90">高雪莉</span>
          </div>
          <div className="text-xs font-semibold tracking-wider text-white/70">
            WARD 17 · DON VALLEY NORTH
          </div>
        </div>
        <div className="text-sm text-white/80 md:text-right">
          <div className="font-semibold text-white">Canvass Capture · Internal Tool</div>
          <div className="mt-1">From clipboard to database — no manual entry.</div>
        </div>
      </div>
    </footer>
  );
}
