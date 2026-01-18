
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { FileCheck, Plus, Clock, XCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { logActivity } from '../../utils/activityLogger';

const Permits = () => {
    const { userProfile } = useAuth();
    const [permits, setPermits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // Form State
    const [type, setType] = useState('Building');
    const [purpose, setPurpose] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!userProfile) return;

        const q = query(
            collection(db, 'permits'),
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setPermits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'permits'), {
                userId: userProfile.uid,
                userName: userProfile.fullName,
                type,
                purpose,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Log activity
            await logActivity(
                userProfile.uid,
                userProfile.fullName,
                `Applied for a ${type} Permit`,
                'permit',
                purpose.substring(0, 50) + (purpose.length > 50 ? '...' : '')
            );

            setShowForm(false);
            setPurpose('');
        } catch (error) {
            console.error("Error asking for permit:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'rejected': return <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
            default: return <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pending Review</span>;
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--text-main)' }}>My Permits</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track status of your permit applications.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-afife-primary/90 transition-colors shadow-lg shadow-afife-primary/30"
                >
                    {showForm ? 'Cancel' : <><Plus size={20} /> Apply New</>}
                </button>
            </div>

            {showForm && (
                <div className="p-8 rounded-xl shadow-lg border mb-8 animate-in fade-in slide-in-from-top-4 transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>New Permit Application</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Permit Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-colors"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                                <option>Building</option>
                                <option>Business Operation</option>
                                <option>Event Hosting</option>
                                <option>Burial / Funeral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Purpose & Details</label>
                            <textarea
                                required
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-colors"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                placeholder="Describe why you need this permit..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-afife-accent text-white px-8 py-2 rounded-lg font-bold hover:bg-afife-accent/90 transition-colors"
                            >
                                {submitting ? <Loader className="animate-spin" size={20} /> : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading permits...</div>
            ) : permits.length === 0 ? (
                <div className="text-center py-20 rounded-xl border shadow-sm transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <FileCheck size={48} className="mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--text-muted)' }}>No permit applications found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {permits.map(permit => (
                        <div key={permit.id} className="p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 transition-colors"
                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>{permit.type} Permit</h3>
                                    {getStatusBadge(permit.status)}
                                </div>
                                <p style={{ color: 'var(--text-muted)' }}>{permit.purpose}</p>
                            </div>
                            {permit.status === 'approved' && (
                                <button className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold hover:bg-green-500/20 transition-colors">
                                    Download Permit
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Permits;
