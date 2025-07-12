import React from "react";
import { Home, Calendar, UploadCloud, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Get role from localStorage
    const role = localStorage.getItem('role');
    return (
        <aside className="w-48 bg-white border-r-0 pt-6 min-h-[calc(100vh-48px)] fixed left-0 top-12 h-[calc(100vh-48px)] flex flex-col z-2 shadow-md">
            <div className="flex flex-col gap-1 mt-0 flex-1">
                {/* Show Dashboard only for non-employee roles */}
                {role !== 'employee' && (
                    <div
                        className={`flex items-start gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer transition font-normal ${location.pathname === "/admin/meeting-summary" ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-700 hover:bg-indigo-50"}`}
                        onClick={() => navigate("/admin/meeting-summary")}
                    >
                        <Home size={18} />
                        <span>Dashboard</span>
                    </div>
                )}
                {/* Only show Current Meeting Analysis for employee */}
                {role === 'employee' && (
                    <div
                        className={`flex items-start gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer transition font-normal ${location.pathname.includes('current-meeting-analysis') ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-50'}`}
                        onClick={() => navigate('/current-meeting-analysis')}
                    >
                        <Home size={18} />
                        <span>Dashboard</span>
                    </div>
                )}
                {/* Only show Upload CSV & Recording for admin */}
                {/* Removed "New Meeting" button from Sidebar */}
                <div className="flex items-start gap-2 px-4 py-2 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-indigo-50 transition font-normal">
                    <Settings size={18} />
                    <span>Settings</span>
                </div>
            </div>
            <div className="mt-auto mb-4 px-4">
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 transition font-medium justify-start text-sm"
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('role');
                        // No longer need to clear currentQuarterId, currentQuarterName, currentQuarterYear
                        navigate('/login');
                    }}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
