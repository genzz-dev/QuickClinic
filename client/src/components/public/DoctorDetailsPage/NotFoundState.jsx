import { User } from 'lucide-react';

const NotFoundState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Doctor not found</h2>
      <p className="text-gray-600">The doctor you're looking for doesn't exist.</p>
    </div>
  </div>
);

export default NotFoundState;
