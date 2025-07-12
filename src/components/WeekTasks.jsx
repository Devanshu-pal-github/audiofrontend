import React, { useState, useMemo } from "react";
import { Calendar, User, MessageSquare, Clock, Target, Filter, Search, Plus } from "lucide-react";

// Prevent background scroll when popup is open
function BodyScrollLock({ children }) {
    React.useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, []);
    return children;
}

const WeekTasks = ({ week, tasks, allTasks, cardWidth, quarter, meetingDate, rockName, globalSearch, rocks, isEmployeeView = false }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [facilitatorComment, setFacilitatorComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        subtasks: [""],
        assignedTo: "",
        assigneeRole: "",
        rockName: ""
    });

    // Helper function to truncate text intelligently
    const truncateText = (text, wordLimit = 6) => {
        if (!text) return "";
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    // Filter tasks based on filter type and value
    const filteredTasks = tasks; // Use pre-filtered tasks from parent

    const handleTaskClick = (task) => {
        setSelectedTask({
            ...task,
            facilitatorComments: task.facilitatorComments || [],
            employeeComments: task.employeeComments || [],
        });
    };

    const closePopup = () => {
        setSelectedTask(null);
    };

    // Add facilitator/employee comment to selectedTask (local only)
    const handleAddFacilitatorComment = () => {
        if (!facilitatorComment.trim()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            if (isEmployeeView) {
                // Add to employee comments
                setSelectedTask(prev => ({
                    ...prev,
                    employeeComments: [
                        ...(prev.employeeComments || []),
                        {
                            id: Date.now(),
                            comment: facilitatorComment,
                            timestamp: new Date().toISOString(),
                            author: "Employee"
                        }
                    ]
                }));
            } else {
                // Add to facilitator comments
                setSelectedTask(prev => ({
                    ...prev,
                    facilitatorComments: [
                        ...(prev.facilitatorComments || []),
                        {
                            id: Date.now(),
                            comment: facilitatorComment,
                            timestamp: new Date().toISOString(),
                            author: "Meeting Facilitator"
                        }
                    ]
                }));
            }
            setFacilitatorComment("");
            setIsSubmitting(false);
        }, 400);
    };

    // Add Task Functions
    const handleAddTask = () => {
        setShowAddTaskModal(true);
    };

    const handleSaveNewTask = () => {
        // Here you would typically save to backend
        // For now, we'll just close the modal
        console.log("New task:", newTask);
        setShowAddTaskModal(false);
        setNewTask({
            title: "",
            subtasks: [""],
            assignedTo: "",
            rockName: ""
        });
    };

    const addSubtask = () => {
        setNewTask(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, ""]
        }));
    };

    const updateSubtask = (index, value) => {
        setNewTask(prev => ({
            ...prev,
            subtasks: prev.subtasks.map((st, i) => i === index ? value : st)
        }));
    };

    const removeSubtask = (index) => {
        setNewTask(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }));
    };

    return (
        <>
            <div className={`bg-white border border-gray-200 shadow flex-shrink-0 flex flex-col transition-all duration-300 relative min-w-[600px] max-w-[600px] h-[calc(100vh-300px)]`} style={{ borderRadius: 0 }}>
                {/* Week Header - Calendar Style */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 ">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-xl text-gray-800">{week}</h3>
                        <span className="text-sm text-gray-500 ml-auto">
                            {filteredTasks.length} {globalSearch ? `of ${allTasks.length}` : ''} tasks
                        </span>
                    </div>
                </div>

                {/* Tasks List - Calendar Style */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            {globalSearch ? (
                                <>
                                    <Filter size={40} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-base">No tasks match the search</p>
                                </>
                            ) : (
                                <>
                                    <Calendar size={40} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-base">No tasks scheduled</p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredTasks.map(({ task, rock }, idx) => {
                            const taskData = typeof task === 'string' ? { title: task, assignedTo: rock?.owner?.split('(')[0]?.trim() || 'Unassigned' } : task;
                            // Status capsule logic (default Pending)
                            const status = taskData.status || 'Pending';
                            const statusCapsule = {
                                'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
                                'Completed': 'bg-green-100 text-green-800 border-green-200',
                            }[status] || 'bg-gray-100 text-gray-700 border-gray-200';
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleTaskClick({ ...taskData, rock, quarter, meetingDate })}
                                    className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-5 cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="space-y-3">
                                        {/* Task Title and Rock Capsule */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 
                                                    className="font-semibold text-gray-800 text-lg leading-tight group-hover:text-blue-700 transition-colors"
                                                    title={taskData.title}
                                                >
                                                    {truncateText(taskData.title, 8)}
                                                </h4>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span 
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                                    title={rock?.rock_title || rock?.rock_name || 'General'}
                                                >
                                                    {truncateText(rock?.rock_title || rock?.rock_name || 'General', 3)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subtasks */}
                                        {taskData.subtasks && taskData.subtasks.length > 0 && (
                                            <div className="ml-4 space-y-2">
                                                {taskData.subtasks.map((subtask, subIdx) => (
                                                    <div key={subIdx} className="flex items-center gap-3 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                                                        <span 
                                                            className="leading-relaxed"
                                                            title={subtask}
                                                        >
                                                            {truncateText(subtask, 10)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Assigned To, Role, and Status Capsule at bottom */}
                                        <div className="flex items-end justify-between pt-3 border-t border-gray-200">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <span 
                                                        className="text-base text-gray-600 font-medium"
                                                        title={taskData.assignedTo || rock?.owner?.split('(')[0]?.trim() || 'Unassigned'}
                                                    >
                                                        {truncateText(taskData.assignedTo || rock?.owner?.split('(')[0]?.trim() || 'Unassigned', 3)}
                                                    </span>
                                                </div>
                                                {rock?.owner?.includes('(') && (
                                                    <span className="text-sm text-gray-500 ml-7">
                                                        ({rock.owner.split('(')[1]?.replace(')', '')})
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${statusCapsule}`} style={{ minWidth: 90, textAlign: 'center' }}>{status}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Add Task Button - Only show for admin view */}
                {!isEmployeeView && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                        <button
                            onClick={handleAddTask}
                            className="flex items-center gap-2 py-2 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium border border-blue-200 hover:border-blue-300"
                        >
                            <Plus size={16} />
                            Add Task
                        </button>
                    </div>
                )}
            </div>

            {/* Add Task Modal - Only show for admin view */}
            {!isEmployeeView && showAddTaskModal && (
                <BodyScrollLock>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div 
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowAddTaskModal(false)}
                        ></div>
                        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Add New Task to {week}</h2>
                                    <button
                                        onClick={() => setShowAddTaskModal(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 max-h-[calc(80vh-120px)] overflow-y-auto">
                                {/* Task Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Task Name</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter task name..."
                                    />
                                </div>

                                {/* Subtasks */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">Subtasks</label>
                                        <button
                                            type="button"
                                            onClick={addSubtask}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <Plus size={14} />
                                            Add Subtask
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {newTask.subtasks.map((subtask, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={subtask}
                                                    onChange={(e) => updateSubtask(index, e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder={`Subtask ${index + 1}...`}
                                                />
                                                {newTask.subtasks.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSubtask(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Assigned To */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee Name</label>
                                        <input
                                            type="text"
                                            value={newTask.assignedTo}
                                            onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter assignee name..."
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee Role</label>
                                        <input
                                            type="text"
                                            value={newTask.assigneeRole}
                                            onChange={(e) => setNewTask(prev => ({ ...prev, assigneeRole: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter assignee role..."
                                        />
                                    </div>
                                </div>

                                {/* Rock Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rock</label>
                                    <select
                                        value={newTask.rockName}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, rockName: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a rock...</option>
                                        {rocks.map((rock, index) => (
                                            <option key={index} value={rock.rock_title}>
                                                {rock.rock_title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowAddTaskModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveNewTask}
                                        disabled={!newTask.title.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </BodyScrollLock>
            )}

            {/* Enhanced Task Detail Popup */}
            {selectedTask && (
                <BodyScrollLock>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        {/* Subtle backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/50"
                            onClick={closePopup}
                        ></div>
                        {/* Popup content */}
                        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200 flex flex-col">
                            {/* Header with Close */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-semibold leading-tight">{selectedTask.title}</h2>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-100 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Target size={14} />
                                            <span>{quarter || 'Q1 2024'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{meetingDate || 'Jul 15, 2024'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>Rock: {selectedTask.rock?.rock_title || rockName || 'Luna Project'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={closePopup}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Task Meta Summary (like GitHub commit summary) */}
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-blue-600" />
                                            <span className="font-medium text-gray-900">{selectedTask.assignedTo || selectedTask.rock?.owner?.split('(')[0]?.trim() || 'Unassigned'}</span>
                                            {/* Status capsule (read-only) */}
                                            <span className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full border ${{
                                                'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                                'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
                                                'Completed': 'bg-green-100 text-green-800 border-green-200',
                                            }[selectedTask.status || 'Pending'] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                style={{ minWidth: 90, textAlign: 'center' }}
                                            >
                                                {selectedTask.status || 'Pending'}
                                            </span>
                                        </div>
                                        {/* Designation below name if available */}
                                        {selectedTask.assigneeRole || (selectedTask.rock?.owner?.includes('(') && (
                                            <span className="text-xs text-gray-600">{selectedTask.assigneeRole || selectedTask.rock.owner.split('(')[1]?.replace(')', '')}</span>
                                        ))}
                                    </div>
                                    {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                                        <div className="ml-2 mt-2">
                                            <div className="text-xs font-semibold text-gray-700 mb-1">Subtasks:</div>
                                            <ul className="list-disc list-inside space-y-1">
                                                {selectedTask.subtasks.map((subtask, idx) => (
                                                    <li key={idx} className="text-sm text-gray-700">{subtask}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comments Section (GitHub style) */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                        <MessageSquare size={18} className="text-blue-600" />
                                        Comments
                                    </h3>

                                    {/* Mixed chat-style comments and always show add comment box */}
                                    {(() => {
                                        const facilitator = selectedTask.facilitatorComments || [];
                                        const employee = selectedTask.employeeComments || [];
                                        const allComments = [...facilitator.map(c => ({ ...c, _type: 'facilitator' })), ...employee.map(c => ({ ...c, _type: 'employee' }))];
                                        allComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                                        // Helper to get relative time (e.g., '2 weeks ago')
                                        function getRelativeTime(date) {
                                            const now = new Date();
                                            const then = new Date(date);
                                            const diffMs = now - then;
                                            const diffSec = Math.floor(diffMs / 1000);
                                            const diffMin = Math.floor(diffSec / 60);
                                            const diffHr = Math.floor(diffMin / 60);
                                            const diffDay = Math.floor(diffHr / 24);
                                            const diffWk = Math.floor(diffDay / 7);
                                            if (diffWk > 0) return diffWk === 1 ? '1 week ago' : `${diffWk} weeks ago`;
                                            if (diffDay > 0) return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
                                            if (diffHr > 0) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`;
                                            if (diffMin > 0) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
                                            return 'Just now';
                                        }

                                        return (
                                            <>
                                                {allComments.length > 0 ? (
                                                    <div className="mb-4">
                                                        {allComments.map((comment, idx) => {
                                                            return (
                                                                <div key={comment.id + comment.timestamp} className="flex flex-col mb-6">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border ${comment._type === 'facilitator' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>
                                                                            {comment.avatar ? (
                                                                                <span>{comment.avatar}</span>
                                                                            ) : (
                                                                                <User size={18} className={comment._type === 'facilitator' ? 'text-amber-600' : 'text-blue-600'} />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-0 shadow-sm">
                                                                            <div className="flex items-center justify-between px-3 pt-3 pb-1">
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <span className="font-semibold text-gray-900 text-sm">{comment.author || (comment._type === 'facilitator' ? 'Facilitator' : 'Employee')}</span>
                                                                                    {comment.role && <span className="text-xs text-gray-500">({comment.role})</span>}
                                                                                    <span className="text-xs text-gray-400 ml-2 truncate">{getRelativeTime(comment.timestamp)}</span>
                                                                                </div>
                                                                                <span className="text-xs text-gray-400 flex items-center gap-1 ml-2 whitespace-nowrap"><Clock size={12} /> {new Date(comment.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                                            </div>
                                                                            {/* Designation below name if available */}
                                                                            {comment.role && (
                                                                                <div className="px-3 pb-1 text-xs text-gray-500">{comment.role}</div>
                                                                            )}
                                                                            <div className="flex items-center gap-2 px-3 pb-2">
                                                                                {/* Only show status for facilitator comments, not employee comments */}
                                                                                {comment._type === 'facilitator' && comment.status && (
                                                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2`}
                                                                                        style={{
                                                                                            backgroundColor: comment.status === 'Completed' ? '#22c55e' : comment.status === 'In Progress' ? '#2563eb' : '#facc15',
                                                                                            color: comment.status === 'Completed' ? '#fff' : comment.status === 'In Progress' ? '#fff' : '#7c5e00',
                                                                                        }}
                                                                                    >
                                                                                        {comment.status}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <hr className="border-t border-gray-200 mx-3 my-1" />
                                                                            <div className="text-gray-800 text-sm whitespace-pre-line leading-relaxed px-3 pb-3">{comment.comment}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : null}
                                                {/* Always show Add Comment Box at the bottom */}
                                                <div className="flex items-start gap-3 mt-6">
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User size={20} className="text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <textarea
                                                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none min-h-[48px] bg-gray-50"
                                                            placeholder={isEmployeeView ? "Add an employee comment..." : "Add a facilitator comment..."}
                                                            value={facilitatorComment}
                                                            onChange={e => setFacilitatorComment(e.target.value)}
                                                            disabled={isSubmitting}
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                                                                onClick={handleAddFacilitatorComment}
                                                                disabled={isSubmitting || !facilitatorComment.trim()}
                                                            >
                                                                {isSubmitting ? 'Adding...' : 'Add Comment'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </BodyScrollLock>
            )}
        </>
    );
};

export default WeekTasks;
