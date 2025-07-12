import React, { useState, useEffect, useMemo } from "react";
import { useGetQuartersByStatusQuery, useGetQuarterWithRocksAndTasksQuery } from "../services/api";
import { useNavigate } from "react-router-dom";

const ViewDrafts = ({ onClose }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Fetch draft quarters (status = 0) and refetch every time the component opens
    const { data: draftQuarters = [], isLoading, error, refetch } = useGetQuartersByStatusQuery({
        status: 0,
        token
    });

    // Refetch data when component mounts to ensure fresh data
    useEffect(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Search and filter state
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState("");

    // Extract unique years from drafts for filter dropdown
    const years = useMemo(() => {
        if (!draftQuarters) return [];
        const y = draftQuarters.map(d => d.year).filter(Boolean);
        return Array.from(new Set(y)).sort((a, b) => b - a);
    }, [draftQuarters]);

    // Filtered and searched drafts
    const filteredDrafts = useMemo(() => {
        let drafts = draftQuarters;
        if (yearFilter) {
            drafts = drafts.filter(d => String(d.year) === String(yearFilter));
        }
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            drafts = drafts.filter(d =>
                (d.title && d.title.toLowerCase().includes(s)) ||
                (d.quarter && String(d.quarter).toLowerCase().includes(s)) ||
                (d.year && String(d.year).includes(s))
            );
        }
        return drafts;
    }, [draftQuarters, search, yearFilter]);

    // Handle clicking on a draft quarter
    const handleDraftClick = async (quarter) => {
        try {
            onClose();
            navigate('/rocks', {
                state: {
                    selectedQuarter: quarter,
                    quarterId: quarter.id,
                    fromDrafts: true
                }
            });
        } catch (error) {
            onClose();
            navigate('/rocks', {
                state: {
                    selectedQuarter: quarter,
                    quarterId: quarter.id,
                    fromDrafts: true
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 99999 }} onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>
            <div
                className="bg-white rounded-2xl shadow-2xl flex flex-col items-center border border-indigo-100/50"
                style={{ width: '100%', maxWidth: 480, minWidth: 320, height: 400, maxHeight: 480, minHeight: 320, padding: 0 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-t-2xl border-b border-indigo-200">
                    <h2 className="text-lg font-semibold text-indigo-900">Drafted Quarters</h2>
                    <button className="text-gray-500 hover:text-indigo-700 text-xl font-semibold transition-colors duration-200" onClick={onClose}>×</button>
                </div>
                {/* Search and Filter Bar */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 px-4 py-3 bg-white border-b border-indigo-100">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            className="w-full border border-indigo-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                            placeholder="Search by title, quarter, or year..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="yearFilter" className="text-xs text-gray-600 font-medium">Year:</label>
                        <select
                            id="yearFilter"
                            className="border border-indigo-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value)}
                        >
                            <option value="">All Years</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Draft Cards */}
                <div className="w-full flex-1 overflow-y-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-3" style={{ maxHeight: 320 }}>
                    {isLoading ? (
                        <div className="col-span-2 text-center text-gray-500 py-4 text-xs">Loading drafts...</div>
                    ) : error ? (
                        <div className="col-span-2 text-center text-red-500 py-4 text-xs">Error loading drafts: {error?.data?.detail || error.message}</div>
                    ) : filteredDrafts.length === 0 ? (
                        <div className="col-span-2 text-center text-gray-500 py-4 text-xs">No drafted quarters found.</div>
                    ) : (
                        filteredDrafts.map((draft, i) => (
                            <div
                                key={draft.id || i}
                                className="bg-white border border-indigo-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-indigo-50"
                                style={{ minHeight: 80, maxHeight: 120 }}
                                onClick={() => handleDraftClick(draft)}
                            >
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800 mb-1.5">
                                    <span className="text-indigo-400">📅</span>
                                    <span className="truncate">{draft.quarter} {draft.year}</span>
                                </div>
                                <div className="text-xs text-gray-700 mb-1.5 truncate" title={draft.title}>
                                    <span className="text-indigo-400 mr-1">📝</span>
                                    {draft.title || <span className="italic text-gray-400">No meeting name</span>}
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500">
                                    <span className="truncate" title={draft.created_at ? new Date(draft.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '-'}>
                                        Created: {draft.created_at ? new Date(draft.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                    </span>
                                    <span className="truncate" title={`Duration: ${draft.weeks} weeks`}>
                                        {draft.weeks} weeks
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewDrafts;