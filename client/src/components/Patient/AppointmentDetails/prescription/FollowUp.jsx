import { formatDate } from '../utils/formatters';

const FollowUp = ({ followUpDate }) => {
  if (!followUpDate) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-2">Follow-up Date</h3>
      <p className="text-gray-600">{formatDate(followUpDate)}</p>
    </div>
  );
};

export default FollowUp;