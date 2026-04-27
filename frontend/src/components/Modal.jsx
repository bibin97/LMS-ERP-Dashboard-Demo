import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={onClose}
        >
            <div
                className={`bg-white/95 backdrop-blur-2xl w-full ${sizes[size]} rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden border border-white/60 relative`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#F59E0B]/20"></div>

                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100/50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Action required • MashMagic LMS</p>
                    </div>
                    <button
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-2xl transition-all duration-300 group shadow-sm border border-slate-50"
                        onClick={onClose}
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
