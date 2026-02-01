import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import studentService from '../services/studentService';
import {
    SquaresFour,
    CalendarCheck,
    ForkKnife,
    Bathtub,
    CreditCard,
    WarningCircle,
    Users,
    User
} from 'phosphor-react';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkStatus = async () => {
            if (location.pathname === '/student/pending-approval' || location.pathname === '/student/setup-payment') {
                return;
            }

            try {
                const stats = await studentService.getStats();
                if (stats && stats.status) {
                    if (stats.status === 'PENDING') {
                        navigate('/student/pending-approval');
                    }
                }
            } catch (err) {
                console.error("Failed to check status", err);
            }
        };
        checkStatus();
    }, [navigate, location.pathname]);

    const menuItems = [
        { label: 'Dashboard', path: '/student/dashboard', icon: <SquaresFour size={20} /> },
        { label: 'Attendance', path: '/student/attendance', icon: <CalendarCheck size={20} /> },
        { label: 'Mess', path: '/student/mess', icon: <ForkKnife size={20} /> },
        { label: 'Laundry', path: '/student/laundry', icon: <Bathtub size={20} /> },
        { label: 'Payments', path: '/student/payments', icon: <CreditCard size={20} /> },
        { label: 'Complaints', path: '/student/complaints', icon: <WarningCircle size={20} /> },
        { label: 'Visitors', path: '/student/visitors', icon: <Users size={20} /> },
        { label: 'Profile', path: '/student/profile', icon: <User size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar menuItems={menuItems} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar title="Student Dashboard" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
