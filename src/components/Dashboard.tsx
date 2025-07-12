
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Download, LogOut, CreditCard, Star, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PlanSelection from './PlanSelection';
import { generateLatexTemplate } from '@/utils/latexGenerator';
import ProfileSettings from './ProfileSettings';

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
  const [generatedLatex, setGeneratedLatex] = useState<string>("");
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

  const handleGenerateLatex = async () => {
    if (!profile || !subscription) return;

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userInfo = {
        name: profile.full_name,
        email: user?.email || '',
        institution: 'Math Planner',
        level: subscription.subscription_plans.name_fr,
        chapter: `Contenu du ${subscription.subscription_plans.name_fr.toLowerCase()} - Mathématiques avancées avec formules et exercices pratiques.`
      };
      
      const latex = generateLatexTemplate(userInfo);
      setGeneratedLatex(latex);
      
      toast({
        title: "Document Généré!",
        description: "Votre document LaTeX est prêt à être téléchargé.",
      });
    } catch (error) {
      console.error("Error generating LaTeX:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedLatex) return;
    
    // Simuler la génération PDF avec XeLaTeX
    const blob = new Blob([generatedLatex], { type: 'application/x-latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-planner-${profile?.full_name?.toLowerCase().replace(/\s+/g, '-') || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement Démarré",
      description: "Votre fichier PDF est en cours de téléchargement.",
    });
  };

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Math Planner</h1>
              <p className="text-gray-600">Tableau de bord personnel</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowProfile(true)} variant="outline" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Mon Profil</span>
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Bienvenue, {profile?.full_name || 'Utilisateur'}!
          </h2>
          <div className="flex items-center space-x-4">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                  <div className="flex justify-between items-center">
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {isGenerating ? (
                      'Génération en cours...'
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Générer un Document PDF
                      </>
                    )}
                  </Button>

                  {generatedLatex && (
                    <Button
                      onClick={handleDownloadPdf}
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le fichier .pdf
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Removed: Generated Content Preview section */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents générés</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan actuel</span>
                  <span className="font-semibold">{subscription?.subscription_plans.name_fr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <Badge variant="default" className="text-xs">Actif</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
