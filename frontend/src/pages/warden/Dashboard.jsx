import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import wardenService from '../../services/wardenService';
import NotificationSender from '../../components/NotificationSender';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
    Users,
    UserList,
    Door,
    CalendarCheck,
    ClipboardText,
    QrCode
} from 'phosphor-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.managesMess) {
            fetchStats();
        } else {
            setLoading(false); 
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const data = await wardenService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch warden stats:", error);
            addNotification('Error', 'Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    // Mess Warden View
    if (user?.managesMess) {
        const messCards = [
            { title: 'Mess Plan Management', value: 'View / Edit', link: '/warden/mess-plans', color: 'bg-orange-600', icon: <ClipboardText className="text-orange-600" /> },
            { title: 'Attendance', value: 'Scan QR', link: '/warden/mess-attendance', color: 'bg-green-600', icon: <QrCode className="text-green-600" /> },
        ];

        return (
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Mess Warden Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {messCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(card.link)}
                            className="app-card p-6 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between"
                        >
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</h3>
                                <p className={`text-xl font-bold ${card.color.replace('bg-', 'text-')} mt-2`}>{card.value}</p>
                                <p className="text-xs text-gray-400 mt-1">Click to access</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-full">
                                {card.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Notifications</h3>
                        <NotificationSender />
                    </div>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Students', value: stats?.totalStudents || 0, icon: <Users className="text-blue-600" />, link: '/warden/all-students' },
        { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: <UserList className="text-orange-600" />, link: '/warden/pending-students' },
        { title: 'Rooms Available', value: stats?.roomsAvailable || 0, icon: <Door className="text-green-600" />, link: null },
        { title: "Today's Attendance", value: stats?.todaysAttendance || 0, icon: <CalendarCheck className="text-purple-600" />, link: '/warden/attendance' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Warden Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => stat.link && navigate(stat.link)}
                        className={`app-card p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-between ${stat.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                    >
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</h3>
                            <p className="text-3xl font-bold text-indigo-600 mt-2">{stat.value}</p>
                            {stat.link && <p className="text-xs text-gray-400 mt-1">Click to view</p>}
                        </div>
                        <div className="bg-gray-50 p-3 rounded-full">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Notifications</h3>
                    <NotificationSender />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
