
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

import { MessageSquare, Calendar, User, Tag } from 'lucide-react';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            setSubmissions(data);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const getTypeColor = (type) => {
        switch (type) {
            case 'contact_concern': return 'bg-blue-100 text-blue-800';
            case 'skills_connect': return 'bg-purple-100 text-purple-800';
            case 'report_infrastructure': return 'bg-red-100 text-red-800';
            case 'suggest_idea': return 'bg-yellow-100 text-yellow-800';
            case 'native_report': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'contact_concern': return 'Inquiry / Concern';
            case 'skills_connect': return 'Skills Registration';
            case 'report_infrastructure': return 'Infrastructure Report';
            case 'suggest_idea': return 'Idea Suggestion';
            case 'native_report': return 'Citizen Issue Report';
            default: return type;
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading submissions...</div>;

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-800">Submissions</h1>
                    <p className="text-gray-500">View and manage form submissions from the website.</p>
                </div>
                <div className="bg-afife-primary text-white px-4 py-2 rounded-lg font-bold">
                    Total: {submissions.length}
                </div>
            </div>

            <div className="grid gap-6">
                {submissions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <MessageSquare className="mx-auto text-gray-300 w-16 h-16 mb-4" />
                        <h3 className="text-lg font-bold text-gray-600">No submissions yet</h3>
                    </div>
                ) : (
                    submissions.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getTypeColor(item.type)}`}>
                                        {getTypeLabel(item.type)}
                                    </span>
                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                        <Calendar size={14} />
                                        {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
                                    </span>
                                </div>
                                {/* <button className="text-sm text-afife-primary font-bold hover:underline">Mark as Read</button> */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    {/* Dynamic Content based on Type */}
                                    {item.type === 'contact_concern' && (
                                        <>
                                            <h4 className="font-bold text-lg mb-1">{item.subject}</h4>
                                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg md:text-sm leading-relaxed">{item.message}</p>
                                        </>
                                    )}
                                    {item.type === 'report_infrastructure' && (
                                        <>
                                            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">Issue: {item.issueType}</h4>
                                            <p className="text-gray-600 mb-2"><span className="font-bold">Location:</span> {item.location}</p>
                                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg md:text-sm leading-relaxed">{item.description}</p>
                                        </>
                                    )}
                                    {item.type === 'suggest_idea' && (
                                        <>
                                            <h4 className="font-bold text-lg mb-1">{item.title} <span className="text-sm font-normal text-gray-500">({item.category})</span></h4>
                                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg md:text-sm leading-relaxed">{item.details}</p>
                                        </>
                                    )}
                                    {item.type === 'native_report' && (
                                        <>
                                            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">Issue: {item.issueType}</h4>
                                            <p className="text-gray-600 mb-2"><span className="font-bold">Location:</span> {item.location}</p>
                                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg md:text-sm leading-relaxed">{item.description}</p>
                                        </>
                                    )}
                                    {item.type === 'skills_connect' && (
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-bold">{item.interest}</span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{item.experience}</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">{item.location}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm">Registered for SkillsConnect program.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                    <h5 className="font-bold text-gray-400 text-xs uppercase mb-3 text-center md:text-left">Contact Details</h5>
                                    {(item.name || item.reporterName) && (
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-gray-800">{item.name || item.reporterName}</span>
                                                <span className="block text-xs text-gray-500">Name</span>
                                            </div>
                                        </div>
                                    )}
                                    {(item.contact || item.reporterEmail) ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Tag size={16} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-gray-800">{item.contact || item.reporterEmail}</span>
                                                <span className="block text-xs text-gray-500">Contact Info</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic text-center md:text-left">Anonymous</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Submissions;
