
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Bell, FileText, Calendar, FileCheck, AlertTriangle, MessageSquare, LogOut, Menu, X, BadgeCheck, User, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const NativeLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
    const [hasUnreadRequests, setHasUnreadRequests] = useState(false);
    const { logout, userProfile } = useAuth();
    const { info } = useToast();
    const navigate = useNavigate();

    // 30 minutes inactivity timeout
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

    // Listen for new Alerts
    useEffect(() => {
        const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snap) => {
            if (snap.empty) return;
            const latestAlert = snap.docs[0].data();
            const lastViewed = localStorage.getItem('lastAlertsViewed');

            if (!lastViewed || (latestAlert.createdAt?.toDate() > new Date(parseInt(lastViewed)))) {
                setHasUnreadAlerts(true);
            }
        });
        return () => unsubscribe();
    }, []);

    // Listen for new Admin Messages (Requests)
    useEffect(() => {
        if (!userProfile?.uid) return;
        const q = query(
            collection(db, 'requests'),
            where('userId', '==', userProfile.uid),
            where('sender', '==', 'admin'),
            where('read', '==', false)
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            setHasUnreadRequests(!snap.empty);
        });
        return () => unsubscribe();
    }, [userProfile?.uid]);

    // Inactivity Logout Logic
    useEffect(() => {
        let timeoutId;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleLogoutWithToast();
            }, INACTIVITY_TIMEOUT);
        };

        const handleLogoutWithToast = async () => {
            try {
                await logout();
                info('Logged out due to inactivity');
                navigate('/portal/login');
            } catch (err) {
                console.error('Failed to log out after inactivity:', err);
            }
        };

        // UI Activity triggers
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        // Initial setup
        resetTimer();

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [logout, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/portal/login');
        } catch {
            console.error('Failed to log out');
        }
    };

    const navItems = [
        { path: '/portal/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/portal/alerts', name: 'Alerts', icon: <Bell size={20} />, badge: hasUnreadAlerts },
        { path: '/portal/meetings', name: 'Meetings', icon: <Calendar size={20} /> },
        { path: '/portal/forms', name: 'Forms', icon: <FileText size={20} /> },
        { path: '/portal/permits', name: 'Permits', icon: <FileCheck size={20} /> },
        { path: '/portal/reports', name: 'Reports', icon: <AlertTriangle size={20} /> },
        { path: '/portal/requests', name: 'Requests', icon: <MessageSquare size={20} />, badge: hasUnreadRequests },
        { path: '/portal/polls', name: 'Community Polls', icon: <BarChart2 size={20} /> },
    ];

    return (
        <div
            className={`min-h-screen flex transition-colors duration-500 ${userProfile?.theme === 'dark' ? 'dark-theme' : ''}`}
            style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
        >
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-72 border-r transform transition-all duration-300 ease-in-out flex flex-col 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--sidebar-shadow)'
                }}
            >
                <div className="p-8 pb-4 flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-2xl font-heading font-black tracking-tight text-afife-primary">
                            Afife<span style={{ color: 'var(--text-main)' }}>Portal</span>
                        </h1>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1 block">Native Access</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                ${isActive
                                    ? 'bg-afife-primary text-white shadow-[0_10px_30px_rgba(46,125,50,0.3)] font-bold translate-x-2'
                                    : 'text-gray-500 hover:bg-afife-primary/5 hover:text-afife-primary font-bold hover:translate-x-1'}
                            `}
                        >
                            {({ isActive }) => (
                                <span className="relative z-10 flex items-center justify-between w-full">
                                    <span className="flex items-center gap-4">
                                        <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                                            {item.icon}
                                        </span>
                                        <span>{item.name}</span>
                                    </span>
                                    {item.badge && (
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-red-500'} animate-pulse`} />
                                    )}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                    <Link
                        to="/portal/profile"
                        className="rounded-2xl p-4 mb-4 flex items-center gap-4 transition-all cursor-pointer border group"
                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
                    >
                        <div className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center font-black border overflow-hidden shrink-0 transition-colors"
                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--afife-primary)' }}>
                            {userProfile?.photoURL ? (
                                <img src={userProfile.photoURL} alt="P" className="w-full h-full object-cover" />
                            ) : (
                                userProfile?.fullName?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>
                                {userProfile?.fullName?.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Citizen Settings</p>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-sm font-bold group">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col">
                <header className="backdrop-blur-md shadow-sm px-6 md:px-12 py-4 sticky top-0 z-20 flex items-center justify-between transition-colors border-b"
                    style={{ backgroundColor: 'rgba(var(--bg-surface-rgb), 0.8)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden mr-4" style={{ color: 'var(--text-main)' }}>
                            <Menu size={24} />
                        </button>
                        <span className="hidden md:block text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {navItems.find(item => window.location.pathname.includes(item.path))?.name || 'Portal'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${userProfile?.status === 'approved'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${userProfile?.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            {userProfile?.status === 'approved' ? 'Verified Citizen' : 'Pending Verification'}
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                ></div>
            )}
        </div>
    );
};

export default NativeLayout;
