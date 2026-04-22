import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Doctor, UserProfile } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, ChevronRight, User, Stethoscope, ArrowRight, Edit3, X, Save, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function Dashboard() {
  const [appointments, setAppointments] = useState<(Appointment & { doctor?: Doctor })[]>([]);
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.memberStatus}</p>
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bookings</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-blue-600">0</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alerts</p>
                    </div>
                </div>
            </div>

            <nav className="glass p-4 rounded-[2.5rem] shadow-sm space-y-2">
                {['Appointments', 'Medical Records', 'Prescriptions', 'Billing'].map((item, i) => (
                    <button 
                        key={item}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all ${
                            i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100/20' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600'
                        }`}
                    >
                        {item}
                        <ChevronRight size={18} />
                    </button>
                ))}
            </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Active Bookings</h1>
                <Link to="/doctors" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100/20">
                    <Stethoscope size={18} />
                    New Visit
                </Link>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 glass rounded-[2.5rem] animate-pulse" />)}
                </div>
            ) : appointments.length > 0 ? (
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
                                <button className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
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
        </div>
      </div>

      <AnimatePresence>
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Full Name</label>
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Email Address</label>
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Phone Number</label>
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
