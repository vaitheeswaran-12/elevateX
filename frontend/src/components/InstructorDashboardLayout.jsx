import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FolderCheck,
  Users,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export default function InstructorDashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Studio Home', path: '/instructor-dashboard', icon: LayoutDashboard },
    { name: 'Course Catalog', path: '/instructor-dashboard/courses', icon: BookOpen },
    { name: 'Quiz Builder', path: '/instructor-dashboard/quizzes', icon: HelpCircle },
    { name: 'Assignments', path: '/instructor-dashboard/assignments', icon: FolderCheck },
    { name: 'Student List', path: '/instructor-dashboard/students', icon: Users },
    { name: 'Student Reviews', path: '/instructor-dashboard/reviews', icon: MessageSquare },
    { name: 'Instructor Profile', path: '/instructor-dashboard/profile', icon: User },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    return paths.map((p, idx) => {
      const isLast = idx === paths.length - 1;
      const formatted = p.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
      return {
        name: formatted,
        path: '/' + paths.slice(0, idx + 1).join('/'),
        isLast
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex transition-colors duration-200">

      {/* MOBILE DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-gray-900/40 backdrop-blur-sm">
          <div className="w-64 bg-white dark:bg-gray-900 h-full flex flex-col p-6 border-r border-gray-100 dark:border-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-primary p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-white">AscendIQ</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-grow space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-premium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR PANEL */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white dark:bg-gray-900 p-6 border-r border-gray-100 dark:border-gray-800 shrink-0 sticky top-0 h-screen transition-colors">
        <div className="flex items-center space-x-2.5 mb-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary p-2 rounded-xl text-white group-hover:scale-105 transition-all shadow-premium">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-gray-900 dark:text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AscendIQ
            </span>
          </Link>
        </div>

        <nav className="flex-grow space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-premium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* CORE FRAMEWORK wrapper */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 md:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-primary">AscendIQ</Link>
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.path}>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <Link
                    to={b.path}
                    className={b.isLast ? 'text-gray-800 dark:text-gray-200 font-bold' : 'hover:text-primary'}
                  >
                    {b.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`relative hidden md:block w-64 transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search studio assets..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 hover:opacity-90 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-soft">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium capitalize">{user.role} studio</p>
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl py-2.5 z-20 transition-all animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 font-semibold">Logged in as</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/instructor-dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Instructor Bio Settings</span>
                      </Link>
                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
