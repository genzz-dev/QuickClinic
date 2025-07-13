import React from 'react';
import { Award } from 'lucide-react';

const QualificationsSection = ({ doctor }) => (
  doctor.qualifications && doctor.qualifications.length > 0 && (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-green-600" />
        Qualifications
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {doctor.qualifications.map((qualification, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-800 font-medium">{qualification}</span>
          </div>
        ))}
      </div>
    </div>
  )
);

export default QualificationsSection;