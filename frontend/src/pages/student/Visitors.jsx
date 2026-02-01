import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const StudentVisitors = () => {
    const { user } = useAuth(); 
    const { showToast } = useNotification();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: '',
        contactNumber: '',
        purpose: '',
        visitDate: ''
    });

    useEffect(() => {
        if (user) {
            fetchVisitors();
        }
    }, [user]);

    const fetchVisitors = async () => {
        try {
            let studentId = user?.studentId;
            if (!studentId) {
                const stats = await studentService.getStats();
                studentId = stats.studentId;
            }

            const data = await studentService.getMyVisitors(studentId);
            setVisitors(data);
        } catch (err) {
            console.error("Failed to fetch visitors", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let studentId = user?.studentId;
            if (!studentId) {
                const stats = await studentService.getStats();
                studentId = stats.studentId;
            }

            const visitDateTime = new Date(formData.visitDate);
            const now = new Date();
            if (visitDateTime < now) {
                showToast('Error', 'Visit date cannot be in the past', 'error');
                return;
            }

            const payload = {
                ...formData,
                studentId: studentId,
                visitDate: visitDateTime.toISOString()
            };

            await studentService.requestVisitor(payload);
            showToast('Success', 'Visitor request submitted successfully', 'success');
            setShowModal(false);
            setFormData({ visitorName: '', contactNumber: '', purpose: '', visitDate: '' });
            fetchVisitors();
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to submit request', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Visitors</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    Request Visitor
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : visitors.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No visitor records found.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visitors.map((v) => (
                                <tr key={v.visitorId}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{v.visitorName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{v.purpose}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {v.visitDate ? new Date(v.visitDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${v.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                v.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    v.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        v.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {v.inTime ? new Date(v.inTime).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {v.outTime ? new Date(v.outTime).toLocaleTimeString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Request Visitor</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Visitor Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    value={formData.visitorName}
                                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    placeholder="Enter 10-digit number"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    value={formData.contactNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, contactNumber: value });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expected Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    value={formData.visitDate}
                                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentVisitors;
