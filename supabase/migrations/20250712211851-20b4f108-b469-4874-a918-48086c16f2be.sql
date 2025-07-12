-- Create RLS policies for system_templates table to allow admin operations
CREATE POLICY "Authenticated users can insert system templates" 
ON public.system_templates 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update system templates" 
ON public.system_templates 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete system templates" 
ON public.system_templates 
FOR DELETE 
TO authenticated 
USING (true);

-- Create storage policies for latex-templates bucket
CREATE POLICY "Authenticated users can view latex templates" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'latex-templates');

CREATE POLICY "Authenticated users can upload latex templates" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'latex-templates');

CREATE POLICY "Authenticated users can update latex templates" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'latex-templates');

CREATE POLICY "Authenticated users can delete latex templates" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'latex-templates');