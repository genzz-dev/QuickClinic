import React, { useState, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';

export default function Loading() {
  const [currentQuote, setCurrentQuote] = useState(0);
  
  const healthQuotes = [
    "Health is a state of complete harmony of the body, mind and spirit.",
    "The best doctor gives the least medicines.",
    "Prevention is better than cure.",
    "Your health is an investment, not an expense.",
    "Take care of your body. It's the only place you have to live."
  ];

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % healthQuotes.length);
    }, 3000);

    return () => {
      clearInterval(quoteTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-gray-600" />
          </div>
          
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Quick Clinic
          </h1>
          <p className="text-gray-500 text-sm">Healthcare Management System</p>
        </div>

        {/* Quote */}
        <div className="mb-12">
          <p className="text-gray-700 text-base font-light italic leading-relaxed transition-opacity duration-500">
            "{healthQuotes[currentQuote]}"
          </p>
        </div>

        {/* Simple Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
}