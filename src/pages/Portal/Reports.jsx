
import { useState } from 'react';
import { submitFormToFirestore } from '../../services/formService';
import { AlertTriangle, MapPin, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { logActivity } from '../../utils/activityLogger';

const Reports = () => {
    const { userProfile } = useAuth();
    const [issueType, setIssueType] = useState('Roads');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('idle');

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            await submitFormToFirestore('submissions', {
                type: 'native_report',
                issueType,
                location,
                description,
                userId: userProfile.uid,
                reporterName: userProfile.fullName,
                reporterEmail: userProfile.email,
                status: 'pending',
                createdAt: new Date()
            });

            // Log activity
            await logActivity(
                userProfile.uid,
                userProfile.fullName,
                `Reported an issue: ${issueType}`,
                'report',
                description.substring(0, 50) + (description.length > 50 ? '...' : '')
            );

            setStatus('success');
            setLocation('');
            setDescription('');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-3xl mx-auto"
        >
            <div className="mb-8 font-heading">
                <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Report an Issue</h1>
                <p style={{ color: 'var(--text-muted)' }}>Report infrastructure, sanitation, or security concerns directly to the council.</p>
            </div>

            {status === 'success' ? (
                <div className="p-12 rounded-2xl border text-center transition-colors shadow-lg"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Report Submitted</h2>
                    <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Your report has been securely transmitted to the administration. You can track this issue in the "Requests" tab if admin follow-up is required.
                    </p>
                    <button onClick={() => setStatus('idle')} className="text-afife-primary font-bold hover:underline">
                        Submit another report
                    </button>
                </div>
            ) : (
                <div className="p-8 rounded-2xl border transition-colors shadow-lg"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Category</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Roads', 'Water', 'Electricity', 'Sanitation', 'Security', 'Other'].map(cat => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setIssueType(cat)}
                                        className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${issueType === cat
                                                ? 'bg-afife-primary text-white border-afife-primary'
                                                : 'hover:bg-black/5'
                                            }`}
                                        style={{
                                            backgroundColor: issueType === cat ? '' : 'var(--bg-main)',
                                            borderColor: issueType === cat ? '' : 'var(--border-color)',
                                            color: issueType === cat ? 'white' : 'var(--text-main)'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Specific Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                    <MapPin size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    placeholder="e.g. Main Market Entrance, near Post Office"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Detailed Description</label>
                            <textarea
                                rows="5"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                placeholder="Describe the issue clearly..."
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                            >
                                {status === 'submitting' ? <Loader className="animate-spin" size={24} /> : <><AlertTriangle size={24} /> Submit Report</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </motion.div>
    );
};

export default Reports;
