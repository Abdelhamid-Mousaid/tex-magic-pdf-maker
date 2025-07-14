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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('AI LaTeX generation function called')
    
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

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not found in environment');
      throw new Error('Gemini API key not configured');
    }
    
    console.log('Gemini API key found, length:', geminiApiKey.length);

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

    console.log('Calling Gemini API...');
    
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    console.log('Gemini request body prepared, length:', requestBody.length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody
    });

    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json()
    console.log('Gemini API response received')
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini API response structure:', data)
      throw new Error('Invalid response from Gemini API')
    }

    let latexContent = data.candidates[0].content.parts[0].text
    console.log('LaTeX content generated, length:', latexContent.length)

    // Clean up the response - remove any markdown formatting
    latexContent = latexContent.replace(/```latex/g, '').replace(/```/g, '').trim()

    // Ensure proper LaTeX structure
    if (!latexContent.includes('\\documentclass')) {
      latexContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{geometry}
\\geometry{margin=2cm}

${latexContent}`
    }

    if (!latexContent.includes('\\end{document}')) {
      latexContent += '\n\\end{document}'
    }

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