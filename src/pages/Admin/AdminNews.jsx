
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, FileText, Image, Loader } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null); // If null, adding new. If object, editing.
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Development',
        imageUrl: ''
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleOpenModal = (post = null) => {
        setImageFile(null);
        if (post) {
            setCurrentPost(post);
            setImagePreview(post.imageUrl || null);
            setFormData({
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                category: post.category,
                imageUrl: post.imageUrl || ''
            });
        } else {
            setCurrentPost(null);
            setImagePreview(null);
            setFormData({ title: '', excerpt: '', content: '', category: 'Development', imageUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let finalImageUrl = formData.imageUrl;

            if (imageFile) {
                try {
                    finalImageUrl = await uploadImage(imageFile, 'news');
                } catch (uploadError) {
                    console.error("Upload failed (expected on free tier):", uploadError);
                    error("Image upload failed (Firebase Storage requires upgrade). Please paste a Direct Image URL instead.");
                    setUploading(false);
                    return;
                }
            }

            const dataToSave = {
                ...formData,
                imageUrl: finalImageUrl
            };

            if (currentPost) {
                await updateDoc(doc(db, 'news', currentPost.id), {
                    ...dataToSave,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'news'), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving news: ", error);
            error("Failed to save article.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setNewsToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!newsToDelete) return;
        try {
            await deleteDoc(doc(db, 'news', newsToDelete));
            success("Article deleted successfully");
        } catch (err) {
            console.error("Error deleting article:", err);
            error("Failed to delete article");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">News & Updates</h1>
                    <p className="text-gray-500">Manage news articles and announcements.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} /> Add New Article
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading articles...</div>
                ) : news.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No news articles found. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Article</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Category</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Date</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <FileText size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-gray-800 line-clamp-1">{item.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{item.excerpt}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{item.category}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {item.createdAt?.toDate().toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-afife-primary hover:bg-green-50 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">{currentPost ? 'Edit Article' : 'New Article'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Development</option>
                                        <option>Culture</option>
                                        <option>Education</option>
                                        <option>Health</option>
                                        <option>Events</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Article Image</label>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Image size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1 font-medium">Upload File (Requires Firebase Upgrade)</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-afife-primary/10 file:text-afife-primary hover:file:bg-afife-primary/20"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1 font-medium italic">OR Paste Image URL (Free & Recommended)</p>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                                value={formData.imageUrl}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, imageUrl: e.target.value });
                                                    setImagePreview(e.target.value);
                                                    setImageFile(null); // Clear imageFile if URL is entered
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Short Excerpt</label>
                                <textarea
                                    rows="2"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Content</label>
                                <textarea
                                    rows="8"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none bg-gray-50 font-mono text-sm"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your article content here..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-afife-primary text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        currentPost ? 'Update Article' : 'Publish Article'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Article?"
                message="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete Article"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminNews;
