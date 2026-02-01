import React, { useEffect, useState } from 'react';
import wardenService from '../../services/wardenService';
import adminService from '../../services/adminService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle, XCircle, Info, CurrencyInr, Door, House, IdentificationCard, GenderIntersex } from 'phosphor-react';

const PendingStudents = () => {
    const { showToast } = useNotification();
    const [students, setStudents] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        buildingId: '',
        totalFee: '',
        isEmiEnabled: '',
        emiAmount: '',
        roomNumber: ''
    });
    const [allocatedRooms, setAllocatedRooms] = useState([]);

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    const fetchPendingStudents = async () => {
        try {
            const [studentsData, buildingsData] = await Promise.all([
                wardenService.getPendingStudents(),
                wardenService.getMyBuildings()
            ]);
            setStudents(studentsData);
            setBuildings(buildingsData);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const openApproveModal = async (student) => {
        setSelectedStudent(student);
        const initialBuildingId = student.buildingId || (buildings.length > 0 ? (buildings[0].buildingId || buildings[0].id) : '');
        const selectedBuilding = buildings.find(b => (b.buildingId || b.id) == initialBuildingId);
        setFormData({
            buildingId: initialBuildingId,
            totalFee: selectedBuilding?.fee || student.totalFee || '',
            isEmiEnabled: false,
            emiAmount: '',
            roomNumber: student.roomNumber || ''
        });

        if (initialBuildingId) {
            try {
                const roomData = await wardenService.getAllocatedRooms(initialBuildingId);
                setAllocatedRooms(roomData || []);
            } catch (err) {
                console.error("Failed to fetch allocated rooms", err);
                setAllocatedRooms([]);
            }
        }

        setShowModal(true);
    };

    const closeApproveModal = () => {
        setShowModal(false);
        setSelectedStudent(null);
    };

    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        try {
            const feeData = {
                totalFee: parseFloat(formData.totalFee),
                isEmiEnabled: false,
                emiAmount: 0.0,
                roomNumber: formData.roomNumber
            };

            await wardenService.approveStudent(selectedStudent.studentId, formData.buildingId, feeData);
            showToast('Success', 'Student Approved Successfully', 'success');
            closeApproveModal();
            fetchPendingStudents();
        } catch (err) {
            console.error('Failed to approve', err);
            showToast('Error', err.message || 'Failed to approve student', 'error');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this student?")) return;
        try {
            await wardenService.rejectStudent(id);
            showToast('Success', 'Student Rejected', 'success');
            fetchPendingStudents();
        } catch (err) {
            console.error('Failed to reject', err);
            showToast('Error', err.message || 'Failed to reject student', 'error');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending Student Registrations</h2>

            {loading ? (
                <Loader />
            ) : students.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No pending approvals found.
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.studentId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <IdentificationCard size={18} className="text-indigo-600" />
                                            {student.fullName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5"><GenderIntersex size={16} /> {student.gender}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="flex items-center gap-1 w-fit px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            <Info size={14} />
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => openApproveModal(student)}
                                            className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-200"
                                        >
                                            <CheckCircle size={14} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(student.studentId)}
                                            className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200"
                                        >
                                            <XCircle size={14} />
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Approval Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <CheckCircle size={24} className="text-green-600" />
                            Approve Student
                        </h3>
                        <form onSubmit={handleApproveSubmit}>
                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <House size={18} className="text-indigo-600" />
                                    Building
                                </label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.buildingId}
                                    onChange={async (e) => {
                                        const newBuildingId = e.target.value;
                                        const building = buildings.find(b => (b.buildingId || b.id) == newBuildingId);
                                        const requestedRoom = selectedStudent?.roomNumber || '';
                                        setFormData({
                                            ...formData,
                                            buildingId: newBuildingId,
                                            roomNumber: requestedRoom,
                                            totalFee: building?.fee || ''
                                        });

                                        if (newBuildingId) {
                                            try {
                                                const roomData = await wardenService.getAllocatedRooms(newBuildingId);
                                                setAllocatedRooms(roomData || []);
                                            } catch (err) {
                                                console.error("Failed to fetch allocated rooms", err);
                                                setAllocatedRooms([]);
                                            }
                                        } else {
                                            setAllocatedRooms([]);
                                        }
                                    }}
                                    required
                                >
                                    <option value="">Select Building</option>
                                    {buildings.map(b => (
                                        <option key={b.buildingId} value={b.buildingId}>
                                            {b.buildingName} (Available: {b.availableRooms})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <Door size={18} className="text-indigo-600" />
                                    Room Number
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                    required
                                    placeholder="e.g. 101-A"
                                />
                                {allocatedRooms.length > 0 && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                                        <p className="text-xs font-semibold text-red-700 mb-1">Already Occupied Rooms:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {allocatedRooms.map((room, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                    {room}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <CurrencyInr size={18} className="text-indigo-600" />
                                    Total Hostel Fee
                                </label>
                                <div className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700 font-semibold flex items-center gap-1">
                                    <CurrencyInr size={14} /> {formData.totalFee || 0}
                                </div>
                                <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                                    <Info size={14} />
                                    This fee is fixed for the selected building.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeApproveModal}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                                >
                                    <XCircle size={18} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-md font-semibold"
                                >
                                    <CheckCircle size={18} weight="bold" />
                                    Confirm Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingStudents;
