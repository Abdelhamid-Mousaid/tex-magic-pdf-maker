-- Create storage bucket for LaTeX templates
INSERT INTO storage.buckets (id, name, public) VALUES ('latex-templates', 'latex-templates', false);

-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own templates" 
ON public.templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for templates
CREATE POLICY "Users can view their own template files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'latex-templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own template files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'latex-templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own template files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'latex-templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own template files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'latex-templates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for timestamp updates
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();