import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
    SquaresFour,
    ClipboardText,
    UserPlus,
    WarningCircle,
    Bathtub,
    CalendarCheck,
    Users,
    CreditCard,
    User,
    ForkKnife,
    ListBullets,
    IdentificationCard
} from 'phosphor-react';

const WardenLayout = () => {
    const { user } = useAuth();
    const managesMess = user?.managesMess;

    const messWardenItems = [
        { label: 'Dashboard', path: '/warden/dashboard', icon: <SquaresFour size={20} /> },
        { label: 'Mess Menu', path: '/warden/mess-menu', icon: <ForkKnife size={20} /> },
        { label: 'Mess Plans', path: '/warden/mess-plans', icon: <ListBullets size={20} /> },
        { label: 'Complaints', path: '/warden/complaints', icon: <WarningCircle size={20} /> },
        { label: 'Attendance', path: '/warden/mess-attendance', icon: <CalendarCheck size={20} /> },
        { label: 'Profile', path: '/warden/profile', icon: <User size={20} /> },
    ];

    const buildingWardenItems = [
        { label: 'Dashboard', path: '/warden/dashboard', icon: <SquaresFour size={20} /> },
        { label: 'Pending Students', path: '/warden/pending-students', icon: <Users size={20} /> },
        { label: 'Register Student', path: '/warden/register-student', icon: <UserPlus size={20} /> },
        { label: 'Complaints', path: '/warden/complaints', icon: <WarningCircle size={20} /> },
        { label: 'Laundry Services', path: '/warden/laundry', icon: <Bathtub size={20} /> },
        { label: 'Attendance', path: '/warden/attendance', icon: <CalendarCheck size={20} /> },
        { label: 'Visitors', path: '/warden/visitors', icon: <Users size={20} /> },
        { label: 'All Students', path: '/warden/all-students', icon: <IdentificationCard size={20} /> },
        { label: 'Payments', path: '/warden/payments', icon: <CreditCard size={20} /> },
        { label: 'Profile', path: '/warden/profile', icon: <User size={20} /> },
    ];

    const menuItems = managesMess ? messWardenItems : buildingWardenItems;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar menuItems={menuItems} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar title={managesMess ? "Mess Warden Dashboard" : "Warden Dashboard"} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default WardenLayout;
