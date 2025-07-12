-- Add a policy allowing authenticated users to view all system templates (for admin purposes)
CREATE POLICY "Authenticated users can view all system templates" 
ON public.system_templates 
FOR SELECT 
TO authenticated 
USING (true);