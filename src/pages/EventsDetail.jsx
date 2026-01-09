import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Calendar, MapPin, Clock, Loader } from 'lucide-react';

const EventsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, 'events', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such document!");
                    navigate('/events');
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-afife-bg flex justify-center items-center">
                <Loader className="animate-spin text-afife-primary" size={40} />
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-afife-bg">
            {/* Header / Hero */}
            <div className={`relative ${event.imageUrl ? 'h-96' : 'h-64 bg-afife-primary'} w-full`}>
                {event.imageUrl && (
                    <>
                        <div className="absolute inset-0 bg-black/50 z-10"></div>
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    </>
                )}
                <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-12">
                    <Link to="/events" className="text-white/80 hover:text-white flex items-center gap-2 mb-6 transition-colors w-fit">
                        <ArrowLeft size={20} /> Back to Events
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4 text-sm font-medium">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold uppercase">{event.type}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock size={16} /> {event.time}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-heading font-bold text-white max-w-4xl">{event.title}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-20 relative z-30">
                    {/* Main Content */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                        <div className="prose prose-lg prose-green max-w-none text-gray-700 whitespace-pre-line">
                            {event.description}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Event Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">Date</p>
                                        <p className="text-gray-800 font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-orange-50 p-2 rounded-lg text-orange-600 mt-1">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">Time</p>
                                        <p className="text-gray-800 font-medium">{event.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-50 p-2 rounded-lg text-afife-primary mt-1">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">Location</p>
                                        <p className="text-gray-800 font-medium">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsDetail;
