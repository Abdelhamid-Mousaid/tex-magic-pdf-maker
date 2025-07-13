-- Delete the specific template file from storage
DELETE FROM storage.objects 
WHERE bucket_id = 'latex-templates' 
AND name = 'system/1752355306598-CH-1.tex';

-- Delete the template record from system_templates
DELETE FROM system_templates 
WHERE id = '50a2d1a7-6b98-4677-8456-1797e402d11c';