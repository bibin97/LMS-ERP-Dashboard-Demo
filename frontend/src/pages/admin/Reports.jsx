import React, { useState } from 'react';
import { FileText, DownloadCloud, Filter, Calendar, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import * as XLSX from 'xlsx';

const Reports = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'All'
    });

    const exportToFile = (data, filename, format = 'xlsx') => {
        if (!data || !data.length) {
            toast.error("No data available to export");
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

            const dateStr = new Date().toISOString().split('T')[0];
            const fullFilename = `${filename}_${dateStr}.${format}`;

            if (format === 'csv') {
                const csvContent = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", fullFilename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                XLSX.writeFile(workbook, fullFilename);
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to generate file");
        }
    };

    const handleDownload = async (type, format = 'csv') => {
        const loadingToast = toast.loading(`Preparing ${type} ${format.toUpperCase()}...`);
        try {
            let endpoint = '';
            let filename = '';

            if (type === 'Student') {
                endpoint = '/admin/students';
                filename = 'student_analytics';
            } else if (type === 'Mentor') {
                endpoint = '/admin/mentors';
                filename = 'mentor_analytics';
            } else if (type === 'Task') {
                endpoint = '/tasks';
                filename = 'task_analytics';
            }

            // Add query params for filtering if needed
            const response = await api.get(endpoint, {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    category: filters.category
                }
            });

            if (response.data.success) {
                exportToFile(response.data.data, filename, format);
                toast.success(`${type} Data exported as ${format.toUpperCase()}!`, { id: loadingToast });
            } else {
                throw new Error(response.data.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error(`Export error for ${type}:`, error);
            toast.error(`Failed to generate ${type} export: ${error.message}`, { id: loadingToast });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Enterprise Analytics</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure filters and generate master data exports</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                    <div className="p-2.5 bg-[#008080]/10 text-[#008080] rounded-xl">
                        <Filter size={20} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Advanced Export Config</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FilterGroup label="Start Capture Date">
                        <input
                            type="date"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] transition-all font-medium"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </FilterGroup>
                    <FilterGroup label="End Capture Date">
                        <input
                            type="date"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] transition-all font-medium"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </FilterGroup>
                    <FilterGroup label="Data Sensitivity">
                        <select
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] transition-all"
                            value={filters.category}
                            onChange={e => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option>Master Data</option>
                            <option>Active Records</option>
                            <option>Archived Records</option>
                        </select>
                    </FilterGroup>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {[
                    { type: 'Student', color: 'teal' },
                    { type: 'Mentor', color: 'emerald' },
                    { type: 'Task', color: 'amber' }
                ].map(({ type, color }) => (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center" key={type}>
                        <div className={`w-20 h-20 mb-8 rounded-3xl flex items-center justify-center transition-all group-hover:rotate-12 ${color === 'teal' ? 'bg-[#008080]/10 text-[#008080] shadow-lg shadow-[#008080]' :
                            color === 'emerald' ? 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-50' :
                                'bg-amber-50 text-amber-600 shadow-lg shadow-amber-50'
                            }`}>
                            <FileText size={36} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{type} Analytics</h3>
                        <p className="text-sm text-slate-500 font-medium mb-8">Export all current {type.toLowerCase()} records including meta-properties.</p>

                        <div className="flex flex-col gap-2 w-full">
                            <button
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-lg hover:brightness-110 active:scale-95 ${color === 'teal' ? 'bg-[#008080] text-white shadow-[#008080]/30' :
                                    color === 'emerald' ? 'bg-emerald-600 text-white shadow-emerald-100' :
                                        'bg-amber-600 text-white shadow-amber-100'
                                    }`}
                                onClick={() => handleDownload(type, 'csv')}
                            >
                                <DownloadCloud size={18} />
                                <span>Download CSV</span>
                            </button>
                            <button
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all border-2 group-hover:bg-slate-50 active:scale-95 ${color === 'teal' ? 'border-[#008080] text-[#008080]' :
                                    color === 'emerald' ? 'border-emerald-100 text-emerald-600' :
                                        'border-amber-100 text-amber-600'
                                    }`}
                                onClick={() => handleDownload(type, 'xlsx')}
                            >
                                <FileSpreadsheet size={18} />
                                <span>Download Excel</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FilterGroup = ({ label, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
        {children}
    </div>
);

export default Reports;

