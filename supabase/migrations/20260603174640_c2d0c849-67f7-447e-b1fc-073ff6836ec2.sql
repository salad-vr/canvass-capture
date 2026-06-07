
CREATE POLICY "walk_sheets_select" ON storage.objects FOR SELECT USING (bucket_id = 'walk-sheets');
CREATE POLICY "walk_sheets_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'walk-sheets');
CREATE POLICY "walk_sheets_update" ON storage.objects FOR UPDATE USING (bucket_id = 'walk-sheets');
CREATE POLICY "walk_sheets_delete" ON storage.objects FOR DELETE USING (bucket_id = 'walk-sheets');
