
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { User, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all native users
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'native'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-800">Native Verification</h1>
                <p className="text-gray-500">Review and approve new native registrations.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Email</th>
                                <th className="p-4 font-bold">Registered</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No native users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-100 shadow-sm">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.fullName?.charAt(0) || <User size={18} />
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-800">{user.fullName || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                                                ${user.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    user.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {user.status === 'approved' && <CheckCircle size={10} />}
                                                {user.status === 'rejected' && <XCircle size={10} />}
                                                {user.status === 'pending' && <Clock size={10} />}
                                                <span className="uppercase">{user.status}</span>
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(user.id, 'approved')}
                                                        className="p-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {user.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(user.id, 'rejected')}
                                                        className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
