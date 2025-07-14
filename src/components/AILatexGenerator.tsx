import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";

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

  const generatePrompt = () => {
    return `Génère un template LaTeX complet et professionnel pour un cahier de mathématiques avec les spécifications suivantes:

- Niveau: ${selectedLevel?.name_fr || 'Général'}
- Nom de l'étudiant: ${userProfile?.full_name || '[Nom]'}
- École: ${userProfile?.school_name || '[École]'}
- Année académique: ${userProfile?.academic_year || '[Année]'}

Le template doit inclure:
1. Configuration complète du document avec packages français
2. En-tête et pied de page personnalisés
3. Page de titre professionnelle
4. Table des matières
5. Sections pour: Cours, Exercices, Devoirs, Évaluations
6. Mise en page optimisée pour l'impression
7. Styles appropriés pour le niveau scolaire

Réponds uniquement avec le code LaTeX complet, sans explication.`;
  };

  const generateWithPuter = async () => {
    if (!window.puter?.ai?.chat) {
      toast.error("Puter SDK non disponible");
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    
    try {
      const prompt = generatePrompt();
      
      // Try DeepSeek Chat first
      setCurrentModel('deepseek-chat');
      console.log('Starting generation with deepseek-chat');
      
      const chatResponse = await window.puter.ai.chat(prompt, {
        model: 'deepseek-chat',
        stream: true
      });

      let fullContent = '';
      
      for await (const part of chatResponse) {
        if (part?.text) {
          fullContent += part.text;
          setStreamingContent(fullContent);
        }
      }

      if (fullContent.trim()) {
        console.log('DeepSeek Chat generated content:', fullContent.length, 'characters');
        onLatexGenerated(fullContent.trim());
        toast.success("Template LaTeX généré avec succès!");
        return;
      }

      // Fallback to DeepSeek Reasoner if chat didn't work
      console.log('Falling back to deepseek-reasoner');
      setCurrentModel('deepseek-reasoner');
      setStreamingContent('');
      
      const reasonerResponse = await window.puter.ai.chat(prompt, {
        model: 'deepseek-reasoner',
        stream: true
      });

      fullContent = '';
      
      for await (const part of reasonerResponse) {
        if (part?.text) {
          fullContent += part.text;
          setStreamingContent(fullContent);
        }
      }

      if (fullContent.trim()) {
        console.log('DeepSeek Reasoner generated content:', fullContent.length, 'characters');
        onLatexGenerated(fullContent.trim());
        toast.success("Template LaTeX généré avec DeepSeek Reasoner!");
      } else {
        throw new Error('Aucun contenu généré');
      }

    } catch (error) {
      console.error('Erreur génération AI:', error);
      toast.error("Erreur lors de la génération AI");
    } finally {
      setIsGenerating(false);
      setCurrentModel(null);
      setStreamingContent('');
    }
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Génère un template LaTeX personnalisé avec l'IA
            </p>
            {currentModel && (
              <Badge variant="secondary" className="text-xs">
                {currentModel === 'deepseek-chat' ? 'DeepSeek Chat' : 'DeepSeek Reasoner'}
              </Badge>
            )}
          </div>
          <Button 
            onClick={generateWithPuter}
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

        {streamingContent && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Génération en cours...</h4>
            <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{streamingContent.substring(0, 500)}</pre>
              {streamingContent.length > 500 && (
                <p className="text-primary mt-2">
                  ... et {streamingContent.length - 500} caractères de plus
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};