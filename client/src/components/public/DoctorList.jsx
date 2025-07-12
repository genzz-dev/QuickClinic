import { useState, useEffect } from 'react';
import { getClinicDoctors } from '../../service/publicapi';

const DoctorList = ({ clinicId }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await getClinicDoctors(clinicId);
        setDoctors(data.data.doctors);
      } catch (err) {
        setError('Failed to load doctors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [clinicId]);
  console.log(doctors);
  if (loading) return <div className="mt-4 text-center text-gray-500">Loading doctors...</div>;
  if (error) return <div className="mt-4 text-center text-red-500">{error}</div>;
  if (doctors.length === 0) return <div className="mt-4 text-center text-gray-500">No doctors available</div>;
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium text-gray-500 mb-2">Doctors at this clinic:</h4>
      <ul className="space-y-2">
        {doctors.map(doctor => (
          <li key={doctor._id} className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600">{doctor.firstName}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorList;