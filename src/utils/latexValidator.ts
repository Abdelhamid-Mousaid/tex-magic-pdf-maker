export interface LatexValidationResult {
  isValid: boolean;
  cleanedContent: string;
  errors: string[];
  warnings: string[];
}

export class LatexValidator {
  static validateAndClean(content: string): LatexValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let cleanedContent = content;

    // Remove common AI response artifacts
    cleanedContent = this.removeAIArtifacts(cleanedContent);
    
    // Validate essential LaTeX structure
    const structureValidation = this.validateStructure(cleanedContent);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // Clean and format the content
    cleanedContent = this.formatLatexContent(cleanedContent);

    // Final validation
    const isValid = errors.length === 0 && this.hasRequiredElements(cleanedContent);

    return {
      isValid,
      cleanedContent,
      errors,
      warnings
    };
  }

  private static removeAIArtifacts(content: string): string {
    let cleaned = content;

    // Remove JSON wrapper if present
    if (cleaned.includes('```latex') || cleaned.includes('```tex')) {
      const latexMatch = cleaned.match(/```(?:latex|tex)\n?(.*?)```/s);
      if (latexMatch) {
        cleaned = latexMatch[1];
      }
    }

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    
    // Remove explanatory text at the beginning/end
    const explanationPatterns = [
      /^(Voici|Here is|This is).*?:/i,
      /^(Le template|The template).*?:/i,
      /Ce template.*$/i,
      /This template.*$/i
    ];
    
    explanationPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove common AI phrases
    const aiPhrases = [
      'Voici le template LaTeX',
      'Here is the LaTeX template',
      'J\'espère que cela répond',
      'I hope this helps',
      'N\'hésitez pas à',
      'Feel free to'
    ];

    aiPhrases.forEach(phrase => {
      cleaned = cleaned.replace(new RegExp(phrase + '.*$', 'gim'), '');
    });

    return cleaned.trim();
  }

  private static validateStructure(content: string): { errors: string[], warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for document class
    if (!content.includes('\\documentclass')) {
      errors.push('Document class missing');
    }

    // Check for begin/end document
    if (!content.includes('\\begin{document}')) {
      errors.push('\\begin{document} missing');
    }

    if (!content.includes('\\end{document}')) {
      errors.push('\\end{document} missing');
    }

    // Check for essential packages
    const essentialPackages = ['inputenc', 'fontenc', 'babel'];
    essentialPackages.forEach(pkg => {
      if (!content.includes(pkg)) {
        warnings.push(`Recommended package ${pkg} missing`);
      }
    });

    // Check for unmatched braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unmatched braces detected');
    }

    // Check for basic sections
    if (!content.includes('\\section') && !content.includes('\\chapter')) {
      warnings.push('No sections found in document');
    }

    return { errors, warnings };
  }

  private static formatLatexContent(content: string): string {
    let formatted = content;

    // Ensure proper line endings
    formatted = formatted.replace(/\r\n/g, '\n');
    
    // Remove excessive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper spacing around sections
    formatted = formatted.replace(/(\\section\{[^}]+\})/g, '\n$1\n');
    formatted = formatted.replace(/(\\subsection\{[^}]+\})/g, '\n$1\n');

    // Clean up whitespace
    formatted = formatted.trim();

    return formatted;
  }

  private static hasRequiredElements(content: string): boolean {
    const requiredElements = [
      '\\documentclass',
      '\\begin{document}',
      '\\end{document}'
    ];

    return requiredElements.every(element => content.includes(element));
  }

  static generateFallbackTemplate(userProfile: any, selectedLevel: any): string {
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage[margin=2cm]{geometry}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{${userProfile?.full_name || '[Nom]'}}
\\fancyhead[C]{${selectedLevel?.name_fr || 'Mathématiques'}}
\\fancyhead[R]{${userProfile?.academic_year || '[Année]'}}
\\fancyfoot[C]{\\thepage}

\\title{Cahier de ${selectedLevel?.name_fr || 'Mathématiques'}}
\\author{${userProfile?.full_name || '[Nom]'}}
\\date{${userProfile?.academic_year || '[Année académique]'}}

\\begin{document}

\\maketitle
\\tableofcontents
\\newpage

\\section{Cours}
[Espace pour les cours]

\\section{Exercices}
[Espace pour les exercices]

\\section{Devoirs}
[Espace pour les devoirs]

\\section{Évaluations}
[Espace pour les évaluations]

\\end{document}`;
  }
}