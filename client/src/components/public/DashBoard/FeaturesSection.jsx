// components/FeaturesSection.jsx
import { Shield, Clock, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Google Verified",
      description: "All our clinics are verified through Google Maps for authentic location and contact details",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: Clock,
      title: "Instant Booking",
      description: "Book appointments in real-time with immediate confirmation and calendar sync",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Only verified healthcare providers with proven track records and patient reviews",
      bgColor: "bg-violet-100",
      iconColor: "text-violet-600"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Why Choose Quick Clinic?</h2>
          <p className="text-xl text-gray-600">Your health, our priority - with verified quality</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4 p-6 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
