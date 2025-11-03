import { useMemo } from 'react';
import { differenceInHours, isFuture, isPast, isToday } from 'date-fns';
import { Calendar } from 'lucide-react';
import AppointmentCard from './AppointmentCard';

const AppointmentTabs = ({
  appointments,
  prescriptionStatus,
  activeTab,
  setActiveTab,
  onAppointmentClick,
}) => {
  const categorizedAppointments = useMemo(() => {
    const today = new Date();
    return {
      upcoming: appointments
        .filter((apt) => {
          const aptDate = new Date(apt.date);
          return (
            isFuture(aptDate) ||
            (isToday(aptDate) &&
              differenceInHours(new Date(`${apt.date}T${apt.startTime}`), today) > 0)
          );
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
      today: appointments
        .filter((apt) => {
          const aptDate = new Date(apt.date);
          return isToday(aptDate);
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      past: appointments
        .filter((apt) => {
          const aptDate = new Date(apt.date);
          return isPast(aptDate) && !isToday(aptDate);
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    };
  }, [appointments]);

  const tabs = [
    {
      key: 'upcoming',
      label: 'Upcoming',
      count: categorizedAppointments.upcoming?.length || 0,
    },
    {
      key: 'today',
      label: 'Today',
      count: categorizedAppointments.today?.length || 0,
    },
    {
      key: 'past',
      label: 'Past',
      count: categorizedAppointments.past?.length || 0,
    },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 sm:px-6 py-3 text-sm font-light transition-all relative ${
              activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {categorizedAppointments[activeTab]?.length > 0 ? (
          categorizedAppointments[activeTab].map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              prescriptionStatus={prescriptionStatus}
              onAppointmentClick={onAppointmentClick}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <Calendar className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 text-sm font-light">
              {activeTab === 'upcoming'
                ? 'You have no upcoming appointments.'
                : activeTab === 'today'
                  ? 'No appointments scheduled for today.'
                  : 'No past appointments found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentTabs;
