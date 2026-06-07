import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractWalkSheet } from "@/lib/canvass";
import { toast } from "sonner";
import { Camera, Loader2, Upload, X } from "lucide-react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState("");
  const [route, setRoute] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files.length || !volunteer.trim()) {
      toast.error("Volunteer name and at least one sheet photo are required.");
      return;
    }
    setBusy(true);
    try {
      const imagePaths: string[] = [];
      const allRows: { name: string; address: string; contact: string; support_level: number | null; sign: boolean }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("walk-sheets").upload(path, file, {
          contentType: file.type,
        });
        if (upErr) throw upErr;
        imagePaths.push(path);

        const { data: signed } = await supabase.storage
          .from("walk-sheets")
          .createSignedUrl(path, 600);
        if (!signed?.signedUrl) throw new Error("Could not get signed URL");

        toast.info(`Reading sheet ${i + 1} of ${files.length}…`);
        const { rows } = await extractWalkSheet(signed.signedUrl);
        allRows.push(...rows);
      }

      const { data: sheet, error: sErr } = await supabase
        .from("walk_sheets")
        .insert({
          volunteer_name: volunteer.trim(),
          route_name: route.trim() || null,
          notes: notes.trim() || null,
          image_paths: imagePaths,
          status: "pending",
        })
        .select()
        .single();
      if (sErr) throw sErr;

      if (allRows.length) {
        const insertRows = allRows.map((r, i) => ({
          walk_sheet_id: sheet.id,
          position: i,
          name: r.name || null,
          address: r.address || null,
          contact: r.contact || null,
          support_level: r.support_level ?? null,
          sign: !!r.sign,
          approved: false,
        }));
        const { error: rErr } = await supabase.from("voter_records").insert(insertRows);
        if (rErr) throw rErr;
      }

      toast.success(`Extracted ${allRows.length} rows from ${files.length} sheet${files.length > 1 ? "s" : ""}. Review them now.`);
      navigate({ to: "/review/$id", params: { id: sheet.id } });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="bg-brand-gradient py-10 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Step 2 · Snap</div>
          <h1 className="mt-2 text-4xl font-extrabold">Upload Walk Sheets</h1>
          <p className="mt-2 text-white/80">Snap every sheet a volunteer turned in. We&rsquo;ll pull the rows from each one.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <Label htmlFor="volunteer" className="text-sm font-semibold">Volunteer name *</Label>
            <Input id="volunteer" value={volunteer} onChange={(e) => setVolunteer(e.target.value)} placeholder="Jane Doe" className="mt-2" required />
          </div>
          <div>
            <Label htmlFor="route" className="text-sm font-semibold">Route / area</Label>
            <Input id="route" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="e.g. Don Mills North · Block 3" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm font-semibold">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything the office should know about these sheets" className="mt-2" />
          </div>
          <Button type="submit" disabled={busy || !files.length} size="lg" className="w-full bg-magenta text-magenta-foreground hover:bg-magenta/90 rounded-full font-bold shadow-brand">
            {busy ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Working…</> : <><Upload className="mr-2 h-5 w-5" /> Extract & Continue</>}
          </Button>
        </div>

        <div>
          <Label className="text-sm font-semibold">Walk sheet photos *</Label>
          <label className="mt-2 block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 transition hover:border-magenta hover:bg-magenta/5">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            {previews.length === 0 ? (
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-brand">
                  <Camera className="h-7 w-7" />
                </div>
                <div className="font-semibold">Take photos or choose files</div>
                <div className="text-sm text-muted-foreground">JPG or PNG · clear, well-lit shots of the full sheets</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-xl">
                    <img src={src} alt={`Preview ${idx + 1}`} className="aspect-[3/4] w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeFile(idx); }}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground">
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-semibold">Add more</span>
                </div>
              </div>
            )}
          </label>
        </div>
      </form>

      <SiteFooter />
    </div>
  );
}
