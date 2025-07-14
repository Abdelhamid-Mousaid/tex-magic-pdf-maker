import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateLatexRequest {
  level: string
  chapter: string
  subject?: string
  language: 'fr' | 'en'
}

// Function to call Puter DeepSeek API
async function callPuterDeepSeek(prompt: string, model: 'deepseek-chat' | 'deepseek-reasoner'): Promise<string> {
  console.log(`Calling Puter DeepSeek API with model: ${model}`);
  
  try {
    // Using Puter's public API endpoint
    const response = await fetch('https://api.puter.com/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        stream: false
      })
    });
    
    console.log(`Puter ${model} API response status:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Puter ${model} API error:`, errorText);
      throw new Error(`Puter API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Puter ${model} API response received`);
    
    const content = data.choices?.[0]?.message?.content || data.response || '';
    
    if (!content) {
      console.error(`No content in Puter ${model} response:`, data);
      throw new Error(`No content received from Puter ${model} API`);
    }
    
    console.log(`Content generated using ${model}, length:`, content.length);
    return content;
    
  } catch (error) {
    console.error(`Puter ${model} API error:`, error);
    throw error;
  }
}

// Function to generate LaTeX with DeepSeek fallbacks
async function generateLatexWithDeepSeek(prompt: string): Promise<string> {
  let latexContent = '';
  let provider = '';
  
  // Try DeepSeek Chat first
  try {
    latexContent = await callPuterDeepSeek(prompt, 'deepseek-chat');
    provider = 'DeepSeek Chat';
    console.log('Successfully generated LaTeX using DeepSeek Chat');
  } catch (error) {
    console.log('DeepSeek Chat failed, falling back to DeepSeek Reasoner:', error.message);
    
    // Fallback to DeepSeek Reasoner
    try {
      latexContent = await callPuterDeepSeek(prompt, 'deepseek-reasoner');
      provider = 'DeepSeek Reasoner';
      console.log('Successfully generated LaTeX using DeepSeek Reasoner');
    } catch (reasonerError) {
      console.error('All DeepSeek providers failed:', reasonerError.message);
      throw new Error('All DeepSeek providers failed to generate LaTeX content');
    }
  }
  
  if (!latexContent) {
    throw new Error('No LaTeX content generated from DeepSeek providers');
  }
  
  console.log(`LaTeX content generated using ${provider}, length:`, latexContent.length);
  return latexContent;
}

// Function to clean and validate LaTeX content
function cleanLatexContent(content: string): string {
  // Clean up the response - remove any markdown formatting
  let latexContent = content.replace(/```latex/g, '').replace(/```/g, '').trim();
  
  // Ensure proper LaTeX structure
  if (!latexContent.includes('\\documentclass')) {
    latexContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{geometry}
\\geometry{margin=2cm}

${latexContent}`;
  }

  if (!latexContent.includes('\\end{document}')) {
    latexContent += '\n\\end{document}';
  }
  
  return latexContent;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('AI LaTeX generation function called with Puter DeepSeek')
    
    // Parse request body with error handling
    let requestData;
    try {
      const body = await req.text();
      console.log('Raw request body:', body);
      requestData = JSON.parse(body);
      console.log('Parsed request data:', requestData);
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { level, chapter, subject, language }: GenerateLatexRequest = requestData;
    console.log('Request parameters:', { level, chapter, subject, language });

    if (!level || !chapter) {
      console.error('Missing required parameters:', { level, chapter });
      throw new Error('Level and chapter are required');
    }

    // Create a detailed prompt for LaTeX generation
    const prompt = language === 'fr' 
      ? `Génère un modèle LaTeX complet pour un chapitre de ${subject || 'mathématiques'} niveau ${level}, chapitre ${chapter}. 
         Le modèle doit inclure:
         - En-tête avec titre, nom de l'étudiant, école, année scolaire
         - Table des matières
         - Sections pour les cours, exercices et devoirs
         - Formatage approprié avec des commandes LaTeX
         - Support pour XeLaTeX avec des polices françaises
         - Structure claire et professionnelle
         
         Retourne uniquement le code LaTeX sans explication.`
      : `Generate a complete LaTeX template for a ${subject || 'mathematics'} chapter, level ${level}, chapter ${chapter}.
         The template should include:
         - Header with title, student name, school, academic year
         - Table of contents
         - Sections for lessons, exercises, and assignments
         - Proper LaTeX formatting and commands
         - XeLaTeX support with appropriate fonts
         - Clear and professional structure
         
         Return only the LaTeX code without explanation.`

    console.log('Generated prompt length:', prompt.length);

    // Generate LaTeX using Puter DeepSeek
    const rawLatexContent = await generateLatexWithDeepSeek(prompt);
    
    // Clean and validate the LaTeX content
    const latexContent = cleanLatexContent(rawLatexContent);

    console.log('Returning successful response')
    return new Response(
      JSON.stringify({ 
        latexContent,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('Error in generate-ai-latex function:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})