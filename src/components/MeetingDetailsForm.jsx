import React, { useState } from "react";
import EmployeeSelectionTable from "./EmployeeSelectionTable";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import { toast } from 'react-toastify';

const MeetingDetailsForm = ({
    meetingType,
    setMeetingType,
    meetingTitle,
    setMeetingTitle,
    meetingDescription,
    setMeetingDescription,
    quarter,
    setQuarter,
    customQuarter,
    setCustomQuarter,
    quarterYear,
    setQuarterYear,
    quarterWeeks,
    setQuarterWeeks,
    selectedEmployees,
    setSelectedEmployees
}) => {
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [scheduledDateTime, setScheduledDateTime] = useState(null);

    // Validation: all required fields except meetingType
    const isScheduleEnabled = meetingTitle && quarter && quarterYear && quarterWeeks && selectedEmployees && selectedEmployees.length > 0;

    const handleScheduleConfirm = ({ date, time }) => {
        setScheduledDateTime({ date, time });
        setScheduleModalOpen(false);
        toast.success(`Meeting scheduled for ${date} at ${time}`);
    };

    return (
        <div className="bg-white rounded-xl p-2 space-y-6">
            {/* Header */}
            {/* <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Meeting Details</h2>
                <p className="text-sm text-gray-500">Configure your meeting settings and select attendees</p>
            </div> */}

            {/* Meeting Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Meeting Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Meeting Type</label>
                        <select
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200"
                            value={meetingType || ''}
                            onChange={e => setMeetingType(e.target.value)}
                        >
                            <option value="">Select meeting type</option>
                            <option value="quarterly">Quarterly Meeting</option>
                            <option value="annual">Annual Meeting</option>
                            <option value="weekly">Weekly Meeting</option>
                        </select>
                    </div>

                    {/* Meeting Title */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Meeting Title</label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200"
                            placeholder="Enter meeting title"
                            value={meetingTitle}
                            onChange={e => setMeetingTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* Meeting Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Meeting Description</label>
                    <textarea
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200 resize-none"
                        placeholder="Describe the meeting agenda, objectives, and key discussion points..."
                        value={meetingDescription}
                        onChange={e => setMeetingDescription(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            {/* Quarter Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Quarter Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Quarter Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Quarter</label>
                        {quarter === '__custom__' ? (
                            <input
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200"
                                placeholder="Enter custom quarter name"
                                value={customQuarter}
                                autoFocus
                                onChange={e => setCustomQuarter(e.target.value)}
                                onBlur={e => { if (!customQuarter) setQuarter(""); }}
                            />
                        ) : (
                            <select
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200"
                                value={['Q1','Q2','Q3','Q4'].includes(quarter) ? quarter : ''}
                                onChange={e => {
                                    if (e.target.value === '__custom__') {
                                        setQuarter('__custom__');
                                        setCustomQuarter("");
                                    } else {
                                        setQuarter(e.target.value);
                                        setCustomQuarter("");
                                    }
                                }}
                            >
                                <option value="">Select Quarter</option>
                                <option value="Q1">Q1 (Jan - Mar)</option>
                                <option value="Q2">Q2 (Apr - Jun)</option>
                                <option value="Q3">Q3 (Jul - Sep)</option>
                                <option value="Q4">Q4 (Oct - Dec)</option>
                                <option value="__custom__">✏️ Custom Quarter</option>
                            </select>
                        )}
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Year</label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200"
                            placeholder="2025"
                            value={quarterYear}
                            onChange={e => setQuarterYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                            maxLength={4}
                        />
                    </div>

                    {/* Quarter Weeks */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Duration (Weeks)</label>
                        <select
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200"
                            value={quarterWeeks}
                            onChange={e => setQuarterWeeks(Number(e.target.value))}
                        >
                            <option value="" disabled>Select weeks</option>
                            {[...Array(13).keys()].reverse().map(week => (
                                <option key={week} value={week}>
                                    {week === 12
                                        ? '12 weeks (Standard Quarter)'
                                        : `${week} weeks`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Employee Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        Select Attendees
                    </h3>
                    {selectedEmployees && selectedEmployees.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedEmployees.length} selected
                        </span>
                    )}
                </div>
                
                <div className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                    <div 
                        className="bg-white"
                        style={{
                            maxHeight: '350px',
                            overflowY: 'auto',
                        }}
                    >
                        <EmployeeSelectionTable
                            selectedEmployees={selectedEmployees}
                            onSelectionChange={setSelectedEmployees}
                            minimal
                        />
                    </div>
                </div>
            </div>

            {/* Schedule Meeting Modal */}
            <ScheduleMeetingModal
                open={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                onConfirm={handleScheduleConfirm}
            />
        </div>
    );
}

export default MeetingDetailsForm;