import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import shelleyHeadshot from "@/assets/shelley-headshot.png";
import { Camera, CheckCircle2, Download, ClipboardList, Users, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [sheets, records] = await Promise.all([
        supabase.from("walk_sheets").select("id, status", { count: "exact" }),
        supabase.from("voter_records").select("id, approved", { count: "exact" }),
      ]);
      return {
        sheets: sheets.count ?? 0,
        pending: sheets.data?.filter((s) => s.status === "pending").length ?? 0,
        voters: records.count ?? 0,
        approved: records.data?.filter((r) => r.approved).length ?? 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-brand-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.85 0.18 85 / 0.3), transparent 40%), radial-gradient(circle at 80% 80%, oklch(0.55 0.22 350 / 0.4), transparent 40%)"
        }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Clipboard to database, instantly
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Keep the conversation.<br />
              <span className="text-gold">Lose the data entry.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              Volunteers canvass with familiar paper walk sheets. At the end of the day, snap a
              photo - we extract names, addresses, support levels, and sign requests automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-7 font-bold shadow-brand">
                <Link to="/upload"><Camera className="mr-2 h-5 w-5" />Upload a Sheet</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 px-7 font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <Link to="/records">View Records</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 rounded-3xl bg-gold/30 blur-2xl" />
            <img
              src={shelleyHeadshot}
              alt="Councillor Shelley Carroll"
              className="relative h-full max-h-[460px] w-full rounded-3xl object-cover object-top shadow-brand ring-4 ring-white/20"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-10 grid max-w-6xl gap-4 px-6 md:grid-cols-4">
        <StatCard label="Sheets uploaded" value={stats?.sheets ?? 0} tone="magenta" />
        <StatCard label="Awaiting review" value={stats?.pending ?? 0} tone="gold" />
        <StatCard label="Voter records" value={stats?.voters ?? 0} tone="purple" />
        <StatCard label="Approved" value={stats?.approved ?? 0} tone="magenta" />
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-magenta">
            The Workflow
          </div>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight">Four steps. Zero typing.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <Step n={1} icon={ClipboardList} title="Canvass" body="Volunteers use paper walk sheets - natural, friendly, no screens at the door." />
          <Step n={2} icon={Camera} title="Snap" body="Photograph completed sheets at end of day. Each sheet gets a volunteer + route tag." />
          <Step n={3} icon={CheckCircle2} title="Review" body="AI extracts every row. Confirm or fix any field in a clean side-by-side view." />
          <Step n={4} icon={Download} title="Export" body="One click pulls the master CSV ready for the campaign database." />
        </div>
      </section>

      {/* CTA Bars */}
      <section className="mx-auto grid max-w-7xl gap-1 px-6 pb-20 md:grid-cols-3">
        <CTABar to="/upload" label="Upload Sheet" tone="magenta" icon={Camera} />
        <CTABar to="/records" label="Review Records" tone="purple" icon={Users} />
        <CTABar to="/records" label="Export CSV" tone="magenta-dark" icon={Download} />
      </section>

      <SiteFooter />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "magenta" | "purple" | "gold" }) {
  const toneClass = {
    magenta: "from-magenta to-magenta/80 text-magenta-foreground",
    purple: "from-purple to-purple/80 text-purple-foreground",
    gold: "from-gold to-gold/80 text-gold-foreground",
  }[tone];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${toneClass} p-5 shadow-card`}>
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-2 text-4xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function Step({ n, icon: Icon, title, body }: { n: number; icon: any; title: string; body: string }) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-brand">
      <div className="flex items-center gap-3">
        <div className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-3xl font-extrabold text-muted-foreground/30">0{n}</div>
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function CTABar({ to, label, tone, icon: Icon }: { to: string; label: string; tone: "magenta" | "purple" | "magenta-dark"; icon: any }) {
  const cls = {
    magenta: "bg-magenta hover:bg-magenta/90",
    purple: "bg-purple hover:bg-purple/90",
    "magenta-dark": "bg-[oklch(0.42_0.2_340)] hover:bg-[oklch(0.38_0.2_340)]",
  }[tone];
  return (
    <Link
      to={to}
      className={`${cls} group flex items-center justify-center gap-3 py-10 text-2xl font-extrabold text-white transition`}
    >
      <Icon className="h-7 w-7 transition group-hover:scale-110" />
      {label}
    </Link>
  );
}
