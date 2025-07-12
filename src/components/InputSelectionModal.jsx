import React from "react";
import { Mic, FileAudio, FileText, Video } from "lucide-react";

const InputSelectionModal = ({ isOpen, onClose, onSelectOption }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full flex flex-col items-center gap-6">
                <div className="text-base font-semibold text-gray-800 text-center">
                    How would you like to proceed?
                </div>
                <div className="text-gray-600 text-center mb-2 text-sm">
                    Choose an option to continue with your meeting
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                    {/* Start Instant Meeting Option */}
                    <div 
                        className="bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-lg p-6 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 min-w-[180px]"
                        onClick={() => onSelectOption('recording')}
                    >
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <Mic size={24} className="text-indigo-500" />
                        </div>
                        <div className="font-semibold text-indigo-700 text-sm">Start Instant Meeting</div>
                        <div className="text-xs text-gray-500 text-center">
                            Record your meeting audio directly in the browser
                        </div>
                    </div>

                    {/* Upload Audio Option */}
                    <div 
                        className="bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-lg p-6 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 min-w-[180px]"
                        onClick={() => onSelectOption('audio')}
                    >
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <FileAudio size={24} className="text-indigo-500" />
                        </div>
                        <div className="font-semibold text-indigo-700 text-sm">Upload Audio Files</div>
                        <div className="text-xs text-gray-500 text-center">
                            Upload pre-recorded audio files from your device
                        </div>
                    </div>

                    {/* Upload Video Option */}
                    <div 
                        className="bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-lg p-6 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 min-w-[180px]"
                        onClick={() => onSelectOption('video')}
                    >
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <Video size={24} className="text-indigo-500" />
                        </div>
                        <div className="font-semibold text-indigo-700 text-sm">Upload Video Files</div>
                        <div className="text-xs text-gray-500 text-center">
                            Upload video files and extract audio for processing
                        </div>
                    </div>

                    {/* Upload Transcript Option */}
                    <div 
                        className="bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-lg p-6 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 min-w-[180px]"
                        onClick={() => onSelectOption('transcript')}
                    >
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <FileText size={24} className="text-indigo-500" />
                        </div>
                        <div className="font-semibold text-indigo-700 text-sm">Upload Transcript Files</div>
                        <div className="text-xs text-gray-500 text-center">
                            Upload meeting transcripts in text or document format
                        </div>
                    </div>
                </div>
                
                <button
                    className="mt-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default InputSelectionModal;
