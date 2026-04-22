import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Doctor } from '../types';
import { Search, MapPin, Star, Filter, ArrowRight, User, X, DollarSign, ChevronDown, Trash2 } from 'lucide-react';

export function Doctors() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: 'All',
    maxFee: 500,
    minRating: 0
  });
  
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setIsFilterOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const locations = ['All', ...new Set(doctors.map(d => d.location))];

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filters.location === 'All' || d.location === filters.location;
    const matchesFee = d.fee <= filters.maxFee;
    const matchesRating = d.rating >= filters.minRating;

    return matchesSearch && matchesLocation && matchesFee && matchesRating;
  });

  const resetFilters = () => {
    setFilters({
        location: 'All',
        maxFee: 500,
        minRating: 0
    });
    setSearchTerm('');
  };

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
        
        <div className="flex flex-col md:flex-row gap-4 relative">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name, clinic, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 glass rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200"
                />
            </div>
            <div className="relative">
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${
                        isFilterOpen || filters.location !== 'All' || filters.minRating > 0 || filters.maxFee < 500
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'glass text-slate-700 dark:text-slate-200 hover:bg-white/50'
                    }`}
                >
                    <Filter size={20} />
                    Filters
                    {(filters.location !== 'All' || filters.minRating > 0 || filters.maxFee < 500) && (
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    )}
                    <ChevronDown size={16} className={`transition-transform duration-500 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isFilterOpen && (
                        <>
                            {/* Backdrop for mobile */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFilterOpen(false)}
                                className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] z-40 md:hidden"
                            />
                            
                            <motion.div 
                                ref={filterRef}
                                initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="absolute right-0 top-full mt-4 w-[22rem] glass p-8 rounded-[3rem] shadow-2xl z-50 border border-black/5 dark:border-white/10 space-y-8"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-slate-100 text-lg uppercase tracking-tight">Advanced Filters</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Refine your search results</p>
                                    </div>
                                    <button 
                                        onClick={resetFilters} 
                                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 rounded-full transition-colors"
                                        title="Reset All"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Location Filter */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 flex items-center gap-2">
                                        <MapPin size={12} className="text-blue-600" />
                                        Primary Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                        {locations.map(loc => (
                                            <button
                                                key={loc}
                                                onClick={() => setFilters(prev => ({ ...prev, location: loc }))}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-left border-2 ${
                                                    filters.location === loc 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                                                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fee Range */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 flex items-center gap-2">
                                            <DollarSign size={12} className="text-blue-600" />
                                            Max Fee
                                        </label>
                                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">${filters.maxFee}</span>
                                    </div>
                                    <div className="relative pt-2">
                                        <input 
                                            type="range" 
                                            min="50" 
                                            max="500" 
                                            step="50"
                                            value={filters.maxFee}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxFee: Number(e.target.value) }))}
                                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-[8px] font-bold text-slate-400 pt-2 uppercase tracking-widest">
                                            <span>$50</span>
                                            <span>$500</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 flex items-center gap-2">
                                        <Star size={12} className="text-blue-600" />
                                        User Satisfaction
                                    </label>
                                    <div className="flex gap-2">
                                        {[0, 3, 4, 4.5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                                                className={`flex-1 py-3 rounded-2xl text-[10px] font-bold transition-all border-2 ${
                                                    filters.minRating === rating 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                                                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                {rating === 0 ? 'ANY' : `${rating}★+`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                >
                                    Apply Changes
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Active Filters Section */}
        <AnimatePresence>
            {(filters.location !== 'All' || filters.minRating > 0 || filters.maxFee < 500 || searchTerm) && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 overflow-hidden"
                >
                    <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Active Filters:
                    </div>
                    {searchTerm && (
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                            Search: {searchTerm}
                            <button onClick={() => setSearchTerm('')}><X size={12} /></button>
                        </span>
                    )}
                    {filters.location !== 'All' && (
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-[10px] font-bold border border-rose-100 dark:border-rose-800">
                            {filters.location}
                            <button onClick={() => setFilters(p => ({ ...p, location: 'All' }))}><X size={12} /></button>
                        </span>
                    )}
                    {filters.maxFee < 500 && (
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl text-[10px] font-bold border border-amber-100 dark:border-amber-800">
                            Max ${filters.maxFee}
                            <button onClick={() => setFilters(p => ({ ...p, maxFee: 500 }))}><X size={12} /></button>
                        </span>
                    )}
                    {filters.minRating > 0 && (
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl text-[10px] font-bold border border-yellow-100 dark:border-yellow-800">
                            {filters.minRating}★+
                            <button onClick={() => setFilters(p => ({ ...p, minRating: 0 }))}><X size={12} /></button>
                        </span>
                    )}
                    <button 
                        onClick={resetFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-rose-500 transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        <Trash2 size={12} /> Clear
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
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
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                                    {doc.specialization} • {doc.experience}Y Exp<br />
                                    <span className="text-blue-600 dark:text-blue-400">{doc.hospital}</span>
                                </p>
                            </div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                            doc.slots.length > 0 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                        }`}>
                            {doc.slots.length > 0 ? 'Available' : 'Fully Booked'}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                            <MapPin size={14} />
                            {doc.location}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold underline">
                            <Star size={12} fill="currentColor" />
                            {doc.rating} ({20 + doc.slots.length * 5} Reviews)
                        </div>
                    </div>

                    {doc.slots.length > 0 ? (
                        <Link 
                            to={`/doctors/${doc.id}`}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-blue-100 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            Book Appointment
                            <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <button 
                            disabled
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 py-3.5 rounded-2xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            No Slots Available
                        </button>
                    )}
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
