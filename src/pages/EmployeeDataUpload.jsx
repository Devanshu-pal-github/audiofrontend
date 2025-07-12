import Layout from "../components/Layout";
import Loader from "../components/Loader";
import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, Upload, FileAudio, FileText, Cloud, CheckCircle } from "lucide-react";
import MeetingDetailsModal from "../components/MeetingDetailsModal";
import EmployeeSelectionTable from "../components/EmployeeSelectionTable";
import MeetingDetailsForm from "../components/MeetingDetailsForm";
import AudioRecordingCard from "../components/AudioRecordingCard";
import AudioUploadCard from "../components/AudioUploadCard";
import VideoUploadCard from "../components/VideoUploadCard";
import TranscriptUploadCard from "../components/TranscriptUploadCard";
import RecordingConfirmationModal from "../components/RecordingConfirmationModal";
import InputSelectionModal from "../components/InputSelectionModal";
import { useGetUsersQuery } from "../services/api";
import { getSelectedEmployeeUUIDs } from "../components/EmployeeSelectionTable";
import { useUploadAudioMutation, useCreateQuarterMutation, useUploadTranscriptMutation, useGetQuarterWithRocksAndTasksQuery } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import CsvUploadModal from "../components/CsvUploadModal";

const EmployeeDataUpload = () => {

    // --- All state declarations at the top, before any useEffect or logic that uses them ---
    // Meeting input method selection
    const [inputSelectionModalOpen, setInputSelectionModalOpen] = useState(false);
    const [selectedInputMethod, setSelectedInputMethod] = useState(null); // 'recording' | 'audio' | 'video' | 'transcript'
    
    // Upload/recording/transcript states
    // State for naming the recording
    const [showNameModal, setShowNameModal] = useState(false);
    const [recordingName, setRecordingName] = useState("");
    const [pendingRecordingBlob, setPendingRecordingBlob] = useState(null); // temp store for blob before naming
    const [audioFiles, setAudioFiles] = useState([]);
    const [selectedAudioFiles, setSelectedAudioFiles] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [selectedVideoFiles, setSelectedVideoFiles] = useState([]);
    const [recordedBlobs, setRecordedBlobs] = useState([]);
    const [selectedRecordings, setSelectedRecordings] = useState([]);
    const [transcriptFiles, setTranscriptFiles] = useState([]);
    const [selectedTranscriptFiles, setSelectedTranscriptFiles] = useState([]);
    const [audioUploadSuccess, setAudioUploadSuccess] = useState(false);
    const [videoUploadSuccess, setVideoUploadSuccess] = useState(false);
    const [recordingUploadSuccess, setRecordingUploadSuccess] = useState(false);
    const [transcriptUploadSuccess, setTranscriptUploadSuccess] = useState(false);
    const [audioUploadMsg, setAudioUploadMsg] = useState("");
    const [videoUploadMsg, setVideoUploadMsg] = useState("");
    const [transcriptUploadMsg, setTranscriptUploadMsg] = useState("");
    const [audioDragActive, setAudioDragActive] = useState(false);
    const [videoDragActive, setVideoDragActive] = useState(false);
    const [transcriptDragActive, setTranscriptDragActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [showRecordingConfirm, setShowRecordingConfirm] = useState(false);
    const [showPostRecordingActions, setShowPostRecordingActions] = useState(false);
    const [csvUploadOpen, setCsvUploadOpen] = useState(false);
    const [meetingDetailsFilled, setMeetingDetailsFilled] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Meeting details states
    const [meetingType, setMeetingType] = useState("");
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingDescription, setMeetingDescription] = useState("");
    const [quarter, setQuarter] = useState("");
    const [customQuarter, setCustomQuarter] = useState("");
    const [quarterYear, setQuarterYear] = useState("");
    const [quarterWeeks, setQuarterWeeks] = useState(12);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    // Loader/progress states
    const [loaderProgress, setLoaderProgress] = useState(null);
    const [pendingUploadLoading, setPendingUploadLoading] = useState(false);

    // Rocks/tasks fetch states (declare BEFORE any useEffect that uses them)
    const [rocksTasksData, setRocksTasksData] = useState(null);
    const [isFetchingRocksTasks, setIsFetchingRocksTasks] = useState(false);

    // API hooks
    const [uploadAudio, { isLoading: isAudioUploading }] = useUploadAudioMutation();
    const [createQuarter, { isLoading: isQuarterCreating }] = useCreateQuarterMutation();
    const [uploadTranscript, { isLoading: isTranscriptUploading }] = useUploadTranscriptMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const { data: users } = useGetUsersQuery({ token });
    // --- All state declarations above this line ---

    // Handle URL parameters to set initial input method
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const method = urlParams.get('method');
        
        if (method === 'recording') {
            setSelectedInputMethod('recording');
        } else if (method === 'upload') {
            // For upload, we'll show both audio and transcript options
            // Set to 'audio' as default, but user can switch
            setSelectedInputMethod('audio');
        }
    }, [location.search]);

    // Check if meeting details are filled to enable the next step
    useEffect(() => {
        const isMeetingDetailsFilled = 
            meetingTitle && 
            quarter && 
            quarterYear && 
            quarterWeeks && 
            selectedEmployees && 
            selectedEmployees.length > 0;
        
        setMeetingDetailsFilled(isMeetingDetailsFilled);
    }, [meetingTitle, quarter, quarterYear, quarterWeeks, selectedEmployees]);

    // Simulate progress for loader
    useEffect(() => {
        let interval;
        if (pendingUploadLoading || isFetchingRocksTasks) {
            setLoaderProgress(5); // Start at 5%
            interval = setInterval(() => {
                setLoaderProgress(prev => {
                    if (prev >= 90) return 90;
                    return prev + Math.random() * 5;
                });
            }, 400);
        } else {
            // Reset progress when not loading
            if (loaderProgress !== null && loaderProgress !== 100) {
                setLoaderProgress(null);
            }
        }
        return () => interval && clearInterval(interval);
    }, [pendingUploadLoading, isFetchingRocksTasks]);

    // When upload completes, set progress to 100% briefly
    useEffect(() => {
        if (!(pendingUploadLoading || isFetchingRocksTasks) && loaderProgress !== null) {
            setLoaderProgress(100);
            const timer = setTimeout(() => {
                setLoaderProgress(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [pendingUploadLoading, isFetchingRocksTasks]);

    // Helper function to format time
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };


        // Remove audio file by index and update UI immediately
    const handleRemoveAudioFile = (index) => {
        setAudioFiles(prev => {
            const newFiles = prev.filter((_, i) => i !== index);
            // Also update selectedAudioFiles to remove the removed index and shift others
            setSelectedAudioFiles(selPrev => selPrev
                .filter(i => i !== index)
                .map(i => (i > index ? i - 1 : i))
            );
            return newFiles;
        });
    };

    // Remove video file by index and update UI immediately
    const handleRemoveVideoFile = (index) => {
        setVideoFiles(prev => prev.filter((_, i) => i !== index));
        setSelectedVideoFiles(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    // Remove transcript file by index and update UI immediately
    const handleRemoveTranscriptFile = (index) => {
        setTranscriptFiles(prev => {
            const newFiles = prev.filter((_, i) => i !== index);
            setSelectedTranscriptFiles(selPrev => selPrev
                .filter(i => i !== index)
                .map(i => (i > index ? i - 1 : i))
            );
            return newFiles;
        });
    };

    // Remove recorded audio by index and update UI immediately
    const handleRemoveRecording = (index) => {
        setRecordedBlobs(prev => {
            const newBlobs = prev.filter((_, i) => i !== index);
            setSelectedRecordings(selPrev =>
                selPrev.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
            );
            return newBlobs;
        });
    };

    // Recording functions
    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Check supported MIME types and use the most compatible one
            let mimeType = 'audio/webm;codecs=opus';
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                mimeType = 'audio/ogg';
            }
            
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Add to recordings list
                const newRecording = {
                    blob: audioBlob,
                    url: audioUrl,
                    name: `Recording ${recordedBlobs.length + 1}`,
                    duration: recordingTime,
                    mimeType: mimeType,
                    timestamp: new Date().toISOString()
                };
                
                setRecordedBlobs(prev => [...prev, newRecording]);
                // Automatically select the new recording
                setSelectedRecordings(prev => [...prev, recordedBlobs.length]);
                
                // Reset recording state
                setIsRecording(false);
                setRecordingTime(0);
                setShowRecordingConfirm(true);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);

            // Start timer
            const id = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
            setIntervalId(id);
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Could not access microphone. Please make sure you have granted permission.");
        }
    };

    const handlePauseResumeRecording = () => {
        if (!mediaRecorderRef.current) return;
        
        if (isPaused) {
            // Resume recording
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            
            // Resume timer
            const id = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
            setIntervalId(id);
        } else {
            // Pause recording
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            
            // Pause timer
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
        }
    };

    // Modified: When ending recording, show name modal after getting blob
    const handleEndRecording = () => {
        if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
            // Stop timer
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
            // Save the blob after stop
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setPendingRecordingBlob({
                    blob: audioBlob,
                    url: audioUrl,
                    duration: recordingTime,
                    timestamp: new Date().toISOString()
                });
                setShowNameModal(true);
                setRecordingName("");
            };
            mediaRecorderRef.current.stop();
            // Close all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };
    // Save the named recording
    const handleSaveRecordingName = (name) => {
        if (!pendingRecordingBlob) return;
        const newRecording = {
            ...pendingRecordingBlob,
            name: name || `Recording ${recordedBlobs.length + 1}`
        };
        setRecordedBlobs(prev => [...prev, newRecording]);
        setSelectedRecordings(prev => [...prev, recordedBlobs.length]);
        setShowNameModal(false);
        setPendingRecordingBlob(null);
        setRecordingName("");
        setIsRecording(false);
        setRecordingTime(0);
        setShowRecordingConfirm(true);
    };

    const handleCancelRecordingName = () => {
        setShowNameModal(false);
        setPendingRecordingBlob(null);
        setRecordingName("");
        setIsRecording(false);
        setRecordingTime(0);
    };

    const handleRestartRecording = () => {
        setShowRecordingConfirm(false);
        setShowPostRecordingActions(true);
    };

    const handleConfirmRecording = () => {
        setShowRecordingConfirm(false);
        setShowPostRecordingActions(false);
    };

    const handleToggleRecordingSelection = (index) => {
        setSelectedRecordings(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Audio file upload functions
    const handleAudioFileChange = (file) => {
        if (!file) return;
        
        const fileUrl = URL.createObjectURL(file);
        const newAudioFile = {
            file,
            name: file.name,
            url: fileUrl,
            size: file.size,
            type: file.type,
            uploaded: false,
            timestamp: new Date().toISOString()
        };
        
        setAudioFiles(prev => [...prev, newAudioFile]);
        // Automatically select the new file
        setSelectedAudioFiles(prev => [...prev, audioFiles.length]);
        setAudioUploadMsg("");
    };

    const handleAudioDragOver = (e) => {
        e.preventDefault();
        setAudioDragActive(true);
    };

    const handleAudioDragLeave = () => {
        setAudioDragActive(false);
    };

    const handleAudioDrop = (e) => {
        e.preventDefault();
        setAudioDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleAudioFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleToggleAudioSelection = (index) => {
        setSelectedAudioFiles(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Video file upload functions
    const handleVideoFileChange = (file) => {
        if (!file) return;
        
        const fileUrl = URL.createObjectURL(file);
        const newVideoFile = {
            file,
            name: file.name,
            url: fileUrl,
            size: file.size,
            type: file.type,
            uploaded: false,
            timestamp: new Date().toISOString()
        };
        
        setVideoFiles(prev => [...prev, newVideoFile]);
        // Automatically select the new file
        setSelectedVideoFiles(prev => [...prev, videoFiles.length]);
        setVideoUploadMsg("");
    };

    const handleVideoDragOver = (e) => {
        e.preventDefault();
        setVideoDragActive(true);
    };

    const handleVideoDragLeave = () => {
        setVideoDragActive(false);
    };

    const handleVideoDrop = (e) => {
        e.preventDefault();
        setVideoDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleVideoFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleToggleVideoSelection = (index) => {
        setSelectedVideoFiles(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Transcript file upload functions
    const handleTranscriptFileChange = (file) => {
        if (!file) return;
        
        const newTranscriptFile = {
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: false,
            timestamp: new Date().toISOString()
        };
        
        setTranscriptFiles(prev => [...prev, newTranscriptFile]);
        // Automatically select the new file
        setSelectedTranscriptFiles(prev => [...prev, transcriptFiles.length]);
        setTranscriptUploadMsg("");
    };

    const handleTranscriptDragOver = (e) => {
        e.preventDefault();
        setTranscriptDragActive(true);
    };

    const handleTranscriptDragLeave = () => {
        setTranscriptDragActive(false);
    };

    const handleTranscriptDrop = (e) => {
        e.preventDefault();
        setTranscriptDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleTranscriptFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleToggleTranscriptSelection = (index) => {
        setSelectedTranscriptFiles(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Method selection handling
    const handleContinueToMethodSelection = () => {
        // Check if we came from navbar with a method pre-selected
        const urlParams = new URLSearchParams(location.search);
        const method = urlParams.get('method');
        
        if (method === 'recording') {
            setSelectedInputMethod('recording');
        } else if (method === 'upload') {
            setSelectedInputMethod('audio'); // Default to audio for upload
        } else {
            // Show modal only if no method was pre-selected from navbar
            setInputSelectionModalOpen(true);
        }
    };

    const handleSelectInputMethod = (method) => {
        setSelectedInputMethod(method);
        setInputSelectionModalOpen(false);
    };

    // Combined submit handler to replace old handleSubmit
    const handleSubmitMeeting = () => {
        // If meeting details are filled but no input method selected yet
        if (meetingDetailsFilled && !selectedInputMethod) {
            handleContinueToMethodSelection();
            return;
        }
        
        // If we have a selected input method, use the specific handler
        switch (selectedInputMethod) {
            case 'recording':
                handleSubmitRecordings();
                break;
            case 'audio':
                handleSubmitAudioFiles();
                break;
            case 'video':
                handleSubmitVideoFiles();
                break;
            case 'transcript':
                handleSubmitTranscriptFiles();
                break;
            default:
                // If no input method but meeting details are filled, prompt for selection
                if (meetingDetailsFilled) {
                    handleContinueToMethodSelection();
                } else {
                    alert("Please fill in all required meeting details and select an input method");
                }
        }
    };

    // Submit functions for each input method
    const handleSubmitRecordings = async () => {
        if (selectedRecordings.length === 0) {
            alert("Please select at least one recording to submit");
            return;
        }
        
        try {
            setPendingUploadLoading(true);
            
            // Create quarter first
            const quarterData = createQuarterData();
            console.log('Creating quarter with data:', quarterData);
            
            const quarterResponse = await createQuarter({ data: quarterData, token }).unwrap();
            console.log('Quarter created successfully:', quarterResponse);
            
            // Upload selected recordings
            for (const index of selectedRecordings) {
                const recording = recordedBlobs[index];
                if (!recording) continue;
                
                // Determine file extension based on MIME type
                let extension = '.webm';
                if (recording.mimeType) {
                    if (recording.mimeType.includes('mp4')) extension = '.m4a';
                    else if (recording.mimeType.includes('ogg')) extension = '.ogg';
                    else if (recording.mimeType.includes('wav')) extension = '.wav';
                }
                
                const fileName = `recording_${index + 1}${extension}`;
                
                // Create a File object with proper name and type
                const audioFile = new File([recording.blob], fileName, { 
                    type: recording.mimeType || 'audio/webm' 
                });
                
                console.log('Uploading audio with params:', {
                    fileName,
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants
                });
                
                await uploadAudio({ 
                    file: audioFile, 
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants,
                    token 
                }).unwrap();
            }
            
            setRecordingUploadSuccess(true);
            console.log('🎯 Recording upload successful, navigating to /rocks');
            console.log('🎯 Token still valid:', !!localStorage.getItem('token'));
            // Store quarter info for RocksPage
            localStorage.setItem('currentQuarterId', quarterResponse.id);
            localStorage.setItem('currentQuarterName', quarterResponse.quarter);
            localStorage.setItem('currentQuarterYear', quarterResponse.year);
            navigate('/rocks', { 
                state: { 
                    fromUpload: true,
                    quarterId: quarterResponse.id,
                    quarterName: quarterResponse.quarter,
                    quarterYear: quarterResponse.year
                }
            });
        } catch (error) {
            console.error("❌ Error uploading recordings:", error);
            console.log('🎯 Token after error:', !!localStorage.getItem('token'));
            // Better error handling
            const errorMessage = error?.data?.detail || error?.message || "Failed to upload recordings. Please try again.";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            setPendingUploadLoading(false);
        }
    };

    const handleSubmitAudioFiles = async () => {
        if (selectedAudioFiles.length === 0) {
            alert("Please select at least one audio file to submit");
            return;
        }
        
        try {
            setPendingUploadLoading(true);
            
            // Create quarter first
            const quarterData = createQuarterData();
            console.log('Creating quarter with data:', quarterData);
            
            const quarterResponse = await createQuarter({ data: quarterData, token }).unwrap();
            console.log('Quarter created successfully:', quarterResponse);
            
            // Upload selected audio files
            for (const index of selectedAudioFiles) {
                const audioFile = audioFiles[index];
                if (!audioFile) continue;
                
                console.log('Uploading audio with params:', {
                    fileName: audioFile.name,
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants
                });
                
                await uploadAudio({ 
                    file: audioFile.file, 
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants,
                    token 
                }).unwrap();
                
                // Mark as uploaded
                setAudioFiles(prev => prev.map((file, i) => 
                    i === index ? { ...file, uploaded: true } : file
                ));
            }
            
            setAudioUploadSuccess(true);
            console.log('🎯 Audio upload successful, navigating to /rocks');
            console.log('🎯 Token still valid:', !!localStorage.getItem('token'));
            // Store quarter info for RocksPage
            localStorage.setItem('currentQuarterId', quarterResponse.id);
            localStorage.setItem('currentQuarterName', quarterResponse.quarter);
            localStorage.setItem('currentQuarterYear', quarterResponse.year);
            navigate('/rocks', { 
                state: { 
                    fromUpload: true,
                    quarterId: quarterResponse.id,
                    quarterName: quarterResponse.quarter,
                    quarterYear: quarterResponse.year
                }
            });
        } catch (error) {
            console.error("❌ Error uploading audio files:", error);
            console.log('🎯 Token after error:', !!localStorage.getItem('token'));
            // Better error handling
            const errorMessage = error?.data?.detail || error?.message || "Failed to upload audio files. Please try again.";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            setPendingUploadLoading(false);
        }
    };

    const handleSubmitVideoFiles = async () => {
        if (selectedVideoFiles.length === 0) {
            alert("Please select at least one video file to submit");
            return;
        }
        
        try {
            setPendingUploadLoading(true);
            
            // Create quarter first
            const quarterData = createQuarterData();
            console.log('Creating quarter with data:', quarterData);
            
            const quarterResponse = await createQuarter({ data: quarterData, token }).unwrap();
            console.log('Quarter created successfully:', quarterResponse);
            
            // Upload selected video files
            for (const index of selectedVideoFiles) {
                const videoFile = videoFiles[index];
                if (!videoFile) continue;
                
                console.log('Uploading video with params:', {
                    fileName: videoFile.name,
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants
                });
                
                await uploadAudio({ 
                    file: videoFile.file, 
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants,
                    token 
                }).unwrap();
                
                // Mark as uploaded
                setVideoFiles(prev => prev.map((file, i) => 
                    i === index ? { ...file, uploaded: true } : file
                ));
            }
            
            setVideoUploadSuccess(true);
            console.log('🎯 Video upload successful, navigating to /rocks');
            console.log('🎯 Token still valid:', !!localStorage.getItem('token'));
            // Store quarter info for RocksPage
            localStorage.setItem('currentQuarterId', quarterResponse.id);
            localStorage.setItem('currentQuarterName', quarterResponse.quarter);
            localStorage.setItem('currentQuarterYear', quarterResponse.year);
            navigate('/rocks', { 
                state: { 
                    fromUpload: true,
                    quarterId: quarterResponse.id,
                    quarterName: quarterResponse.quarter,
                    quarterYear: quarterResponse.year
                }
            });
        } catch (error) {
            console.error("❌ Error uploading video files:", error);
            console.log('🎯 Token after error:', !!localStorage.getItem('token'));
            // Better error handling
            const errorMessage = error?.data?.detail || error?.message || "Failed to upload video files. Please try again.";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            setPendingUploadLoading(false);
        }
    };

    const handleSubmitTranscriptFiles = async () => {
        if (selectedTranscriptFiles.length === 0) {
            alert("Please select at least one transcript file to submit");
            return;
        }
        
        try {
            setPendingUploadLoading(true);
            
            // Create quarter first
            const quarterData = createQuarterData();
            console.log('Creating quarter with data:', quarterData);
            
            const quarterResponse = await createQuarter({ data: quarterData, token }).unwrap();
            console.log('Quarter created successfully:', quarterResponse);
            
            // Upload selected transcript files
            for (const index of selectedTranscriptFiles) {
                const transcriptFile = transcriptFiles[index];
                if (!transcriptFile) continue;
                
                console.log('Uploading transcript with params:', {
                    fileName: transcriptFile.name,
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants
                });
                
                await uploadTranscript({ 
                    file: transcriptFile.file, 
                    quarter_id: quarterResponse.id,
                    quarterWeeks: quarterResponse.weeks,
                    participants: quarterResponse.participants,
                    token 
                }).unwrap();
                
                // Mark as uploaded
                setTranscriptFiles(prev => prev.map((file, i) => 
                    i === index ? { ...file, uploaded: true } : file
                ));
            }
            
            setTranscriptUploadSuccess(true);
            console.log('🎯 Transcript upload successful, navigating to /rocks');
            console.log('🎯 Token still valid:', !!localStorage.getItem('token'));
            // Store quarter info for RocksPage
            localStorage.setItem('currentQuarterId', quarterResponse.id);
            localStorage.setItem('currentQuarterName', quarterResponse.quarter);
            localStorage.setItem('currentQuarterYear', quarterResponse.year);
            navigate('/rocks', { 
                state: { 
                    fromUpload: true,
                    quarterId: quarterResponse.id,
                    quarterName: quarterResponse.quarter,
                    quarterYear: quarterResponse.year
                }
            });
        } catch (error) {
            console.error("❌ Error uploading transcript files:", error);
            console.log('🎯 Token after error:', !!localStorage.getItem('token'));
            // Better error handling
            const errorMessage = error?.data?.detail || error?.message || "Failed to upload transcript files. Please try again.";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            setPendingUploadLoading(false);
        }
    };


    // Debug: Log rocks and tasks when data is fetched
    React.useEffect(() => {
        if (rocksTasksData) {
            // Log the full response
            console.log('Quarter with rocks and tasks:', rocksTasksData);
            if (Array.isArray(rocksTasksData.rocks)) {
                rocksTasksData.rocks.forEach((rock, i) => {
                    console.log(`Rock #${i + 1}:`, rock);
                    if (Array.isArray(rock.tasks)) {
                        rock.tasks.forEach((task, j) => {
                            console.log(`  Task #${j + 1}:`, task);
                        });
                    }
                });
            }
        }
    }, [rocksTasksData]);

    // Helper to fetch rocks and tasks for a quarter
    const fetchQuarterRocksTasks = async (quarter_id, token) => {
        // Use the RTK Query endpoint directly
        // We use the fetchBaseQuery directly for imperative fetch
        const response = await fetch(`http://localhost:8000/quarters/${quarter_id}/all`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Failed to fetch rocks and tasks');
        return await response.json();
    };

    // Helper function to create quarter data with correct field mapping
    const createQuarterData = () => {
        const quarterName = quarter === '__custom__' ? customQuarter : quarter;
        return {
            quarter: quarterName,
            year: parseInt(quarterYear),
            weeks: quarterWeeks,
            title: meetingTitle,
            description: meetingDescription || "",
            participants: getSelectedEmployeeUUIDs(selectedEmployees, users)
        };
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        clearInterval(intervalId);
        setIntervalId(null);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setShowRecordingConfirm(true); // Show confirm modal after stopping
    };

    const handleRecordingConfirmClose = () => {
        setShowRecordingConfirm(false);
        setShowPostRecordingActions(true); // Show confirm/restart in card
    };

    // Reset all states after successful upload
    const resetAll = () => {
        // Reset upload states
        setAudioFiles([]);
        setSelectedAudioFiles([]);
        setVideoFiles([]);
        setSelectedVideoFiles([]);
        setRecordedBlobs([]);
        setSelectedRecordings([]);
        setTranscriptFiles([]);
        setSelectedTranscriptFiles([]);
        setAudioUploadMsg("");
        setVideoUploadMsg("");
        setTranscriptUploadMsg("");
        setAudioUploadSuccess(false);
        setVideoUploadSuccess(false);
        setRecordingUploadSuccess(false);
        setTranscriptUploadSuccess(false);
        // Reset recording states
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        // Reset input method
        setSelectedInputMethod(null);
        setInputSelectionModalOpen(false);
        // Reset form fields
        setMeetingTitle("");
        setMeetingDescription("");
        setQuarter("");
        setCustomQuarter("");
        setQuarterYear("");
        setQuarterWeeks(12);
        setSelectedEmployees([]);
        setMeetingType(""); // Reset meeting type
    };

    // Handler for background click
    const handleBackgroundClick = (e) => {
        // This handler could be used for other background click actions in the future
    };

    // Render helper function
    const renderSelectedInputMethod = () => {
        const urlParams = new URLSearchParams(location.search);
        const method = urlParams.get('method');
        
        // If coming from navbar with 'upload' method, show both audio and transcript options
        if (method === 'upload') {
            return (
                <div className="w-full max-w-6xl mx-auto">
                    <div className="mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setSelectedInputMethod('audio')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedInputMethod === 'audio'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:text-indigo-600'
                                    }`}
                                >
                                    Audio Files
                                </button>
                                <button
                                    onClick={() => setSelectedInputMethod('video')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedInputMethod === 'video'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:text-indigo-600'
                                    }`}
                                >
                                    Video Files
                                </button>
                                <button
                                    onClick={() => setSelectedInputMethod('transcript')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedInputMethod === 'transcript'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:text-indigo-600'
                                    }`}
                                >
                                    Transcript Files
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {selectedInputMethod === 'audio' && (
                        <div>
                            <AudioUploadCard 
                                audioFiles={audioFiles}
                                selectedAudioFiles={selectedAudioFiles}
                                audioUploadSuccess={audioUploadSuccess}
                                audioDragActive={audioDragActive}
                                onFileChange={handleAudioFileChange}
                                onDragOver={handleAudioDragOver}
                                onDragLeave={handleAudioDragLeave}
                                onDrop={handleAudioDrop}
                                onToggleAudioSelection={handleToggleAudioSelection}
                                onRemove={handleRemoveAudioFile}
                            />
                            
                            {/* Submit button for audio files */}
                            {audioFiles.length > 0 && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                            selectedAudioFiles.length > 0 && !pendingUploadLoading
                                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                        onClick={handleSubmitAudioFiles}
                                        disabled={selectedAudioFiles.length === 0 || pendingUploadLoading}
                                    >
                                        {pendingUploadLoading ? 'Processing...' : 'Submit Selected Audio Files'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {selectedInputMethod === 'video' && (
                        <div>
                            <VideoUploadCard 
                                videoFiles={videoFiles}
                                selectedVideoFiles={selectedVideoFiles}
                                videoUploadSuccess={videoUploadSuccess}
                                videoDragActive={videoDragActive}
                                onFileChange={handleVideoFileChange}
                                onDragOver={handleVideoDragOver}
                                onDragLeave={handleVideoDragLeave}
                                onDrop={handleVideoDrop}
                                onToggleVideoSelection={handleToggleVideoSelection}
                                onRemove={handleRemoveVideoFile}
                            />
                            
                            {/* Submit button for video files */}
                            {videoFiles.length > 0 && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                            selectedVideoFiles.length > 0 && !pendingUploadLoading
                                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                        onClick={handleSubmitVideoFiles}
                                        disabled={selectedVideoFiles.length === 0 || pendingUploadLoading}
                                    >
                                        {pendingUploadLoading ? 'Processing...' : 'Submit Selected Video Files'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {selectedInputMethod === 'transcript' && (
                        <div>
                            <TranscriptUploadCard 
                                transcriptFiles={transcriptFiles}
                                selectedTranscriptFiles={selectedTranscriptFiles}
                                transcriptDragActive={transcriptDragActive}
                                transcriptUploadMsg={transcriptUploadMsg}
                                onFileChange={handleTranscriptFileChange}
                                onDragOver={handleTranscriptDragOver}
                                onDragLeave={handleTranscriptDragLeave}
                                onDrop={handleTranscriptDrop}
                                onToggleTranscriptSelection={handleToggleTranscriptSelection}
                                onRemove={handleRemoveTranscriptFile}
                            />
                            
                            {/* Submit button for transcript files */}
                            {transcriptFiles.length > 0 && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                            selectedTranscriptFiles.length > 0 && !pendingUploadLoading
                                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                        onClick={handleSubmitTranscriptFiles}
                                        disabled={selectedTranscriptFiles.length === 0 || pendingUploadLoading}
                                    >
                                        {pendingUploadLoading ? 'Processing...' : 'Submit Selected Transcript Files'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        
        // Original switch case for other methods
        switch (selectedInputMethod) {
            case 'recording':
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <AudioRecordingCard 
                            isRecording={isRecording}
                            isPaused={isPaused}
                            recordingTime={recordingTime}
                            recordedBlobs={recordedBlobs}
                            selectedRecordings={selectedRecordings}
                            recordingUploadSuccess={recordingUploadSuccess}
                            showPostRecordingActions={showPostRecordingActions}
                            onStartRecording={handleStartRecording}
                            onStopRecording={handleStopRecording}
                            onPauseResumeRecording={handlePauseResumeRecording}
                            onEndRecording={handleEndRecording}
                            onConfirmRecording={handleConfirmRecording}
                            onRestartRecording={handleRestartRecording}
                            onToggleRecordingSelection={handleToggleRecordingSelection}
                            formatTime={formatTime}
                            onRemoveRecording={handleRemoveRecording}
                            showNameModal={showNameModal}
                            recordingName={recordingName}
                            onRecordingNameChange={setRecordingName}
                            onSaveRecordingName={handleSaveRecordingName}
                            onCancelRecordingName={handleCancelRecordingName}
                        />
                        
                        {/* Submit button for recordings */}
                        {/* {recordedBlobs.length > 0 && !isRecording && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                        selectedRecordings.length > 0 && !pendingUploadLoading
                                            ? 'bg-indigo-600 hover:bg-indigo-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={handleSubmitRecordings}
                                    disabled={selectedRecordings.length === 0 || pendingUploadLoading}
                                >
                                    {pendingUploadLoading ? 'Processing...' : 'Submit Selected Recordings'}
                                </button>
                            </div>
                        )} */}
                    </div>
                );
            
            case 'audio':
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <AudioUploadCard 
                            audioFiles={audioFiles}
                            selectedAudioFiles={selectedAudioFiles}
                            audioUploadSuccess={audioUploadSuccess}
                            audioDragActive={audioDragActive}
                            onFileChange={handleAudioFileChange}
                            onDragOver={handleAudioDragOver}
                            onDragLeave={handleAudioDragLeave}
                            onDrop={handleAudioDrop}
                            onToggleAudioSelection={handleToggleAudioSelection}
                            onRemove={handleRemoveAudioFile}
                        />
                        
                        {/* Submit button for audio files */}
                        {audioFiles.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                        selectedAudioFiles.length > 0 && !pendingUploadLoading
                                            ? 'bg-indigo-600 hover:bg-indigo-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={handleSubmitAudioFiles}
                                    disabled={selectedAudioFiles.length === 0 || pendingUploadLoading}
                                >
                                    {pendingUploadLoading ? 'Processing...' : 'Submit Selected Audio Files'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            
            case 'video':
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <VideoUploadCard 
                            videoFiles={videoFiles}
                            selectedVideoFiles={selectedVideoFiles}
                            videoUploadSuccess={videoUploadSuccess}
                            videoDragActive={videoDragActive}
                            onFileChange={handleVideoFileChange}
                            onDragOver={handleVideoDragOver}
                            onDragLeave={handleVideoDragLeave}
                            onDrop={handleVideoDrop}
                            onToggleVideoSelection={handleToggleVideoSelection}
                            onRemove={handleRemoveVideoFile}
                        />
                        
                        {/* Submit button for video files */}
                        {videoFiles.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                        selectedVideoFiles.length > 0 && !pendingUploadLoading
                                            ? 'bg-indigo-600 hover:bg-indigo-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={handleSubmitVideoFiles}
                                    disabled={selectedVideoFiles.length === 0 || pendingUploadLoading}
                                >
                                    {pendingUploadLoading ? 'Processing...' : 'Submit Selected Video Files'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            
            case 'transcript':
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <TranscriptUploadCard 
                            transcriptFiles={transcriptFiles}
                            selectedTranscriptFiles={selectedTranscriptFiles}
                            transcriptDragActive={transcriptDragActive}
                            transcriptUploadMsg={transcriptUploadMsg}
                            onFileChange={handleTranscriptFileChange}
                            onDragOver={handleTranscriptDragOver}
                            onDragLeave={handleTranscriptDragLeave}
                            onDrop={handleTranscriptDrop}
                            onToggleTranscriptSelection={handleToggleTranscriptSelection}
                            onRemove={handleRemoveTranscriptFile}
                        />
                        
                        {/* Submit button for transcript files */}
                        {transcriptFiles.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    className={`px-8 py-3 rounded-lg font-semibold text-white ${
                                        selectedTranscriptFiles.length > 0 && !pendingUploadLoading
                                            ? 'bg-indigo-600 hover:bg-indigo-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={handleSubmitTranscriptFiles}
                                    disabled={selectedTranscriptFiles.length === 0 || pendingUploadLoading}
                                >
                                    {pendingUploadLoading ? 'Processing...' : 'Submit Selected Transcript Files'}
                                </button>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 mt-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 p">Meeting Details</h1>
                    <p className="text-gray-600 mt-0.5 text-sm">
Configure your meeting settings and select attendees</p>
                </div>
            </div>



            <div
                className="w-full px-4 py-4 flex flex-col gap-4 main-content-background bg-white rounded-xl shadow-lg border border-indigo-100 overflow-y-auto"
                style={{ flex: 1, minHeight: 0, maxHeight: '100%' }}
                onClick={handleBackgroundClick}
            >
                {/* Meeting Details Form */}
                <MeetingDetailsForm
                    meetingType={meetingType}
                    setMeetingType={setMeetingType}
                    meetingTitle={meetingTitle}
                    setMeetingTitle={setMeetingTitle}
                    meetingDescription={meetingDescription}
                    setMeetingDescription={setMeetingDescription}
                    quarter={quarter}
                    setQuarter={setQuarter}
                    customQuarter={customQuarter}
                    setCustomQuarter={setCustomQuarter}
                    quarterYear={quarterYear}
                    setQuarterYear={setQuarterYear}
                    quarterWeeks={quarterWeeks}
                    setQuarterWeeks={setQuarterWeeks}
                    selectedEmployees={selectedEmployees}
                    setSelectedEmployees={setSelectedEmployees}
                />

                {/* Only show the selected input method UI after selection */}
                {selectedInputMethod && (
                    <div className="w-full">
                        {/* <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-700 font-medium text-sm">                        Selected Method: {
                            selectedInputMethod === 'recording' ? 'Record Audio' :
                            selectedInputMethod === 'audio' ? 'Upload Audio Files' :
                            selectedInputMethod === 'video' ? 'Upload Video Files' :
                            'Upload Transcript Files'
                        }
                                    </span>
                                </div>
                                <button
                                    className="text-indigo-600 hover:text-indigo-800 text-xs underline"
                                    onClick={() => setInputSelectionModalOpen(true)}
                                >
                                    Change Method
                                </button>
                            </div>
                        </div> */}
                        
                        {/* Render the selected input method */}
                        {renderSelectedInputMethod()}
                    </div>
                )}

                {/* Submit Button */}
                {/* <div className="flex justify-end mt-4">
                    <button
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmitMeeting}
                        disabled={
                            pendingUploadLoading ||
                            !meetingTitle ||
                            !(quarter === '__custom__' ? customQuarter : quarter) ||
                            !quarterYear ||
                            selectedEmployees.length === 0 ||
                            (
                                (!selectedInputMethod) ? false : 
                                (selectedInputMethod === 'recording' && selectedRecordings.length === 0) ||
                                (selectedInputMethod === 'audio' && selectedAudioFiles.length === 0) ||
                                (selectedInputMethod === 'video' && selectedVideoFiles.length === 0) ||
                                (selectedInputMethod === 'transcript' && selectedTranscriptFiles.length === 0)
                            )
                        }
                    >
                        {pendingUploadLoading || isFetchingRocksTasks ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {isFetchingRocksTasks ? "Analyzing meeting data..." : "Processing..."}
                            </div>
                        ) : meetingDetailsFilled && !selectedInputMethod ? "Continue" : "Submit"}
                    </button>
                </div> */}

                {/* Error/Success Messages */}
                {audioUploadMsg && (
                    <div className={`text-center p-3 rounded-lg text-sm ${audioUploadSuccess || recordingUploadSuccess || transcriptUploadSuccess
                            ? 'text-green-700 bg-green-50 border border-green-200'
                            : 'text-red-700 bg-red-50 border border-red-200'
                        }`}>
                        {audioUploadMsg}
                    </div>
                )}

                {/* CSV Upload Modal */}
                <CsvUploadModal
                    open={csvUploadOpen}
                    onClose={() => setCsvUploadOpen(false)}
                />

                {/* Enhanced styles for animations, responsive design, and card disabled hover */}
                <style>{`
                    @media (max-width: 640px) {
                        .min-h-[140px] { min-height: 90px !important; }
                    }
                    @keyframes wave0 { 0%,100%{height:8px;} 50%{height:32px;} }
                    @keyframes wave1 { 0%,100%{height:12px;} 50%{height:28px;} }
                    @keyframes wave2 { 0%,100%{height:16px;} 50%{height:24px;} }
                    @keyframes wave3 { 0%,100%{height:20px;} 50%{height:20px;} }
                    .animate-wave0 { animation: wave0 1s infinite; }
                    .animate-wave1 { animation: wave1 1s infinite; }
                    .animate-wave2 { animation: wave2 1s infinite; }
                    .animate-wave3 { animation: wave3 1s infinite; }
                `}</style>
            </div>

            {/* Professional Loader */}
            <Loader
                isVisible={pendingUploadLoading || isFetchingRocksTasks}
                message={
                    isFetchingRocksTasks
                        ? "Analyzing meeting data..."
                        : "Processing quarter and audio..."
                }
                progress={loaderProgress}
            />

            {/* Input Selection Modal */}
            <InputSelectionModal
                isOpen={inputSelectionModalOpen}
                onClose={() => setInputSelectionModalOpen(false)}
                onSelectOption={handleSelectInputMethod}
            />
            
            {/* Recording Confirmation Modal */}
            {/* <RecordingConfirmationModal
                showRecordingConfirm={showRecordingConfirm}
                onClose={() => setShowRecordingConfirm(false)}
                onConfirm={handleConfirmRecording}
                onRestart={handleRestartRecording}
            /> */}
            
            {/* CSV Upload Modal */}
            <CsvUploadModal
                open={csvUploadOpen}
                onClose={() => setCsvUploadOpen(false)}
            />
            
            {/* Loader with progress bar for pending uploads */}
            {/* {loaderProgress !== null && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl max-w-sm w-full">
                        <div className="text-base font-semibold mb-3">Processing your meeting data...</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${loaderProgress}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1.5 text-right">{Math.round(loaderProgress)}%</div>
                    </div>
                </div>
            )} */}
        </Layout>
    );
}

export default EmployeeDataUpload;