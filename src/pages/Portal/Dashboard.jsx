import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Calendar, FileText, FileCheck, ArrowRight, MessageSquare, AlertTriangle, Clock, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const Dashboard = () => {
    const { userProfile } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [indexBuilding, setIndexBuilding] = useState(false);
    const [, setTick] = useState(0); // For forcing re-render of timestamps

    // Refresh timestamps every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const quickLinks = [
        { title: 'Alerts', icon: <Bell className="text-orange-500" size={24} />, path: '/portal/alerts', desc: 'Check latest updates' },
        { title: 'Voice', icon: <MessageSquare className="text-purple-500" size={24} />, path: '/portal/polls', desc: 'Vote on local issues' },
        { title: 'Meetings', icon: <Calendar className="text-blue-500" size={24} />, path: '/portal/meetings', desc: 'View town schedule' },
        { title: 'Permit', icon: <FileCheck className="text-green-500" size={24} />, path: '/portal/permits', desc: 'Track applications' },
        { title: 'Report', icon: <AlertTriangle className="text-red-500" size={24} />, path: '/portal/reports', desc: 'Submit a complaint' },
    ];

    useEffect(() => {
        if (!userProfile?.uid) return;
        const q = query(
            collection(db, 'portal_activities'),
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const unsubscribe = onSnapshot(q,
            (snap) => {
                setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoadingActivities(false);
                setIndexBuilding(false);
            },
            (error) => {
                console.error("Error fetching activities:", error);
                if (error.code === 'failed-precondition' || error.message.includes('index')) {
                    setIndexBuilding(true);
                }
                setLoadingActivities(false);
            }
        );
        return () => unsubscribe();
    }, [userProfile?.uid]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'permit': return <FileCheck size={16} className="text-green-500" />;
            case 'request': return <MessageSquare size={16} className="text-blue-500" />;
            case 'report': return <AlertTriangle size={16} className="text-red-500" />;
            case 'alert': return <Bell size={16} className="text-orange-500" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-12"
        >
            <motion.div variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-heading font-black tracking-tight mb-1" style={{ color: 'var(--text-main)' }}>
                        Woezor, {userProfile?.fullName?.split(' ')[0]}!
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        Welcome to your native portal. Today is {format(new Date(), 'EEEE, MMMM do, yyyy')}.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Quick Access Grid */}
                <div className="lg:col-span-2 space-y-10">
                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Quick Access</h3>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quickLinks.map((link) => (
                            <motion.div key={link.path} variants={itemVariants}>
                                <Link
                                    to={link.path}
                                    className="p-6 rounded-[2rem] border hover:border-afife-primary/30 transition-all duration-300 group flex items-center gap-6 shadow-md h-full"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border shrink-0"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                                        {link.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold mb-1 group-hover:text-afife-primary transition-colors tracking-tight truncate" style={{ color: 'var(--text-main)' }}>{link.title}</h4>
                                        <p className="text-xs font-medium opacity-60 line-clamp-1" style={{ color: 'var(--text-main)' }}>{link.desc}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-sm shrink-0 group-hover:bg-afife-primary group-hover:border-afife-primary transition-colors"
                                        style={{ borderColor: 'var(--border-color)' }}>
                                        <ArrowRight size={18} className="text-afife-primary group-hover:text-white transition-colors" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Activity Log */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <div className="rounded-[2.5rem] border overflow-hidden h-full flex flex-col shadow-lg transition-colors"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="p-6 md:p-8 border-b flex items-center justify-between transition-colors"
                            style={{ backgroundColor: 'rgba(var(--bg-surface-rgb), 0.5)', borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-afife-primary/10 p-2.5 rounded-2xl border" style={{ borderColor: 'rgba(46, 125, 50, 0.1)' }}>
                                    <History className="text-afife-primary" size={20} />
                                </div>
                                <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Activity Log</h3>
                            </div>
                        </div>

                        <div className="flex-1 p-6 space-y-2 overflow-y-auto max-h-[600px] custom-scrollbar">
                            {loadingActivities ? (
                                <div className="text-center py-10 text-gray-400 text-sm italic">Loading activities...</div>
                            ) : indexBuilding ? (
                                <div className="text-center py-10 px-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-500/10">
                                        <Clock size={24} className="text-orange-500 animate-spin-slow" />
                                    </div>
                                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-main)' }}>Initializing Log...</p>
                                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                        The security index is currently being built in the background. This will resolve automatically in a few minutes.
                                    </p>
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-10">
                                    <Clock size={32} className="mx-auto mb-3 text-gray-200" />
                                    <p className="text-gray-400 text-sm">No recent activities found.</p>
                                </div>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id} className="p-4 rounded-2xl hover:bg-black/5 transition-colors border border-transparent group">
                                        <div className="flex gap-4">
                                            <div className="mt-1 p-2 rounded-xl border shadow-sm group-hover:shadow-md transition-all shrink-0"
                                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-bold leading-snug truncate" style={{ color: 'var(--text-bold)' }}>{activity.action}</p>
                                                {activity.metadata && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{activity.metadata}</p>}
                                                <p className="text-[10px] font-bold text-afife-primary uppercase tracking-widest mt-2 bg-afife-primary/10 w-fit px-2 py-0.5 rounded-full border"
                                                    style={{ borderColor: 'rgba(46, 125, 50, 0.1)' }}>
                                                    {activity.createdAt ? formatDistanceToNow(activity.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t transition-colors" style={{ backgroundColor: 'rgba(var(--bg-surface-rgb), 0.5)', borderColor: 'var(--border-color)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-center italic" style={{ color: 'var(--text-muted)' }}>
                                Real-time activity monitoring enabled
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
