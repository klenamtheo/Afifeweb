
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, ShoppingBag, Briefcase, MessageSquare, LogOut, Menu, X, Phone, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed for mobile first approach, effect will open for desktop
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch {
            console.error('Failed to log out');
        }
    };

    const navItems = [
        { path: '/admin/dashboard', name: 'Overview', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/news', name: 'News & Updates', icon: <FileText size={20} /> },
        { path: '/admin/events', name: 'Events', icon: <Calendar size={20} /> },
        { path: '/admin/market', name: 'Marketplace', icon: <ShoppingBag size={20} /> },
        { path: '/admin/projects', name: 'Projects', icon: <Briefcase size={20} /> },
        { path: '/admin/directory', name: 'Yellow Pages', icon: <Phone size={20} /> },
        { path: '/admin/suggestions', name: "Voice Board", icon: <MessageSquare size={20} /> },
        { path: '/admin/alerts', name: 'Announcements', icon: <Bell size={20} /> },
        { path: '/admin/submissions', name: 'Submissions', icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-afife-text text-white transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <h1 className="text-xl font-heading font-bold text-afife-secondary">Afife Admin Portal</h1>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight hidden lg:block">Built by KlenamDev</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-afife-primary text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700 shrink-0">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-20 flex items-center justify-between lg:justify-end">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Admin Portal</span>
                        <div className="w-8 h-8 rounded-full bg-afife-primary text-white flex items-center justify-center font-bold">A</div>
                    </div>
                </header>
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;
