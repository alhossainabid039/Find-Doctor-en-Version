import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Doctor } from '../types';
import { ArrowLeft, Star, MapPin, Clock, Award, ShieldCheck, CheckCircle2, ChevronRight, User, Stethoscope } from 'lucide-react';

export function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch(`/api/doctors/${id}`);
        const data = await res.json();
        setDoctor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [id]);

  const handleBook = async () => {
    if (!selectedSlot || !doctor) return;
    setIsBooking(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          slot: selectedSlot,
          patientName: "John Doe", // Mock name
          patientEmail: "john@example.com"
        })
      });
      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-24 space-y-8 animate-pulse">
        <div className="h-48 bg-neutral-200 rounded-[3rem]" />
        <div className="h-12 w-64 bg-neutral-200 rounded-xl" />
        <div className="h-32 bg-neutral-200 rounded-[2rem]" />
    </div>
  );

  if (!doctor) return <div>Doctor not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-neutral-500 hover:text-blue-600 transition-colors font-medium group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to search
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile */}
        <div className="lg:col-span-2 space-y-8">
            <header className="glass p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start transition-all">
                <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-48 h-48 rounded-[2.5rem] object-cover shadow-22xl shadow-blue-500/10 border-4 border-white dark:border-slate-800"
                />
                <div className="flex-1 space-y-4 text-center md:text-left pt-2">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{doctor.name}</h1>
                            <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={14} />
                                Verified
                            </div>
                        </div>
                        <p className="text-lg font-bold text-blue-600 uppercase tracking-wide italic">{doctor.specialization}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <MapPin size={18} />
                            <span className="text-sm font-semibold">{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Clock size={18} />
                            <span className="text-sm font-semibold">{doctor.experience}Yrs Exp</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-500 font-bold underline">
                            <Star size={16} fill="currentColor" />
                            {doctor.rating} Reviews
                        </div>
                    </div>
                </div>
            </header>

            <section className="glass p-8 rounded-[3rem] shadow-sm space-y-6 border-l-4 border-l-blue-500">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
                    <Stethoscope className="text-blue-600" size={24} />
                    Expert Introduction
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {doctor.name} is a highly skilled {doctor.specialization} at {doctor.hospital}. With over {doctor.experience} years of experience, they provide top-tier care with a focus on smart recovery.
                </p>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-3xl glass border border-white/50 dark:border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-sm">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Consultation Fee</p>
                            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">${doctor.fee}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-3xl glass border border-white/50 dark:border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Response Time</p>
                            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">&lt; 15 Mins</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Right Column: Booking */}
        <div className="space-y-6">
            <div className="sticky top-24 glass p-8 rounded-[3rem] shadow-xl space-y-8 border-2 border-white dark:border-slate-800 transition-colors">
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs transition-colors">Select Available Slot</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {doctor.slots.map(slot => (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-4 rounded-2xl font-bold text-xs transition-all border-2 ${
                                    selectedSlot === slot 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                                        : 'glass text-slate-600 dark:text-slate-300 border-transparent hover:border-blue-600 hover:text-blue-600 shadow-none'
                                }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Consultation Fee</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">${doctor.fee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Booking Fee</span>
                        <span className="text-slate-800 dark:text-slate-100 font-bold">$5.00</span>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-700">
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total</span>
                        <span className="text-2xl font-black text-blue-600">${doctor.fee + 5}</span>
                    </div>
                </div>

                <button
                    onClick={handleBook}
                    disabled={!selectedSlot || isBooking || bookingSuccess}
                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group shadow-lg shadow-blue-100/20"
                >
                    <span className={isBooking ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                        {bookingSuccess ? 'Booking Confirmed!' : 'Book Appointment'}
                    </span>
                    {isBooking && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </button>

                <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest font-bold">
                    Secure Payment & Free Cancellation
                </p>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {bookingSuccess && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-xl flex items-center justify-center p-6 text-center"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md space-y-8"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-500/10">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-neutral-900 tracking-tight">Appointment <br /> Confirmed!</h2>
                        <p className="text-neutral-600 font-medium">Your session with {doctor.name} at {selectedSlot} is locked in. You'll receive a confirmation email shortly.</p>
                    </div>
                    <div className="pt-4">
                        <div className="inline-flex items-center gap-2 text-blue-600 font-bold animate-pulse">
                            Redirecting to dashboard
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
