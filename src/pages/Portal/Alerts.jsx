
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Bell, AlertTriangle, ShieldAlert, Megaphone, Calendar, Briefcase, MapPin, DollarSign, ExternalLink, Send, X, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { serverTimestamp, addDoc } from 'firebase/firestore';

const Alerts = () => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userProfile } = useAuth();
    const { success, error } = useToast();
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    const [applicationForm, setApplicationForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: ''
    });

    useEffect(() => {
        if (userProfile) {
            setApplicationForm(prev => ({
                ...prev,
                fullName: userProfile.fullName || '',
                email: userProfile.email || '',
                phone: userProfile.phone || ''
            }));

            // Fetch user's applications
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

    useEffect(() => {
        // Clear alert notification indicator
        localStorage.setItem('lastAlertsViewed', Date.now().toString());

        const qAlerts = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(10));
        // Fetch more items to ensure we have enough after filtering
        const qJobs = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(30));
        const qAds = query(collection(db, 'adverts'), orderBy('createdAt', 'desc'), limit(30));

        const unsubscribes = [];

        const updateAll = () => {
            // This is a bit tricky with multiple onSnapshots.
            // For real-time, we'll just handle them separately and combine in state
        };

        const unsubAlerts = onSnapshot(qAlerts, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), category: 'announcement' }));
            setAlerts(prev => {
                const filtered = prev.filter(a => a.category !== 'announcement');
                return [...filtered, ...data].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            });
            setLoading(false);
        });

        const unsubJobs = onSnapshot(qJobs, (snap) => {
            const data = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data(), category: 'job' }))
                .filter(job => job.active === true); // Client-side filter

            setAlerts(prev => {
                const filtered = prev.filter(a => a.category !== 'job');
                return [...filtered, ...data].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            });
        });

        const unsubAds = onSnapshot(qAds, (snap) => {
            const data = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data(), category: 'advert' }))
                .filter(ad => ad.active === true); // Client-side filter

            setAlerts(prev => {
                const filtered = prev.filter(a => a.category !== 'advert');
                return [...filtered, ...data].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            });
        });

        return () => {
            unsubAlerts();
            unsubJobs();
            unsubAds();
        };
    }, []);

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
                userId: userProfile.uid,
                ...applicationForm,
                appliedAt: serverTimestamp(),
                status: 'pending'
            });
            success("Application submitted successfully!");
            setIsApplying(false);
        } catch (err) {
            console.error("Apply Error:", err);
            error("Failed to submit application");
        }
    };

    const getIcon = (item) => {
        if (item.category === 'job') return <Briefcase className="text-green-500" size={24} />;
        if (item.category === 'advert') return <Megaphone className="text-orange-500" size={24} />;

        switch (item.type?.toLowerCase()) {
            case 'emergency': return <AlertTriangle className="text-red-500" size={24} />;
            case 'security': return <ShieldAlert className="text-orange-500" size={24} />;
            case 'announcement': return <Megaphone className="text-blue-500" size={24} />;
            default: return <Bell className="text-gray-500" size={24} />;
        }
    };

    const getBgColor = (item) => {
        if (item.category === 'job') return 'bg-green-500/10 border-l-4 border-green-500';
        if (item.category === 'advert') return 'bg-orange-500/10 border-l-4 border-orange-500';

        switch (item.type?.toLowerCase()) {
            case 'emergency': return 'bg-red-500/10 border-l-4 border-red-500';
            case 'security': return 'bg-orange-500/10 border-l-4 border-orange-500';
            case 'announcement': return 'bg-blue-500/10 border-l-4 border-blue-500';
            default: return 'bg-gray-500/10 border-l-4 border-gray-400';
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--text-main)' }}>Community Alerts</h1>
                <p style={{ color: 'var(--text-muted)' }}>Stay updated with emergency notifications and announcements.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading alerts...</div>
            ) : alerts.length === 0 ? (
                <div className="text-center py-20 rounded-xl border shadow-sm transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--text-muted)' }}>No recent alerts.</p>
                </div>
            ) : (
                <div className="space-y-4 pb-20">
                    {alerts.map(item => (
                        <div key={item.id} className={`p-6 rounded-lg shadow-sm ${getBgColor(item)}`}>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(item)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>
                                            {item.category === 'announcement' ? item.title || 'Announcement' : item.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/20" style={{ color: 'var(--text-main)' }}>
                                                {item.category}
                                            </span>
                                            <span className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2"
                                                style={{ backgroundColor: 'rgba(var(--bg-surface-rgb), 0.5)', color: 'var(--text-muted)' }}>
                                                {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                    </div>

                                    {item.category === 'job' && (
                                        <div className="mb-2 flex flex-wrap gap-3 text-xs font-bold text-afife-primary">
                                            <span className="flex items-center gap-1"><Briefcase size={12} /> {item.company}</span>
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> Deadline: {item.deadline?.toDate().toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    <p className="leading-relaxed mb-4" style={{ color: 'var(--text-main)' }}>
                                        {item.category === 'announcement' ? item.message : item.description}
                                    </p>

                                    {item.category === 'job' && (
                                        appliedJobIds.includes(item.id) ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg font-bold text-sm border border-green-500/20">
                                                <CheckCircle size={16} /> Applied
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedJob(item);
                                                    setIsApplying(true);
                                                }}
                                                className="px-6 py-2 bg-afife-primary text-white rounded-lg font-bold text-sm hover:bg-afife-accent transition-all shadow-md active:scale-95 flex items-center gap-2"
                                            >
                                                <Send size={14} /> Apply Now
                                            </button>
                                        )
                                    )}

                                    {item.category === 'advert' && (
                                        <div className="space-y-4">
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.title} className="w-full max-h-48 object-cover rounded-xl border border-white/10" />
                                            )}
                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-afife-accent font-bold text-sm hover:underline"
                                                >
                                                    View Details <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl text-gray-800"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Job Application</h2>
                                    <p className="text-afife-primary font-bold text-sm uppercase tracking-tight">{selectedJob?.title}</p>
                                </div>
                                <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
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
                                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all bg-gray-50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={applicationForm.email}
                                            onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                                            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
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
                                            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all bg-gray-50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={applicationForm.message}
                                        onChange={(e) => setApplicationForm({ ...applicationForm, message: e.target.value })}
                                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-afife-primary transition-all resize-none bg-gray-50"
                                        placeholder="Why should we hire you?"
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
        </motion.div>
    );
};

export default Alerts;
