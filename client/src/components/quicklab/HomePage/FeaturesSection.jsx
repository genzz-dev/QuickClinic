import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import Icons from './Icons';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Icons.Calendar />,
      title: 'Online Lab Test Booking',
      description:
        'Book lab appointments online with ease. Choose home sample collection or visit the lab at your convenience.',
    },
    {
      icon: <Icons.Doctor />,
      title: 'Doctor-Linked Reports',
      description:
        'Reports from labs suggested by your QuickClinic doctor are sent directly to them with personalized remarks—no extra fees for normal results.',
      badge: 'Key Feature',
    },
    {
      icon: <Icons.Home />,
      title: 'Home Sample Collection',
      description:
        'Get samples collected from the comfort of your home. Professional staff, timely service, safe handling.',
    },
    {
      icon: <Icons.Star />,
      title: 'Honest Lab Reviews',
      description:
        'Compare labs based on genuine user reviews, ratings, and test availability to make informed decisions.',
    },
    {
      icon: <Icons.Flask />,
      title: 'Search by Test Name',
      description:
        'Find labs offering specific tests across your city. Filter by distance, ratings, and availability.',
    },
    {
      icon: <Icons.Shield />,
      title: 'No Hidden Costs',
      description:
        'Transparent pricing, no consultation fee when results are normal—saving you time and money.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-lab-black-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose{' '}
              <span className="text-lab-yellow-600 dark:text-lab-yellow-400">QuickLab</span>?
            </h2>
            <p className="text-lg text-lab-black-600 dark:text-lab-black-300 max-w-2xl mx-auto">
              Experience seamless lab test booking with features designed for your convenience
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index}>
              <motion.div
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(234, 179, 8, 0.1)' }}
                className="card-quicklab h-full relative"
              >
                {feature.badge && (
                  <div className="absolute -top-3 -right-3">
                    <span className="badge-quicklab text-xs">{feature.badge}</span>
                  </div>
                )}
                <div className="text-lab-yellow-600 dark:text-lab-yellow-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-lab-black-600 dark:text-lab-black-400">{feature.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
