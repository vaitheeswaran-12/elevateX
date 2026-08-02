import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export default function RecruiterDashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'ATS Studio Home', path: '/recruiter-dashboard', icon: LayoutDashboard },
    { name: 'Job Openings', path: '/recruiter-dashboard/jobs', icon: Briefcase },
    { name: 'Candidate Pipeline', path: '/recruiter-dashboard/candidates', icon: Users },
    { name: 'Company Hub', path: '/recruiter-dashboard/profile', icon: Building2 },
    { name: 'Hiring Insights', path: '/recruiter-dashboard/analytics', icon: BarChart3 }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-100 flex transition-colors duration-300">

      {/* ==========================================
          DESKTOP SIDEBAR
          ========================================== */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-gray-800 shrink-0">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ElevateX</span>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Recruiter Studio</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-premium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile Control */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center font-bold text-accent">
                {user?.name ? user.name[0] : 'R'}
              </div>
              <div className="truncate max-w-[130px]">
                <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">{user?.name || 'Recruiter'}</h4>
                <p className="text-[10px] text-gray-400 font-bold truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 dark:text-gray-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          MOBILE NAVIGATION HEADER
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-black tracking-tight text-gray-900 dark:text-white">ElevateX ATS</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 rounded-xl text-gray-700 dark:text-gray-200"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-y-16 inset-x-0 bg-white dark:bg-[#111827] z-50 p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-premium'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-2xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate Session</span>
            </button>
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
