
import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { MessageSquare, Send, User, ChevronRight, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminRequests = () => {
    const [chats, setChats] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch unique user threads
    useEffect(() => {
        const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            const allMsgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Group by userId to get "conversations"
            const threads = {};
            allMsgs.forEach(msg => {
                if (!threads[msg.userId]) {
                    threads[msg.userId] = {
                        userId: msg.userId,
                        userName: msg.userName,
                        lastMessage: msg.message,
                        lastDate: msg.createdAt,
                        unread: !msg.read && msg.sender === 'user'
                    };
                }
            });
            setChats(Object.values(threads));
        });
        return () => unsubscribe();
    }, []);

    // Fetch messages for selected thread
    useEffect(() => {
        if (!selectedUserId) return;

        const q = query(
            collection(db, 'requests'),
            where('userId', '==', selectedUserId),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [selectedUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        setSending(true);
        try {
            const selectedChat = chats.find(c => c.userId === selectedUserId);
            await addDoc(collection(db, 'requests'), {
                userId: selectedUserId,
                userName: selectedChat.userName,
                message: newMessage,
                sender: 'admin',
                createdAt: serverTimestamp(),
                read: true
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending response:", error);
        } finally {
            setSending(false);
        }
    };

    const filteredChats = chats.filter(c =>
        c.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar: Chat List */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-100 bg-white">
                    <h2 className="font-bold text-gray-800 mb-3">Support Conversations</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-afife-primary/20 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredChats.map(chat => (
                        <button
                            key={chat.userId}
                            onClick={() => setSelectedUserId(chat.userId)}
                            className={`w-full p-4 flex items-center gap-3 border-b border-gray-50 transition-colors text-left ${selectedUserId === chat.userId ? 'bg-afife-primary/5 border-l-4 border-l-afife-primary' : 'hover:bg-gray-100'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="font-bold text-sm text-gray-900 truncate">{chat.userName}</span>
                                    {chat.unread && <span className="w-2 h-2 bg-afife-primary rounded-full"></span>}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>
                    ))}
                    {filteredChats.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm italic">No conversations found</div>
                    )}
                </div>
            </div>

            {/* Main: Chat View */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedUserId ? (
                    <>
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                            <div className="w-8 h-8 rounded-full bg-afife-primary/10 text-afife-primary flex items-center justify-center font-bold">
                                {chats.find(c => c.userId === selectedUserId)?.userName?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-gray-800">
                                {chats.find(c => c.userId === selectedUserId)?.userName}
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                            {messages.map(msg => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isAdmin ? 'bg-gray-800 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                                            <p className="text-sm leading-relaxed">{msg.message}</p>
                                            <p className={`text-[10px] mt-1 ${isAdmin ? 'text-gray-400' : 'text-gray-400'} text-right`}>
                                                {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'sending...'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your response..."
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-afife-primary/20 outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-afife-primary text-white p-3 rounded-xl hover:bg-afife-primary/90 transition-colors disabled:opacity-50 shadow-md shadow-afife-primary/20"
                                >
                                    {sending ? <span className="animate-spin inline-block">/</span> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRequests;
