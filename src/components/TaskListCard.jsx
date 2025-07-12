import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, X, CheckSquare, User, AlertCircle, Pencil, Trash2 } from 'lucide-react';

// Custom styles for scrollbars
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const TaskListCard = forwardRef(({ 
    title, 
    items = [], 
    type = 'task', // 'task' or 'issue'
    onAddItem,
    onEditItem,
    onDeleteItem,
    emptyMessage = "No items found",
    placeholder = "Add new item...",
    showEditDelete = false, // New prop to control edit/delete visibility
    isRocksPage = false // New prop to identify if it's being used in rocks page
}, ref) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null); // For editing existing items
    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium"
    });

    // Only show real data from database
    const displayItems = items || [];

    const handleAddItem = () => {
        setEditingItem(null); // Clear any editing state
        setNewItem({
            title: "",
            description: "",
            assignedTo: "",
            priority: "medium"
        });
        setShowAddModal(true);
    };

    const handleSaveNewItem = () => {
        if (newItem.title.trim()) {
            if (editingItem) {
                // Editing existing item
                const updatedItem = {
                    ...editingItem,
                    [type === 'task' ? 'to_do' : 'title']: newItem.title,
                    [type === 'task' ? 'linked_issue' : 'description']: newItem.description,
                    [type === 'task' ? 'owner' : 'assignedTo']: newItem.assignedTo
                };
                onEditItem && onEditItem(updatedItem, editingItem.index);
            } else {
                // Adding new item
                onAddItem && onAddItem(newItem);
            }
            setNewItem({
                title: "",
                description: "",
                assignedTo: "",
                priority: "medium"
            });
            setEditingItem(null);
            setShowAddModal(false);
        }
    };

    const handleCancel = () => {
        setNewItem({
            title: "",
            description: "",
            assignedTo: "",
            priority: "medium"
        });
        setEditingItem(null);
        setShowAddModal(false);
    };

    const handleDeleteClick = (item, index) => {
        if (isRocksPage) {
            // When in rocks page, show confirmation dialog
            setItemToDelete({ item, index });
            setShowDeleteConfirm(true);
        } else {
            // When in meeting summary, call parent handler directly
            onDeleteItem && onDeleteItem(item, index);
        }
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onDeleteItem && onDeleteItem(itemToDelete.item, itemToDelete.index);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        triggerAddModal: () => {
            setEditingItem(null); // Clear any editing state
            setNewItem({
                title: "",
                description: "",
                assignedTo: "",
                priority: "medium"
            });
            setShowAddModal(true);
        }
    }));

    // Truncate to 5 words, show full on hover
    const truncateText = (text, wordLimit = 5) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed':
            case 'Resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Pending':
            case 'Open':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getIcon = () => {
        return type === 'task' ? <CheckSquare size={14} className="text-blue-600" /> : <AlertCircle size={14} className="text-blue-600" />;
    };

    return (
        <div className="bg-white border border-gray-200 shadow flex-shrink-0 flex flex-col transition-all duration-300 relative h-full" style={{ borderRadius: '0.5rem', height: '100%', minHeight: 0 }}>
            <style>{scrollbarStyles}</style>
            {/* Header - Calendar Style */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-3 py-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
                    <span className="text-xs text-gray-500 ml-auto">
                        {displayItems.length} {type === 'task' ? 'tasks' : 'issues'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
                {displayItems.length > 0 ? (
                    displayItems.map((item, index) => (
                        <div
                            key={item.todo_id || item.id || index}
                            className="bg-gray-50 border rounded-lg p-2 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 border-gray-200"
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="space-y-1.5">
                                {/* Task/Issue Title */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 
                                            className="font-semibold text-gray-800 text-xs leading-tight transition-colors"
                                            title={item.to_do || item.title}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {truncateText(item.to_do || item.title, 8)}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {showEditDelete && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isRocksPage) {
                                                            // In rocks page, populate modal with existing data
                                                            setEditingItem({ ...item, index });
                                                            setNewItem({
                                                                title: item.to_do || item.title || "",
                                                                description: item.linked_issue || item.description || "",
                                                                assignedTo: item.owner || item.assignedTo || "",
                                                                priority: "medium"
                                                            });
                                                            setShowAddModal(true);
                                                        } else {
                                                            // In meeting summary, use parent handler
                                                            onEditItem && onEditItem(item, index);
                                                        }
                                                    }}
                                                    className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors duration-200"
                                                    title={`Edit ${type}`}
                                                >
                                                    <Pencil size={10} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(item, index);
                                                    }}
                                                    className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-200"
                                                    title={`Delete ${type}`}
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </>
                                        )}
                                        {type === 'task' ? <CheckSquare size={10} className="text-blue-600" /> : <AlertCircle size={10} className="text-blue-600" />}
                                    </div>
                                </div>

                                {/* Description */}
                                {(item.description || item.linked_issue) && (
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {truncateText(item.description || item.linked_issue, 12)}
                                        </p>
                                    </div>
                                )}

                                {/* Bottom Info */}
                                <div className="flex items-end justify-between pt-1.5 border-t border-gray-200">
                                    <div className="flex items-center gap-1">
                                        <User size={10} className="text-gray-400" />
                                        <span className="text-xs text-gray-500">Owner:</span>
                                        <span className="text-xs text-gray-600 font-medium">
                                            {item.owner || item.assignedTo || item.assigned_to || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <div className="mb-2 opacity-50">
                            {type === 'task' ? <CheckSquare size={32} className="mx-auto" /> : <AlertCircle size={32} className="mx-auto" />}
                        </div>
                        <p className="text-sm">{emptyMessage}</p>
                        <p className="text-xs mt-1">Click "Add {type === 'task' ? 'Task' : 'Issue'}" to get started</p>
                    </div>
                )}
            </div>

            {/* Add Button - Only show in Rocks Page */}
            {isRocksPage && (
                <div className="px-2 py-1.5 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={handleAddItem}
                        className="flex items-center gap-1 py-1 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200 text-xs font-medium border border-blue-200 hover:border-blue-300"
                    >
                        <Plus size={10} />
                        Add {type === 'task' ? 'Task' : 'Issue'}
                    </button>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-25 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs mx-4 border border-gray-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">
                                    {editingItem ? `Edit ${type === 'task' ? 'Task' : 'Issue'}` : `Add New ${type === 'task' ? 'Task' : 'Issue'}`}
                                </h3>
                                <button
                                    onClick={handleCancel}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-3 space-y-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {type === 'task' ? 'Task' : 'Issue'} Title *
                                </label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={placeholder}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter description..."
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Assign To
                                </label>
                                <input
                                    type="text"
                                    value={newItem.assignedTo}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, assignedTo: e.target.value }))}
                                    placeholder="Enter assignee name..."
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-2 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewItem}
                                    disabled={!newItem.title.trim()}
                                    className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                >
                                    {editingItem ? `Update ${type === 'task' ? 'Task' : 'Issue'}` : `Add ${type === 'task' ? 'Task' : 'Issue'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog - Only show in Rocks Page */}
            {showDeleteConfirm && isRocksPage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-xs flex flex-col items-center">
                        <h2 className="text-sm font-bold text-gray-800 mb-2">
                            Are you sure you want to delete this {type === 'task' ? 'to-do' : 'issue'}?
                        </h2>
                        <div className="flex gap-2 mt-3">
                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded font-medium text-xs"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors px-3 py-1.5"
                                onClick={handleConfirmDelete}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default TaskListCard;
