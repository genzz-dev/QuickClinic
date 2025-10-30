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
  // Categorize appointments
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

  // Tab Navigation
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Appointments Content */}
      <div className="p-6">
        {categorizedAppointments[activeTab]?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categorizedAppointments[activeTab].map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                prescriptionStatus={prescriptionStatus}
                onAppointmentClick={onAppointmentClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} appointments</h3>
            <p className="text-gray-600">
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
