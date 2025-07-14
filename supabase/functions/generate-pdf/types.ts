export interface UserInfo {
  name: string;
  email: string;
  school?: string;
  academic_year?: string;
  level: string;
  level_code?: string;
  template_id?: string;
}

export interface RequestBody {
  userInfo: UserInfo;
  customLatexContent?: string;
}

export interface PdfGenerationResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  message?: string;
  error?: string;
}

export interface ProcessedLatexContent {
  sections: string[];
  subsections: string[];
  textContent: string;
  hasMeaningfulContent: boolean;
}