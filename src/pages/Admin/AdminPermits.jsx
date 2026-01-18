
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FileCheck, Clock, XCircle, CheckCircle, Search } from 'lucide-react';

const AdminPermits = () => {
    const [permits, setPermits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'permits'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setPermits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (permitId, newStatus) => {
        try {
            const permitRef = doc(db, 'permits', permitId);
            await updateDoc(permitRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating permit status:", error);
        }
    };

    const filteredPermits = permits.filter(p => {
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesSearch = p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.type?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Permit Applications</h1>
                    <p className="text-gray-500">Review and manage permits requested via the native portal.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search names or types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all ${filter === s ? 'bg-white text-afife-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading applications...</div>
            ) : filteredPermits.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <FileCheck size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No permit applications found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Permit Type</th>
                                <th className="px-6 py-4">Purpose</th>
                                <th className="px-6 py-4">Date Submitted</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPermits.map((permit) => (
                                <tr key={permit.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-afife-primary/10 text-afife-primary flex items-center justify-center font-bold">
                                                {permit.userName?.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{permit.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-700">{permit.type}</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-gray-500 text-sm truncate" title={permit.purpose}>{permit.purpose}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {permit.createdAt?.toDate().toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(permit.status)}`}>
                                            {permit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {permit.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(permit.id, 'approved')}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(permit.id, 'rejected')}
                                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {permit.status !== 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(permit.id, 'pending')}
                                                    className="text-xs text-blue-600 hover:underline font-bold"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPermits;
