
import { Users, FileText, Calendar, ShoppingBag, Briefcase, MessageSquare, TrendingUp, Loader, Megaphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getCountFromServer, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
    const [stats, setStats] = useState({
        submissions: 0,
        news: 0,
        events: 0,
        market: 0,
        projects: 0,
        jobs: 0,
        adverts: 0
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats with individual error handling to prevent 403s from breaking the dashboard
                const getCount = async (colName) => {
                    try {
                        const snap = await getCountFromServer(collection(db, colName));
                        return snap.data().count;
                    } catch (err) {
                        console.warn(`Could not fetch count for ${colName}:`, err.message);
                        return 0; // Fallback to 0 if permission denied or other error
                    }
                };

                const [submissions, news, events, market, projects, jobs, adverts] = await Promise.all([
                    getCount('submissions'),
                    getCount('news'),
                    getCount('events'),
                    getCount('market'),
                    getCount('projects'),
                    getCount('jobs'),
                    getCount('adverts')
                ]);

                setStats({
                    submissions,
                    news,
                    events,
                    market,
                    projects,
                    jobs,
                    adverts
                });

                // Real-time Activity Listeners
                const collections = ['news', 'events', 'market', 'projects', 'submissions', 'alerts', 'jobs', 'adverts', 'job_applications'];
                const activityTypes = {
                    news: { label: 'News', icon: <FileText size={14} />, color: 'text-green-600', bg: 'bg-green-50' },
                    events: { label: 'Event', icon: <Calendar size={14} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                    market: { label: 'Market', icon: <ShoppingBag size={14} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    projects: { label: 'Project', icon: <Briefcase size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    submissions: { label: 'Submission', icon: <MessageSquare size={14} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                    alerts: { label: 'Alert', icon: <TrendingUp size={14} />, color: 'text-red-600', bg: 'bg-red-50' },
                    jobs: { label: 'Job', icon: <Briefcase size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    adverts: { label: 'Advert', icon: <Megaphone size={14} />, color: 'text-pink-600', bg: 'bg-pink-50' },
                    job_applications: { label: 'Application', icon: <Users size={14} />, color: 'text-cyan-600', bg: 'bg-cyan-50' }
                };

                const currentActivities = {};

                const unsubscribers = collections.map(colName => {
                    const q = query(collection(db, colName), orderBy('createdAt', 'desc'), limit(5));
                    return onSnapshot(q,
                        (snap) => {
                            currentActivities[colName] = snap.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data(),
                                type: colName,
                                activityInfo: activityTypes[colName]
                            }));

                            // Flatten and sort whenever any collection updates
                            const allActivities = Object.values(currentActivities).flat();
                            const sortedActivities = allActivities
                                .filter(a => a.createdAt && typeof a.createdAt.toDate === 'function')
                                .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
                                .slice(0, 10);

                            setActivities(sortedActivities);
                        },
                        (err) => {
                            console.error(`Listener error for ${colName}:`, err.message);
                        }
                    );
                });

                return () => unsubscribers.forEach(unsub => unsub());

            } catch (e) {
                console.error("Error fetching dashboard data", e);
            } finally {
                setLoading(false);
            }
        };

        const cleanupPromise = fetchData();
        return () => {
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, []);

    const statCards = [
        { title: 'Inquiries', count: stats.submissions, icon: <MessageSquare size={24} />, color: 'bg-blue-500' },
        { title: 'Jobs', count: stats.jobs, icon: <Briefcase size={24} />, color: 'bg-indigo-500' },
        { title: 'Active Ads', count: stats.adverts, icon: <Megaphone size={24} />, color: 'bg-pink-500' },
        { title: 'Events', count: stats.events, icon: <Calendar size={24} />, color: 'bg-purple-500' },
        { title: 'Market Items', count: stats.market, icon: <ShoppingBag size={24} />, color: 'bg-yellow-500' },
        { title: 'News', count: stats.news, icon: <FileText size={24} />, color: 'bg-green-500' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stat.count}</h3>
                        </div>
                        <div className={`p-4 rounded-lg text-white ${stat.color} shadow-lg shadow-${stat.color}/30`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-xl text-gray-800">Recent System Activity</h2>
                    <div className="flex items-center gap-2 text-sm text-afife-primary font-bold">
                        <TrendingUp size={16} /> Live
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400">
                            <Loader className="animate-spin mx-auto mb-2" size={32} />
                            <p>Analyzing system pulses...</p>
                        </div>
                    ) : activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.activityInfo.bg} ${activity.activityInfo.color}`}>
                                    {activity.activityInfo.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${activity.activityInfo.color}`}>
                                            {activity.activityInfo.label} Added
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {activity.createdAt ? formatDistanceToNow(activity.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 truncate">
                                        {activity.title || activity.name || activity.businessName || activity.subject || activity.category || 'Untitled Activity'}
                                    </h4>
                                </div>
                                <div className="text-gray-300 group-hover:text-afife-primary">
                                    <Users size={16} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <TrendingUp className="mx-auto mb-2 opacity-20" size={48} />
                            <p>No recent activity detected.</p>
                        </div>
                    )}
                </div>
                {activities.length > 0 && (
                    <div className="bg-gray-50/50 p-4 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">End of Recent Stream</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
