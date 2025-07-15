import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserInfo {
  full_name: string;
  school_name?: string;
  academic_year?: string;
}

interface CompileRequest {
  template_path: string;
  user_info: UserInfo;
  level_name: string;
  semester: string;
  chapter_number: number;
  template_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting LaTeX compilation request...')
    
    const { 
      template_path, 
      user_info, 
      level_name, 
      semester, 
      chapter_number, 
      template_name 
    }: CompileRequest = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Fetching template: ${template_path}`)

    // Fetch template from storage
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('latex-templates')
      .download(template_path)

    if (downloadError) {
      console.error('Error downloading template:', downloadError)
      throw new Error(`Failed to download template: ${downloadError.message}`)
    }

    // Read template content
    const templateContent = await templateData.text()
    console.log('Template fetched successfully')

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

    // Try LaTeX.online compilation service
    console.log('Attempting LaTeX compilation with latex.online...')
    
    const latexOnlineUrl = 'https://latexonline.cc/compile'
    
    const formData = new FormData()
    formData.append('text', personalizedContent)
    formData.append('command', 'xelatex')
    formData.append('return', 'pdf')
    
    console.log('Sending LaTeX content to compilation service...')
    console.log(`Content length: ${personalizedContent.length} characters`)
    
    const response = await fetch(latexOnlineUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/pdf, application/json'
      }
    })
    
    console.log(`Compilation response status: ${response.status}`)
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('LaTeX compilation failed:', errorText)
      throw new Error(`LaTeX compilation failed: ${response.status} - ${errorText}`)
    }
    
    // Check content type to ensure we got a PDF
    const contentType = response.headers.get('content-type')
    console.log(`Response content-type: ${contentType}`)
    
    if (!contentType || !contentType.includes('application/pdf')) {
      const responseText = await response.text()
      console.error('Expected PDF but got:', contentType, 'Content:', responseText.substring(0, 500))
      throw new Error(`Expected PDF but received: ${contentType}`)
    }
    
    // Get PDF bytes
    const pdfBytes = await response.arrayBuffer()
    console.log(`PDF compiled successfully, size: ${pdfBytes.byteLength} bytes`)
    
    // Validate PDF content by checking PDF signature
    const pdfSignature = new Uint8Array(pdfBytes.slice(0, 4))
    const expectedPdfSignature = new Uint8Array([0x25, 0x50, 0x44, 0x46]) // %PDF
    
    const isValidPdf = pdfSignature.every((byte, index) => byte === expectedPdfSignature[index])
    
    if (!isValidPdf) {
      console.error('Invalid PDF signature. First 20 bytes:', new Uint8Array(pdfBytes.slice(0, 20)))
      throw new Error('Generated file is not a valid PDF')
    }
    
    console.log('PDF validation successful - valid PDF signature detected')

    // Convert to base64 for transmission
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)))

    // Create filename
    const filename = `${level_name.replace(/\s+/g, '-')}-Ch${chapter_number}-${user_info.full_name.replace(/\s+/g, '-')}.pdf`

    console.log('Compilation completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        pdf_data: pdfBase64,
        filename: filename,
        message: 'PDF compiled successfully with XeLaTeX'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in compile-latex-pdf function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})