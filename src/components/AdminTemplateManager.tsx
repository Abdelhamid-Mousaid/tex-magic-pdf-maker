import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Shield, Eye, EyeOff } from "lucide-react";

interface Level {
  id: string;
  name: string;
  name_fr: string;
}

interface Plan {
  id: string;
  name: string;
  name_fr: string;
}

interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  level_id: string;
  plan_id: string;
  file_path: string;
  file_size: number;
  is_active: boolean;
  created_at: string;
  levels?: { name: string; name_fr: string };
  subscription_plans?: { name: string; name_fr: string };
}

export function AdminTemplateManager() {
  console.log('AdminTemplateManager rendering...');
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    level_id: "",
    plan_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load levels, plans, and templates
      const [levelsRes, plansRes, templatesRes] = await Promise.all([
        supabase.from('levels').select('*').order('order_index'),
        supabase.from('subscription_plans').select('*').order('name'),
        supabase.from('system_templates').select(`
          *,
          levels(name, name_fr),
          subscription_plans(name, name_fr)
        `).order('created_at', { ascending: false })
      ]);

      if (levelsRes.error) throw levelsRes.error;
      if (plansRes.error) throw plansRes.error;
      if (templatesRes.error) throw templatesRes.error;

      setLevels(levelsRes.data || []);
      setPlans(plansRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.tex')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .tex file",
        variant: "destructive",
      });
      return;
    }

    if (!newTemplate.name || !newTemplate.level_id || !newTemplate.plan_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name, level, and plan",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `system/${Date.now()}-${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('latex-templates')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save template metadata
      const { error: dbError } = await supabase
        .from('system_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          level_id: newTemplate.level_id,
          plan_id: newTemplate.plan_id,
          file_path: fileName,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "System template uploaded successfully",
      });

      setNewTemplate({ name: "", description: "", level_id: "", plan_id: "" });
      loadData();
      
      // Reset file input
      event.target.value = '';
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

  const toggleTemplateStatus = async (template: SystemTemplate) => {
    try {
      const { error } = await supabase
        .from('system_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template ${template.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      loadData();
    } catch (error) {
      console.error('Error updating template status:', error);
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (template: SystemTemplate) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('latex-templates')
        .remove([template.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('system_templates')
        .delete()
        .eq('id', template.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      loadData();
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Template Manager
          </CardTitle>
          <CardDescription>
            Upload and manage LaTeX templates for all levels and subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Math Workbook Level 1"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-level">Level</Label>
              <Select 
                value={newTemplate.level_id} 
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, level_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} / {level.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-plan">Subscription Plan</Label>
              <Select 
                value={newTemplate.plan_id} 
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, plan_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} / {plan.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-file">Template File (.tex)</Label>
              <Input
                id="template-file"
                type="file"
                accept=".tex"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              placeholder="Describe this template..."
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              System Templates ({templates.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    template.is_active ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      {template.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Level: {template.levels?.name} | Plan: {template.subscription_plans?.name}
                    </p>
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {(template.file_size / 1024).toFixed(1)} KB • {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant={template.is_active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTemplateStatus(template)}
                    >
                      {template.is_active ? 'Actif' : 'Inactif'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No templates uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}