import React from 'react';
import { BookOpen } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="text-center mb-8 sm:mb-10 lg:mb-12">
      <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 sm:mr-4" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Math Planner</h1>
      </div>
      <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
        Générez automatiquement vos documents LaTeX professionnels adaptés au système éducatif marocain. 
        Spécialement conçu pour les professeurs de mathématiques du collège et lycée au Maroc.
      </p>
    </div>
  );
};

export default HeroSection;