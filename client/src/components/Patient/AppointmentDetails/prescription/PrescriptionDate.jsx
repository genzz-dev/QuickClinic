import { formatDate } from '../utils/formatters';

const PrescriptionDate = ({ date }) => {
  return (
    <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
      <p>Prescription Date: {formatDate(date)}</p>
    </div>
  );
};

export default PrescriptionDate;