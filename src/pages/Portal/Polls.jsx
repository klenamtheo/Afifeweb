
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, BarChart2, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const PortalPolls = () => {
    const { currentUser } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Query active polls, or all polls? Let's show all latest ones.
        const q = query(collection(db, 'polls'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pollsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                deadlineDate: doc.data().deadline?.toDate()
            }));

            setPolls(pollsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching native polls:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-12"
        >
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Community Voice</h1>
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Cast your vote on important community decisions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map(poll => (
                    <UserPollCard key={poll.id} poll={poll} userId={currentUser?.uid} />
                ))}

                {polls.length === 0 && !loading && (
                    <div className="col-span-full py-16 text-center rounded-[2.5rem] border border-dashed"
                        style={{ borderColor: 'var(--border-color)' }}>
                        <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold text-lg" style={{ color: 'var(--text-muted)' }}>No active polls at the moment.</p>
                        <p className="text-sm opacity-60">Check back later for new community inquiries.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const UserPollCard = ({ poll, userId }) => {
    const [hasVoted, setHasVoted] = useState(false);
    const [myVote, setMyVote] = useState(null); // 'yes' or 'no'
    const [submitting, setSubmitting] = useState(false);
    const isActive = poll.active && new Date() < poll.deadlineDate;

    // Check if user has voted
    useEffect(() => {
        if (!userId) return;
        const voteRef = doc(db, 'polls', poll.id, 'votes', userId);
        const unsubscribe = onSnapshot(voteRef, (docSnap) => {
            if (docSnap.exists()) {
                setHasVoted(true);
                setMyVote(docSnap.data().vote);
            }
        });
        return () => unsubscribe();
    }, [poll.id, userId]);

    const handleVote = async (choice) => {
        if (!isActive || hasVoted) return;
        setSubmitting(true);
        try {
            await setDoc(doc(db, 'polls', poll.id, 'votes', userId), {
                vote: choice,
                votedAt: serverTimestamp(),
                userId: userId
            });
        } catch (error) {
            console.error("Error voting:", error);
            alert("Failed to record vote. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-[2.5rem] border shadow-lg overflow-hidden flex flex-col h-full transition-all hover:scale-[1.01]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>

            <div className="p-8 flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-afife-primary/10 text-afife-primary text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                        POLL
                    </span>
                    <span className="text-xs font-bold flex items-center gap-1 opacity-60">
                        <Clock size={12} />
                        {poll.createdAt ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true }) : ''}
                    </span>
                </div>

                <h3 className="text-xl font-bold leading-tight mb-6" style={{ color: 'var(--text-main)' }}>
                    {poll.question}
                </h3>

                {hasVoted ? (
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 text-center animate-in zoom-in">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check size={24} strokeWidth={4} />
                        </div>
                        <p className="font-bold text-green-800">Vote Submitted!</p>
                        <p className="text-sm text-green-600 mt-1">
                            You voted <span className="font-black uppercase underline">{myVote}</span>
                        </p>
                    </div>
                ) : isActive ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleVote('yes')}
                            disabled={submitting}
                            className="p-4 rounded-2xl border-2 border-green-500/20 bg-green-50 hover:bg-green-100 hover:border-green-500 text-green-700 transition-all flex flex-col items-center gap-2 group"
                        >
                            <CheckCircle size={32} className="group-hover:scale-110 transition-transform" />
                            <span className="font-black text-lg">YES</span>
                        </button>
                        <button
                            onClick={() => handleVote('no')}
                            disabled={submitting}
                            className="p-4 rounded-2xl border-2 border-red-500/20 bg-red-50 hover:bg-red-100 hover:border-red-500 text-red-700 transition-all flex flex-col items-center gap-2 group"
                        >
                            <XCircle size={32} className="group-hover:scale-110 transition-transform" />
                            <span className="font-black text-lg">NO</span>
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-6 text-center opacity-60">
                        <p className="font-bold text-gray-500">Poll Closed</p>
                    </div>
                )}
            </div>

            {!hasVoted && isActive && (
                <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Voting ends in {poll.deadlineDate ? formatDistanceToNow(poll.deadlineDate) : '...'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PortalPolls;
