import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, X, Image, Loader, Upload, Type } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Form State
    const [baseDescription, setBaseDescription] = useState('');
    const [baseTitle, setBaseTitle] = useState('');
    const [tag, setTag] = useState('General');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            // Revoke URL to prevent memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress({ current: 0, total: selectedFiles.length });

        try {
            let successCount = 0;

            // Process uploads sequnetially to avoid overwhelming network/browser
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                try {
                    const url = await uploadImage(file, 'gallery');

                    await addDoc(collection(db, 'gallery'), {
                        imageUrl: url,
                        title: baseTitle || 'Gallery Image',
                        description: baseDescription,
                        category: tag,
                        createdAt: serverTimestamp()
                    });

                    successCount++;
                    setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    error(`Failed to upload ${file.name}`);
                }
            }

            if (successCount > 0) {
                success(`Successfully uploaded ${successCount} images`);
                setIsModalOpen(false);
                setBaseTitle('');
                setBaseDescription('');
                setSelectedFiles([]);
                setPreviewUrls([]);
            }
        } catch (err) {
            console.error("Batch upload error:", err);
            error("An error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setImageToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;
        try {
            await deleteDoc(doc(db, 'gallery', imageToDelete));
            success("Image deleted successfully");
        } catch (err) {
            console.error("Error deleting image:", err);
            error("Failed to delete image");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Gallery Management</h1>
                    <p className="text-gray-500">Upload and manage images for the town gallery and festivals.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} /> Add Images
                </button>
            </div>

            {/* Gallery Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading gallery...</div>
                ) : images.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <Image size={48} className="mb-4 opacity-20" />
                        <p>No images found. Upload some photos to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-white font-bold text-sm truncate">{img.title}</p>
                                    <p className="text-gray-300 text-xs truncate mb-2">{img.category}</p>
                                    <button
                                        onClick={() => handleDeleteClick(img.id)}
                                        className="mt-auto bg-red-500 text-white p-2 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} /> <span className="ml-2 text-xs font-bold">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Upload Images</h2>
                            <button onClick={() => !uploading && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-6">
                            {/* File Selection */}
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    disabled={uploading}
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <div className="w-16 h-16 bg-afife-primary/10 text-afife-primary rounded-full flex items-center justify-center mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">Click to Select Images</h3>
                                    <p className="text-gray-500 text-sm">Support multiple files (JPG, PNG, WebP)</p>
                                </div>
                            </div>

                            {/* Selected Files Preview */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-gray-600 uppercase tracking-wider">Selected ({selectedFiles.length})</h4>
                                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={url} alt="preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedFile(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Batch Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="col-span-full">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Type size={18} /> Batch Details
                                    </h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title Prefix (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none bg-white"
                                        placeholder="e.g. Festival Day 1"
                                        value={baseTitle}
                                        onChange={(e) => setBaseTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none bg-white"
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                    >
                                        <option>General</option>
                                        <option>Festival</option>
                                        <option>Development</option>
                                        <option>Community</option>
                                        <option>History</option>
                                    </select>
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none bg-white"
                                        placeholder="Describe these images..."
                                        value={baseDescription}
                                        onChange={(e) => setBaseDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => !uploading && setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-afife-primary text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={uploading || selectedFiles.length === 0}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Uploading {uploadProgress.current}/{uploadProgress.total}...
                                        </>
                                    ) : (
                                        <>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Images` : ''}</>
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
                title="Delete Image?"
                message="Are you sure you want to delete this image? It will be removed from the gallery immediately."
                confirmText="Delete Image"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminGallery;
