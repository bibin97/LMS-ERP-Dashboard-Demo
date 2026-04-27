import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
    Calendar,
    Target,
    Users,
    CheckCircle2,
    ShieldAlert,
    DownloadCloud
} from 'lucide-react';
import toast from 'react-hot-toast';

const DailyMentorHeadReport = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchReport();
    }, [filterDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/mentor-head-report?date=${filterDate}`);

            if (res.data.success) {
                setReportData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error("Failed to load Mentor Head Report");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Preparing report...',
                success: 'Report downloaded successfully!',
                error: 'Failed to download report',
            }
        );
    };

    // Calculate global stats across all mentor heads for the day
    const { globalCheckedStudents, globalRemainingStudents, totalStudents } = useMemo(() => {
        const allStudentsMap = new Map();
        const checkedStudentsMap = new Map();

        reportData.forEach(row => {
            row.checkedStudents?.forEach(student => {
                checkedStudentsMap.set(student.id, student);
            });
            row.checkedStudents?.forEach(student => allStudentsMap.set(student.id, student));
            row.remainingStudents?.forEach(student => allStudentsMap.set(student.id, student));
        });

        return {
            globalCheckedStudents: Array.from(checkedStudentsMap.values()),
            globalRemainingStudents: Array.from(allStudentsMap.values()).filter(s => !checkedStudentsMap.has(s.id)),
            totalStudents: allStudentsMap.size
        };
    }, [reportData]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
                        <Target className="text-[#008080]" />
                        Daily Verification Report
                    </h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-500">
                        Monitor daily student verifications and accountability across mentor heads
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-[#008080] transition-all hover:border-[#008080]"
                        />
                    </div>
                </div>
            </header>

            {/* Mentor Head Performance Table */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-xl text-center">Date</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor Head Name</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Students</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Checked By Them</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-400 font-bold animate-pulse">
                                        Loading report data...
                                    </td>
                                </tr>
                            ) : reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-400 font-bold">
                                        No Mentor Heads found for this date.
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((row, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="border-b last:border-b-0 border-slate-50 hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="p-4 text-xs font-bold text-center text-slate-500">
                                            {new Date(row.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#008080]/10 text-[#008080] flex items-center justify-center font-black text-xs">
                                                    {row.mentorHeadName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{row.mentorHeadName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-black border border-slate-100">
                                                <Users size={14} className="text-slate-400" />
                                                {row.totalStudents}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-black border border-emerald-100">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                {row.checkedToday}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Student Tracking (Checked vs Remaining) */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Checked Students */}
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 px-2">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
                                <CheckCircle2 size={24} className="text-emerald-500" /> 
                                Verified Today
                            </h3>
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-inner shadow-emerald-200/50">
                                {globalCheckedStudents.length} / {totalStudents} Checked
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                            {globalCheckedStudents.length > 0 ? (
                                <ul className="divide-y divide-emerald-50/50">
                                    {globalCheckedStudents.map(student => (
                                        <li key={student.id} className="py-4 hover:bg-emerald-50/30 transition-colors flex flex-col gap-1 rounded-xl px-4 group">
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{student.name}</span>
                                            <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest">{student.registration_number || 'No Reg #'}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">No students checked yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remaining Students */}
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 px-2">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
                                <ShieldAlert size={24} className="text-rose-500" /> 
                                Action Pending
                            </h3>
                            <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-inner shadow-rose-200/50">
                                {globalRemainingStudents.length} Students Left
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                            {globalRemainingStudents.length > 0 ? (
                                <ul className="divide-y divide-rose-50/50">
                                    {globalRemainingStudents.map(student => (
                                        <li key={student.id} className="py-4 hover:bg-rose-50/30 transition-colors flex flex-col gap-1 rounded-xl px-4 group">
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-rose-700 transition-colors">{student.name}</span>
                                            <span className="text-[10px] font-black text-rose-500/70 uppercase tracking-widest">{student.registration_number || 'No Reg #'}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <Target size={48} className="text-slate-400 mb-4" />
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">All verifications complete</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyMentorHeadReport;
