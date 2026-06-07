ALTER TABLE public.walk_sheets ADD COLUMN image_paths TEXT[];
UPDATE public.walk_sheets SET image_paths = ARRAY[image_path] WHERE image_path IS NOT NULL;
ALTER TABLE public.walk_sheets ALTER COLUMN image_paths SET NOT NULL;
ALTER TABLE public.walk_sheets DROP COLUMN image_path;