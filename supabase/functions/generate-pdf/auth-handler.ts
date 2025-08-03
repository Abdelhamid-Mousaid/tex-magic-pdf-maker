import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTH-HANDLER] ${step}${detailsStr}`);
};

// Validate and sanitize LaTeX content
export function validateLatexContent(content: string): string {
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid LaTeX content provided");
  }
  
  // Check content length
  if (content.length > 50000) {
    throw new Error("LaTeX content too large (max 50KB)");
  }
  
  // Remove potentially dangerous commands
  const dangerousCommands = [
    '\\input', '\\include', '\\write', '\\openout', '\\closeout',
    '\\immediate', '\\special', '\\catcode', '\\read', '\\openin'
  ];
  
  let sanitizedContent = content;
  dangerousCommands.forEach(cmd => {
    const regex = new RegExp(`\\${cmd}\\b`, 'gi');
    if (regex.test(sanitizedContent)) {
      logStep("Blocked dangerous LaTeX command", { command: cmd });
      sanitizedContent = sanitizedContent.replace(regex, `% BLOCKED: ${cmd}`);
    }
  });
  
  return sanitizedContent;
}

export async function authenticateUser(authHeader: string | null) {
  if (!authHeader) {
    logStep("No authorization header provided");
    throw new Error("No authorization header provided");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  
  // Validate token format
  if (token.length < 20 || !token.includes('.')) {
    logStep("Invalid token format");
    throw new Error("Invalid authentication token format");
  }
  
  logStep("Attempting authentication", { tokenLength: token.length });
  
  try {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", { error: userError.message });
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user) {
      logStep("User not found in token");
      throw new Error("User not authenticated");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });
    return { user, supabaseClient };
  } catch (authError: any) {
    logStep("Authentication exception", { error: authError.message });
    throw new Error(`Authentication error: ${authError.message}`);
  }
}

export async function fetchTemplateContent(supabaseClient: any, templateId: string): Promise<string | null> {
  const logStep = (step: string, details?: any) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[TEMPLATE-FETCH] ${step}${detailsStr}`);
  };

  try {
    const { data: templateData, error: templateError } = await supabaseClient
      .from('system_templates')
      .select('file_path')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (!templateError && templateData) {
      const { data: fileData, error: fileError } = await supabaseClient.storage
        .from('latex-templates')
        .download(templateData.file_path);

      if (!fileError && fileData) {
        const content = await fileData.text();
        logStep('Template loaded successfully', { templateId, contentLength: content.length });
        return content;
      }
    }
    return null;
  } catch (error: any) {
    logStep('Template loading failed', { error: error.message });
    return null;
  }
}