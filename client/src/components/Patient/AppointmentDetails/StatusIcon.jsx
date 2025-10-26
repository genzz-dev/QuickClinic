import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export default StatusIcon;
