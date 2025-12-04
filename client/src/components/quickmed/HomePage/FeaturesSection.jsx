// client/src/components/quickmed/HomePage/FeaturesSection.jsx
import React from 'react';
import Icons from './Icons';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Icons.Lightning />,
      title: 'Instant Search',
      description: 'Get real-time medicine suggestions as you type with our powerful autocomplete.',
    },
    {
      icon: <Icons.Shield />,
      title: 'FDA Verified Data',
      description: 'Access reliable drug information directly from the OpenFDA database.',
    },
    {
      icon: <Icons.Database />,
      title: 'Comprehensive Details',
      description: 'View usage, side effects, ingredients, warnings, and storage information.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-med-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose QuickMed?</h3>
          <p className="text-med-text-muted max-w-2xl mx-auto">
            Get accurate, comprehensive, and up-to-date medicine information at your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 lg:p-8 bg-med-background rounded-2xl border border-med-border hover:border-med-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-br from-med-green-100 to-med-blue-100 dark:from-med-green-900/30 dark:to-med-blue-600/30 text-med-green-600 dark:text-med-green-400 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
              <p className="text-med-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
