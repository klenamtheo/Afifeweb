import { User, Briefcase, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const Council = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const leaders = [
        { name: "Torgbuiga Adrakpanya VI", role: "Paramount Chief (Fiaga)", image: null },
        { name: "Torgbui Awusu III", role: "Chief", image: null },
        { name: "Torgbui Alagbo", role: "Awafiaga", image: null },
    ];

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Ongoing': return 'bg-blue-100 text-blue-700';
            case 'Planning': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Section */}
            <section className="bg-afife-primary py-24 text-white text-center relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Traditional Council</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        The custodians of our customs and the leaders guiding our development.
                    </p>
                </div>
                {/* Decorative background element if desired, or keep clean green */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </section>

            <section className="py-16 container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        The Traditional Council ensures order, justice, and progress within the Afife Traditional Area.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {leaders.map((leader, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border-t-4 border-afife-secondary">
                            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
                                {leader.image ? <img src={leader.image} alt={leader.name} /> : <User size={40} className="text-gray-400" />}
                            </div>
                            <h3 className="font-heading text-xl font-bold text-afife-accent mb-1">{leader.name}</h3>
                            <span className="text-afife-primary font-medium">{leader.role}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-white p-10 rounded-2xl shadow-sm text-left">
                    <h2 className="font-heading text-2xl font-bold text-afife-accent mb-6">Council Functions</h2>
                    <ul className="list-disc list-inside space-y-3 text-gray-700">
                        <li>Settlement of disputes and maintenance of peace within the Traditional Area.</li>
                        <li>Organization and oversight of the annual Nyigbla Festival.</li>
                        <li>Mobilization of community resources for developmental projects.</li>
                        <li>Preservation of cultural heritage and customary laws.</li>
                    </ul>
                </div>

                {/* Development Projects Section */}
                <div className="mt-20">
                    <h2 className="font-heading text-3xl font-bold text-gray-800 text-center mb-10">Development Projects</h2>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader className="animate-spin text-afife-primary" size={32} />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                            <p className="text-gray-500">No active projects being tracked currently.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full border border-gray-100">
                                    <div className="h-48 bg-gray-100 relative">
                                        {project.imageUrl ? (
                                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Briefcase size={40} />
                                            </div>
                                        )}
                                        <span className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold shadow-sm ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-xl text-gray-800 mb-2">{project.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                <span>Completion</span>
                                                <span>{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-afife-secondary h-2 rounded-full"
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </section>
        </div>
    );
};

export default Council;
