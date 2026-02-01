import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import { toast } from 'react-hot-toast';

const StaffAttendance = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(null); 

    useEffect(() => {
        fetchMarkableStaff();
    }, []);

    const fetchMarkableStaff = async () => {
        try {
            const data = await attendanceService.getMarkableStaff();
            setStaffList(data);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (staffId, buildingId, action) => {
        setMarking(staffId);
        try {
            await attendanceService.markStaff(staffId, buildingId, action);
            toast.success(`Attendance marked: ${action}`);

            setStaffList(prevList => prevList.map(item => {
                if (item.staff.staffId === staffId) {
                    return {
                        ...item,
                        isMarkedIn: action === 'IN' ? true : item.isMarkedIn,
                        isMarkedOut: action === 'OUT' ? true : item.isMarkedOut
                    };
                }
                return item;
            }));
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to mark attendance');
        } finally {
            setMarking(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Staff Attendance</h2>

            <div className="app-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500">No markable staff found</td>
                                </tr>
                            ) : (
                                staffList.map(({ staff, isMarkedIn, isMarkedOut }) => (
                                    <tr key={staff.staffId}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {staff.staffType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleMarkAttendance(staff.staffId, staff.buildingId, 'IN')}
                                                    disabled={marking === staff.staffId || isMarkedIn}
                                                    className={`py-1 px-3 rounded text-xs transition duration-200 ${isMarkedIn
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                        }`}
                                                >
                                                    {marking === staff.staffId ? '...' : isMarkedIn ? 'Marked' : 'Mark IN'}
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(staff.staffId, staff.buildingId, 'OUT')}
                                                    disabled={marking === staff.staffId || isMarkedOut}
                                                    className={`py-1 px-3 rounded text-xs transition duration-200 ${isMarkedOut
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                                        }`}
                                                >
                                                    {marking === staff.staffId ? '...' : isMarkedOut ? 'Marked' : 'Mark OUT'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;
