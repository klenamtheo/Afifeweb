
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Calendar, Clock, MapPin, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    useEffect(() => {
        const q = query(collection(db, 'meetings'), orderBy('date', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setMeetings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const selectedMeetings = meetings.filter(m => isSameDay(new Date(m.date), selectedDate));

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--text-main)' }}>Community Meetings</h1>
                <p style={{ color: 'var(--text-muted)' }}>View schedule and agendas for town gatherings.</p>
            </div>

            <div className="rounded-2xl shadow-sm border overflow-hidden flex flex-col lg:flex-row transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                {/* Calendar View */}
                <div className="p-6 md:p-8 flex-1 border-r transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-2 hover:bg-black/5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-2 hover:bg-black/5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {eachDayOfInterval({
                            start: startOfWeek(startOfMonth(currentMonth)),
                            end: endOfWeek(endOfMonth(currentMonth))
                        }).map((day, idx) => {
                            const dayMeetings = meetings.filter(m => isSameDay(new Date(m.date), day));
                            const hasMeeting = dayMeetings.length > 0;
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        if (!isCurrentMonth) setCurrentMonth(day);
                                    }}
                                    className={`
                                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                                        ${isSelected ? 'bg-afife-primary text-white shadow-md scale-105 z-10' : 'hover:bg-black/5'}
                                        ${!isCurrentMonth && !isSelected ? 'opacity-30' : ''}
                                        ${hasMeeting && !isSelected ? 'font-bold border border-afife-primary/30' : ''}
                                    `}
                                    style={{
                                        color: isSelected ? 'white' : 'var(--text-main)',
                                        backgroundColor: hasMeeting && !isSelected ? 'rgba(46, 125, 50, 0.05)' : ''
                                    }}
                                >
                                    <span>{format(day, 'd')}</span>
                                    {hasMeeting && (
                                        <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-afife-primary'}`}></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Agenda View */}
                <div className="w-full lg:w-96 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[600px] custom-scrollbar transition-colors"
                    style={{ backgroundColor: 'var(--bg-main)' }}>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
                        Schedule for {format(selectedDate, 'MMM do, yyyy')}
                    </h3>

                    {loading ? (
                        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Loading...</div>
                    ) : selectedMeetings.length > 0 ? (
                        <div className="space-y-4">
                            {selectedMeetings.map(meeting => (
                                <div key={meeting.id} className="p-5 rounded-xl border shadow-sm transition-colors"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                                    <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--text-main)' }}>{meeting.title}</h4>
                                    <div className="space-y-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-afife-primary" />
                                            <span>{meeting.startTime} - {meeting.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-afife-primary" />
                                            <span>{meeting.location}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg text-sm border"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                                        <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                                            <AlignLeft size={12} /> Agenda
                                        </div>
                                        {meeting.agenda}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-10" style={{ color: 'var(--text-muted)' }}>
                            <Calendar size={48} className="mb-4 opacity-20" />
                            <p>No meetings scheduled for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Meetings;
