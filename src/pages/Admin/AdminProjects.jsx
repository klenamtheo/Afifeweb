
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Briefcase, Activity, Image, Loader } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Ongoing',
        progress: 0,
        imageUrl: ''
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleOpenModal = (project = null) => {
        setImageFile(null);
        if (project) {
            setCurrentProject(project);
            setImagePreview(project.imageUrl || null);
            setFormData({
                title: project.title,
                description: project.description,
                status: project.status,
                progress: project.progress,
                imageUrl: project.imageUrl || ''
            });
        } else {
            setCurrentProject(null);
            setImagePreview(null);
            setFormData({ title: '', description: '', status: 'Ongoing', progress: 0, imageUrl: '' });
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
                    finalImageUrl = await uploadImage(imageFile, 'projects');
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

            if (currentProject) {
                await updateDoc(doc(db, 'projects', currentProject.id), {
                    ...dataToSave,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'projects'), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving project: ", error);
            error("Failed to save project.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setProjectToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await deleteDoc(doc(db, 'projects', projectToDelete));
            success("Project deleted successfully");
        } catch (err) {
            console.error("Error deleting project:", err);
            error("Failed to delete project");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Ongoing': return 'bg-blue-100 text-blue-700';
            case 'Planning': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Community Projects</h1>
                    <p className="text-gray-500">Track development projects and progress.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} /> Add Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No projects tracked yet.</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                            <div className="h-48 bg-gray-100 relative">
                                {project.imageUrl ? (
                                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Briefcase size={40} />
                                    </div>
                                )}
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold shadow-sm ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-800 text-xl mb-2">{project.title}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{project.description}</p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-afife-secondary h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button onClick={() => handleOpenModal(project)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(project.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
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
                            <h2 className="text-xl font-bold text-gray-800">{currentProject ? 'Edit Project' : 'New Project'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option>Planning</option>
                                        <option>Ongoing</option>
                                        <option>Completed</option>
                                        <option>Paused</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Progress (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.progress}
                                        onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Project Image</label>
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
                                        currentProject ? 'Update Project' : 'Add Project'
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
                title="Delete Project?"
                message="Are you sure you want to delete this project? This action cannot be undone."
                confirmText="Delete Project"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminProjects;
