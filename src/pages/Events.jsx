
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, MapPin, Clock, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-afife-bg min-h-screen">
            <section className="bg-afife-primary pt-32 pb-20 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Join us in celebrating our culture, community gatherings, and development milestones.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-afife-primary" size={40} />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <p className="text-gray-500 text-lg">No upcoming events scheduled.</p>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {events.map((event) => (
                            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 w-full md:w-24 text-center border border-gray-100 h-fit">
                                    <span className="text-sm font-bold text-red-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-3xl font-heading font-bold text-gray-800">{new Date(event.date).getDate()}</span>
                                    <span className="text-xs text-gray-400">{new Date(event.date).getFullYear()}</span>
                                </div>
                                {event.imageUrl && (
                                    <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 rounded-xl overflow-hidden">
                                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase">{event.type}</span>
                                        <div className="flex items-center text-sm text-gray-500 gap-1">
                                            <Clock size={14} />
                                            {event.time}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h3>
                                    <p className="text-gray-600 mb-4">{event.description}</p>
                                    <div className="flex items-center text-gray-500 gap-2 font-medium">
                                        <MapPin size={18} className="text-afife-primary" />
                                        {event.location}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Link to={`/events/${event.id}`} className="px-6 py-2 border-2 border-afife-primary text-afife-primary font-bold rounded-lg hover:bg-afife-primary hover:text-white transition-colors whitespace-nowrap">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Events;
