import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Calendar, LayoutDashboard, User, Sun, Moon, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

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

        <div className="hidden md:flex items-center gap-4">
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
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 glass rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 shadow-sm border border-white/40 relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] text-white font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 glass rounded-[2rem] shadow-2xl z-50 overflow-hidden border border-white/40"
                >
                  <div className="p-5 border-b border-white/20 flex justify-between items-center">
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400">Notifications</h4>
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-[10px] font-bold text-blue-600 hover:underline">Clear All</button>
                    )}
                  </div>
                  <div className="max-h-[25rem] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <Bell size={20} />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No new reminders</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`p-4 hover:bg-white/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'success' ? 'bg-green-100 text-green-600' : 
                                n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {n.type === 'success' ? <CheckCircle2 size={16} /> : n.type === 'warning' ? <AlertCircle size={16} /> : <Info size={16} />}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2.5 glass rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 shadow-sm border border-white/40"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Guest'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{user?.memberStatus || 'Sign In'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                <img src={user?.image || "https://i.pravatar.cc/100?u=marcus"} alt="Avatar" />
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
