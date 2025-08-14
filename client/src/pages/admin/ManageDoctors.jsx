import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCalendar, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';
import {
    getClinicDoctors,
    addDoctor,
    deleteDoctorFromClinic,
    setDoctorSchedule,
    getDoctorSchedule
} from '../../service/adminApiService'

// Sub-component for the Schedule Modal
const ScheduleModal = ({ isOpen, onClose, doctor, onSave }) => {
    const [schedule, setSchedule] = useState({
        workingDays: [],
        appointmentDuration: 30
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        if (isOpen && doctor) {
            setIsLoading(true);
            setError('');
            const fetchSchedule = async () => {
                try {
                    const existingSchedule = await getDoctorSchedule(doctor._id);
                    // Initialize full week schedule from fetched data or create new
                    const fullWeekSchedule = daysOfWeek.map(dayName => {
                        const dayData = existingSchedule.workingDays.find(d => d.day === dayName);
                        return dayData || { day: dayName, isWorking: false, startTime: '09:00', endTime: '17:00' };
                    });
                    setSchedule({
                        workingDays: fullWeekSchedule,
                        appointmentDuration: existingSchedule.appointmentDuration || 30,
                    });
                } catch (e) {
                     // If no schedule exists (404), create a default one
                    if (e.response && e.response.status === 404) {
                        setSchedule({
                           workingDays: daysOfWeek.map(day => ({ day, isWorking: false, startTime: '09:00', endTime: '17:00' })),
                           appointmentDuration: 30
                        });
                    } else {
                        setError('Failed to load schedule. Please try again.');
                        console.error("Error fetching schedule:", e);
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSchedule();
        }
    }, [isOpen, doctor]);

    const handleDayChange = (day, field, value) => {
        setSchedule(prev => ({
            ...prev,
            workingDays: prev.workingDays.map(d =>
                d.day === day ? { ...d, [field]: value } : d
            )
        }));
    };

    const handleDurationChange = (e) => {
        setSchedule(prev => ({ ...prev, appointmentDuration: parseInt(e.target.value, 10) }));
    };

    const handleSave = async () => {
        // Filter out the days the doctor is not working before saving
        const scheduleToSave = {
            ...schedule,
            workingDays: schedule.workingDays.filter(d => d.isWorking)
        };
        await onSave(doctor._id, scheduleToSave);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                    >
                        <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Schedule for Dr. {doctor.firstName} {doctor.lastName}
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <FiX className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            </button>
                        </header>

                        <div className="p-6 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
                                </div>
                            ) : error ? (
                                <div className="text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">{error}</div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {schedule.workingDays.map(({ day, isWorking, startTime, endTime }) => (
                                            <div key={day} className={`p-4 rounded-lg transition-all ${isWorking ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <label htmlFor={`working-${day}`} className="text-lg font-semibold capitalize text-gray-700 dark:text-gray-200">{day}</label>
                                                    <input
                                                        type="checkbox"
                                                        id={`working-${day}`}
                                                        checked={isWorking}
                                                        onChange={(e) => handleDayChange(day, 'isWorking', e.target.checked)}
                                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                                    />
                                                </div>
                                                <motion.div
                                                    initial={false}
                                                    animate={{ height: isWorking ? 'auto' : 0, opacity: isWorking ? 1 : 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex items-center space-x-2 mt-4">
                                                        <input type="time" value={startTime} onChange={e => handleDayChange(day, 'startTime', e.target.value)} className="form-input w-full bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-md" />
                                                        <span>-</span>
                                                        <input type="time" value={endTime} onChange={e => handleDayChange(day, 'endTime', e.target.value)} className="form-input w-full bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-md" />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label htmlFor="duration" className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Appointment Duration (minutes)</label>
                                        <input
                                            id="duration"
                                            type="number"
                                            min="5"
                                            step="5"
                                            value={schedule.appointmentDuration}
                                            onChange={handleDurationChange}
                                            className="form-input w-full max-w-xs bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-md"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <footer className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
                            <button onClick={onClose} className="px-6 py-2 mr-4 text-gray-700 dark:text-gray-200 bg-transparent rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center">
                                <FiLoader className={`animate-spin mr-2 ${!isLoading ? 'hidden' : ''}`} />
                                Save Changes
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Main Component
const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newDoctorId, setNewDoctorId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const fetchDoctors = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getClinicDoctors();
            setDoctors(response.doctors || []);
            setError('');
        } catch (err) {
            console.error("Failed to fetch doctors:", err);
            setError(err.response?.data?.message || 'Could not fetch doctors. The admin may not be associated with a clinic.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        if (!newDoctorId.trim()) return;

        setIsSubmitting(true);
        setError('');
        try {
            await addDoctor(newDoctorId);
            setNewDoctorId('');
            await fetchDoctors(); // Refresh list
        } catch (err) {
            console.error("Failed to add doctor:", err);
            setError(err.response?.data?.message || 'Failed to add doctor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        if (window.confirm('Are you sure you want to remove this doctor from the clinic?')) {
            try {
                await deleteDoctorFromClinic(doctorId);
                await fetchDoctors(); // Refresh list
            } catch (err) {
                console.error("Failed to delete doctor:", err);
                setError(err.response?.data?.message || 'Failed to delete doctor.');
            }
        }
    };

    const handleOpenScheduleModal = (doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
    };

    const handleSaveSchedule = async (doctorId, scheduleData) => {
        try {
            await setDoctorSchedule(doctorId, scheduleData);
            handleCloseModal();
        } catch(err) {
            console.error("Failed to save schedule", err);
            alert(err.response?.data?.message || "Could not save schedule.");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Manage Doctors</h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Add, remove, and configure schedules for doctors in your clinic.</p>
                </header>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 dark:bg-red-900/20 dark:text-red-300 flex items-center"
                        role="alert"
                    >
                        <FiAlertCircle className="mr-3 h-5 w-5"/>
                        <p>{error}</p>
                    </motion.div>
                )}

                {/* Add Doctor Form */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Add a New Doctor</h2>
                    <form onSubmit={handleAddDoctor} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <input
                            type="text"
                            value={newDoctorId}
                            onChange={(e) => setNewDoctorId(e.target.value)}
                            placeholder="Enter Doctor's Unique ID"
                            className="form-input flex-grow w-full text-lg px-4 py-3 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !newDoctorId.trim()}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isSubmitting ? (
                                <FiLoader className="animate-spin h-5 w-5 mr-3" />
                            ) : (
                                <FiPlus className="h-5 w-5 mr-2" />
                            )}
                            {isSubmitting ? 'Adding...' : 'Add Doctor'}
                        </button>
                    </form>
                </motion.div>

                {/* Doctors List */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Current Doctors</h2>
                    {isLoading ? (
                         <div className="flex justify-center items-center py-10">
                            <FiLoader className="animate-spin h-12 w-12 text-blue-500" />
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">No doctors have been added to this clinic yet.</p>
                        </div>
                    ) : (
                        <motion.ul
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {doctors.map(doctor => (
                                <motion.li
                                    key={doctor._id}
                                    variants={itemVariants}
                                    layout
                                    className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <img src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}`} alt="Doctor" className="h-14 w-14 rounded-full object-cover mr-4 border-2 border-white dark:border-gray-600 shadow-sm" />
                                        <div>
                                            <p className="font-bold text-lg text-gray-800 dark:text-white">{doctor.firstName} {doctor.lastName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialization || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleOpenScheduleModal(doctor)} className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors">
                                            <FiCalendar className="mr-2" />
                                            Schedule
                                        </button>
                                        <button onClick={() => handleDeleteDoctor(doctor._id)} className="flex items-center p-2 text-sm font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 transition-colors">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </div>
            </motion.div>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                doctor={selectedDoctor}
                onSave={handleSaveSchedule}
            />
        </div>
    );
};

export default ManageDoctors;
