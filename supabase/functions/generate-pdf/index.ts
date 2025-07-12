import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

// PDF generator using jsPDF
const generatePDF = (userInfo: any): Uint8Array => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doc = new jsPDF();
  let currentY = 20;

  // Helper function to add text with proper positioning
  const addText = (text: string, x: number = 20, fontSize: number = 12, style: string = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    if (currentY > 280) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(text, x, currentY);
    currentY += fontSize * 0.5 + 5;
  };

  const addSpace = (space: number = 10) => {
    currentY += space;
  };

  // Title page
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Math Planner', 105, 30, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(`Planificateur Mathématiques - ${userInfo.level}`, 105, 45, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(userInfo.name, 105, 65, { align: 'center' });
  doc.text(userInfo.email, 105, 80, { align: 'center' });
  
  if (userInfo.school) {
    doc.text(userInfo.school, 105, 95, { align: 'center' });
  }
  
  if (userInfo.academic_year) {
    doc.text(`Année Scolaire: ${userInfo.academic_year}`, 105, 110, { align: 'center' });
  }
  
  doc.text(currentDate, 105, 130, { align: 'center' });

  // Abstract
  currentY = 160;
  addText('Résumé', 20, 14, 'bold');
  addText(`Ce document de planification mathématique a été généré automatiquement par Math Planner pour ${userInfo.name}, niveau ${userInfo.level}. Il est conçu spécialement pour le système éducatif marocain et comprend les chapitres et exercices adaptés au programme officiel.`, 20, 11);

  // New page for content
  doc.addPage();
  currentY = 20;

  // Table of contents
  addText('Table des Matières', 20, 16, 'bold');
  addSpace();
  addText('1. Informations du Cours ..................................... 3', 25, 12);
  addText('2. Programme de Mathématiques .............................. 3', 25, 12);
  addText('3. Exercices Types .......................................... 4', 25, 12);
  addText('4. Évaluation et Contrôles .................................. 5', 25, 12);
  addText('5. Progression Pédagogique .................................. 5', 25, 12);

  // New page for content
  doc.addPage();
  currentY = 20;

  // Section 1: Course Information
  addText('1. Informations du Cours', 20, 16, 'bold');
  addSpace();
  addText('Détails de l\'Enseignant', 25, 14, 'bold');
  addText(`• Nom : ${userInfo.name}`, 30, 12);
  addText(`• Email : ${userInfo.email}`, 30, 12);
  if (userInfo.school) {
    addText(`• École : ${userInfo.school}`, 30, 12);
  }
  if (userInfo.academic_year) {
    addText(`• Année Scolaire : ${userInfo.academic_year}`, 30, 12);
  }
  addText(`• Niveau de Classe : ${userInfo.level}`, 30, 12);
  addText(`• Code Niveau : ${userInfo.level_code}`, 30, 12);

  addSpace();

  // Section 2: Math Program
  addText(`2. Programme de Mathématiques - ${userInfo.level}`, 20, 16, 'bold');
  addSpace();
  addText('Objectifs Pédagogiques', 25, 14, 'bold');
  addText('Ce programme vise à développer chez l\'élève :', 30, 12);
  addText('1. La capacité de raisonnement mathématique', 35, 12);
  addText('2. La maîtrise des techniques de calcul', 35, 12);
  addText('3. L\'aptitude à résoudre des problèmes concrets', 35, 12);
  addText('4. L\'esprit d\'analyse et de synthèse', 35, 12);

  addSpace();

  addText('Contenu du Programme', 25, 14, 'bold');
  addText('Chapitre 1 : Nombres et Calculs', 30, 13, 'bold');
  addText('• Opérations sur les nombres réels', 35, 11);
  addText('• Puissances et racines', 35, 11);
  addText('• Calcul littéral', 35, 11);
  addText('• Équations et inéquations', 35, 11);

  addSpace(5);

  addText('Chapitre 2 : Géométrie', 30, 13, 'bold');
  addText('• Configurations géométriques', 35, 11);
  addText('• Théorèmes de géométrie plane', 35, 11);
  addText('• Transformations géométriques', 35, 11);
  addText('• Calculs de périmètres, aires et volumes', 35, 11);

  addSpace(5);

  addText('Chapitre 3 : Fonctions', 30, 13, 'bold');
  addText('• Notion de fonction', 35, 11);
  addText('• Fonctions affines et linéaires', 35, 11);
  addText('• Fonctions du second degré', 35, 11);
  addText('• Représentations graphiques', 35, 11);

  // New page for exercises
  doc.addPage();
  currentY = 20;

  // Section 3: Example Exercises
  addText('3. Exercices Types', 20, 16, 'bold');
  addSpace();
  
  addText('Exercice 1 : Calcul Numérique', 25, 14, 'bold');
  addText('Calculer et simplifier :', 30, 12);
  addText('A = √50 + 2√8 - √32', 35, 11);
  addText('B = (3√12 - √27) / √3', 35, 11);
  addText('C = (2√3 + 1)² - 4√3', 35, 11);

  addSpace();

  addText('Exercice 2 : Équations', 25, 14, 'bold');
  addText('Résoudre les équations suivantes :', 30, 12);
  addText('1. 2x + 5 = 3x - 7', 35, 11);
  addText('2. x² - 4x + 3 = 0', 35, 11);
  addText('3. √(2x + 1) = x - 2', 35, 11);

  addSpace();

  addText('Exercice 3 : Géométrie', 25, 14, 'bold');
  addText('Dans un triangle ABC rectangle en A, AB = 6 cm et AC = 8 cm.', 30, 12);
  addText('1. Calculer BC', 35, 11);
  addText('2. Calculer l\'aire du triangle ABC', 35, 11);
  addText('3. Calculer les angles aigus du triangle', 35, 11);

  // Section 4: Evaluation
  addSpace();
  addText('4. Évaluation et Contrôles', 20, 16, 'bold');
  addSpace();
  
  addText('Contrôle Continu', 25, 14, 'bold');
  addText('• Interrogations écrites (30% de la note)', 30, 11);
  addText('• Devoirs à la maison (20% de la note)', 30, 11);
  addText('• Participation en classe (10% de la note)', 30, 11);

  addSpace(5);

  addText('Examens', 25, 14, 'bold');
  addText('• Contrôle semestriel (40% de la note)', 30, 11);
  addText('• Examen final selon le niveau', 30, 11);

  // Section 5: Progression
  addSpace();
  addText('5. Progression Pédagogique', 20, 16, 'bold');
  addSpace();

  addText('Premier Trimestre', 25, 14, 'bold');
  addText('1. Nombres et calculs (4 semaines)', 30, 11);
  addText('2. Introduction aux équations (3 semaines)', 30, 11);
  addText('3. Géométrie de base (4 semaines)', 30, 11);

  addSpace(5);

  addText('Deuxième Trimestre', 25, 14, 'bold');
  addText('1. Fonctions linéaires (4 semaines)', 30, 11);
  addText('2. Systèmes d\'équations (3 semaines)', 30, 11);
  addText('3. Géométrie dans l\'espace (4 semaines)', 30, 11);

  addSpace(5);

  addText('Troisième Trimestre', 25, 14, 'bold');
  addText('1. Statistiques (3 semaines)', 30, 11);
  addText('2. Probabilités (3 semaines)', 30, 11);
  addText('3. Révisions et approfondissements (4 semaines)', 30, 11);

  // Footer
  currentY = 280;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré automatiquement par Math Planner - ${currentDate}`, 105, currentY, { align: 'center' });
  doc.text(`Outil professionnel de planification pédagogique - Niveau ${userInfo.level_code}`, 105, currentY + 10, { align: 'center' });

  return doc.output('arraybuffer');
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

    // Generate PDF directly using jsPDF
    const pdfBuffer = generatePDF(userInfo);
    logStep("PDF generated", { bufferSize: pdfBuffer.byteLength });

    // Convert ArrayBuffer to base64 for download
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    const dataUrl = `data:application/pdf;base64,${base64PDF}`;

    logStep("PDF generation completed", { dataUrlLength: dataUrl.length });

    return new Response(JSON.stringify({ 
      success: true,
      download_url: dataUrl,
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