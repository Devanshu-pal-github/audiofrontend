import React from "react";
import { FileAudio, Cloud, CheckCircle } from "lucide-react";

const AudioUploadCard = ({
    audioFiles,
    selectedAudioFiles,
    audioUploadSuccess,
    audioDragActive,
    onFileChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onToggleAudioSelection,
    onRemove
}) => {
    return (
        <div
            className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center gap-3 border border-indigo-100 w-full transition-all duration-300"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="font-semibold text-sm text-indigo-700 mb-1 flex items-center gap-2">
                <div className="p-1 bg-indigo-100 rounded-full">
                    <FileAudio size={18} className="text-indigo-500" />
                </div>
                Upload Audio Files
            </div>
            
            <div className="flex flex-col items-center w-full">
                <input
                    type="file"
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="audio-upload-input"
                    onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                            onFileChange(e.target.files[0]);
                        }
                    }}
                    multiple
                />
                
                {/* Enhanced Drop Zone */}
                <div 
                    className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-purple-50 transition-all duration-300 cursor-pointer hover:from-indigo-100 hover:to-purple-100 ${
                        audioDragActive ? 'border-indigo-500 from-indigo-100 to-purple-100 scale-105' : 'border-indigo-200'
                    }`}
                    onClick={() => document.getElementById('audio-upload-input').click()}
                    style={{ minHeight: '80px' }}
                >
                    <div className={`transition-all duration-300 ${audioDragActive ? 'scale-110' : ''}`}>
                        <Cloud size={32} className={`mb-2 ${audioDragActive ? 'text-indigo-600' : 'text-indigo-400'}`} />
                    </div>
                    <div className="text-center">
                        <p className={`text-xs font-medium mb-0.5 ${audioDragActive ? 'text-indigo-700' : 'text-indigo-600'}`}>
                            {audioDragActive ? 'Drop your audio files here' : 'Drag & drop audio files here'}
                        </p>
                        <p className="text-xs text-indigo-400">
                            or click to browse files (multiple files supported)
                        </p>
                    </div>
                </div>

                {/* Audio Files List */}
                {audioFiles && audioFiles.length > 0 && (
                    <div className="w-full mt-3">
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm">Uploaded Audio Files</h3>
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                            {audioFiles.map((file, index) => (
                                <div 
                                    key={index}
                                    className={`flex items-center p-2 border-b border-gray-200 last:border-b-0 hover:bg-indigo-50 ${file.uploaded ? 'bg-green-50' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`audio-file-${index}`}
                                        checked={selectedAudioFiles.includes(index)}
                                        onChange={() => onToggleAudioSelection(index)}
                                        className="mr-2 h-3 w-3 text-indigo-500 focus:ring-indigo-400"
                                    />
                                    <label 
                                        htmlFor={`audio-file-${index}`}
                                        className="flex-1 flex items-center gap-2 cursor-pointer"
                                    >
                                        <div className="p-0.5 bg-indigo-100 rounded-full">
                                            <FileAudio size={12} className="text-indigo-500" />
                                        </div>
                                        <span className="text-xs text-gray-800 truncate max-w-[160px]">
                                            {file.name}
                                        </span>
                                    </label>
                                    {file.uploaded && (
                                        <div className="ml-1">
                                            <CheckCircle size={12} className="text-green-500" />
                                        </div>
                                    )}
                                    {file.url && (
                                        <audio
                                            src={file.url}
                                            controls
                                            className="h-6 ml-2"
                                        />
                                    )}
                                    {/* Remove (cross) button */}
                                    <button
                                        className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                                        title="Remove audio file"
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (typeof window !== 'undefined' && window.confirm('Remove this audio file?')) {
                                                onRemove && onRemove(index);
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {audioFiles?.length === 0 && (
                    <div className="text-gray-500 text-center mt-2 text-xs">
                        No audio files uploaded yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioUploadCard;