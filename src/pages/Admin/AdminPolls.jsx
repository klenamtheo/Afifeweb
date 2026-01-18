
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, StopCircle, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminPolls = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creationLoading, setCreationLoading] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [daysDuration, setDaysDuration] = useState(3);

    const [error, setError] = useState(null);
    const { success: toastSuccess, error: toastError } = useToast();

    // Confirmation Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    useEffect(() => {
        // TEMPORARILY REMOVE ORDERBY TO DEBUG
        const q = query(collection(db, 'polls'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Polls snapshot size:", snapshot.size);
            const pollsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                deadlineDate: doc.data().deadline?.toDate()
            }));
            setPolls(pollsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching polls:", err);
            setError("Failed to load polls. Permission denied or network issue.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        setCreationLoading(true);

        try {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + parseInt(daysDuration));

            await addDoc(collection(db, 'polls'), {
                question,
                deadline,
                createdAt: serverTimestamp(),
                active: true,
                createdBy: 'admin' // In a real app, use auth.currentUser.uid
            });

            setQuestion('');
            setShowForm(false);
            toastSuccess("Poll launched successfully!");
        } catch (error) {
            console.error("Error creating poll:", error);
            toastError("Failed to create poll");
        } finally {
            setCreationLoading(false);
        }
    };

    const handleEndPoll = (pollId) => {
        setConfirmConfig({
            isOpen: true,
            title: "End Poll Early?",
            message: "This will stop accepting new votes. You can delete it later if needed.",
            type: "warning",
            onConfirm: async () => {
                try {
                    await updateDoc(doc(db, 'polls', pollId), {
                        active: false
                    });
                    toastSuccess("Poll ended successfully");
                } catch (error) {
                    console.error(error);
                    toastError("Failed to end poll");
                }
            }
        });
    };

    const handleDeletePoll = (pollId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Delete Poll?",
            message: "This action cannot be undone. All related vote data will be lost.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'polls', pollId));
                    toastSuccess("Poll deleted successfully");
                } catch (error) {
                    console.error(error);
                    toastError("Failed to delete poll");
                }
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-800">Community Polls</h1>
                    <p className="text-gray-500">Manage voting on community issues.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-afife-primary text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-afife-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={20} /> New Poll
                </button>
            </div>

            {/* Create Poll Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Create New Poll</h3>
                    <form onSubmit={handleCreatePoll} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Question / Issue</label>
                            <input
                                type="text"
                                required
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-afife-primary/20 outline-none"
                                placeholder="E.g., Should we build a community center?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Days)</label>
                            <select
                                value={daysDuration}
                                onChange={(e) => setDaysDuration(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-afife-primary/20 outline-none"
                            >
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">1 Week</option>
                                <option value="14">2 Weeks</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creationLoading}
                                className="px-6 py-2 bg-afife-secondary text-white font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                            >
                                {creationLoading ? 'Creating...' : 'Launch Poll'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Polls List */}
            <div className="grid grid-cols-1 gap-6">
                {polls.map(poll => (
                    <PollCard key={poll.id} poll={poll} onEnd={handleEndPoll} onDelete={handleDeletePoll} />
                ))}

                {polls.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <BarChart2 size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No polls have been created yet.</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
        </div>
    );
};

// Separate component to handle individual poll listeners correctly
const PollCard = ({ poll, onEnd, onDelete }) => {
    const [votes, setVotes] = useState({ yes: 0, no: 0, total: 0 });
    const isActive = poll.active && new Date() < poll.deadlineDate;

    useEffect(() => {
        // Listen to subcollection for real-time counting
        const q = collection(db, 'polls', poll.id, 'votes');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let yes = 0;
            let no = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.vote === 'yes') yes++;
                else if (data.vote === 'no') no++;
            });
            setVotes({ yes, no, total: yes + no });
        });
        return () => unsubscribe();
    }, [poll.id]);

    const yesPercent = votes.total === 0 ? 0 : Math.round((votes.yes / votes.total) * 100);
    const noPercent = votes.total === 0 ? 0 : Math.round((votes.no / votes.total) * 100);

    return (
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isActive ? 'border-afife-primary/30' : 'border-gray-200 opacity-90'}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {isActive ? (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                                    Active
                                </span>
                            ) : (
                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                    Closed
                                </span>
                            )}
                            <span className="text-gray-400 text-xs font-medium">
                                Posted {poll.createdAt ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true }) : ''}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-snug">{poll.question}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {isActive && (
                            <button
                                onClick={() => onEnd(poll.id)}
                                title="End Poll Early"
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                                <StopCircle size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(poll.id)}
                            title="Delete Poll"
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Results Visualizer */}
                <div className="space-y-4 mb-6">
                    {/* YES Bar */}
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                            <span className="flex items-center gap-1.5 text-green-700"><CheckCircle size={14} /> Yes (Agree)</span>
                            <span className="text-gray-700">{votes.yes} votes ({yesPercent}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${yesPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* NO Bar */}
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                            <span className="flex items-center gap-1.5 text-red-700"><XCircle size={14} /> No (Disagree)</span>
                            <span className="text-gray-700">{votes.no} votes ({noPercent}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${noPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 font-medium pt-4 border-t border-gray-100">
                    <span>Total Votes: <b className="text-gray-900 text-sm">{votes.total}</b></span>
                    <span>Deadline: {poll.deadlineDate ? format(poll.deadlineDate, 'MMM do, yyyy h:mm a') : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminPolls;
