import { useState, useEffect } from 'react';
import { Heart, Loader, X, Phone, Landmark, Copy, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const Donate = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [copied, setCopied] = useState('');

    const MOMO_NUMBER = "024 123 4567";
    const MOMO_NAME = "Afife Development Fund";
    const BANK_DETAILS = {
        bank: "GCB Bank",
        account: "1234567890123",
        branch: "Akatsi Branch",
        name: "Afife Traditional Council"
    };

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleDonateClick = (project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    return (
        <div className="bg-afife-bg min-h-screen pb-20">
            {/* Modal Overlay */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-y-auto max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>

                            {/* Modal Header */}
                            <div className="bg-afife-primary p-8 text-white">
                                <Heart className="mb-4 text-afife-secondary" size={32} fill="currentColor" />
                                <h3 className="text-2xl font-bold font-heading">Complete Your Donation</h3>
                                {selectedProject && (
                                    <p className="text-white/80 mt-1">Supporting: {selectedProject.title}</p>
                                )}
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Mobile Money Card */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 relative group">
                                    <div className="flex items-center gap-3 mb-4 text-yellow-800">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Phone size={20} />
                                        </div>
                                        <span className="font-bold text-lg">Mobile Money (MTN)</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider transition-all">{MOMO_NUMBER}</p>
                                            <p className="text-sm text-yellow-700 font-medium">{MOMO_NAME}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(MOMO_NUMBER, 'momo')}
                                            className="flex items-center gap-2 px-3 py-2 bg-white border border-yellow-300 rounded-lg text-sm font-bold text-yellow-800 hover:bg-yellow-100 transition-all shrink-0"
                                        >
                                            {copied === 'momo' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            {copied === 'momo' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                {/* Bank Card */}
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4 text-blue-800">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Landmark size={20} />
                                        </div>
                                        <span className="font-bold text-lg">Bank Transfer</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Account Number</p>
                                                <p className="font-mono font-bold text-lg text-gray-800 tracking-wider leading-none mt-0.5">{BANK_DETAILS.account}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(BANK_DETAILS.account, 'bank')}
                                                className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                                            >
                                                {copied === 'bank' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-blue-400" />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-white/50 p-3 rounded-xl">
                                                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-0.5">Bank Name</p>
                                                <p className="font-bold text-gray-800">{BANK_DETAILS.bank}</p>
                                            </div>
                                            <div className="bg-white/50 p-3 rounded-xl">
                                                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-0.5">Branch</p>
                                                <p className="font-bold text-gray-800">{BANK_DETAILS.branch}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-gray-400 text-xs mt-4">
                                    Please use the project name as reference when donating. Thank you for your support!
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <section className="bg-afife-primary text-white pt-32 pb-20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-afife-secondary rounded-full filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                            <Heart size={40} className="text-afife-secondary" fill="currentColor" />
                        </div>
                        <h1 className="font-heading text-5xl font-bold mb-4 tracking-tight">Support Our Community</h1>
                        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light">
                            Your contribution drives development and change in Afife.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-20">
                {/* Priority Projects Section */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-afife-secondary font-bold uppercase tracking-widest text-sm">Active Fundraising</span>
                        <h2 className="font-heading text-4xl font-bold text-afife-accent mt-2">Projects Needing Your Support</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader className="animate-spin text-afife-primary mb-4" size={48} />
                        <p className="text-gray-400 animate-pulse">Loading amazing projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <Heart className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-500 text-lg">No active fundraising projects at the moment.</p>
                        <p className="text-gray-400 text-sm mt-2">Check back soon or contact us for direct contributions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-[2rem] shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col group"
                            >
                                <div className="h-64 bg-gray-200 relative overflow-hidden">
                                    {project.imageUrl ? (
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                            <Landmark size={64} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black shadow-lg text-afife-primary uppercase tracking-widest border border-white/50">
                                        {project.status || 'Active'}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="font-heading text-2xl font-bold mb-3 text-afife-accent group-hover:text-afife-primary transition-colors">{project.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-8 line-clamp-3 text-sm flex-1">{project.description}</p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Campaign Progress</span>
                                            <span className="text-lg font-bold text-afife-secondary leading-none">{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${project.progress}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="bg-gradient-to-r from-afife-secondary to-orange-400 h-full rounded-full"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleDonateClick(project)}
                                            className="w-full py-4 bg-afife-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-afife-primary transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-afife-accent/20"
                                        >
                                            Donate Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* General Ways Section (Redesigned) */}
            <section className="bg-gray-50 py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-3xl font-bold text-afife-accent">Alternative Contribution Methods</h2>
                        <p className="text-gray-500 mt-2">Preferred methods for direct or recurring support</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-xl group">
                            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-8 transition-transform group-hover:rotate-12">
                                <Phone size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Mobile Money</h3>
                            <p className="text-gray-500 mb-8 font-light leading-relaxed">Fast and convenient directly through your mobile device. Dial *170# to begin.</p>
                            <button
                                onClick={() => handleDonateClick()}
                                className="px-6 py-3 bg-gray-50 text-afife-accent font-bold rounded-xl hover:bg-yellow-100 hover:text-yellow-700 transition-all"
                            >
                                Get Wallet Details
                            </button>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-xl group">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 transition-transform group-hover:-rotate-12">
                                <Landmark size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Swift Bank Transfer</h3>
                            <p className="text-gray-500 mb-8 font-light leading-relaxed">Secure and reliable for larger contributions or international wiring.</p>
                            <button
                                onClick={() => handleDonateClick()}
                                className="px-6 py-3 bg-gray-50 text-afife-accent font-bold rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all"
                            >
                                Get Bank Details
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Donate;
