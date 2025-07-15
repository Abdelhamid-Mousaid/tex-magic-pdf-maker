import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  chapter_number: number;
  plan_id?: string;
}

interface UserSubscription {
  subscription_plans: {
    id: string;
    is_free: boolean;
  };
}

interface ChapterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChapterSelected: (template: Template) => void;
  levelId?: string;
  semester?: string;
  levelName?: string;
}

export function ChapterSelectionModal({ 
  isOpen, 
  onClose, 
  onChapterSelected, 
  levelId,
  semester,
  levelName 
}: ChapterSelectionModalProps) {
  const [selectedChapter, setSelectedChapter] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && levelId && semester) {
      fetchUserSubscription();
    }
  }, [isOpen, levelId, semester]);

  const fetchUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('subscription_plans(id, is_free)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      setUserSubscription(data);
      await fetchTemplates(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      // Fallback to free plan if error
      const freePlanData = { subscription_plans: { id: '5aa5f210-a92a-4699-bf03-4cb9d2cfc8b4', is_free: true } };
      setUserSubscription(freePlanData);
      await fetchTemplates(freePlanData);
    }
  };

  const fetchTemplates = async (subscription: UserSubscription | null = userSubscription) => {
    setLoading(true);
    try {
      let query = supabase
        .from('system_templates')
        .select('*')
        .eq('level_id', levelId)
        .eq('semester', semester)
        .eq('is_active', true);

      // If user has free plan, only show templates assigned to free plan
      if (subscription?.subscription_plans.is_free) {
        query = query.eq('plan_id', subscription.subscription_plans.id);
      }
      // For paid plans, show templates with matching plan_id OR null (available to all paid plans)
      else {
        query = query.or(`plan_id.is.null,plan_id.eq.${subscription?.subscription_plans.id}`);
      }

      const { data, error } = await query.order('chapter_number');

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les chapitres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = (template: Template) => {
    setSelectedChapter(template);
  };

  const handleContinue = () => {
    if (selectedChapter) {
      onChapterSelected(selectedChapter);
      setSelectedChapter(null);
    }
  };

  const handleClose = () => {
    setSelectedChapter(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner le Chapitre</DialogTitle>
          {levelName && semester && (
            <p className="text-muted-foreground">
              Niveau: {levelName} - {semester.replace('_', ' ')}
            </p>
          )}
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des chapitres...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedChapter?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleChapterSelect(template)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Chapitre {template.chapter_number}
                    </CardTitle>
                    <CardDescription>{template.name}</CardDescription>
                  </CardHeader>
                  {template.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {templates.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucun chapitre disponible pour cette sélection.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!selectedChapter}
              >
                Générer le PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}