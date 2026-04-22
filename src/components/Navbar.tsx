import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Stethoscope, Calendar, LayoutDashboard, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Find Doctor', path: '/doctors', icon: Stethoscope },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-4 left-6 right-6 z-50 glass rounded-3xl shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
            <Stethoscope size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100 uppercase">MediConnect <span className="text-blue-600">AI</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative py-2 text-sm font-semibold transition-colors ${
                location.pathname === item.path ? 'text-blue-600 underline underline-offset-8 decoration-2' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 glass rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 shadow-sm border border-white/40"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Marcus Aurelius</p>
                <p className="text-xs text-slate-500">Premium Patient</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                <img src="https://i.pravatar.cc/100?u=marcus" alt="Avatar" />
            </div>
          </div>
        </div>

        <button className="md:hidden p-2 text-neutral-500">
            <LayoutDashboard size={24} />
        </button>
      </div>
    </nav>
  );
}
