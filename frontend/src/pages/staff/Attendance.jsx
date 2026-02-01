import React, { useEffect, useState } from 'react';
import staffService from '../../services/staffService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/Loader';

const Attendance = () => {
    const { showToast } = useNotification();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [todayMarked, setTodayMarked] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const data = await staffService.getAttendance();
            setHistory(data.history);
            setTodayMarked(data.todayMarked);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async () => {
        setMarking(true);
        try {
            await staffService.markAttendance();
            const today = new Date().toISOString().split('T')[0];
            setHistory([{ date: today, status: 'Present' }, ...history]);
            setTodayMarked(true);
        } catch (err) {
            console.error(err);
            showToast('Attendance Failed', 'Failed to mark attendance.', 'error');
        } finally {
            setMarking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
                <button
                    onClick={handleMarkAttendance}
                    disabled={todayMarked || marking}
                    className={`px-6 py-2 rounded-md text-white font-medium ${todayMarked
                        ? 'bg-green-500 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                >
                    {todayMarked ? 'Marked for Today' : marking ? 'Marking...' : 'Mark Attendance'}
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : history.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No attendance records found.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {history.map((record, idx) => (
                            <li key={idx} className="px-4 py-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{record.date}</span>
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {record.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Attendance;
