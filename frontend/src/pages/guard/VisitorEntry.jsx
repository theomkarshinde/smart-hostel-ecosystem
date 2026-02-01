import React, { useEffect, useState } from 'react';
import guardService from '../../services/guardService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const VisitorEntry = () => {
    const { showToast } = useNotification();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        visitorName: '',
        purpose: '',
        contactNumber: '',
        studentId: ''
    });
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const [studentSuggestions, setStudentSuggestions] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const data = await guardService.getRecentVisitors();
            setVisitors(data);
        } catch (err) {
            console.error("Failed to fetch visitors", err);
            setVisitors([]); 
        } finally {
            setLoading(false);
        }
    };

    const [isSearching, setIsSearching] = useState(false);

    const handleSearchStudent = async (e) => {
        const query = e.target.value;
        setSelectedStudentName(query);
        if (query.length > 2) {
            setIsSearching(true);
            try {
                const results = await guardService.searchStudents(query);
                setStudentSuggestions(results);
                console.log("Search results:", results);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setStudentSuggestions([]);
            setIsSearching(false);
        }
    };

    const selectStudent = (student) => {
        setFormData({ ...formData, studentId: student.studentId });
        setSelectedStudentName(student.fullName);
        setStudentSuggestions([]);
    };



    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.visitorName.trim()) {
            showToast('Error', 'Visitor Name is required', 'error');
            return;
        }
        if (!formData.studentId) {
            showToast('Error', 'Please select a student from the search results', 'error');
            return;
        }
        if (!formData.contactNumber.trim() || !/^\d{10}$/.test(formData.contactNumber)) {
            showToast('Error', 'Please enter a valid 10-digit contact number', 'error');
            return;
        }
        if (!formData.purpose.trim()) {
            showToast('Error', 'Purpose is required', 'error');
            return;
        }

        try {
            await guardService.logVisitor(formData);
            fetchVisitors(); 
            setFormData({ visitorName: '', purpose: '', contactNumber: '', studentId: '' });
            setSelectedStudentName('');
            setShowModal(false);
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to log visitor.', 'error');
        }
    };

    const handleMarkExit = async (id) => {
        try {
            await guardService.checkoutVisitor(id);
            fetchVisitors();
            showToast('Success', 'Visitor exit marked successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to mark visitor exit. Please try again.', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Visitor Entry Log</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    New Visitor Entry
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : visitors.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No visitors recorded.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Meet (Student)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visitors.map((visitor) => (
                                <tr key={visitor.visitorId}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{visitor.visitorName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{visitor.studentName || visitor.studentId}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{visitor.purpose}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{visitor.contactNumber}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {visitor.inTime ? (
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(visitor.inTime).toLocaleDateString('en-IN')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(visitor.inTime).toLocaleTimeString('en-IN')}
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {visitor.outTime ? (
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(visitor.outTime).toLocaleDateString('en-IN')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(visitor.outTime).toLocaleTimeString('en-IN')}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-yellow-600 font-medium">Still Inside</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!visitor.outTime && (
                                            <button
                                                onClick={() => handleMarkExit(visitor.visitorId)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold"
                                            >
                                                Mark Exit
                                            </button>
                                        )}
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
                        <h3 className="text-xl font-bold mb-4">Register Visitor</h3>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Visitor Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter visitor's full name"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.visitorName}
                                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">
                                    Student Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Type to search (min 3 chars)..."
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={selectedStudentName}
                                    onChange={handleSearchStudent}
                                    autoComplete="off"
                                />
                                {(studentSuggestions.length > 0 || isSearching || (selectedStudentName.length > 2 && studentSuggestions.length === 0)) && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                                        {isSearching && <li className="p-2 text-gray-500 text-sm">Searching...</li>}

                                        {!isSearching && studentSuggestions.length === 0 && selectedStudentName.length > 2 && (
                                            <li className="p-2 text-gray-500 text-sm">No students found.</li>
                                        )}

                                        {!isSearching && studentSuggestions.map(student => (
                                            <li
                                                key={student.studentId}
                                                className="p-2 hover:bg-indigo-50 cursor-pointer text-sm"
                                                onClick={() => selectStudent(student)}
                                            >
                                                {student.fullName} ({student.roomNumber || 'N/A'})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    placeholder="Enter 10-digit number"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.contactNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                        setFormData({ ...formData, contactNumber: value });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Purpose <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter purpose of visit"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorEntry;
