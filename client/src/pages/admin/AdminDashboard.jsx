import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClinicInfo, getClinicDoctors, sendVerificationOTP, verifyOtp, updateClinic } from '../../service/adminApiService';
import { 
    BuildingOfficeIcon, UserGroupIcon, ClockIcon, ExclamationTriangleIcon, 
    CheckCircleIcon, PencilSquareIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, UserIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [clinicData, setClinicData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for the new verification flow
    const [showGoogleMapsModal, setShowGoogleMapsModal] = useState(false);
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');
    const [isUpdatingClinic, setIsUpdatingClinic] = useState(false);

    // State for OTP verification
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [sendingOTP, setSendingOTP] = useState(false);
    const [verifyingOTP, setVerifyingOTP] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const clinicResponse = await getClinicInfo();
            const doctorsResponse = await getClinicDoctors();

            if (clinicResponse?.clinic) {
                setClinicData(clinicResponse.clinic);
                // Pre-fill google maps URL if it exists
                setGoogleMapsUrl(clinicResponse.clinic.googleMapsUrl || '');
            }
            if (doctorsResponse?.doctors) {
                setDoctors(doctorsResponse.doctors);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status !== 404) { // Ignore 404s for new users
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Step 1: Main entry point for the verification process
    const handleVerificationProcessStart = () => {
        if (!clinicData?.googleMapsUrl) {
            setShowGoogleMapsModal(true);
        } else {
            handleSendVerificationOTP();
        }
    };

    // Step 2: Update clinic with Google Maps link if it was missing
    const handleUpdateGoogleMapsLink = async (e) => {
        e.preventDefault();
        if (!googleMapsUrl.trim()) {
            toast.error('Please enter a valid Google Maps link.');
            return;
        }
        setIsUpdatingClinic(true);
        try {
            await updateClinic({ googleMapsUrl }, null, []);
            toast.success('Google Maps link saved!');
            setShowGoogleMapsModal(false);
            
            // Refresh clinic data to ensure the link is in state
            await fetchDashboardData(); 

            // Proceed to send OTP
            handleSendVerificationOTP(); 
        } catch (error) {
            console.error('Error updating clinic with Google Maps link:', error);
            toast.error('Failed to save the link. Please try again.');
        } finally {
            setIsUpdatingClinic(false);
        }
    };

    // Step 3: Send the verification OTP
    const handleSendVerificationOTP = async () => {
        setSendingOTP(true);
        try {
            await sendVerificationOTP();
            toast.success('Verification code sent to your clinic\'s phone number!');
            setShowVerificationModal(true);
        } catch (error) {
            console.error('Error sending OTP:', error);
            const errorMsg = error.response?.data?.message || 'Failed to send verification code.';
            toast.error(errorMsg);
        } finally {
            setSendingOTP(false);
        }
    };

    // Step 4: Verify the entered OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!verificationCode.trim()) {
            toast.error('Please enter the verification code');
            return;
        }
        setVerifyingOTP(true);
        try {
            await verifyOtp(verificationCode);
            toast.success('Clinic verified successfully!');
            setShowVerificationModal(false);
            setVerificationCode('');
            fetchDashboardData(); // Refresh data to show verified status
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error(error.response?.data?.message || 'Failed to verify OTP. The code may be incorrect or expired.');
        } finally {
            setVerifyingOTP(false);
        }
    };

    const VerificationStatusBanner = () => {
        if (!clinicData) return null;

        if (clinicData.isVerified) {
            return (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-6 w-6 mr-3" />
                        <div>
                            <p className="font-bold">Clinic Verified</p>
                            <p>Your clinic is verified and visible to patients.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-sm">
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3" />
                    <div>
                        <p className="font-bold">Verification Required</p>
                        <p>Complete verification to make your clinic fully operational on our platform.</p>
                        <button
                            onClick={handleVerificationProcessStart}
                            disabled={sendingOTP}
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
                        >
                            {sendingOTP ? 'Processing...' : 'Verify Clinic'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading Dashboard...</p></div>;
    }

    if (!clinicData) {
        return (
             <div className="text-center p-12 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-10">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, Admin!</h2>
                <p className="mt-4 text-gray-600">It looks like you haven't set up your clinic yet. Get started by adding your clinic details.</p>
                <button 
                    onClick={() => navigate('/admin/add-clinic')}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                    Add Your Clinic
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-lg text-gray-600">Welcome back! Manage your clinic and monitor your operations.</p>
                </div>

                {/* Verification Status Banner */}
                <div className="mb-8">
                    <VerificationStatusBanner />
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                        <BuildingOfficeIcon className="h-10 w-10 text-blue-500 mr-4"/>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Clinic Status</p>
                            <p className={`text-xl font-semibold ${clinicData.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>{clinicData.isVerified ? 'Verified' : 'Pending Verification'}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                        <UserGroupIcon className="h-10 w-10 text-blue-500 mr-4"/>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                            <p className="text-xl font-semibold text-gray-900">{doctors.length}</p>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                        <ClockIcon className="h-10 w-10 text-blue-500 mr-4"/>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Operating Hours</p>
                            <p className="text-xl font-semibold text-gray-900">{clinicData.operatingHours?.length > 0 ? 'Configured' : 'Not Set'}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Clinic Information */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Clinic Information</h2>
                            <button onClick={() => navigate('/admin/update-clinic')} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                                <PencilSquareIcon className="h-4 w-4 mr-1"/> Edit
                            </button>
                        </div>
                        <div className="space-y-4 text-gray-700">
                             <p>{clinicData.description || 'No description provided.'}</p>
                            <div className="flex items-start"><MapPinIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-gray-500"/><p>{clinicData.address?.formattedAddress || 'No address provided'}</p></div>
                            <div className="flex items-center"><PhoneIcon className="h-5 w-5 mr-3 text-gray-500"/><p>{clinicData.contact?.phone}</p></div>
                            <div className="flex items-center"><GlobeAltIcon className="h-5 w-5 mr-3 text-gray-500"/><p>{clinicData.contact?.email}</p></div>
                        </div>
                    </div>

                    {/* Doctors List */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Doctors</h2>
                            <button onClick={() => navigate('/admin/add-doctor')} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Add Doctor</button>
                        </div>
                        <div className="space-y-4">
                            {doctors.length > 0 ? (
                                doctors.slice(0, 4).map(doctor => (
                                    <div key={doctor._id} className="flex items-center space-x-3">
                                        <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                                          <UserIcon className="h-6 w-6 text-gray-500"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Dr. {doctor.firstName} {doctor.lastName}</p>
                                            <p className="text-sm text-gray-500">{doctor.specialization || 'General Practice'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No doctors have been added yet.</p>
                            )}
                            {doctors.length > 4 && (
                                <p className="text-sm text-blue-600 font-medium pt-2 text-center">+{doctors.length - 4} more doctors</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Google Maps Link Modal */}
            {showGoogleMapsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Add Google Maps Link</h2>
                        <p className="mb-6 text-gray-600">To verify your clinic, please provide a public Google Maps link to your clinic's location.</p>
                        <form onSubmit={handleUpdateGoogleMapsLink}>
                            <input
                                type="url"
                                value={googleMapsUrl}
                                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                                required
                            />
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setShowGoogleMapsModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" disabled={isUpdatingClinic} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                                    {isUpdatingClinic ? 'Saving...' : 'Save & Continue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* OTP Verification Modal */}
            {showVerificationModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Enter Verification Code</h2>
                        <p className="mb-6 text-gray-600">A 6-digit code has been sent to your clinic's registered phone number. Please enter it below.</p>
                        <form onSubmit={handleVerifyOTP}>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-center tracking-widest text-lg"
                                maxLength="6"
                                required
                            />
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setShowVerificationModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" disabled={verifyingOTP} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                                    {verifyingOTP ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
