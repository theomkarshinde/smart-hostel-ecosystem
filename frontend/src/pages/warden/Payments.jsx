import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import studentService from '../../services/studentService';
import { useNotification } from '../../context/NotificationContext';

const WardenPayments = () => {
    const { showToast } = useNotification();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        paymentType: 'WALLET' 
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
               
                try {
                    
                    const data = await import('../../services/studentService').then(m => m.default.searchStudents(query));
                    if (Array.isArray(data)) setResults(data);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId || !formData.amount) {
            showToast('Error', 'Please fill all fields', 'error');
            return;
        }

        try {
            await wardenService.addCashPayment({
                studentId: formData.studentId,
                amount: parseFloat(formData.amount),
                paymentType: formData.paymentType
            });
            showToast('Success', 'Payment recorded successfully!', 'success');
            setFormData({ studentId: '', amount: '', paymentType: 'WALLET' });
            setQuery('');
        } catch (error) {
            console.error("Payment failed", error);
            const errorMsg = error.response?.data?.message || 'Failed to record payment';
            showToast('Error', errorMsg, 'error');
        }
    };

    return (
        <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Record Cash Payment</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Search Student Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Type name to search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {results.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {results.map((student) => (
                                        <div
                                            key={student.studentId}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                setFormData({ ...formData, studentId: student.studentId });
                                                setQuery(student.fullName);
                                                setResults([]); 
                                            }}
                                        >
                                            <div className="font-medium text-gray-800">{student.fullName}</div>
                                            <div className="text-xs text-gray-500">Room: {student.roomNumber || 'N/A'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selected Student ID</label>
                        <input
                            type="text"
                            value={formData.studentId}
                            disabled
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Amount in ₹"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                        <select
                            value={formData.paymentType}
                            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="WALLET">Wallet Fee (Mess/Laundry)</option>
                            <option value="HOSTEL">Hostel Fees</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-medium"
                    >
                        Record Payment
                    </button>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                        'Wallet Fee' adds to the student's wallet balance. 'Hostel Fees' pays for accommodation.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default WardenPayments;
