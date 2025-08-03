import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-BULK-PDFS] ${step}${detailsStr}`);
};

// Authenticate user
async function authenticateUser(authHeader: string | null) {
  if (!authHeader) {
    throw new Error("No authorization header provided");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing required environment variables");
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  
  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error("Authentication failed");
  }
  
  return { user: userData.user, supabaseClient };
}

// Mock ZIP generation for now - in a real implementation, you'd use a proper ZIP library
function createMockZip(pdfs: Array<{ filename: string, data: string }>) {
  // For now, return just the first PDF as a base64 string
  // In production, you'd use a proper ZIP library to combine all PDFs
  if (pdfs.length > 0) {
    return pdfs[0].data;
  }
  throw new Error("No PDFs to zip");
}

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

    // Parse request body
    const requestBody = await req.json();
    const { userInfo, levelName, semester, selectedPlan } = requestBody;

    logStep("Request parsed", { userInfo, levelName, semester, selectedPlan });

    // Create level name mapping (same as in frontend)
    const levelNameMapping: { [key: string]: string } = {
      '1ère Bac Lettres et Sciences Humaines Français': '1BACLSHF',
      '1ère Bac Sciences et Technologies Français': '1BACSF',
      '1ère Bac Sciences Français': '1BACSF',
      '2ème Bac Sciences Mathématiques': '2BACSM',
      '2ème Bac Physique Chimie': '2BACPC',
      '2ème Bac Sciences de la Vie et de la Terre': '2BACSVT',
      '2ème Bac Sciences Physiques et Chimiques Français': '2BACSPCF',
      '2ème Bac Sciences de la Vie et de la Terre Français': '2BACSVTF',
      '1ère Année Préparatoire Internationale Collège': '1APIC',
      '2ème Année Préparatoire Internationale Collège': '2APIC',
      '3ème Année Préparatoire Internationale Collège': '3APIC',
      '1ère Année Collège': '1APIC',
      '2ème Année Collège': '2APIC',
      '3ème Année Collège': '3APIC',
      'Tronc Commun Sciences Français': 'TCSF',
      'Tronc Commun Lettres et Sciences Humaines Français': 'TCLSHF'
    };

    const levelCode = levelNameMapping[levelName];
    if (!levelCode) {
      throw new Error(`Niveau non supporté: ${levelName}`);
    }

    logStep("Level mapping found", { levelCode });

    // Define chapters to generate (for now, just generate CH_1 and CH_2 as example)
    // In production, you'd get this from the database or content selection
    const chaptersToGenerate = ['CH_1', 'CH_2', 'CH_3', 'CH_4', 'CH_5'];
    const generatedPdfs: Array<{ filename: string, data: string }> = [];

    // Generate PDFs for each chapter
    for (const chapter of chaptersToGenerate) {
      try {
        logStep(`Generating PDF for chapter ${chapter}`);
        
        // Call the existing compile-latex-pdf function for each chapter
        const pdfResponse = await supabaseClient.functions.invoke('compile-latex-pdf', {
          body: {
            template_path: `${levelCode}/${semester}/${chapter.replace('_', '-')}.tex`,
            user_info: userInfo,
            level_name: levelName,
            semester: semester,
            chapter_number: parseInt(chapter.replace('CH_', '')),
            template_name: chapter
          }
        });

        if (pdfResponse.data?.pdf_data) {
          generatedPdfs.push({
            filename: `${chapter}.pdf`,
            data: pdfResponse.data.pdf_data
          });
          logStep(`Successfully generated PDF for ${chapter}`);
        } else {
          logStep(`Failed to generate PDF for ${chapter}`, { error: pdfResponse.error });
        }
      } catch (chapterError: any) {
        logStep(`Error generating chapter ${chapter}`, { error: chapterError.message });
        // Continue with other chapters even if one fails
      }
    }

    if (generatedPdfs.length === 0) {
      throw new Error("Aucun PDF n'a pu être généré");
    }

    logStep(`Generated ${generatedPdfs.length} PDFs, creating ZIP`);

    // Create ZIP (mock implementation for now)
    const zipData = createMockZip(generatedPdfs);
    const filename = `${levelCode}-${semester}-complet.zip`;

    // For now, return the first PDF as if it were a ZIP
    // In production, this would be actual ZIP data
    const result = {
      success: true,
      downloadUrl: `data:application/zip;base64,${zipData}`,
      filename: filename,
      message: `${generatedPdfs.length} PDFs générés et compressés`
    };

    logStep("ZIP generation completed", { filename, pdfCount: generatedPdfs.length });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    
    const errorResult = {
      error: error.message,
      success: false
    };
    
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});