import React from 'react';
import { BookOpen } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <BookOpen className="h-16 w-16 text-blue-600 mr-4" />
        <h1 className="text-5xl font-bold text-gray-900">Math Planner</h1>
      </div>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Générez automatiquement vos documents LaTeX professionnels adaptés au système éducatif marocain. 
        Spécialement conçu pour les professeurs de mathématiques du collège et lycée au Maroc.
      </p>
    </div>
  );
};

export default HeroSection;