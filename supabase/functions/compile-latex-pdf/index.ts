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

    // Create temporary directory for compilation
    const tempDir = await Deno.makeTempDir({ prefix: 'latex_compile_' })
    const texFilePath = `${tempDir}/document.tex`
    const pdfFilePath = `${tempDir}/document.pdf`

    console.log(`Created temp directory: ${tempDir}`)

    // Write LaTeX content to file
    await Deno.writeTextFile(texFilePath, personalizedContent)
    console.log('LaTeX file written')

    // Compile with XeLaTeX
    console.log('Starting XeLaTeX compilation...')
    const xelatexProcess = new Deno.Command('xelatex', {
      args: [
        '-interaction=nonstopmode',
        '-output-directory=' + tempDir,
        texFilePath
      ],
      cwd: tempDir,
      stdout: 'piped',
      stderr: 'piped'
    })

    const { code, stdout, stderr } = await xelatexProcess.output()
    
    const stdoutText = new TextDecoder().decode(stdout)
    const stderrText = new TextDecoder().decode(stderr)
    
    console.log('XeLaTeX exit code:', code)
    if (stdoutText) console.log('XeLaTeX stdout:', stdoutText)
    if (stderrText) console.log('XeLaTeX stderr:', stderrText)

    if (code !== 0) {
      console.error('XeLaTeX compilation failed')
      throw new Error(`LaTeX compilation failed with exit code ${code}. Error: ${stderrText}`)
    }

    // Check if PDF was created
    try {
      await Deno.stat(pdfFilePath)
      console.log('PDF file created successfully')
    } catch {
      throw new Error('PDF file was not created despite successful compilation')
    }

    // Read PDF file
    const pdfBytes = await Deno.readFile(pdfFilePath)
    console.log(`PDF file size: ${pdfBytes.length} bytes`)

    // Clean up temporary directory
    await Deno.remove(tempDir, { recursive: true })
    console.log('Temporary directory cleaned up')

    // Convert to base64 for transmission
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes))

    // Create filename
    const filename = `${level_name.replace(/\s+/g, '-')}-Ch${chapter_number}-${user_info.full_name.replace(/\s+/g, '-')}.pdf`

    console.log('Compilation completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        pdf_data: pdfBase64,
        filename: filename,
        message: 'PDF compiled successfully'
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