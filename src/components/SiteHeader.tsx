import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="bg-brand-gradient sticky top-0 z-40 border-b border-white/10 shadow-brand">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Shelley Carroll Campaign
            </div>
            <div className="text-lg font-extrabold tracking-tight">Canvass Capture</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/upload">Upload Sheet</NavLink>
          <NavLink to="/records">Records</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15 hover:text-white [&.active]:bg-white [&.active]:text-magenta"
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}
