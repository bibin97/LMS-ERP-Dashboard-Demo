import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    ClipboardList, 
    CheckSquare 
} from 'lucide-react';

const FacultyLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { path: '/faculty/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/faculty/students', icon: <Users size={18} />, label: 'Students' },
        { path: '/faculty/sessions', icon: <Calendar size={18} />, label: 'Sessions' },
        { path: '/faculty/reports', icon: <ClipboardList size={18} />, label: 'Reports' },
        { path: '/faculty/exam-scores', icon: <CheckSquare size={18} />, label: 'Exam Scores' },
        { path: '/faculty/student-logs', icon: <ClipboardList size={18} />, label: 'Student Logs' },
        { path: '/faculty/tasks', icon: <CheckSquare size={18} />, label: 'Tasks' },
    ];

    return (
        <div className="flex min-h-screen relative overflow-hidden" 
             style={{ background: 'linear-gradient(180deg, #F8FAFC, #EEF2F7)' }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[990] md:hidden cursor-pointer transition-all duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                navItems={navItems}
                title="Faculty Hub"
            />
            
            <div className={`flex-1 flex flex-col min-w-0 w-full h-screen overflow-y-auto transition-all duration-300 ${isCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-x-hidden w-full max-w-[100vw]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FacultyLayout;
