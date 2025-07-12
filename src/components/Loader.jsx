import React from 'react';


const Loader = ({ isVisible, message = "Processing...", progress = null }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center min-w-[280px]">
        {/* Animated spinner */}
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
          {progress !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-700">{progress}%</span>
            </div>
          )}
        </div>
        {/* Loading text */}
        <div className="text-lg font-semibold text-gray-800 mb-2">{message}</div>
        <div className="text-xs text-gray-500 text-center">
          {progress !== null
            ? `Completed: ${progress}%`
            : "Please wait while we process your request..."}
        </div>
        {/* Progress bar */}
        {progress !== null && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        {/* Progress dots animation (fallback) */}
        {progress === null && (
          <div className="flex space-x-1 mt-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
