import { Mail, Phone, MapPin, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import { useState } from 'react';
import { submitFormToFirestore } from '../services/formService';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        subject: 'General Concern',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Simple validation
        if (!formData.contact || !formData.message) {
            alert("Please provide contact info and a message.");
            setStatus('idle');
            return;
        }

        const result = await submitFormToFirestore('submissions', {
            type: 'contact_concern',
            ...formData
        });

        if (result.success) {
            setStatus('success');
            setFormData({ name: '', contact: '', subject: 'General Concern', message: '' });
        } else {
            console.error(result.error);
            setStatus('error');
        }
    };

    return (
        <div className="bg-afife-bg min-h-screen pt-24">
            <section className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Contact Info */}
                    <div className="lg:w-1/3 space-y-8">
                        <div>
                            <h3 className="font-bold text-2xl text-afife-accent mb-4">Get in Touch</h3>
                            <p className="text-gray-600 mb-6">Reach out to the Traditional Council or Town Committee for general inquiries.</p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-afife-primary"><Phone size={20} /></div>
                                    <div>
                                        <span className="block font-bold text-gray-800">Phone</span>
                                        <span className="text-gray-600">+233 54 627 7605</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-afife-primary"><Mail size={20} /></div>
                                    <div>
                                        <span className="block font-bold text-gray-800">Email</span>
                                        <span className="text-gray-600">afifetownweb@gmail.com</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-afife-primary"><MapPin size={20} /></div>
                                    <div>
                                        <span className="block font-bold text-gray-800">Address</span>
                                        <span className="text-gray-600">Afife Traditional Council, VR, Ghana</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voice Concerns Form */}
                    <div className="lg:w-2/3 bg-white p-8 rounded-2xl shadow-lg border-t-8 border-afife-secondary">
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="text-afife-secondary w-8 h-8" />
                            <h2 className="font-heading text-2xl font-bold text-afife-accent">Voice Out Concerns</h2>
                        </div>
                        <p className="text-gray-600 mb-8">
                            Have a pressing issue or concern regarding community welfare? Share it with us directly.
                            Your submission can be anonymous if preferred.
                        </p>

                        {status === 'success' ? (
                            <div className="text-center py-8 bg-green-50 rounded-xl">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                                <p className="text-gray-600 mb-6">Your concern has been submitted to the administration.</p>
                                <button onClick={() => setStatus('idle')} className="text-afife-primary font-bold hover:underline">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Name (Optional)</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-afife-primary focus:ring-1 focus:ring-afife-primary"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email / Phone</label>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-afife-primary focus:ring-1 focus:ring-afife-primary"
                                            placeholder="Contact Info"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-afife-primary focus:ring-1 focus:ring-afife-primary"
                                    >
                                        <option>General Concern</option>
                                        <option>Welfare</option>
                                        <option>Security</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea
                                        rows="4"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-afife-primary focus:ring-1 focus:ring-afife-primary"
                                        placeholder="Describe your concern in detail..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full md:w-auto px-8 py-3 bg-afife-accent text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    {status === 'submitting' ? <><Loader className="animate-spin" size={20} /> Sending...</> : 'Submit Concern'}
                                </button>
                                {status === 'error' && <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>}
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-[400px] w-full relative z-0">
                <iframe
                    width="100%"
                    height="100%"
                    id="gmap_canvas"
                    src="https://maps.google.com/maps?q=Afife%2C%20Ketu%20North%20Municipal%2C%20Volta%20Region%2C%20Ghana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    title="Afife Location Map"
                    className="filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                ></iframe>
            </section>
        </div>
    );
};

export default Contact;
