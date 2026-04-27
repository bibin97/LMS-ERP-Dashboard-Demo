import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, Ban, Trash2, Pencil } from 'lucide-react';
import StudentListFilterDropdown from './StudentListFilterDropdown';

const DataTable = ({
    columns,
    data,
    loading,
    onSearch,
    onFilter,
    onExport,
    onView,
    onApprove,
    onBlock,
    onDelete,
    onEdit,
    searchPlaceholder = "Search records...",
    filterValue,
    onFilterChange,
}) => {
    const useFilterDropdown = filterValue !== undefined && onFilterChange;
    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 md:p-8 border-b border-slate-100/50 gap-6 w-full">
                <div className="relative w-full lg:w-96 group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#14B8A6] transition-all duration-300" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="w-full bg-white/50 border border-slate-100 rounded-[18px] py-3.5 pl-12 pr-5 text-sm font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 focus:border-[#14B8A6]/20 transition-all shadow-sm placeholder:text-slate-300"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {onFilter ? (
                        typeof onFilter === 'function' && !onFilterChange ? (
                            <button
                                onClick={onFilter}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white border border-slate-100 rounded-[18px] text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95 group"
                            >
                                <Filter size={16} className="text-slate-400 group-hover:rotate-12 transition-transform" />
                                <span>Filters</span>
                            </button>
                        ) : (
                            onFilter
                        )
                    ) : null}
                    {useFilterDropdown && (
                        <StudentListFilterDropdown
                            value={filterValue}
                            onChange={onFilterChange}
                            className="flex-1 lg:flex-none w-full lg:w-auto min-w-[160px]"
                        />
                    )}
                    <button
                        onClick={onExport}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] text-white hover:shadow-lg hover:shadow-[#14B8A6]/30 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/40">
                            {columns.map((col, index) => (
                                <th key={index} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100/50" style={{ width: col.width }}>
                                    {col.header}
                                </th>
                            ))}
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100/50 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-[6px] w-full"></div></td>
                                    ))}
                                    <td className="px-8 py-6"><div className="h-8 bg-slate-100 rounded-[10px] w-full"></div></td>
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center border border-slate-100 shadow-inner">
                                            <Search size={32} className="text-slate-200" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">No match found</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Try adjusting your filters</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="group hover:bg-[#F8FAFC]/80 transition-all duration-300">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-8 py-6 whitespace-nowrap text-sm text-slate-600 font-bold">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {onView && (
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-[12px] transition-all hover:scale-110 active:scale-95"
                                                    onClick={() => onView(row)}
                                                    title="View profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}

                                            {onEdit && (
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-[12px] transition-all hover:scale-110 active:scale-95"
                                                    onClick={() => onEdit(row)}
                                                    title="Modify data"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            )}

                                            {onApprove && row.status !== 'active' && (
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-[12px] transition-all hover:scale-110 active:scale-95"
                                                    onClick={() => onApprove(row)}
                                                    title="Authorize access"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            {onBlock && row.status !== 'blocked' && (
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-[12px] transition-all hover:scale-110 active:scale-95"
                                                    onClick={() => onBlock(row)}
                                                    title="Restrict access"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            )}

                                            {onDelete && (
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[12px] transition-all hover:scale-110 active:scale-95"
                                                    onClick={() => onDelete(row)}
                                                    title="Terminate account"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-slate-100/50">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="p-6 space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="h-10 bg-slate-100 rounded-xl"></div>
                                <div className="h-10 bg-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                    ))
                ) : data.length === 0 ? (
                    <div className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records detected</div>
                ) : (
                    data.map((row, rowIndex) => (
                        <div key={rowIndex} className="p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Primary Info (First Column) */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{columns[0].header}</div>
                                    <div className="font-bold text-slate-900 truncate">
                                        {columns[0].render ? columns[0].render(row) : row[columns[0].accessor]}
                                    </div>
                                </div>
                                {onView && (
                                    <div className="pl-4">
                                        <button 
                                            className="w-10 h-10 flex items-center justify-center bg-[#14B8A6]/10 text-[#14B8A6] rounded-xl"
                                            onClick={() => onView(row)}
                                        >
                                            <Eye size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Secondary Details Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                {columns.slice(1).map((col, colIndex) => (
                                    <div key={colIndex} className="overflow-hidden">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{col.header}</div>
                                        <div className="text-[11px] font-black text-slate-700 truncate">
                                            {col.render ? col.render(row) : row[col.accessor] || '---'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Row */}
                            {(onEdit || onApprove || onBlock || onDelete) && (
                                <div className="flex items-center gap-2 pt-4 justify-end">
                                    {onEdit && (
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center justify-center gap-2" onClick={() => onEdit(row)}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                    )}
                                    {onApprove && row.status !== 'active' && (
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2" onClick={() => onApprove(row)}>
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    )}
                                    <div className="flex gap-2">
                                        {onBlock && row.status !== 'blocked' && (
                                            <button className="w-10 h-10 flex items-center justify-center bg-amber-50 text-amber-600 rounded-xl border border-amber-100" onClick={() => onBlock(row)}>
                                                <Ban size={16} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl border border-rose-100" onClick={() => onDelete(row)}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="flex items-center justify-between px-8 py-6 bg-slate-50/20 border-t border-slate-100/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Record cluster: {data.length} units detected</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm" disabled>
                        <ChevronLeft size={18} className="group-active:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="px-5 py-2 rounded-[12px] bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white text-xs font-black shadow-lg shadow-[#14B8A6]/20">1</div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all group shadow-sm">
                        <ChevronRight size={18} className="group-active:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
