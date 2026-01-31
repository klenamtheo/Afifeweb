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
import { Bell, Shield, Info, Trash2, ToggleLeft, ToggleRight, Plus, Loader, X, Briefcase, Megaphone, Calendar as CalendarIcon, MapPin, DollarSign, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { uploadImage } from '../../services/imageService';

const AdminAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAlert, setNewAlert] = useState({
        message: '',
        type: 'Info', // Emergency or Info
        active: true,
        category: 'announcement', // announcement, job, advert
        // Job fields
        title: '',
        company: '',
        location: '',
        salary: '',
        deadline: '',
        // Advert fields
        imageUrl: '',
        link: ''
    });
    const [activeView, setActiveView] = useState('announcement'); // announcement, job, advert
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [alertToDelete, setAlertToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        let collectionName = 'alerts';
        if (activeView === 'job') collectionName = 'jobs';
        if (activeView === 'advert') collectionName = 'adverts';

        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [activeView]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const url = await uploadImage(file, 'adverts');
                setNewAlert(prev => ({ ...prev, imageUrl: url }));
                success("Image uploaded successfully!");
            } catch (err) {
                console.error("Upload failed:", err);
                error("Image upload failed. You can still paste a manual URL.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let collectionName = 'alerts';
            let data = {
                active: newAlert.active,
                createdAt: serverTimestamp()
            };

            if (newAlert.category === 'announcement') {
                data = { ...data, message: newAlert.message, type: newAlert.type };
            } else if (newAlert.category === 'job') {
                collectionName = 'jobs';
                data = {
                    ...data,
                    title: newAlert.title,
                    company: newAlert.company,
                    location: newAlert.location,
                    salary: newAlert.salary,
                    description: newAlert.message,
                    deadline: newAlert.deadline ? new Date(newAlert.deadline) : null
                };
            } else if (newAlert.category === 'advert') {
                collectionName = 'adverts';
                data = {
                    ...data,
                    title: newAlert.title,
                    description: newAlert.message,
                    imageUrl: newAlert.imageUrl,
                    link: newAlert.link
                };
            }

            await addDoc(collection(db, collectionName), data);

            setNewAlert({
                message: '', type: 'Info', active: true, category: 'announcement',
                title: '', company: '', location: '', salary: '', deadline: '',
                imageUrl: '', link: ''
            });
            setIsAdding(false);
            success(`${newAlert.category.charAt(0).toUpperCase() + newAlert.category.slice(1)} published successfully`);
        } catch (err) {
            console.error("Error adding alert:", err);
            error("Failed to publish");
        }
    };

    const toggleStatus = async (alertId, currentStatus) => {
        try {
            let collectionName = 'alerts';
            if (activeView === 'job') collectionName = 'jobs';
            if (activeView === 'advert') collectionName = 'adverts';

            await updateDoc(doc(db, collectionName, alertId), {
                active: !currentStatus
            });
            success(`Status updated`);
        } catch (err) {
            console.error("Error updating status:", err);
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
            let collectionName = 'alerts';
            if (activeView === 'job') collectionName = 'jobs';
            if (activeView === 'advert') collectionName = 'adverts';

            await deleteDoc(doc(db, collectionName, alertToDelete));
            success("Deleted successfully");
        } catch (err) {
            console.error("Error deleting:", err);
            error("Failed to delete");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Board Management</h2>
                    <p className="text-gray-500">Manage announcements, employment jobs, and adverts.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                        {[
                            { id: 'announcement', icon: <Bell size={18} />, label: 'Alerts' },
                            { id: 'job', icon: <Briefcase size={18} />, label: 'Jobs' },
                            { id: 'advert', icon: <Megaphone size={18} />, label: 'Ads' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                                    ${activeView === tab.id ? 'bg-white text-afife-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setNewAlert(prev => ({ ...prev, category: activeView }));
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-afife-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        {isAdding ? <X size={20} /> : <Plus size={20} />}
                        {isAdding ? 'Cancel' : `New ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['announcement', 'job', 'advert'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewAlert({ ...newAlert, category: cat })}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold transition-all text-sm
                                                    ${newAlert.category === cat ? 'bg-afife-primary/5 border-afife-primary text-afife-primary' : 'bg-white border-gray-100 text-gray-500'}`}
                                            >
                                                {cat === 'announcement' && <Bell size={18} />}
                                                {cat === 'job' && <Briefcase size={18} />}
                                                {cat === 'advert' && <Megaphone size={18} />}
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    {newAlert.category !== 'announcement' && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{newAlert.category === 'job' ? 'Job Title' : 'Advert Title'}</label>
                                            <input
                                                required
                                                type="text"
                                                value={newAlert.title}
                                                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                                placeholder={`e.g., ${newAlert.category === 'job' ? 'Lead Farmer' : 'Mega Sale at Afife Market'}`}
                                            />
                                        </div>
                                    )}

                                    {newAlert.category === 'job' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Company / Institution</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newAlert.company}
                                                    onChange={(e) => setNewAlert({ ...newAlert, company: e.target.value })}
                                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                                    placeholder="e.g., Afife Dev Council"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                                                <input
                                                    required
                                                    type="date"
                                                    value={newAlert.deadline}
                                                    onChange={(e) => setNewAlert({ ...newAlert, deadline: e.target.value })}
                                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {newAlert.category === 'advert' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Advert Image</label>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                            {newAlert.imageUrl ? (
                                                                <img src={newAlert.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-500 mb-1 font-medium">Upload File</p>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-afife-primary/10 file:text-afife-primary hover:file:bg-afife-primary/20"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                        <input
                                                            type="url"
                                                            value={newAlert.imageUrl}
                                                            onChange={(e) => setNewAlert({ ...newAlert, imageUrl: e.target.value })}
                                                            className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                                            placeholder="Paste image link here"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Action Link (Optional)</label>
                                                <input
                                                    type="url"
                                                    value={newAlert.link}
                                                    onChange={(e) => setNewAlert({ ...newAlert, link: e.target.value })}
                                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {newAlert.category === 'announcement' ? 'Alert Message' : 'Description / Details'}
                                        </label>
                                        <textarea
                                            required
                                            value={newAlert.message}
                                            onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                            placeholder="Provide all necessary details..."
                                            rows="4"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        {newAlert.category === 'announcement' && (
                                            <div className="flex-1">
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
                                        )}
                                        <div className={`${newAlert.category === 'announcement' ? 'ml-6 pt-6' : ''}`}>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newAlert.active}
                                                    onChange={(e) => setNewAlert({ ...newAlert, active: e.target.checked })}
                                                    className="w-5 h-5 accent-afife-primary"
                                                />
                                                <span className="font-bold text-gray-700 whitespace-nowrap">Publish Live</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-afife-accent text-white rounded-xl font-bold hover:bg-afife-primary transition-colors"
                            >
                                Publish {newAlert.category.charAt(0).toUpperCase() + newAlert.category.slice(1)}
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
                                <div className={`p-3 rounded-full 
                                    ${activeView === 'job' ? 'bg-green-100 text-green-600' :
                                        activeView === 'advert' ? 'bg-orange-100 text-orange-600' :
                                            alert.type === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {activeView === 'job' ? <Briefcase size={24} /> :
                                        activeView === 'advert' ? <Megaphone size={24} /> :
                                            alert.type === 'Emergency' ? <Shield size={24} /> : <Info size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                                            ${activeView === 'job' ? 'bg-green-600 text-white' :
                                                activeView === 'advert' ? 'bg-orange-600 text-white' :
                                                    alert.type === 'Emergency' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                                            {activeView === 'announcement' ? alert.type : activeView}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {alert.createdAt?.toDate().toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-bold text-gray-800">
                                        {activeView === 'announcement' ? alert.message : alert.title}
                                    </p>
                                    {activeView === 'job' && <p className="text-xs text-gray-500">{alert.company} • {alert.location}</p>}
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
