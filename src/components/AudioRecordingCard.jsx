import React, { useState } from "react";
import { Mic, StopCircle, CheckCircle, Pause, Play, X, Ban } from "lucide-react";

const AudioRecordingCard = ({
    isRecording,
    isPaused,
    recordingTime,
    recordedBlobs,
    selectedRecordings,
    recordingUploadSuccess,
    showPostRecordingActions,
    onStartRecording,
    onStopRecording,
    onPauseResumeRecording,
    onEndRecording,
    onConfirmRecording,
    onRestartRecording,
    onToggleRecordingSelection,
    formatTime,
    showNameModal,
    recordingName,
    onRecordingNameChange,
    onSaveRecordingName,
    onCancelRecordingName
}) => {
    const [localName, setLocalName] = useState("");

    return (
        <>
            {/* Overlay to freeze UI during recording (except this card and modal) */}
            {isRecording && !showNameModal && (
                <div
                    className="fixed inset-0 z-40 cursor-not-allowed"
                    style={{ pointerEvents: 'auto', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.18)' }}
                >
                    <style>{`
                        .cursor-not-allowed, .cursor-not-allowed * {
                            cursor: not-allowed !important;
                        }
                    `}</style>
                </div>
            )}
            <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center gap-3 border border-indigo-100 w-full transition-all duration-300 z-50 relative">
            <div className="font-semibold text-base text-indigo-700 mb-1 flex items-center gap-2">
                Record Meeting Audio
            </div>
            {/* Recording UI and logic here (already present above) */}
            {isRecording ? (
                <div className="w-full flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-gray-600 text-sm font-medium">
                            {isPaused ? "Recording Paused" : "Recording..."}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="mt-1 h-6 flex items-end gap-1 w-full justify-center">
                        {[...Array(16)].map((_, i) => (
                            <span
                                key={i}
                                className={`block w-1 rounded bg-indigo-400 transition-all duration-300 ${(!showNameModal && isRecording && !isPaused) ? `animate-wave${i % 4}` : "h-2 bg-gray-200"}`}
                                style={{ height: (!showNameModal && isRecording && !isPaused) ? `${8 + Math.random() * 24}px` : "8px" }}
                            ></span>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-3 w-full justify-center">
                        <button
                            className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition flex items-center gap-2 text-sm cursor-pointer"
                            onClick={onPauseResumeRecording}
                            disabled={showNameModal}
                            style={{ cursor: 'pointer' }}
                        >
                            {isPaused ? (
                                <>
                                    <Play size={14} />
                                    Resume
                                </>
                            ) : (
                                <>
                                    <Pause size={14} />
                                    Pause
                                </>
                            )}
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition flex items-center gap-2 text-sm cursor-pointer"
                            onClick={onEndRecording}
                            disabled={showNameModal}
                            style={{ cursor: 'pointer' }}
                        >
                            <StopCircle size={14} />
                            End Recording
                        </button>
                    </div>
                    {/* Name Recording Modal/Input */}
                    {showNameModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col gap-3 border border-indigo-200">
                                <div className="font-semibold text-base text-indigo-700 mb-1">Name your recording</div>
                                <input
                                    type="text"
                                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                    placeholder="Enter recording name"
                                    value={recordingName ?? localName}
                                    onChange={e => {
                                        if (onRecordingNameChange) {
                                            onRecordingNameChange(e.target.value);
                                        } else {
                                            setLocalName(e.target.value);
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                    <button
                                        className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs font-medium cursor-pointer"
                                        onClick={onCancelRecordingName || (() => setLocalName(""))}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-3 py-1.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 text-xs font-medium cursor-pointer"
                                        onClick={() => {
                                            if (onSaveRecordingName) {
                                                onSaveRecordingName((recordingName ?? localName).trim());
                                            }
                                        }}
                                        disabled={!(recordingName ?? localName).trim()}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <button
                        className="rounded-full p-4 shadow-md bg-indigo-100 hover:bg-indigo-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                        onClick={onStartRecording}
                        type="button"
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="relative flex items-center justify-center">
                            <Mic size={32} className="text-indigo-500" />
                            {/* Tooltip on hover */}
                            <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-lg">
                                Start recording
                            </span>
                        </span>
                    </button>
                    {/* Placeholder below mic icon */}
                    <span className="text-gray-500 text-xs mt-2">Start recording</span>
                </div>
            )}
            {/* Recording List */}
            {recordedBlobs && recordedBlobs.length > 0 && !isRecording && (
                <div className="w-full mt-3">
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Saved Recordings</h3>
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                        {recordedBlobs.map((blob, index) => (
                            <div 
                                key={index}
                                className="flex items-center p-2 border-b border-gray-200 last:border-b-0 hover:bg-indigo-50"
                            >
                                <input
                                    type="checkbox"
                                    id={`recording-${index}`}
                                    checked={selectedRecordings.includes(index)}
                                    onChange={() => onToggleRecordingSelection(index)}
                                    className="mr-2 h-3 w-3 text-indigo-500 focus:ring-indigo-400"
                                />
                                <label 
                                    htmlFor={`recording-${index}`}
                                    className="flex-1 flex items-center gap-2 cursor-pointer"
                                >
                                    <div className="p-1 bg-indigo-100 rounded-full">
                                        <Mic size={14} className="text-indigo-500" />
                                    </div>
                                    <span className="text-xs text-gray-800">
                                        {blob.name ? blob.name : `Recording ${index + 1}`} - {formatTime(blob.duration || 0)}
                                    </span>
                                </label>
                                {blob.url && (
                                    <audio
                                        src={blob.url}
                                        controls
                                        className="h-6 ml-2"
                                    />
                                )}
                                {/* Remove (X) button for recorded audio */}
                                <button
                                    className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none cursor-pointer"
                                    title="Remove recording"
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (typeof onRemoveRecording === 'function') {
                                            onRemoveRecording(index);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Recording Upload Success Message */}
            {recordingUploadSuccess && (
                <div className="mt-3 p-2 bg-indigo-50 rounded-lg border border-green-200 w-full flex items-center gap-2">
                    <div className="p-1 bg-green-100 rounded-full">
                        <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-green-800 truncate">
                            Recording 'meeting_recording' uploaded successfully.
                        </p>
                    </div>
                </div>
            )}
            {/* Show Confirm/Restart after recording if popup was closed */}
            {showPostRecordingActions && recordedBlobs && recordedBlobs.length > 0 && !isRecording && (
                <div className="flex gap-3 mt-3 w-full justify-center">
                    <button
                        className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition text-sm cursor-pointer"
                        onClick={onConfirmRecording}
                        style={{ cursor: 'pointer' }}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition text-sm cursor-pointer"
                        onClick={onRestartRecording}
                        style={{ cursor: 'pointer' }}
                    >
                        Restart
                    </button>
                </div>
            )}
            {!isRecording && recordedBlobs?.length === 0 && (
                <div className="text-gray-500 text-center mt-2 text-sm">
                    Click the microphone button to start recording your meeting
                </div>
            )}
        </div>
        </>
    );
}

export default AudioRecordingCard;