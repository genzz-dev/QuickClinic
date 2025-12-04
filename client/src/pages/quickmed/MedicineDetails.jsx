import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicineDetails } from '../../service/medicineApiService';
import Loading from '../../components/ui/Loading';
import MedicineHeader from '../../components/quickmed/MedicineDetailsPage/MedicineHeader';
import MedicineContent from '../../components/quickmed/MedicineDetailsPage/MedicineContent';
import MedicineError from '../../components/quickmed/MedicineDetailsPage/MedicineError';

const MedicineDetails = () => {
  const { medicineName } = useParams();
  const navigate = useNavigate();
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        const response = await getMedicineDetails(medicineName);
        if (response.success) {
          setMedicineData(response.data);
        }
      } catch (err) {
        setError('Failed to fetch medicine details');
      } finally {
        setLoading(false);
      }
    };

    if (medicineName) {
      fetchMedicineDetails();
    }
  }, [medicineName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  if (error || !medicineData) {
    return <MedicineError error={error} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MedicineHeader medicineData={medicineData} navigate={navigate} />
      <MedicineContent medicineData={medicineData} />
    </div>
  );
};

export default MedicineDetails;
