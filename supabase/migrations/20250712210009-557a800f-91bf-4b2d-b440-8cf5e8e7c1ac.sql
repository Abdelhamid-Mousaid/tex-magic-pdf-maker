-- Drop the existing templates table and recreate for system templates
DROP TABLE IF EXISTS public.templates;

-- Create system_templates table for admin-managed templates
CREATE TABLE public.system_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level_id UUID REFERENCES public.levels(id),
  plan_id UUID REFERENCES public.subscription_plans(id),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_templates ENABLE ROW LEVEL SECURITY;

-- Create policies - all users can view active templates, but only admins can manage
CREATE POLICY "Anyone can view active system templates" 
ON public.system_templates 
FOR SELECT 
USING (is_active = true);

-- Create storage policies for system templates (more permissive for admin use)
CREATE POLICY "Anyone can view system template files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'latex-templates');

-- Add trigger for timestamp updates
CREATE TRIGGER update_system_templates_updated_at
BEFORE UPDATE ON public.system_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_system_templates_level_id ON public.system_templates(level_id);
CREATE INDEX idx_system_templates_plan_id ON public.system_templates(plan_id);
CREATE INDEX idx_system_templates_active ON public.system_templates(is_active);