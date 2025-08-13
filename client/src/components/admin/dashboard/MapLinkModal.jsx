
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { updateClinic } from '../../service/adminApiService';

const MapLinkModal = ({ isOpen, onClose, onSuccess }) => {
  const [mapLink, setMapLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mapLink.trim()) {
      toast.error('Please enter a valid Google Maps link');
      return;
    }
    try {
      setLoading(true);
      await updateClinic({ googleMapsLink: mapLink });
      toast.success('Google Maps link updated');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Google Maps Link</h2>
        <input
          type="text"
          className="border rounded p-2 w-full mb-4"
          placeholder="Enter Google Maps link"
          value={mapLink}
          onChange={(e) => setMapLink(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLinkModal;
