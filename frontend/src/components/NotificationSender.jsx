import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import studentService from '../services/studentService';

const NotificationSender = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sendToAll, setSendToAll] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [targetRole] = useState('STUDENT'); // Default to STUDENT for now
    const [loading, setLoading] = useState(false);
    const [statusData, setStatusData] = useState({ type: '', msg: '' });

    // Handle search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2 && !sendToAll) {
                try {
                    const results = await studentService.searchStudents(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, sendToAll]);

    const handleSelectStudent = (student) => {
        if (!selectedStudents.find(s => s.userId === student.userId)) {
            setSelectedStudents([...selectedStudents, student]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveStudent = (userId) => {
        setSelectedStudents(selectedStudents.filter(s => s.userId !== userId));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusData({ type: '', msg: '' });

        try {
            const userIds = selectedStudents.map(s => s.userId);

            if (!sendToAll && userIds.length === 0) {
                setStatusData({ type: 'error', msg: 'Please select at least one student.' });
                setLoading(false);
                return;
            }

            const payload = {
                title,
                message,
                sendToAll,
                userIds: sendToAll ? [] : userIds,
                targetRole
            };

            await notificationService.broadcast(payload);
            setStatusData({ type: 'success', msg: 'Notification sent successfully!' });

            setTitle('');
            setMessage('');
            setSendToAll(true);
            setSelectedStudents([]);
        } catch (error) {
            console.error("Send failed", error);
            setStatusData({ type: 'error', msg: 'Failed to send notification.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📢 Send Announcement</h2>

            {statusData.msg && (
                <div className={`p-3 mb-4 rounded-lg text-sm ${statusData.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                    {statusData.msg}
                </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Hostel Meeting, Fee Reminder"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                    <div className="flex items-center space-x-4 mb-3">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="recipientType"
                                checked={sendToAll}
                                onChange={() => setSendToAll(true)}
                                className="mr-2 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">All Students</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="recipientType"
                                checked={!sendToAll}
                                onChange={() => setSendToAll(false)}
                                className="mr-2 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">Specific Students</span>
                        </label>
                    </div>

                    {!sendToAll && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Search & Select
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    placeholder="Type student name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map(student => (
                                            <div
                                                key={student.studentId}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => handleSelectStudent(student)}
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-800">{student.fullName}</p>
                                                    <p className="text-xs text-gray-500">Room: {student.roomNumber || 'N/A'}</p>
                                                </div>
                                                <span className="text-indigo-600 text-sm font-medium">+ Add</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Students Chips */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedStudents.map(student => (
                                    <div key={student.studentId} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                                        <span>{student.fullName}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStudent(student.userId)}
                                            className="ml-2 text-indigo-500 hover:text-indigo-900 focus:outline-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {selectedStudents.length === 0 && (
                                    <span className="text-gray-400 text-sm italic">No students selected</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending...' : 'Send Notification'}
                </button>
            </form>
        </div>
    );
};

export default NotificationSender;
