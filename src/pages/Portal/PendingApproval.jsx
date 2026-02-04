
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldCheck, UserCheck, LogOut, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
    const { userProfile, logout } = useAuth();

    const steps = [
        { title: 'Information Received', desc: 'Registration data securely stored.', icon: <Send size={20} />, status: 'complete' },
        { title: 'Identity Verification', desc: 'Admin is reviewing your native status.', icon: <ShieldCheck size={20} />, status: 'active' },
        { title: 'Portal Access', desc: 'Full digital services unlocked.', icon: <UserCheck size={20} />, status: 'pending' },
    ];

    return (
        <div className="min-h-screen bg-afife-bg flex items-center justify-center p-6 relative overflow-hidden text-afife-text">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-afife-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-afife-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-afife-primary/10 overflow-hidden relative z-10"
            >
                <div className="p-8 md:p-12">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-20 h-20 bg-afife-primary/10 rounded-3xl flex items-center justify-center mb-6 text-afife-primary relative">
                            <Clock size={40} className="animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-afife-secondary rounded-full border-4 border-white flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-afife-primary rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black font-heading mb-4 tracking-tight">Account Under Review</h1>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            Hello <span className="text-afife-primary font-bold">{userProfile?.fullName}</span>, your registration has been received and is currently being processed by the town administrators.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-8 mb-12 relative before:absolute before:left-[1.65rem] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex gap-6 relative group">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${step.status === 'complete' ? 'bg-afife-primary text-white' :
                                        step.status === 'active' ? 'bg-afife-secondary text-afife-primary shadow-lg shadow-afife-secondary/20' :
                                            'bg-gray-50 text-gray-300 border border-gray-100'
                                    }`}>
                                    {step.icon}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h3 className={`font-bold text-lg mb-0.5 ${step.status === 'pending' ? 'text-gray-300' : 'text-afife-text'}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm ${step.status === 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 flex gap-4 items-start mb-10">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-800 text-sm mb-1">Why am I seeing this?</h4>
                            <p className="text-xs text-orange-700 leading-relaxed">
                                To protect the privacy and security of our community, all native accounts must be manually verified. This process usually takes 24-48 hours.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={18} /> Back to Website
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 py-4 px-8 text-center border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        Official Afife Town Traditional Council Portal
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingApproval;
