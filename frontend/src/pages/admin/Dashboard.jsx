import React, { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    UserPlus,
    GraduationCap,
    UserSquare2,
    BarChart3,
    TrendingUp,
    ListTodo,
    CheckCircle2,
    ChevronLeft
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from 'recharts';
import StatCard from '../../components/StatCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        mentors: 0,
        faculties: 0,
        pendingApprovals: 0
    });
    const [mentorHeadReport, setMentorHeadReport] = useState({
        totalStudents: 0,
        checkedToday: 0,
        remaining: 0
    });
    const [examData, setExamData] = useState([]);
    const [mentorDistribution, setMentorDistribution] = useState([]);
    const [taskPerformance, setTaskPerformance] = useState([]);
    const [taskFilter, setTaskFilter] = useState('today');
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const chartData = [
        { name: 'Mon', tasks: 12, completed: 8 },
        { name: 'Tue', tasks: 18, completed: 14 },
        { name: 'Wed', tasks: 15, completed: 12 },
        { name: 'Thu', tasks: 22, completed: 18 },
        { name: 'Fri', tasks: 30, completed: 25 },
        { name: 'Sat', tasks: 10, completed: 9 },
        { name: 'Sun', tasks: 8, completed: 7 },
    ];

    const pieData = [
        { name: 'Students', value: stats.students, color: '#14B8A6' },
        { name: 'Mentors', value: stats.mentors, color: '#0F766E' },
        { name: 'Faculties', value: stats.faculties, color: '#F59E0B' },
    ];

    const performanceData = [
        { month: 'Jan', score: 0 },
        { month: 'Feb', score: 0 },
        { month: 'Mar', score: 0 },
        { month: 'Apr', score: 0 },
        { month: 'May', score: 0 },
        { month: 'Jun', score: 0 },
        { month: 'Jul', score: 0 },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [userRes, studentRes, reportRes, examRes, distRes, taskRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/students'),
                    api.get('/admin/mentor-head-report'),
                    api.get('/admin/exam-analytics'),
                    api.get('/admin/mentor-distribution'),
                    api.get(`/admin/task-analytics?range=${taskFilter}`)
                ]);

                const users = userRes.data.data || [];
                const students = studentRes.data.data || [];

                const counts = users.reduce((acc, user) => {
                    if (user.role === 'mentor') acc.mentors++;
                    if (user.role === 'faculty') acc.faculties++;
                    if (user.status === 'inactive') acc.pendingApprovals++;
                    return acc;
                }, { students: students.length, mentors: 0, faculties: 0, pendingApprovals: 0 });

                // Also count pending students
                const pendingStudents = students.filter(s => s.status === 'inactive' || !s.isApproved).length;
                counts.pendingApprovals += pendingStudents;

                setStats(counts);

                if (reportRes.data.success) {
                    const reports = reportRes.data.data;
                    if (Array.isArray(reports)) {
                        const totalStudents = reports.length > 0 ? Number(reports[0].totalStudents) : 0;
                        const checkedToday = reports.reduce((sum, curr) => sum + Number(curr.checkedToday || 0), 0);
                        setMentorHeadReport({
                            totalStudents: totalStudents,
                            checkedToday: checkedToday,
                            remaining: totalStudents - checkedToday
                        });
                    } else {
                        setMentorHeadReport(reportRes.data.data);
                    }
                }

                if (examRes.data.success) {
                    setExamData(examRes.data.data.map(item => ({
                        ...item,
                        percentage: Number(item.percentage || 0)
                    })));
                }

                if (distRes.data.success) {
                    const colors = ['#14B8A6', '#0f766e', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
                    const mappedDist = distRes.data.data.map((item, idx) => ({
                        name: item.mentor_name,
                        value: Number(item.student_count || 0),
                        color: colors[idx % colors.length]
                    }));
                    setMentorDistribution(mappedDist);
                }

                if (taskRes.data.success) {
                    setTaskPerformance(taskRes.data.data);
                }

                setLoading(false);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                toast.error("Failed to fetch dashboard statistics");
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Separate effect for task analytics to handle filter changes
    useEffect(() => {
        const fetchTaskAnalytics = async () => {
            try {
                const res = await api.get(`/admin/task-analytics?range=${taskFilter}`);
                if (res.data.success) {
                    setTaskPerformance(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch task analytics", error);
            }
        };
        if (isMounted) fetchTaskAnalytics();
    }, [taskFilter, isMounted]);

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-32"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 h-[400px] animate-pulse"></div>
                    <div className="bg-white rounded-2xl border border-slate-100 h-[400px] animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col mb-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">Workspace Overview</h2>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#14B8A6]/10 rounded-lg border border-[#14B8A6]/20">
                        <p className="text-[#14B8A6] text-[10px] font-black uppercase tracking-[0.2em]">Operational Pulse: Active</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.students}
                    icon={<Users size={24} />}
                    trend={12}
                />
                <StatCard
                    title="Active Mentors"
                    value={stats.mentors}
                    icon={<UserSquare2 size={24} />}
                    trend={5}
                />
                <StatCard
                    title="Faculties"
                    value={stats.faculties}
                    icon={<GraduationCap size={24} />}
                    trend={-2}
                />
                <StatCard
                    title="Pending Ops"
                    value={stats.pendingApprovals}
                    icon={<UserPlus size={24} />}
                    trend={18}
                    type="warning"
                />
            </div>

            {/* Charts Section */}
            <div className="flex flex-col gap-6">
                {/* Bar Chart Card */}
                <div className="w-full bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-10 w-full">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#0D9488] to-[#14B8A6] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-[#14B8A6]/20">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Task Velocity</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resource allocation & completion</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                {/* Fixed Outside Legend */}
                                <div className="hidden md:flex items-center gap-6 mr-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#10B981]" />
                                        <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Tasks Assigned</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#000000]" />
                                        <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Task Completed</span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <select
                                        value={taskFilter}
                                        onChange={(e) => setTaskFilter(e.target.value)}
                                        className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl focus:ring-[#14B8A6] focus:border-[#14B8A6] block w-full px-6 py-3 transition-all hover:bg-white cursor-pointer min-w-[140px]"
                                    >
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="last3">Last 3 Days</option>
                                        <option value="last7">Last 7 Days</option>
                                        <option value="last14">Last 14 Days</option>
                                        <option value="this_month">This Month</option>
                                        <option value="last_month">Previous Month</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#14B8A6] transition-colors">
                                        <ChevronLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Container with Scrollable Wrapper */}
                        <div className="flex-1 w-full h-[400px] overflow-x-auto custom-scrollbar">
                            <div style={{ minWidth: `${Math.max(100, taskPerformance.length * 80)}px`, height: '100%' }}>
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={taskPerformance}
                                            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                            barGap={8}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                fontSize={12}
                                                fontWeight={800}
                                                tick={{ fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={12}
                                                interval={0}
                                            />
                                            <YAxis fontSize={12} fontWeight={800} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    padding: '12px',
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                                }}
                                                itemSorter={(item) => (item.name === 'Tasks Assigned' ? -1 : 1)}
                                                cursor={{ fill: '#f8fafc' }}
                                            />
                                            <Bar
                                                name="Tasks Assigned"
                                                dataKey="tasks"
                                                fill="#10B981"
                                                radius={[6, 6, 0, 0]}
                                                barSize={32}
                                                minPointSize={5}
                                            />
                                            <Bar
                                                name="Task Completed"
                                                dataKey="completed"
                                                fill="#000000"
                                                radius={[6, 6, 0, 0]}
                                                barSize={32}
                                                minPointSize={5}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart Card */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[16px] flex items-center justify-center shadow-lg">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">Workforce Load</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Student-to-Mentor mapping</p>
                            </div>
                        </div>

                        {/* Container with min-height and flexibility */}
                        <div className="flex-1 w-full min-h-[300px] relative">
                            {isMounted && mentorDistribution.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <PieChart>
                                        <Pie
                                            data={mentorDistribution.flatMap((mentor, idx) => {
                                                const items = [
                                                    { name: mentor.name, value: 0.8, color: '#14B8A6', type: 'mentor' },
                                                    { name: `${mentor.name}'s Students`, value: mentor.value, color: '#000000', type: 'student' }
                                                ];
                                                // Add a gap segment after each mentor's group except the last one
                                                if (idx < mentorDistribution.length - 1) {
                                                    items.push({ name: 'gap', value: 0.5, color: 'transparent', type: 'gap' });
                                                }
                                                return items;
                                            })}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={115}
                                            paddingAngle={0} // No gap between Mentor and their students
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {mentorDistribution.flatMap((mentor, idx) => {
                                                const cells = [
                                                    <Cell key={`m-${idx}`} fill="#14B8A6" />,
                                                    <Cell key={`s-${idx}`} fill="#000000" />
                                                ];
                                                if (idx < mentorDistribution.length - 1) {
                                                    cells.push(<Cell key={`g-${idx}`} fill="transparent" />);
                                                }
                                                return cells;
                                            })}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    if (data.type === 'gap') return null;
                                                    return (
                                                        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-white/10 font-bold text-[11px] text-white">
                                                            <p className={data.type === 'mentor' ? 'text-[#14B8A6]' : 'text-slate-200'}>
                                                                {data.name}
                                                            </p>
                                                            <p className="text-white/70">
                                                                {data.type === 'mentor' ? 'Leader' : `${data.value} Members`}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            iconType="circle"
                                            wrapperStyle={{ paddingTop: '30px' }}
                                            content={({ payload }) => (
                                                <div className="flex justify-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                                                        <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Mentors</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#000000]" />
                                                        <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Students</span>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Mentor</span>
                                <span className="text-base font-bold text-slate-900 truncate">
                                    {mentorDistribution[0]?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Loading</span>
                                <span className="text-base font-bold text-slate-900">
                                    {mentorDistribution.length > 0
                                        ? Math.round(mentorDistribution.reduce((acc, d) => acc + d.value, 0) / mentorDistribution.length)
                                        : 0} / mentor
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mentor Head Report Section */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-10 w-full">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-[#F59E0B]/20">
                                    <ListTodo size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Daily Audit Pulse</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Mentor Head tracking</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-[300px] relative">
                            {isMounted && mentorHeadReport.totalStudents > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <PieChart>
                                            <Pie
                                            data={[
                                                { name: 'Checked Today', value: mentorHeadReport.checkedToday, color: '#14B8A6' },
                                                { name: 'Remaining', value: mentorHeadReport.remaining, color: '#EF4444' }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={85}
                                            outerRadius={115}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Checked Today', value: mentorHeadReport.checkedToday, color: '#14B8A6' },
                                                { name: 'Remaining', value: mentorHeadReport.remaining, color: '#EF4444' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '30px' }} fontSize={11} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm font-bold text-slate-400">
                                    No check data for today
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                                <span className="text-base font-bold text-slate-900">{mentorHeadReport.totalStudents}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Checked</span>
                                <span className="text-base font-bold text-emerald-600">{mentorHeadReport.checkedToday}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 text-right">
                                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Remaining</span>
                                <span className="text-base font-bold text-rose-600">{mentorHeadReport.remaining}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Line Chart Section */}
            <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-6 mb-12 w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">Academic Momentum</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Success rate analytics</p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-[350px] relative">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={examData.length > 0 ? examData : performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey={examData.length > 0 ? "subject" : "month"}
                                    fontSize={11}
                                    fontWeight={600}
                                    tick={{ fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    fontSize={11}
                                    fontWeight={600}
                                    tick={{ fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Line
                                    name="Success %"
                                    type="monotone"
                                    dataKey={examData.length > 0 ? "percentage" : "score"}
                                    stroke="#14B8A6"
                                    strokeWidth={5}
                                    dot={{ fill: '#white', r: 7, strokeWidth: 4, stroke: '#14B8A6' }}
                                    activeDot={{ r: 10, strokeWidth: 0, fill: '#14B8A6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
