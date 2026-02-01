import React, { useEffect, useState } from 'react';
import studentService from '../../services/studentService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/Loader';

const Attendance = () => {
    const { showToast } = useNotification();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [todayMarked, setTodayMarked] = useState(false);

    const [qrCode, setQrCode] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const data = await studentService.getAttendance();
            console.log("DEBUG: Attendance history received", data);
            setHistory(data);

            const todayStr = new Date().toISOString().split('T')[0];
            const isMarked = data.some(record => record.attendanceDate === todayStr);
            setTodayMarked(isMarked);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (record) => {
        if (record.attendanceType === 'MESS') {
            return `Mess: ${record.mealType || 'Meal'}`;
        }
        return `Hostel: ${record.hostelAction || 'Entry'}`;
    };

    const getStatusType = (record) => {
        if (record.attendanceType === 'MESS') return 'bg-orange-100 text-orange-800';
        if (record.hostelAction === 'IN') return 'bg-green-100 text-green-800';
        return 'bg-blue-100 text-blue-800';
    };

    const handleShowQr = async () => {
        setMarking(true);
        try {
            const qrData = await studentService.getQrCode();
            setQrCode(qrData);
            setShowQrModal(true);
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to generate QR Code', 'error');
        } finally {
            setMarking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
                    <p className="text-sm text-gray-500 mt-1">View your recent entries and meal logs</p>
                </div>
                <button
                    onClick={handleShowQr}
                    className="flex items-center gap-2 px-6 py-2 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    {marking ? 'Generating...' : 'Show QR Code'}
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : history.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
                    <p className="text-lg">No attendance records found yet.</p>
                    <p className="text-sm mt-1">Mark your attendance to see it here.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-100">
                    <ul className="divide-y divide-gray-100">
                        {history.map((record, idx) => (
                            <li key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">{record.attendanceDate}</span>
                                    <span className="text-xs text-gray-500 mt-0.5">{record.attendanceTime}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ${getStatusType(record)}`}>
                                        {formatStatus(record)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* QR Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white text-center">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Attendance QR</h3>
                            <div className="mt-4 flex justify-center">
                                {qrCode ? (
                                    <img src={`data:image/png;base64,${qrCode}`} alt="Attendance QR Code" className="w-64 h-64" />
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-orange-600 font-medium">Valid for 10 minutes. Refresh if scanning fails.</p>
                            <p className="mt-2 text-sm text-gray-500">Show this to the Guard/Warden to mark attendance.</p>
                            <div className="mt-4 px-4 py-3">
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
