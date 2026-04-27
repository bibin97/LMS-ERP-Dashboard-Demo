import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, User, Phone, BookOpen, Clock, Calendar, CheckSquare, MessageSquare, History, Contact } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/Mentor/StatusBadge';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // info, timetable, logs

    useEffect(() => {
        fetchStudentDetails();
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            const res = await api.get(`/mentor/students/${id}`);
            setStudent(res.data.data);
        } catch (error) {
            toast.error("Failed to load student details");
            navigate('/mentor/students');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Accessing Encrypted Profile...</div>;
    if (!student) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate('/mentor/students')}
                className="flex items-center gap-2 text-slate-400 hover:text-[#008080] font-black text-[10px] uppercase tracking-widest transition-colors mb-6"
            >
                <ArrowLeft size={16} /> Back to My Students
            </button>

            {/* Profile Header */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-50 flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080]/10 rounded-full -mr-32 -mt-32 opacity-30"></div>
                <div className="w-40 h-40 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 relative z-10">
                    <User size={80} />
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-2 flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                        {student.name}
                        {student.onboarding_status === 'pending' && (
                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100 shadow-sm not-italic">
                                Onboarding Pending
                            </span>
                        )}
                        {student.is_shifted && (
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-100 shadow-sm flex items-center gap-2 not-italic">
                                <History size={12} /> Shifted: {student.shifted_from}
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                        <span className="px-5 py-2 bg-[#008080] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#008080]/30 italic">
                            {student.course}
                        </span>
                        <span className="px-5 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
                            {student.grade}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><BookOpen size={12} /> Primary Subject</p>
                            <p className="text-base font-bold text-slate-700">{student.subject}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Clock size={12} /> Allocated Hours</p>
                            <p className="text-base font-bold text-slate-700">{student.hour} Hrs/Week</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Phone size={12} /> Contact</p>
                            <p className="text-base font-bold text-slate-700">{student.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Calendar size={12} /> Next Payment</p>
                            <p className="text-base font-bold text-[#008080]">{student.next_installment_date ? new Date(student.next_installment_date).toLocaleDateString() : 'Pending'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-3xl w-fit">
                {[
                    { id: 'info', label: 'Detailed Info', icon: <User size={14} /> },
                    { id: 'timetable', label: 'Session Timetable', icon: <Clock size={14} /> },
                    { id: 'logs', label: 'Interaction Logs', icon: <History size={14} /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
                            ${activeTab === tab.id ? 'bg-white text-[#008080] shadow-lg' : 'text-slate-500 hover:text-slate-800'}
                        `}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-50 min-h-[400px]">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section className="space-y-6">
                            <h3 className="text-lg font-black text-slate-900 border-b-2 border-[#008080] pb-2 flex items-center gap-3">
                                <CheckSquare size={20} className="text-[#008080]" /> Academic Context
                            </h3>
                            <div className="space-y-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#008080] transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enrolled Course</p>
                                    <p className="text-sm font-bold text-slate-700">{student.course}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#008080] transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Faculty Name</p>
                                    <p className="text-sm font-bold text-slate-700">{student.faculty_name || 'Not Specified'}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#008080] transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mentor Name (Ref)</p>
                                    <p className="text-sm font-bold text-slate-700">{student.mentor_name || 'You'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-lg font-black text-slate-900 border-b-2 border-[#008080] pb-2 flex items-center gap-3">
                                <MessageSquare size={20} className="text-[#008080]" /> Enrollment Notes
                            </h3>
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-slate-500 text-sm font-semibold leading-relaxed">
                                This section contains internal enrollment notes and status updates for the student's academic path. Standard operation procedures apply.
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'timetable' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 border-b-2 border-[#008080] pb-2">Academic Roadmap (Sessions)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#Sess</th>
                                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</th>
                                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapters / Topics</th>
                                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {student.timetable.map((session) => (
                                        <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-6 px-4 font-black text-slate-400 text-sm">#{session.session_number}</td>
                                            <td className="py-6 px-4 font-bold text-slate-700 text-sm">
                                                {new Date(session.date).toLocaleDateString()}
                                                {session.status === 'Postponed' && session.new_date && (
                                                    <p className="text-[10px] text-amber-600 mt-1">New: {new Date(session.new_date).toLocaleDateString()}</p>
                                                )}
                                            </td>
                                            <td className="py-6 px-4 font-bold text-slate-700 text-sm">{session.start_time} - {session.end_time}</td>
                                            <td className="py-6 px-4 font-bold text-slate-700 text-sm italic">{session.chapter_topic || 'Pending Assignment'}</td>
                                            <td className="py-6 px-4">
                                                <StatusBadge status={session.status} />
                                            </td>
                                        </tr>
                                    ))}
                                    {student.timetable.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No sessions scheduled yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <section className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <History size={20} className="text-[#008080]" /> Session History Logs
                            </h3>
                            <div className="space-y-4">
                                {student.studentLogs.map((log) => (
                                    <div key={log.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#008080] rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform"></div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className="text-[10px] font-black bg-[#008080] text-white px-3 py-1 rounded-full uppercase">Session #{log.session_number}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.created_at || log.date).toLocaleDateString()}</span>
                                        </div>

                                        <div className="mb-4 space-y-2 relative z-10">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Mentor Notes</p>
                                                <p className="text-xs text-slate-600 font-medium line-clamp-2">{log.mentor_notes || 'No notes provided.'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Weak Area</p>
                                                <p className="text-xs text-slate-600 italic line-clamp-2">{log.weak_area_identified || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 relative z-10 pt-2 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Confidence</span>
                                                <span className="text-[10px] font-bold text-[#008080]">{log.concept_confidence}/5</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">HW Status</span>
                                                <span className={`text-[10px] font-bold ${log.homework_status === 'Done' ? 'text-emerald-600' : 'text-amber-600'}`}>{log.homework_status}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Parent Priority</span>
                                                <span className={`text-[10px] font-bold ${log.parent_update_priority === 'High' ? 'text-rose-600' : 'text-slate-600'}`}>{log.parent_update_priority}</span>
                                            </div>
                                        </div>

                                        {log.screenshot_url && (
                                            <a href={log.screenshot_url} target="_blank" rel="noopener noreferrer" className="block mt-4 text-[10px] font-black text-[#008080] hover:underline uppercase tracking-wide">View Screenshot Evidence</a>
                                        )}
                                    </div>
                                ))}
                                {student.studentLogs.length === 0 && <p className="text-slate-400 text-center text-sm font-bold py-10">No student interaction logs found.</p>}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <Contact size={20} className="text-purple-600" /> Faculty Log Archive
                            </h3>
                            <div className="space-y-4">
                                {student.facultyLogs.map((log) => (
                                    <div key={log.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <span className="text-sm font-bold text-slate-700">{log.chapter}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mb-3 space-y-2 relative z-10">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Topic Coverage</p>
                                                <p className="text-xs text-slate-500 italic line-clamp-2">{log.topics_covered}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Performance</p>
                                                <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${log.student_performance === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {log.student_performance}
                                                </span>
                                            </div>
                                        </div>

                                        {log.screenshot_url && (
                                            <a href={log.screenshot_url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-[10px] font-black text-purple-500 hover:underline uppercase tracking-wide">View Evidence</a>
                                        )}
                                    </div>
                                ))}
                                {student.facultyLogs.length === 0 && <p className="text-slate-400 text-center text-sm font-bold py-10">No faculty interaction logs found.</p>}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;
