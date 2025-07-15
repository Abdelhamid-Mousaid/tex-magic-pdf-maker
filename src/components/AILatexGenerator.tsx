import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, FileText, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { LatexValidator } from "@/utils/latexValidator";

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options: {
          model: 'deepseek-chat' | 'deepseek-reasoner';
          stream: boolean;
        }) => AsyncIterableIterator<{ text?: string }>;
      };
    };
  }
}

interface AILatexGeneratorProps {
  userProfile: any;
  onLatexGenerated: (latex: string) => void;
  selectedLevel: any;
}

export const AILatexGenerator: React.FC<AILatexGeneratorProps> = ({
  userProfile,
  onLatexGenerated,
  selectedLevel
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentModel, setCurrentModel] = useState<'deepseek-chat' | 'deepseek-reasoner' | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  const generatePrompt = () => {
    return `IMPORTANT: Réponds UNIQUEMENT avec du code LaTeX valide. Aucune explication, aucun texte avant ou après.

Génère un template LaTeX complet et professionnel pour un cahier de mathématiques avec ces spécifications EXACTES:

INFORMATIONS PERSONNELLES:
- Niveau: ${selectedLevel?.name_fr || 'Général'}
- Nom de l'étudiant: ${userProfile?.full_name || '[Nom]'}
- École: ${userProfile?.school_name || '[École]'}
- Année académique: ${userProfile?.academic_year || '[Année]'}

STRUCTURE REQUISE (dans l'ordre):
\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{amsmath,amssymb,amsthm}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{fancyhdr,graphicx,xcolor}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{${userProfile?.full_name || '[Nom]'}}
\\fancyhead[C]{${selectedLevel?.name_fr || 'Mathématiques'}}
\\fancyhead[R]{${userProfile?.academic_year || '[Année]'}}
\\fancyfoot[C]{\\thepage}

\\title{Cahier de ${selectedLevel?.name_fr || 'Mathématiques'}}
\\author{${userProfile?.full_name || '[Nom]'}}
\\date{Année ${userProfile?.academic_year || '[Année]'}}

\\begin{document}
\\maketitle
\\tableofcontents
\\newpage

\\section{Cours}
[Contenu des cours]

\\section{Exercices}
[Exercices pratiques]

\\section{Devoirs}
[Devoirs à rendre]

\\section{Évaluations}
[Notes et évaluations]

\\end{document}

RÈGLES STRICTES:
- Commencer directement par \\documentclass
- Finir par \\end{document}
- Utiliser EXACTEMENT les packages listés
- Inclure les 4 sections requises
- Aucun texte explicatif
- Code LaTeX valide uniquement`;
  };

  const generateWithPuter = async (retryCount = 0) => {
    if (!window.puter?.ai?.chat) {
      toast.error("Puter SDK non disponible");
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    setGenerationProgress(0);
    setValidationResult(null);
    
    try {
      setGenerationStep('Préparation du prompt...');
      setGenerationProgress(10);
      
      const prompt = generatePrompt();
      
      setGenerationStep('Génération avec DeepSeek Chat...');
      setGenerationProgress(20);
      
      // Try DeepSeek Chat first
      setCurrentModel('deepseek-chat');
      console.log('Starting generation with deepseek-chat');
      
      const chatResponse = await window.puter.ai.chat(prompt, {
        model: 'deepseek-chat',
        stream: true
      });

      let fullContent = '';
      let chunkCount = 0;
      
      for await (const part of chatResponse) {
        if (part?.text) {
          fullContent += part.text;
          setStreamingContent(fullContent);
          chunkCount++;
          setGenerationProgress(Math.min(20 + (chunkCount * 2), 70));
        }
      }

      setGenerationStep('Validation du contenu...');
      setGenerationProgress(75);

      if (fullContent.trim()) {
        const validation = LatexValidator.validateAndClean(fullContent.trim());
        setValidationResult(validation);
        setGenerationProgress(90);

        if (validation.isValid) {
          console.log('DeepSeek Chat generated valid content:', validation.cleanedContent.length, 'characters');
          setLastGeneratedContent(validation.cleanedContent);
          onLatexGenerated(validation.cleanedContent);
          setGenerationProgress(100);
          toast.success("Template LaTeX généré et validé avec succès!");
          return;
        } else {
          console.warn('Generated content has issues:', validation.errors);
          if (retryCount < 1) {
            toast.warning("Contenu invalide, tentative avec DeepSeek Reasoner...");
          }
        }
      }

      // Fallback to DeepSeek Reasoner if chat didn't work or content invalid
      if (retryCount < 1) {
        console.log('Falling back to deepseek-reasoner');
        setGenerationStep('Génération avec DeepSeek Reasoner...');
        setGenerationProgress(30);
        setCurrentModel('deepseek-reasoner');
        setStreamingContent('');
        
        const reasonerResponse = await window.puter.ai.chat(prompt, {
          model: 'deepseek-reasoner',
          stream: true
        });

        fullContent = '';
        chunkCount = 0;
        
        for await (const part of reasonerResponse) {
          if (part?.text) {
            fullContent += part.text;
            setStreamingContent(fullContent);
            chunkCount++;
            setGenerationProgress(Math.min(30 + (chunkCount * 2), 70));
          }
        }

        setGenerationStep('Validation du contenu...');
        setGenerationProgress(75);

        if (fullContent.trim()) {
          const validation = LatexValidator.validateAndClean(fullContent.trim());
          setValidationResult(validation);
          setGenerationProgress(90);

          if (validation.isValid) {
            console.log('DeepSeek Reasoner generated valid content:', validation.cleanedContent.length, 'characters');
            setLastGeneratedContent(validation.cleanedContent);
            onLatexGenerated(validation.cleanedContent);
            setGenerationProgress(100);
            toast.success("Template LaTeX généré avec DeepSeek Reasoner!");
            return;
          } else {
            console.warn('Reasoner content also has issues:', validation.errors);
          }
        }
      }

      // Use fallback template if all else fails
      setGenerationStep('Utilisation du template de secours...');
      setGenerationProgress(95);
      
      const fallbackTemplate = LatexValidator.generateFallbackTemplate(userProfile, selectedLevel);
      setLastGeneratedContent(fallbackTemplate);
      onLatexGenerated(fallbackTemplate);
      setGenerationProgress(100);
      
      toast.warning("IA indisponible, template de base généré");

    } catch (error) {
      console.error('Erreur génération AI:', error);
      
      // Use fallback template on error
      const fallbackTemplate = LatexValidator.generateFallbackTemplate(userProfile, selectedLevel);
      setLastGeneratedContent(fallbackTemplate);
      onLatexGenerated(fallbackTemplate);
      
      toast.error("Erreur IA, template de base utilisé");
    } finally {
      setIsGenerating(false);
      setCurrentModel(null);
      setStreamingContent('');
      setTimeout(() => {
        setGenerationStep('');
        setGenerationProgress(0);
      }, 2000);
    }
  };

  const regenerateContent = () => {
    generateWithPuter(0);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Génération IA avec Puter DeepSeek
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">
                Génère un template LaTeX personnalisé avec l'IA
              </p>
              {currentModel && (
                <Badge variant="secondary" className="text-xs">
                  {currentModel === 'deepseek-chat' ? 'DeepSeek Chat' : 'DeepSeek Reasoner'}
                </Badge>
              )}
              {generationStep && (
                <p className="text-xs text-primary">{generationStep}</p>
              )}
            </div>
            <div className="flex gap-2">
              {lastGeneratedContent && !isGenerating && (
                <Button 
                  onClick={regenerateContent}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Régénérer
                </Button>
              )}
              <Button 
                onClick={() => generateWithPuter(0)}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isGenerating ? 'Génération...' : 'Générer'}
              </Button>
            </div>
          </div>

          {generationProgress > 0 && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{generationStep}</span>
                <span>{generationProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {validationResult && !isGenerating && (
          <div className={`p-3 rounded-lg border ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <h4 className="text-sm font-medium">
                {validationResult.isValid ? 'Validation réussie' : 'Problèmes détectés'}
              </h4>
            </div>
            {validationResult.errors.length > 0 && (
              <ul className="text-xs text-red-600 mb-2">
                {validationResult.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            )}
            {validationResult.warnings.length > 0 && (
              <ul className="text-xs text-yellow-600">
                {validationResult.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {streamingContent && isGenerating && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Génération en cours...</h4>
            <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{streamingContent.substring(0, 300)}</pre>
              {streamingContent.length > 300 && (
                <p className="text-primary mt-2">
                  ... et {streamingContent.length - 300} caractères de plus
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};