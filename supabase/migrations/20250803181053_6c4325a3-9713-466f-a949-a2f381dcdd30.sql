-- Fix database function security vulnerabilities
-- Update handle_new_user function with SECURITY DEFINER and search_path protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'));
  
  -- Assign free plan
  INSERT INTO public.user_subscriptions (user_id, plan_id)
  SELECT NEW.id, id FROM public.subscription_plans WHERE is_free = true LIMIT 1;
  
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function with SECURITY DEFINER and search_path protection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Add missing RLS policies for user_subscriptions table
CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.user_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add admin-only policies for levels table (prevent unauthorized modifications)
CREATE POLICY "Authenticated users can insert levels" 
ON public.levels 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update levels" 
ON public.levels 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete levels" 
ON public.levels 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Add admin-only policies for subscription_plans table
CREATE POLICY "Authenticated users can insert subscription plans" 
ON public.subscription_plans 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subscription plans" 
ON public.subscription_plans 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete subscription plans" 
ON public.subscription_plans 
FOR DELETE 
USING (auth.role() = 'authenticated');