import React from 'react';
import { FileText, Users, Star } from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    title: 'Système Éducatif Marocain',
    description: 'Documents adaptés aux programmes du collège et lycée marocain'
  },
  {
    icon: Users,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    title: 'De la 1APIC au 2BAC',
    description: 'Tous les niveaux du système marocain : collège et lycée'
  },
  {
    icon: Star,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    title: 'Plans Flexibles',
    description: 'Premier semestre, deuxième semestre ou année complète'
  }
];

const FeaturesSection = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div key={index} className="flex items-start space-x-3 sm:space-x-4">
            <div className={`${feature.bgColor} p-2.5 sm:p-3 rounded-full flex-shrink-0`}>
              <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesSection;