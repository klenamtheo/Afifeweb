
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Briefcase, User, Mail, Phone, Calendar, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../../context/ToastContext';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'job_applications'), orderBy('appliedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setApplications(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
            setLoading(false);
        }, (err) => {
            console.error("Fetch Applications Error:", err);
            error("Failed to load applications");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const markAsReviewed = async (id, currentStatus) => {
        if (currentStatus !== 'pending') return;
        try {
            await updateDoc(doc(db, 'job_applications', id), {
                status: 'reviewed',
                reviewedAt: serverTimestamp()
            });
            success("Application marked as reviewed");
        } catch (err) {
            console.error("Update Status Error:", err);
            error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-black text-gray-800">Job Applications</h1>
                    <p className="text-gray-500 font-bold mt-1">Review applications from the native portal.</p>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-gray-400 font-bold">Loading applications...</div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Briefcase size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 font-bold">No applications received yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-gray-800">{app.fullName}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${app.status === 'reviewed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-afife-primary font-bold text-sm uppercase">
                                        <Briefcase size={14} /> Applying for: {app.jobTitle}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Mail size={14} /> {app.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={14} /> {app.phone}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {app.appliedAt ? formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true }) : 'Just now'}</span>
                                    </div>
                                </div>
                                <div className="lg:text-right">
                                    <button
                                        onClick={() => markAsReviewed(app.id, app.status)}
                                        disabled={app.status !== 'pending'}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${app.status === 'pending'
                                                ? 'bg-afife-primary text-white hover:bg-afife-accent shadow-md'
                                                : 'bg-gray-100 text-gray-400 cursor-default'
                                            }`}
                                    >
                                        <CheckCircle size={16} />
                                        {app.status === 'pending' ? 'Mark Reviewed' : 'Reviewed'}
                                    </button>
                                </div>
                            </div>
                            {app.message && (
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl">
                                        {app.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
