-- Update system_templates to assign the free plan to only Chapter 1, Semester 1 templates
-- First, get the free plan ID
UPDATE system_templates 
SET plan_id = '5aa5f210-a92a-4699-bf03-4cb9d2cfc8b4'
WHERE chapter_number = 1 AND semester = '1er_semestre';

-- All other templates will remain with plan_id = NULL, meaning they require paid plans
-- This ensures free users can only access Chapter 1 from first semester across all levels