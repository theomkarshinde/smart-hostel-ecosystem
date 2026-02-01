import React, { useState, useEffect } from 'react';
import complaintService from '../../services/complaintService';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
    PlusCircle,
    ClockCounterClockwise,
    ChatCircleText,
    PaperPlaneRight,
    Tag,
    FileText
} from 'phosphor-react';

const StudentComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useNotification();
    const { user } = useAuth(); 
    const [studentId, setStudentId] = useState(null);

    const [formData, setFormData] = useState({
        category: '',
        description: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const init = async () => {
            try {
                const stats = await studentService.getStats();
                if (stats && stats.studentId) {
                    setStudentId(stats.studentId);
                    await fetchComplaints(stats.studentId);
                } else {
                    console.error("Could not retrieve student ID");
                    showToast('Error', 'Could not retrieve student profile.', 'error');
                }
            } catch (error) {
                console.error("Initialization failed", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchComplaints = async (id) => {
        try {
            if (id) {
                const response = await complaintService.getStudentComplaints(id);
                setComplaints(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch complaints", error);
    }
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.category) tempErrors.category = "Category is required";
        if (!formData.description || !formData.description.trim()) tempErrors.description = "Description is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setSubmitting(true);
        try {
            const payload = {
                category: formData.category.toUpperCase(),
                description: formData.description
            };

            await complaintService.raiseComplaint(payload);
            showToast('Success', 'Complaint raised successfully!', 'success');
            setFormData({ category: '', description: '' });
            if (studentId) fetchComplaints(studentId);
            else fetchComplaints(); 
        } catch (error) {
            console.error("Error submitting complaint", error);
            showToast('Error', 'Failed to submit complaint', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ChatCircleText className="text-indigo-600" />
                My Complaints
            </h1>

            {/* Raise Complaint Form */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
                    <PlusCircle size={20} className="text-indigo-500" />
                    Raise a New Complaint
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Select Category</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Mess">Mess</option>
                            <option value="Wifi">Wifi</option>
                            <option value="Cleanliness">Cleanliness</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Describe your issue in detail..."
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300 transition-all flex items-center gap-2"
                        >
                            <PaperPlaneRight size={18} />
                            {submitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Past Complaints List */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <ClockCounterClockwise size={20} className="text-indigo-500" />
                    Complaint History
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {complaints.length > 0 ? (
                                complaints.map((complaint) => (
                                    <tr key={complaint.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.createdAt || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{complaint.description}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            {complaint.resolutionComment ? (
                                                <span className="text-gray-700 italic">{complaint.resolutionComment}</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                    complaint.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                                        complaint.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No complaints raised yet.
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

export default StudentComplaints;
