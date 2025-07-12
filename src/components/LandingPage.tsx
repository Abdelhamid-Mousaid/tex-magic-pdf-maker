
import React from 'react';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import TestimonialSection from './landing/TestimonialSection';
import AuthForm from './landing/AuthForm';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <HeroSection />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
          {/* Features and Testimonial Section */}
          <div className="space-y-8">
            <FeaturesSection />
            <TestimonialSection />
          </div>

          {/* Auth Form */}
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
