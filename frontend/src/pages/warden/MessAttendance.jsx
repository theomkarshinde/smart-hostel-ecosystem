import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import { useNotification } from '../../context/NotificationContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';

const MessAttendance = () => {
    const { user } = useAuth();
    const [showScanner, setShowScanner] = useState(false);

    if (!user?.managesMess && user?.role !== 'ADMIN') {
        return (
            <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
                <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                <p className="text-red-600">Only Mess Wardens and Admins can record mess attendance.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mess Attendance</h2>

            <div className="bg-white p-10 rounded-lg shadow-md text-center">
                <div className="mb-6">
                    <div className="mx-auto h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-4H8m13-4V4a1 1 0 00-1-1h-4.38a4 4 0 00-5.24 0H3a1 1 0 00-1 1v4a1 1 0 001 1h2m13 0a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V11a1 1 0 011-1h2m6 11v-4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Mark Attendance</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Click the button below to open the QR scanner and mark student attendance for the current meal.
                    </p>
                    <button
                        onClick={() => setShowScanner(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 inline-flex items-center gap-2 text-lg font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-4H8m13-4V4a1 1 0 00-1-1h-4.38a4 4 0 00-5.24 0H3a1 1 0 00-1 1v4a1 1 0 001 1h2m13 0a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V11a1 1 0 011-1h2m6 11v-4" />
                        </svg>
                        Scan Mess Entry
                    </button>
                </div>
            </div>

            {/* Scanner Modal */}
            {showScanner && (
                <ScannerModal onClose={() => setShowScanner(false)} />
            )}
        </div>
    );
};

const ScannerModal = ({ onClose }) => {
    const { showToast } = useNotification();
    const [scanResult, setScanResult] = useState(null);
    const [itemLoading, setItemLoading] = useState(false);

    useEffect(() => {
        let scanner = new Html5QrcodeScanner(
            "mess-reader",
            {
                fps: 10,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );
        scanner.render(onScanSuccess, (err) => {
        });

        return () => {
            scanner.clear().catch(err => console.error(err));
        };
    }, []);

    const onScanSuccess = async (decodedText) => {
        if (itemLoading) return;
        setItemLoading(true);
        setScanResult(decodedText);
        try {
            // Mark as MESS attendance
            await wardenService.markQrAttendance(decodedText, 'MESS');
            showToast('Success', 'Mess Entry Marked', 'success');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Failed to mark entry';
            showToast('Error', errorMsg, 'error');
        } finally {
            setItemLoading(false);
            setTimeout(() => setScanResult(null), 3000);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Scan Mess Entry QR</h3>
                    <div className="mt-4">
                        <div id="mess-reader" width="300px"></div>
                        {scanResult && <p className="text-sm text-green-600 mt-2 font-bold">Processed: {scanResult.substring(0, 10)}...</p>}
                    </div>
                    <div className="mt-4 px-4 py-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessAttendance;
