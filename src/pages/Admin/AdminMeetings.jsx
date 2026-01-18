
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Calendar, Trash2, Plus, Clock, MapPin, AlignLeft } from 'lucide-react';

const AdminMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        agenda: ''
    });

    useEffect(() => {
        const q = query(collection(db, 'meetings'), orderBy('date', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMeetings(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, 'meetings'), {
                ...formData,
                createdAt: serverTimestamp()
            });
            setFormData({
                title: '',
                date: '',
                startTime: '',
                endTime: '',
                location: '',
                agenda: ''
            });
            setShowForm(false);
        } catch (error) {
            console.error("Error adding meeting: ", error);
            alert("Failed to schedule meeting");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to cancel this meeting?')) {
            try {
                await deleteDoc(doc(db, 'meetings', id));
            } catch (error) {
                console.error("Error deleting meeting: ", error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Manage Meetings</h1>
                    <p className="text-gray-500">Schedule and manage community meetings and agendas</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-afife-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-afife-primary/90 transition-colors"
                >
                    {showForm ? 'Cancel' : <><Plus size={20} /> Schedule Meeting</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Schedule New Meeting</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Title</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                        placeholder="e.g. Town Hall Meeting"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Clock size={18} />
                                    </div>
                                    <input
                                        type="time"
                                        name="startTime"
                                        required
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Clock size={18} />
                                    </div>
                                    <input
                                        type="time"
                                        name="endTime"
                                        required
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                        placeholder="e.g. Community Center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Agenda</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                                    <AlignLeft size={18} />
                                </div>
                                <textarea
                                    name="agenda"
                                    required
                                    value={formData.agenda}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    placeholder="Outline the main topics to be discussed..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-afife-primary text-white px-8 py-2 rounded-lg font-bold hover:bg-afife-primary/90 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center">
                    <h2>Scheduled Meetings</h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{meetings.length} Upcoming</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading schedule...</div>
                ) : meetings.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No meetings scheduled yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {meetings.map((meeting) => (
                            <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 bg-afife-primary/10 rounded-xl flex flex-col items-center justify-center text-afife-primary border border-afife-primary/20">
                                            <span className="text-xs font-bold uppercase">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl font-black">{new Date(meeting.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 mb-1">{meeting.title}</h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-2">
                                                <span className="flex items-center gap-1"><Clock size={14} /> {meeting.startTime} - {meeting.endTime}</span>
                                                <span className="flex items-center gap-1"><MapPin size={14} /> {meeting.location}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 md:line-clamp-1">{meeting.agenda}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(meeting.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start md:self-center opacity-100 md:opacity-0 group-hover:opacity-100"
                                        title="Cancel Meeting"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMeetings;
