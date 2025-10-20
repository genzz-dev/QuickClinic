const TeleconsultationBanner = ({ available }) =>
  available && (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-800 mb-2">Teleconsultation Available</h3>
      <p className="text-sm text-green-700">
        This doctor offers online consultations for your convenience.
      </p>
    </div>
  );

export default TeleconsultationBanner;
