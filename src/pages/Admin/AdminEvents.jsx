
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Calendar, MapPin, Clock, Image, Loader } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'Community',
        imageUrl: ''
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const { success, error } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleOpenModal = (event = null) => {
        setImageFile(null);
        if (event) {
            setCurrentEvent(event);
            setImagePreview(event.imageUrl || null);
            setFormData({
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                type: event.type,
                imageUrl: event.imageUrl || ''
            });
        } else {
            setCurrentEvent(null);
            setImagePreview(null);
            setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Community', imageUrl: '' });
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
                    finalImageUrl = await uploadImage(imageFile, 'events');
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

            if (currentEvent) {
                await updateDoc(doc(db, 'events', currentEvent.id), {
                    ...dataToSave,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'events'), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving event: ", error);
            error("Failed to save event.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setEventToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        try {
            await deleteDoc(doc(db, 'events', eventToDelete));
            success("Event deleted successfully");
        } catch (err) {
            console.error("Error deleting event:", err);
            error("Failed to delete event");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Events</h1>
                    <p className="text-gray-500">Manage town events and schedules.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} /> Add New Event
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No upcoming events found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Event</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Date & Time</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Location</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{event.title}</div>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">{event.type}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} /> {event.date}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={14} /> {event.time}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} /> {event.location}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(event)} className="p-2 text-gray-500 hover:text-afife-primary hover:bg-green-50 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(event.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">{currentEvent ? 'Edit Event' : 'New Event'}</h2>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Town Hall"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-afife-primary outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Community</option>
                                    <option>Cultural</option>
                                    <option>Meeting</option>
                                    <option>Holiday</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Image</label>
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
                                        currentEvent ? 'Update Event' : 'Create Event'
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
                title="Delete Event?"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmText="Delete Event"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminEvents;
