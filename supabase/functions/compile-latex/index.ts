import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  latexContent: string;
  userInfo: {
    level: string;
    name: string;
    [key: string]: any;
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMPILE-LATEX] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { latexContent, userInfo } = body;

    if (!latexContent || !latexContent.trim()) {
      throw new Error("No LaTeX content provided");
    }

    logStep("Received LaTeX content", { contentLength: latexContent.length });

    // Compile LaTeX using LaTeX.Online service
    const compileResponse = await fetch('https://latex.api.ytotech.com/builds/sync/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      },
      body: JSON.stringify({
        cmd: 'pdflatex',
        resources: [
          {
            main: true,
            file: 'main.tex',
            content: latexContent
          }
        ]
      })
    });

    logStep("LaTeX compilation attempted", { 
      status: compileResponse.status, 
      statusText: compileResponse.statusText 
    });

    if (!compileResponse.ok) {
      // Try alternative compilation method
      logStep("First compilation failed, trying alternative method");
      
      const altResponse = await fetch('https://texlive.net/cgi-bin/latexcgi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          filename: 'document.tex',
          filecontents: latexContent,
          engine: 'pdflatex',
          return: 'pdf'
        })
      });

      if (!altResponse.ok) {
        // If both fail, create a simple PDF with error message
        logStep("All LaTeX compilation methods failed, creating error PDF");
        
        // Return to the original PDF generation but with the raw LaTeX
        const fallbackResponse = await supabase.functions.invoke('generate-pdf', {
          body: {
            userInfo: userInfo,
            customLatexContent: `ERREUR DE COMPILATION LATEX\n\nLe contenu LaTeX généré n'a pas pu être compilé.\n\nContenu LaTeX original:\n\n${latexContent.substring(0, 1000)}${latexContent.length > 1000 ? '\n...\n[contenu tronqué]' : ''}`
          }
        });

        if (fallbackResponse.error) {
          throw new Error(`Fallback PDF generation failed: ${fallbackResponse.error.message}`);
        }

        return new Response(JSON.stringify(fallbackResponse.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const pdfBuffer = await altResponse.arrayBuffer();
      logStep("Alternative LaTeX compilation successful", { pdfSize: pdfBuffer.byteLength });

      // Convert to base64 data URL
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
      const dataUrl = `data:application/pdf;base64,${base64Content}`;

      const result = {
        success: true,
        downloadUrl: dataUrl,
        filename: `latex-compiled-${(userInfo.level || 'document').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}.pdf`,
        message: "LaTeX document compiled successfully"
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Main compilation was successful
    const pdfBuffer = await compileResponse.arrayBuffer();
    logStep("LaTeX compilation successful", { pdfSize: pdfBuffer.byteLength });

    // Convert to base64 data URL
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    const dataUrl = `data:application/pdf;base64,${base64Content}`;

    const result = {
      success: true,
      downloadUrl: dataUrl,
      filename: `latex-compiled-${(userInfo.level || 'document').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}.pdf`,
      message: "LaTeX document compiled successfully"
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message, stack: error.stack });
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});