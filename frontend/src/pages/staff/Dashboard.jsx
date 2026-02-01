import React, { useEffect, useState } from 'react';
import staffService from '../../services/staffService';
import Loader from '../../components/Loader';

const Dashboard = () => {
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        daysPresent: 0,
        totalWorkingDays: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await staffService.getStats();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Staff Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="app-card border-l-4 border-indigo-500">
                    <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.attendancePercentage}%</p>
                </div>
                <div className="app-card border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-500">Days Present</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.daysPresent}</p>
                </div>
                <div className="app-card border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500">Total Working Days</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalWorkingDays}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
