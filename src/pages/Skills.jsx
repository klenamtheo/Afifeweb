import { useState } from 'react';
import { Code, Globe, PenTool, CheckCircle, ArrowRight, BookOpen, Users, Laptop, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { submitFormToFirestore } from '../services/formService';

const Skills = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        location: 'Afife',
        interest: 'Coding',
        experience: 'Beginner'
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        const result = await submitFormToFirestore('submissions', {
            type: 'skills_connect',
            ...formData
        });

        if (result.success) {
            setStatus('success');
            // Optional: reset form, but maybe user wants to see their info
        } else {
            console.error(result.error);
            setStatus('error');
        }
    };

    const opportunities = [
        {
            id: 1,
            title: "Remote Coding",
            description: "Learn web development, data science, and app creation from global mentors.",
            icon: <Code size={32} className="text-afife-primary" />,
            features: ["HTML/CSS/JS/React", "Python & Data", "Mobile Apps"],
            color: "bg-blue-50"
        },
        {
            id: 2,
            title: "Language Exchange",
            description: "Master new languages through peer-to-peer practice and expert tutoring.",
            icon: <Globe size={32} className="text-afife-secondary" />,
            features: ["English Proficiency", "French for Business", "Ewe Literacy"],
            color: "bg-yellow-50"
        },
        {
            id: 3,
            title: "Digital Trades",
            description: "Acquire vocational skills that can be delivered or managed remotely.",
            icon: <PenTool size={32} className="text-purple-600" />,
            features: ["Graphic Design", "Digital Marketing", "Project Management"],
            color: "bg-purple-50"
        }
    ];

    return (
        <div className="bg-afife-bg min-h-screen font-body">
            {/* Hero Section */}
            <div className="relative bg-afife-primary overflow-hidden pt-32 pb-20 px-4">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="container mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
                    >
                        Skills<span className="text-afife-secondary">Connect</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto mb-10"
                    >
                        Bridging the gap between Afife and the world. Unlock your potential with remote learning opportunities in coding, languages, and modern trades.
                    </motion.p>
                    <motion.a
                        href="#signup"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-afife-secondary text-afife-text font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all transform hover:-translate-y-1"
                    >
                        Join the Program <ArrowRight size={20} />
                    </motion.a>
                </div>
            </div>

            {/* Opportunities Section */}
            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-heading font-bold text-afife-accent mb-4">Remote Learning Paths</h2>
                    <p className="text-gray-600 max-w-xl mx-auto">Choose a path that suits your career goals. All programs are designed to be accessible from anywhere.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {opportunities.map((opp, index) => (
                        <motion.div
                            key={opp.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 bg-white`}
                        >
                            <div className={`w-16 h-16 ${opp.color} rounded-2xl flex items-center justify-center mb-6`}>
                                {opp.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-afife-accent mb-3">{opp.title}</h3>
                            <p className="text-gray-600 mb-6">{opp.description}</p>
                            <ul className="space-y-3">
                                {opp.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                        <CheckCircle size={16} className="text-afife-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Sign Up Section */}
            <section id="signup" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                        {/* Text Content */}
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-afife-accent mb-6">
                                Start Your Journey Today
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Whether you're in Afife or in the Diaspora looking to upskill, SkillsConnect is your gateway. Fill out the form to get matched with a mentor or a course.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-afife-primary">
                                        <Laptop size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">100% Online Options</h4>
                                        <p className="text-sm text-gray-500">Learn from the comfort of your home with flexible schedules.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 text-afife-secondary">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">Community Support</h4>
                                        <p className="text-sm text-gray-500">Join a vibrant community of learners and local experts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">Certified Resources</h4>
                                        <p className="text-sm text-gray-500">Access curated materials from top educational providers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:w-1/2 w-full">
                            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100">
                                {status === 'success' ? (
                                    <div className="text-center py-10">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
                                        <p className="text-gray-600">Thank you for joining SkillsConnect. We will contact you shortly with your next steps.</p>
                                        <button onClick={() => { setStatus('idle'); setFormData({ name: '', contact: '', location: 'Afife', interest: 'Coding', experience: 'Beginner' }); }} className="mt-6 text-afife-primary font-bold hover:underline">
                                            Register another person
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <h3 className="text-xl font-bold text-afife-accent mb-2">Sign Up for SkillsConnect</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-afife-primary focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                                    placeholder="Kofi Mensah"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact (Phone/Email)</label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    required
                                                    value={formData.contact}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-afife-primary focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                                    placeholder="+233..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                                <select
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-afife-primary focus:ring-2 focus:ring-green-100 outline-none transition-all bg-white"
                                                >
                                                    <option>Afife</option>
                                                    <option>Accra (Diaspora)</option>
                                                    <option>International (Diaspora)</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                                                <select
                                                    name="experience"
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-afife-primary focus:ring-2 focus:ring-green-100 outline-none transition-all bg-white"
                                                >
                                                    <option>Beginner (No experience)</option>
                                                    <option>Intermediate (Some knowledge)</option>
                                                    <option>Advanced (Looking for work/mentorship)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Area of Interest</label>
                                            <select
                                                name="interest"
                                                value={formData.interest}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-afife-primary focus:ring-2 focus:ring-green-100 outline-none transition-all bg-white"
                                            >
                                                <option>Coding & Web Development</option>
                                                <option>Data Science & Analytics</option>
                                                <option>Digital Marketing</option>
                                                <option>Graphic Design</option>
                                                <option>Languages (French/English/Ewe)</option>
                                                <option>Vocational Trades (Theory)</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full bg-afife-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-green-700 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {status === 'submitting' ? <><Loader className="animate-spin" size={20} /> Registering...</> : 'Register for Free'}
                                        </button>
                                        <p className="text-xs text-center text-gray-400 mt-4">
                                            By joining, you agree to our community learning guidelines.
                                        </p>
                                        {status === 'error' && <p className="text-red-500 text-sm text-center mt-2">Registration failed. Please try again.</p>}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Skills;
