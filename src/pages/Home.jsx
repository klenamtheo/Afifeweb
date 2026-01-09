import { motion, AnimatePresence, useSpring, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Calendar, Users, Heart, Clock, MapPin, TrendingUp, ShoppingBag, Quote, Info, ExternalLink, UserCheck, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const spring = useSpring(0, { stiffness: 30, damping: 15 });
    const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return <motion.span ref={ref}>{display}</motion.span>;
};

const Home = () => {
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [marketItems, setMarketItems] = useState([]);
    const [stats, setStats] = useState({
        projects: 0,
        businesses: 0,
        events: 0,
        population: {
            total: 15240,
            males: 7420,
            females: 7820
        }
    });
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (events.length > 0) {
            const interval = setInterval(() => {
                setCurrentEventIndex((prev) => (prev + 1) % events.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [events.length]);

    useEffect(() => {
        if (news.length > 0) {
            const interval = setInterval(() => {
                setCurrentNewsIndex((prev) => (prev + 1) % news.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [news.length]);

    useEffect(() => {
        setLoading(true);

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 6000); // 6s safety timeout

        const queries = {
            alerts: query(collection(db, 'alerts'), where('active', '==', true), orderBy('createdAt', 'desc')),
            news: query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3)),
            events: query(collection(db, 'events'), orderBy('date', 'asc'), limit(3)),
            projects: query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(3)),
            market: query(collection(db, 'market'), orderBy('createdAt', 'desc'), limit(4))
        };

        const handleSnapError = (err, collectionName) => {
            console.error(`Error in ${collectionName} snapshot:`, err);
            setLoading(false);
        };

        const unsubscribers = [
            onSnapshot(queries.alerts, (snap) => {
                setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => handleSnapError(err, 'alerts')),
            onSnapshot(queries.news, (snap) => {
                setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => handleSnapError(err, 'news')),
            onSnapshot(queries.events, (snap) => {
                setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => handleSnapError(err, 'events')),
            onSnapshot(queries.projects, (snap) => {
                setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => handleSnapError(err, 'projects')),
            onSnapshot(queries.market, (snap) => {
                setMarketItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
                clearTimeout(timeout);
            }, (err) => handleSnapError(err, 'market'))
        ];

        // Real-time Stats Listeners
        const unsubStats = [
            onSnapshot(collection(db, 'projects'), (snap) => {
                setStats(prev => ({ ...prev, projects: snap.size }));
            }, (err) => console.error("Stats Error:", err)),
            onSnapshot(collection(db, 'directory'), (snap) => {
                setStats(prev => ({ ...prev, businesses: snap.size }));
            }, (err) => console.error("Stats Error:", err)),
            onSnapshot(collection(db, 'events'), (snap) => {
                setStats(prev => ({ ...prev, events: snap.size }));
            }, (err) => console.error("Stats Error:", err))
        ];

        return () => {
            unsubscribers.forEach(unsub => unsub());
            unsubStats.forEach(unsub => unsub());
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Image Placeholder - using a gradient for now, can be replaced or overlaid */}
                <div className="absolute inset-0 bg-gradient-to-br from-afife-primary/90 to-black z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542642836-6467027581ba?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay z-0"></div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="font-heading font-bold text-5xl md:text-7xl mb-6 leading-tight">
                            Welcome to <span className="text-afife-secondary">Afife</span>
                        </h1>
                        <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto mb-10 text-gray-200">
                            A vibrant community embracing heritage, growth, and unity. Discover our culture, connect with our people, and build our future.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Link to="/about" className="px-8 py-4 bg-afife-secondary text-afife-accent font-bold rounded-lg hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2">
                                Explore Our Heritage <ArrowRight size={20} />
                            </Link>
                            <Link to="/marketplace" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center">
                                Visit Marketplace
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Alerts Ticker */}
            <AnimatePresence>
                {alerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-600 text-white py-2 overflow-hidden relative z-20"
                    >
                        <div className="container mx-auto px-4 flex items-center">
                            <div className="flex items-center gap-2 font-black uppercase text-xs tracking-tighter bg-white text-red-600 px-2 py-1 rounded mr-4 whitespace-nowrap">
                                <Info size={14} /> Breaking
                            </div>
                            <div className="flex-1 overflow-hidden relative h-6">
                                <motion.div
                                    animate={{ x: [0, -1000] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 30,
                                        ease: "linear"
                                    }}
                                    className="flex gap-12 whitespace-nowrap absolute"
                                >
                                    {alerts.map((alert) => (
                                        <span key={alert.id} className="font-bold flex items-center gap-2">
                                            {alert.message} •
                                        </span>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {alerts.map((alert) => (
                                        <span key={`${alert.id}-loop`} className="font-bold flex items-center gap-2">
                                            {alert.message} •
                                        </span>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Town Pulse Statistics */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-around gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-5xl font-black text-afife-primary mb-2">
                                <AnimatedNumber value={stats.projects} />+
                            </div>
                            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Community Projects</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-5xl font-black text-afife-secondary mb-2">
                                <AnimatedNumber value={stats.businesses} />+
                            </div>
                            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Local Businesses</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-5xl font-black text-afife-accent mb-2">
                                <AnimatedNumber value={stats.events} />+
                            </div>
                            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Annual Events</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Community Demographics Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <span className="text-afife-primary font-black uppercase tracking-[0.2em] text-xs mb-3 block">Community Growth</span>
                        <h2 className="font-heading text-4xl md:text-4xl font-bold text-afife-accent mb-6">Demographics & Population</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Afife continues to thrive as a hub of culture and community. Here is a snapshot of our growing population of native citizens and residents.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
                        {/* Total Population */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-afife-primary/5 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="relative bg-white/40 backdrop-blur-md border border-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 text-center">
                                <div className="w-16 h-16 bg-afife-primary/10 rounded-2xl flex items-center justify-center text-afife-primary mx-auto mb-6 transform -rotate-3 group-hover:rotate-0 transition-transform">
                                    <Users size={32} />
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-afife-accent mb-2">
                                    <AnimatedNumber value={stats.population.total} />
                                </div>
                                <div className="text-afife-primary font-black uppercase tracking-widest text-[10px]">Total Population</div>
                            </div>
                        </motion.div>

                        {/* Males */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-blue-50 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="relative bg-white/40 backdrop-blur-md border border-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 transform rotate-3 group-hover:rotate-0 transition-transform">
                                    <UserCheck size={32} />
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-afife-accent mb-2">
                                    <AnimatedNumber value={stats.population.males} />
                                </div>
                                <div className="text-blue-500 font-black uppercase tracking-widest text-[10px]">Native Males</div>
                            </div>
                        </motion.div>

                        {/* Females */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-pink-50 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="relative bg-white/40 backdrop-blur-md border border-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 text-center">
                                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mx-auto mb-6 transform -rotate-3 group-hover:rotate-3 transition-transform">
                                    <Baby size={32} />
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-afife-accent mb-2">
                                    <AnimatedNumber value={stats.population.females} />
                                </div>
                                <div className="text-pink-500 font-black uppercase tracking-widest text-[10px]">Native Females</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Traditional Council */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                    >
                        <div className="w-14 h-14 bg-afife-primary/10 rounded-full flex items-center justify-center text-afife-primary mb-6">
                            <Users size={28} />
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-3 text-afife-accent">Traditional Council</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Meet our leaders and learn about the governance structure guiding Afife's development and preserving our customs.
                        </p>
                        <Link to="/council" className="text-afife-primary font-semibold hover:text-afife-secondary flex items-center gap-1">
                            Meet the Elders <ArrowRight size={16} />
                        </Link>
                    </motion.div>

                    {/* Card 2: Nyiglaza Festival */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                    >
                        <div className="w-14 h-14 bg-afife-secondary/10 rounded-full flex items-center justify-center text-afife-secondary mb-6">
                            <Calendar size={28} />
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-3 text-afife-accent">Nyiglaza Festival</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Experience the vibrant colors, drum beats, and unity of our annual Nyiglaza festival. A celebration of our history.
                        </p>
                        <Link to="/festival" className="text-afife-secondary font-semibold hover:text-afife-primary flex items-center gap-1">
                            Discover Festival <ArrowRight size={16} />
                        </Link>
                    </motion.div>

                    {/* Card 3: Support / Donate */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                    >
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6">
                            <Heart size={28} />
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-3 text-afife-accent">Support Projects</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Contribute to ongoing community projects. Your donation helps build better infrastructure and opportunities.
                        </p>
                        <Link to="/donate" className="text-red-500 font-semibold hover:text-red-600 flex items-center gap-1">
                            Make a Donation <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-afife-secondary font-bold uppercase tracking-wider text-sm">Mark Your Calendar</span>
                            <h2 className="font-heading text-4xl font-bold text-afife-accent mt-2">Upcoming Events</h2>
                        </div>
                        <Link to="/events" className="hidden md:flex items-center gap-2 text-afife-primary font-medium hover:text-afife-secondary">
                            View all events <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="relative overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-64"></div>
                                ))}
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                <p className="text-gray-400">No upcoming events at the moment.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={events[currentEventIndex].id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center"
                                    >
                                        {events[currentEventIndex].imageUrl && (
                                            <div className="w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-inner">
                                                <img
                                                    src={events[currentEventIndex].imageUrl}
                                                    alt={events[currentEventIndex].title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className={`w-full ${events[currentEventIndex].imageUrl ? 'md:w-1/2' : 'max-w-2xl mx-auto text-center'}`}>
                                            <div className={`flex items-center gap-3 mb-6 ${!events[currentEventIndex].imageUrl && 'justify-center'}`}>
                                                <div className="bg-afife-primary/10 text-afife-primary p-3 rounded-xl">
                                                    <Calendar size={28} />
                                                </div>
                                                <span className="bg-purple-100 text-purple-700 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                                    {events[currentEventIndex].type || 'Community'}
                                                </span>
                                            </div>

                                            <h3 className="font-heading text-3xl md:text-4xl font-black text-afife-accent mb-4 leading-tight">
                                                {events[currentEventIndex].title}
                                            </h3>

                                            <div className={`flex flex-wrap gap-4 mb-6 text-sm font-bold text-gray-500 ${!events[currentEventIndex].imageUrl && 'justify-center'}`}>
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                    <Clock size={16} className="text-afife-secondary" /> {events[currentEventIndex].time}
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                    <MapPin size={16} className="text-afife-primary" /> {events[currentEventIndex].location}
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg underline text-afife-accent">
                                                    {events[currentEventIndex].date}
                                                </div>
                                            </div>

                                            <p className="text-gray-500 mb-8 text-lg leading-relaxed line-clamp-3">
                                                {events[currentEventIndex].description}
                                            </p>

                                            <div className={`flex gap-4 ${!events[currentEventIndex].imageUrl && 'justify-center'}`}>
                                                <Link to={`/events/${events[currentEventIndex].id}`} className="inline-flex items-center gap-2 bg-afife-primary text-white font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                                    View Event Details <ArrowRight size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Dots */}
                                <div className="flex justify-center gap-3 mt-10">
                                    {events.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentEventIndex(idx)}
                                            className={`h-2 transition-all duration-300 rounded-full ${idx === currentEventIndex ? 'w-12 bg-afife-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                            aria-label={`Go to event ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/events" className="inline-flex items-center gap-2 text-afife-primary font-medium hover:text-afife-secondary">
                            View all events <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marketplace Spotlight */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-afife-secondary font-bold uppercase tracking-wider text-sm">Local Treasures</span>
                            <h2 className="font-heading text-4xl font-bold text-afife-accent mt-2">Marketplace Spotlight</h2>
                        </div>
                        <Link to="/marketplace" className="hidden md:flex items-center gap-2 text-afife-primary font-medium hover:text-afife-secondary">
                            Explore full market <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="bg-gray-50 rounded-2xl aspect-square animate-pulse"></div>
                            ))
                        ) : marketItems.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-400">No items listed in the marketplace yet.</div>
                        ) : (
                            marketItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group transition-all"
                                >
                                    <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-200 relative">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-afife-primary shadow-sm uppercase">
                                                {item.condition || 'New'}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-afife-accent truncate mb-1">{item.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-afife-primary font-black text-lg">GHS {item.price}</span>
                                        <Link to="/marketplace" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-afife-secondary shadow-sm transition-colors">
                                            <ShoppingBag size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* News Teaser Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-afife-secondary font-bold uppercase tracking-wider text-sm">Latest Updates</span>
                            <h2 className="font-heading text-4xl font-bold text-afife-accent mt-2">News from Afife</h2>
                        </div>
                        <Link to="/news" className="hidden md:flex items-center gap-2 text-afife-primary font-medium hover:text-afife-secondary">
                            View all news <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="relative overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl aspect-video animate-pulse"></div>
                                ))}
                            </div>
                        ) : news.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                <p className="text-gray-400">No news updates yet.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={news[currentNewsIndex].id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center"
                                    >
                                        <div className="w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-gray-100">
                                            {news[currentNewsIndex].imageUrl ? (
                                                <img
                                                    src={news[currentNewsIndex].imageUrl}
                                                    alt={news[currentNewsIndex].title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Calendar size={64} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="bg-afife-primary/10 text-afife-primary text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                                    {news[currentNewsIndex].category}
                                                </span>
                                                <span className="text-xs text-gray-400 font-bold">
                                                    {news[currentNewsIndex].createdAt?.toDate ? news[currentNewsIndex].createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent Update'}
                                                </span>
                                            </div>

                                            <h3 className="font-heading text-3xl md:text-4xl font-black text-afife-accent mb-4 leading-tight">
                                                {news[currentNewsIndex].title}
                                            </h3>

                                            <p className="text-gray-500 mb-8 text-lg leading-relaxed line-clamp-4">
                                                {news[currentNewsIndex].excerpt || news[currentNewsIndex].content}
                                            </p>

                                            <div className="flex gap-4">
                                                <Link to={`/news/${news[currentNewsIndex].id}`} className="inline-flex items-center gap-2 bg-afife-accent text-white font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                                    Read Full Article <ArrowRight size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Dots */}
                                <div className="flex justify-center gap-3 mt-10">
                                    {news.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentNewsIndex(idx)}
                                            className={`h-2 transition-all duration-300 rounded-full ${idx === currentNewsIndex ? 'w-12 bg-afife-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                            aria-label={`Go to article ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/news" className="inline-flex items-center gap-2 text-afife-primary font-medium hover:text-afife-secondary">
                            View all news <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-afife-secondary font-bold uppercase tracking-wider text-sm">Building Our Future</span>
                            <h2 className="font-heading text-4xl font-bold text-afife-accent mt-2">Ongoing Projects</h2>
                        </div>
                        <Link to="/donate" className="hidden md:flex items-center gap-2 text-red-500 font-medium hover:text-red-600">
                            Support a project <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl aspect-video animate-pulse"></div>
                            ))
                        ) : projects.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-400">No active projects to display.</div>
                        ) : (
                            projects.map((project) => (
                                <Link to="/donate" key={project.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                                    <div className="h-48 overflow-hidden relative">
                                        {project.imageUrl ? (
                                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-afife-primary/10 flex items-center justify-center text-afife-primary">
                                                <Heart size={40} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-afife-accent">
                                                {project.status || 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-heading text-xl font-bold text-afife-accent mb-2 group-hover:text-afife-primary transition-colors">{project.title}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-afife-secondary h-full" style={{ width: `${project.progress || 30}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
                                            <span>PROGRESS</span>
                                            <span>{project.progress || 30}%</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Cultural Wisdom Section */}
            <section className="py-20 bg-afife-primary/5 relative">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <Quote className="mx-auto text-afife-primary/20 mb-8" size={60} />
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-heading text-3xl md:text-4xl font-black text-afife-accent italic mb-6">
                            "Nunya, adidoe, asi mesune o."
                        </h2>
                        <p className="text-afife-primary font-bold uppercase tracking-widest text-sm mb-2">
                            Knowledge is like a baobab tree; no one person can encompass it.
                        </p>
                        <p className="text-gray-400 italic text-xs">- Traditional Ewe Proverb</p>
                    </motion.div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-afife-accent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-afife-primary rounded-full filter blur-[100px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-afife-secondary rounded-full filter blur-[100px] opacity-20"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Have a concern or suggestion?</h2>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
                        We value your input in building a better Afife. Voice your concerns, report infrastructure issues, or share your innovative ideas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/report" className="px-8 py-4 bg-white text-afife-accent font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                            Report an Issue
                        </Link>
                        <Link to="/contact" className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default Home;
