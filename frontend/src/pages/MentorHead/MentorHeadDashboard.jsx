import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    CheckCircle2,
    TrendingUp,
    Activity,
    Clock,
    User,
    Loader2,
    Target,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const MentorHeadDashboard = () => {
    const [stats, setStats] = useState({
        totalMentors: 0,
        totalInteractions: 0,
        avgEfficiency: 0
    });
    const [dailySummary, setDailySummary] = useState({
        totalStudents: 0,
        checkedToday: 0,
        remaining: 0
    });
    const [examData, setExamData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Parallel fetch for stats and activities
            const [statsRes, activitiesRes, summaryRes, examRes] = await Promise.all([
                axios.get('/api/mentor-head/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/mentor-head/activities', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/mentor-head/daily-summary', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/mentor-head/exam-analytics', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (statsRes.data.success) {
                const mentors = statsRes.data.data;
                const totalInteractions = mentors.reduce((acc, curr) => acc + parseInt(curr.completed_count || 0), 0);
                setStats({
                    totalMentors: mentors.length,
                    totalInteractions,
                    avgEfficiency: mentors.length > 0 ? (totalInteractions / mentors.length).toFixed(1) : 0
                });
            }

            if (activitiesRes.data.success) {
                setActivities(activitiesRes.data.data);
            }

            if (summaryRes.data.success) {
                setDailySummary(summaryRes.data.data);
            }

            if (examRes.data.success) {
                setExamData(examRes.data.data);
            }

        } catch (error) {
            console.error('Error fetching dashboard:', error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
            setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Page Title */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Operations Dashboard</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <TrendingUp size={14} className="text-[#008080]" />
                        Centralized oversight of mentor network performance and daily student engagement tracking
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080] group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-black text-[#008080] uppercase tracking-widest bg-[#008080]/10 px-3 py-1 rounded-full">Active</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{stats.totalMentors}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Total Mentors</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={24} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Completed</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{stats.totalInteractions}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Total Interactions</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Efficiency</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{stats.avgEfficiency}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Avg Updates/Mentor</p>
                </div>
            </div>

            {/* Daily Student Verification Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <h3 className="text-3xl font-black text-slate-900">{dailySummary.totalStudents}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Students</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex flex-col justify-center text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-3xl font-black text-emerald-700">{dailySummary.checkedToday}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">Checked Today</p>
                    </div>
                    <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 shadow-sm flex flex-col justify-center text-center">
                        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <h3 className="text-3xl font-black text-rose-700">{dailySummary.remaining}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mt-1">Remaining</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Verification Progress</h4>
                    {dailySummary.totalStudents > 0 ? (
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Checked', value: dailySummary.checkedToday },
                                            { name: 'Remaining', value: dailySummary.remaining }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#008080" />
                                        <Cell fill="#008080" />
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} Students`, name]}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-slate-400 font-bold text-sm">No students data available</p>
                    )}
                </div>
            </div>

            {/* Exam Score Analytics Section */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Academic Performance Overview</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Cross-cohort success rate analytics</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Target size={20} />
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full relative z-10">
                    {examData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={examData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="percentage"
                                    nameKey="subject"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {examData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#008080' : '#008080'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-200">
                            <Activity size={48} />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-4">Analytic data pending synchronization</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Live Feed Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Activity className="text-[#008080]" size={24} />
                            Live Activity Feed
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Real-time updates from mentor panels</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                            Last synced: {lastSynced || 'Just now'}
                        </div>
                        <button onClick={fetchDashboardData} disabled={loading} title="Refresh Data" className="p-2 bg-[#008080]/10 text-white rounded-xl hover:bg-[#008080] transition-all active:scale-95">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {activities.length > 0 ? (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                            {activities.map((activity) => (
                                <div key={activity.log_id} className="relative flex items-center gap-6 md:gap-10 group">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-white bg-slate-50 shadow-sm shrink-0 z-10 group-hover:scale-110 transition-transform duration-500">
                                        <div className="w-2.5 h-2.5 bg-[#008080] rounded-full animate-pulse"></div>
                                    </div>

                                    <div className="flex-1 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded-md">
                                                        {activity.type || 'Mentor Update'}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 text-sm mt-1">{activity.mentor_name}</h4>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 text-[#008080] mb-0.5">
                                                    <Clock size={12} />
                                                    <span className="text-xs font-black uppercase tracking-widest">
                                                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-2">
                                                {activity.details || `Interacted with ${activity.student_name} regarding academic progress.`}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{activity.student_name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{activity.mentor_place}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Recent Activity</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                                Mentor updates will appear here in real-time.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorHeadDashboard;
