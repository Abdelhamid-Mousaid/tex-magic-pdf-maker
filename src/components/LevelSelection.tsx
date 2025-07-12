
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, Users, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Level {
  id: string;
  name: string;
  name_fr: string;
  order_index: number;
}

interface SubscriptionPlan {
  id: string;
  name_fr: string;
  price: number;
}

interface LevelSelectionProps {
  selectedPlan: SubscriptionPlan;
  onBack: () => void;
  onComplete: () => void;
}

const GUMROAD_PRODUCT_IDS: { [key: string]: string } = {
  'Premier Semestre': 'premier-semestre',
  'Deuxième Semestre': 'deuxieme-semestre',
  'Année Complète': 'annee-complete'
};

const LevelSelection: React.FC<LevelSelectionProps> = ({ selectedPlan, onBack, onComplete }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les niveaux.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelect = (level: Level) => {
    // Construct Gumroad URL
    const productId = GUMROAD_PRODUCT_IDS[selectedPlan.name_fr] || 'default-product';
    const gumroadUrl = `https://gumroad.com/l/${productId}?level=${level.name_fr}&plan=${selectedPlan.name_fr}`;
    
    // Open Gumroad in new window
    window.open(gumroadUrl, '_blank', 'width=800,height=600');
    
    toast({
      title: "Redirection vers le Paiement",
      description: `Vous allez être redirigé vers Gumroad pour finaliser l'achat du ${selectedPlan.name_fr} niveau ${level.name_fr}.`,
    });
    
    // Simulate successful payment after a delay
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const getLevelIcon = (orderIndex: number) => {
    switch (orderIndex) {
      case 1:
        return <Users className="h-8 w-8 text-green-600" />;
      case 2:
        return <GraduationCap className="h-8 w-8 text-blue-600" />;
      case 3:
        return <Award className="h-8 w-8 text-purple-600" />;
      default:
        return <Users className="h-8 w-8 text-gray-600" />;
    }
  };

  const getLevelColor = (orderIndex: number) => {
    switch (orderIndex) {
      case 1:
        return 'bg-green-100 border-green-200 hover:bg-green-50';
      case 2:
        return 'bg-blue-100 border-blue-200 hover:bg-blue-50';
      case 3:
        return 'bg-purple-100 border-purple-200 hover:bg-purple-50';
      default:
        return 'bg-gray-100 border-gray-200 hover:bg-gray-50';
    }
  };

  const getButtonColor = (orderIndex: number) => {
    switch (orderIndex) {
      case 1:
        return 'bg-green-600 hover:bg-green-700';
      case 2:
        return 'bg-blue-600 hover:bg-blue-700';
      case 3:
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Choisir votre Niveau</h1>
            <p className="text-gray-600">
              Sélectionnez le niveau pour votre plan: <span className="font-semibold">{selectedPlan.name_fr}</span>
            </p>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-900">Plan Sélectionné</CardTitle>
              <div className="flex justify-center items-center space-x-4 mt-4">
                <div className="text-2xl font-bold text-blue-600">{selectedPlan.name_fr}</div>
                <div className="text-2xl font-bold text-gray-900">{selectedPlan.price}€</div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des niveaux...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* College Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Niveau Collège</h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {levels.filter(level => level.name.includes('APIC')).map((level) => (
                  <Card
                    key={level.id}
                    className="shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-green-100 border-green-200 hover:bg-green-50"
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 rounded-full bg-white shadow-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg text-gray-900">{level.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">
                        {level.name_fr}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => handleLevelSelect(level)}
                        className="w-full py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Choisir ce niveau
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tronc Commun Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Tronc Commun</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {levels.filter(level => level.name.includes('TC')).map((level) => (
                  <Card
                    key={level.id}
                    className="shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-blue-100 border-blue-200 hover:bg-blue-50"
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 rounded-full bg-white shadow-lg">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg text-gray-900">{level.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">
                        {level.name_fr}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => handleLevelSelect(level)}
                        className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Choisir ce niveau
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Baccalauréat Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Baccalauréat</h2>
              <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
                {levels.filter(level => level.name.includes('BAC')).map((level) => (
                  <Card
                    key={level.id}
                    className="shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-purple-100 border-purple-200 hover:bg-purple-50"
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 rounded-full bg-white shadow-lg">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-base text-gray-900">{level.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-600 mt-1">
                        {level.name_fr.length > 30 ? level.name_fr.substring(0, 30) + '...' : level.name_fr}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => handleLevelSelect(level)}
                        className="w-full py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Choisir
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="shadow-lg border-0 bg-blue-50/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Paiement Sécurisé via Gumroad
              </h3>
              <p className="text-blue-700 text-sm">
                Après avoir sélectionné votre niveau, vous serez redirigé vers Gumroad pour finaliser votre achat en toute sécurité. 
                Une fois le paiement confirmé, vous aurez immédiatement accès à votre contenu.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LevelSelection;
