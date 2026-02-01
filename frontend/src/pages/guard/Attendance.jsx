import React, { useState, useEffect } from 'react';
import guardService from '../../services/guardService';
import { useNotification } from '../../context/NotificationContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Attendance = () => {
    const { showToast } = useNotification();
    const [activeTab, setActiveTab] = useState('QR'); 
    const [manualData, setManualData] = useState({ username: '' });
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        let scanner = null;
        if (activeTab === 'QR') {
            setTimeout(() => {
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
                scanner.render(onScanSuccess, onScanFailure);
            }, 100);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [activeTab]);

    const onScanSuccess = async (decodedText, decodedResult) => {
        if (loading) return;
        setScanResult(decodedText);
        setLoading(true);
        try {
            await guardService.markQrAttendance(decodedText, 'HOSTEL');
            showToast('Success', 'Attendance marked successfully (QR)', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error', 'Invalid QR Token or Attendance Failed', 'error');
        } finally {
            setLoading(false);
            setTimeout(() => setScanResult(null), 3000);
        }
    };

    const onScanFailure = (error) => {
    };

    useEffect(() => {
        if (activeTab === 'MANUAL' && searchQuery.length >= 2) {
            const fetchStudents = async () => {
                try {
                    const data = await guardService.searchStudents(searchQuery);
                    setStudents(data);
                    setFilteredStudents(data);
                } catch (err) {
                    console.error('Failed to fetch students', err);
                }
            };
            fetchStudents();
        } else {
            setFilteredStudents([]);
        }
    }, [searchQuery, activeTab]);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setSearchQuery(student.fullName || student.username);
        setManualData({ username: student.username });
        setShowDropdown(false);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStudent) {
            showToast('Error', 'Please select a student from the dropdown', 'error');
            return;
        }

        const username = selectedStudent.username || selectedStudent.user?.username;

        if (!username) {
            console.error('Selected student object:', selectedStudent);
            showToast('Error', 'Student username not found. Please try selecting again.', 'error');
            return;
        }

        setLoading(true);
        try {
            await guardService.manualStudentEntry(username, {
                attendanceType: 'HOSTEL'
            });
            showToast('Success', `Attendance marked for ${selectedStudent.fullName || username}!`, 'success');
            setManualData({ username: '' });
            setSearchQuery('');
            setSelectedStudent(null);
            setFilteredStudents([]);
            setShowDropdown(false);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to mark attendance manually';
            showToast('Error', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Attendance</h2>

            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'QR' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('QR')}
                    >
                        QR Code Scan
                    </button>
                    <button
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'MANUAL' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('MANUAL')}
                    >
                        Manual Entry
                    </button>
                </div>

                <div className="p-6 overflow-visible">
                    {activeTab === 'QR' ? (
                        <div className="space-y-4">
                            <div id="reader" width="600px"></div>
                            {scanResult && <p className="text-green-600 text-center font-bold mt-4">Last Scan: {scanResult.substring(0, 10)}...</p>}
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                                <input
                                    type="text"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Type student name or username..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowDropdown(true);
                                        if (!e.target.value) {
                                            setSelectedStudent(null);
                                            setManualData({ username: '' });
                                        }
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />

                                {showDropdown && filteredStudents.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
                                        {filteredStudents.map((student) => (
                                            <div
                                                key={student.studentId}
                                                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                onClick={() => handleStudentSelect(student)}
                                            >
                                                <div className="font-medium text-gray-900">{student.fullName || student.username}</div>
                                                <div className="text-sm text-gray-500">
                                                    {student.username} • Room: {student.roomNumber || 'N/A'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showDropdown && searchQuery.length >= 2 && filteredStudents.length === 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                                        No students found
                                    </div>
                                )}
                            </div>

                            {selectedStudent && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                                    <p className="text-sm font-medium text-gray-700">Selected Student:</p>
                                    <p className="text-gray-900 font-semibold">{selectedStudent.fullName || selectedStudent.username}</p>
                                    <p className="text-sm text-gray-600">Room: {selectedStudent.roomNumber || 'N/A'}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !selectedStudent}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Mark Attendance'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Attendance;
