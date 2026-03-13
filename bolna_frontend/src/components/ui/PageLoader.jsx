import React from 'react';

const PageLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full animate-in fade-in duration-500">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 animate-pulse"></div>
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Loading data...</p>
        </div>
    );
};

export default PageLoader;
