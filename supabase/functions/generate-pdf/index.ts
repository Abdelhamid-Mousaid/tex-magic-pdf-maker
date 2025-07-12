import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

// Simple PDF generator without external dependencies
const generatePDFContent = (userInfo: any, templateContent?: string | null): string => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create a simple PDF-like content structure
  const content = `
Math Planner - Planificateur Mathématiques
==========================================

Informations de l'Enseignant:
- Nom: ${userInfo.name}
- Email: ${userInfo.email}
- École: ${userInfo.school || 'Non spécifiée'}
- Année Scolaire: ${userInfo.academic_year || 'Non spécifiée'}
- Niveau: ${userInfo.level}
- Code Niveau: ${userInfo.level_code || userInfo.level}

Date de génération: ${currentDate}

${templateContent ? 'TEMPLATE PERSONNALISÉ UTILISÉ' : 'TEMPLATE STANDARD'}
${templateContent ? '==============================' : '================'}

${templateContent ? `
Contenu du template:
${templateContent.substring(0, 500)}...
` : `
Programme de Mathématiques - ${userInfo.level}
============================================

Objectifs Pédagogiques:
1. Développer la capacité de raisonnement mathématique
2. Maîtriser les techniques de calcul
3. Résoudre des problèmes concrets
4. Développer l'esprit d'analyse et de synthèse

Contenu du Programme:

Chapitre 1: Nombres et Calculs
- Opérations sur les nombres réels
- Puissances et racines
- Calcul littéral
- Équations et inéquations

Chapitre 2: Géométrie
- Configurations géométriques
- Théorèmes de géométrie plane
- Transformations géométriques
- Calculs de périmètres, aires et volumes

Chapitre 3: Fonctions
- Notion de fonction
- Fonctions affines et linéaires
- Fonctions du second degré
- Représentations graphiques

Exercices Types:

Exercice 1: Calcul Numérique
Calculer et simplifier:
A = √50 + 2√8 - √32
B = (3√12 - √27) / √3
C = (2√3 + 1)² - 4√3

Exercice 2: Équations
Résoudre les équations suivantes:
1. 2x + 5 = 3x - 7
2. x² - 4x + 3 = 0
3. √(2x + 1) = x - 2

Exercice 3: Géométrie
Dans un triangle ABC rectangle en A, AB = 6 cm et AC = 8 cm.
1. Calculer BC
2. Calculer l'aire du triangle ABC
3. Calculer les angles aigus du triangle

Évaluation et Contrôles:
- Interrogations écrites (30% de la note)
- Devoirs à la maison (20% de la note)
- Participation en classe (10% de la note)
- Contrôle semestriel (40% de la note)

Progression Pédagogique:

Premier Trimestre:
1. Nombres et calculs (4 semaines)
2. Introduction aux équations (3 semaines)
3. Géométrie de base (4 semaines)

Deuxième Trimestre:
1. Fonctions linéaires (4 semaines)
2. Systèmes d'équations (3 semaines)
3. Géométrie dans l'espace (4 semaines)

Troisième Trimestre:
1. Statistiques (3 semaines)
2. Probabilités (3 semaines)
3. Révisions et approfondissements (4 semaines)
`}

==========================================
Généré automatiquement par Math Planner
Outil professionnel de planification pédagogique
==========================================
`;

  return content;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { userInfo } = await req.json();
    if (!userInfo) {
      throw new Error("Missing userInfo in request body");
    }

    logStep("User info received", { level: userInfo.level, name: userInfo.name, templateId: userInfo.template_id });

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

    // Generate text content
    const textContent = generatePDFContent(userInfo, templateContent);
    logStep("Content generated", { contentLength: textContent.length });

    // Create a simple text file as download
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(textContent);
    const base64Content = btoa(String.fromCharCode(...textBytes));
    const dataUrl = `data:text/plain;base64,${base64Content}`;

    logStep("Content generation completed", { dataUrlLength: dataUrl.length });

    return new Response(JSON.stringify({ 
      success: true,
      downloadUrl: dataUrl,
      content: textContent,
      filename: `math-planner-${userInfo.level.replace(/\s+/g, '-')}-${Date.now()}.txt`,
      message: templateContent ? "Content generated with custom template" : "Content generated successfully"
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