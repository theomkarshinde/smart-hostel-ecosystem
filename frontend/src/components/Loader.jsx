import React from 'react';

const Loader = ({ fullScreen = false }) => {
    return (
        <div className={`${fullScreen ? 'fixed inset-0 z-50 bg-white bg-opacity-80' : 'w-full py-12'} flex justify-center items-center`}>
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    );
};

export default Loader;
