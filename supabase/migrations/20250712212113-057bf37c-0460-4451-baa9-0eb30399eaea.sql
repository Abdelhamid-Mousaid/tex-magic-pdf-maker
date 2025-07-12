-- Drop the conflicting user-specific storage policies
DROP POLICY IF EXISTS "Users can view their own template files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own template files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own template files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own template files" ON storage.objects;

-- Update the system template storage policies to be more specific
DROP POLICY IF EXISTS "Authenticated users can view latex templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload latex templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update latex templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete latex templates" ON storage.objects;

-- Create comprehensive storage policies for latex-templates bucket
CREATE POLICY "Public can view system templates" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'latex-templates' AND (storage.foldername(name))[1] = 'system');

CREATE POLICY "Authenticated users can manage system templates" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'latex-templates' AND (storage.foldername(name))[1] = 'system')
WITH CHECK (bucket_id = 'latex-templates' AND (storage.foldername(name))[1] = 'system');

CREATE POLICY "Users can manage their own templates" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'latex-templates' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'latex-templates' AND (storage.foldername(name))[1] = auth.uid()::text);