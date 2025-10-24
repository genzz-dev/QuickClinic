import { ArrowLeft } from 'lucide-react';

const Header = ({ navigate }) => {
  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Appointments
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
      <p className="text-gray-600 mt-1">
        View appointment information and prescription details
      </p>
    </div>
  );
};

export default Header;