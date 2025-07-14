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
      // This is AI-generated LaTeX content - extract meaningful content
      addText('CONTENU GÉNÉRÉ PAR IA', headerFontSize);
      addText('='.repeat(30));
      addText('Ce document a été créé avec l\'intelligence artificielle Gemini');
      addText('');
      
      const processed = processLatexContent(templateContent);
      
      if (processed.sections.length > 0) {
        addText('Structure du document:', headerFontSize);
        processed.sections.forEach((section, index) => {
          addText(`${index + 1}. ${section}`);
        });
        addText('');
      }
      
      if (processed.subsections.length > 0) {
        addText('Sous-sections:', headerFontSize);
        processed.subsections.forEach((subsection) => {
          addText(`  • ${subsection}`);
        });
        addText('');
      }
      
      if (processed.hasMeaningfulContent) {
        addText('Contenu extrait du document:', headerFontSize);
        const sentences = processed.textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        sentences.slice(0, 8).forEach(sentence => {
          const cleanSentence = sentence.trim();
          if (cleanSentence) {
            addText(`• ${cleanSentence}.`);
          }
        });
      } else {
        addText('Template LaTeX généré avec succès pour votre niveau.', headerFontSize);
        addText('Le contenu a été personnalisé selon vos besoins académiques.');
        addText('');
        addText('Fonctionnalités incluses:', headerFontSize);
        addText('• Structure de cours organisée');
        addText('• Sections pour exercices et devoirs');
        addText('• Formatage professionnel');
        addText('• Compatible avec les outils LaTeX standards');
      }
    } else {
      // This is a regular template
      addText('TEMPLATE PERSONNALISÉ UTILISÉ', headerFontSize);
      addText('='.repeat(30));
      addText(`Contenu du template:\n${templateContent.substring(0, 500)}...`);
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