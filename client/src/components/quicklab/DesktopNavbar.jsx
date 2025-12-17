// DesktopNavbar.jsx
import { Search, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import DarkModeToggle from '../ui/DarkModeToggle';
import DesktopFooter from './DesktopFooter';
export default function DesktopNavbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };
  return (
    <nav className="hidden lg:block sticky top-0 z-50 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-slate-900 dark:text-slate-50">Quick</span>
              <span className="text-yellow-500 dark:text-yellow-400">Labs</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search labs..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Lab Admin: Manage Staff shortcut */}
            {isAuthenticated && user?.role === 'lab_admin' && (
              <button
                onClick={() => navigate('/quick-lab/staff')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="Manage Staff"
              >
                <Users className="h-5 w-5" />
                Manage Staff
              </button>
            )}

            {/* Conditional: Login/Register OR Logout */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
