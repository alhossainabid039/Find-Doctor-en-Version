import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Clock, Award, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="space-y-24 pb-24">
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
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Find a Doctor
                <ArrowRight size={20} />
              </Link>
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
