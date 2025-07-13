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
  console.log(`[GENERATE-LATEX] ${step}${detailsStr}`);
};

// Generate XeLaTeX content
const generateXeLaTeXContent = (userInfo: any): string => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const academicYear = userInfo.academic_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
  const school = userInfo.school || 'École non spécifiée';

  return `\\documentclass[12pt,a4paper]{article}

% Configuration XeLaTeX avec polices modernes
\\usepackage{fontspec}
\\usepackage{polyglossia}
\\setdefaultlanguage{french}
\\setotherlanguage{english}

% Polices modernes et élégantes (fallback vers des polices système courantes)
\\setmainfont{Times New Roman}[
  UprightFont = *,
  BoldFont = * Bold,
  ItalicFont = * Italic,
  BoldItalicFont = * Bold Italic
]
\\setsansfont{Arial}[
  UprightFont = *,
  BoldFont = * Bold,
  ItalicFont = * Italic
]
\\setmonofont{Courier New}[Scale=0.9]

% Packages mathématiques et graphiques
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{mathtools}
\\usepackage{unicode-math}
\\setmathfont{Latin Modern Math}

% Configuration de la page et mise en forme
\\usepackage[margin=2.5cm, top=3cm, bottom=3cm]{geometry}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{setspace}
\\usepackage{parskip}

% Couleurs et graphiques
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{tcolorbox}
\\usepackage{graphicx}

% Définition des couleurs du thème
\\definecolor{primary}{RGB}{59, 130, 246}    % Blue-500
\\definecolor{secondary}{RGB}{99, 102, 241}  % Indigo-500
\\definecolor{accent}{RGB}{168, 85, 247}     % Purple-500
\\definecolor{darkgray}{RGB}{55, 65, 81}     % Gray-700
\\definecolor{lightgray}{RGB}{243, 244, 246} % Gray-100

% Configuration des boîtes colorées
\\tcbuselibrary{skins,breakable}
\\newtcolorbox{objectivebox}{
  colback=primary!5,
  colframe=primary,
  boxrule=1pt,
  arc=3pt,
  left=10pt,
  right=10pt,
  top=8pt,
  bottom=8pt,
  title={Objectifs Pédagogiques},
  fonttitle=\\bfseries\\large,
  coltitle=white,
  colbacktitle=primary
}

\\newtcolorbox{exercisebox}{
  colback=secondary!5,
  colframe=secondary,
  boxrule=1pt,
  arc=3pt,
  left=10pt,
  right=10pt,
  top=8pt,
  bottom=8pt,
  title={Exercices et Applications},
  fonttitle=\\bfseries\\large,
  coltitle=white,
  colbacktitle=secondary
}

\\newtcolorbox{formulabox}{
  colback=accent!5,
  colframe=accent,
  boxrule=1pt,
  arc=3pt,
  left=10pt,
  right=10pt,
  top=8pt,
  bottom=8pt,
  title={Formules Essentielles},
  fonttitle=\\bfseries\\large,
  coltitle=white,
  colbacktitle=accent
}

% Configuration des en-têtes et pieds de page
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textcolor{primary}{\\textbf{Math Planner}} • ${userInfo.level}}
\\fancyhead[R]{${userInfo.name}}
\\fancyfoot[C]{\\textcolor{darkgray}{Page \\thepage\\ sur \\pageref{LastPage}}}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.5pt}

% Configuration des liens
\\usepackage{hyperref}
\\hypersetup{
  colorlinks=true,
  linkcolor=primary,
  urlcolor=secondary,
  citecolor=accent,
  pdftitle={${userInfo.level} - ${userInfo.name}},
  pdfauthor={${userInfo.name}},
  pdfsubject={Math Planner - Planification Pédagogique},
  pdfkeywords={mathématiques, pédagogie, ${userInfo.level}}
}

% Espacement et mise en forme
\\onehalfspacing
\\setlength{\\parindent}{0pt}

% Théorèmes et définitions
\\theoremstyle{definition}
\\newtheorem{definition}{Définition}[section]
\\newtheorem{theorem}{Théorème}[section]
\\newtheorem{exercise}{Exercice}[section]

% Titre personnalisé
\\title{
  \\vspace{-2cm}
  \\begin{tikzpicture}[remember picture, overlay]
    \\fill[primary] (current page.north west) rectangle ([yshift=-3cm]current page.north east);
  \\end{tikzpicture}
  \\vspace{1cm}
  \\color{white}
  \\Huge\\textbf{Planification Mathématique}\\\\[0.5cm]
  \\Large ${userInfo.level}\\\\[0.3cm]
  \\large Année Académique ${academicYear}
}

\\author{
  \\large\\textbf{${userInfo.name}}\\\\
  \\normalsize\\texttt{${userInfo.email}}\\\\
  \\textit{${school}}
}

\\date{\\large ${currentDate}}

\\begin{document}

% Page de titre
\\maketitle
\\thispagestyle{empty}

\\vfill

\\begin{center}
\\begin{tcolorbox}[width=0.8\\textwidth,colback=lightgray,colframe=darkgray,arc=5pt]
\\centering\\large
Ce document a été généré automatiquement par \\textbf{Math Planner}, \\\\
un outil professionnel de planification pédagogique.\\\\[0.5cm]
\\textcolor{primary}{\\textbf{Enseignement personnalisé • Contenu adapté • Excellence pédagogique}}
\\end{tcolorbox}
\\end{center}

\\newpage

% Table des matières
\\tableofcontents
\\newpage

% Introduction
\\section{Introduction}

Bienvenue dans votre planification pédagogique pour le niveau \\textbf{${userInfo.level}}. Ce document a été spécialement conçu pour accompagner \\textit{${userInfo.name}} dans l'organisation et la structuration des apprentissages mathématiques.

\\begin{objectivebox}
\\begin{itemize}
  \\item Développer la capacité de raisonnement mathématique rigoureux
  \\item Maîtriser les techniques de calcul et de résolution de problèmes
  \\item Établir des liens entre les concepts théoriques et les applications pratiques
  \\item Favoriser l'autonomie et l'esprit critique en mathématiques
  \\item Préparer efficacement aux évaluations et examens
\\end{itemize}
\\end{objectivebox}

\\section{Programme de ${userInfo.level}}

\\subsection{Organisation Générale}

Le programme de \\textbf{${userInfo.level}} s'articule autour de plusieurs domaines mathématiques fondamentaux, chacun contribuant à la formation d'un socle solide de connaissances et de compétences.

\\subsection{Domaines d'Étude}

\\subsubsection{Algèbre et Calcul}
\\begin{itemize}
  \\item Manipulation des expressions algébriques
  \\item Résolution d'équations et d'inéquations
  \\item Systèmes d'équations linéaires
  \\item Fonctions polynomiales et rationnelles
\\end{itemize}

\\subsubsection{Géométrie}
\\begin{itemize}
  \\item Géométrie euclidienne plane et dans l'espace
  \\item Transformations géométriques
  \\item Calculs de longueurs, aires et volumes
  \\item Géométrie analytique
\\end{itemize}

\\subsubsection{Analyse}
\\begin{itemize}
  \\item Étude de fonctions
  \\item Limites et continuité
  \\item Dérivation et applications
  \\item Intégration (selon le niveau)
\\end{itemize}

\\subsubsection{Statistiques et Probabilités}
\\begin{itemize}
  \\item Analyse statistique descriptive
  \\item Calculs de probabilités
  \\item Variables aléatoires
  \\item Tests statistiques (selon le niveau)
\\end{itemize}

\\section{Ressources et Outils}

\\begin{formulabox}
\\textbf{Formules Fondamentales à Retenir :}

\\begin{align}
\\text{Théorème de Pythagore : } & a^2 + b^2 = c^2 \\\\
\\text{Dérivée d'une puissance : } & \\frac{d}{dx}(x^n) = nx^{n-1} \\\\
\\text{Primitive d'un polynôme : } & \\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\\\
\\text{Identité remarquable : } & (a+b)^2 = a^2 + 2ab + b^2
\\end{align}
\\end{formulabox}

\\section{Activités et Évaluations}

\\begin{exercisebox}
\\textbf{Types d'Exercices Recommandés :}

\\begin{enumerate}
  \\item \\textbf{Exercices de technique} : pour consolider les automatismes
  \\item \\textbf{Problèmes de synthèse} : pour développer le raisonnement
  \\item \\textbf{Situations concrètes} : pour donner du sens aux apprentissages
  \\item \\textbf{Défis mathématiques} : pour stimuler la réflexion créative
\\end{enumerate}

\\textbf{Modalités d'Évaluation :}
\\begin{itemize}
  \\item Contrôles réguliers de connaissances
  \\item Devoirs maison approfondis
  \\item Exposés et présentations
  \\item Projets interdisciplinaires
\\end{itemize}
\\end{exercisebox}

\\section{Planification Temporelle}

\\subsection{Organisation par Période}

\\begin{center}
\\begin{tabular}{|p{3cm}|p{8cm}|p{2cm}|}
\\hline
\\textbf{Période} & \\textbf{Thèmes Principaux} & \\textbf{Durée} \\\\
\\hline
Septembre-Octobre & Révisions et fondamentaux & 6 semaines \\\\
\\hline
Novembre-Décembre & Algèbre et équations & 7 semaines \\\\
\\hline
Janvier-Février & Géométrie & 6 semaines \\\\
\\hline
Mars-Avril & Fonctions et analyse & 7 semaines \\\\
\\hline
Mai-Juin & Statistiques et révisions & 8 semaines \\\\
\\hline
\\end{tabular}
\\end{center}

\\section{Conseils Pédagogiques}

\\begin{tcolorbox}[colback=primary!10,colframe=primary,title=Recommandations pour l'Enseignant]
\\begin{itemize}
  \\item Varier les approches pédagogiques (cours magistral, travaux dirigés, projets)
  \\item Utiliser des outils numériques adaptés (calculatrices, logiciels de géométrie)
  \\item Encourager le travail collaboratif et les échanges entre élèves
  \\item Proposer des exercices différenciés selon les niveaux
  \\item Maintenir un lien constant entre théorie et applications
\\end{itemize}
\\end{tcolorbox}

\\section{Suivi et Évaluation}

La progression des élèves sera suivie grâce à :
\\begin{itemize}
  \\item Un carnet de notes détaillé
  \\item Des grilles de compétences
  \\item Des entretiens individuels réguliers
  \\item Des bilans trimestriels avec les familles
\\end{itemize}

\\vfill

\\begin{center}
\\begin{tikzpicture}
  \\draw[primary, thick] (0,0) -- (10,0);
  \\node[primary] at (5,0.5) {\\textbf{Math Planner - Excellence Pédagogique}};
  \\node[darkgray] at (5,-0.5) {Document généré le ${currentDate}};
\\end{tikzpicture}
\\end{center}

\\end{document}`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("LaTeX generation function started");

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
    try {
      const body = await req.json();
      userInfo = body.userInfo;
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

    logStep("User info processed", { level: userInfo.level, name: userInfo.name });

    // Generate LaTeX content
    logStep("Starting LaTeX generation");
    const latexContent = generateXeLaTeXContent(userInfo);
    logStep("LaTeX generated", { contentLength: latexContent.length });

    // Create base64 encoded data URL for LaTeX download
    let base64Content;
    let dataUrl;
    
    try {
      logStep("Starting base64 encoding for LaTeX", { contentLength: latexContent.length });
      
      // Encode the LaTeX content as UTF-8 bytes first
      const utf8Bytes = new TextEncoder().encode(latexContent);
      
      // Use Deno's standard library for base64 encoding
      base64Content = base64Encode(utf8Bytes);
      dataUrl = `data:text/plain;charset=utf-8;base64,${base64Content}`;
      
      logStep("LaTeX base64 encoding successful", { 
        originalSize: latexContent.length, 
        encodedLength: base64Content.length,
        dataUrlLength: dataUrl.length 
      });
    } catch (encodingError) {
      logStep("LaTeX base64 encoding failed", { error: encodingError.message });
      throw new Error(`Failed to encode LaTeX: ${encodingError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      downloadUrl: dataUrl,
      filename: `math-planner-${(userInfo.level || 'niveau').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}.tex`,
      message: "LaTeX source generated successfully for XeLaTeX compilation",
      compileInstructions: "To compile this document, use: xelatex filename.tex"
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