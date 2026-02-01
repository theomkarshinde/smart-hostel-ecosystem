import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { CalendarBlank, ForkKnife, Door, Buildings, Wallet } from 'phosphor-react';
import StudentPaymentSetup from './StudentPaymentSetup';

const Dashboard = () => {
    const [stats, setStats] = useState({
        attendancePercentage: '0%',
        messStatus: 'Inactive',
        roomNumber: 'N/A',
        buildingName: 'N/A',
        paymentMethodSelected: true 
    });
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Student');

    const fetchStats = async () => {
        try {
            const data = await studentService.getStats();
            setStats(data);

            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser.username) {
                try {
                    const profile = await studentService.getProfile(storedUser.username);
                    setUserName(profile.fullName || profile.username || 'Student');
                } catch (e) {
                    setUserName(storedUser.username || 'Student');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return <Loader />;
    }

    if (stats.status === 'APPROVED' && !stats.paymentMethodSelected) {
        return <StudentPaymentSetup student={stats} onComplete={fetchStats} />;
    }

    const statCards = [
        { title: 'Mess Status', value: stats.messStatus, icon: <ForkKnife className="text-orange-500" /> },
        { title: 'Room No', value: stats.roomNumber, icon: <Door className="text-green-500" /> },
        { title: 'Building', value: stats.buildingName, icon: <Buildings className="text-purple-500" /> },
        { title: 'Wallet Balance', value: `₹${stats.walletBalance || 0}`, icon: <Wallet className="text-pink-500" /> },
    ];

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {userName}</h2>
                <p className="text-gray-600">Here's your monthly overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="app-card flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-full">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Dashboard;
