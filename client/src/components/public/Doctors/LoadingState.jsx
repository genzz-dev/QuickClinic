import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        <p className="text-gray-600 font-medium">Finding doctors near you...</p>
        <p className="text-gray-500 text-sm mt-2">This might take a moment</p>
      </div>
    </div>
  );
};

export default LoadingState;
