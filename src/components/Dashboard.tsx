
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Download, LogOut, CreditCard, Star, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PlanSelection from './PlanSelection';
import ProfileSettings from './ProfileSettings';
import LevelSelectionModal from './LevelSelectionModal';
import { SemesterSelectionModal } from './SemesterSelectionModal';
import { ChapterSelectionModal } from './ChapterSelectionModal';


interface UserProfile {
  full_name: string;
  school_name: string | null;
  academic_year: string | null;
  name_changes_count: number;
}

interface SubscriptionPlan {
  id: string;
  name_fr: string;
  description_fr: string;
  is_free: boolean;
  price: number;
}

interface UserSubscription {
  subscription_plans: SubscriptionPlan;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, school_name, academic_year, name_changes_count')
        .eq('id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch user subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select(`
          subscription_plans (
            id,
            name_fr,
            description_fr,
            is_free,
            price
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleGenerateLatex = () => {
    setShowLevelModal(true);
  };

  const handleLevelSelected = (selectedLevel: any) => {
    setSelectedLevel(selectedLevel);
    setShowLevelModal(false);
    setShowSemesterModal(true);
  };

  const handleSemesterSelected = (semester: string) => {
    setSelectedSemester(semester);
    setShowSemesterModal(false);
    setShowChapterModal(true);
  };

  const handleChapterSelected = (template: any) => {
    setSelectedTemplate(template);
    setShowChapterModal(false);
    generatePdfFromTemplate(template);
  };

  const generatePdfFromTemplate = async (template: any) => {
    if (!profile || !selectedLevel) return;

    setIsGenerating(true);
    try {
      console.log('Starting PDF generation with template:', template.name);
      
      // Prepare compilation request
      const compileRequest = {
        template_path: template.file_path,
        user_info: {
          full_name: profile.full_name,
          school_name: profile.school_name,
          academic_year: profile.academic_year
        },
        level_name: selectedLevel.name_fr,
        semester: selectedSemester,
        chapter_number: template.chapter_number,
        template_name: template.name
      };

      console.log('Calling LaTeX compilation function...');
      
      // Call the compilation edge function
      const { data, error } = await supabase.functions.invoke('compile-latex-pdf', {
        body: compileRequest
      });

      if (error) {
        console.error('Compilation function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('Compilation failed:', data.error);
        throw new Error(data.error || 'PDF compilation failed');
      }

      console.log('PDF compiled successfully, downloading...');

      // Convert base64 to blob and download
      const pdfBytes = Uint8Array.from(atob(data.pdf_data), c => c.charCodeAt(0));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Généré!",
        description: `Document ${template.name} compilé et téléchargé avec succès!`,
      });
      
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      
      toast({
        title: "Erreur de Compilation", 
        description: error.message || "Impossible de compiler le document LaTeX.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setSelectedLevel(null);
      setSelectedSemester("");
      setSelectedTemplate(null);
    }
  };


  // Supprimer l'ancienne fonction handleDownloadPdf car on télécharge maintenant directement

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  if (showPlans) {
    return <PlanSelection onBack={() => setShowPlans(false)} onPlanSelected={fetchUserData} />;
  }

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <ProfileSettings onClose={() => setShowProfile(false)} />
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Math Planner</h1>
              <p className="text-sm sm:text-base text-gray-600">Tableau de bord personnel</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button onClick={() => setShowProfile(true)} variant="outline" className="flex items-center space-x-2 text-sm sm:text-base">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon Profil</span>
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="flex items-center space-x-2 text-sm sm:text-base">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Bienvenue, {profile?.full_name || 'Utilisateur'}!
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Badge variant={subscription?.subscription_plans.is_free ? "secondary" : "default"} className="text-sm">
              {subscription?.subscription_plans.name_fr || 'Plan en cours de chargement...'}
            </Badge>
            {!subscription?.subscription_plans.is_free && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">Plan Premium</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Current Plan */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span>Votre Plan Actuel</span>
                </CardTitle>
                <CardDescription>
                  {subscription?.subscription_plans.description_fr || 'Chargement de la description...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <span className="text-lg font-semibold text-gray-900">
                      {subscription?.subscription_plans.name_fr}
                    </span>
                    <Badge variant={subscription?.subscription_plans.is_free ? "secondary" : "default"}>
                      {subscription?.subscription_plans.is_free ? 'Gratuit' : `${subscription?.subscription_plans.price}€`}
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={handleGenerateLatex}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm sm:text-base"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Générer un Document PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            {/* Upgrade Plans */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  <span>Plans Disponibles</span>
                </CardTitle>
                <CardDescription>
                  Accédez à plus de contenu avec nos plans premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowPlans(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
                >
                  Voir les Plans
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Documents générés</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan actuel</span>
                  <span className="font-semibold text-xs sm:text-sm truncate max-w-24 sm:max-w-none">{subscription?.subscription_plans.name_fr}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut</span>
                  <Badge variant="default" className="text-xs">Actif</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Level Selection Modal */}
      <LevelSelectionModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        onGenerate={handleLevelSelected}
        loading={isGenerating}
      />

      {/* Semester Selection Modal */}
      <SemesterSelectionModal
        isOpen={showSemesterModal}
        onClose={() => setShowSemesterModal(false)}
        onSemesterSelected={handleSemesterSelected}
        levelName={selectedLevel?.name_fr}
      />

      {/* Chapter Selection Modal */}
      <ChapterSelectionModal
        isOpen={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        onChapterSelected={handleChapterSelected}
        levelId={selectedLevel?.id}
        semester={selectedSemester}
        levelName={selectedLevel?.name_fr}
      />
    </div>
  );
};

export default Dashboard;
