import { Calendar, Clock, CheckCircle, FileText } from 'lucide-react';

const AppointmentStats = ({ appointments, prescriptionStatus }) => {
  const completedCount = appointments.filter((apt) => apt.status === 'completed').length;
  const prescriptionCount = Object.values(prescriptionStatus).filter(Boolean).length;

  const stats = [
    {
      label: 'Total',
      value: appointments.length,
      icon: Calendar,
      color: 'text-gray-900',
      iconColor: 'text-gray-400',
    },
    {
      label: 'Upcoming',
      value: appointments.filter((apt) => apt.status === 'confirmed' || apt.status === 'pending')
        .length,
      icon: Clock,
      color: 'text-blue-600',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      iconColor: 'text-green-400',
    },
    {
      label: 'With Prescription',
      value: prescriptionCount,
      icon: FileText,
      color: 'text-purple-600',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentStats;
