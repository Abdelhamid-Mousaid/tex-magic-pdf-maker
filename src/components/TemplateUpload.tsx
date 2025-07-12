import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

interface TemplateUploadProps {
  onTemplateSelect?: (template: Template) => void;
}

export function TemplateUpload({ onTemplateSelect }: TemplateUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadTemplates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith('.tex')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .tex file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('latex-templates')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save template metadata
      const { error: dbError } = await supabase
        .from('templates')
        .insert({
          user_id: user.id,
          name: file.name.replace('.tex', ''),
          description: '',
          file_path: fileName,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Template uploaded successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error uploading template:', error);
      toast({
        title: "Error",
        description: "Failed to upload template",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteTemplate = async (template: Template) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('latex-templates')
        .remove([template.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          LaTeX Templates
        </CardTitle>
        <CardDescription>
          Upload your LaTeX template files to use as starting points for generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-upload">Upload Template (.tex file)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="template-upload"
              type="file"
              accept=".tex"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadTemplates}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {templates.length > 0 && (
          <div className="space-y-2">
            <Label>Your Templates</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(template.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {onTemplateSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTemplateSelect(template)}
                      >
                        Use
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}