import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/review/$id")({
  component: ReviewPage,
});

type Row = {
  id: string;
  position: number;
  name: string | null;
  address: string | null;
  contact: string | null;
  support_level: number | null;
  sign: boolean | null;
  approved: boolean;
};

function ReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  const { data: sheet } = useQuery({
    queryKey: ["sheet", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("walk_sheets").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: rows = [] } = useQuery({
    queryKey: ["rows", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voter_records")
        .select("*")
        .eq("walk_sheet_id", id)
        .order("position");
      if (error) throw error;
      return data as Row[];
    },
  });

  useEffect(() => {
    if (!sheet?.image_paths?.length) return;
    Promise.all(
      sheet.image_paths.map((path: string) =>
        supabase.storage.from("walk-sheets").createSignedUrl(path, 3600).then(({ data }) => data?.signedUrl ?? null)
      )
    ).then((urls) => setImageUrls(urls.filter(Boolean) as string[]));
  }, [sheet?.image_paths]);

  async function update(rowId: string, patch: Partial<Row>) {
    const { error } = await supabase.from("voter_records").update(patch).eq("id", rowId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["rows", id] });
  }

  async function remove(rowId: string) {
    const { error } = await supabase.from("voter_records").delete().eq("id", rowId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["rows", id] });
  }

  async function addRow() {
    const { error } = await supabase.from("voter_records").insert({
      walk_sheet_id: id,
      position: rows.length,
      approved: false,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["rows", id] });
  }

  async function approveAll() {
    const { error } = await supabase
      .from("voter_records")
      .update({ approved: true })
      .eq("walk_sheet_id", id);
    if (error) return toast.error(error.message);
    await supabase.from("walk_sheets").update({ status: "reviewed" }).eq("id", id);
    toast.success("Sheet approved — added to records");
    navigate({ to: "/records" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="bg-brand-gradient py-8 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <Link to="/records" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All sheets
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Step 3 · Review</div>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
                {sheet?.volunteer_name ?? "…"}
                {sheet?.route_name ? <span className="text-white/70"> · {sheet.route_name}</span> : null}
              </h1>
            </div>
            <Button onClick={approveAll} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full font-bold">
              <CheckCircle2 className="mr-2 h-5 w-5" /> Approve All & Save
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-24 lg:self-start space-y-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {imageUrls[activeImage] ? (
              <img src={imageUrls[activeImage]} alt={`Walk sheet ${activeImage + 1}`} className="w-full" />
            ) : (
              <div className="aspect-[3/4] animate-pulse bg-muted" />
            )}
          </div>
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageUrls.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    idx === activeImage ? "border-magenta" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{rows.length} rows extracted</div>
            <Button variant="outline" size="sm" onClick={addRow} className="rounded-full">
              <Plus className="mr-1 h-4 w-4" /> Add row
            </Button>
          </div>

          {rows.map((r, idx) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div className="bg-brand-gradient inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={r.name ?? ""} onSave={(v) => update(r.id, { name: v })} />
                <Field label="Address / Unit" value={r.address ?? ""} onSave={(v) => update(r.id, { address: v })} />
                <Field label="Email / Phone" value={r.contact ?? ""} onSave={(v) => update(r.id, { contact: v })} />
                <SupportPicker
                  value={r.support_level}
                  onChange={(v) => update(r.id, { support_level: v })}
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Checkbox
                  id={`sign-${r.id}`}
                  checked={!!r.sign}
                  onCheckedChange={(v) => update(r.id, { sign: !!v })}
                />
                <label htmlFor={`sign-${r.id}`} className="text-sm font-semibold">
                  Wants a lawn sign
                </label>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
              No rows extracted. Add one manually, or re-upload a clearer photo.
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== value && onSave(v)}
      />
    </div>
  );
}

function SupportPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const colors: Record<number, string> = {
    1: "bg-destructive text-destructive-foreground",
    2: "bg-orange-500 text-white",
    3: "bg-gold text-gold-foreground",
    4: "bg-emerald-500 text-white",
    5: "bg-emerald-700 text-white",
  };
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support (1–5)</div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={`h-9 flex-1 rounded-md text-sm font-bold transition ${
              value === n ? colors[n] + " shadow-card" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
