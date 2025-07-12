import React, { useState, useEffect } from "react";
import { BarChart2, Bell, Rocket, Plus, Settings, FileText, ChevronDown, Mic, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import OrganisationDetailsModal from "./OrganisationDetailsModal";
import ViewDrafts from "../pages/ViewDrafts.jsx";
import { useGetCurrentUserQuery } from "../services/api";

const Navbar = () => {
    const navigate = useNavigate();
    const [orgModalOpen, setOrgModalOpen] = useState(false);
    const [viewDraftsOpen, setViewDraftsOpen] = useState(false);
    const [newMeetingDropdownOpen, setNewMeetingDropdownOpen] = useState(false);

    // Get role and token from localStorage
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    // Fetch current user data
    const { data: currentUser, isLoading } = useGetCurrentUserQuery({ token });
    console.log('Current user API response:', currentUser);

    // Handle new meeting option selection
    const handleNewMeetingOption = (option) => {
        setNewMeetingDropdownOpen(false);
        if (option === 'instant') {
            navigate('/employee-data-upload?method=recording');
        } else if (option === 'upload') {
            navigate('/employee-data-upload?method=upload');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (newMeetingDropdownOpen && !event.target.closest('.new-meeting-dropdown')) {
                setNewMeetingDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [newMeetingDropdownOpen]);
    
    return (
        <header className="fixed top-0 left-0 w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-20">
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 rounded-lg p-1.5 shadow-md">
                    {/* Space-themed logo: Rocket icon */}
                    <Rocket size={24} className="text-white drop-shadow-lg" />
                </div>
                <span className="font-bold text-xl tracking-wide text-gray-800">Commetrix</span>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
                {/* Only show Manage Organisation and View Drafts for admin */}
                {role === 'admin' && (
                    <>
                        <button
                            onClick={() => setViewDraftsOpen(true)}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md font-medium text-xs hover:bg-gray-200 transition-all duration-200 group cursor-pointer"
                        >
                            <FileText size={16} />
                            View Drafts
                        </button>
                        
                        <div className="relative new-meeting-dropdown">
                            <button
                                onClick={() => setNewMeetingDropdownOpen(!newMeetingDropdownOpen)}
                                className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-md font-medium text-xs hover:bg-indigo-700 transition-all duration-200 transform cursor-pointer"
                            >
                                <Plus size={16} />
                                New Meeting
                                <ChevronDown size={14} className={`transition-transform duration-200 ${newMeetingDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {newMeetingDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[180px] text-left">
                                    <button
                                        onClick={() => handleNewMeetingOption('instant')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 text-left"
                                    >
                                        <Mic size={16} />
                                        Start Instant Meeting
                                    </button>
                                    <button
                                        onClick={() => handleNewMeetingOption('upload')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 text-left"
                                    >
                                        <Upload size={16} />
                                        Upload Audio/Transcript
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={() => navigate('/organisation-details')}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-600 rounded-md font-medium text-xs hover:bg-indigo-200 transition-all duration-200 cursor-pointer"
                        >
                            <Settings size={16} />
                            Manage Org
                        </button>

                        {viewDraftsOpen && <ViewDrafts onClose={() => setViewDraftsOpen(false)} />}
                    </>
                )}
                
                {/* Notification bell with subtle animation */}
                <div className="relative">
                    <Bell 
                        size={18} 
                        className="text-gray-400 hover:text-indigo-500 cursor-pointer transition-all duration-200 hover:scale-110" 
                    />
                    {/* Optional: Add notification dot */}
                    {/* <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div> */}
                </div>

                {/* User profile section */}
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                    <div className="flex items-center gap-2 p-1 transition-colors duration-200 cursor-pointer">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-semibold text-xs uppercase shadow-md">
                            {isLoading ? '...' : (() => {
                                if (!currentUser?.employee_name) return 'U';
                                const nameParts = currentUser.employee_name.split(' ');
                                if (nameParts.length >= 2) {
                                    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
                                } else {
                                    return currentUser.employee_name.substring(0, 2).toUpperCase();
                                }
                            })()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-800 font-medium text-xs leading-tight">
                                {isLoading ? 'Loading...' : currentUser?.employee_name || 'User'}
                            </span>
                            <span className="text-gray-500 text-xs capitalize">{role}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;