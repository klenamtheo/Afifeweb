import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    increment
} from 'firebase/firestore';
import { MessageSquare, Trash2, ThumbsUp, User, Clock, Shield, Search, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [suggestionToDelete, setSuggestionToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSuggestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteClick = (id) => {
        setSuggestionToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!suggestionToDelete) return;
        try {
            await deleteDoc(doc(db, 'suggestions', suggestionToDelete));
            success("Suggestion deleted successfully");
        } catch (err) {
            console.error("Error deleting suggestion:", err);
            error("Failed to delete suggestion");
        }
    };

    const filteredSuggestions = suggestions.filter(s =>
        s.suggestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Citizens' Voice Board</h2>
                    <p className="text-gray-500">Moderate and review community suggestions.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search suggestions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-afife-primary outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="animate-spin text-afife-primary" size={48} />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">Detail</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Stats</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="p-6 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSuggestions.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6 max-w-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-afife-secondary/10 rounded-full flex items-center justify-center text-afife-secondary shrink-0">
                                                    <MessageSquare size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 mb-1 leading-relaxed">
                                                        {item.suggestion}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1 font-bold text-afife-accent">
                                                            <User size={12} />
                                                            {item.name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {item.createdAt?.toDate().toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-sm">
                                                <ThumbsUp size={14} />
                                                {item.upvotes || 0}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 bg-afife-primary/10 text-afife-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Suggestion"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredSuggestions.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mt-6">
                    <Shield className="mx-auto text-gray-100 mb-4" size={64} />
                    <p className="text-gray-400">No suggestions match your search.</p>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Suggestion?"
                message="Are you sure you want to delete this suggestion? This action cannot be undone."
                confirmText="Delete Suggestion"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminSuggestions;
