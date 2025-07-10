
interface UserInfo {
  name: string;
  email: string;
  institution: string;
  level: string;
  chapter: string;
}

export const generateLatexTemplate = (userInfo: UserInfo): string => {
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

% Configuration de la page
\\geometry{margin=2.5cm}
\\pagestyle{fancy}
\\fancyhf{}
\\rhead{${userInfo.name}}
\\lhead{Math Planner - ${userInfo.level}}
\\cfoot{\\thepage}

% Configuration du titre
\\title{${userInfo.level}\\\\
\\large Généré par Math Planner}
\\author{${userInfo.name}\\\\
\\texttt{${userInfo.email}}\\\\
\\textit{${userInfo.institution}}}
\\date{${currentDate}}

% Paramètres du document
\\onehalfspacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{1em}

\\begin{document}

\\maketitle

\\begin{abstract}
Ce document a été généré automatiquement par Math Planner, un outil professionnel de génération de documents LaTeX pour l'enseignement des mathématiques. Le contenu ci-dessous représente le matériel du cours pour ${userInfo.name}, inscrit au niveau ${userInfo.level}.
\\end{abstract}

\\newpage

\\tableofcontents

\\newpage

\\section{Introduction}

Ce document a été préparé pour ${userInfo.name}, actuellement au niveau ${userInfo.level}. Le contenu suivant correspond au matériel de cours fourni par l'auteur dans le cadre de son abonnement Math Planner.

\\section{Contenu Principal}

${userInfo.chapter}

\\subsection{Formules Mathématiques}

Voici quelques exemples de formules mathématiques couramment utilisées :

\\begin{align}
a^2 + b^2 &= c^2 \\\\
\\frac{d}{dx}(x^n) &= nx^{n-1} \\\\
\\int_a^b f(x)dx &= F(b) - F(a)
\\end{align}

\\subsection{Exercices Pratiques}

\\begin{enumerate}
    \\item Résolvez l'équation : $2x + 5 = 13$
    \\item Calculez la dérivée de $f(x) = x^3 + 2x^2 - 5x + 1$
    \\item Trouvez l'intégrale de $\\int (3x^2 + 2x + 1)dx$
\\end{enumerate}

\\section{Conclusion}

Ce document démontre la puissance de la génération automatique de documents LaTeX pour l'enseignement des mathématiques. Math Planner offre un flux de travail rationalisé pour créer des documents bien formatés qui respectent les normes académiques.

\\section{Informations sur le Document}

\\begin{itemize}
    \\item \\textbf{Auteur :} ${userInfo.name}
    \\item \\textbf{Email :} \\texttt{${userInfo.email}}
    \\item \\textbf{Institution :} ${userInfo.institution}
    \\item \\textbf{Niveau :} ${userInfo.level}
    \\item \\textbf{Généré le :} ${currentDate}
    \\item \\textbf{Outil :} Math Planner
\\end{itemize}

\\vfill

\\hrule
\\vspace{0.5em}
\\begin{center}
\\small Généré automatiquement par Math Planner \\\\
Génération professionnelle de documents pour l'enseignement des mathématiques
\\end{center}

\\end{document}`;
};
