import { ProcessedLatexContent } from "./types.ts";

export function processLatexContent(templateContent: string): ProcessedLatexContent {
  let cleanContent = templateContent;
  
  // Remove document class and packages
  cleanContent = cleanContent.replace(/\\documentclass\[.*?\]\{.*?\}/g, '');
  cleanContent = cleanContent.replace(/\\usepackage\[.*?\]\{.*?\}/g, '');
  cleanContent = cleanContent.replace(/\\usepackage\{.*?\}/g, '');
  cleanContent = cleanContent.replace(/\\geometry\{.*?\}/g, '');
  
  // Remove begin/end document
  cleanContent = cleanContent.replace(/\\begin\{document\}/g, '');
  cleanContent = cleanContent.replace(/\\end\{document\}/g, '');
  
  // Extract sections and subsections
  const sections = cleanContent.match(/\\section\{([^}]+)\}/g) || [];
  const subsections = cleanContent.match(/\\subsection\{([^}]+)\}/g) || [];
  
  const extractedSections = sections.map(section => 
    section.replace(/\\section\{([^}]+)\}/, '$1')
  );
  
  const extractedSubsections = subsections.map(subsection => 
    subsection.replace(/\\subsection\{([^}]+)\}/, '$1')
  );
  
  // More aggressive cleaning for text content
  let textContent = cleanContent;
  
  // Remove all LaTeX commands and environments
  textContent = textContent.replace(/\\[a-zA-Z*]+(\[[^\]]*\])?(\{[^}]*\})?/g, ' ');
  textContent = textContent.replace(/\\[^a-zA-Z\s]/g, ' '); // Remove single char commands like \\
  
  // Remove remaining braces and brackets
  textContent = textContent.replace(/\{[^}]*\}/g, ' ');
  textContent = textContent.replace(/\[[^\]]*\]/g, ' ');
  
  // Remove measurements and units
  textContent = textContent.replace(/\d+(\.\d+)?(cm|mm|pt|em|ex|px|in)/g, '');
  
  // Remove common LaTeX artifacts
  textContent = textContent
    .replace(/geometry\s*margin/gi, '')
    .replace(/utf8\s*inputenc/gi, '')
    .replace(/T1\s*fontenc/gi, '')
    .replace(/french\s*babel/gi, '')
    .replace(/amsmath\s*amssymb/gi, '')
    .replace(/\b(margin|inputenc|fontenc|babel|amsmath|amssymb)\b/gi, '')
    .replace(/\[Contenu[^\]]*\]/gi, '') // Remove placeholder content
    .replace(/\[Enoncé[^\]]*\]/gi, '') // Remove placeholder exercises
    .replace(/\[.*?\]/g, '') // Remove any remaining brackets with content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Filter out very short or meaningless content
  const meaningfulSentences = textContent
    .split(/[.!?]+/)
    .filter(s => {
      const cleaned = s.trim();
      return cleaned.length > 15 && 
             !cleaned.match(/^\d/) && // Don't start with numbers
             !cleaned.match(/^(cm|mm|pt|em|ex)/) && // Don't start with units
             cleaned.split(' ').length > 3; // At least 4 words
    });

  return {
    sections: extractedSections,
    subsections: extractedSubsections,
    textContent: meaningfulSentences.join('. '),
    hasMeaningfulContent: meaningfulSentences.length > 0
  };
}