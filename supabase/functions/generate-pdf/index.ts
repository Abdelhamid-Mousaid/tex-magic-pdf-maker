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

// LaTeX template generator
const generateLatexTemplate = (userInfo: any): string => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{fancyhdr}
\\usepackage{setspace}
\\usepackage{fontspec}

% Configuration de la page
\\geometry{margin=2.5cm}
\\pagestyle{fancy}
\\fancyhf{}
\\rhead{${userInfo.name}}
\\lhead{Math Planner - ${userInfo.level}}
\\cfoot{\\thepage}

% Configuration du titre
\\title{${userInfo.level}\\\\
\\large Planificateur Mathématiques - ${userInfo.level_code}}
\\author{${userInfo.name}\\\\
\\texttt{${userInfo.email}}\\\\
${userInfo.school ? `\\textit{${userInfo.school}}\\\\` : ''}
${userInfo.academic_year ? `\\textbf{Année Scolaire: ${userInfo.academic_year}}` : ''}}
\\date{${currentDate}}

% Paramètres du document
\\onehalfspacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{1em}

\\begin{document}

\\maketitle

\\begin{abstract}
Ce document de planification mathématique a été généré automatiquement par Math Planner pour ${userInfo.name}, niveau ${userInfo.level}. Il est conçu spécialement pour le système éducatif marocain et comprend les chapitres et exercices adaptés au programme officiel.
\\end{abstract}

\\newpage

\\tableofcontents

\\newpage

\\section{Informations du Cours}

\\subsection{Détails de l'Enseignant}
\\begin{itemize}
    \\item \\textbf{Nom :} ${userInfo.name}
    \\item \\textbf{Email :} \\texttt{${userInfo.email}}
    ${userInfo.school ? `\\item \\textbf{École :} ${userInfo.school}` : ''}
    ${userInfo.academic_year ? `\\item \\textbf{Année Scolaire :} ${userInfo.academic_year}` : ''}
    \\item \\textbf{Niveau de Classe :} ${userInfo.level}
    \\item \\textbf{Code Niveau :} ${userInfo.level_code}
\\end{itemize}

\\section{Programme de Mathématiques - ${userInfo.level}}

\\subsection{Objectifs Pédagogiques}
Ce programme vise à développer chez l'élève :
\\begin{enumerate}
    \\item La capacité de raisonnement mathématique
    \\item La maîtrise des techniques de calcul
    \\item L'aptitude à résoudre des problèmes concrets
    \\item L'esprit d'analyse et de synthèse
\\end{enumerate}

\\subsection{Contenu du Programme}

\\subsubsection{Chapitre 1 : Nombres et Calculs}
\\begin{itemize}
    \\item Opérations sur les nombres réels
    \\item Puissances et racines
    \\item Calcul littéral
    \\item Équations et inéquations
\\end{itemize}

\\subsubsection{Chapitre 2 : Géométrie}
\\begin{itemize}
    \\item Configurations géométriques
    \\item Théorèmes de géométrie plane
    \\item Transformations géométriques
    \\item Calculs de périmètres, aires et volumes
\\end{itemize}

\\subsubsection{Chapitre 3 : Fonctions}
\\begin{itemize}
    \\item Notion de fonction
    \\item Fonctions affines et linéaires
    \\item Fonctions du second degré
    \\item Représentations graphiques
\\end{itemize}

\\section{Exercices Types}

\\subsection{Exercice 1 : Calcul Numérique}
Calculer et simplifier :
\\begin{align}
A &= \\sqrt{50} + 2\\sqrt{8} - \\sqrt{32} \\\\
B &= \\frac{3\\sqrt{12} - \\sqrt{27}}{\\sqrt{3}} \\\\
C &= (2\\sqrt{3} + 1)^2 - 4\\sqrt{3}
\\end{align}

\\subsection{Exercice 2 : Équations}
Résoudre les équations suivantes :
\\begin{enumerate}
    \\item $2x + 5 = 3x - 7$
    \\item $x^2 - 4x + 3 = 0$
    \\item $\\sqrt{2x + 1} = x - 2$
\\end{enumerate}

\\subsection{Exercice 3 : Géométrie}
Dans un triangle ABC rectangle en A, on donne AB = 6 cm et AC = 8 cm.
\\begin{enumerate}
    \\item Calculer BC
    \\item Calculer l'aire du triangle ABC
    \\item Calculer les angles aigus du triangle
\\end{enumerate}

\\section{Évaluation et Contrôles}

\\subsection{Contrôle Continu}
\\begin{itemize}
    \\item Interrogations écrites (30\\% de la note)
    \\item Devoirs à la maison (20\\% de la note)
    \\item Participation en classe (10\\% de la note)
\\end{itemize}

\\subsection{Examens}
\\begin{itemize}
    \\item Contrôle semestriel (40\\% de la note)
    \\item Examen final selon le niveau
\\end{itemize}

\\section{Progression Pédagogique}

\\subsection{Premier Trimestre}
\\begin{enumerate}
    \\item Nombres et calculs (4 semaines)
    \\item Introduction aux équations (3 semaines)
    \\item Géométrie de base (4 semaines)
\\end{enumerate}

\\subsection{Deuxième Trimestre}
\\begin{enumerate}
    \\item Fonctions linéaires (4 semaines)
    \\item Systèmes d'équations (3 semaines)
    \\item Géométrie dans l'espace (4 semaines)
\\end{enumerate}

\\subsection{Troisième Trimestre}
\\begin{enumerate}
    \\item Statistiques (3 semaines)
    \\item Probabilités (3 semaines)
    \\item Révisions et approfondissements (4 semaines)
\\end{enumerate}

\\vfill

\\hrule
\\vspace{0.5em}
\\begin{center}
\\small Généré automatiquement par Math Planner - ${currentDate}\\\\
Outil professionnel de planification pédagogique pour l'enseignement des mathématiques\\\\
Système Éducatif Marocain - Niveau ${userInfo.level_code}
\\end{center}

\\end{document}`;
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

    logStep("User info received", { level: userInfo.level, name: userInfo.name });

    // Generate LaTeX content
    const latexContent = generateLatexTemplate(userInfo);
    logStep("LaTeX content generated", { contentLength: latexContent.length });

    // Send LaTeX to your Hostinger VPS for compilation
    const vpsResponse = await fetch('https://VOTRE-DOMAINE-HOSTINGER.com/api/compile-latex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_VPS_API_KEY' // Optionnel pour sécuriser
      },
      body: JSON.stringify({
        latex: latexContent,
        filename: `${user.id}-${Date.now()}-${userInfo.level_code}`,
        user_id: user.id,
        level: userInfo.level_code
      })
    });

    if (!vpsResponse.ok) {
      throw new Error(`VPS compilation failed: ${vpsResponse.status}`);
    }

    const vpsData = await vpsResponse.json();
    const downloadUrl = vpsData.pdf_url;

    logStep("PDF generation completed", { downloadUrl });

    return new Response(JSON.stringify({ 
      success: true,
      download_url: downloadUrl,
      message: "PDF generated successfully"
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