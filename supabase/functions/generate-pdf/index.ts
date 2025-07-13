import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

// Generate actual PDF using pdf-lib
const generatePDF = async (userInfo: any, templateContent?: string | null): Promise<Uint8Array> => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  
  // Get the width and height of the page
  const { width, height } = currentPage.getSize();
  
  // Set up font and colors
  const fontSize = 12;
  const titleFontSize = 18;
  const headerFontSize = 14;
  const lineHeight = fontSize + 4;
  const margin = 50;
  
  let yPosition = height - margin; // Start from top with margin
  
  // Helper function to add text with proper spacing and page breaks
  const addText = (text: string, size: number = fontSize, isTitle: boolean = false, isHeader: boolean = false) => {
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Check if we need a new page
      if (yPosition < margin + size) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - margin;
      }
      
      // Draw the text on current page
      currentPage.drawText(line || ' ', {
        x: margin,
        y: yPosition,
        size: size,
        color: isTitle ? rgb(0, 0.2, 0.8) : rgb(0, 0, 0),
      });
      
      // Move down for next line
      yPosition -= (size + 6);
    }
    
    // Add extra spacing after paragraphs
    if (isHeader) {
      yPosition -= 10;
    } else if (isTitle) {
      yPosition -= 15;
    } else {
      yPosition -= 5;
    }
  };

  // Add title
  addText('Math Planner - Planificateur Mathématiques', titleFontSize, true);
  addText('='.repeat(50));
  
  // Add user information
  addText('Informations de l\'Enseignant:', headerFontSize);
  addText(`- Nom: ${userInfo.name}`);
  addText(`- Email: ${userInfo.email}`);
  addText(`- École: ${userInfo.school || 'Non spécifiée'}`);
  addText(`- Année Scolaire: ${userInfo.academic_year || 'Non spécifiée'}`);
  addText(`- Niveau: ${userInfo.level}`);
  addText(`- Code Niveau: ${userInfo.level_code || userInfo.level}`);
  addText('');
  addText(`Date de génération: ${currentDate}`);
  addText('');

  if (templateContent) {
    if (templateContent.includes('\\documentclass')) {
      // This is AI-generated LaTeX content
      addText('CONTENU GÉNÉRÉ PAR IA', headerFontSize);
      addText('='.repeat(30));
      addText('Ce document a été créé avec l\'intelligence artificielle');
      addText('');
      
      // Extract and display meaningful content from LaTeX
      const cleanContent = templateContent
        .replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, '') // Remove LaTeX commands
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      addText('Aperçu du contenu généré:', headerFontSize);
      addText(cleanContent.substring(0, 800) + (cleanContent.length > 800 ? '...' : ''));
    } else {
      // This is a regular template
      addText('TEMPLATE PERSONNALISÉ UTILISÉ', headerFontSize);
      addText('='.repeat(30));
      addText(`Contenu du template:\n${templateContent.substring(0, 500)}...`);
    }
  } else {
    addText(`Programme de Mathématiques - ${userInfo.level}`, headerFontSize);
    addText('='.repeat(40));
    addText('');
    
    addText('Objectifs Pédagogiques:', headerFontSize);
    addText('1. Développer la capacité de raisonnement mathématique');
    addText('2. Maîtriser les techniques de calcul');
    addText('3. Résoudre des problèmes concrets');
    addText('4. Développer l\'esprit d\'analyse et de synthèse');
    addText('');
    
    addText('Contenu du Programme:', headerFontSize);
    addText('');
    addText('Chapitre 1: Nombres et Calculs');
    addText('- Opérations sur les nombres réels');
    addText('- Puissances et racines');
    addText('- Calcul littéral');
    addText('- Équations et inéquations');
    addText('');
    
    addText('Chapitre 2: Géométrie');
    addText('- Configurations géométriques');
    addText('- Théorèmes de géométrie plane');
    addText('- Transformations géométriques');
    addText('- Calculs de périmètres, aires et volumes');
    addText('');
    
    addText('Chapitre 3: Fonctions');
    addText('- Notion de fonction');
    addText('- Fonctions affines et linéaires');
    addText('- Fonctions du second degré');
    addText('- Représentations graphiques');
  }
  
  // Add footer
  addText('');
  addText('='.repeat(50));
  addText('Généré automatiquement par Math Planner');
  addText('Outil professionnel de planification pédagogique');
  addText('='.repeat(50));

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY");
    }

    // Create Supabase client for authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Attempting authentication", { tokenLength: token.length });
    
    // More robust authentication handling
    let user;
    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) {
        logStep("Authentication error", { error: userError.message });
        throw new Error(`Authentication failed: ${userError.message}`);
      }
      
      user = userData.user;
      if (!user) {
        logStep("User not found in token");
        throw new Error("User not authenticated");
      }
      
      logStep("User authenticated", { userId: user.id, email: user.email });
    } catch (authError) {
      logStep("Authentication exception", { error: authError.message });
      throw new Error(`Authentication error: ${authError.message}`);
    }

    // Parse request body with better error handling
    let userInfo;
    let customLatexContent = null;
    try {
      const body = await req.json();
      userInfo = body.userInfo;
      customLatexContent = body.customLatexContent;
      if (!userInfo) {
        throw new Error("Missing userInfo in request body");
      }
    } catch (parseError) {
      logStep("Request parsing error", { error: parseError.message });
      throw new Error("Invalid request body format");
    }

    // Ensure required fields with defaults
    userInfo.level = userInfo.level || "Non spécifié";
    userInfo.name = userInfo.name || user.email || "Utilisateur";
    userInfo.email = userInfo.email || user.email;

    logStep("User info processed", { level: userInfo.level, name: userInfo.name, templateId: userInfo.template_id });

    let templateContent = null;

    // Check if a template is specified
    if (userInfo.template_id) {
      try {
        // Fetch template content from storage
        const { data: templateData, error: templateError } = await supabaseClient
          .from('system_templates')
          .select('file_path')
          .eq('id', userInfo.template_id)
          .eq('is_active', true)
          .single();

        if (!templateError && templateData) {
          const { data: fileData, error: fileError } = await supabaseClient.storage
            .from('latex-templates')
            .download(templateData.file_path);

          if (!fileError && fileData) {
            templateContent = await fileData.text();
            logStep('Template loaded successfully', { templateId: userInfo.template_id, contentLength: templateContent.length });
          }
        }
      } catch (error) {
        logStep('Template loading failed, using default', { error: error.message });
      }
    }

    // Use custom AI-generated LaTeX content if provided
    if (customLatexContent) {
      templateContent = customLatexContent;
      logStep('Using AI-generated LaTeX content', { contentLength: customLatexContent.length });
    }

    // Generate PDF content
    logStep("Starting PDF generation");
    const pdfBytes = await generatePDF(userInfo, templateContent);
    logStep("PDF generated", { pdfSize: pdfBytes.length });

    // Create base64 encoded data URL for PDF download
    let base64Content;
    let dataUrl;
    
    try {
      logStep("Starting base64 encoding for PDF", { pdfSize: pdfBytes.length });
      
      // Use Deno's standard library for base64 encoding
      base64Content = base64Encode(pdfBytes);
      dataUrl = `data:application/pdf;base64,${base64Content}`;
      
      logStep("PDF base64 encoding successful", { 
        originalSize: pdfBytes.length, 
        encodedLength: base64Content.length,
        dataUrlLength: dataUrl.length 
      });
    } catch (encodingError) {
      logStep("PDF base64 encoding failed", { error: encodingError.message });
      throw new Error(`Failed to encode PDF: ${encodingError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      downloadUrl: dataUrl,
      filename: `math-planner-${(userInfo.level || 'niveau').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}.pdf`,
      message: templateContent ? "PDF generated with custom template" : "PDF generated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});