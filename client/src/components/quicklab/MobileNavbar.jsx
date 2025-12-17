// MobileNavbar.jsx
import { Search, Home, BookOpen, User, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import DarkModeToggle from '../ui/DarkModeToggle';

export default function MobileNavbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };
  return (
    <>
      {/* Top Bar - Search Only */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-xl font-bold whitespace-nowrap">
              <span className="text-slate-900 dark:text-slate-50">Quick</span>
              <span className="text-yellow-500 dark:text-yellow-400">Labs</span>
            </div>
          </div>

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
      </div>

      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home/Labs */}
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95">
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Labs */}
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs font-medium">Labs</span>
          </button>

          {/* Dark Mode Toggle */}
          <div className="flex flex-col items-center justify-center w-full h-full">
            <DarkModeToggle />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Theme
            </span>
          </div>

          {/* Lab Admin: Manage Staff */}
          {isAuthenticated && user?.role === 'lab_admin' && (
            <button
              onClick={() => navigate('/quick-lab/staff')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs font-medium">Staff</span>
            </button>
          )}

          {/* Conditional: Login/Account OR Logout */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors active:scale-95"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <User className="h-6 w-6" />
              <span className="text-xs font-medium">Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Spacer for fixed navbars */}
      <div className="lg:hidden h-28" />
    </>
  );
}
