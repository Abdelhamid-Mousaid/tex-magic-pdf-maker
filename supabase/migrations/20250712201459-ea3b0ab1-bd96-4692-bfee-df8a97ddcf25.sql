-- Enrichir la table profiles avec les nouveaux champs
ALTER TABLE public.profiles 
ADD COLUMN school_name TEXT,
ADD COLUMN academic_year TEXT,
ADD COLUMN name_changes_count INTEGER DEFAULT 0;

-- Créer une fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();