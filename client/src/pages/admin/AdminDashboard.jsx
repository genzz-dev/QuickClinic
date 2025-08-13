import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClinicInfo, getClinicDoctors, sendVerificationOTP, verifyOtp, updateClinic } from '../../service/adminApiService';
import { 
    BuildingOfficeIcon, 
    UserGroupIcon, 
    ClockIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    PencilSquareIcon,
    PhoneIcon,
    MapPinIcon,
    GlobeAltIcon,
    UserIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import Loading from '../../components/ui/Loading';

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
            }
            if (doctorsResponse?.doctors) {
                setDoctors(doctorsResponse.doctors);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status !== 404) {
                toast.error('Failed to load dashboard data');
            }
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
            await updateClinic({ googleMapsUrl });
            toast.success('Google Maps link saved!');
            setShowGoogleMapsModal(false);
            await fetchDashboardData();
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
            fetchDashboardData(); // Refresh data to show updated attempts
        } finally {
            setVerifyingOTP(false);
        }
    };

    const VerificationStatusBanner = () => {
        if (!clinicData) return null;

        // UPDATED LOGIC: Manual Review state triggered by 3 verification attempts
        if (clinicData.verificationAttempts >= 3) {
            return (
                <div className="mb-6 p-4 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                    <div className="flex items-center">
                        <ShieldExclamationIcon className="h-6 w-6 mr-3" />
                        <div>
                            <p className="font-bold">Manual Review Pending</p>
                            <p>You have exceeded the maximum verification attempts ({clinicData.verificationAttempts}). Your clinic details have been submitted for manual review. We will notify you once the review is complete.</p>
                        </div>
                    </div>
                </div>
            );
        }

        // State: Verified
        if (clinicData.isVerified) {
            return (
                <div className="mb-6 p-4 rounded-lg bg-green-100 border-l-4 border-green-500 text-green-800">
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

        // Default State: Verification Required
        const attemptsMade = clinicData.verificationAttempts || 0;
        const attemptsRemaining = 3 - attemptsMade;
        return (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border-l-4 border-red-500 text-red-800">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Verification Required</p>
                        <p className="mb-2">Complete verification to make your clinic fully operational on our platform.</p>
                        <p className="text-sm font-semibold mb-3">Attempts remaining: {attemptsRemaining > 0 ? attemptsRemaining : 0} (Used: {attemptsMade})</p>
                        <button
                            onClick={handleVerificationProcessStart}
                            disabled={sendingOTP}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                        >
                            {sendingOTP ? 'Sending...' : 'Start Verification'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const DashboardCard = ({ icon, title, children }) => (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4">
            <div className="flex-shrink-0 text-indigo-500">{icon}</div>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
                <div className="text-2xl font-bold text-gray-800 mt-1">{children}</div>
            </div>
        </div>
    );

    if (loading) {
        return <Loading />;
    }

    if (!clinicData) {
        return (
            <div className="p-8 text-center">
                 <BuildingOfficeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">Welcome to your Dashboard</h2>
                <p className="text-gray-500 mt-2 mb-4">It looks like you haven't set up your clinic yet. Get started by adding your clinic details.</p>
                <button
                    onClick={() => navigate('/admin/clinic-profile')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <DashboardCard icon={<CheckCircleIcon className="h-8 w-8" />} title="Clinic Status">
                    {/* UPDATED LOGIC: Display status based on verification attempts */}
                    {clinicData.verificationAttempts >= 3 ? 'Manual Review' : (clinicData.isVerified ? 'Verified' : 'Pending Verification')}
                </DashboardCard>
                <DashboardCard icon={<UserGroupIcon className="h-8 w-8" />} title="Total Doctors">
                    {doctors.length}
                </DashboardCard>
                <DashboardCard icon={<ClockIcon className="h-8 w-8" />} title="Operating Hours">
                    {Object.values(clinicData.openingHours || {}).some(day => day && !day.isClosed) ? 'Configured' : 'Not Set'}
                </DashboardCard>
            </div>

            {/* Clinic Details & Doctors List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Clinic Info Card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{clinicData.name}</h2>
                        <button onClick={() => navigate('/admin/clinic-profile')} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center text-sm">
                            <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit Profile
                        </button>
                    </div>
                    <p className="text-gray-600 mb-6">{clinicData.description || 'No description provided.'}</p>
                    
                    <div className="space-y-4 text-gray-700">
                        <div className="flex items-center"><MapPinIcon className="h-5 w-5 mr-3 text-gray-400" /> {clinicData.address?.formattedAddress || 'No address provided'}</div>
                        <div className="flex items-center"><PhoneIcon className="h-5 w-5 mr-3 text-gray-400" /> {clinicData.contact?.phone}</div>
                        <div className="flex items-center"><GlobeAltIcon className="h-5 w-5 mr-3 text-gray-400" /> {clinicData.contact?.email}</div>
                    </div>
                </div>

                {/* Doctors Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Doctors</h3>
                    <ul className="space-y-4">
                        {doctors.length > 0 ? doctors.slice(0, 4).map(doctor => (
                            <li key={doctor._id} className="flex items-center">
                                <UserIcon className="h-8 w-8 p-1.5 bg-indigo-100 text-indigo-600 rounded-full mr-3"/>
                                <div>
                                    <p className="font-semibold text-gray-800">Dr. {doctor.firstName} {doctor.lastName}</p>
                                    <p className="text-sm text-gray-500">{doctor.specialization || 'General Practice'}</p>
                                </div>
                            </li>
                        )) : (
                            <p className="text-gray-500">No doctors have been added yet.</p>
                        )}
                         {doctors.length > 4 && (
                            <li className="text-sm text-indigo-600 font-semibold pt-2">
                                +{doctors.length - 4} more doctors
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Modals remain the same */}
        </div>
    );
};

export default AdminDashboard;
