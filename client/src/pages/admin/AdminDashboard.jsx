import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    getClinicInfo, 
    getClinicDoctors, 
    sendVerificationOTP, 
    verifyOtp, 
    updateClinic 
} from '../../service/adminApiService';
import { 
    BuildingOfficeIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline'; // Removed unnecessary icons as they are now in ClinicProfile
import Loading from '../../components/ui/Loading'; // Assuming you have a Loading component
import ClinicProfile from '../../components/admin/dashboard/ClinicProfile'; // Import the UI component

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
                setGoogleMapsUrl(clinicResponse.clinic.googleMapsLink || '');
            } else {
                setClinicData(null); // Ensure clinicData is null if no clinic found
            }
            
            if (doctorsResponse?.doctors) {
                setDoctors(doctorsResponse.doctors);
            } else {
                setDoctors([]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Only show toast if it's not a 404 (clinic not found)
            if (error.response?.status !== 404) {
                toast.error('Failed to load dashboard data');
            }
            setClinicData(null); // Ensure clinicData is null on error to trigger setup UI
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };
    
    // Step 1: Main entry point for the verification process
    const handleVerificationProcessStart = () => {
        if (!clinicData?.googleMapsLink) {
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
            await updateClinic({ googleMapsLink: googleMapsUrl }); // Ensure the key matches your API
            toast.success('Google Maps link saved!');
            setShowGoogleMapsModal(false);
            await fetchDashboardData(); // Re-fetch to update clinicData with new link
            handleSendVerificationOTP(); // Proceed to send OTP after saving the link
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
            toast.success("Verification code sent to your clinic's phone number!");
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
            fetchDashboardData(); // Refresh data to show updated attempts
        } finally {
            setVerifyingOTP(false);
        }
    };

    const VerificationStatusBanner = () => {
        if (!clinicData) return null; // Should not happen if this component is rendered

        // UPDATED LOGIC: Manual Review state triggered by 3 verification attempts
        if (clinicData.verificationAttempts >= 3) {
            return (
                <div className="mb-6 p-4 rounded-xl bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 shadow-sm">
                    <div className="flex items-center">
                        <ShieldExclamationIcon className="h-6 w-6 mr-3" />
                        <div>
                            <p className="font-bold">Manual Review Pending</p>
                            <p className="text-sm">You have exceeded the maximum verification attempts ({clinicData.verificationAttempts}). Your clinic is under manual review.</p>
                        </div>
                    </div>
                </div>
            );
        }
        // State: Verified
        if (clinicData.isVerified) {
            return (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border-l-4 border-green-500 text-green-800 shadow-sm">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-6 w-6 mr-3" />
                        <div>
                            <p className="font-bold">Clinic Verified</p>
                            <p className="text-sm">Your clinic profile is live and visible to patients.</p>
                        </div>
                    </div>
                </div>
            );
        }
        // Default State: Verification Required
        const attemptsMade = clinicData.verificationAttempts || 0;
        const attemptsRemaining = 3 - attemptsMade;
        return (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-800 shadow-sm">
                <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Verification Required</p>
                        <p className="mb-2 text-sm">Complete verification to make your clinic fully operational on our platform.</p>
                        <p className="text-xs font-semibold mb-3">Attempts remaining: {attemptsRemaining > 0 ? attemptsRemaining : 0} (Used: {attemptsMade})</p>
                        <button
                            onClick={handleVerificationProcessStart}
                            disabled={sendingOTP || clinicData.verificationAttempts >= 3} // Disable if attempts exceeded
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sendingOTP ? 'Sending...' : 'Start Verification'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <Loading />;
    }

    if (!clinicData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center">
                <BuildingOfficeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">Welcome to your Dashboard</h2>
                <p className="text-gray-500 mt-2 mb-4 max-w-md">It looks like you haven't set up your clinic yet. Get started by adding your clinic details.</p>
                <button
                    onClick={() => navigate('/admin/create-clinic')} // Assuming this navigates to a clinic creation form
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Create Clinic Profile
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, Admin!</h1>
            <p className="text-gray-600 mb-6">Manage your clinic and monitor your operations.</p>
            
            <VerificationStatusBanner />
            
            {/* The ClinicProfile component handles its own layout and styling */}
            <ClinicProfile clinicData={clinicData} doctors={doctors} />

            {/* --- Modals for Verification Flow --- */}
            {showGoogleMapsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2 text-gray-800">Google Maps Link Required</h2>
                        <p className="mb-4 text-gray-600">Please provide a valid Google Maps link for your clinic to proceed with verification.</p>
                        <form onSubmit={handleUpdateGoogleMapsLink}>
                            <input
                                type="url"
                                value={googleMapsUrl}
                                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowGoogleMapsModal(false)} 
                                    className="px-5 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isUpdatingClinic} 
                                    className="px-5 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isUpdatingClinic ? 'Saving...' : 'Save and Continue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showVerificationModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2 text-gray-800">Enter Verification Code</h2>
                        <p className="mb-4 text-gray-600">A 6-digit code was sent to your registered phone number. Please enter it below.</p>
                        <form onSubmit={handleVerifyOTP}>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="123456"
                                className="w-full p-3 border border-gray-300 rounded-md mb-4 tracking-widest text-center text-lg focus:ring-indigo-500 focus:border-indigo-500"
                                maxLength="6"
                                required
                            />
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowVerificationModal(false)} 
                                    className="px-5 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={verifyingOTP} 
                                    className="px-5 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
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
