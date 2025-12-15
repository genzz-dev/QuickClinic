import React from 'react';
import AnimatedSection from './AnimatedSection';
import Icons from './Icons';

const InsuranceSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-lab-black-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="card-quicklab text-center">
            <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
              <Icons.Shield />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Insurance Made <span className="text-purple-600 dark:text-purple-400">Simple</span>
            </h2>
            <p className="text-lg text-lab-black-700 dark:text-lab-black-300 leading-relaxed">
              We're partnering with leading insurance companies to bring you seamless health
              insurance solutions. Soon, you'll be able to buy and claim insurance directly from our
              platform—eliminating paperwork and making the entire process effortless. Your health
              protection, simplified.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default InsuranceSection;
