import { ProcessedLatexContent } from "./types.ts";

export function processLatexContent(templateContent: string): ProcessedLatexContent {
  // First, validate that we have meaningful LaTeX content
  if (!templateContent || templateContent.trim().length < 50) {
    return {
      sections: [],
      subsections: [],
      textContent: '',
      hasMeaningfulContent: false
    };
  }

  let cleanContent = templateContent;
  
  // Preserve important content before removing LaTeX commands
  const titleMatch = cleanContent.match(/\\title\{([^}]+)\}/);
  const authorMatch = cleanContent.match(/\\author\{([^}]+)\}/);
  const dateMatch = cleanContent.match(/\\date\{([^}]+)\}/);
  
  // Extract sections and subsections BEFORE cleaning
  const sections = cleanContent.match(/\\section\{([^}]+)\}/g) || [];
  const subsections = cleanContent.match(/\\subsection\{([^}]+)\}/g) || [];
  
  const extractedSections = sections.map(section => 
    section.replace(/\\section\{([^}]+)\}/, '$1')
  );
  
  const extractedSubsections = subsections.map(subsection => 
    subsection.replace(/\\subsection\{([^}]+)\}/, '$1')
  );

  // Extract content between sections for meaningful text
  const sectionContents: string[] = [];
  const sectionPattern = /\\section\{[^}]+\}(.*?)(?=\\section\{|\\end\{document\}|$)/gs;
  let match;
  while ((match = sectionPattern.exec(cleanContent)) !== null) {
    if (match[1]) {
      sectionContents.push(match[1].trim());
    }
  }

  // Process meaningful text content
  let textContent = sectionContents.join(' ');
  
  // Clean LaTeX commands but preserve readable text
  // Remove most LaTeX commands but keep some structure
  textContent = textContent.replace(/\\documentclass\[.*?\]\{.*?\}/g, '');
  textContent = textContent.replace(/\\usepackage\[.*?\]\{.*?\}/g, '');
  textContent = textContent.replace(/\\usepackage\{.*?\}/g, '');
  textContent = textContent.replace(/\\geometry\{.*?\}/g, '');
  textContent = textContent.replace(/\\begin\{document\}/g, '');
  textContent = textContent.replace(/\\end\{document\}/g, '');
  textContent = textContent.replace(/\\maketitle/g, '');
  textContent = textContent.replace(/\\tableofcontents/g, '');
  textContent = textContent.replace(/\\newpage/g, ' ');
  
  // Remove LaTeX commands but preserve content in braces
  textContent = textContent.replace(/\\[a-zA-Z*]+\*?(\[[^\]]*\])?/g, ' ');
  textContent = textContent.replace(/\\[^a-zA-Z\s{]/g, ' ');
  
  // Clean up remaining artifacts
  textContent = textContent.replace(/\{([^}]*)\}/g, '$1'); // Extract content from braces
  textContent = textContent.replace(/\[[^\]]*\]/g, ' '); // Remove square brackets
  
  // Remove measurements and technical terms
  textContent = textContent.replace(/\d+(\.\d+)?(cm|mm|pt|em|ex|px|in)/g, '');
  textContent = textContent.replace(/\b(margin|inputenc|fontenc|babel|amsmath|amssymb|geometry|fancyhdr)\b/gi, '');
  
  // Clean up placeholder content
  textContent = textContent.replace(/\[Contenu[^\]]*\]/gi, 'Section de contenu');
  textContent = textContent.replace(/\[Exercices[^\]]*\]/gi, 'Section d\'exercices');
  textContent = textContent.replace(/\[Devoirs[^\]]*\]/gi, 'Section de devoirs');
  textContent = textContent.replace(/\[.*?\]/g, ''); // Remove other placeholders
  
  // Normalize whitespace
  textContent = textContent.replace(/\s+/g, ' ').trim();
  
  // Create meaningful content from what we extracted
  const contentParts = [];
  
  // Add title info if available
  if (titleMatch) contentParts.push(`Titre: ${titleMatch[1]}`);
  if (authorMatch) contentParts.push(`Auteur: ${authorMatch[1]}`);
  if (dateMatch) contentParts.push(`Date: ${dateMatch[1]}`);
  
  // Add sections
  if (extractedSections.length > 0) {
    contentParts.push(`Sections: ${extractedSections.join(', ')}`);
  }
  
  // Add cleaned text content if meaningful
  if (textContent.length > 20) {
    contentParts.push(textContent);
  }
  
  const finalTextContent = contentParts.join('. ');
  
  return {
    sections: extractedSections,
    subsections: extractedSubsections,
    textContent: finalTextContent,
    hasMeaningfulContent: finalTextContent.length > 10 && extractedSections.length > 0
  };
}
