import { Pill, Download } from 'lucide-react';
import { useState } from 'react';
import { generatePrescriptionPDF } from './utils/pdfGenerator';
import Diagnosis from './prescription/Diagnosis';
import Medications from './prescription/Medications';
import Tests from './prescription/Tests';
import Notes from './prescription/Notes';
import FollowUp from './prescription/FollowUp';
import PrescriptionDate from './prescription/PrescriptionDate';

const PrescriptionSection = ({ prescription, appointment }) => {
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloadLoading(true);
    try {
      await generatePrescriptionPDF(prescription, appointment, setDownloadLoading);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 p-2 sm:p-3 min-h-screen flex flex-col">
      {/* Professional Prescription Header */}
      <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r rounded-t-lg">
        <div className="flex items-center gap-2">
          <Pill className="text-black" size={20} />
          <h2 className="text-black text-base sm:text-lg font-semibold m-0">
            Medical Prescription
          </h2>
        </div>
        <button 
          onClick={handleDownloadPDF}
          disabled={downloadLoading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white text-indigo-600 border-0 rounded-md text-xs sm:text-sm font-medium cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          <span className="hidden sm:inline">{downloadLoading ? 'Generating...' : 'Download'}</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>

      {/* Prescription Content */}
      <div className="bg-white rounded-b-lg shadow-md overflow-hidden flex-1">
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <PrescriptionDate date={prescription.date} />
          <Diagnosis diagnosis={prescription.diagnosis} />
          <Medications medications={prescription.medications} />
          <Tests tests={prescription.tests} />
          <Notes notes={prescription.notes} />
          <FollowUp followUpDate={prescription.followUpDate} />

          {/* Doctor Signature */}
          <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-200 text-right">
            <p className='text-sm text-gray-500 m-0'>Dr. {appointment.doctorId.firstName}{" "}{appointment.doctorId.lastName}</p>
            <div className="w-32 sm:w-40 h-px bg-gray-700 ml-auto mb-1"></div>
            <p className="text-xs text-gray-500 m-0">Doctor's Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionSection;
