import React, { useState } from "react";
import { useGetUsersQuery } from "../services/api";

const EditRockModal = ({ open, rock, onClose, onSave, title, currentRocks = [], users: propUsers }) => {
  const [form, setForm] = useState(rock || {});
  
  // Get users from API (fallback to props)
  const token = localStorage.getItem('token');
  const { data: apiUsers } = useGetUsersQuery({ token });
  const users = apiUsers || propUsers;

  React.useEffect(() => {
    setForm(rock || {});
  }, [rock]);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Transform backend tasks to milestone structure for UI
  React.useEffect(() => {
    if (!rock) return;
    
    if (rock.tasks && Array.isArray(rock.tasks)) {
      // Group tasks by week to create milestones
      const tasksByWeek = {};
      rock.tasks.forEach(task => {
        const week = task.week || 1;
        if (!tasksByWeek[week]) {
          tasksByWeek[week] = [];
        }
        
        // Transform sub_tasks array to subtasks array for UI
        let subtasks = [];
        if (Array.isArray(task.sub_tasks)) {
          subtasks = task.sub_tasks;
        } else if (task.sub_tasks && typeof task.sub_tasks === 'object') {
          subtasks = Object.values(task.sub_tasks);
        }
        
        tasksByWeek[week].push({
          title: task.task || '',
          subtasks: subtasks
        });
      });

      // Convert to milestones structure
      const milestones = Object.keys(tasksByWeek)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(week => ({
          week: parseInt(week),
          tasks: tasksByWeek[week]
        }));

      setForm(prev => ({
        ...prev,
        milestones: milestones.length > 0 ? milestones : []
      }));
    } else {
      // For new rocks or rocks without tasks, initialize with empty milestones
      setForm(prev => ({
        ...prev,
        milestones: []
      }));
    }
  }, [rock]);

  // Check if this is a new rock - more robust check
  const isNewRock = React.useMemo(() => {
    return !rock?.id && !rock?.rock_id && (!rock?.tasks || rock.tasks.length === 0);
  }, [rock]);

  // State for managing custom owner input - MUST be before early return
  const [isAddingNewOwner, setIsAddingNewOwner] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');

  // Early return after all hooks
  if (!open || !rock) return null;

  // Handle click outside to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get dynamic owner options from backend data
  const getDynamicOwnerOptions = () => {
    try {
      const allOwners = new Set();

      // Priority 1: Use users from API
      if (users && Array.isArray(users)) {
        users.forEach(user => {
          const name = user.name || user.username;
          if (name) allOwners.add(name);
        });
      }

      // Priority 2: Get owners from current rocks on the page
      if (currentRocks && Array.isArray(currentRocks) && currentRocks.length > 0) {
        currentRocks.forEach(rock => {
          if (rock.assigned_to_name) allOwners.add(rock.assigned_to_name);
        });
      }

      // Priority 3: Try to get owners from final_response.json
      const savedFinalResponse = localStorage.getItem('finalResponseData');
      if (savedFinalResponse) {
        const finalResponseData = JSON.parse(savedFinalResponse);
        if (finalResponseData.rocks && Array.isArray(finalResponseData.rocks)) {
          finalResponseData.rocks.forEach(rock => {
            if (rock.owner) allOwners.add(rock.owner);
          });
        }
      }

      // Priority 4: Fallback to get from rocks.json
      const savedRocks = localStorage.getItem('rocks');
      if (savedRocks) {
        const rocksData = JSON.parse(savedRocks);
        if (Array.isArray(rocksData)) {
          rocksData.forEach(rock => {
            if (rock.assigned_to_name) allOwners.add(rock.assigned_to_name);
          });
        }
      }

      // Convert to array and add fallback names if no owners found
      const ownersArray = Array.from(allOwners);
      if (ownersArray.length === 0) {
        return ['Emily Clark', 'John Smith', 'Michael Brown'];
      }

      return ownersArray.sort();
    } catch (error) {
      console.error('Error getting dynamic owner options:', error);
      return ['Emily Clark', 'John Smith', 'Michael Brown'];
    }
  };

  // Dynamic owner options from backend data
  const ownerOptions = getDynamicOwnerOptions();

  // Handle adding a new owner
  const handleAddNewOwner = () => {
    if (newOwnerName.trim()) {
      updateField('assigned_to_name', newOwnerName.trim());
      updateField('owner', newOwnerName.trim());
      setIsAddingNewOwner(false);
      setNewOwnerName('');
    }
  };

  const handleCancelAddOwner = () => {
    setIsAddingNewOwner(false);
    setNewOwnerName('');
  };

  // Helper to update nested fields
  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Milestone/task/subtask editing helpers (original structure)
  const handleMilestoneChange = (idx, field, value) => {
    const milestones = [...(form.milestones || [])];
    milestones[idx][field] = value;
    setForm(f => ({ ...f, milestones }));
  };
  
  // Task is an object: { title: '', subtasks: [] }
  const handleTaskChange = (mIdx, tIdx, value) => {
    const milestones = [...(form.milestones || [])];
    if (!milestones[mIdx].tasks[tIdx]) milestones[mIdx].tasks[tIdx] = { title: '', subtasks: [] };
    milestones[mIdx].tasks[tIdx].title = value;
    setForm(f => ({ ...f, milestones }));
  };
  
  const addTask = (mIdx) => {
    const milestones = [...(form.milestones || [])];
    milestones[mIdx].tasks = [...(milestones[mIdx].tasks || []), { title: '', subtasks: [] }];
    setForm(f => ({ ...f, milestones }));
  };
  
  const removeTask = (mIdx, tIdx) => {
    const milestones = [...(form.milestones || [])];
    milestones[mIdx].tasks = milestones[mIdx].tasks.filter((_, i) => i !== tIdx);
    setForm(f => ({ ...f, milestones }));
  };
  
  // Subtask helpers
  const addSubtask = (mIdx, tIdx) => {
    const milestones = [...(form.milestones || [])];
    if (!milestones[mIdx].tasks[tIdx].subtasks) milestones[mIdx].tasks[tIdx].subtasks = [];
    milestones[mIdx].tasks[tIdx].subtasks.push('');
    setForm(f => ({ ...f, milestones }));
  };
  
  const handleSubtaskChange = (mIdx, tIdx, sIdx, value) => {
    const milestones = [...(form.milestones || [])];
    milestones[mIdx].tasks[tIdx].subtasks[sIdx] = value;
    setForm(f => ({ ...f, milestones }));
  };

  const removeSubtask = (mIdx, tIdx, sIdx) => {
    const milestones = [...(form.milestones || [])];
    milestones[mIdx].tasks[tIdx].subtasks = milestones[mIdx].tasks[tIdx].subtasks.filter((_, i) => i !== sIdx);
    setForm(f => ({ ...f, milestones }));
  };

  // Add milestone helper (only for new rocks)
  const addMilestone = () => {
    const milestones = [...(form.milestones || [])];
    const nextWeek = milestones.length > 0 ? Math.max(...milestones.map(m => m.week || 0)) + 1 : 1;
    milestones.push({
      week: nextWeek,
      tasks: []
    });
    setForm(f => ({ ...f, milestones }));
  };

  const removeMilestone = (mIdx) => {
    const milestones = [...(form.milestones || [])];
    milestones.splice(mIdx, 1);
    setForm(f => ({ ...f, milestones }));
  };

  // Transform milestones back to backend tasks format
  const transformMilestonesToTasks = (milestones) => {
    if (!milestones || !Array.isArray(milestones)) return [];
    
    const tasks = [];
    milestones.forEach(milestone => {
      if (!milestone.tasks || !Array.isArray(milestone.tasks)) return;
      
      milestone.tasks.forEach(task => {
        if (!task.title || task.title.trim() === '') return; // Skip empty tasks
        
        tasks.push({
          week: milestone.week || 1,
          task: task.title,
          sub_tasks: Array.isArray(task.subtasks) ? task.subtasks.filter(st => st && st.trim() !== '') : [],
          task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
          rock_id: form.rock_id || form.id,
          comments: {
            comment_id: "",
            commented_by: ""
          }
        });
      });
    });
    
    return tasks;
  };

  // Handle save with transformation
  const handleSave = () => {
    const transformedForm = {
      ...form,
      tasks: transformMilestonesToTasks(form.milestones)
    };
    
    // Remove milestones from the saved form since backend expects tasks array
    const { milestones, ...backendForm } = transformedForm;
    
    onSave(backendForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl p-3 w-full max-w-xl max-h-[70vh] relative flex flex-col overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg z-10" onClick={onClose}>&times;</button>
        <h2 className="text-sm font-bold text-black mb-2">{title || "Edit Rock"}</h2>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Left Column - Basic Information */}
            <div className="space-y-2">
              {/* Basic Information Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm h-[250px]">
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-700 text-xs">Basic Information</h3>
                </div>
                <div className="ml-2 space-y-2">
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rock Name</label>
                    <input 
                      className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:px-2 focus:py-1.5 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-200 focus:border-transparent" 
                      placeholder="Enter the rock name" 
                      value={form.rock_name || form.rock_title || ''} 
                      onChange={e => {
                        updateField('rock_name', e.target.value);
                        updateField('rock_title', e.target.value); // Update both fields for consistency
                      }} 
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Owner</label>
                    {isAddingNewOwner ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:px-2 focus:py-1.5 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-200 focus:border-transparent"
                          placeholder="Enter new owner name"
                          value={newOwnerName}
                          onChange={e => setNewOwnerName(e.target.value)}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              handleAddNewOwner();
                            } else if (e.key === 'Escape') {
                              handleCancelAddOwner();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          onClick={handleAddNewOwner}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          onClick={handleCancelAddOwner}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <select
                        className="w-full bg-transparent text-xs text-gray-700 focus:outline-none focus:bg-white focus:px-2 focus:py-1.5 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-200 focus:border-transparent"
                        value={form.assigned_to_name || form.owner || ''}
                        onChange={e => {
                          if (e.target.value === '__add_new__') {
                            setIsAddingNewOwner(true);
                          } else {
                            updateField('assigned_to_name', e.target.value);
                            updateField('owner', e.target.value); // Update both fields for consistency
                          }
                        }}
                      >
                        <option value="">Select owner...</option>
                        {ownerOptions.map((owner, idx) => (
                          <option key={idx} value={owner}>{owner}</option>
                        ))}
                        <option value="__add_new__" className="font-semibold text-blue-600">+ Add New Owner</option>
                      </select>
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Summary</label>
                    <textarea 
                      className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:px-2 focus:py-1.5 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-200 focus:border-transparent min-h-[80px] resize-none" 
                      placeholder="Enter summary of the rock" 
                      value={form.smart_objective || ''} 
                      onChange={e => updateField('smart_objective', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Review Section */}
              {/* <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-700 text-lg">Review</h3>
                </div>
                <div className="ml-7 space-y-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      className="w-full bg-transparent text-base text-gray-700 focus:outline-none focus:bg-white focus:px-4 focus:py-3 focus:rounded-lg focus:shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-b-2 border-gray-200 focus:border-transparent"
                      value={form.review?.status || ''} 
                      onChange={e => updateField('review', { ...form.review, status: e.target.value })}
                    >
                      <option value="">Select status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea 
                      className="w-full bg-transparent text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:px-4 focus:py-3 focus:rounded-lg focus:shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all duration-200 border-b-2 border-gray-200 focus:border-transparent min-h-[80px] resize-none" 
                      placeholder="Add your review comments here" 
                      value={form.review?.comments || ''} 
                      onChange={e => updateField('review', { ...form.review, comments: e.target.value })} 
                    />
                  </div>
                </div>
              </div> */}
            </div>
            
            {/* Right Column - Milestones & Tasks */}
            <div className="space-y-2">
              <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm h-[250px] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-700 text-xs">Weekly Tasks</h3>
                  </div>
                  {/* Add Milestone button - only show for new rocks */}
                  {isNewRock && (
                    <button 
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded text-xs font-medium transition-colors flex items-center gap-1" 
                      onClick={addMilestone}
                    >
                      <span>+</span>
                      Add Milestone
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {(form.milestones || []).map((ms, mIdx) => (
                    <div key={mIdx} className="relative">
                      {/* Week Separator Line */}
                      {mIdx > 0 && (
                        <div className="absolute -top-4 left-0 right-0 border-t border-gray-200"></div>
                      )}
                      {/* Milestone Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs font-medium text-gray-600">Week</span>
                        <input 
                          className="bg-transparent text-xs font-semibold text-indigo-700 focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-200 focus:border-transparent min-w-[60px]" 
                          placeholder="Week #" 
                          value={ms.week || ''} 
                          onChange={e => handleMilestoneChange(mIdx, 'week', e.target.value)} 
                        />
                        {/* Remove Milestone button - only show for new rocks */}
                        {isNewRock && (
                          <button 
                            className="text-red-500 hover:text-red-700 transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 ml-auto text-xs" 
                            onClick={() => removeMilestone(mIdx)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {/* Tasks List */}
                      <div className="ml-4 space-y-2">
                        {(ms.tasks || []).map((task, tIdx) => {
                          // Normalize task: if it's a string, convert to object with empty subtasks
                          let normalizedTask = typeof task === 'object' && task !== null ? { ...task, subtasks: Array.isArray(task.subtasks) ? task.subtasks : [] } : { title: task || '', subtasks: [] };
                          // Ensure the form state is always normalized for editing
                          if (typeof ms.tasks[tIdx] !== 'object' || ms.tasks[tIdx] === null || !Array.isArray(ms.tasks[tIdx].subtasks)) {
                            // Update the form state to ensure subtasks array exists
                            setTimeout(() => {
                              setForm(f => {
                                const milestones = [...(f.milestones || [])];
                                milestones[mIdx].tasks = [...(milestones[mIdx].tasks || [])];
                                milestones[mIdx].tasks[tIdx] = normalizedTask;
                                return { ...f, milestones };
                              });
                            }, 0);
                          }
                          return (
                            <div key={tIdx} className="group">
                              {/* Task Row */}
                              <div className="flex items-center gap-2 py-1">
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                                <input 
                                  className="flex-1 bg-transparent text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-100 focus:border-transparent" 
                                  placeholder="Enter task description..." 
                                  value={normalizedTask.title}
                                  onChange={e => handleTaskChange(mIdx, tIdx, e.target.value)} 
                                />
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium transition-colors"
                                    onClick={() => addSubtask(mIdx, tIdx)}
                                  >
                                    + Sub
                                  </button>
                                  <button 
                                    className="text-red-500 hover:text-red-700 transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 text-xs" 
                                    onClick={() => removeTask(mIdx, tIdx)}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              {/* Subtasks */}
                              {normalizedTask.subtasks && normalizedTask.subtasks.length > 0 && (
                                <div className="ml-3 space-y-1">
                                  {normalizedTask.subtasks.map((subtask, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-2 py-0.5 group/subtask">
                                      <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
                                      <input 
                                        className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-gray-50 focus:px-2 focus:py-1 focus:rounded focus:shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all duration-200 border-b border-gray-100 focus:border-transparent" 
                                        placeholder="Enter subtask..."
                                        value={subtask}
                                        onChange={e => handleSubtaskChange(mIdx, tIdx, sIdx, e.target.value)}
                                      />
                                      <button
                                        className="text-red-400 hover:text-red-600 transition-colors w-3 h-3 flex items-center justify-center rounded-full hover:bg-red-50 opacity-0 group-hover/subtask:opacity-100 text-xs"
                                        onClick={() => removeSubtask(mIdx, tIdx, sIdx)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {/* Add Task Button */}
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-1.5 h-1.5 border border-dashed border-gray-300 rounded-full flex-shrink-0"></div>
                          <button 
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-medium transition-colors flex items-center gap-1" 
                            onClick={() => addTask(mIdx)}
                          >
                            <span>+ Add Task</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Empty state when no milestones */}
                  {(!form.milestones || form.milestones.length === 0) && (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        </div>
                        <p className="text-xs font-medium">No milestones added yet</p>
                        {isNewRock ? (
                          <p className="text-xs mt-1">Click "Add Milestone" to get started</p>
                        ) : (
                          <p className="text-xs mt-1">This rock has no milestones configured</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with Cancel and Save Button */}
        <div className="flex justify-end pt-3 border-t mt-3 gap-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 py-1.5 rounded text-xs"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded text-xs" 
            onClick={handleSave}
          >
            Save Rock
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRockModal;
