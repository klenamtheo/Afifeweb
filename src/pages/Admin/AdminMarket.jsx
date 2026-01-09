
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, ShoppingBag, Phone, Tag, Image, Loader } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminMarket = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        vendor: '',
        category: 'Food',
        phone: '',
        imageUrl: ''
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'market'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleOpenModal = (product = null) => {
        setImageFile(null);
        if (product) {
            setCurrentProduct(product);
            setImagePreview(product.imageUrl || null);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                vendor: product.vendor,
                category: product.category,
                phone: product.phone,
                imageUrl: product.imageUrl || ''
            });
        } else {
            setCurrentProduct(null);
            setImagePreview(null);
            setFormData({ name: '', description: '', price: '', vendor: '', category: 'Food', phone: '', imageUrl: '' });
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

            // Only attempt upload if a file is selected and we want to stick with the upload path
            // For free tier users, if uploadBytes fails (CORS/Upgrade), it will catch and they can use the URL field
            if (imageFile) {
                try {
                    finalImageUrl = await uploadImage(imageFile, 'market');
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

            if (currentProduct) {
                await updateDoc(doc(db, 'market', currentProduct.id), {
                    ...dataToSave,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'market'), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            error("Failed to save product: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setProductToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteDoc(doc(db, 'market', productToDelete));
            success("Product deleted successfully");
        } catch (err) {
            console.error("Error deleting product:", err);
            error("Failed to delete product");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Marketplace</h1>
                    <p className="text-gray-500">Manage products and vendors.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No products in the marketplace.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                            <div className="h-40 bg-gray-100 relative">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ShoppingBag size={40} />
                                    </div>
                                )}
                                <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-bold text-afife-primary shadow-sm">
                                    {product.category}
                                </span>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                                    <span className="font-bold text-afife-secondary">₵{product.price}</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                    <Tag size={16} /> {product.vendor}
                                    <span className="mx-1">•</span>
                                    <Phone size={16} /> {product.phone}
                                </div>
                                <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">{currentProduct ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (₵)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Food</option>
                                        <option>Crafts</option>
                                        <option>Services</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Vendor Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.vendor}
                                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
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
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows="3"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                        currentProduct ? 'Update Product' : 'Add Product'
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
                title="Delete Product?"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete Product"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminMarket;
