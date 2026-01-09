import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Music, X, Clock, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Fes1 from '../assets/fes1.jpg';
import Fest2 from '../assets/fest2.jpg';
import Fest3 from '../assets/fest3.jpg';

const Festival = () => {
    // ==========================================
    // IMAGE CONFIGURATION
    // ==========================================
    const FESTIVAL_IMAGES = {
        hero: Fes1,
        gallery: [
            {
                url: Fes1,
                title: "Festival Opening"
            },
            {
                url: Fest2,
                title: "Cultural Display"
            },
            {
                url: Fest3,
                title: "Community Gathering"
            }
        ]
    };
    const programLineup = [
        { day: "Day 1: Mon, Feb 2", title: "Launch & Cleanup Exercise", time: "6:00 AM", desc: "Official launch followed by community cleanup across all major suburbs." },
        { day: "Day 2: Tue, Feb 3", title: "Health Walk & Screening", time: "7:00 AM", desc: "A morning fitness walk and free health checks for all residents." },
        { day: "Day 3: Wed, Feb 4", title: "Traditional Games & Quiz", time: "10:00 AM", desc: "Inter-school quizzes and traditional games like Oware and Ampe." },
        { day: "Day 4: Thu, Feb 5", title: "Ancestral Rites", time: "5:00 AM", desc: "Sacred rituals and pouring of libation to honor the ancestors." },
        { day: "Day 5: Fri, Feb 6", title: "Cultural Night", time: "7:00 PM", desc: "A vibrant showcase of traditional drumming, dancing, and fashion." },
        { day: "Day 6: Sat, Feb 7", title: "Grand Durbar", time: "9:00 AM", desc: "The climax of the festival with chiefs in full regalia and royal processions." },
        { day: "Day 7: Sun, Feb 8", title: "Thanksgiving Service", time: "9:00 AM", desc: "A multi-faith gathering to thank the Almighty for a successful celebration." }
    ];
    // ==========================================

    const [daysLeft, setDaysLeft] = useState(0);
    const [showLineup, setShowLineup] = useState(false);

    useEffect(() => {
        const calculateDaysLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            let targetDate = new Date(currentYear, 1, 1);

            if (now > targetDate) {
                targetDate = new Date(currentYear + 1, 1, 1);
            }

            const difference = targetDate.getTime() - now.getTime();
            const days = Math.ceil(difference / (1000 * 3600 * 24));
            setDaysLeft(days);
        };

        calculateDaysLeft();
        const timer = setInterval(calculateDaysLeft, 1000 * 60 * 60);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-afife-primary/90 to-black z-10"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay z-0"
                    style={{ backgroundImage: `url('${FESTIVAL_IMAGES.hero}')` }}
                ></div>

                <div className="container mx-auto px-4 relative z-20 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">Nyigbla Festival</h1>
                        <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto">
                            Celebrating Unity, Culture, and Development.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3">
                        <h2 className="font-heading text-3xl font-bold text-afife-accent mb-6">About the Festival</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Nyigblaza is the annual festival of the chiefs and people of Afife Traditional Area.
                            It serves as a period of homecoming for citizens both home and abroad to bond,
                            reconnect with their roots, and contribute to the development of the state.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <Calendar className="text-afife-secondary w-8 h-8" />
                                <div>
                                    <h4 className="font-bold text-lg">When</h4>
                                    <p className="text-gray-600">Held annually in the first week of February.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <MapPin className="text-afife-secondary w-8 h-8" />
                                <div>
                                    <h4 className="font-bold text-lg">Where</h4>
                                    <p className="text-gray-600">Afife Durbar Grounds.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/3 bg-white p-8 rounded-2xl shadow-xl border-t-8 border-afife-primary h-fit">
                        <h3 className="font-heading text-2xl font-bold mb-4">Upcoming Event</h3>
                        <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
                            <span className="block text-5xl font-bold text-afife-primary mb-1">{daysLeft}</span>
                            <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Days to Go</span>
                        </div>
                        <h4 className="font-bold text-xl mb-2 text-afife-accent">Grand Durbar {new Date().getFullYear() + (daysLeft > 300 ? 1 : 0)}</h4>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">Join us for the climax of the festival features cultural displays, drumming, and dancing.</p>
                        <button
                            onClick={() => setShowLineup(true)}
                            className="w-full py-4 bg-afife-secondary text-afife-accent rounded-lg font-bold hover:bg-afife-primary hover:text-white transition-all transform hover:-translate-y-1 shadow-lg"
                        >
                            View Program Lineup
                        </button>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-heading text-4xl font-bold text-afife-accent mb-4">Festival Gallery</h2>
                    <p className="text-gray-500 mb-12 max-w-xl mx-auto">Relive the beautiful moments from previous Nyiglaza celebrations.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {FESTIVAL_IMAGES.gallery.map((img, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="aspect-square rounded-2xl overflow-hidden relative group shadow-md"
                            >
                                <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <div className="text-white font-bold text-left">
                                        <p className="text-xs text-afife-secondary uppercase tracking-widest mb-1">Moment</p>
                                        <h4 className="text-lg">{img.title}</h4>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Lineup Modal */}
            <AnimatePresence>
                {showLineup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLineup(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="bg-afife-primary p-6 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-2xl font-bold font-heading">Festival Program Lineup</h3>
                                    <p className="text-white/70 text-sm">First Week of February {new Date().getFullYear() + (daysLeft > 300 ? 1 : 0)}</p>
                                </div>
                                <button
                                    onClick={() => setShowLineup(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-4 bg-gray-50 text-left">
                                {programLineup.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:shadow-md transition-all"
                                    >
                                        <div className="shrink-0">
                                            <div className="w-12 h-12 bg-afife-secondary/20 rounded-xl flex items-center justify-center text-afife-secondary font-bold">
                                                {idx + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                <span className="text-xs font-black text-afife-primary uppercase tracking-widest">{item.day}</span>
                                                <div className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                                                    <Clock size={12} />
                                                    {item.time}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-lg mb-1">{item.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-white border-t border-gray-100 shrink-0 text-center">
                                <p className="text-xs text-gray-400">
                                    * Dates and times are subject to change by the Traditional Council.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Festival;
