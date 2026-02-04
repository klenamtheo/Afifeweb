import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Search, Phone, MapPin, Briefcase, Filter, Loader, Grid, List as ListIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Directory = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = [
        "All",
        "Artisans (Carpenter, Plumber, etc.)",
        "Agriculture & Farming",
        "Education & Teaching",
        "Health & Wellness",
        "Retail & Shops",
        "Food & Catering",
        "Transportation",
        "Professional Services",
        "Other"
    ];

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'directory'), orderBy('createdAt', 'desc'));

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 8000);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            clearTimeout(timeout);
            setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching directory:", error);
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const filteredListings = listings.filter(l => {
        const matchesSearch = l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.owner.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Section */}
            <section className="bg-afife-primary pt-24 md:pt-32 pb-12 md:pb-20 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-afife-secondary rounded-full filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="font-heading text-5xl font-bold mb-4 tracking-tight">Afife Yellow Pages</h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto font-light mb-12">
                            Find trusted local experts, artisans and businesses in our community.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-4xl mx-auto relative group px-4">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-white/90 group-focus-within:text-afife-primary transition-colors z-20" size={20} />
                            <input
                                type="text"
                                placeholder="Search for a service, name, or business..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3.5 pl-16 pr-8 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white placeholder-white/80 outline-none transition-all shadow-lg focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:border-white focus:shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12">
                {/* Category Filters */}
                <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible gap-3 mb-8 md:mb-12 pb-4 md:pb-0 justify-start md:justify-center scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border
                                ${selectedCategory === cat
                                    ? 'bg-afife-accent border-afife-accent text-white shadow-lg'
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-afife-primary'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="animate-spin text-afife-primary mb-4" size={48} />
                        <p className="text-gray-400">Loading the directory...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredListings.map((listing) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={listing.id}
                                        className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                                    >
                                        <div className="h-56 bg-gray-100 relative">
                                            {listing.imageUrl ? (
                                                <img src={listing.imageUrl} alt={listing.businessName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Briefcase size={64} strokeWidth={1} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-afife-primary shadow-sm">
                                                {listing.category}
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <h3 className="text-2xl font-bold text-afife-accent mb-1 group-hover:text-afife-primary transition-colors">{listing.businessName}</h3>
                                            <p className="text-afife-secondary font-bold text-sm mb-6 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-afife-secondary rounded-full animate-pulse"></span>
                                                {listing.owner}
                                            </p>

                                            <div className="space-y-4 mb-8">
                                                <a
                                                    href={`tel:${listing.phone}`}
                                                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-afife-primary hover:text-white transition-all group/call"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-afife-primary shadow-sm group-hover/call:bg-white/20 group-hover/call:text-white">
                                                        <Phone size={18} />
                                                    </div>
                                                    <span className="font-bold">{listing.phone}</span>
                                                </a>
                                                <div className="flex items-center gap-4 p-3 border border-gray-100 rounded-2xl">
                                                    <div className="w-10 h-10 bg-afife-secondary/10 rounded-xl flex items-center justify-center text-afife-secondary">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600">{listing.location}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 italic">
                                                "{listing.description}"
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredListings.length === 0 && (
                            <div className="text-center py-20">
                                <Search className="mx-auto text-gray-200 mb-4" size={64} />
                                <h3 className="text-xl font-bold text-gray-400">No matching listings found</h3>
                                <p className="text-gray-400">Try adjusting your filters or search term.</p>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Directory;
