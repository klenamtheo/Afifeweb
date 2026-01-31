import { AlertTriangle, Lightbulb, CheckCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { submitFormToFirestore } from '../services/formService';
import { uploadImage } from '../services/imageService';

const Report = () => {
    // Infrastructure Report State
    const [reportData, setReportData] = useState({
        issueType: 'Roads',
        location: '',
        description: '',
        imageUrl: ''
    });
    const [reportStatus, setReportStatus] = useState('idle');
    const [uploading, setUploading] = useState(false);

    // Suggestion State
    const [ideaData, setIdeaData] = useState({
        category: 'Event',
        title: '',
        details: ''
    });
    const [ideaStatus, setIdeaStatus] = useState('idle');

    const handleReportChange = (e) => setReportData({ ...reportData, [e.target.name]: e.target.value });
    const handleIdeaChange = (e) => setIdeaData({ ...ideaData, [e.target.name]: e.target.value });

    const handleReportImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            try {
                const url = await uploadImage(file, 'reports');
                setReportData(prev => ({ ...prev, imageUrl: url }));
            } catch (err) {
                console.error('Upload failed:', err);
                alert('Image upload failed. You can still submit without an image.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setReportStatus('submitting');
        const result = await submitFormToFirestore('submissions', {
            type: 'report_infrastructure',
            ...reportData
        });
        if (result.success) {
            setReportStatus('success');
            setReportData({ issueType: 'Roads', location: '', description: '', imageUrl: '' });
        } else {
            setReportStatus('error');
        }
    };

    const handleIdeaSubmit = async (e) => {
        e.preventDefault();
        setIdeaStatus('submitting');
        const result = await submitFormToFirestore('submissions', {
            type: 'suggest_idea',
            ...ideaData
        });
        if (result.success) {
            setIdeaStatus('success');
            setIdeaData({ category: 'Event', title: '', details: '' });
        } else {
            setIdeaStatus('error');
        }
    };

    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Section */}
            <section className="bg-afife-primary py-24 text-white text-center relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Report & Suggest</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Voice your concerns, report issues, or share your innovative ideas to help build a better Afife.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Report Infrastructure */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-50 text-red-500 rounded-lg">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-gray-800">Report Infrastructure</h2>
                        </div>
                        <p className="text-gray-600 mb-6 font-light">
                            Spotted a broken pipe, pothole, or faulty streetlight? Let us know so we can fix it.
                        </p>

                        {reportStatus === 'success' ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h3 className="font-bold text-lg mb-2">Report Submitted</h3>
                                <p className="text-gray-600 mb-4">Thank you for helping keep Afife safe.</p>
                                <button onClick={() => setReportStatus('idle')} className="text-red-500 font-bold hover:underline">Report another issue</button>
                            </div>
                        ) : (
                            <form onSubmit={handleReportSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                                    <select name="issueType" value={reportData.issueType} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none">
                                        <option>Roads</option>
                                        <option>Water</option>
                                        <option>Electricity</option>
                                        <option>Sanitation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" name="location" value={reportData.location} onChange={handleReportChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none" placeholder="e.g. Near Market Square" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows="3" name="description" value={reportData.description} onChange={handleReportChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Attach Photo (Optional)</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                {reportData.imageUrl ? (
                                                    <img src={reportData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={28} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleReportImageChange}
                                                    disabled={uploading}
                                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 disabled:opacity-50"
                                                />
                                                {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={reportStatus === 'submitting'} className="w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                    {reportStatus === 'submitting' ? <><Loader className="animate-spin" size={18} /> Sending...</> : 'Report Issue'}
                                </button>
                                {reportStatus === 'error' && <p className="text-red-500 text-sm mt-1">Failed to submit. Try again.</p>}
                            </form>
                        )}
                    </div>

                    {/* Suggest Ideas */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-yellow-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                                <Lightbulb size={24} />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-gray-800">Suggest an Idea</h2>
                        </div>
                        <p className="text-gray-600 mb-6 font-light">
                            Got a brilliant idea for the town? A new project or event? Share your creativity!
                        </p>

                        {ideaStatus === 'success' ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h3 className="font-bold text-lg mb-2">Idea Submitted</h3>
                                <p className="text-gray-600 mb-4">We appreciate your contribution to Afife's growth.</p>
                                <button onClick={() => setIdeaStatus('idle')} className="text-yellow-600 font-bold hover:underline">Suggest another idea</button>
                            </div>
                        ) : (
                            <form onSubmit={handleIdeaSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select name="category" value={ideaData.category} onChange={handleIdeaChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none">
                                        <option>Event</option>
                                        <option>Development</option>
                                        <option>Youth</option>
                                        <option>Culture</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" name="title" value={ideaData.title} onChange={handleIdeaChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none" placeholder="Short title for your idea" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                    <textarea rows="3" name="details" value={ideaData.details} onChange={handleIdeaChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-yellow-500 outline-none" placeholder="Explain your idea..."></textarea>
                                </div>
                                <button type="submit" disabled={ideaStatus === 'submitting'} className="w-full py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2">
                                    {ideaStatus === 'submitting' ? <><Loader className="animate-spin" size={18} /> Sending...</> : 'Submit Idea'}
                                </button>
                                {ideaStatus === 'error' && <p className="text-red-500 text-sm mt-1">Failed to submit. Try again.</p>}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Report;
