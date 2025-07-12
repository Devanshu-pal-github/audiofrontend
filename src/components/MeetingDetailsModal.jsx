import React, { useState } from "react";
import EmployeeSelectionTable from "./EmployeeSelectionTable";



const MeetingDetailsModal = ({
    open,
    onClose,
    onSubmit,
    defaultSelectedEmployees = [],
    loading = false
}) => {
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingDescription, setMeetingDescription] = useState("");
    const [quarter, setQuarter] = useState("");
    const [customQuarter, setCustomQuarter] = useState("");
    const [quarterYear, setQuarterYear] = useState("");
    const [quarterWeeks, setQuarterWeeks] = useState(12);
    const [selectedEmployees, setSelectedEmployees] = useState(defaultSelectedEmployees);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl min-h-[600px] relative flex flex-col gap-6 border border-gray-200" style={{ borderColor: '#e5e7eb' }} onClick={e => e.stopPropagation()}>
                <button className="absolute top-3 right-5 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-bold text-black mb-2">Meeting Details</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <input
                        className="border border-gray-300 rounded-md px-4 py-3 w-full md:w-1/4 text-lg focus:border-gray-400"
                        placeholder="Meeting Title"
                        value={meetingTitle}
                        onChange={e => setMeetingTitle(e.target.value)}
                    />
                    <div className="w-full md:w-1/4 flex flex-col gap-2">
                        {quarter === '__custom__' ? (
                            <input
                                className="border border-gray-300 rounded-md px-4 py-3 text-lg focus:border-gray-400"
                                placeholder="Enter custom quarter name"
                                value={customQuarter}
                                autoFocus
                                onChange={e => setCustomQuarter(e.target.value)}
                                onBlur={e => { if (!customQuarter) setQuarter(""); }}
                            />
                        ) : (
                            <select
                                className="border border-gray-300 rounded-md px-4 py-3 text-lg focus:border-gray-400"
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
                                <option value="Q1">Q1</option>
                                <option value="Q2">Q2</option>
                                <option value="Q3">Q3</option>
                                <option value="Q4">Q4</option>
                                <option value="__custom__">Enter custom quarter</option>
                            </select>
                        )}
                    </div>
                    <input
                        className="border border-gray-300 rounded-md px-4 py-3 w-full md:w-1/4 text-lg focus:border-gray-400"
                        placeholder="Year (e.g. 2025)"
                        value={quarterYear}
                        onChange={e => setQuarterYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                        maxLength={4}
                    />
                    <div className="w-full md:w-1/4 flex flex-col">
                        <select
                            className="border border-gray-300 rounded-md px-4 py-3 text-lg focus:border-gray-400"
                            value={quarterWeeks}
                            onChange={e => setQuarterWeeks(Number(e.target.value))}
                        >
                            <option value="" disabled>Select Quarter Weeks</option>
                            {[...Array(13).keys()].reverse().map(week => (
                                <option key={week} value={week}>
                                    {week === 12
                                        ? '12 weeks (Quarter weeks)'
                                        : `${week} weeks (Quarter weeks)`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <textarea
                    className="border border-gray-300 rounded-md px-4 py-3 w-full min-h-[80px] text-base focus:border-gray-400"
                    placeholder="Meeting Description"
                    value={meetingDescription}
                    onChange={e => setMeetingDescription(e.target.value)}
                />
                <div className="mt-2 flex-1 flex flex-col">
                    <div className="font-semibold text-gray-700 mb-2 text-lg">Select Attendes</div>
                    <div className="flex-1 min-h-[350px] max-h-[450px] overflow-y-auto border border-gray-200 rounded-lg">
                        <EmployeeSelectionTable
                            selectedEmployees={selectedEmployees}
                            onSelectionChange={setSelectedEmployees}
                            minimal
                        />
                    </div>
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-none self-end "
                    onClick={() => {
                        // Use customQuarter if quarter is __custom__, else use quarter
                        const finalQuarter = quarter === '__custom__' ? customQuarter : quarter;
                        onSubmit({
                            meetingTitle,
                            meetingDescription,
                            quarter: finalQuarter,
                            quarterYear,
                            quarterWeeks,
                            selectedEmployees
                        });
                    }}
                    disabled={loading || !meetingTitle || !(quarter === '__custom__' ? customQuarter : quarter) || !quarterYear || selectedEmployees.length === 0}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                        </div>
                    ) : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default MeetingDetailsModal;
