import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  Home,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getLabById, bookLabAppointment } from '../../service/labService';
import { getPatientPrescriptions } from '../../service/prescriptionApiSevice';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';
import '../../quicklab.css';

export default function LabDetails() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    collectionType: 'lab_visit',
    collectionAddress: '',
    notes: '',
  });
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchLabDetails();
    if (isAuthenticated && user?.role === 'patient') {
      fetchRecommendedTests();
    }
  }, [labId, isAuthenticated, user]);

  const fetchLabDetails = async () => {
    try {
      setLoading(true);
      const response = await getLabById(labId);
      setLab(response.data);
    } catch (err) {
      console.error('Failed to fetch lab details:', err);
      toast.error('Failed to load lab details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedTests = async () => {
    try {
      const response = await getPatientPrescriptions();
      if (response.prescriptions && response.prescriptions.length > 0) {
        // Get tests from most recent prescriptions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentPrescriptions = response.prescriptions.filter(
          (p) => new Date(p.date) >= thirtyDaysAgo
        );

        const testsFromPrescriptions = recentPrescriptions.flatMap((p) =>
          (p.tests || []).map((test) => ({
            name: test.name,
            instructions: test.instructions,
            prescriptionDate: p.date,
            doctorName: p.doctorId ? `${p.doctorId.firstName} ${p.doctorId.lastName}` : 'Unknown',
          }))
        );

        setRecommendedTests(testsFromPrescriptions);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    }
  };

  const handleTestSelection = (test) => {
    setSelectedTests((prev) => {
      const exists = prev.find((t) => t._id === test._id);
      if (exists) {
        return prev.filter((t) => t._id !== test._id);
      } else {
        return [...prev, test];
      }
    });
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }

    if (user?.role !== 'patient') {
      toast.error('Only patients can book lab appointments');
      return;
    }

    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    setShowBookingModal(true);
  };

  const submitBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.appointmentDate || !bookingData.appointmentTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      setBooking(true);
      await bookLabAppointment({
        labId: labId,
        tests: selectedTests.map((t) => t._id),
        collectionType: bookingData.collectionType,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        collectionAddress:
          bookingData.collectionType === 'home_collection'
            ? bookingData.collectionAddress
            : undefined,
        notes: bookingData.notes,
      });

      toast.success('Appointment booked successfully!');
      setShowBookingModal(false);
      setSelectedTests([]);
      setBookingData({
        appointmentDate: '',
        appointmentTime: '',
        collectionType: 'lab_visit',
        collectionAddress: '',
        notes: '',
      });
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const calculateTotal = () => {
    const testsTotal = selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
    const homeCollectionFee =
      bookingData.collectionType === 'home_collection' && lab?.generalHomeCollectionFee
        ? lab.generalHomeCollectionFee
        : 0;
    return testsTotal + homeCollectionFee;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-lab-yellow-600" />
          <p className="mt-4 text-lab-black-600">Loading lab details...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-lab-black-900">Lab not found</p>
          <button
            onClick={() => navigate('/quick-lab')}
            className="btn-quicklab-primary mt-4 px-6 py-2"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-lab-black-600 hover:text-lab-black-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lab Details - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card-quicklab bg-white border border-lab-black-100">
              {lab.logo && (
                <img
                  src={lab.logo}
                  alt={lab.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              )}

              <div className="p-6">
                <h1 className="text-3xl font-bold text-lab-black-900 mb-2">{lab.name}</h1>

                {/* Rating */}
                {lab.ratings?.average > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-lab-yellow-500 text-lab-yellow-500" />
                      <span className="text-lg font-semibold text-lab-black-900">
                        {lab.ratings.average.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-lab-black-600">
                      ({lab.ratings.count} reviews)
                    </span>
                  </div>
                )}

                {lab.description && <p className="text-lab-black-700 mb-4">{lab.description}</p>}

                {/* Contact Info */}
                <div className="space-y-3 border-t border-lab-black-100 pt-4">
                  {lab.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-lab-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-lab-black-900">Address</p>
                        <p className="text-lab-black-700">
                          {lab.address.formattedAddress ||
                            `${lab.address.city}, ${lab.address.state} ${lab.address.zipCode}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {lab.contact?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-lab-yellow-600" />
                      <div>
                        <p className="font-medium text-lab-black-900">Phone</p>
                        <p className="text-lab-black-700">{lab.contact.phone}</p>
                      </div>
                    </div>
                  )}

                  {lab.contact?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-lab-yellow-600" />
                      <div>
                        <p className="font-medium text-lab-black-900">Email</p>
                        <p className="text-lab-black-700">{lab.contact.email}</p>
                      </div>
                    </div>
                  )}

                  {lab.contact?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-lab-yellow-600" />
                      <div>
                        <p className="font-medium text-lab-black-900">Website</p>
                        <a
                          href={lab.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lab-yellow-600 hover:underline"
                        >
                          {lab.contact.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Home Collection */}
                {lab.generalHomeCollectionFee !== undefined && (
                  <div className="mt-4 p-4 bg-lab-yellow-50 rounded-lg border border-lab-yellow-200">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-lab-yellow-700" />
                      <div>
                        <p className="font-semibold text-lab-yellow-900">
                          Home Collection Available
                        </p>
                        <p className="text-sm text-lab-yellow-700">
                          Additional fee: ₹{lab.generalHomeCollectionFee}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Tests from Prescriptions */}
            {recommendedTests.length > 0 && (
              <div className="card-quicklab bg-white border border-lab-black-100">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-6 h-6 text-lab-yellow-600" />
                    <h2 className="text-xl font-bold text-lab-black-900">
                      Recommended Tests from Your Prescriptions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {recommendedTests.map((test, index) => (
                      <div
                        key={index}
                        className="p-4 bg-lab-yellow-50 rounded-lg border border-lab-yellow-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-lab-black-900">{test.name}</p>
                            {test.instructions && (
                              <p className="text-sm text-lab-black-600 mt-1">{test.instructions}</p>
                            )}
                            <p className="text-xs text-lab-black-500 mt-2">
                              Prescribed by Dr. {test.doctorName} on{' '}
                              {new Date(test.prescriptionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <AlertCircle className="w-5 h-5 text-lab-yellow-600 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Available Tests */}
            <div className="card-quicklab bg-white border border-lab-black-100">
              <div className="p-6">
                <h2 className="text-xl font-bold text-lab-black-900 mb-4">Available Tests</h2>

                {lab.tests && lab.tests.length > 0 ? (
                  <div className="space-y-4">
                    {lab.tests
                      .filter((test) => test.isActive !== false)
                      .map((test) => (
                        <div
                          key={test._id}
                          className={`p-4 border rounded-lg transition-all cursor-pointer ${
                            selectedTests.find((t) => t._id === test._id)
                              ? 'border-lab-yellow-500 bg-lab-yellow-50'
                              : 'border-lab-black-200 hover:border-lab-yellow-300'
                          }`}
                          onClick={() => handleTestSelection(test)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lab-black-900">
                                  {test.testName}
                                </h3>
                                {selectedTests.find((t) => t._id === test._id) && (
                                  <CheckCircle className="w-5 h-5 text-lab-yellow-600" />
                                )}
                              </div>

                              {test.testCode && (
                                <p className="text-sm text-lab-black-600">Code: {test.testCode}</p>
                              )}

                              {test.description && (
                                <p className="text-sm text-lab-black-700 mt-2">
                                  {test.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-3 mt-3">
                                {test.category && (
                                  <span className="px-2 py-1 bg-lab-black-100 text-lab-black-700 text-xs rounded">
                                    {test.category.replace(/_/g, ' ')}
                                  </span>
                                )}

                                {test.homeCollectionAvailable && (
                                  <span className="px-2 py-1 bg-lab-yellow-100 text-lab-yellow-800 text-xs rounded flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    Home Collection
                                  </span>
                                )}

                                {test.reportDeliveryTime && (
                                  <span className="px-2 py-1 bg-lab-black-100 text-lab-black-700 text-xs rounded flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {test.reportDeliveryTime}
                                  </span>
                                )}
                              </div>

                              {test.preparationInstructions && (
                                <p className="text-xs text-lab-black-600 mt-2">
                                  <strong>Preparation:</strong> {test.preparationInstructions}
                                </p>
                              )}
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-lab-yellow-600">
                                ₹{test.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-lab-black-600">No tests available</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="card-quicklab bg-white border border-lab-black-100 sticky top-24">
              <div className="p-6">
                <h3 className="text-xl font-bold text-lab-black-900 mb-4">Booking Summary</h3>

                {selectedTests.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {selectedTests.map((test) => (
                        <div key={test._id} className="flex justify-between text-sm">
                          <span className="text-lab-black-700">{test.testName}</span>
                          <span className="font-semibold text-lab-black-900">₹{test.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-lab-black-100 pt-3 mb-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-lab-black-900">Total</span>
                        <span className="text-lab-yellow-600">₹{calculateTotal()}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleBookAppointment}
                      disabled={!isAuthenticated || user?.role !== 'patient'}
                      className="w-full btn-quicklab-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!isAuthenticated
                        ? 'Login to Book'
                        : user?.role !== 'patient'
                          ? 'Patients Only'
                          : 'Book Appointment'}
                    </button>

                    {!isAuthenticated && (
                      <p className="text-xs text-lab-black-600 text-center mt-2">
                        Please login as a patient to book
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-lab-black-600 text-center py-4">
                    Select tests to book an appointment
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-lab-black-900 mb-4">Book Lab Appointment</h3>

              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.appointmentDate}
                    onChange={(e) =>
                      setBookingData((prev) => ({ ...prev, appointmentDate: e.target.value }))
                    }
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                    Appointment Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.appointmentTime}
                    onChange={(e) =>
                      setBookingData((prev) => ({ ...prev, appointmentTime: e.target.value }))
                    }
                    required
                    className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                    Collection Type
                  </label>
                  <select
                    value={bookingData.collectionType}
                    onChange={(e) =>
                      setBookingData((prev) => ({ ...prev, collectionType: e.target.value }))
                    }
                    className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                  >
                    <option value="lab_visit">Visit Lab</option>
                    {lab.generalHomeCollectionFee !== undefined && (
                      <option value="home_collection">
                        Home Collection (+₹{lab.generalHomeCollectionFee})
                      </option>
                    )}
                  </select>
                </div>

                {bookingData.collectionType === 'home_collection' && (
                  <div>
                    <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                      Collection Address
                    </label>
                    <textarea
                      value={bookingData.collectionAddress}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, collectionAddress: e.target.value }))
                      }
                      rows="2"
                      required
                      className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                      placeholder="Enter your complete address..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                    placeholder="Any special instructions..."
                  />
                </div>

                <div className="border-t border-lab-black-100 pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span className="text-lab-black-900">Total Amount</span>
                    <span className="text-lab-yellow-600">₹{calculateTotal()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn-quicklab-secondary py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={booking}
                    className="flex-1 btn-quicklab-primary py-2 disabled:opacity-50"
                  >
                    {booking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
