import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { Bell, Shield, Info, Trash2, ToggleLeft, ToggleRight, Plus, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAlert, setNewAlert] = useState({
        message: '',
        type: 'Info', // Emergency or Info
        active: true
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [alertToDelete, setAlertToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // First, if this new alert is active, deactivate all other active alerts
            // For simplicity, we'll let multiple be active if the admin wants, 
            // but the Navbar currently shows the latest one.

            await addDoc(collection(db, 'alerts'), {
                ...newAlert,
                createdAt: serverTimestamp()
            });
            setNewAlert({ message: '', type: 'Info', active: true });
            setIsAdding(false);
            success("Alert published successfully");
        } catch (err) {
            console.error("Error adding alert:", err);
            error("Failed to publish alert");
        }
    };

    const toggleStatus = async (alertId, currentStatus) => {
        try {
            await updateDoc(doc(db, 'alerts', alertId), {
                active: !currentStatus
            });
            success(`Alert ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (err) {
            console.error("Error updating alert:", err);
            error("Failed to update status");
        }
    };

    const handleDeleteClick = (id) => {
        setAlertToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!alertToDelete) return;
        try {
            await deleteDoc(doc(db, 'alerts', alertToDelete));
            success("Alert deleted successfully");
        } catch (err) {
            console.error("Error deleting alert:", err);
            error("Failed to delete alert");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Community Alerts</h2>
                    <p className="text-gray-500">Manage global announcements and emergency bars.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-afife-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    {isAdding ? 'Cancel' : 'New Alert'}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Alert Message</label>
                                <textarea
                                    required
                                    value={newAlert.message}
                                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                    placeholder="e.g., Community Meeting tomorrow at 4 PM at the Durbar Grounds"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alert Type</label>
                                    <select
                                        value={newAlert.type}
                                        onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                    >
                                        <option value="Info">General Info (Green/Gold)</option>
                                        <option value="Emergency">Emergency (Red)</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 pt-8">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newAlert.active}
                                            onChange={(e) => setNewAlert({ ...newAlert, active: e.target.checked })}
                                            className="w-5 h-5 accent-afife-primary"
                                        />
                                        <span className="font-bold text-gray-700">Activate Immediately</span>
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-afife-accent text-white rounded-xl font-bold hover:bg-afife-primary transition-colors mt-4"
                            >
                                Publish Alert
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="animate-spin text-afife-primary" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-6 rounded-2xl border transition-all flex items-center justify-between
                                ${alert.active ? 'bg-white border-afife-primary shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-3 rounded-full ${alert.type === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {alert.type === 'Emergency' ? <Shield size={24} /> : <Info size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                                            ${alert.type === 'Emergency' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                                            {alert.type}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {alert.createdAt?.toDate().toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-bold text-gray-800">{alert.message}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-6">
                                <button
                                    onClick={() => toggleStatus(alert.id, alert.active)}
                                    className={`p-2 rounded-lg transition-colors ${alert.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={alert.active ? "Deactivate" : "Activate"}
                                >
                                    {alert.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(alert.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {alerts.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Bell className="mx-auto text-gray-100 mb-4" size={64} />
                            <p className="text-gray-400">No alerts found. Create your first one!</p>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Alert?"
                message="Are you sure you want to delete this alert? This action cannot be undone."
                confirmText="Delete Alert"
                isDangerous={true}
            />
        </div >
    );
};

export default AdminAlerts;
