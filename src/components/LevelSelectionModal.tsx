import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, School, BookOpen, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Level {
  id: string;
  name: string;
  name_fr: string;
  order_index: number;
}

interface LevelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (selectedLevel: Level) => void;
  loading?: boolean;
}

const LevelSelectionModal: React.FC<LevelSelectionModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  loading = false
}) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLevels();
    }
  }, [isOpen]);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les niveaux.",
        variant: "destructive"
      });
    } finally {
      setLoadingLevels(false);
    }
  };

  const handleGenerate = () => {
    if (selectedLevel) {
      onGenerate(selectedLevel);
    }
  };

  const handleClose = () => {
    setSelectedLevel(null);
    onClose();
  };

  const getLevelCategory = (orderIndex: number) => {
    if (orderIndex <= 3) return 'Collège';
    if (orderIndex <= 5) return 'Tronc Commun';
    return 'Baccalauréat';
  };

  const getCategoryIcon = (orderIndex: number) => {
    if (orderIndex <= 3) return School;
    if (orderIndex <= 5) return BookOpen;
    return GraduationCap;
  };

  const getCategoryColor = (orderIndex: number) => {
    if (orderIndex <= 3) return 'bg-blue-100 text-blue-700';
    if (orderIndex <= 5) return 'bg-green-100 text-green-700';
    return 'bg-purple-100 text-purple-700';
  };

  // Group levels by category
  const groupedLevels = levels.reduce((acc, level) => {
    const category = getLevelCategory(level.order_index);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(level);
    return acc;
  }, {} as Record<string, Level[]>);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span>Choisir le Niveau de Classe</span>
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le niveau pour lequel vous souhaitez générer un document PDF personnalisé.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingLevels ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des niveaux...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLevels).map(([category, categoryLevels]) => {
                const firstLevel = categoryLevels[0];
                const IconComponent = getCategoryIcon(firstLevel.order_index);
                const categoryColor = getCategoryColor(firstLevel.order_index);
                
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">{category}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoryLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedLevel(level)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                            selectedLevel?.id === level.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`text-xs ${categoryColor}`}>
                              {level.name}
                            </Badge>
                            {selectedLevel?.id === level.id && (
                              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{level.name_fr}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedLevel || loading || loadingLevels}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Générer le PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelSelectionModal;