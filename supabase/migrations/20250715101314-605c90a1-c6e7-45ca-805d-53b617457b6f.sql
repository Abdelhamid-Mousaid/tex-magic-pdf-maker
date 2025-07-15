-- Create storage bucket for latex templates
INSERT INTO storage.buckets (id, name, public) VALUES ('latex-templates', 'latex-templates', false);

-- Create storage policies for latex templates
CREATE POLICY "Authenticated users can view latex templates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'latex-templates' AND auth.role() = 'authenticated');

-- Add semester and chapter columns to system_templates table
ALTER TABLE public.system_templates 
ADD COLUMN semester TEXT,
ADD COLUMN chapter_number INTEGER;

-- Create index for better performance on template lookups
CREATE INDEX idx_system_templates_level_semester_chapter 
ON public.system_templates(level_id, semester, chapter_number) 
WHERE is_active = true;