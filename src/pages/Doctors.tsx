import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Doctor } from '../types';
import { Search, MapPin, Star, Filter, ArrowRight, User } from 'lucide-react';

export function Doctors() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const querySpec = searchParams.get('specialization');

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const url = querySpec 
            ? `/api/doctors?specialization=${querySpec}` 
            : '/api/doctors';
        const res = await fetch(url);
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [querySpec]);

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12">
      <header className="space-y-6">
        <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-800 dark:text-slate-100"
        >
            {querySpec ? `Specialists in ${querySpec}` : 'Find Your Specialist'}
        </motion.h1>
        
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 glass rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200"
                />
            </div>
            <button className="flex items-center gap-2 px-6 py-4 glass rounded-2xl text-slate-700 dark:text-slate-200 font-bold hover:bg-white/50 transition-colors">
                <Filter size={20} />
                Filters
            </button>
        </div>
      </header>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-80 glass rounded-3xl animate-pulse" />
            ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc, i) => (
                <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ delay: i * 0.1 }}
                    className="group glass p-5 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col space-y-4 border-l-4 border-l-blue-500"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img 
                                    src={doc.image} 
                                    alt={doc.name} 
                                    className="w-16 h-16 rounded-2xl object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{doc.name}</h3>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {doc.specialization} • {doc.experience}Y Exp
                                </p>
                            </div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                            Available
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                            <MapPin size={14} />
                            {doc.location}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold underline">
                            <Star size={12} fill="currentColor" />
                            {doc.rating} (432 Reviews)
                        </div>
                    </div>

                    <Link 
                        to={`/doctors/${doc.id}`}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-blue-100 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        Book Appointment
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>
            ))}
        </div>
      )}

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-24 space-y-6">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Search size={48} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">No doctors found</h2>
            <p className="text-neutral-500 max-w-md mx-auto">Try adjusting your filters or search terms to find the right specialist.</p>
            <button 
                onClick={() => setSearchTerm('')}
                className="px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold"
            >
                View All Doctors
            </button>
        </div>
      )}
    </div>
  );
}
