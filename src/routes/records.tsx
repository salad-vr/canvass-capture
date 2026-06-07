import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, Camera, FileText } from "lucide-react";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
});

type Record = {
  id: string;
  name: string | null;
  address: string | null;
  contact: string | null;
  support_level: number | null;
  sign: boolean | null;
  approved: boolean;
  created_at: string;
  walk_sheets: { volunteer_name: string; route_name: string | null; status: string; id: string } | null;
};

function RecordsPage() {
  const { data: records = [] } = useQuery({
    queryKey: ["all-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voter_records")
        .select("*, walk_sheets(id, volunteer_name, route_name, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Record[];
    },
  });

  const { data: sheets = [] } = useQuery({
    queryKey: ["all-sheets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("walk_sheets")
        .select("*, voter_records(id, approved)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  function exportCsv(approvedOnly: boolean) {
    const rows = approvedOnly ? records.filter((r) => r.approved) : records;
    if (!rows.length) return;
    const header = ["Volunteer", "Route", "Name", "Address/Unit", "Email/Phone", "Support (1-5)", "Sign", "Approved", "Captured"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        r.walk_sheets?.volunteer_name ?? "",
        r.walk_sheets?.route_name ?? "",
        r.name ?? "",
        r.address ?? "",
        r.contact ?? "",
        r.support_level ?? "",
        r.sign ? "Y" : "N",
        r.approved ? "Y" : "N",
        new Date(r.created_at).toISOString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canvass-${approvedOnly ? "approved" : "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const approvedCount = records.filter((r) => r.approved).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="bg-brand-gradient py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Step 4 · Export</div>
            <h1 className="mt-2 text-4xl font-extrabold">Canvass Records</h1>
            <p className="mt-2 text-white/80">{records.length} total · {approvedCount} approved</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => exportCsv(true)} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full font-bold">
              <Download className="mr-2 h-5 w-5" /> Export Approved CSV
            </Button>
            <Button onClick={() => exportCsv(false)} size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white">
              All
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        {/* Sheets */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Sheets</h2>
          {sheets.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sheets.map((s) => {
                const total = s.voter_records?.length ?? 0;
                const ok = s.voter_records?.filter((r: any) => r.approved).length ?? 0;
                const pending = s.status === "pending";
                return (
                  <Link
                    key={s.id}
                    to="/review/$id"
                    params={{ id: s.id }}
                    className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-brand"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {new Date(s.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-1 font-bold">{s.volunteer_name}</div>
                        {s.route_name && <div className="text-sm text-muted-foreground">{s.route_name}</div>}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${pending ? "bg-gold text-gold-foreground" : "bg-emerald-100 text-emerald-800"}`}>
                        {pending ? "Pending" : "Reviewed"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                      <span>{total} rows</span>
                      <span className="font-semibold text-magenta">{ok}/{total} approved</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Records table */}
        <section>
          <h2 className="mb-4 text-xl font-bold">All voter records</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Support</th>
                  <th className="p-3">Sign</th>
                  <th className="p-3">Volunteer</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-semibold">{r.name || <em className="text-muted-foreground">—</em>}</td>
                    <td className="p-3">{r.address || "—"}</td>
                    <td className="p-3">{r.contact || "—"}</td>
                    <td className="p-3">
                      {r.support_level ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-magenta font-bold text-white">{r.support_level}</span>
                      ) : "—"}
                    </td>
                    <td className="p-3">{r.sign ? "✓" : ""}</td>
                    <td className="p-3 text-muted-foreground">{r.walk_sheets?.volunteer_name}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${r.approved ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No records yet. Upload your first walk sheet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border p-12 text-center">
      <div className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-brand">
        <FileText className="h-7 w-7" />
      </div>
      <div>
        <div className="text-lg font-bold">No sheets uploaded yet</div>
        <div className="text-sm text-muted-foreground">Capture your first walk sheet to get started.</div>
      </div>
      <Button asChild className="bg-magenta text-magenta-foreground hover:bg-magenta/90 rounded-full font-bold">
        <Link to="/upload"><Camera className="mr-2 h-4 w-4" /> Upload a sheet</Link>
      </Button>
    </div>
  );
}
