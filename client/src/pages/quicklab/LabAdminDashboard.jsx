import { useEffect, useState } from 'react';
import {
  Users,
  TestTube,
  Calendar,
  Settings,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLabInfo, getLabStaff } from '../../service/labAdminService';
import { getLabAppointments } from '../../service/labAppointmentService';
import { toast } from 'react-toastify';
import '../../quicklab.css';

export default function LabAdminDashboard() {
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Tests', value: '0', icon: TestTube, color: 'lab-yellow' },
    { label: 'Staff Members', value: '0', icon: Users, color: 'lab-blue' },
    { label: 'Appointments', value: '0', icon: Calendar, color: 'lab-yellow' },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [labRes, staffRes, apptRes] = await Promise.all([
        getLabInfo(),
        getLabStaff(),
        getLabAppointments({ limit: 100 }),
      ]);

      const labData = labRes.data?.lab || labRes.lab;
      const staffData = staffRes.data?.staff || staffRes.staff || [];
      const apptData = apptRes.data?.appointments || apptRes.appointments || [];

      setLab(labData);
      setStats([
        {
          label: 'Total Tests',
          value: String(labData?.tests?.length || 0),
          icon: TestTube,
          color: 'lab-yellow',
        },
        {
          label: 'Staff Members',
          value: String(staffData?.length || 0),
          icon: Users,
          color: 'lab-blue',
        },
        {
          label: 'Total Appointments',
          value: String(apptData?.length || 0),
          icon: Calendar,
          color: 'lab-yellow',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-lab-black-500 dark:text-lab-black-300">
              Welcome back
            </p>
            <h1 className="text-4xl font-bold text-lab-black-900 dark:text-lab-black-50 mb-2">
              {lab?.name || 'Lab Dashboard'}
            </h1>
            <p className="text-lab-black-600 dark:text-lab-black-300">
              Manage your lab, staff, and appointments
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lab-yellow-500 hover:bg-lab-yellow-600 dark:bg-lab-yellow-600 dark:hover:bg-lab-yellow-700 text-lab-black-900 font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="card-quicklab border border-lab-black-100 dark:border-lab-black-700 hover:border-lab-yellow-400 dark:hover:border-lab-yellow-400 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-lab-black-600 dark:text-lab-black-300 text-sm font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-lab-black-900 dark:text-lab-black-50">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-lab-yellow-100 dark:bg-lab-yellow-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-lab-yellow-700 dark:text-lab-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-lab-yellow-600 dark:text-lab-yellow-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>View details</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Manage Tests */}
          <div className="card-quicklab border border-lab-black-100 dark:border-lab-black-700 hover:border-lab-yellow-400 dark:hover:border-lab-yellow-400 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 dark:text-lab-black-50 mb-1">
                  Manage Tests
                </h3>
                <p className="text-lab-black-600 dark:text-lab-black-300 text-sm">
                  Add, update, or remove test services
                </p>
              </div>
              <TestTube className="w-6 h-6 text-lab-yellow-600 dark:text-lab-yellow-400" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/tests')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              View Tests
            </button>
          </div>

          {/* Manage Staff */}
          <div className="card-quicklab border border-lab-black-100 dark:border-lab-black-700 hover:border-lab-yellow-400 dark:hover:border-lab-yellow-400 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 dark:text-lab-black-50 mb-1">
                  Manage Staff
                </h3>
                <p className="text-lab-black-600 dark:text-lab-black-300 text-sm">
                  Add or manage lab staff members
                </p>
              </div>
              <Users className="w-6 h-6 text-lab-yellow-600 dark:text-lab-yellow-400" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/staff')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              View Staff
            </button>
          </div>

          {/* Lab Settings */}
          <div className="card-quicklab border border-lab-black-100 dark:border-lab-black-700 hover:border-lab-yellow-400 dark:hover:border-lab-yellow-400 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 dark:text-lab-black-50 mb-1">
                  Lab Settings
                </h3>
                <p className="text-lab-black-600 dark:text-lab-black-300 text-sm">
                  Update profile, charges, and media
                </p>
              </div>
              <Settings className="w-6 h-6 text-lab-yellow-600 dark:text-lab-yellow-400" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/lab-settings')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              Open Settings
            </button>
          </div>

          {/* Appointments */}
          <div className="card-quicklab border border-lab-black-100 dark:border-lab-black-700 hover:border-lab-yellow-400 dark:hover:border-lab-yellow-400 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-lab-black-900 dark:text-lab-black-50 mb-1">
                  Appointments
                </h3>
                <p className="text-lab-black-600 dark:text-lab-black-300 text-sm">
                  Track and manage lab appointments
                </p>
              </div>
              <Calendar className="w-6 h-6 text-lab-yellow-600 dark:text-lab-yellow-400" />
            </div>
            <button
              onClick={() => navigate('/quick-lab/appointments')}
              className="btn-quicklab-primary w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              View Appointments
            </button>
          </div>
        </div>

        {/* Lab Overview & Quick Stats */}
        {lab && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Lab Summary */}
            <div className="lg:col-span-2 card-quicklab border border-lab-black-100 dark:border-lab-black-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-lab-yellow-100 dark:bg-lab-yellow-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-lab-yellow-600 dark:text-lab-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                    Lab Overview
                  </h3>
                  <p className="text-lab-black-600 dark:text-lab-black-300 text-sm">{lab.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-lab-black-100 dark:border-lab-black-700">
                <div>
                  <p className="text-lab-black-600 dark:text-lab-black-300 text-sm mb-1">
                    Location
                  </p>
                  <p className="font-semibold text-lab-black-900 dark:text-lab-black-50">
                    {lab.address?.city || '—'}, {lab.address?.state || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-lab-black-600 dark:text-lab-black-300 text-sm mb-1">Contact</p>
                  <p className="font-semibold text-lab-black-900 dark:text-lab-black-50">
                    {lab.contact?.phone || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card-quicklab border border-lab-black-100 dark:border-lab-black-700 space-y-3">
              <h3 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-lab-yellow-600 dark:text-lab-yellow-400" />
                Quick Access
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/quick-lab/lab-settings')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-lab-yellow-100 dark:hover:bg-lab-yellow-900/20 text-lab-black-900 dark:text-lab-black-50 font-medium transition-colors"
                >
                  ⚙️ Lab Settings
                </button>
                <button
                  onClick={() => navigate('/quick-lab/appointments')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-lab-yellow-100 dark:hover:bg-lab-yellow-900/20 text-lab-black-900 dark:text-lab-black-50 font-medium transition-colors"
                >
                  📅 View Appointments
                </button>
                <button
                  onClick={() => navigate('/quick-lab/tests')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-lab-yellow-100 dark:hover:bg-lab-yellow-900/20 text-lab-black-900 dark:text-lab-black-50 font-medium transition-colors"
                >
                  🧪 Manage Tests
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card-quicklab border border-lab-black-100 dark:border-lab-black-700">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-lab-yellow-600 dark:text-lab-yellow-400" />
            <h3 className="text-lg font-bold text-lab-black-900 dark:text-lab-black-50">
              System Status
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
              <span className="text-green-700 dark:text-green-400 font-medium">✓ Lab Profile</span>
              <span className="text-sm text-green-600 dark:text-green-300">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
              <span className="text-blue-700 dark:text-blue-400 font-medium">
                ✓ Database Connection
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-300">Connected</span>
            </div>
            <p className="text-lab-black-600 dark:text-lab-black-300 text-sm pt-2">
              All systems operational. Keep managing your lab efficiently!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
