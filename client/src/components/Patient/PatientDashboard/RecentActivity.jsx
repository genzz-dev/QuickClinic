import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppointmentList from './AppointmentList';

const RecentActivity = ({ appointments, onAppointmentClick }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const now = new Date();
  const upcomingAppointments = appointments.filter((a) => new Date(a.date) >= now);
  const pastAppointments = appointments.filter((a) => new Date(a.date) < now);

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;
  const hasMore = displayAppointments.length > 3;

  return (
    <div className="w-full px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Minimalist Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
              Your Appointments
            </h2>
            <p className="text-slate-600 text-base">
              {upcomingAppointments.length} upcoming · {pastAppointments.length} past
            </p>
          </div>

          {/* See All Button */}
          {hasMore && (
            <button
              onClick={() => navigate('/patient/appointments')}
              className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors duration-200 flex items-center gap-1 group"
            >
              <span>See all</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Premium Minimal Tab Switcher */}
        <div className="mb-8">
          <div className="inline-flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'upcoming' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Upcoming
              {activeTab === 'upcoming' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('past')}
              className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'past' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Past
              {activeTab === 'past' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Appointment List (Max 3) */}
        <AppointmentList
          appointments={displayAppointments.slice(0, 3)}
          activeTab={activeTab}
          onAppointmentClick={onAppointmentClick}
        />

        {/* Bottom See All Button (Mobile/Tablet) */}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/patient/appointments')}
              className="w-full md:w-auto px-6 py-3 text-sm font-medium text-slate-900 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 hover:border-gray-300 transition-all duration-200"
            >
              View all {displayAppointments.length} appointments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
