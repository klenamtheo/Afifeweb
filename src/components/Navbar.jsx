import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Phone, Users, MessageSquare, Briefcase, ShoppingBag, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [alert, setAlert] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch active emergency alert
    useEffect(() => {
        try {
            const q = query(
                collection(db, 'alerts'),
                where('active', '==', true),
                orderBy('createdAt', 'desc'),
                limit(10) // Fetch a few to filter client-side
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const navbarAlerts = snapshot.docs
                    .map(doc => doc.data())
                    .filter(alert => ['Emergency', 'Announcement'].includes(alert.type));

                if (navbarAlerts.length > 0) {
                    setAlert(navbarAlerts[0]);
                } else {
                    setAlert(null);
                }
            }, (err) => {
                console.error("Navbar Alert Error:", err);
                setAlert(null);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Navbar Error:", err);
            setAlert(null);
        }
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Council', path: '/council' },
        { name: 'Festival', path: '/festival' },
        { name: 'Directory', path: '/directory', icon: <Phone size={14} /> },
        { name: "Voice", path: '/suggestions', icon: <MessageSquare size={14} /> },
        { name: 'Skills', path: '/skills' },
        { name: 'Market', path: '/marketplace' },
        { name: 'Jobs & Ads', path: '/jobs' },
        { name: 'Donate', path: '/donate' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || location.pathname === '/contact' ? 'bg-afife-primary shadow-md py-2' : 'bg-transparent py-4'} top-0`}>
                {/* Emergency Alert Bar moved inside Fixed Nav to ensure correct stacking or handled separately with offset */}
                <AnimatePresence>
                    {alert && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`w-full relative transition-colors ${alert.type === 'Emergency' ? 'bg-red-600' : 'bg-afife-secondary'}`}
                        >
                            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-white text-xs md:text-sm font-bold overflow-hidden relative">
                                <Bell size={14} className="shrink-0 z-10" />
                                <div className="flex w-full overflow-hidden mask-image-linear-to-r relative">
                                    <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <span key={i} className="mx-8">{alert.message}</span>
                                        ))}
                                    </div>
                                    <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <span key={i} className="mx-8">{alert.message}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`container mx-auto px-4 md:px-6 flex justify-between items-center transition-all ${scrolled ? 'mt-0' : 'mt-2'}`}>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group text-white">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center transform group-hover:rotate-3 transition-transform backdrop-blur-sm">
                            <span className="text-white font-heading font-bold text-xl">A</span>
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">
                            Afife<span className="text-afife-secondary">Town</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2 ml-auto">
                        <Link to="/" className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${location.pathname === '/' ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Home</Link>
                        <Link to="/about" className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${location.pathname === '/about' ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>About</Link>
                        <Link to="/council" className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${location.pathname === '/council' ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Council</Link>
                        <Link to="/festival" className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${location.pathname === '/festival' ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Festival</Link>

                        {/* Community Hub Dropdown */}
                        <div className="relative group">
                            <button className="text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 group-hover:text-white">
                                Community Hub
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-48">
                                <div className="bg-white rounded-xl shadow-xl overflow-hidden py-2 border border-black/5">
                                    <Link to="/jobs" className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-afife-primary transition-colors flex items-center gap-2">
                                        <Briefcase size={16} className="text-afife-primary" /> Jobs & Ads
                                    </Link>
                                    <Link to="/marketplace" className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-afife-primary transition-colors flex items-center gap-2">
                                        <ShoppingBag size={16} className="text-afife-accent" /> Market
                                    </Link>
                                    <Link to="/skills" className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-afife-primary transition-colors flex items-center gap-2">
                                        <Wrench size={16} className="text-purple-500" /> Skills
                                    </Link>
                                    <Link to="/directory" className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-afife-primary transition-colors flex items-center gap-2">
                                        <Phone size={16} className="text-blue-500" /> Directory
                                    </Link>
                                    <Link to="/suggestions" className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-afife-primary transition-colors flex items-center gap-2">
                                        <MessageSquare size={16} className="text-orange-500" /> Voice Board
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link to="/donate" className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${location.pathname === '/donate' ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Donate</Link>
                        <Link to="/contact" className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${location.pathname === '/contact' ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Contact</Link>

                        <Link
                            to="/portal"
                            className="ml-2 bg-afife-secondary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white hover:text-afife-primary transition-all shadow-md flex items-center gap-1"
                        >
                            <Users size={14} />
                            Native Portal
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-afife-primary/95 backdrop-blur-md border-t border-white/10 overflow-y-auto max-h-[80vh]"
                        >
                            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                                <Link to="/" onClick={() => setIsOpen(false)} className="font-bold text-base p-3 rounded-xl text-white hover:bg-white/5">Home</Link>
                                <Link to="/about" onClick={() => setIsOpen(false)} className="font-bold text-base p-3 rounded-xl text-white hover:bg-white/5">About</Link>
                                <Link to="/council" onClick={() => setIsOpen(false)} className="font-bold text-base p-3 rounded-xl text-white hover:bg-white/5">Council</Link>
                                <Link to="/festival" onClick={() => setIsOpen(false)} className="font-bold text-base p-3 rounded-xl text-white hover:bg-white/5">Festival</Link>

                                <div className="ml-3 my-2 border-l-2 border-white/20 pl-4 space-y-2">
                                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Community Hub</p>
                                    <Link to="/jobs" onClick={() => setIsOpen(false)} className="block font-bold text-base text-white py-1">Jobs & Ads</Link>
                                    <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block font-bold text-base text-white py-1">Marketplace</Link>
                                    <Link to="/skills" onClick={() => setIsOpen(false)} className="block font-bold text-base text-white py-1">Skills</Link>
                                    <Link to="/directory" onClick={() => setIsOpen(false)} className="block font-bold text-base text-white py-1">Directory</Link>
                                    <Link to="/suggestions" onClick={() => setIsOpen(false)} className="block font-bold text-base text-white py-1">Voice Board</Link>
                                </div>

                                <Link to="/donate" onClick={() => setIsOpen(false)} className="font-bold text-base p-3 rounded-xl text-white hover:bg-white/5">Donate</Link>
                                <Link to="/contact" onClick={() => setIsOpen(false)} className="font-bold text-base p-3 rounded-xl text-white hover:bg-white/5">Contact</Link>

                                <div className="pt-4 border-t border-white/10">
                                    <Link
                                        to="/portal"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-afife-secondary text-white font-bold text-base p-3 rounded-xl flex items-center gap-3 justify-center shadow-lg"
                                    >
                                        <Users size={20} />
                                        Access Native Portal
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Navbar;
