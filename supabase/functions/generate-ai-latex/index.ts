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

// Function to call Puter DeepSeek API with streaming response collection
async function callPuterDeepSeek(prompt: string, model: 'deepseek-chat' | 'deepseek-reasoner'): Promise<string> {
  console.log(`Calling Puter DeepSeek API with model: ${model}`);
  
  const puterScript = `
    // Import Puter SDK
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    document.head.appendChild(script);
    
    // Wait for Puter to load
    await new Promise(resolve => {
      script.onload = resolve;
    });
    
    // Call DeepSeek API with streaming
    let fullResponse = '';
    const response = await puter.ai.chat(
      "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}", 
      {
        model: '${model}',
        stream: true
      }
    );
    
    for await (const part of response) {
      if (part?.text) {
        fullResponse += part.text;
      }
    }
    
    return fullResponse;
  `;
  
  // Since we're in Deno Edge Functions, we need to simulate browser environment
  // We'll use a different approach - direct API call to Puter's endpoint
  try {
    const response = await fetch('https://api.puter.com/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        stream: false // Use non-streaming for Edge Function compatibility
      })
    });
    
    if (!response.ok) {
      throw new Error(`Puter API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.response || '';
    
  } catch (error) {
    console.error(`Puter ${model} API error:`, error);
    throw error;
  }
}

// Function to try Gemini API with retry logic
async function callGeminiAPI(prompt: string, geminiApiKey: string): Promise<string> {
  console.log('Calling Gemini API with retry logic...');
  
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
  
  // Retry logic for handling API overload
  let response;
  let lastError;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini API attempt ${attempt}/${maxRetries}`);
      
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      console.log(`Attempt ${attempt} - Gemini API response status:`, response.status);
      
      if (response.ok) {
        console.log('Gemini API call successful');
        break;
      }
      
      const errorData = await response.text();
      console.error(`Attempt ${attempt} - Gemini API error response:`, errorData);
      
      // Parse error to check if it's retryable
      let errorObj;
      try {
        errorObj = JSON.parse(errorData);
      } catch {
        errorObj = { error: { code: response.status, message: errorData } };
      }
      
      lastError = errorObj;
      
      // Check if error is retryable (503 Service Unavailable, 429 Too Many Requests)
      if (response.status === 503 || response.status === 429) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If not retryable or max retries reached, throw error
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
      
    } catch (fetchError: any) {
      console.error(`Attempt ${attempt} - Fetch error:`, fetchError.message);
      lastError = { error: { code: 'NETWORK_ERROR', message: fetchError.message } };
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Network error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw fetchError;
    }
  }
  
  if (!response || !response.ok) {
    const errorMessage = lastError?.error?.message || 'Unknown error from Gemini API';
    throw new Error(`Gemini API failed after ${maxRetries} attempts: ${errorMessage}`);
  }

  const data = await response.json()
  console.log('Gemini API response received')
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error('Invalid Gemini API response structure:', data)
    throw new Error('Invalid response from Gemini API')
  }

  return data.candidates[0].content.parts[0].text;
}

// Function to generate LaTeX with multiple AI provider fallbacks
async function generateLatexWithFallbacks(prompt: string, geminiApiKey?: string): Promise<string> {
  let latexContent = '';
  let provider = '';
  
  // Try Gemini first if API key is available
  if (geminiApiKey) {
    try {
      latexContent = await callGeminiAPI(prompt, geminiApiKey);
      provider = 'Gemini';
      console.log('Successfully generated LaTeX using Gemini');
    } catch (error) {
      console.log('Gemini failed, falling back to DeepSeek Chat:', error.message);
    }
  } else {
    console.log('No Gemini API key, skipping to DeepSeek fallbacks');
  }
  
  // Fallback to DeepSeek Chat if Gemini failed
  if (!latexContent) {
    try {
      latexContent = await callPuterDeepSeek(prompt, 'deepseek-chat');
      provider = 'DeepSeek Chat';
      console.log('Successfully generated LaTeX using DeepSeek Chat');
    } catch (error) {
      console.log('DeepSeek Chat failed, falling back to DeepSeek Reasoner:', error.message);
    }
  }
  
  // Final fallback to DeepSeek Reasoner
  if (!latexContent) {
    try {
      latexContent = await callPuterDeepSeek(prompt, 'deepseek-reasoner');
      provider = 'DeepSeek Reasoner';
      console.log('Successfully generated LaTeX using DeepSeek Reasoner');
    } catch (error) {
      console.error('All AI providers failed:', error.message);
      throw new Error('All AI providers failed to generate LaTeX content');
    }
  }
  
  if (!latexContent) {
    throw new Error('No LaTeX content generated from any provider');
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

    // Generate LaTeX using multiple AI providers with fallbacks
    const rawLatexContent = await generateLatexWithFallbacks(prompt, geminiApiKey);
    
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