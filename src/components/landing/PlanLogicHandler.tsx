import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Package, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserInfo {
  email: string;
  fullName: string;
  schoolName: string;
  academicYear: string;
  date: string;
}

interface ContentSelection {
  levelId: string;
  levelName: string;
  semester: string;
  chapter: string;
  allChapters: boolean;
}

interface PlanLogicHandlerProps {
  userInfo: UserInfo;
  contentSelection: ContentSelection;
  selectedPlan: string;
}

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

const PlanLogicHandler: React.FC<PlanLogicHandlerProps> = ({
  userInfo,
  contentSelection,
  selectedPlan
}) => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [generatedFileName, setGeneratedFileName] = useState<string>('');
  const { toast } = useToast();

  const getPlanDetails = () => {
    switch (selectedPlan) {
      case 'free':
        return {
          name: 'Plan Gratuit',
          description: 'Accès au CH_1 du 1er semestre',
          price: '0 DH',
          color: 'text-muted-foreground'
        };
      case '1er_semestre':
        return {
          name: '1er Semestre',
          description: 'Tous les chapitres du 1er semestre',
          price: '150 DH',
          color: 'text-primary'
        };
      case '2eme_semestre':
        return {
          name: '2ème Semestre',
          description: 'Tous les chapitres du 2ème semestre',
          price: '150 DH',
          color: 'text-primary'
        };
      case 'annee_complete':
        return {
          name: 'Année Complète',
          description: 'Accès aux 2 semestres complets',
          price: '200 DH',
          color: 'text-accent'
        };
      default:
        return {
          name: 'Plan Inconnu',
          description: '',
          price: '0 DH',
          color: 'text-muted-foreground'
        };
    }
  };

  const generatePDF = async () => {
    setStatus('generating');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);

      const requestData = {
        userInfo: {
          full_name: userInfo.fullName,
          school_name: userInfo.schoolName,
          academic_year: userInfo.academicYear,
          level_name: contentSelection.levelName,
          email: userInfo.email,
          date: userInfo.date
        },
        levelName: contentSelection.levelName,
        semester: contentSelection.semester,
        chapter: contentSelection.chapter,
        allChapters: contentSelection.allChapters,
        selectedPlan
      };

      let response;
      
      if (contentSelection.allChapters) {
        // Generate multiple PDFs and zip them
        response = await supabase.functions.invoke('generate-bulk-pdfs', {
          body: requestData
        });
      } else {
        // Generate single PDF
        response = await supabase.functions.invoke('compile-latex-pdf', {
          body: {
            template_path: `templates/${contentSelection.levelId}/${contentSelection.semester}/${contentSelection.chapter}.tex`,
            user_info: requestData.userInfo,
            level_name: contentSelection.levelName,
            semester: contentSelection.semester,
            chapter_number: parseInt(contentSelection.chapter.replace('CH_', '')),
            template_name: contentSelection.chapter
          }
        });
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (response.error) {
        throw new Error(response.error.message || 'Erreur lors de la génération');
      }

      if (response.data?.downloadUrl) {
        setDownloadUrl(response.data.downloadUrl);
        setGeneratedFileName(response.data.filename || 'document.pdf');
        setStatus('completed');
        
        toast({
          title: "✅ Génération réussie!",
          description: contentSelection.allChapters 
            ? "Votre archive ZIP est prête à télécharger"
            : "Votre PDF est prêt à télécharger"
        });
      } else {
        throw new Error('Aucun lien de téléchargement reçu');
      }

    } catch (error) {
      console.error('Erreur génération PDF:', error);
      setStatus('error');
      
      toast({
        title: "❌ Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "📥 Téléchargement lancé",
        description: "Votre fichier est en cours de téléchargement"
      });
    }
  };

  const planDetails = getPlanDetails();

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-accent/20 bg-gradient-to-br from-card to-accent/5">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-accent flex items-center justify-center gap-2">
          <Package className="h-6 w-6" />
          Génération de votre document
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Votre sélection est prête à être générée
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Résumé de la commande */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Plan sélectionné:</span>
            <Badge variant="outline" className={planDetails.color}>
              {planDetails.name} - {planDetails.price}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Professeur:</span>
              <span className="font-medium">{userInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>École:</span>
              <span className="font-medium">{userInfo.schoolName}</span>
            </div>
            <div className="flex justify-between">
              <span>Niveau:</span>
              <span className="font-medium">{contentSelection.levelName}</span>
            </div>
            <div className="flex justify-between">
              <span>Semestre:</span>
              <span className="font-medium">{contentSelection.semester.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Contenu:</span>
              <span className="font-medium">
                {contentSelection.allChapters 
                  ? 'Tous les chapitres (ZIP)' 
                  : contentSelection.chapter
                }
              </span>
            </div>
          </div>
        </div>

        {/* Status de génération */}
        {status === 'generating' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">
                {contentSelection.allChapters 
                  ? 'Génération des PDFs et création de l\'archive...' 
                  : 'Génération du PDF en cours...'
                }
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              {progress}% - Veuillez patienter...
            </p>
          </div>
        )}

        {/* Status completé */}
        {status === 'completed' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Génération terminée!</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
              <p className="text-sm text-primary">
                ✅ Votre {contentSelection.allChapters ? 'archive ZIP' : 'PDF'} est prêt: 
                <span className="font-medium ml-1">{generatedFileName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Status erreur */}
        {status === 'error' && (
          <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive">
              ❌ Une erreur s'est produite lors de la génération. Veuillez réessayer.
            </p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-3">
          {status === 'idle' && (
            <Button 
              onClick={generatePDF}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              {contentSelection.allChapters 
                ? 'Générer tous les PDFs (ZIP)' 
                : 'Générer le PDF'
              }
            </Button>
          )}

          {status === 'completed' && downloadUrl && (
            <Button 
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Télécharger {contentSelection.allChapters ? 'l\'archive ZIP' : 'le PDF'}
            </Button>
          )}

          {(status === 'error' || status === 'completed') && (
            <Button 
              onClick={() => {
                setStatus('idle');
                setProgress(0);
                setDownloadUrl('');
                setGeneratedFileName('');
              }}
              variant="outline"
              className="w-full"
            >
              Nouvelle génération
            </Button>
          )}
        </div>

        {/* Note de paiement pour les plans payants */}
        {selectedPlan !== 'free' && status === 'idle' && (
          <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
            <p className="text-sm text-accent-foreground">
              💳 <strong>Paiement:</strong> Pour les plans payants, le paiement sera traité 
              via nos partenaires sécurisés après la génération du document.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanLogicHandler;