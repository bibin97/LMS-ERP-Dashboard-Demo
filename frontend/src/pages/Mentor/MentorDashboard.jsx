import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Users, CalendarClock, ListTodo, CheckCircle2, Phone, MessageSquare, Activity, ChevronRight, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => {
    const isTeal = color.includes('008080') || color.includes('14B8A6');
    const displayColor = isTeal ? 'bg-[#14B8A6]' : color;
    
    return (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${displayColor} opacity-[0.05] rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <div className="flex flex-col gap-8 relative z-10">
                <div className={`w-14 h-14 ${displayColor.replace('bg-', 'text-')} bg-slate-50/50 rounded-[20px] flex items-center justify-center border border-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-4xl font-black text-slate-800 tabular-nums tracking-tighter leading-none mb-2">{value}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{title}</p>
                </div>
            </div>
        </div>
    );
};

const SessionCard = ({ session, isLive, isPast }) => (
    <div className={`p-7 rounded-[32px] border transition-all duration-500 relative group overflow-hidden h-full flex flex-col ${isLive
        ? 'bg-gradient-to-br from-[#0F766E] to-[#14B8A6] border-[#14B8A6] shadow-xl shadow-[#14B8A6]/20'
        : isPast ? 'bg-slate-50/80 border-slate-100 opacity-70 hover:opacity-100' : 'bg-white border-slate-100 hover:border-[#14B8A6]/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]'
        }`}>
        {isLive && (
            <div className="absolute top-0 right-0 p-5">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Live</span>
                </div>
            </div>
        )}

        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${isLive ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <CalendarClock size={16} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className={`text-[8px] font-black uppercase tracking-widest ${isLive ? 'text-white/60' : 'text-slate-400'}`}>Session Date</p>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isLive ? 'text-white' : 'text-slate-800'}`}>
                        {new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border ${isLive ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-[#14B8A6]'}`}>
                <Clock size={12} className="opacity-70" />
                <span className="text-[11px] font-black italic tracking-tight">
                    {session.start_time ? session.start_time.substring(0, 5) : 'TBD'}
                </span>
            </div>
        </div>

        <div className="mb-8 flex-1">
            <h4 className={`text-lg font-black tracking-tight leading-tight mb-3 transition-colors uppercase italic ${isLive ? 'text-white' : 'text-slate-900 group-hover:text-[#14B8A6]'}`}>
                {session.topic || 'General Session Analyst'}
            </h4>
            <div className="flex items-center gap-2 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white' : 'bg-[#14B8A6]'}`}></div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-white/70' : 'text-slate-400'}`}>
                    Student: <span className={isLive ? 'text-white' : 'text-slate-800'}>{session.student_name || 'N/A'}</span>
                </p>
            </div>
        </div>

        {isLive && session.meeting_link && (
            <a 
                href={session.meeting_link.startsWith('http') ? session.meeting_link : `https://${session.meeting_link}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="group/btn block w-full text-center bg-white text-[#14B8A6] py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mb-6 hover:shadow-xl transition-all active:scale-95 border border-white/50"
            >
                Launch Protocol <span className="ml-2 transition-transform group-hover/btn:translate-x-1 inline-block">→</span>
            </a>
        )}

        <div className={`flex items-center gap-4 mt-auto pt-6 border-t ${isLive ? 'border-white/10' : 'border-slate-50'}`}>
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-sm font-black shadow-sm ${isLive ? 'bg-white text-[#14B8A6]' : 'bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white'}`}>
                {session.faculty_name?.charAt(0)}
            </div>
            <div>
                <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 ${isLive ? 'text-white/50' : 'text-slate-300'}`}>Primary Faculty</p>
                <p className={`text-[11px] font-black uppercase tracking-tight italic ${isLive ? 'text-white' : 'text-slate-700'}`}>{session.faculty_name}</p>
            </div>
        </div>
    </div>
);

const MilestoneAlert = ({ count, navigate }) => (
    <div className="bg-rose-50/50 backdrop-blur-md border border-rose-100 p-10 rounded-[32px] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-8 duration-700 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 text-center sm:text-left">
            <div className="w-20 h-20 bg-rose-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-rose-200 rotate-3 animate-pulse group-hover:rotate-6 transition-transform">
                <BookOpen size={36} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none mb-2">Priority Conflict Detected</h3>
                <p className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.2em] leading-relaxed max-w-lg">
                    System identify <span className="underline decoration-2">{count} assessment sequences</span> awaiting evaluation. Immediate clearance required for compliance.
                </p>
            </div>
        </div>
        <button 
            onClick={() => navigate('/mentor/exams')}
            className="w-full lg:w-auto flex items-center justify-center gap-4 bg-slate-900 border border-slate-800 text-white px-10 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.25em] shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 italic group/btn relative z-10"
        >
            Execute Assessment Log <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
    </div>
);

const MentorDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalSessions: 0,
        pendingTasks: 0,
        completedTasks: 0,
        pendingExams: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/mentor/dashboard');
            // Fetch pending exams count separately if not in dashboard stats
            const examsRes = await api.get('/mentor/exams/pending');
            setStats({
                ...res.data.data,
                pendingExams: examsRes.data.data.length
            });
        } catch (error) {
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Initializing Dashboard Data...</div>;

    return (
        <div className="flex flex-col gap-10 pb-10">
            {/* Header Section */}
            <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Mentor Oversight</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse"></div>
                        Real-time trajectory tracking & academic audit pulse
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50/50 px-6 py-4 rounded-[20px] border border-slate-100/50 shadow-inner">
                    <Clock size={16} strokeWidth={3} className="text-slate-400" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] italic leading-none">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Assessment Milestone Alerts */}
            {stats.pendingExams > 0 && (
                <MilestoneAlert count={stats.pendingExams} navigate={navigate} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard
                    title="Assigned Students"
                    value={stats.totalStudents}
                    icon={Users}
                    color="bg-[#14B8A6]"
                />
                <StatCard
                    title="Scheduled Sessions"
                    value={stats.totalSessions}
                    icon={CalendarClock}
                    color="bg-[#6366F1]"
                />
                <StatCard
                    title="Action Pendency"
                    value={stats.pendingTasks}
                    icon={ListTodo}
                    color="bg-[#F59E0B]"
                />
                <StatCard
                    title="Protocol Success"
                    value={stats.completedTasks}
                    icon={CheckCircle2}
                    color="bg-[#10B981]"
                />
                <StatCard
                    title="Student Reach"
                    value={stats.totalStudentInteractions}
                    icon={Users}
                    color="bg-[#14B8A6]"
                />
                 <StatCard
                    title="Faculty Nexus"
                    value={stats.totalFacultyInteractions}
                    icon={Users}
                    color="bg-[#EC4899]"
                />
            </div>

            {/* Academic Session Intelligence Area */}
            <div className="bg-white/70 backdrop-blur-xl p-10 md:p-12 rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
                <div className="mb-16">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-3">Academic Session Intel</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Multi-tier synchronization of high-impact learning squads</p>
                </div>

                <div className="space-y-20">
                    {/* 1. Live Sessions Section */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-1.5 h-10 bg-[#14B8A6] rounded-full animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.3)]"></div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight flex items-center gap-4">
                                Active Protocols
                                {stats.liveSessions?.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-ping"></div>
                                        <span className="text-[10px] text-[#14B8A6]">{stats.liveSessions.length} LIVE</span>
                                    </div>
                                )}
                            </h3>
                            <div className="h-[1px] flex-1 bg-slate-100 opacity-50"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {stats.liveSessions?.length > 0 ? (
                                stats.liveSessions.map((session, idx) => (
                                    <SessionCard key={`live-${idx}`} session={session} isLive={true} />
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 group transition-all duration-700">
                                    <Activity className="mx-auto text-slate-200 mb-4 group-hover:text-[#14B8A6] transition-colors" size={48} strokeWidth={1} />
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] italic">No active protocols detected in this sector</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Upcoming Sessions Section */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-1.5 h-10 bg-slate-200 rounded-full"></div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Future Sequences</h3>
                            <div className="h-[1px] flex-1 bg-slate-100 opacity-50"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {stats.upcomingSessions?.length > 0 ? (
                                stats.upcomingSessions.slice(0, 8).map((session, idx) => (
                                    <SessionCard key={`upcoming-${idx}`} session={session} isLive={false} />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">No future sessions scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Concluded Sessions Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-slate-300 rounded-full"></div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic">Recently Concluded</h3>
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {stats.pastSessions?.length > 0 ? (
                                stats.pastSessions.slice(0, 4).map((session, idx) => (
                                    <SessionCard key={`past-${idx}`} session={session} isLive={false} isPast={true} />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">No historical session data discovered</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MentorDashboard;
