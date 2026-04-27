import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { 
    LayoutDashboard, 
    Users, 
    ListTodo, 
    MessageSquare, 
    Contact, 
    CalendarClock, 
    Calendar, 
    GraduationCap, 
    ClipboardList 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MentorLayout = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [pendingExamsCount, setPendingExamsCount] = useState(0);

    const fetchPendingTasks = async () => {
        try {
            const res = await api.get('/mentor/tasks');
            const pending = res.data.data.filter(t => t.status !== 'Completed').length;
            setPendingTasksCount(pending);
        } catch (error) {}
    };

    const fetchPendingExams = async () => {
        try {
            const res = await api.get('/mentor/exams/pending');
            setPendingExamsCount(res.data.data.length);
        } catch (error) {}
    };

    useEffect(() => {
        if (user) {
            fetchPendingTasks();
            fetchPendingExams();
            const interval = setInterval(() => {
                fetchPendingTasks();
                fetchPendingExams();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        if (pendingExamsCount > 0) {
            toast(`Attention: ${pendingExamsCount} Exam Milestones are pending!`, {
                icon: '📝',
                duration: 6000,
                id: 'exam-alert'
            });
        }
    }, [pendingExamsCount]);

    const navItems = [
        { path: '/mentor/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/mentor/students', icon: <Users size={18} />, label: 'My Students' },
        { path: '/mentor/students-data', icon: <ClipboardList size={18} />, label: 'Students Data' },
        { path: '/mentor/tasks', icon: <ListTodo size={18} />, label: 'Tasks', badge: pendingTasksCount },
        { path: '/mentor/student-log', icon: <MessageSquare size={18} />, label: 'Student Logs' },
        { path: '/mentor/faculty-log', icon: <Contact size={18} />, label: 'Faculty Logs' },
        { path: '/mentor/timetable', icon: <CalendarClock size={18} />, label: 'Timetable' },
        { path: '/mentor/academic-schedule', icon: <Calendar size={18} />, label: 'Academic Schedule' },
        { path: '/mentor/exams', icon: <GraduationCap size={18} />, label: 'Exams', badge: pendingExamsCount },
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
                title="Mentor Hub"
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

export default MentorLayout;
