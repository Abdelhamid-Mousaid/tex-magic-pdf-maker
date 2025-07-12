-- Update levels table with Moroccan education system levels
DELETE FROM public.levels;

INSERT INTO public.levels (name, name_fr, order_index) VALUES
('1APIC', '1ère Année Préparatoire Internationale Collège', 1),
('2APIC', '2ème Année Préparatoire Internationale Collège', 2),
('3APIC', '3ème Année Préparatoire Internationale Collège', 3),
('TCSF', 'Tronc Commun Sciences Français', 4),
('TCLSHF', 'Tronc Commun Lettres et Sciences Humaines Français', 5),
('1BACSF', '1ère Bac Sciences Français', 6),
('1BACLSHF', '1ère Bac Lettres et Sciences Humaines Français', 7),
('2BACSM', '2ème Bac Sciences Mathématiques', 8),
('2BACPC', '2ème Bac Physique Chimie', 9),
('2BACSVT', '2ème Bac Sciences de la Vie et de la Terre', 10);