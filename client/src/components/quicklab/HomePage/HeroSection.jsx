import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-lab-yellow-50 via-white to-lab-blue-50 dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4">
              <span className="badge-quicklab">Smart Healthcare Booking</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Book Lab Tests Online,
              <br />
              <span className="text-lab-yellow-600 dark:text-lab-yellow-400">
                Get Doctor Remarks Instantly
              </span>
            </h1>

            <p className="text-xl text-lab-black-600 dark:text-lab-black-300 mb-10 max-w-3xl mx-auto">
              Save time and money with doctor-linked lab reports. No consultation fees for normal
              results. Book tests, compare labs, and get home sample collection—all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-quicklab-primary text-lg px-8 py-4"
              >
                Book Lab Test Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-quicklab-secondary text-lg px-8 py-4"
              >
                Find Labs Near You
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-20 right-10 w-72 h-72 bg-lab-yellow-200 dark:bg-lab-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-lab-blue-200 dark:bg-lab-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    </section>
  );
};

export default HeroSection;
