// client/src/components/quickmed/HomePage/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-med-green-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-med-blue-400/20 rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;
