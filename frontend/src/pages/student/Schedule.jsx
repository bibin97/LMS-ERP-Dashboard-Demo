import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, MapPin, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const StudentSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Sample sessions for demonstration
    const sessions = [
        { id: 1, title: 'Web Development Basics', time: '10:00 AM', duration: '1h 30m', instructor: 'Dr. Smith', type: 'Online', date: 24 },
        { id: 2, title: 'UI/UX Design Workshop', time: '02:00 PM', duration: '2h', instructor: 'Sarah J.', type: 'Classroom', date: 26 },
        { id: 3, title: 'Database Management', time: '11:00 AM', duration: '1h', instructor: 'Prof. Mike', type: 'Online', date: 27 },
    ];

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const days = Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => i + 1);

    return (
        <div className="flex flex-col gap-10 pb-10 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-10 rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">My Schedule</h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Academic Timeline & Sessions</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/20">
                    <CalendarIcon className="text-teal-400" size={18} />
                    <span className="text-xs font-black text-white uppercase tracking-widest italic">Term 1 • Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <Star className="text-teal-500" size={18} />
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-90 text-slate-600 dark:text-white">
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={nextMonth} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-90 text-slate-600 dark:text-white">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{day}</div>
                            ))}
                            
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square"></div>
                            ))}

                            {days.map(day => {
                                const hasSession = sessions.find(s => s.date === day);
                                return (
                                    <div 
                                        key={day} 
                                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group cursor-pointer
                                            ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}
                                        `}
                                    >
                                        <span className={`text-sm font-black ${day === new Date().getDate() ? 'scale-110' : ''}`}>{day}</span>
                                        {hasSession && (
                                            <div className="absolute bottom-2 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Today's Agenda</h4>
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm group hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${session.type === 'Online' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
                                    {session.type === 'Online' ? <Video size={18} /> : <MapPin size={18} />}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{session.time}</span>
                            </div>
                            <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{session.title}</h5>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500">{session.duration}</span>
                                </div>
                                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                <p className="text-[10px] font-black text-teal-500 uppercase italic">{session.instructor}</p>
                            </div>
                        </div>
                    ))}
                    
                    <button className="w-full py-6 mt-4 rounded-[28px] bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-900/10">
                        View Full Timetable
                        <ChevronRight size={14} className="text-teal-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentSchedule;
