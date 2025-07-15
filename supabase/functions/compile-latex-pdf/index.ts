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

    // Try multiple LaTeX compilation services
    let response: Response | null = null
    let lastError = ''
    
    // Service 1: Try latex.online
    try {
      console.log('Trying latex.online service...')
      const latexOnlineUrl = 'https://latex.online/compile'
      
      const formData = new FormData()
      formData.append('text', personalizedContent)
      formData.append('command', 'xelatex')
      
      response = await fetch(latexOnlineUrl, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        console.log('Successfully compiled with latex.online')
      } else {
        throw new Error(`Status: ${response.status}`)
      }
    } catch (error) {
      console.log('latex.online failed:', error.message)
      lastError = error.message
      response = null
    }
    
    // Service 2: Try QuickLaTeX if first service fails
    if (!response || !response.ok) {
      try {
        console.log('Trying QuickLaTeX service...')
        const quickLatexUrl = 'https://quicklatex.com/latex3.f'
        
        const formData = new FormData()
        formData.append('formula', personalizedContent)
        formData.append('fformat', 'pdf')
        formData.append('fsize', '12px')
        formData.append('fcolor', '000000')
        formData.append('mode', '0')
        formData.append('out', '1')
        formData.append('remhost', 'quicklatex.com')
        
        response = await fetch(quickLatexUrl, {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          console.log('Successfully compiled with QuickLaTeX')
        } else {
          throw new Error(`Status: ${response.status}`)
        }
      } catch (error) {
        console.log('QuickLaTeX failed:', error.message)
        lastError += '; ' + error.message
        response = null
      }
    }

    if (!response || !response.ok) {
      throw new Error(`All LaTeX compilation services failed. Last errors: ${lastError}`)
    }

    // Get PDF bytes
    const pdfBytes = await response.arrayBuffer()
    console.log(`PDF compiled successfully, size: ${pdfBytes.byteLength} bytes`)

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