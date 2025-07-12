import React from "react";

const RecordingConfirmationModal = ({
    showRecordingConfirm,
    onClose,
    onConfirm,
    onRestart
}) => {
    if (!showRecordingConfirm) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full flex flex-col items-center gap-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-lg font-semibold text-gray-800 text-center">
                    Confirm Your Recording
                </div>
                <div className="text-gray-600 text-center text-sm">
                    Would you like to use this recording or restart?
                </div>
                <div className="flex gap-3 mt-3 w-full justify-center">
                    <button
                        className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition text-sm"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition text-sm"
                        onClick={onRestart}
                    >
                        Restart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordingConfirmationModal;
