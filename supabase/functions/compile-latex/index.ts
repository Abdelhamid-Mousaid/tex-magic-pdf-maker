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

// Validate and sanitize LaTeX content
function validateLatexContent(content: string): string {
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid LaTeX content provided");
  }
  
  // Check content length
  if (content.length > 50000) {
    throw new Error("LaTeX content too large (max 50KB)");
  }
  
  // Remove potentially dangerous commands
  const dangerousCommands = [
    '\\input', '\\include', '\\write', '\\openout', '\\closeout',
    '\\immediate', '\\special', '\\catcode', '\\read', '\\openin'
  ];
  
  let sanitizedContent = content;
  dangerousCommands.forEach(cmd => {
    const regex = new RegExp(`\\${cmd}\\b`, 'gi');
    if (regex.test(sanitizedContent)) {
      logStep("Blocked dangerous LaTeX command", { command: cmd });
      sanitizedContent = sanitizedContent.replace(regex, `% BLOCKED: ${cmd}`);
    }
  });
  
  return sanitizedContent;
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
    let { latexContent, userInfo } = body;
    
    // Validate and sanitize input
    latexContent = validateLatexContent(latexContent);
    
    if (!userInfo || !userInfo.level || !userInfo.name) {
      throw new Error("Invalid user information provided");
    }

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
        // If both fail, create a clean error PDF with useful information
        logStep("All LaTeX compilation methods failed, creating clean error PDF");
        
        const errorLatex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{xcolor}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{${userInfo.name || '[Nom]'}}
\\fancyhead[C]{Erreur de Compilation LaTeX}
\\fancyhead[R]{${new Date().toLocaleDateString('fr-FR')}}
\\fancyfoot[C]{\\thepage}

\\title{Erreur de Compilation LaTeX}
\\author{${userInfo.name || '[Nom]'}}
\\date{${new Date().toLocaleDateString('fr-FR')}}

\\begin{document}
\\maketitle

\\textcolor{red}{\\textbf{ERREUR DE COMPILATION}}

Le document LaTeX n'a pas pu être compilé en raison d'erreurs dans le code source.

\\textbf{Solutions possibles :}
\\begin{itemize}
    \\item Vérifiez la syntaxe LaTeX
    \\item Assurez-vous que tous les packages sont disponibles
    \\item Consultez les logs de compilation pour plus de détails
\\end{itemize}

\\textbf{Niveau :} ${userInfo.level || 'Non spécifié'}

\\textbf{Date de génération :} ${new Date().toLocaleDateString('fr-FR')}

\\end{document}`;

        // Try to compile the error PDF
        const errorResponse = await fetch('https://latex.api.ytotech.com/builds/sync/pdf', {
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
                file: 'error.tex',
                content: errorLatex
              }
            ]
          })
        });

        if (errorResponse.ok) {
          const errorPdfBuffer = await errorResponse.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(errorPdfBuffer)));
          const dataUrl = `data:application/pdf;base64,${base64Content}`;

          return new Response(JSON.stringify({
            success: false,
            downloadUrl: dataUrl,
            filename: `latex-error-${Date.now()}.pdf`,
            message: "Erreur de compilation LaTeX - PDF d'erreur généré"
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        throw new Error("LaTeX compilation failed and error PDF could not be generated");
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
        message: "Document LaTeX compilé avec succès"
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
      message: "Document LaTeX compilé avec succès"
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