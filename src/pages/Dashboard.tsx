import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Doctor, UserProfile } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, ChevronRight, User, Stethoscope, ArrowRight, Edit3, X, Save, Phone, Mail, DollarSign, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';

export function Dashboard() {
  const [appointments, setAppointments] = useState<(Appointment & { doctor?: Doctor })[]>([]);
  const { user, refreshUser } = useUser();
  const { notifications, addNotification, markAsRead } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<(Appointment & { doctor?: Doctor }) | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('Appointments');
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [appRes, docRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/doctors')
        ]);
        const apps = await appRes.json();
        const docs = await docRes.json();
        
        const EnrichedApps = apps.map((app: Appointment) => ({
          ...app,
          doctor: docs.find((d: Doctor) => d.id === app.doctorId)
        }));
        
        setAppointments(EnrichedApps.reverse());
        
        // Reminder Logic
        const now = new Date();
        const remindedIds = JSON.parse(localStorage.getItem('reminded_appointments') || '[]');
        
        EnrichedApps.forEach((app: any) => {
          const appDate = new Date(app.createdAt);
          const timeDiff = appDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 3600);

          // If appointment is within the next 24 hours and not already reminded
          if (hoursDiff > 0 && hoursDiff <= 24 && !remindedIds.includes(app.id)) {
            addNotification(
              'Upcoming Appointment Reminder',
              `Hi ${user?.name}, you have an appointment with ${app.doctor?.name} scheduled for ${app.slot} today. A copy of this reminder has been sent to ${user?.email}.`,
              'warning'
            );
            remindedIds.push(app.id);
          }
        });
        localStorage.setItem('reminded_appointments', JSON.stringify(remindedIds));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshUser]);

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentToCancel.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAppointments(prev => prev.filter(app => app.id !== appointmentToCancel.id));
        addNotification(
            'Appointment Cancelled',
            `Your appointment with ${appointmentToCancel.doctor?.name} has been successfully cancelled and the slot has been released.`,
            'info'
        );
        setAppointmentToCancel(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (user) {
        setEditForm({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        await refreshUser();
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
        <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="h-64 glass rounded-[3rem] animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <div key={i} className="h-32 glass rounded-[2.5rem] animate-pulse" />)}
            </div>
        </div>
    );
  }

  const tabs = [
    { name: 'Appointments', icon: Calendar },
    { name: 'Profile', icon: User },
    { name: 'Inbox', icon: Mail },
    { name: 'Medical Records', icon: Edit3 },
    { name: 'Prescriptions', icon: Stethoscope },
    { name: 'Billing', icon: DollarSign },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
            <div className="glass p-8 rounded-[3rem] shadow-sm text-center space-y-6 relative overflow-hidden">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 p-2 glass rounded-full text-slate-400 hover:text-blue-600 transition-colors"
                    title="Edit Profile"
                >
                    <Edit3 size={16} />
                </button>

                <div className="relative inline-block">
                    <img 
                        src={user?.image || "https://i.pravatar.cc/150?u=marcus"} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-white shadow-sm">
                        <CheckCircle2 size={14} />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{user?.memberStatus}</p>
                </div>

                <div className="flex flex-col gap-2 pt-2 text-left">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        <Mail size={14} className="text-blue-600" />
                        {user?.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        <Phone size={14} className="text-blue-600" />
                        {user?.phone}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{appointments.length}</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Bookings</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-blue-600">{notifications.filter(n => !n.read).length}</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Alerts</p>
                    </div>
                </div>
            </div>

            <nav className="glass p-4 rounded-[2.5rem] shadow-sm space-y-2">
                {tabs.map((tab) => (
                    <button 
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all ${
                            activeTab === tab.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-100/20' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <tab.icon size={18} />
                            {tab.name}
                        </div>
                        <ChevronRight size={18} />
                    </button>
                ))}
            </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
                {activeTab === 'Appointments' && (
                    <motion.div
                        key="appointments"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <header className="flex items-center justify-between">
                            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Active Bookings</h1>
                            <Link to="/doctors" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100/20">
                                <Stethoscope size={18} />
                                New Visit
                            </Link>
                        </header>

                        {appointments.length > 0 ? (
                            <div className="space-y-6">
                                {appointments.map((app, i) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border-l-4 border-l-blue-500"
                                    >
                                        <img 
                                            src={app.doctor?.image} 
                                            alt={app.doctor?.name} 
                                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                                        />
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{app.doctor?.name}</h3>
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none flex items-center h-fit">
                                                    {app.doctor?.specialization}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-1">
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold italic">
                                                    <Calendar size={16} className="text-blue-600" />
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold italic">
                                                    <Clock size={16} className="text-blue-600" />
                                                    {app.slot}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end gap-3 text-right">
                                            <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md shadow-blue-100">
                                                {app.status}
                                            </span>
                                            <button 
                                                onClick={() => setAppointmentToCancel(app)}
                                                className="text-[10px] font-bold text-slate-500 dark:text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-neutral-100/50 p-24 rounded-[4rem] text-center space-y-6">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-neutral-300 shadow-sm border border-neutral-100">
                                    <Calendar size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-neutral-900">No appointments yet</h2>
                                    <p className="text-neutral-500">Your scheduled sessions will appear here.</p>
                                </div>
                                <Link 
                                    to="/doctors" 
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all"
                                >
                                    Start finding a specialist
                                    <ArrowRight size={20} />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'Profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <header>
                            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Profile Settings</h1>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your personal information and contact details.</p>
                        </header>

                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                            <div className="glass p-8 rounded-[3rem] shadow-sm space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <img 
                                        src={user?.image || "https://i.pravatar.cc/150?u=marcus"} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-[2.5rem] object-cover ring-4 ring-white dark:ring-slate-800 shadow-2xl"
                                    />
                                    <div className="space-y-2 text-center md:text-left">
                                        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{user?.name}</h2>
                                        <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">{user?.memberStatus}</p>
                                        <p className="text-slate-500 dark:text-slate-500 text-sm">Member since April 2024</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 pt-4">
                                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{user?.email}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{user?.phone}</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-blue-100/20"
                                    >
                                        <Edit3 size={20} />
                                        Update Profile Information
                                    </button>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-[3rem] shadow-sm space-y-6">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <Mail className="text-blue-600" />
                                    Communication Prefs
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-800 dark:text-slate-100">In-App Notifications</p>
                                            <p className="text-xs text-slate-500">Receive real-time alerts on your dashboard.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-800 dark:text-slate-100">Email Reminders</p>
                                            <p className="text-xs text-slate-500">Get appointment alerts in your inbox.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest pt-4">
                                    Auto-reminders are sent 24h before sessions
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'Inbox' && (
                    <motion.div
                        key="inbox"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <header>
                            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Digital Inbox</h1>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Archive of all email and app notifications sent to {user?.email}.</p>
                        </header>

                        {notifications.length > 0 ? (
                            <div className="divide-y divide-white/10 glass rounded-[3rem] overflow-hidden">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-8 hover:bg-white/40 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-6 ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                            n.type === 'success' ? 'bg-green-100 text-green-600' : 
                                            n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            <Mail size={24} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{n.title}</h3>
                                                <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">{new Date(n.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                {n.message}
                                            </p>
                                            {!n.read && (
                                                <button 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-xs font-bold text-blue-600 hover:underline pt-2 inline-block"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass p-24 rounded-[4rem] text-center space-y-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                                    <Mail size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Your inbox is clear</h2>
                            </div>
                        )}
                    </motion.div>
                )}

                {['Medical Records', 'Prescriptions', 'Billing'].includes(activeTab) && (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass p-24 rounded-[4rem] text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-300">
                            <LayoutDashboard size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-800">{activeTab} Coming Soon</h2>
                            <p className="text-slate-500 font-medium">We are building this feature as part of your digital health locker.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {appointmentToCancel && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="glass w-full max-w-sm p-8 rounded-[3rem] shadow-2xl text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                        <AlertTriangle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cancel Appointment?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Are you sure you want to cancel your session with <strong>{appointmentToCancel.doctor?.name}</strong>? This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            disabled={isCancelling}
                            className="flex-1 py-4 glass rounded-[1.5rem] font-bold text-slate-600 hover:bg-white/50 transition-all disabled:opacity-50"
                        >
                            Wait, No
                        </button>
                        <button 
                            onClick={handleCancelAppointment}
                            disabled={isCancelling}
                            className="flex-1 py-4 bg-rose-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isCancelling ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : 'Yes, Cancel'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}

        {isEditing && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="glass w-full max-w-md p-8 rounded-[3rem] shadow-2xl relative"
                >
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Edit Profile</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Update your account information.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest px-2">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-6 py-4 glass rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest px-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-6 py-4 glass rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest px-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    required
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-6 py-4 glass rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200"
                                    placeholder="+39 123 456 7890"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-4 glass rounded-[1.5rem] font-bold text-slate-600 hover:bg-white/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
