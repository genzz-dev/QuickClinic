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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Pill className="h-5 w-5 mr-2 text-blue-600" />
          Prescription Details
        </h2>
        <button
          onClick={handleDownloadPDF}
          disabled={downloadLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloadLoading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      <Diagnosis diagnosis={prescription.diagnosis} />
      <Medications medications={prescription.medications} />
      <Tests tests={prescription.tests} />
      <Notes notes={prescription.notes} />
      <FollowUp followUpDate={prescription.followUpDate} />
      <PrescriptionDate date={prescription.date} />
    </div>
  );
};

export default PrescriptionSection;