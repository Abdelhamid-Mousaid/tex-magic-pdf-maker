import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "secondary" | "outline";
}

interface PricingPlansProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ selectedPlan, onPlanSelect }) => {
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0 DH',
      description: 'Essayez notre service',
      features: [
        'CH_1 pour tous les niveaux',
        '1er semestre uniquement',
        'Format PDF haute qualité',
        'Support par email'
      ],
      icon: <Star className="h-6 w-6" />,
      buttonText: 'Commencer gratuitement',
      buttonVariant: 'outline'
    },
    {
      id: '1er_semestre',
      name: '1er Semestre',
      price: '150 DH',
      description: 'Accès complet au 1er semestre',
      features: [
        'Tous les chapitres du 1er semestre',
        'Tous les niveaux disponibles',
        'Génération ZIP pour tous les chapitres',
        'Support prioritaire',
        'Mises à jour incluses'
      ],
      icon: <Zap className="h-6 w-6" />,
      popular: true,
      buttonText: 'Choisir ce plan',
      buttonVariant: 'default'
    },
    {
      id: '2eme_semestre',
      name: '2ème Semestre',
      price: '150 DH',
      description: 'Accès complet au 2ème semestre',
      features: [
        'Tous les chapitres du 2ème semestre',
        'Tous les niveaux disponibles',
        'Génération ZIP pour tous les chapitres',
        'Support prioritaire',
        'Mises à jour incluses'
      ],
      icon: <Zap className="h-6 w-6" />,
      buttonText: 'Choisir ce plan',
      buttonVariant: 'default'
    },
    {
      id: 'annee_complete',
      name: 'Année Complète',
      price: '200 DH',
      description: 'Le meilleur rapport qualité-prix',
      features: [
        'Accès aux 2 semestres complets',
        'Tous les niveaux et chapitres',
        'Génération ZIP illimitée',
        'Support prioritaire VIP',
        'Mises à jour en avant-première',
        'Économisez 100 DH!'
      ],
      icon: <Crown className="h-6 w-6" />,
      buttonText: 'Meilleure offre',
      buttonVariant: 'default'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-4">Choisissez votre plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Des tarifs adaptés aux besoins des professeurs de mathématiques au Maroc
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-primary/5 to-accent/5' 
                : 'hover:shadow-lg border-border/20'
            } ${plan.popular ? 'border-primary/50' : ''}`}
            onClick={() => onPlanSelect(plan.id)}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1">
                Plus populaire
              </Badge>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto p-3 rounded-full w-fit mb-2 ${
                selectedPlan === plan.id 
                  ? 'bg-primary text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {plan.icon}
              </div>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-primary">{plan.price}</div>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={selectedPlan === plan.id ? "default" : plan.buttonVariant}
                className={`w-full transition-all ${
                  selectedPlan === plan.id 
                    ? 'bg-primary hover:bg-primary/90' 
                    : plan.id === 'annee_complete' 
                      ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white' 
                      : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlanSelect(plan.id);
                }}
              >
                {selectedPlan === plan.id ? '✓ Plan sélectionné' : plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note about pricing */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg max-w-2xl mx-auto">
          💡 <strong>Astuce:</strong> L'année complète vous fait économiser 100 DH par rapport à l'achat séparé des deux semestres.
          Tous les prix incluent la TVA et le support technique.
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;