-- Populate system_templates table with LaTeX templates
-- This creates entries for all levels, semesters, and chapters based on your folder structure

-- 1APIC Templates
INSERT INTO public.system_templates (name, file_path, level_id, semester, chapter_number, is_active) VALUES
('Chapitre 1', '1APIC/1er_semestre/CH-1.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '1er_semestre', 1, true),
('Chapitre 2', '1APIC/1er_semestre/CH-2.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '1er_semestre', 2, true),
('Chapitre 3', '1APIC/1er_semestre/CH-3.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '1er_semestre', 3, true),
('Chapitre 4', '1APIC/1er_semestre/CH-4.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '1er_semestre', 4, true),
('Chapitre 5', '1APIC/1er_semestre/CH-5.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '1er_semestre', 5, true),
('Chapitre 1', '1APIC/2eme_semestre/CH-1.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '2eme_semestre', 1, true),
('Chapitre 2', '1APIC/2eme_semestre/CH-2.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '2eme_semestre', 2, true),
('Chapitre 3', '1APIC/2eme_semestre/CH-3.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '2eme_semestre', 3, true),
('Chapitre 4', '1APIC/2eme_semestre/CH-4.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '2eme_semestre', 4, true),
('Chapitre 5', '1APIC/2eme_semestre/CH-5.tex', 'dc56d082-dd83-4967-a2b9-ea0ea8964470', '2eme_semestre', 5, true),

-- 2APIC Templates  
('Chapitre 1', '2APIC/1er_semestre/CH-1.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '1er_semestre', 1, true),
('Chapitre 2', '2APIC/1er_semestre/CH-2.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '1er_semestre', 2, true),
('Chapitre 3', '2APIC/1er_semestre/CH-3.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '1er_semestre', 3, true),
('Chapitre 4', '2APIC/1er_semestre/CH-4.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '1er_semestre', 4, true),
('Chapitre 5', '2APIC/1er_semestre/CH-5.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '1er_semestre', 5, true),
('Chapitre 1', '2APIC/2eme_semestre/CH-1.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '2eme_semestre', 1, true),
('Chapitre 2', '2APIC/2eme_semestre/CH-2.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '2eme_semestre', 2, true),
('Chapitre 3', '2APIC/2eme_semestre/CH-3.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '2eme_semestre', 3, true),
('Chapitre 4', '2APIC/2eme_semestre/CH-4.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '2eme_semestre', 4, true),
('Chapitre 5', '2APIC/2eme_semestre/CH-5.tex', 'aab3929b-9977-459f-9cdf-0931a1868243', '2eme_semestre', 5, true),

-- 3APIC Templates
('Chapitre 1', '3APIC/1er_semestre/CH-1.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '1er_semestre', 1, true),
('Chapitre 2', '3APIC/1er_semestre/CH-2.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '1er_semestre', 2, true),
('Chapitre 3', '3APIC/1er_semestre/CH-3.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '1er_semestre', 3, true),
('Chapitre 4', '3APIC/1er_semestre/CH-4.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '1er_semestre', 4, true),
('Chapitre 5', '3APIC/1er_semestre/CH-5.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '1er_semestre', 5, true),
('Chapitre 1', '3APIC/2eme_semestre/CH-1.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '2eme_semestre', 1, true),
('Chapitre 2', '3APIC/2eme_semestre/CH-2.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '2eme_semestre', 2, true),
('Chapitre 3', '3APIC/2eme_semestre/CH-3.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '2eme_semestre', 3, true),
('Chapitre 4', '3APIC/2eme_semestre/CH-4.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '2eme_semestre', 4, true),
('Chapitre 5', '3APIC/2eme_semestre/CH-5.tex', '1677fb05-bda2-4928-b004-cab6de1b4520', '2eme_semestre', 5, true);