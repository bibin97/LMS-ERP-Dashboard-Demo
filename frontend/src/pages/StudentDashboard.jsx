import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Star, Trophy, Send, History, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const [dataContent, setDataContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [myUpdates, setMyUpdates] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchMyUpdates();
    }, []);

    const fetchMyUpdates = async () => {
        try {
            setFetching(true);
            const res = await api.get('/student/my-updates');
            if (res.data.success) {
                setMyUpdates(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch updates:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dataContent.trim()) return toast.error("Please enter your activity details");

        setLoading(true);
        try {
            const res = await api.post('/student/daily-update', { data_content: dataContent });
            if (res.data.success) {
                toast.success("Daily update submitted to your mentor!");
                setDataContent('');
                fetchMyUpdates();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 pb-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-teal-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000 opacity-50" />
                <div className="text-center md:text-left relative z-10">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic uppercase">Gateway Dashboard</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse"></div>
                        Student sync & direct mentor communication portal
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white/50 px-6 py-4 rounded-[20px] border border-white shadow-sm relative z-10">
                    <Trophy size={18} strokeWidth={3} className="text-[#14B8A6]" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] italic leading-none">Status: Mission Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Update Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <MessageSquare className="text-teal-500" size={20} />
                                Daily Activity Log
                            </h3>
                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                                Direct to Mentor
                            </span>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
                                <div className="flex-1 min-h-[250px] relative">
                                    <textarea
                                        value={dataContent}
                                        onChange={(e) => setDataContent(e.target.value)}
                                        placeholder="Enter your daily learning activities, progress, and goals here for your mentor to review..."
                                        className="w-full h-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-slate-800 font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:ring-8 focus:ring-teal-500/5 transition-all resize-none text-lg leading-relaxed shadow-inner"
                                        required
                                    />
                                    <div className="absolute bottom-6 right-6">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Send size={18} />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all
                                        ${loading 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                            : 'bg-slate-900 text-white hover:bg-black hover:shadow-2xl hover:shadow-teal-500/20 active:scale-95'}
                                    `}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Transmit Data to Mentor
                                            <CheckCircle2 size={18} className="text-teal-400" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Performance Stats & Recent */}
                <div className="space-y-8">
                   <div className="bg-slate-900 p-10 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-teal-900/20 border border-white/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full -mr-32 -mt-32 blur-[60px]" />
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-6 opacity-50 flex items-center gap-2">
                           <Star size={14} className="text-amber-400" /> Progression Matrix
                        </h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Total Submissions</span>
                                <span className="text-3xl font-black text-white italic tracking-tighter">{myUpdates.length}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full w-[65%] blur-[1px]"></div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                                Your mentor reviews entries every 24 hours. Maintaining updates improves your performance score.
                            </p>
                        </div>
                   </div>

                   <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <History size={14} className="text-teal-500" /> Activity Stream
                        </h4>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {fetching ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                                ))
                            ) : myUpdates.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <Clock size={32} className="mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase">No history yet</p>
                                </div>
                            ) : (
                                myUpdates.slice(0, 5).map(update => (
                                    <div key={update.id} className="p-4 bg-slate-50 border border-slate-100 rounded-[20px] transition-all hover:bg-white hover:shadow-md group/item">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{update.formatted_date}</span>
                                            <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{update.formatted_time}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 truncate group-hover/item:whitespace-normal group-hover/item:line-clamp-2">
                                            {update.data_content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
