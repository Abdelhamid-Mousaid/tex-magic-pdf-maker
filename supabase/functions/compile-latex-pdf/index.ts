import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserInfo {
  full_name: string
  school_name?: string
  academic_year?: string
}

interface CompileRequest {
  template_path: string
  user_info: UserInfo
  level_name: string
  semester: string
  chapter_number: number
  template_name: string
}

// Native PDF generation without external dependencies
function generatePDF(userInfo: UserInfo, templateName: string, levelName: string, semester: string, chapterNumber: number, latexContent?: string): Uint8Array {
  console.log('Generating PDF with native PDF creation...')
  
  // Parse LaTeX content for meaningful content
  let sections: string[] = []
  let exercises: string[] = []
  let title = templateName
  
  if (latexContent) {
    // Extract title
    const titleMatch = latexContent.match(/\\title\{([^}]+)\}/)
    if (titleMatch) title = titleMatch[1]
    
    // Extract sections
    const sectionMatches = latexContent.match(/\\section\*?\{([^}]+)\}/g)
    if (sectionMatches) {
      sections = sectionMatches.map(s => s.replace(/\\section\*?\{([^}]+)\}/, '$1'))
    }
    
    // Extract exercises or items
    const exerciseMatches = latexContent.match(/\\exercise\{([^}]+)\}|\\item\s+([^\n\\]+)/g)
    if (exerciseMatches) {
      exercises = exerciseMatches
        .map(e => e.replace(/\\exercise\{([^}]+)\}|\\item\s+/, ''))
        .filter(e => e.trim().length > 0)
        .slice(0, 8) // Limit to 8 exercises
    }
  }
  
  // Create comprehensive PDF content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
/F3 7 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F2 20 Tf
72 720 Td
(${title}) Tj
0 -50 Td

/F3 14 Tf
(Informations personnelles) Tj
0 -25 Td

/F1 12 Tf
(Nom: ${userInfo.full_name}) Tj
0 -18 Td
(École: ${userInfo.school_name || 'École'}) Tj
0 -18 Td
(Année scolaire: ${userInfo.academic_year || new Date().getFullYear()}) Tj
0 -18 Td
(Niveau: ${levelName}) Tj
0 -18 Td
(Semestre: ${semester.replace('_', ' ')}) Tj
0 -18 Td
(Chapitre: ${chapterNumber}) Tj
0 -35 Td

${sections.length > 0 ? `/F3 14 Tf
(Contenu du cours) Tj
0 -25 Td

/F1 12 Tf
${sections.map((section, index) => `(${index + 1}. ${section.substring(0, 60)}${section.length > 60 ? '...' : ''}) Tj\n0 -18 Td`).join('\n')}
0 -10 Td` : ''}

${exercises.length > 0 ? `/F3 14 Tf
(Exercices et activités) Tj
0 -25 Td

/F1 12 Tf
${exercises.map((exercise, index) => `(${index + 1}. ${exercise.substring(0, 50)}${exercise.length > 50 ? '...' : ''}) Tj\n0 -18 Td`).join('\n')}
0 -10 Td` : ''}

/F3 14 Tf
(Instructions) Tj
0 -25 Td

/F1 12 Tf
(1. Consultez attentivement les exercices proposés) Tj
0 -18 Td
(2. Complétez toutes les activités demandées) Tj
0 -18 Td
(3. Vérifiez vos réponses avec votre professeur) Tj
0 -18 Td
(4. Utilisez ce document pour réviser) Tj
0 -35 Td

/F1 10 Tf
(Document généré automatiquement par Math Planner) Tj
0 -15 Td
(Date de génération: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

7 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Oblique
>>
endobj

xref
0 8
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000301 00000 n 
0000002400 00000 n 
0000002470 00000 n 
0000002545 00000 n 
trailer
<<
/Size 8
/Root 1 0 R
>>
startxref
2622
%%EOF`

  return new TextEncoder().encode(pdfContent)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== Starting robust PDF generation ===')
    
    const { 
      template_path, 
      user_info, 
      level_name, 
      semester, 
      chapter_number, 
      template_name 
    }: CompileRequest = await req.json()

    console.log('Request details:', {
      template_path,
      user_info: { ...user_info, full_name: user_info.full_name?.substring(0, 20) + '...' },
      level_name,
      semester,
      chapter_number,
      template_name
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Downloading template from: ${template_path}`)

    // Fetch template from storage
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('latex-templates')
      .download(template_path)

    if (downloadError) {
      console.error('Template download error:', downloadError)
      throw new Error(`Failed to download template: ${downloadError.message}`)
    }

    // Read template content
    const templateContent = await templateData.text()
    console.log(`Template downloaded successfully, size: ${templateContent.length} characters`)

    // Personalize template with user data
    const currentDate = new Date().toLocaleDateString('fr-FR')
    let personalizedContent = templateContent
      .replace(/\{nom_utilisateur\}/g, user_info.full_name)
      .replace(/\{nom_ecole\}/g, user_info.school_name || 'École')
      .replace(/\{annee_scolaire\}/g, user_info.academic_year || new Date().getFullYear().toString())
      .replace(/\{niveau\}/g, level_name)
      .replace(/\{semestre\}/g, semester.replace('_', ' '))
      .replace(/\{chapitre\}/g, `Chapitre ${chapter_number}`)
      .replace(/\{date\}/g, currentDate)
      .replace(/\{titre_document\}/g, template_name)

    console.log('Template personalized successfully')

    // Generate PDF using native implementation
    console.log('Generating PDF with robust native method...')
    const pdfBytes = generatePDF(
      user_info, 
      template_name, 
      level_name, 
      semester, 
      chapter_number, 
      personalizedContent
    )

    // Validate PDF content
    if (!pdfBytes || pdfBytes.length === 0) {
      throw new Error('Generated PDF is empty')
    }

    // Check PDF signature
    const pdfSignature = new TextDecoder().decode(pdfBytes.slice(0, 4))
    if (!pdfSignature.startsWith('%PDF')) {
      console.warn('Generated content may not be a valid PDF, but proceeding...')
    }

    console.log(`PDF generated successfully, size: ${pdfBytes.byteLength} bytes`)

    // Convert to base64
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes))
    
    // Generate filename
    const sanitizedName = template_name.replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedLevel = level_name.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `${sanitizedLevel}_Ch${chapter_number}_${sanitizedName}.pdf`

    console.log('=== PDF generation completed successfully ===')

    return new Response(
      JSON.stringify({
        success: true,
        pdf_data: base64Pdf,
        filename: filename,
        message: 'PDF généré avec succès (méthode native)'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('=== PDF generation failed ===')
    console.error('Error details:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Une erreur est survenue lors de la génération du PDF',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})