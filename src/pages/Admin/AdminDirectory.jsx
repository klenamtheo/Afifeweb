import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
    collection,
    addDoc,
    query,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { Plus, Search, Phone, MapPin, Trash2, Edit2, X, Image as ImageIcon, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { uploadImage } from '../../services/imageService';

const AdminDirectory = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        businessName: '',
        category: '',
        owner: '',
        phone: '',
        location: '',
        description: '',
        imageUrl: ''
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);
    const { success, error } = useToast();

    const categories = [
        "Artisans (Carpenter, Plumber, etc.)",
        "Agriculture & Farming",
        "Education & Teaching",
        "Health & Wellness",
        "Retail & Shops",
        "Food & Catering",
        "Transportation",
        "Professional Services",
        "Other"
    ];

    useEffect(() => {
        const q = query(collection(db, 'directory'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const url = await uploadImage(file, 'directory');
                setFormData(prev => ({ ...prev, imageUrl: url }));
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
        setLoading(true);
        try {
            if (editingId) {
                await updateDoc(doc(db, 'directory', editingId), {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'directory'), {
                    ...formData,
                    createdAt: serverTimestamp()
                });
            }
            resetForm();
            success(editingId ? "Listing updated successfully" : "Listing created successfully");
        } catch (err) {
            console.error("Error saving listing:", err);
            error("Failed to save listing");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            businessName: '',
            category: '',
            owner: '',
            phone: '',
            location: '',
            description: '',
            imageUrl: ''
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const startEdit = (listing) => {
        setFormData({
            businessName: listing.businessName,
            category: listing.category,
            owner: listing.owner,
            phone: listing.phone,
            location: listing.location,
            description: listing.description,
            imageUrl: listing.imageUrl || ''
        });
        setEditingId(listing.id);
        setIsAdding(true);
    };

    const handleDeleteClick = (id) => {
        setListingToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        try {
            await deleteDoc(doc(db, 'directory', listingToDelete));
            success("Listing deleted successfully");
        } catch (err) {
            console.error("Error deleting listing:", err);
            error("Failed to delete listing");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Afife Yellow Pages</h2>
                    <p className="text-gray-500">Manage local business and service listings.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-afife-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    {isAdding ? 'Cancel' : 'Add New Listing'}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-12"
                    >
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Business/Service Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                        placeholder="e.g., Mensah's Carpentry Workshop"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                    >
                                        <option value="">Select a Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Person</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.owner}
                                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                            className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl"
                                            placeholder="Owner's Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl"
                                            placeholder="024 000 0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location/Address</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl"
                                        placeholder="e.g., Near the main market, Afife"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description of Services</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl h-32"
                                        placeholder="Describe what this business offers..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Business Photo</label>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                {formData.imageUrl ? (
                                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1 font-medium italic">OR Paste Image URL</p>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                <input
                                                    type="url"
                                                    value={formData.imageUrl}
                                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                    className="w-full p-4 pl-12 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                                                    placeholder="Paste image link here"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-afife-primary text-white rounded-xl font-bold hover:bg-afife-accent transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <Loader className="animate-spin" /> : (editingId ? 'Update Listing' : 'Create Listing')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                    <motion.div
                        layout
                        key={listing.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="h-40 bg-gray-200 relative">
                            {listing.imageUrl ? (
                                <img src={listing.imageUrl} alt={listing.businessName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={48} strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={() => startEdit(listing)}
                                    className="p-2 bg-white/90 backdrop-blur-sm text-afife-primary rounded-lg shadow-sm hover:bg-white"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(listing.id)}
                                    className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-white"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-afife-primary text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                {listing.category}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-xl text-gray-800 mb-1">{listing.businessName}</h3>
                            <p className="text-sm text-afife-accent font-medium mb-3">{listing.owner}</p>
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Phone size={14} className="text-afife-secondary" />
                                    <span>{listing.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <MapPin size={14} className="text-afife-secondary" />
                                    <span>{listing.location}</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2">{listing.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            {listings.length === 0 && !loading && (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Search className="mx-auto text-gray-100 mb-4" size={64} />
                    <p className="text-gray-400">No listings yet. Add the first local expert!</p>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Remove Listing?"
                message="Are you sure you want to remove this business listing? This action cannot be undone."
                confirmText="Remove Listing"
                isDangerous={true}
            />
        </div >
    );
};

export default AdminDirectory;
