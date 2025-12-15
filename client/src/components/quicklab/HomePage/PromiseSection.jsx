import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';

const PromiseSection = () => {
  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-br from-lab-yellow-50 via-lab-blue-50 to-white dark:from-lab-black-800 dark:via-lab-black-900 dark:to-lab-black-900"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Our <span className="text-lab-yellow-600 dark:text-lab-yellow-400">Promise</span>
            </h2>
          </div>

          <div className="card-quicklab">
            <p className="text-xl leading-relaxed text-lab-black-700 dark:text-lab-black-300 mb-6">
              Our prime motto at{' '}
              <span className="font-semibold text-lab-black-900 dark:text-lab-black-50">Quick</span>{' '}
              is simple—
              <span className="font-semibold text-lab-yellow-600 dark:text-lab-yellow-400">
                {' '}
                no paperwork, no unnecessary stress
              </span>
              . We are working tirelessly to make your healthcare experience seamless.
            </p>
            <p className="text-2xl font-semibold text-lab-black-900 dark:text-lab-black-50">
              The only thing you should worry about is your health or your loved ones' health.
              <span className="text-lab-yellow-600 dark:text-lab-yellow-400">
                {' '}
                The rest is on us.
              </span>
            </p>
          </div>

          <div className="mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-quicklab-primary text-lg px-10 py-4"
            >
              Get Started Today
            </motion.button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PromiseSection;
