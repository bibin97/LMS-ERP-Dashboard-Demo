import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, Upload, Loader2, ImageIcon, Activity, BookOpen, Brain, Clock, HeartPulse, MoreHorizontal, Calendar, Star, Target } from 'lucide-react';

const MentorshipQuestionsForm = ({ selectedStudent, setSubmitted, fetchStudentLogs }) => {
    const [loading, setLoading] = useState(false);
    
    // Initial data matching CEO's required fields
    const initialMentorshipData = {
        session_date: new Date().toISOString().split('T')[0],
        main_issue: 'No issue',
        secondary_issue: '',
        weak_subject: '',
        consistency_rating: 4,
        focus_rating: 4,
        effort_level: 4,
        homework_status: 'Yes - Completed',
        action_type: 'Practice questions',
        action_details: '',
        follow_up_required: false,
        follow_up_date: '',
        priority: 'Medium',
        student_status: 'On Track'
    };

    const [mentorshipData, setMentorshipData] = useState(initialMentorshipData);

    const handleRatingClick = (field, value) => {
        setMentorshipData(prev => {
            const newData = { ...prev, [field]: value };
            // Smart Auto-suggestions
            if (field === 'focus_rating' && value < 3 && prev.main_issue === 'No issue') {
                newData.main_issue = 'Low focus';
            }
            return newData;
        });
    };

    const handleHomeworkSelect = (e) => {
        const status = e.target.value;
        setMentorshipData(prev => {
            const newData = { ...prev, homework_status: status };
            // Smart Auto-suggestions
            if (status === 'Not done' && prev.main_issue === 'No issue') {
                newData.main_issue = 'Homework not completed';
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/mentor/mentorship-log', {
                ...mentorshipData,
                student_id: selectedStudent.id
            });

            toast.success("Mentorship session logged!");
            setMentorshipData(initialMentorshipData);
            setSubmitted(true);
            if(fetchStudentLogs) fetchStudentLogs(selectedStudent.id);
        } catch (error) {
            toast.error(error.response?.data?.message || "Logging failed");
        } finally {
            setLoading(false);
        }
    };

    const renderRatingButtons = (field) => (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
                <button
                    key={num}
                    type="button"
                    onClick={() => handleRatingClick(field, num)}
                    className={`flex-1 p-3 rounded-xl font-black text-sm transition-all focus:outline-none ${mentorshipData[field] === num ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                    {num}
                </button>
            ))}
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Critical': return 'text-rose-500 bg-rose-50 border-rose-500';
            case 'Needs Attention': return 'text-amber-500 bg-amber-50 border-amber-500';
            case 'On Track': return 'text-emerald-500 bg-emerald-50 border-emerald-500';
            default: return 'text-slate-500 bg-slate-50 border-slate-500';
        }
    };

    const issueOptions = [
        'No issue', 'Low focus', 'Distractions', 'Procrastination', 
        'Homework not completed', 'Concept not understood', 'Low motivation', 'Other'
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-12 rounded-[3.5rem] shadow-xl shadow-slate-100 border border-slate-50 space-y-12">
            
            {/* Section 1: Issue Identification */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-[#008080] pl-4 flex items-center gap-2">
                    <Brain size={16} className="text-[#008080]" /> Section 1: Issue Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Issue</label>
                        <select 
                            value={mentorshipData.main_issue} 
                            onChange={(e) => setMentorshipData({ ...mentorshipData, main_issue: e.target.value })} 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#008080]/10 transition-all"
                        >
                            {issueOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secondary Issue (Optional)</label>
                        <select 
                            value={mentorshipData.secondary_issue} 
                            onChange={(e) => setMentorshipData({ ...mentorshipData, secondary_issue: e.target.value })} 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#008080]/10 transition-all"
                        >
                            <option value="">None</option>
                            {issueOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weak Subject</label>
                        <select 
                            value={mentorshipData.weak_subject} 
                            onChange={(e) => setMentorshipData({ ...mentorshipData, weak_subject: e.target.value })} 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#008080]/10 transition-all"
                        >
                            <option value="">Select subject...</option>
                            {['Maths', 'Science', 'English', 'Social Studies', 'Language', 'Computer Science', 'General'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Behavior Rating */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-4 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600" /> Section 2: Behavior Rating
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div className="space-y-4">
                        <div className="flex justify-between px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consistency Rating</label>
                            <span className="text-xs font-black text-[#008080]">{mentorshipData.consistency_rating}/5</span>
                        </div>
                        {renderRatingButtons('consistency_rating')}
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Rating</label>
                            <span className="text-xs font-black text-[#008080]">{mentorshipData.focus_rating}/5</span>
                        </div>
                        {renderRatingButtons('focus_rating')}
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effort Level</label>
                            <span className="text-xs font-black text-[#008080]">{mentorshipData.effort_level}/5</span>
                        </div>
                        {renderRatingButtons('effort_level')}
                    </div>
                </div>
            </div>

            {/* Section 3: Homework Verification */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-500" /> Section 3: Homework Verification
                </h3>
                <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework Status Verified?</label>
                        <select 
                            value={mentorshipData.homework_status} 
                            onChange={handleHomeworkSelect} 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#008080]/10 transition-all"
                        >
                            <option value="Yes - Completed">Yes - Completed</option>
                            <option value="Partial">Partial</option>
                            <option value="Not done">Not done</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 4: Action Given */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-purple-500 pl-4 flex items-center gap-2">
                    <Target size={16} className="text-purple-500" /> Section 4: Action Given
                </h3>
                <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Action Type</label>
                        <select 
                            value={mentorshipData.action_type} 
                            onChange={(e) => setMentorshipData({ ...mentorshipData, action_type: e.target.value })} 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#008080]/10 transition-all"
                        >
                            {['Complete homework', 'Revise topic', 'Start study on time', 'Reduce distractions', 'Practice questions', 'Doubt clarification'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Action Details (Optional)</label>
                        <textarea 
                            rows="2" 
                            placeholder="Example: Exercise 3.2 Q1-5" 
                            value={mentorshipData.action_details} 
                            onChange={(e) => setMentorshipData({ ...mentorshipData, action_details: e.target.value })} 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#008080]/10 transition-all"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Section 5: Follow-up System */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-4 flex items-center gap-2">
                    <Calendar size={16} className="text-rose-500" /> Section 5: Follow-up System
                </h3>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <Clock className="text-slate-400" size={20} />
                            <div><h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Follow-up Required?</h4></div>
                        </div>
                        <div 
                            onClick={() => setMentorshipData({ ...mentorshipData, follow_up_required: !mentorshipData.follow_up_required })} 
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${mentorshipData.follow_up_required ? 'bg-[#008080]' : 'bg-slate-200'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${mentorshipData.follow_up_required ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>
                    {mentorshipData.follow_up_required && (
                        <div className="grid grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Follow-up Date</label>
                                <input 
                                    type="date" 
                                    value={mentorshipData.follow_up_date} 
                                    onChange={(e) => setMentorshipData({ ...mentorshipData, follow_up_date: e.target.value })} 
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                <select 
                                    value={mentorshipData.priority} 
                                    onChange={(e) => setMentorshipData({ ...mentorshipData, priority: e.target.value })} 
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                                >
                                    <option value="High">🔴 High</option>
                                    <option value="Medium">🟡 Medium</option>
                                    <option value="Low">🟢 Low</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 6: Final Decision Tag */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-500" /> Section 6: Final Decision Tag
                </h3>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Status Today</label>
                    <div className="flex gap-4">
                        {['Critical', 'Needs Attention', 'On Track'].map(status => (
                            <button 
                                key={status} 
                                type="button" 
                                onClick={() => setMentorshipData({ ...mentorshipData, student_status: status })} 
                                className={`flex-1 p-5 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${mentorshipData.student_status === status ? getStatusColor(status) : 'bg-white border-transparent text-slate-400 opacity-60 hover:opacity-100'}`}
                            >
                                {status === 'Critical' && '🔴'} 
                                {status === 'Needs Attention' && '🟡'} 
                                {status === 'On Track' && '🟢'} 
                                {' '}{status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#008080] text-white p-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-[#008080]/30 hover:bg-[#009090] transition-all disabled:opacity-50 flex items-center justify-center gap-4 italic active:scale-[0.98]"
                >
                    {loading ? 'Submitting...' : 'Submit Mentorship Log'}
                    {!loading && <CheckCircle size={20} />}
                </button>
            </div>
        </form>
    );
};

export default MentorshipQuestionsForm;
