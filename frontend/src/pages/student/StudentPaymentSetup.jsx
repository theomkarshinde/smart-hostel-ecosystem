import React, { useState } from 'react';
import studentService from '../../services/studentService';
import { useNotification } from '../../context/NotificationContext';

const StudentPaymentSetup = ({ student, onComplete }) => {
    const [isEmi, setIsEmi] = useState(false);
    const [installments, setInstallments] = useState(3);
    const [loading, setLoading] = useState(false);
    const { showToast } = useNotification();

    const totalFee = student.totalFee || 0;
    const emiAmount = (totalFee / installments).toFixed(2);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await studentService.setupPayment(student.studentId, isEmi, isEmi ? parseFloat(emiAmount) : 0);
            showToast('Success', 'Payment plan selected successfully!', 'success');
            onComplete();
        } catch (error) {
            console.error("Setup failed", error);
            showToast('Error', 'Failed to save payment plan', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-indigo-600 p-6 text-white">
                    <h2 className="text-3xl font-extrabold">Welcome to Hostel Management</h2>
                    <p className="mt-2 text-indigo-100 italic">Please finalize your fee payment plan to continue.</p>
                </div>

                <div className="p-8">
                    <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-sm text-indigo-600 font-bold uppercase tracking-wider">Total Hostel Fee</div>
                        <div className="text-4xl font-black text-indigo-900">₹{totalFee.toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Full Payment Card */}
                        <div
                            onClick={() => setIsEmi(false)}
                            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${!isEmi ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-200 hover:border-indigo-300'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!isEmi ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                    {!isEmi && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${!isEmi ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>Recommended</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Full Payment</h3>
                            <p className="text-sm text-gray-600 mb-4">Pay the entire amount at once and enjoy peace of mind for the semester.</p>
                            <div className="text-2xl font-black text-indigo-600">₹{totalFee.toLocaleString()}</div>
                        </div>

                        {/* EMI Card */}
                        <div
                            onClick={() => setIsEmi(true)}
                            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${isEmi ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-200 hover:border-indigo-300'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isEmi ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                    {isEmi && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">Flexible</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Installment (EMI)</h3>
                            <p className="text-sm text-gray-600 mb-4">Break your fee into multiple monthly payments for better cash flow.</p>

                            {isEmi && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Months</label>
                                        <select
                                            value={installments}
                                            onChange={(e) => setInstallments(parseInt(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value={2}>2 Months</option>
                                            <option value={3}>3 Months</option>
                                            <option value={4}>4 Months</option>
                                            <option value={5}>5 Months</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 mb-1 uppercase">Monthly EMI</div>
                                        <div className="text-2xl font-black text-indigo-600">₹{parseFloat(emiAmount).toLocaleString()}</div>
                                    </div>
                                </div>
                            )}
                            {!isEmi && <div className="h-20 flex items-center justify-center text-gray-400 italic text-sm">Select to configure...</div>}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl text-white font-black text-lg shadow-xl transition-all duration-200 transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                                <span>Securing Plan...</span>
                            </div>
                        ) : (
                            'Confirm Payment Plan'
                        )}
                    </button>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        * Note: This selection is one-time and cannot be changed later without warden approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentPaymentSetup;
