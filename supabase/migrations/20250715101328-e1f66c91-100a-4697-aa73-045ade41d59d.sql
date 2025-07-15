-- Add semester and chapter columns to system_templates table
ALTER TABLE public.system_templates 
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS chapter_number INTEGER;

-- Create index for better performance on template lookups
CREATE INDEX IF NOT EXISTS idx_system_templates_level_semester_chapter 
ON public.system_templates(level_id, semester, chapter_number) 
WHERE is_active = true;