import React from 'react';
import { Star } from 'lucide-react';

const TestimonialSection = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm sm:text-base text-gray-700 italic mb-3">
        "Enfin un outil adapté au système marocain ! Math Planner m'aide énormément pour créer des documents professionnels pour mes classes de 2BAC."
      </p>
      <p className="text-xs sm:text-sm text-gray-600">- Ahmed B., Professeur de Mathématiques, Casablanca</p>
    </div>
  );
};

export default TestimonialSection;