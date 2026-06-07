
CREATE TABLE public.walk_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_name TEXT NOT NULL,
  route_name TEXT,
  notes TEXT,
  image_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.walk_sheets TO anon, authenticated;
GRANT ALL ON public.walk_sheets TO service_role;
ALTER TABLE public.walk_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all walk_sheets" ON public.walk_sheets FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.voter_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_sheet_id UUID NOT NULL REFERENCES public.walk_sheets(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  name TEXT,
  address TEXT,
  contact TEXT,
  support_level INT,
  sign BOOLEAN DEFAULT false,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voter_records TO anon, authenticated;
GRANT ALL ON public.voter_records TO service_role;
ALTER TABLE public.voter_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all voter_records" ON public.voter_records FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX voter_records_sheet_idx ON public.voter_records(walk_sheet_id);
