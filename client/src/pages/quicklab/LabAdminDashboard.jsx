import { BarChart3, Users, TestTube, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../quicklab.css';

export default function LabAdminDashboard() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Tests', value: '0', icon: TestTube, color: 'lab-yellow' },
    { label: 'Staff Members', value: '0', icon: Users, color: 'lab-blue' },
    { label: 'Appointments', value: '0', icon: Calendar, color: 'lab-yellow' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-lab-black-900 mb-2">Lab Dashboard</h1>
          <p className="text-lab-black-600">Manage your lab, staff, and appointments</p>
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
                <div className="flex items-start justify-between mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Manage Tests */}
          <div className="card-quicklab bg-white border border-lab-black-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 mb-1">Manage Tests</h3>
                <p className="text-lab-black-600 text-sm">Add, update, or remove test services</p>
              </div>
              <TestTube className="w-6 h-6 text-lab-yellow-600" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/tests')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              View Tests
            </button>
          </div>

          {/* Manage Staff */}
          <div className="card-quicklab bg-white border border-lab-black-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 mb-1">Manage Staff</h3>
                <p className="text-lab-black-600 text-sm">Add or manage lab staff members</p>
              </div>
              <Users className="w-6 h-6 text-lab-yellow-600" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/staff')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              View Staff
            </button>
          </div>

          {/* Appointments */}
          <div className="card-quicklab bg-white border border-lab-black-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 mb-1">Appointments</h3>
                <p className="text-lab-black-600 text-sm">Track and manage lab appointments</p>
              </div>
              <Calendar className="w-6 h-6 text-lab-yellow-600" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/appointments')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              View Appointments
            </button>
          </div>

          {/* Settings */}
          <div className="card-quicklab bg-white border border-lab-black-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 mb-1">Lab Settings</h3>
                <p className="text-lab-black-600 text-sm">Update lab information and settings</p>
              </div>
              <Settings className="w-6 h-6 text-lab-yellow-600" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/settings')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              Edit Settings
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-quicklab bg-white border border-lab-black-100">
          <h3 className="text-lg font-bold text-lab-black-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <p className="text-lab-black-600 text-sm py-4 text-center">No recent activity yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
