import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import '../../quicklab.css';
import { CheckSquare, Clock, AlertCircle, Zap, Home, Phone, MoreVertical } from 'lucide-react';

export default function LabStaffDashboard() {
  const { user } = useAuth();
  const [staffInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    role: 'Phlebotomist',
  });

  // Demo stats
  const stats = [
    { label: "Today's Tasks", value: 8, icon: CheckSquare },
    { label: 'Pending Tasks', value: 3, icon: Clock },
    { label: 'Home Collections', value: 2, icon: Home },
  ];

  // Demo upcoming assignments
  const upcomingAssignments = [
    {
      id: 1,
      type: 'Blood Collection',
      patient: 'Patient Name',
      time: '10:30 AM',
      location: 'Home',
      status: 'pending',
    },
    {
      id: 2,
      type: 'Sample Processing',
      patient: 'Lab Counter',
      time: '2:00 PM',
      location: 'Lab',
      status: 'pending',
    },
    {
      id: 3,
      type: 'Report Preparation',
      patient: 'Sample ID: #12345',
      time: '4:00 PM',
      location: 'Lab',
      status: 'in-progress',
    },
  ];

  // Quick action buttons
  const quickActions = [
    { label: 'View My Tasks', icon: Zap, action: () => alert('View tasks') },
    { label: 'Home Collections', icon: Home, action: () => alert('View home collections') },
    { label: 'My Profile', icon: Phone, action: () => alert('View profile') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-lab-black-900 mb-2">
            Welcome, <span className="text-lab-yellow-600">{staffInfo.firstName}</span>
          </h1>
          <p className="text-lab-black-600">{staffInfo.role} • Ready for today's tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="card-quicklab bg-white border border-lab-black-100 hover:border-lab-yellow-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lab-black-600 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-lab-black-900">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-lab-yellow-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-lab-yellow-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-lab-black-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  className="card-quicklab bg-white border border-lab-black-100 hover:border-lab-yellow-400 transition-all flex flex-col items-center justify-center p-4"
                >
                  <Icon className="w-6 h-6 text-lab-yellow-600 mb-2" />
                  <span className="text-sm font-semibold text-lab-black-900 text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-lab-black-900">Today's Assignments</h2>
            <button className="text-lab-black-600 hover:text-lab-yellow-600 font-semibold">
              See all →
            </button>
          </div>

          <div className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="card-quicklab bg-white border-l-4 border-lab-yellow-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-block px-3 py-1 bg-lab-yellow-500 text-lab-black-900 text-xs font-bold rounded">
                    {assignment.type}
                  </span>
                  <button className="text-lab-black-400 hover:text-lab-black-900">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <p className="font-semibold text-lab-black-900 mb-3">{assignment.patient}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-lab-black-600">
                    <Clock size={16} />
                    <span>{assignment.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-lab-black-600">
                    <Home size={16} />
                    <span>{assignment.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      assignment.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {assignment.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </span>
                  <button className="text-lab-yellow-600 hover:text-lab-yellow-800 font-semibold text-sm">
                    {assignment.status === 'in-progress' ? 'Complete' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
