
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name_fr: string;
  description_fr: string;
  price: number;
  duration_months: number;
  is_free: boolean;
}

interface PlanSelectionProps {
  onBack: () => void;
  onPlanSelected: () => void;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ onBack, onPlanSelected }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.is_free) {
      toast({
        title: "Plan Gratuit",
        description: "Vous avez déjà accès au plan gratuit!",
      });
      return;
    }
    
    toast({
      title: "Redirection",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Choisir un Plan</h1>
            <p className="text-gray-600">Sélectionnez le plan qui correspond à vos besoins</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des plans...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  plan.price > 40 ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.price > 40 && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>POPULAIRE</span>
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      plan.is_free ? 'bg-gray-100' : 
                      plan.price > 40 ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <BookOpen className={`h-8 w-8 ${
                        plan.is_free ? 'text-gray-600' : 
                        plan.price > 40 ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-gray-900">{plan.name_fr}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description_fr}
                  </CardDescription>
                  
                  <div className="mt-4">
                    {plan.is_free ? (
                      <div className="text-3xl font-bold text-gray-900">Gratuit</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-gray-900">
                          {plan.price}€
                        </div>
                        <div className="text-sm text-gray-600">
                          pour {plan.duration_months} mois
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        {plan.is_free ? 'Premier chapitre' : 'Accès complet'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Tous les niveaux disponibles
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Génération PDF illimitée
                      </span>
                    </div>
                    {!plan.is_free && (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">
                          Support prioritaire
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={plan.is_free}
                    className={`w-full py-3 text-lg font-medium ${
                      plan.is_free 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : plan.price > 40
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {plan.is_free ? 'Plan Actuel' : 'Choisir ce Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Features Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Comparaison des Fonctionnalités
          </h2>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Fonctionnalité</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Gratuit</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Semestre</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Année</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Accès au contenu</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">1er chapitre</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Semestre complet</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Année complète</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Niveaux disponibles</td>
                    <td className="px-6 py-4 text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Support prioritaire</td>
                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                    <td className="px-6 py-4 text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
