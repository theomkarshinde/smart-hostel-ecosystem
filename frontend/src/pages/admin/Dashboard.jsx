import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import NotificationSender from '../../components/NotificationSender';
import {
    Users,
    Buildings,
    UserGear,
    WarningOctagon,
    ArrowsClockwise
} from 'phosphor-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalBuildings: 0,
        totalStaff: 0,
        pendingComplaints: 0
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("DEBUG: Fetching admin stats...");
            const response = await api.get('/admin/stats');
            console.log("DEBUG: Stats received:", response.data);
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Could not load dashboard statistics. Please try logging out and back in.');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: <Users className="text-blue-600" /> },
        { title: 'Total Buildings', value: stats.totalBuildings, icon: <Buildings className="text-indigo-600" /> },
        { title: 'Total Staff', value: stats.totalStaff, icon: <UserGear className="text-purple-600" /> },
        { title: 'Pending Complaints', value: stats.pendingComplaints, icon: <WarningOctagon className="text-orange-600" /> },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading Overview...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-3 py-1 rounded-md transition-colors"
                >
                    <ArrowsClockwise size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-700">
                    <p className="font-medium">Notice</p>
                    <p>{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</h3>
                            <p className="text-3xl font-bold text-indigo-600 mt-2">{stat.value}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-full">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NotificationSender />
                {/* Placeholder for other widgets */}
            </div>
        </div>
    );
};

export default Dashboard;
