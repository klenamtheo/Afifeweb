import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Send, MessageSquare, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { logActivity } from '../../utils/activityLogger';

const Requests = () => {
    const { userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
    };

    useEffect(() => {
        if (!userProfile) return;

        const q = query(
            collection(db, 'requests'),
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);

            // Mark unread admin messages as read
            const unreadAdminMsgs = snap.docs.filter(d => d.data().sender === 'admin' && d.data().read === false);
            if (unreadAdminMsgs.length > 0) {
                const batch = writeBatch(db);
                unreadAdminMsgs.forEach(d => {
                    batch.update(doc(db, 'requests', d.id), { read: true });
                });
                batch.commit().catch(err => console.error("Error marking messages as read:", err));
            }
        });

        return () => unsubscribe();
    }, [userProfile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'requests'), {
                userId: userProfile.uid,
                userName: userProfile.fullName,
                message: newMessage,
                sender: 'user',
                createdAt: serverTimestamp(),
                read: false
            });

            // Log activity
            await logActivity(
                userProfile.uid,
                userProfile.fullName,
                `Sent a support message: "${newMessage.substring(0, 30)}${newMessage.length > 30 ? '...' : ''}"`,
                'request'
            );

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="h-[calc(100vh-140px)] flex flex-col rounded-2xl border overflow-hidden shadow-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
            <div className="p-4 border-b flex justify-between items-center transition-colors"
                style={{ backgroundColor: 'rgba(var(--bg-surface-rgb), 0.5)', borderColor: 'var(--border-color)' }}>
                <div>
                    <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                        <MessageSquare size={20} className="text-afife-primary" />
                        Admin Support
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ask for information or follow up on requests.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'var(--bg-main)' }}>
                {messages.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No messages yet. Start a conversation with the administration.
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender === 'user';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${isMe
                                    ? 'bg-afife-primary text-white rounded-br-none'
                                    : 'rounded-bl-none border'
                                }`}
                                style={{
                                    backgroundColor: isMe ? '' : 'var(--bg-surface)',
                                    borderColor: isMe ? '' : 'var(--border-color)',
                                    color: isMe ? 'white' : 'var(--text-main)'
                                }}>
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'} text-right font-medium`}>
                                    {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'sending...'}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your request here..."
                        className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-afife-primary text-white p-3 rounded-xl hover:bg-afife-primary/90 transition-colors disabled:opacity-50"
                    >
                        {sending ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default Requests;
