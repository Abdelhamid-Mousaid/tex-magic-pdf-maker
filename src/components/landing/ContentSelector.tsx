import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, FileText, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Level {
  id: string;
  name: string;
  name_fr: string;
  order_index: number;
}

interface ContentSelection {
  levelId: string;
  levelName: string;
  semester: string;
  chapter: string;
  allChapters: boolean;
}

interface ContentSelectorProps {
  onSelectionChange: (selection: ContentSelection) => void;
  selectedPlan: string;
  isLoading?: boolean;
}

const ContentSelector: React.FC<ContentSelectorProps> = ({ 
  onSelectionChange, 
  selectedPlan, 
  isLoading = false 
}) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [allChapters, setAllChapters] = useState(false);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    if (selectedLevel && selectedSemester) {
      updateAvailableChapters();
    }
  }, [selectedLevel, selectedSemester, selectedPlan]);

  useEffect(() => {
    if (selectedLevel && selectedSemester) {
      const levelName = levels.find(l => l.id === selectedLevel)?.name_fr || '';
      onSelectionChange({
        levelId: selectedLevel,
        levelName,
        semester: selectedSemester,
        chapter: selectedChapter,
        allChapters
      });
    }
  }, [selectedLevel, selectedSemester, selectedChapter, allChapters, levels]);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const updateAvailableChapters = () => {
    // For demo purposes, showing 5 chapters per semester
    const chapters = ['CH_1', 'CH_2', 'CH_3', 'CH_4', 'CH_5'];
    setAvailableChapters(chapters);
    
    // For free plan, only CH_1 is available in 1er semestre
    if (selectedPlan === 'free' && selectedSemester === '1er_semestre') {
      setAvailableChapters(['CH_1']);
      setSelectedChapter('CH_1');
    } else if (selectedPlan === 'free') {
      setAvailableChapters([]);
      setSelectedChapter('');
    }
  };

  const getLevelCategory = (orderIndex: number): string => {
    if (orderIndex <= 3) return 'Collège';
    return 'Lycée';
  };

  const getLevelIcon = (orderIndex: number) => {
    if (orderIndex <= 3) return <BookOpen className="h-4 w-4" />;
    return <Layers className="h-4 w-4" />;
  };

  const canSelectAllChapters = selectedPlan !== 'free' && availableChapters.length > 1;
  const canSelectSemester = selectedPlan !== 'free' || selectedSemester === '1er_semestre';

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-secondary flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          Sélection du Contenu
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choisissez le niveau, semestre et chapitre
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Niveau de classe */}
        <div className="space-y-2">
          <Label htmlFor="level" className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Niveau de classe
          </Label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="bg-background border-secondary/20 focus:border-secondary">
              <SelectValue placeholder="Sélectionnez un niveau" />
            </SelectTrigger>
            <SelectContent className="bg-background border-secondary/20 z-50">
              {levels.map((level) => (
                <SelectItem key={level.id} value={level.id} className="focus:bg-secondary/10">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(level.order_index)}
                    <span>{level.name_fr}</span>
                    <Badge variant="outline" className="text-xs">
                      {getLevelCategory(level.order_index)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semestre */}
        {selectedLevel && (
          <div className="space-y-2">
            <Label htmlFor="semester" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Semestre
              {selectedPlan === 'free' && (
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent-foreground">
                  Gratuit: 1er semestre uniquement
                </Badge>
              )}
            </Label>
            <Select 
              value={selectedSemester} 
              onValueChange={setSelectedSemester}
              disabled={selectedPlan === 'free' && selectedSemester && selectedSemester !== '1er_semestre'}
            >
              <SelectTrigger className="bg-background border-secondary/20 focus:border-secondary">
                <SelectValue placeholder="Sélectionnez un semestre" />
              </SelectTrigger>
              <SelectContent className="bg-background border-secondary/20 z-50">
                <SelectItem value="1er_semestre" className="focus:bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    1er Semestre
                    {selectedPlan === 'free' && <Badge variant="secondary" className="text-xs">Gratuit</Badge>}
                  </div>
                </SelectItem>
                {selectedPlan !== 'free' && (
                  <SelectItem value="2eme_semestre" className="focus:bg-secondary/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      2ème Semestre
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Chapitre */}
        {selectedLevel && selectedSemester && availableChapters.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Chapitre
            </Label>
            
            {/* Option pour tous les chapitres */}
            {canSelectAllChapters && (
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-accent/5 border-accent/20">
                <input
                  type="checkbox"
                  id="allChapters"
                  checked={allChapters}
                  onChange={(e) => {
                    setAllChapters(e.target.checked);
                    if (e.target.checked) {
                      setSelectedChapter('');
                    }
                  }}
                  className="w-4 h-4 text-accent border-accent/30 rounded focus:ring-accent"
                />
                <Label htmlFor="allChapters" className="text-sm font-medium text-accent-foreground">
                  Tous les chapitres du {selectedSemester.replace('_', ' ')} 
                  <Badge variant="outline" className="ml-2 text-xs bg-accent/10">
                    ZIP de {availableChapters.length} PDFs
                  </Badge>
                </Label>
              </div>
            )}

            {/* Sélection chapitre individuel */}
            {!allChapters && (
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger className="bg-background border-secondary/20 focus:border-secondary">
                  <SelectValue placeholder="Sélectionnez un chapitre" />
                </SelectTrigger>
                <SelectContent className="bg-background border-secondary/20 z-50">
                  {availableChapters.map((chapter) => (
                    <SelectItem key={chapter} value={chapter} className="focus:bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {chapter}
                        {selectedPlan === 'free' && chapter === 'CH_1' && (
                          <Badge variant="secondary" className="text-xs">Gratuit</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Résumé de la sélection */}
        {selectedLevel && selectedSemester && (selectedChapter || allChapters) && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-2">Résumé de votre sélection:</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Niveau:</strong> {levels.find(l => l.id === selectedLevel)?.name_fr}</p>
              <p><strong>Semestre:</strong> {selectedSemester.replace('_', ' ')}</p>
              <p><strong>Contenu:</strong> {allChapters ? `Tous les chapitres (${availableChapters.length} PDFs)` : selectedChapter}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentSelector;