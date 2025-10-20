import { Building2, Check, Shield } from 'lucide-react';

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    {
      id: 1,
      title: 'Add Clinic',
      description: 'Basic details and setup',
      icon: Building2,
    },
    {
      id: 2,
      title: 'Verify Clinic',
      description: 'Phone verification or manual review',
      icon: Shield,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                    ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <p
                    className={`font-medium text-sm ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                    {currentStep === 1 && step.id === 1 && (
                      <span className="text-green-600 ml-1">✓</span>
                    )}
                  </p>
                  <p
                    className={`text-xs ${
                      currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
