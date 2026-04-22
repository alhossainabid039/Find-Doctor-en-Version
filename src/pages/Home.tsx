import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Clock, Award, Star, MessageSquare, Heart, Brain, Activity, Zap, Siren, X, MapPin, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Doctor } from '../types';

export function Home() {
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [emergencyDoctors, setEmergencyDoctors] = useState<Doctor[]>([]);
  const [loadingEmergency, setLoadingEmergency] = useState(false);

  const triggerChat = (symptom: string) => {
    window.dispatchEvent(new CustomEvent('open-chat', { detail: { message: symptom } }));
  };

  const handleEmergency = async () => {
    setIsEmergencyOpen(true);
    setLoadingEmergency(true);
    try {
      const res = await fetch('/api/doctors');
      const allDoctors: Doctor[] = await res.json();
      
      // Prioritize General Physicians, then sort by rating/availability
      const suggestions = allDoctors.sort((a, b) => {
        const aIsGP = a.specialization === 'General Physician';
        const bIsGP = b.specialization === 'General Physician';
        if (aIsGP && !bIsGP) return -1;
        if (!aIsGP && bIsGP) return 1;
        return b.rating - a.rating;
      });
      
      setEmergencyDoctors(suggestions.slice(0, 3)); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmergency(false);
    }
  };

  return (
    <div className="space-y-24 pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Emergency Modal */}
      <AnimatePresence>
        {isEmergencyOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmergencyOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-center text-rose-600">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center animate-pulse">
                      <Siren size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Rapid Response</h2>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80">Immediate GP Suggestion</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEmergencyOpen(false)}
                    className="p-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {loadingEmergency ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-rose-600 animate-pulse">Searching for available doctors...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencyDoctors.length > 0 ? (
                      emergencyDoctors.map((doc, idx) => (
                        <motion.div 
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`glass p-5 rounded-3xl border border-white/20 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-shadow border-l-4 ${idx === 0 ? 'border-l-blue-600 bg-blue-50/20 dark:bg-blue-900/10' : 'border-l-rose-500'}`}
                        >
                          <div className="relative">
                            <img src={doc.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt={doc.name} />
                            {idx === 0 && (
                                <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg animate-bounce">
                                    BEST MATCH
                                </div>
                            )}
                          </div>
                          <div className="flex-1 text-center md:text-left space-y-1">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{doc.name}</h3>
                                {doc.specialization === 'General Physician' && (
                                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-md text-[8px] font-black uppercase">Fast Care</span>
                                )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{doc.specialization} • {doc.experience}Y Exp</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-600" /> {doc.location}</span>
                              <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {doc.rating}</span>
                              <span className={`flex items-center gap-1 font-bold ${doc.slots.length > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                {doc.slots.length > 0 ? 'Available' : 'Fully Booked'}
                              </span>
                            </div>
                          </div>
                          {doc.slots.length > 0 ? (
                            <Link 
                              to={`/doctors/${doc.id}`}
                              className={`w-full md:w-auto px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                                  idx === 0 
                                  ? 'bg-blue-600 text-white shadow-blue-200/40 hover:bg-blue-700' 
                                  : 'bg-rose-600 text-white shadow-rose-200/40 hover:bg-rose-700'
                              }`}
                            >
                              Book Now
                              <ArrowRight size={16} />
                            </Link>
                          ) : (
                            <button 
                              disabled
                              className="w-full md:w-auto px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              Full
                              <X size={16} />
                            </button>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No immediate GPs found. Please try our general search.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-4">
                  <p className="text-xs text-slate-500 font-medium text-center italic">
                    In case of life-threatening emergencies, please call your local emergency number (e.g., 911) immediately.
                  </p>
                  <Link 
                    to="/doctors" 
                    onClick={() => setIsEmergencyOpen(false)}
                    className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2"
                  >
                    View all medical departments
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="px-6 pt-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center border-l-8 border-l-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-1 bg-blue-600 rounded-full" />
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Smart Healthcare Platform</p>
              </div>
              <h1 className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 leading-[1.1] mb-4">
                Smart Care,<br />
                <span className="text-blue-600">Matched to You.</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">
                Describe your symptoms to our AI. We'll find the perfect specialist for your recovery.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 px-2">
              <Link
                to="/doctors"
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100/20"
              >
                Find a Doctor
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => triggerChat("")}
                className="px-8 py-4 glass text-blue-600 rounded-2xl font-bold flex items-center gap-3 hover:bg-white/50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                Chat with AI
                <MessageSquare size={20} />
              </button>
              <button
                onClick={handleEmergency}
                className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-700 animate-pulse transition-all shadow-lg shadow-rose-200/40"
              >
                EMERGENCY
                <Siren size={20} className="animate-pulse" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative z-10 glass p-3 rounded-[3rem] shadow-2xl shadow-blue-500/10">
              <img
                src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=1200&auto=format&fit=crop"
                alt="Healthcare"
                className="w-full aspect-[4/5] object-cover rounded-[2.5rem]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Symptom Scanner Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tight">AI Symptom Scanner</h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">Select a category to start your AI-guided consultation. Your path to recovery starts with a conversation.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { name: 'Chest Pain', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
                    { name: 'Headaches', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                    { name: 'Fever/Cough', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { name: 'Skin Rash', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
                ].map((symptom) => (
                    <motion.button
                        key={symptom.name}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => triggerChat(`I am experiencing ${symptom.name.toLowerCase()}`)}
                        className="glass p-8 rounded-[3rem] shadow-sm flex flex-col items-center text-center gap-6 group cursor-pointer border border-transparent hover:border-blue-500/30 transition-all duration-300"
                    >
                        <div className={`w-20 h-20 ${symptom.bg} rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner group-hover:rotate-6`}>
                            <symptom.icon className={symptom.color} size={36} />
                        </div>
                        <h4 className="font-bold text-lg">{symptom.name}</h4>
                    </motion.button>
                ))}
            </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Clock className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">24/7 AI Assistance</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Our AI specialized system is available around the clock to analyze your symptoms and guide you.</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] shadow-sm space-y-4 border-l-4 border-l-blue-500">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                    <Award className="text-indigo-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Verified Specialists</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">We host only the top-rated specialists with minimum 5+ years of clinical experience.</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Secure Booking</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Your data and appointments are protected with enterprise-level encryption and privacy.</p>
            </div>
      </section>
    </div>
  );
}
