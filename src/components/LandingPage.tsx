
import React from 'react';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import TestimonialSection from './landing/TestimonialSection';
import AuthForm from './landing/AuthForm';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <HeroSection />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
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
