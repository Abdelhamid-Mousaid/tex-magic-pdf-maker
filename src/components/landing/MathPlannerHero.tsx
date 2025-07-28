import React from 'react';
import { Calculator, BookOpen, GraduationCap } from 'lucide-react';

const MathPlannerHero = () => {
  return (
    <div className="text-center mb-8 sm:mb-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 sm:py-12 rounded-3xl">
      <div className="flex flex-col sm:flex-row items-center justify-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:mr-4">
          <Calculator className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-secondary" />
          <GraduationCap className="h-10 w-10 sm:h-14 sm:w-14 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Math Planner Maroc
          </h1>
          <div className="text-lg sm:text-xl text-muted-foreground mt-2">
            🇲🇦 Pour les professeurs de mathématiques
          </div>
        </div>
      </div>
      
      <p className="text-base sm:text-lg lg:text-xl text-foreground max-w-4xl mx-auto px-4 leading-relaxed">
        Générateur automatique de documents LaTeX professionnels adaptés au système éducatif marocain.
        <br className="hidden sm:block" />
        <span className="text-primary font-medium">Spécialement conçu pour les professeurs de mathématiques du collège et lycée au Maroc.</span>
      </p>
      
      {/* Moroccan pattern decoration */}
      <div className="mt-8 flex justify-center space-x-4 text-accent/30">
        <div className="text-2xl">✦</div>
        <div className="text-lg">◆</div>
        <div className="text-2xl">✦</div>
        <div className="text-lg">◆</div>
        <div className="text-2xl">✦</div>
      </div>
    </div>
  );
};

export default MathPlannerHero;