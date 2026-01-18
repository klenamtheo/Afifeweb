
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Briefcase, Megaphone, Calendar, MapPin, DollarSign, Clock, CheckCircle, ExternalLink, Send, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const JobsAds = () => {
    const [jobs, setJobs] = useState([]);
    const [adverts, setAdverts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'ads'
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const { success, error } = useToast();
    const { userProfile } = useAuth();
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    const [applicationForm, setApplicationForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: ''
    });

    useEffect(() => {
        // Query ordered by date only, filter active status client-side to avoid compound index requirement
        const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const adsQuery = query(collection(db, 'adverts'), orderBy('createdAt', 'desc'));

        const unsubscribeJobs = onSnapshot(jobsQuery, (snap) => {
            const activeJobs = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(job => job.active === true);
            setJobs(activeJobs);
        });

        const unsubscribeAds = onSnapshot(adsQuery, (snap) => {
            const activeAds = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(ad => ad.active === true);
            setAdverts(activeAds);
            setLoading(false);
        });

        return () => {
            unsubscribeJobs();
            unsubscribeAds();
        };
    }, []);

    useEffect(() => {
        if (userProfile?.uid) {
            setApplicationForm(prev => ({
                ...prev,
                fullName: userProfile.fullName || '',
                email: userProfile.email || '',
                phone: userProfile.phoneNumber || ''
            }));

            const q = query(
                collection(db, 'job_applications'),
                where('userId', '==', userProfile.uid)
            );
            const unsubscribe = onSnapshot(q, (snap) => {
                const ids = snap.docs.map(doc => doc.data().jobId);
                setAppliedJobIds(ids);
            });
            return () => unsubscribe();
        }
    }, [userProfile]);

    const handleApply = async (e) => {
        e.preventDefault();

        if (applicationForm.phone.length !== 10) {
            error("Phone number must be exactly 10 digits");
            return;
        }

        try {
            await addDoc(collection(db, 'job_applications'), {
                jobId: selectedJob.id,
                jobTitle: selectedJob.title,
                ...applicationForm,
                appliedAt: serverTimestamp(),
                status: 'pending'
            });
            success("Application submitted successfully!");
            setIsApplying(false);
            setApplicationForm({ fullName: '', email: '', phone: '', message: '' });
        } catch (err) {
            console.error("Apply Error:", err);
            error("Failed to submit application");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-afife-primary text-white pt-32 pb-16 mb-12">
                <div className="container mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black mb-4 font-heading"
                    >
                        Opportunities & Announcements
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/80 max-w-2xl mx-auto text-lg"
                    >
                        Explore career opportunities, local businesses, and community announcements in one place.
                    </motion.p>
                </div>
            </header>

            <div className="container mx-auto px-6">
                {/* Tab Switcher */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'jobs'
                                ? 'bg-afife-primary text-white shadow-lg'
                                : 'text-gray-500 hover:text-afife-primary'
                                }`}
                        >
                            <Briefcase size={20} />
                            Job Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('ads')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'ads'
                                ? 'bg-afife-accent text-white shadow-lg'
                                : 'text-gray-500 hover:text-afife-accent'
                                }`}
                        >
                            <Megaphone size={20} />
                            Adverts & Spots
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="animate-spin text-afife-primary mb-4" size={48} />
                        <p className="text-gray-400 font-bold">Fetching latest board updates...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeTab === 'jobs' ? (
                            jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-green-50 text-afife-primary rounded-2xl group-hover:scale-110 transition-transform">
                                                <Briefcase size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                                                {job.salary || 'Competitive'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{job.title}</h3>
                                        <p className="text-afife-primary font-bold text-sm mb-4">{job.company}</p>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Calendar size={14} />
                                                <span>Deadline: {job.deadline?.toDate().toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <MapPin size={14} />
                                                <span>{job.location || 'Afife, Ketu North'}</span>
                                            </div>
                                        </div>

                                        {appliedJobIds.includes(job.id) ? (
                                            <div className="w-full py-4 bg-green-500/10 text-green-600 rounded-2xl font-bold border border-green-500/20 flex items-center justify-center gap-2">
                                                <CheckCircle size={20} /> Applied
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    setIsApplying(true);
                                                }}
                                                className="w-full py-4 bg-afife-primary text-white rounded-2xl font-bold hover:bg-afife-accent transition-all shadow-md active:scale-95"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Briefcase size={64} className="mx-auto text-gray-100 mb-4" />
                                    <p className="text-gray-400 font-bold">No active job listings at the moment.</p>
                                </div>
                            )
                        ) : (
                            adverts.length > 0 ? (
                                adverts.map((ad) => (
                                    <motion.div
                                        key={ad.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative"
                                    >
                                        {ad.imageUrl ? (
                                            <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-48 bg-afife-accent/10 flex items-center justify-center">
                                                <Megaphone size={48} className="text-afife-accent opacity-20" />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{ad.title}</h3>
                                            <p className="text-gray-500 text-sm mb-6 line-clamp-3">{ad.description}</p>

                                            {ad.link && (
                                                <a
                                                    href={ad.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-afife-accent font-bold hover:underline"
                                                >
                                                    Learn More <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Megaphone size={64} className="mx-auto text-gray-100 mb-4" />
                                    <p className="text-gray-400 font-bold">No featured adverts currently.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            <AnimatePresence>
                {isApplying && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsApplying(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Job Application</h2>
                                    <p className="text-afife-primary font-bold text-sm uppercase tracking-tight">{selectedJob?.title}</p>
                                </div>
                                <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleApply} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={applicationForm.fullName}
                                        onChange={(e) => setApplicationForm({ ...applicationForm, fullName: e.target.value })}
                                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={applicationForm.email}
                                            onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                                            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={applicationForm.phone}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/[^0-9]/.test(val)) return;
                                                if (val.length > 10) return;
                                                setApplicationForm({ ...applicationForm, phone: val });
                                            }}
                                            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all"
                                            placeholder="024 XXX XXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message / Why you?</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={applicationForm.message}
                                        onChange={(e) => setApplicationForm({ ...applicationForm, message: e.target.value })}
                                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all resize-none"
                                        placeholder="Briefly tell us why you're a good fit for this role."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-afife-primary text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    Submit Application
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobsAds;
