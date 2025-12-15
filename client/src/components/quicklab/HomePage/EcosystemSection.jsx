import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';

const EcosystemSection = () => {
  const products = [
    {
      name: 'QuickClinic',
      color: 'blue',
      colorClass: 'from-blue-500 to-blue-600',
      darkColorClass: 'from-blue-600 to-blue-700',
      description: 'Online doctor booking and video consultations',
      available: true,
    },
    {
      name: 'QuickMed',
      color: 'green',
      colorClass: 'from-green-500 to-green-600',
      darkColorClass: 'from-green-600 to-green-700',
      description: 'Free access to complete medicine information',
      available: true,
    },
    {
      name: 'QuickLab',
      color: 'yellow',
      colorClass: 'from-yellow-500 to-yellow-600',
      darkColorClass: 'from-yellow-500 to-yellow-600',
      description: 'Book and compare labs across your city',
      available: true,
      current: true,
    },
    {
      name: 'QuickInsure',
      color: 'purple',
      colorClass: 'from-purple-500 to-purple-600',
      darkColorClass: 'from-purple-600 to-purple-700',
      description: 'Buy and claim health insurance seamlessly',
      available: false,
    },
  ];

  return (
    <section id="ecosystem" className="py-20 bg-lab-black-50 dark:bg-lab-black-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Building a Complete{' '}
              <span className="text-lab-yellow-600 dark:text-lab-yellow-400">
                Healthcare Ecosystem
              </span>
            </h2>
            <p className="text-lg text-lab-black-700 dark:text-lab-black-300 max-w-3xl mx-auto leading-relaxed">
              From appointment booking, we are moving toward building a complete digital healthcare
              ecosystem for your convenience—so you only need one platform for all health-related
              queries and services. Your health, simplified.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <AnimatedSection key={index}>
              <motion.div
                whileHover={{ y: -8 }}
                className="card-quicklab relative overflow-hidden group"
              >
                {product.current && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-quicklab text-xs">You are here</span>
                  </div>
                )}
                {!product.available && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-lab-black-200 dark:bg-lab-black-700 text-lab-black-700 dark:text-lab-black-300 px-3 py-1 rounded-full text-xs font-semibold">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div
                  className={`w-full h-2 bg-gradient-to-r ${product.colorClass} dark:${product.darkColorClass} rounded-t-lg mb-4 -mx-6 -mt-6`}
                ></div>

                <h3 className="text-2xl font-bold mb-2">
                  <span className="text-lab-black-900 dark:text-lab-black-50">Quick</span>
                  <span className={`text-${product.color}-600 dark:text-${product.color}-400`}>
                    {product.name.replace('Quick', '')}
                  </span>
                </h3>

                <p className="text-lab-black-600 dark:text-lab-black-400">{product.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
