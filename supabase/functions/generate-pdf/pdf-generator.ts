import { PDFDocument, rgb } from "https://cdn.skypack.dev/pdf-lib@1.17.1";
import { UserInfo } from "./types.ts";
import { processLatexContent } from "./latex-processor.ts";

export async function generatePDF(userInfo: UserInfo, templateContent?: string | null): Promise<Uint8Array> {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  
  // Get the width and height of the page
  const { width, height } = currentPage.getSize();
  
  // Set up font and colors
  const fontSize = 12;
  const titleFontSize = 18;
  const headerFontSize = 14;
  const lineHeight = fontSize + 4;
  const margin = 50;
  
  let yPosition = height - margin; // Start from top with margin
  
  // Helper function to add text with proper spacing and page breaks
  const addText = (text: string, size: number = fontSize, isTitle: boolean = false, isHeader: boolean = false) => {
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Check if we need a new page
      if (yPosition < margin + size) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - margin;
      }
      
      // Draw the text on current page
      currentPage.drawText(line || ' ', {
        x: margin,
        y: yPosition,
        size: size,
        color: isTitle ? rgb(0, 0.2, 0.8) : rgb(0, 0, 0),
      });
      
      // Move down for next line
      yPosition -= (size + 6);
    }
    
    // Add extra spacing after paragraphs
    if (isHeader) {
      yPosition -= 10;
    } else if (isTitle) {
      yPosition -= 15;
    } else {
      yPosition -= 5;
    }
  };

  // Add title
  addText('Math Planner - Planificateur Mathématiques', titleFontSize, true);
  addText('='.repeat(50));
  
  // Add user information
  addText('Informations de l\'Enseignant:', headerFontSize);
  addText(`- Nom: ${userInfo.name}`);
  addText(`- Email: ${userInfo.email}`);
  addText(`- École: ${userInfo.school || 'Non spécifiée'}`);
  addText(`- Année Scolaire: ${userInfo.academic_year || 'Non spécifiée'}`);
  addText(`- Niveau: ${userInfo.level}`);
  addText(`- Code Niveau: ${userInfo.level_code || userInfo.level}`);
  addText('');
  addText(`Date de génération: ${currentDate}`);
  addText('');

  if (templateContent) {
    if (templateContent.includes('\\documentclass')) {
      // This is AI-generated LaTeX content - show comprehensive information
      addText('CONTENU GÉNÉRÉ PAR IA', headerFontSize);
      addText('='.repeat(30));
      addText('Ce document a été créé avec l\'intelligence artificielle DeepSeek');
      addText('');
      
      // First show the LaTeX document structure
      addText('STRUCTURE DU DOCUMENT LATEX:', headerFontSize);
      addText('='.repeat(25));
      
      // Extract and show document class
      const docClassMatch = templateContent.match(/\\documentclass\[([^\]]*)\]\{([^}]+)\}/);
      if (docClassMatch) {
        addText(`Type de document: ${docClassMatch[2]} (${docClassMatch[1]})`);
      }
      
      // Extract and show packages
      const packages = templateContent.match(/\\usepackage(\[[^\]]*\])?\{([^}]+)\}/g) || [];
      if (packages.length > 0) {
        addText('');
        addText('Packages LaTeX utilisés:');
        packages.slice(0, 8).forEach(pkg => {
          const match = pkg.match(/\\usepackage(\[[^\]]*\])?\{([^}]+)\}/);
          if (match) {
            addText(`  • ${match[2]}${match[1] ? ` ${match[1]}` : ''}`);
          }
        });
      }
      
      // Extract title, author, date
      const titleMatch = templateContent.match(/\\title\{([^}]+)\}/);
      const authorMatch = templateContent.match(/\\author\{([^}]+)\}/);
      const dateMatch = templateContent.match(/\\date\{([^}]+)\}/);
      
      if (titleMatch || authorMatch || dateMatch) {
        addText('');
        addText('Informations du document:');
        if (titleMatch) addText(`  Titre: ${titleMatch[1]}`);
        if (authorMatch) addText(`  Auteur: ${authorMatch[1]}`);
        if (dateMatch) addText(`  Date: ${dateMatch[1]}`);
      }
      
      addText('');
      
      // Process and show content structure
      const processed = processLatexContent(templateContent);
      
      if (processed.sections.length > 0) {
        addText('SECTIONS DU DOCUMENT:', headerFontSize);
        addText('='.repeat(20));
        processed.sections.forEach((section, index) => {
          addText(`${index + 1}. ${section}`);
        });
        addText('');
      }
      
      if (processed.subsections.length > 0) {
        addText('Sous-sections détaillées:');
        processed.subsections.forEach((subsection, index) => {
          addText(`  ${index + 1}. ${subsection}`);
        });
        addText('');
      }
      
      // Show meaningful content if available
      if (processed.hasMeaningfulContent && processed.textContent.length > 20) {
        addText('CONTENU EXTRAIT:', headerFontSize);
        addText('='.repeat(15));
        
        // Split content into meaningful parts
        const contentParts = processed.textContent.split(/[.!]\s+/).filter(part => part.trim().length > 10);
        
        contentParts.slice(0, 12).forEach(part => {
          const cleanPart = part.trim();
          if (cleanPart && !cleanPart.match(/^(Section|Titre|Auteur|Date):/)) {
            addText(`• ${cleanPart}${cleanPart.endsWith('.') ? '' : '.'}`);
          }
        });
        
        if (contentParts.length > 12) {
          addText(`... et ${contentParts.length - 12} éléments de contenu supplémentaires`);
        }
      }
      
      // Show LaTeX code preview
      addText('');
      addText('APERÇU DU CODE LATEX GÉNÉRÉ:', headerFontSize);
      addText('='.repeat(30));
      
      // Show first part of LaTeX code (cleaned up for readability)
      const codeLines = templateContent.split('\n').filter(line => 
        line.trim() && 
        !line.includes('\\usepackage') && 
        !line.includes('\\documentclass')
      );
      
      const previewLines = codeLines.slice(0, 15);
      previewLines.forEach(line => {
        const cleanLine = line.replace(/^\s+/, '  '); // Normalize indentation
        if (cleanLine.length > 80) {
          addText(cleanLine.substring(0, 77) + '...');
        } else {
          addText(cleanLine);
        }
      });
      
      if (codeLines.length > 15) {
        addText('...');
        addText(`[${codeLines.length - 15} lignes de code supplémentaires]`);
      }
      
      addText('');
      addText('INFORMATIONS TECHNIQUES:', headerFontSize);
      addText('='.repeat(22));
      addText(`Taille du template: ${templateContent.length} caractères`);
      addText(`Nombre de lignes: ${templateContent.split('\n').length}`);
      addText(`Sections trouvées: ${processed.sections.length}`);
      addText(`Contenu traitable: ${processed.hasMeaningfulContent ? 'Oui' : 'Non'}`);
      
    } else {
      // This is a regular template or custom content
      addText('TEMPLATE PERSONNALISÉ UTILISÉ', headerFontSize);
      addText('='.repeat(30));
      addText('');
      
      // Show first part of the content
      const contentPreview = templateContent.substring(0, 800);
      const lines = contentPreview.split('\n');
      
      lines.forEach(line => {
        if (line.trim()) {
          addText(line.length > 80 ? line.substring(0, 77) + '...' : line);
        }
      });
      
      if (templateContent.length > 800) {
        addText('');
        addText(`... [${templateContent.length - 800} caractères supplémentaires]`);
      }
    }
  } else {
    addText(`Programme de Mathématiques - ${userInfo.level}`, headerFontSize);
    addText('='.repeat(40));
    addText('');
    
    addText('Objectifs Pédagogiques:', headerFontSize);
    addText('1. Développer la capacité de raisonnement mathématique');
    addText('2. Maîtriser les techniques de calcul');
    addText('3. Résoudre des problèmes concrets');
    addText('4. Développer l\'esprit d\'analyse et de synthèse');
    addText('');
    
    addText('Contenu du Programme:', headerFontSize);
    addText('');
    addText('Chapitre 1: Nombres et Calculs');
    addText('- Opérations sur les nombres réels');
    addText('- Puissances et racines');
    addText('- Calcul littéral');
    addText('- Équations et inéquations');
    addText('');
    
    addText('Chapitre 2: Géométrie');
    addText('- Configurations géométriques');
    addText('- Théorèmes de géométrie plane');
    addText('- Transformations géométriques');
    addText('- Calculs de périmètres, aires et volumes');
    addText('');
    
    addText('Chapitre 3: Fonctions');
    addText('- Notion de fonction');
    addText('- Fonctions affines et linéaires');
    addText('- Fonctions du second degré');
    addText('- Représentations graphiques');
  }
  
  // Add footer
  addText('');
  addText('='.repeat(50));
  addText('Généré automatiquement par Math Planner');
  addText('Outil professionnel de planification pédagogique');
  addText('='.repeat(50));

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}