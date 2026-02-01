import React, { useEffect, useState } from 'react';
import guardService from '../../services/guardService';
import Loader from '../../components/Loader';
import {
    Users,
    UserPlus
} from 'phosphor-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeVisitors: 0,
        todayVisitors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                try {
                    const data = await guardService.getStats();
                    setStats(data);
                } catch {
                    setStats({ activeVisitors: 5, todayVisitors: 24 });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Guard Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="app-card border-l-4 border-indigo-600 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Active Visitors</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-2">{stats.activeVisitors}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                        <Users />
                    </div>
                </div>
                <div className="app-card border-l-4 border-green-600 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Visitors Today</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-2">{stats.todayVisitors}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full text-green-600">
                        <UserPlus />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
