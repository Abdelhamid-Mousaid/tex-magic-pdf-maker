import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { authenticateUser, fetchTemplateContent, validateLatexContent } from "./auth-handler.ts";
import { generatePDF } from "./pdf-generator.ts";
import { RequestBody, PdfGenerationResult } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    const { user, supabaseClient } = await authenticateUser(authHeader);

    // Parse request body with better error handling
    let requestBody: RequestBody;
    try {
      requestBody = await req.json();
      if (!requestBody.userInfo) {
        throw new Error("Missing userInfo in request body");
      }
    } catch (parseError: any) {
      logStep("Request parsing error", { error: parseError.message });
      throw new Error("Invalid request body format");
    }

    const { userInfo, customLatexContent } = requestBody;

    // Ensure required fields with defaults
    userInfo.level = userInfo.level || "Non spécifié";
    userInfo.name = userInfo.name || user.email || "Utilisateur";
    userInfo.email = userInfo.email || user.email;

    logStep("User info processed", { level: userInfo.level, name: userInfo.name, templateId: userInfo.template_id });

    let templateContent = null;

    // Check if a template is specified
    if (userInfo.template_id) {
      templateContent = await fetchTemplateContent(supabaseClient, userInfo.template_id);
    }

    // Use custom AI-generated LaTeX content if provided
    if (customLatexContent) {
      templateContent = validateLatexContent(customLatexContent);
      logStep('Using AI-generated LaTeX content', { originalLength: customLatexContent.length, sanitizedLength: templateContent.length });
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
    } catch (encodingError: any) {
      logStep("PDF base64 encoding failed", { error: encodingError.message });
      throw new Error(`Failed to encode PDF: ${encodingError.message}`);
    }

    const result: PdfGenerationResult = {
      success: true,
      downloadUrl: dataUrl,
      filename: `math-planner-${(userInfo.level || 'niveau').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}.pdf`,
      message: templateContent ? "PDF generated with custom template" : "PDF generated successfully"
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    
    const errorResult: PdfGenerationResult = {
      error: error.message,
      success: false
    };
    
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});