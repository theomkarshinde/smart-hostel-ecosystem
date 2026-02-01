import React, { useState, useEffect } from 'react';
import complaintService from '../../services/complaintService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const StaffComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { addNotification } = useNotification();

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredComplaints(complaints);
        } else {
            setFilteredComplaints(complaints.filter(c => c.status === statusFilter));
        }
    }, [complaints, statusFilter]);

    const fetchComplaints = async () => {
        try {
            const response = await complaintService.getBuildingComplaints();
            setComplaints(response.data);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await complaintService.updateComplaintStatus(id, newStatus);
            addNotification('Success', `Complaint marked as ${newStatus}`);
            setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error("Failed to update status", error);
            addNotification('Error', 'Failed to update status');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Building Complaints (Staff View)</h1>

                {/* Filter */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map((complaint) => (
                                    <tr key={complaint.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{complaint.studentName || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">Room: {complaint.room || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.createdAt}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="font-semibold text-gray-700">{complaint.category}</div>
                                            <div className="truncate">{complaint.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                    complaint.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                                        complaint.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {complaint.status !== 'RESOLVED' && complaint.status !== 'REJECTED' && (
                                                <>
                                                    {complaint.status === 'OPEN' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                                                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-2 py-1 rounded"
                                                        >
                                                            In Progress
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'REJECTED')}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No complaints found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffComplaints;
