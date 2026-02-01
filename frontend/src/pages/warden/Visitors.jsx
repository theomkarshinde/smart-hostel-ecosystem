import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const WardenVisitors = () => {
    const { showToast } = useNotification();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buildingId, setBuildingId] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await wardenService.getProfile();
                if (profile && profile.buildingId) {
                    setBuildingId(profile.buildingId);
                    fetchPending(profile.buildingId);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchPending = async (bId) => {
        try {
            const data = await wardenService.getPendingVisitors(bId);
            setVisitors(data);
        } catch (err) {
            console.error("Failed to fetch pending visitors", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await wardenService.updateVisitorStatus(id, status);
            showToast('Success', `Visitor request ${status.toLowerCase()}`, 'success');
            if (buildingId) fetchPending(buildingId);
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to update status', 'error');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Visitor Requests</h2>

            {loading ? (
                <Loader />
            ) : visitors.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No pending visitor requests.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visitors.map((v) => (
                                <tr key={v.visitorId}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{v.visitorName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{v.studentName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{v.purpose}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {v.visitDate ? new Date(v.visitDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleAction(v.visitorId, 'APPROVED')}
                                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(v.visitorId, 'REJECTED')}
                                            className="bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WardenVisitors;
