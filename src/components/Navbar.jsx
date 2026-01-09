import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Phone, Users, MessageSquare } from 'lucide-react';
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
                limit(1)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    setAlert(snapshot.docs[0].data());
                } else {
                    setAlert(null);
                }
            }, (err) => {
                console.error("Navbar Alert Error:", err);
                // Fail gracefully, don't block the UI
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
        { name: 'Donate', path: '/donate' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-afife-primary shadow-md py-2' : 'bg-transparent py-4'} top-0`}>
                {/* Emergency Alert Bar moved inside Fixed Nav to ensure correct stacking or handled separately with offset */}
                <AnimatePresence>
                    {alert && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`w-full relative transition-colors ${alert.type === 'Emergency' ? 'bg-red-600' : 'bg-afife-secondary'}`}
                        >
                            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-white text-xs md:text-sm font-bold">
                                <Bell size={14} className="animate-bounce shrink-0" />
                                <p className="text-center line-clamp-1">{alert.message}</p>
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
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-xs font-bold transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wider
                                    ${location.pathname === link.path ? 'bg-white text-afife-primary' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
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
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`font-bold text-base p-3 rounded-xl flex items-center gap-3 transition-colors
                                            ${location.pathname === link.path ? 'bg-white text-afife-primary' : 'text-white hover:bg-white/5'}`}
                                    >
                                        {link.icon || <Users size={20} />}
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Navbar;
