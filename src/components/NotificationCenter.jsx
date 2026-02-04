
import { useState, useEffect, useRef } from 'react';
import { Bell, User, MessageSquare, Briefcase, FileText, Clock, X, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(
            collection(db, 'admin_notifications'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(items);
            setUnreadCount(items.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'registration': return <User size={16} />;
            case 'suggestion': return <MessageSquare size={16} />;
            case 'application': return <Briefcase size={16} />;
            case 'permit': return <FileText size={16} />;
            case 'report': return <FileText size={16} />;
            default: return <Bell size={16} />;
        }
    };

    const getRoute = (type) => {
        switch (type) {
            case 'registration': return '/admin/users';
            case 'suggestion': return '/admin/suggestions';
            case 'application': return '/admin/applications';
            case 'permit': return '/admin/permits';
            case 'report': return '/admin/submissions';
            default: return '/admin/dashboard';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'registration': return 'text-blue-600 bg-blue-50';
            case 'suggestion': return 'text-orange-600 bg-orange-50';
            case 'application': return 'text-cyan-600 bg-cyan-50';
            case 'permit': return 'text-purple-600 bg-purple-50';
            case 'report': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleNotificationClick = async (notif) => {
        setIsOpen(false);
        if (!notif.read) {
            try {
                await updateDoc(doc(db, 'admin_notifications', notif.id), { read: true });
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }
        navigate(getRoute(notif.type));
    };

    const markAllAsRead = async () => {
        const unreadItems = notifications.filter(n => !n.read);
        if (unreadItems.length === 0) return;

        const batch = writeBatch(db);
        unreadItems.forEach(item => {
            const ref = doc(db, 'admin_notifications', item.id);
            batch.update(ref, { read: true });
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-afife-primary hover:bg-gray-100 rounded-full transition-all"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in fade-in zoom-in duration-300">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                    >
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recent Activity</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-afife-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColor(notif.type)}`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-tight ${getColor(notif.type).split(' ')[0]}`}>
                                                        {notif.type}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {notif.createdAt ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                                    </span>
                                                </div>
                                                <h4 className={`text-sm leading-snug truncate ${!notif.read ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                                                    {notif.message}
                                                </h4>
                                                {notif.userName && (
                                                    <p className="text-[10px] text-gray-400 mt-1 italic">
                                                        from: {notif.userName}
                                                    </p>
                                                )}
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-afife-primary rounded-full shrink-0 self-center"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center text-gray-400">
                                    <Bell size={40} className="mx-auto mb-3 opacity-10" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Live updates from the portal
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
