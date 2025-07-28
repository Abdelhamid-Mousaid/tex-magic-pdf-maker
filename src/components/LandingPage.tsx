
import React, { useState } from 'react';
import MathPlannerHero from './landing/MathPlannerHero';
import UserInfoForm from './landing/UserInfoForm';
import PricingPlans from './landing/PricingPlans';
import ContentSelector from './landing/ContentSelector';
import PlanLogicHandler from './landing/PlanLogicHandler';

interface UserInfo {
  email: string;
  fullName: string;
  schoolName: string;
  academicYear: string;
  date: string;
}

interface ContentSelection {
  levelId: string;
  levelName: string;
  semester: string;
  chapter: string;
  allChapters: boolean;
}

type Step = 'userInfo' | 'pricing' | 'content' | 'generation';

const LandingPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>('userInfo');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [contentSelection, setContentSelection] = useState<ContentSelection | null>(null);

  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentStep('pricing');
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setCurrentStep('content');
  };

  const handleContentSelection = (selection: ContentSelection) => {
    setContentSelection(selection);
    // Auto-advance to generation when all required fields are filled
    if (selection.levelId && selection.semester && (selection.chapter || selection.allChapters)) {
      setCurrentStep('generation');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'userInfo':
        return (
          <UserInfoForm 
            onSubmit={handleUserInfoSubmit}
          />
        );
      
      case 'pricing':
        return (
          <PricingPlans 
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
          />
        );
      
      case 'content':
        return (
          <ContentSelector 
            onSelectionChange={handleContentSelection}
            selectedPlan={selectedPlan}
          />
        );
      
      case 'generation':
        return userInfo && contentSelection ? (
          <PlanLogicHandler 
            userInfo={userInfo}
            contentSelection={contentSelection}
            selectedPlan={selectedPlan}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <MathPlannerHero />

        {/* Progress indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'userInfo', label: 'Informations', number: 1 },
              { key: 'pricing', label: 'Plans', number: 2 },
              { key: 'content', label: 'Contenu', number: 3 },
              { key: 'generation', label: 'Génération', number: 4 }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep === step.key 
                    ? 'bg-primary text-white shadow-lg' 
                    : index < ['userInfo', 'pricing', 'content', 'generation'].indexOf(currentStep)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  currentStep === step.key ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className={`h-0.5 w-12 sm:w-20 mx-2 sm:mx-4 transition-all ${
                    index < ['userInfo', 'pricing', 'content', 'generation'].indexOf(currentStep)
                      ? 'bg-primary/30'
                      : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current step content */}
        <div className="max-w-6xl mx-auto">
          {renderStep()}
        </div>

        {/* Back button */}
        {currentStep !== 'userInfo' && (
          <div className="max-w-2xl mx-auto mt-6">
            <button
              onClick={() => {
                const steps: Step[] = ['userInfo', 'pricing', 'content', 'generation'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1]);
                }
              }}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              ← Retour à l'étape précédente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
