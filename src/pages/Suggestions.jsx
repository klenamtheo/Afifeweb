import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { sendAdminNotification } from '../services/notificationService';
import { MessageSquare, ThumbsUp, Send, User, Calendar, Loader, Lightbulb, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        suggestion: '',
        category: 'General'
    });

    const categories = ["General", "Infrastructure", "Education", "Healthcare", "Environment", "Culture"];

    useEffect(() => {
        const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSuggestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.suggestion.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'suggestions'), {
                name: formData.name || 'Anonymous Resident',
                suggestion: formData.suggestion,
                category: formData.category,
                upvotes: 0,
                createdAt: serverTimestamp()
            });
            setFormData({ name: '', suggestion: '', category: 'General' });

            // Send admin notification
            await sendAdminNotification('suggestion', {
                message: `New community suggestion from ${formData.name || 'Anonymous'}: "${formData.suggestion.substring(0, 100)}${formData.suggestion.length > 100 ? '...' : ''}"`,
                userName: formData.name || 'Anonymous',
                category: formData.category
            });
        } catch (error) {
            console.error("Error adding suggestion:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpvote = async (id) => {
        try {
            const suggestionRef = doc(db, 'suggestions', id);
            await updateDoc(suggestionRef, {
                upvotes: increment(1)
            });
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Section */}
            <section className="bg-afife-primary pt-32 pb-20 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-afife-secondary font-bold text-sm"
                        >
                            <Lightbulb size={16} />
                            Your Voice Matters
                        </motion.div>
                        <h1 className="font-heading text-5xl font-bold mb-6">Citizens' Voice</h1>
                        <p className="text-xl opacity-90 font-light mb-12">
                            Share your suggestions for a better Afife. Upvote the best ideas to help our traditional council prioritize what matters most to you.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-10 pb-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Suggestion Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-24">
                            <h3 className="text-2xl font-bold text-afife-accent mb-6 flex items-center gap-2">
                                <Send className="text-afife-primary" size={24} />
                                Post a Suggestion
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name (Optional)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-4 pl-12 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-afife-primary outline-none transition-all"
                                            placeholder="e.g., Kofi Mensah"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-afife-primary outline-none"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Idea / Suggestion</label>
                                    <textarea
                                        required
                                        value={formData.suggestion}
                                        onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                                        className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl h-40 focus:ring-2 focus:ring-afife-primary outline-none resize-none"
                                        placeholder="What can we improve in Afife?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-afife-primary text-white rounded-2xl font-bold hover:bg-afife-accent transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-afife-primary/30"
                                >
                                    {isSubmitting ? <Loader className="animate-spin" /> : <><Send size={18} /> Submit Automatically</>}
                                </button>
                                <p className="text-[10px] text-center text-gray-400">
                                    Suggestions are public and will appear immediately.
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Suggestions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-afife-accent flex items-center gap-2">
                                <TrendingUp className="text-afife-secondary" />
                                Community Ideas
                            </h2>
                            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                                {suggestions.length} Submissions
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-50">
                                <Loader className="animate-spin text-afife-primary mb-4" size={48} />
                                <p className="text-gray-400">Loading community voices...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <AnimatePresence mode="popLayout">
                                    {suggestions.map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={item.id}
                                            className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="bg-afife-primary/10 text-afife-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                            {item.category}
                                                        </div>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {item.createdAt?.toDate().toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-lg text-gray-800 font-medium leading-relaxed mb-6">
                                                        "{item.suggestion}"
                                                    </p>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                                                        <div className="w-8 h-8 bg-afife-secondary/20 rounded-full flex items-center justify-center text-afife-secondary">
                                                            <User size={16} />
                                                        </div>
                                                        {item.name}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleUpvote(item.id)}
                                                    className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl group/vote hover:bg-afife-secondary hover:text-white transition-all shadow-sm"
                                                >
                                                    <ThumbsUp className="mb-2 transition-transform group-active/vote:scale-125" size={24} />
                                                    <span className="font-black text-xl">{item.upvotes || 0}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">Support</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {suggestions.length === 0 && (
                                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <MessageSquare className="mx-auto text-gray-100 mb-4" size={64} />
                                        <p className="text-gray-400">Quiet for now. Be the first to share an idea!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Suggestions;
