import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Clock, Award, Star, MessageSquare, Heart, Brain, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const triggerChat = (symptom: string) => {
    window.dispatchEvent(new CustomEvent('open-chat', { detail: { message: symptom } }));
  };

  return (
    <div className="space-y-24 pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="px-6 pt-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
              <h1 className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 leading-[1.1] mb-4">
                Smart Care,<br />
                <span className="text-blue-600">Matched to You.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md">
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
                className="px-8 py-4 glass text-blue-600 rounded-2xl font-bold flex items-center gap-3 hover:bg-white/50 transition-all shadow-sm"
              >
                Chat with AI
                <MessageSquare size={20} />
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
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">Select a category to start your AI-guided consultation. Your path to recovery starts with a conversation.</p>
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
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Our AI specialized system is available around the clock to analyze your symptoms and guide you.</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] shadow-sm space-y-4 border-l-4 border-l-blue-500">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                    <Award className="text-indigo-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Verified Specialists</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">We host only the top-rated specialists with minimum 5+ years of clinical experience.</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Secure Booking</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Your data and appointments are protected with enterprise-level encryption and privacy.</p>
            </div>
      </section>
    </div>
  );
}
