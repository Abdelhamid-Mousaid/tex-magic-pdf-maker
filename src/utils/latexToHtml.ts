// LaTeX to HTML converter for mathematical expressions
export interface LatexConversionResult {
  html: string;
  hasErrors: boolean;
  errors: string[];
}

export function convertLatexToHtml(latexContent: string): LatexConversionResult {
  const errors: string[] = [];
  let html = latexContent;

  try {
    // Replace common LaTeX document structure with HTML
    html = html.replace(/\\documentclass\{[^}]*\}/g, '');
    html = html.replace(/\\usepackage\{[^}]*\}/g, '');
    html = html.replace(/\\begin\{document\}/g, '');
    html = html.replace(/\\end\{document\}/g, '');
    
    // Convert sections and titles
    html = html.replace(/\\title\{([^}]*)\}/g, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    html = html.replace(/\\section\{([^}]*)\}/g, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    html = html.replace(/\\subsection\{([^}]*)\}/g, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>');
    
    // Convert basic formatting
    html = html.replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>');
    html = html.replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>');
    
    // Convert lists
    html = html.replace(/\\begin\{itemize\}/g, '<ul class="list-disc ml-6 mb-4">');
    html = html.replace(/\\end\{itemize\}/g, '</ul>');
    html = html.replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal ml-6 mb-4">');
    html = html.replace(/\\end\{enumerate\}/g, '</ol>');
    html = html.replace(/\\item\s*/g, '<li class="mb-1">');
    
    // Convert math environments to MathJax format
    html = html.replace(/\\\[([^]*?)\\\]/g, '$$$$1$$');
    html = html.replace(/\\\(([^]*?)\\\)/g, '$$$1$$');
    html = html.replace(/\\begin\{equation\}([^]*?)\\end\{equation\}/g, '$$$$1$$');
    html = html.replace(/\\begin\{align\}([^]*?)\\end\{align\}/g, '$$\\begin{align}$1\\end{align}$$');
    html = html.replace(/\\begin\{matrix\}([^]*?)\\end\{matrix\}/g, '$$\\begin{matrix}$1\\end{matrix}$$');
    
    // Convert common math commands for inline math
    html = html.replace(/\$([^$]*)\$/g, '$$$1$$');
    
    // Remove extra whitespace and clean up
    html = html.replace(/\n\s*\n/g, '</p><p class="mb-4">');
    html = html.replace(/^\s*|\s*$/g, '');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.includes('<p>') && !html.includes('<h1>') && !html.includes('<h2>')) {
      html = `<p class="mb-4">${html}</p>`;
    }

    return {
      html: `<div class="latex-content p-6 max-w-4xl mx-auto">${html}</div>`,
      hasErrors: false,
      errors: []
    };
  } catch (error) {
    errors.push(`Conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      html: `<div class="latex-content p-6 max-w-4xl mx-auto"><p class="text-red-600">Erreur de conversion LaTeX</p></div>`,
      hasErrors: true,
      errors
    };
  }
}