-- Continue populating system_templates table with remaining levels

-- TCSF Templates
INSERT INTO public.system_templates (name, file_path, level_id, semester, chapter_number, is_active) VALUES
('Chapitre 1', 'TCSF/1er_semestre/CH-1.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '1er_semestre', 1, true),
('Chapitre 2', 'TCSF/1er_semestre/CH-2.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '1er_semestre', 2, true),
('Chapitre 3', 'TCSF/1er_semestre/CH-3.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '1er_semestre', 3, true),
('Chapitre 4', 'TCSF/1er_semestre/CH-4.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '1er_semestre', 4, true),
('Chapitre 5', 'TCSF/1er_semestre/CH-5.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '1er_semestre', 5, true),
('Chapitre 1', 'TCSF/2eme_semestre/CH-1.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '2eme_semestre', 1, true),
('Chapitre 2', 'TCSF/2eme_semestre/CH-2.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '2eme_semestre', 2, true),
('Chapitre 3', 'TCSF/2eme_semestre/CH-3.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '2eme_semestre', 3, true),
('Chapitre 4', 'TCSF/2eme_semestre/CH-4.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '2eme_semestre', 4, true),
('Chapitre 5', 'TCSF/2eme_semestre/CH-5.tex', '48b4c8cb-4807-403b-9dea-81fedf3f7fec', '2eme_semestre', 5, true),

-- TCLSHF Templates
('Chapitre 1', 'TCLSHF/1er_semestre/CH-1.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '1er_semestre', 1, true),
('Chapitre 2', 'TCLSHF/1er_semestre/CH-2.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '1er_semestre', 2, true),
('Chapitre 3', 'TCLSHF/1er_semestre/CH-3.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '1er_semestre', 3, true),
('Chapitre 4', 'TCLSHF/1er_semestre/CH-4.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '1er_semestre', 4, true),
('Chapitre 5', 'TCLSHF/1er_semestre/CH-5.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '1er_semestre', 5, true),
('Chapitre 1', 'TCLSHF/2eme_semestre/CH-1.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '2eme_semestre', 1, true),
('Chapitre 2', 'TCLSHF/2eme_semestre/CH-2.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '2eme_semestre', 2, true),
('Chapitre 3', 'TCLSHF/2eme_semestre/CH-3.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '2eme_semestre', 3, true),
('Chapitre 4', 'TCLSHF/2eme_semestre/CH-4.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '2eme_semestre', 4, true),
('Chapitre 5', 'TCLSHF/2eme_semestre/CH-5.tex', 'ec51b004-650a-44a2-aba7-57394560efa9', '2eme_semestre', 5, true),

-- 1BACSF Templates
('Chapitre 1', '1BACSF/1er_semestre/CH-1.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '1er_semestre', 1, true),
('Chapitre 2', '1BACSF/1er_semestre/CH-2.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '1er_semestre', 2, true),
('Chapitre 3', '1BACSF/1er_semestre/CH-3.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '1er_semestre', 3, true),
('Chapitre 4', '1BACSF/1er_semestre/CH-4.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '1er_semestre', 4, true),
('Chapitre 5', '1BACSF/1er_semestre/CH-5.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '1er_semestre', 5, true),
('Chapitre 1', '1BACSF/2eme_semestre/CH-1.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '2eme_semestre', 1, true),
('Chapitre 2', '1BACSF/2eme_semestre/CH-2.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '2eme_semestre', 2, true),
('Chapitre 3', '1BACSF/2eme_semestre/CH-3.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '2eme_semestre', 3, true),
('Chapitre 4', '1BACSF/2eme_semestre/CH-4.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '2eme_semestre', 4, true),
('Chapitre 5', '1BACSF/2eme_semestre/CH-5.tex', '0511b8be-143f-4fdb-aa68-c83ce850cc5c', '2eme_semestre', 5, true);