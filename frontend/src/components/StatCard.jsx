import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, trend, type = 'default' }) => {
    const isPositive = trend > 0;
    
    return (
        <div className="bg-white/80 backdrop-blur-xl p-7 rounded-[24px] border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden">
            {/* Subtle Gradient Glow */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#14B8A6]/5 rounded-full blur-3xl group-hover:bg-[#14B8A6]/10 transition-colors duration-500"></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none">{title}</p>
                        <h3 className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{value}</h3>
                    </div>
                    
                    {trend && (
                        <div className={`flex items-center gap-2 text-[11px] font-black mt-4 px-3 py-1.5 rounded-xl w-fit border shadow-sm transition-all duration-500 ${
                            isPositive 
                            ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 group-hover:bg-emerald-100 group-hover:shadow-emerald-200/20' 
                            : 'bg-rose-50/50 text-rose-600 border-rose-100/50 group-hover:bg-rose-100 group-hover:shadow-rose-200/20'
                        }`}>
                            <div className={`transition-transform duration-500 ${isPositive ? 'group-hover:-translate-y-0.5' : 'group-hover:translate-y-0.5'}`}>
                                {isPositive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                            </div>
                            <span className="tracking-tight">{Math.abs(trend)}%</span>
                            <span className="text-slate-400 font-bold ml-1 opacity-60">vs last month</span>
                        </div>
                    )}
                </div>
                
                <div className="w-14 h-14 bg-gradient-to-br from-[#0F766E]/5 to-[#14B8A6]/10 rounded-[18px] flex items-center justify-center text-[#14B8A6] border border-[#14B8A6]/10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-sm">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
