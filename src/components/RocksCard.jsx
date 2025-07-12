    import React, { useState } from 'react';
    import { Plus, ChevronRight, X, Target, User, Pencil, Trash2 } from 'lucide-react';
    import EditRockModal from './EditRockModal';

    // Custom styles for scrollbars
    const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
    `;

    const RocksCard = ({ 
        rocks = [], 
        onAddRock,
        onEditRock,
        onDeleteRock,
        selectedRock: parentSelectedRock,
        onRockSelect,
        onCloseRockDetail,
        isRockDetailOpen: parentIsRockDetailOpen,
        showEditDelete = false, // New prop to control edit/delete visibility
        isRocksPage = false // New prop to identify if it's being used in rocks page
    }) => {
        const [showAddModal, setShowAddModal] = useState(false);
        const [editRockModalOpen, setEditRockModalOpen] = useState(false);
        const [editRockData, setEditRockData] = useState(null);

        // Use parent state if provided, otherwise use local state
        const [localSelectedRock, setLocalSelectedRock] = useState(null);
        const [localIsRockDetailOpen, setLocalIsRockDetailOpen] = useState(false);
        
        const selectedRock = parentSelectedRock !== undefined ? parentSelectedRock : localSelectedRock;
        const isRockDetailOpen = parentIsRockDetailOpen !== undefined ? parentIsRockDetailOpen : localIsRockDetailOpen;

        // Only use real data from database
        const displayRocks = rocks && rocks.length > 0 ? rocks : [];

        const handleAddRock = () => {
            setEditRockData({
                rock_name: '',
                smart_objective: '',
                assigned_to_name: '',
                milestones: [],
            });
            setEditRockModalOpen(true);
        };

        const handleSaveNewRock = (rock) => {
            if (rock.rock_name && rock.rock_name.trim()) {
                onAddRock && onAddRock(rock);
                setEditRockModalOpen(false);
                setEditRockData(null);
            }
        };

        const handleCancel = () => {
            setEditRockModalOpen(false);
            setEditRockData(null);
        };

        // Toggle logic: open if closed, close if same rock is clicked again
        const handleRockSelect = (rock) => {
            if (onRockSelect) {
                // Use parent handler if provided
                if (
                    parentSelectedRock &&
                    parentSelectedRock.id === rock.id &&
                    parentIsRockDetailOpen
                ) {
                    onCloseRockDetail();
                } else {
                    onRockSelect(rock);
                }
            } else {
                // Use local state if no parent handler
                if (
                    localSelectedRock &&
                    localSelectedRock.id === rock.id &&
                    localIsRockDetailOpen
                ) {
                    setLocalIsRockDetailOpen(false);
                    setLocalSelectedRock(null);
                } else {
                    setLocalSelectedRock(rock);
                    setLocalIsRockDetailOpen(true);
                }
            }
        };

        const handleCloseRockDetail = () => {
            if (onCloseRockDetail) {
                onCloseRockDetail();
            } else {
                setLocalIsRockDetailOpen(false);
                setLocalSelectedRock(null);
            }
        };

        // Truncate to 5 words, show full on hover
        const truncateText = (text, wordLimit = 5) => {
            if (!text) return '';
            const words = text.split(' ');
            if (words.length <= wordLimit) return text;
            return words.slice(0, wordLimit).join(' ') + '...';
        };

        return (
            <div 
                className="h-full" 
                style={{ 
                    minHeight: 0,
                    width: '100%', // Take exactly the width allocated by parent
                    position: 'relative',
                    overflow: 'visible' // Allow detail to extend beyond this container
                }}
            >
                <style>{scrollbarStyles}</style>
                <div className="flex h-full">
                    {/* Main Card Area (Rocks List) - Always same width */}
                    <div
                        className="bg-white border-r-0 border border-gray-200 shadow flex-shrink-0 flex flex-col h-full"
                        style={{ 
                            borderRadius: isRockDetailOpen ? '0.5rem 0 0 0.5rem' : '0.5rem',
                            height: '100%',
                            minHeight: 0,
                            width: '100%' // Always full width of parent container
                        }}
                    >
                    {/* Header - Calendar Style */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-blue-600" />
                            <h3 className="font-semibold text-sm text-gray-800">Rocks</h3>
                            <span className="text-xs text-gray-500 ml-auto">
                                {displayRocks.length} rocks
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                        {displayRocks.map((rock, index) => {
                            const isSelected = selectedRock && (selectedRock.id === rock.id || selectedRock.rock_name === rock.rock_name);
                            return (
                            <div
                                key={rock.id || index}
                                onClick={() => handleRockSelect(rock)}
                                className={
                                    `bg-gray-50 border rounded-lg p-2 cursor-pointer transition-all duration-200 group ` +
                                    (isSelected
                                        ? 'bg-blue-50 border-blue-300 shadow-md'
                                        : 'hover:bg-blue-50 hover:border-blue-300 border-gray-200')
                                }
                                style={isSelected ? { boxShadow: '0 0 0 2px #6366f1, 0 2px 8px 0 rgba(99,102,241,0.08)' } : {}}
                            >
                                <div className="space-y-1.5">
                                    {/* Rock Title */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 
                                                className="font-semibold text-gray-800 text-xs leading-tight group-hover:text-blue-700 transition-colors truncate"
                                                title={rock.rock_name}
                                                style={{ cursor: 'pointer', maxWidth: '100%' }}
                                            >
                                                {truncateText(rock.rock_name, 4)}
                                            </h4>
                                        </div>
                                        {showEditDelete && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditRock && onEditRock(rock, index);
                                                    }}
                                                    className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors duration-200"
                                                    title="Edit rock"
                                                >
                                                    <Pencil size={10} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteRock && onDeleteRock(rock, index);
                                                    }}
                                                    className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-200"
                                                    title="Delete rock"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Smart Objective Description */}
                                    {rock.smart_objective && (
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {truncateText(rock.smart_objective, 12)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Assigned To and Week Count */}
                                    <div className="flex items-end justify-between pt-1.5 border-t border-gray-200">
                                        <div className="flex items-center gap-1">
                                            <User size={10} className="text-gray-400" />
                                            <span className="text-xs text-gray-500">Owner:</span>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {rock.assigned_to_name || rock.owner || 'Unassigned'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <span>{rock.tasks?.length || rock.milestones?.length || 0} Milestones</span>
                                            <ChevronRight size={10} className="text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>

                {/* Add Rock Button - Only show in Meeting Summary page */}
                {isRocksPage && (
                    <div className="px-3 py-2 border-t border-gray-100">
                        <button
                            onClick={handleAddRock}
                            className="flex items-center gap-1 py-1 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-xs font-medium border border-blue-200 hover:border-blue-300"
                        >
                            <Plus size={12} />
                            Add Rock
                        </button>
                    </div>
                )}

                    {/* Edit Rock Modal for Add Rock */}
                    {editRockModalOpen && (
                        <EditRockModal
                            open={editRockModalOpen}
                            rock={editRockData}
                            onClose={handleCancel}
                            onSave={handleSaveNewRock}
                            title="Add New Rock"
                            currentRocks={displayRocks}
                        />
                    )}
                </div>

                {/* Right Panel (Rock Detail) - Absolutely positioned to avoid layout disruption */}
                {selectedRock && (
                    <div
                        className={`bg-white shadow-xl border border-l-0 border-gray-200 transition-all duration-300 ease-out overflow-hidden ${
                            isRockDetailOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ 
                            position: 'absolute',
                            top: 0,
                            left: '100%', // Position right next to the main card
                            width: isRockDetailOpen ? '360px' : '0px',
                            height: '100%',
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: '0.5rem',
                            borderBottomRightRadius: '0.5rem',
                            zIndex: 10
                        }}
                    >
                        <div className="flex flex-col h-full opacity-100">
                            {/* Header */}
                            <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-semibold text-gray-900 mb-1 truncate">{selectedRock.rock_name}</h3>

                                        <p className="text-xs text-gray-600">Owner: {selectedRock.assigned_to_name}</p>
                                    </div>
                                    <button
                                        onClick={handleCloseRockDetail}
                                        className="ml-2 p-1 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
                                    >
                                        <X size={14} className="text-gray-500" />
                                    </button>
                                </div>
                                {selectedRock.smart_objective && (
                                    <p className="text-xs text-gray-700 mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                        {selectedRock.smart_objective}
                                    </p>
                                )}
                            </div>

                            {/* Content - Weekly Tasks/Milestones */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-3">
                                    <h4 className="font-medium text-gray-900 mb-2 text-xs">Weekly Milestones</h4>
                                    {/* Handle both milestones (mock data) and tasks (API data) */}
                                    {selectedRock.milestones && selectedRock.milestones.length > 0 ? (
                                        selectedRock.milestones.map((weekData, index) => (
                                            <div key={index} className="mb-3">
                                                <h5 className="font-medium text-gray-700 mb-1.5 flex items-center text-xs">
                                                    {weekData.week}
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        ({weekData.milestones?.length || weekData.tasks?.length || 0} tasks)
                                                    </span>
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {(weekData.milestones || weekData.tasks || []).map((task, taskIndex) => (
                                                        <div key={taskIndex} className="p-2 bg-gray-50 rounded-md border border-gray-200">
                                                            <p className="text-xs font-medium text-gray-800">{task.title || task.task}</p>
                                                            {(task.subtasks || task.sub_tasks) && (task.subtasks?.length > 0 || task.sub_tasks?.length > 0) && (
                                                                <ul className="mt-1 space-y-0.5">
                                                                    {(task.subtasks || task.sub_tasks).map((subtask, subIndex) => (
                                                                        <li key={subIndex} className="text-xs text-gray-600 ml-3">
                                                                            • {subtask}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : selectedRock.tasks && selectedRock.tasks.length > 0 ? (
                                        // Handle direct tasks array from API
                                        (() => {
                                            // Group tasks by week
                                            const tasksByWeek = {};
                                            selectedRock.tasks.forEach(task => {
                                                const weekKey = `Week ${task.week}`;
                                                if (!tasksByWeek[weekKey]) {
                                                    tasksByWeek[weekKey] = [];
                                                }
                                                tasksByWeek[weekKey].push(task);
                                            });

                                            return Object.keys(tasksByWeek).sort((a, b) => {
                                                const weekA = parseInt(a.split(' ')[1]);
                                                const weekB = parseInt(b.split(' ')[1]);
                                                return weekA - weekB;
                                            }).map((weekKey, index) => (
                                                <div key={index} className="mb-3">
                                                    <h5 className="font-medium text-gray-700 mb-1.5 flex items-center text-xs">
                                                        {weekKey}
                                                        <span className="ml-1 text-xs text-gray-500">
                                                            ({tasksByWeek[weekKey].length} Milestones)
                                                        </span>
                                                    </h5>
                                                    <div className="space-y-1.5">
                                                        {tasksByWeek[weekKey].map((task, taskIndex) => (
                                                            <div key={taskIndex} className="p-2 bg-gray-50 rounded-md border border-gray-200">
                                                                <p className="text-xs font-medium text-gray-800">{task.task}</p>
                                                                {task.sub_tasks && task.sub_tasks.length > 0 && (
                                                                    <ul className="mt-1 space-y-0.5">
                                                                        {task.sub_tasks.map((subtask, subIndex) => (
                                                                            <li key={subIndex} className="text-xs text-gray-600 ml-3">
                                                                                • {subtask}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ));
                                        })()
                                    ) : (
                                        <p className="text-xs text-gray-500">No tasks available for this rock.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        );
    };

    export default RocksCard;
