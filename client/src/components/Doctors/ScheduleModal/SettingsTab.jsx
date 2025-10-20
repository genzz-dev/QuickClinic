const SettingsTab = ({ appointmentDuration, setSchedule }) => {
  return (
    <div className="max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Appointment duration (minutes)
      </label>
      <input
        type="number"
        min={5}
        step={5}
        value={appointmentDuration}
        onChange={(e) =>
          setSchedule((prev) => ({
            ...prev,
            appointmentDuration: +e.target.value,
          }))
        }
        className="border border-gray-300 rounded px-3 py-2 w-40 text-gray-900"
      />
    </div>
  );
};

export default SettingsTab;
