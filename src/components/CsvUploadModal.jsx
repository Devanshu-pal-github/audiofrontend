import React, { useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { UploadCloud, X } from "lucide-react";
import { useUploadCsvMutation } from "../services/api";

const CsvUploadModal = ({ open, onClose, onCsvFileSelected }) => {
    const [csvFile, setCsvFile] = useState(null);
    const [uploadCsv, { isLoading: isCsvUploading }] = useUploadCsvMutation();
    const [csvUploadMsg, setCsvUploadMsg] = useState("");
    const token = localStorage.getItem('token');
    const fileInputRef = useRef();

    // Handle file upload and immediately send to backend
    const [csvResponse, setCsvResponse] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCsvFile(file);
        setCsvUploadMsg("");
        setCsvResponse(null);
        if (file) {
            uploadCsv({ file, token })
                .unwrap()
                .then(res => {
                    setCsvUploadMsg(res.message || "CSV uploaded successfully.");
                    setCsvResponse(res);
                })
                .catch(err => setCsvUploadMsg(err?.data?.detail || "CSV upload failed."));
            // Do NOT call onCsvFileSelected here; wait for submit
        }
    };

    // Drag and drop
    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setCsvFile(file);
            setCsvUploadMsg("");
            setCsvResponse(null);
            uploadCsv({ file, token })
                .unwrap()
                .then(res => {
                    setCsvUploadMsg(res.message || "CSV uploaded successfully.");
                    setCsvResponse(res);
                })
                .catch(err => setCsvUploadMsg(err?.data?.detail || "CSV upload failed."));
            // Do NOT call onCsvFileSelected here; wait for submit
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleClose = () => {
        setCsvFile(null);
        setCsvUploadMsg("");
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '8px',
                    minHeight: '240px',
                    maxWidth: '400px'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1f2937',
                padding: '16px 20px'
            }}>
                Upload Organisation Structure
                <Button
                    onClick={handleClose}
                    sx={{ 
                        minWidth: 'auto', 
                        padding: '4px',
                        color: '#6b7280',
                        '&:hover': {
                            backgroundColor: '#f3f4f6'
                        }
                    }}
                >
                    <X size={18} />
                </Button>
            </DialogTitle>
            <DialogContent sx={{ padding: '12px 20px' }}>
                <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg min-h-[140px] py-4 px-4 cursor-pointer transition hover:border-indigo-300 bg-gray-50"
                    onClick={() => fileInputRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <UploadCloud size={28} className="text-indigo-400 mb-2" />
                    <div className="text-gray-500 mb-1 text-sm">Drag & drop CSV file here</div>
                    <div className="text-gray-400 text-xs mb-2">or</div>
                    <button
                        type="button"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-3 py-1.5 rounded-md transition text-sm"
                        disabled={isCsvUploading}
                    >
                        {isCsvUploading ? 'Uploading...' : 'Upload CSV'}
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {csvFile && (
                        <div className="mt-3 text-xs text-gray-700">Selected: {csvFile.name}</div>
                    )}
                    {csvUploadMsg && (
                        <div className={`mt-2 text-xs text-center ${csvUploadMsg.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
                            {csvUploadMsg}
                        </div>
                    )}
                </div>
            </DialogContent>
            <DialogActions sx={{ padding: '12px 20px' }}>
                <Button 
                    onClick={handleClose}
                    sx={{ 
                        color: '#6b7280',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                    }}
                >
                    Close
                </Button>
                <Button
                    onClick={() => {
                        if (csvResponse && onCsvFileSelected) onCsvFileSelected(csvResponse);
                        handleClose();
                    }}
                    disabled={!csvResponse}
                    variant="contained"
                    sx={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        ml: 2,
                        '&:hover': { backgroundColor: '#1e40af' },
                    }}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CsvUploadModal;