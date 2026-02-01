import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import complaintService from '../../services/complaintService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const WardenComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { showToast } = useNotification();
    const [buildingId, setBuildingId] = useState(null);
    const [isMessWarden, setIsMessWarden] = useState(false);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [staffType, setStaffType] = useState('CLEANER');
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [actionNote, setActionNote] = useState('');
    const [assigning, setAssigning] = useState(false);

    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolveComment, setResolveComment] = useState('');
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await wardenService.getProfile();
                console.log("DEBUG: Warden Profile:", profile);
                console.log("DEBUG: profile.managesMess value:", profile?.managesMess);
                console.log("DEBUG: Type of managesMess:", typeof profile?.managesMess);
                if (profile && profile.managesMess) {
                    console.log("DEBUG: Warden manages mess. Fetching mess complaints.");
                    setIsMessWarden(true);
                    const response = await complaintService.getMessComplaints();
                    console.log("DEBUG: Mess Complaints Response:", response.data);
                    setComplaints(response.data || []);
                } else if (profile && profile.buildingId) {
                    setBuildingId(profile.buildingId);
                    console.log("DEBUG: Fetching complaints for Building ID:", profile.buildingId);
                    await fetchComplaints(profile.buildingId);
                } else {
                    console.warn('Warden has no assigned building or mess roles.');
                }
            } catch (error) {
                console.error("Initialization failed", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredComplaints(complaints);
        } else {
            setFilteredComplaints(complaints.filter(c => c.status === statusFilter));
        }
    }, [complaints, statusFilter]);

    useEffect(() => {
        if (showAssignModal) {
            fetchStaffByType();
        }
    }, [staffType, showAssignModal]);

    const fetchStaffByType = async () => {
        try {
            const response = await wardenService.getStaffByType(staffType);
            setStaffList(response || []);
            if (response && response.length > 0) setSelectedStaff(response[0].staffId);
            else setSelectedStaff('');
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const fetchComplaints = async (bId) => {
        try {
            const id = bId || buildingId;
            console.log("DEBUG: fetchComplaints called with ID:", id);
            if (!id) return;

            const response = await complaintService.getBuildingComplaints(id, 'ALL');
            console.log("DEBUG: fetchComplaints response data:", response.data);
            setComplaints(response.data || []);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        }
    };

    const handleStatusUpdate = async (id, newStatus, comment = '') => {
        try {
            await complaintService.updateComplaintStatus(id, newStatus, comment);
            showToast('Success', `Complaint marked as ${newStatus}`, 'success');
            await complaintService.updateComplaintStatus(id, newStatus, comment);
            showToast('Success', `Complaint marked as ${newStatus}`, 'success');

            setComplaints(prev => prev.map(c =>
                (c.complaintId === id || c.id === id)
                    ? { ...c, status: newStatus, resolutionComment: comment }
                    : c
            ));

        } catch (error) {
            console.error("Failed to update status", error);
            showToast('Error', 'Failed to update status', 'error');
        }
    };

    const openResolveModal = (complaint) => {
        setSelectedComplaint(complaint);
        setResolveComment('');
        setShowResolveModal(true);
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        setResolving(true);
        try {
            await handleStatusUpdate(selectedComplaint.complaintId || selectedComplaint.id, 'RESOLVED', resolveComment);
            setShowResolveModal(false);
        } finally {
            setResolving(false);
        }
    };

    const openAssignModal = (complaint) => {
        setSelectedComplaint(complaint);
        let type = 'CLEANER';
        if (complaint.category === 'Wifi' || complaint.category === 'Electric') type = 'ELECTRICIAN';
        if (complaint.category === 'Maintenance') type = 'PLUMBER'; 
        if (complaint.category === 'Security') type = 'SECURITY';
        if (complaint.category === 'Mess') type = 'MESS';
        setStaffType(type);
        setShowAssignModal(true);
        setActionNote(`Assigned to check ${complaint.category} issue.`);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStaff) {
            showToast('Error', 'Please select a staff member', 'error');
            return;
        }

        setAssigning(true);
        try {
            await complaintService.assignStaff({
                complaintId: selectedComplaint.complaintId, 
                staffId: selectedStaff,
                actionTaken: actionNote
            });
            showToast('Success', 'Staff assigned successfully', 'success');
            setShowAssignModal(false);
            showToast('Success', 'Staff assigned successfully', 'success');
            setShowAssignModal(false);
            if (isMessWarden) {
                const response = await complaintService.getMessComplaints();
                setComplaints(response.data || []);
            } else if (buildingId) {
                fetchComplaints(buildingId);
            }
        } catch (error) {
            console.error("Failed to assign staff", error);
            showToast('Error', 'Failed to assign staff', 'error');
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isMessWarden ? 'Mess Complaints' : 'Building Complaints'}
                </h1>

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
                                    <tr key={complaint.complaintId || complaint.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{complaint.studentName || 'Student'}</div>
                                            <div className="text-sm text-gray-500">Room: {complaint.roomNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
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
                                            {complaint.status !== 'RESOLVED' && complaint.status !== 'REJECTED' ? (
                                                <>
                                                    <button
                                                        onClick={() => openAssignModal(complaint)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                                                    >
                                                        Assign Staff
                                                    </button>

                                                    <button
                                                        onClick={() => openResolveModal(complaint)}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                                                    >
                                                        Resolve
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-sm text-gray-600 italic">
                                                    {complaint.resolutionComment ? (
                                                        <>
                                                            <span className="font-semibold text-gray-700">Resolution: </span>
                                                            {complaint.resolutionComment}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">No resolution details</span>
                                                    )}
                                                </div>
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

            {/* Assign Staff Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Assign Staff</h3>
                        <form onSubmit={handleAssignSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
                                <select
                                    value={staffType}
                                    onChange={(e) => setStaffType(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="CLEANER">Cleaning</option>
                                    <option value="WARDEN">Warden (Self)</option>
                                    <option value="SECURITY">Security</option>
                                    <option value="MESS">Mess Staff</option>
                                    <option value="ELECTRICIAN">Electrician</option>
                                    <option value="PLUMBER">Plumber</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Person</label>
                                <select
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    className="w-full border rounded p-2"
                                    required
                                >
                                    <option value="">Select Staff</option>
                                    {staffList.map(staff => (
                                        <option key={staff.staffId} value={staff.staffId}>
                                            {staff.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Note</label>
                                <textarea
                                    value={actionNote}
                                    onChange={(e) => setActionNote(e.target.value)}
                                    className="w-full border rounded p-2"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={assigning}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {assigning ? 'Assigning...' : 'Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resolve Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Resolve Complaint</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Provide a final cleanup note or resolution summary.
                        </p>
                        <form onSubmit={handleResolveSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Comment</label>
                                <textarea
                                    value={resolveComment}
                                    onChange={(e) => setResolveComment(e.target.value)}
                                    className="w-full border rounded p-2"
                                    rows="3"
                                    placeholder="e.g. Broken tap replaced."
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowResolveModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resolving}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {resolving ? 'Resolving...' : 'Resolve'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenComplaints;
