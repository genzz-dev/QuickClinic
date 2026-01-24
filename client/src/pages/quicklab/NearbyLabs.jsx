import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Phone, Mail, Home, ArrowLeft, Loader } from 'lucide-react';
import { searchLabs } from '../../service/labService';
import { detectUserCity } from '../../service/geolocationService';
import '../../quicklab.css';

export default function NearbyLabs() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectedCity, setDetectedCity] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    initializeSearch();
  }, []);

  const initializeSearch = async () => {
    try {
      setLoading(true);
      let city = await detectUserCity();
      if (city) {
        setDetectedCity(city);
        await fetchNearbyLabs(city);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to detect city:', err);
      setLoading(false);
    }
  };

  const fetchNearbyLabs = async (city) => {
    try {
      setLoading(true);
      const response = await searchLabs({
        city: city,
        limit: 50,
      });
      setLabs(response.data || []);
    } catch (err) {
      console.error('Search failed:', err);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLabClick = (labId) => {
    navigate(`/quick-lab/lab/${labId}`);
  };

  const handleChangeLocation = () => {
    setNewCity(detectedCity);
    setShowCityModal(true);
  };

  const handleSaveCity = async () => {
    if (newCity.trim()) {
      setDetectedCity(newCity.trim());
      await fetchNearbyLabs(newCity.trim());
      setShowCityModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white pt-20 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-lab-black-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-lab-black-900" />
            </button>
            <h1 className="text-3xl font-bold text-lab-black-900">Nearby Labs</h1>
          </div>

          {/* Location Display */}
          {detectedCity && (
            <div className="flex items-center gap-2 text-lab-black-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                Showing labs in <strong>{detectedCity}</strong>
              </span>
              <button
                onClick={handleChangeLocation}
                className="text-sm text-lab-yellow-600 hover:underline ml-2"
              >
                Change location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* City Change Modal */}
      {showCityModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCityModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-lab-black-900 mb-4">Change Location</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-lab-black-700 mb-2">
                Enter City Name
              </label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveCity()}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                className="w-full px-4 py-2 border border-lab-black-300 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCityModal(false)}
                className="flex-1 px-4 py-2 border border-lab-black-300 rounded-lg text-lab-black-700 hover:bg-lab-black-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCity}
                className="flex-1 px-4 py-2 btn-quicklab-primary"
                disabled={!newCity.trim()}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <Loader className="w-12 h-12 animate-spin text-lab-yellow-600 mx-auto mb-4" />
            <p className="text-lab-black-600 text-lg">Finding nearby labs...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-lab-black-300 mb-4" />
            <p className="text-xl text-lab-black-600 font-semibold">No labs found in {detectedCity}</p>
            <p className="text-lab-black-500 mt-2">Try searching in a different location</p>
            <button
              onClick={handleChangeLocation}
              className="mt-4 btn-quicklab-primary px-6 py-2"
            >
              Change Location
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lab-black-700 text-lg">
                Found <strong>{labs.length}</strong> labs nearby
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <div
                  key={lab._id}
                  onClick={() => handleLabClick(lab._id)}
                  className="card-quicklab bg-white border border-lab-black-100 hover:shadow-xl transition-all cursor-pointer overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Lab Logo */}
                  {lab.logo ? (
                    <img
                      src={lab.logo}
                      alt={lab.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-lab-yellow-100 to-lab-yellow-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-lab-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
                          {lab.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Lab Name */}
                    <h3 className="text-lg font-bold text-lab-black-900 mb-3 line-clamp-2">
                      {lab.name}
                    </h3>

                    {/* Rating */}
                    {lab.ratings?.average > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-lab-yellow-500 text-lab-yellow-500" />
                          <span className="text-sm font-semibold text-lab-black-900">
                            {lab.ratings.average.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-lab-black-600">
                          ({lab.ratings.count} {lab.ratings.count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}

                    {/* Address */}
                    {lab.address && (
                      <div className="flex items-start gap-2 mb-3 text-sm text-lab-black-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-lab-yellow-600" />
                        <div>
                          <p className="font-medium text-lab-black-900">
                            {lab.address.street && `${lab.address.street}, `}
                            {lab.address.city}
                          </p>
                          <p className="text-xs text-lab-black-500 mt-0.5">
                            {lab.address.state} {lab.address.zipCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="space-y-2 mb-3">
                      {lab.contact?.phone && (
                        <div className="flex items-center gap-2 text-sm text-lab-black-600">
                          <Phone className="w-4 h-4 text-lab-yellow-600" />
                          <span>{lab.contact.phone}</span>
                        </div>
                      )}
                      {lab.contact?.email && (
                        <div className="flex items-center gap-2 text-sm text-lab-black-600">
                          <Mail className="w-4 h-4 text-lab-yellow-600" />
                          <span>{lab.contact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Tests Count */}
                    {lab.tests && lab.tests.length > 0 && (
                      <div className="py-3 border-t border-lab-black-100 mb-3">
                        <p className="text-sm text-lab-black-700">
                          <strong>{lab.tests.length}</strong> tests available
                        </p>
                      </div>
                    )}

                    {/* Home Collection Badge */}
                    {lab.generalHomeCollectionFee !== undefined && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-lab-yellow-100 rounded-lg border border-lab-yellow-200">
                        <Home className="w-4 h-4 text-lab-yellow-700" />
                        <span className="text-sm font-medium text-lab-yellow-700">
                          Home Collection Available
                        </span>
                      </div>
                    )}

                    {/* Click to View Button */}
                    <button className="w-full mt-4 btn-quicklab-primary py-2 text-sm font-semibold rounded-lg transition-all">
                      View Details & Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
