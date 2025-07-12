import React, { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, ChevronDown, Target, CheckSquare, AlertTriangle, X, AudioLines, Mic, Save, FilePlus } from "lucide-react";
import Layout from "../components/Layout";
import RockCard from "../components/RockCard";
import RocksCard from "../components/RocksCard";
import TaskListCard from "../components/TaskListCard";
import EditRockModal from "../components/EditRockModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useUpdateQuarterStatusMutation, useGetQuarterWithRocksAndTasksQuery, useCreateRockMutation, useUpdateRockMutation, useDeleteRockMutation, useCreateRockTasksMutation, useUpdateRockTasksMutation, useDeleteRockTasksMutation, useUpdateRockObjectiveMutation, useGetUsersQuery } from "../services/api";

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

const RocksPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Get quarter ID from navigation state (from ViewDrafts) or localStorage
    const getQuarterId = () => {
        if (location.state?.quarterId) {
            return location.state.quarterId;
        }
        return localStorage.getItem('currentQuarterId');
    };

    const currentQuarterId = getQuarterId();
    console.log('RocksPage - Current Quarter ID:', currentQuarterId);
    console.log('RocksPage - Location state:', location.state);

    // Get users for assigned_to_id lookup
    const { data: users } = useGetUsersQuery({ token });

    // Always call the hook, but skip the query if no quarter ID
    const { data: quarterData, isLoading, error, refetch } = useGetQuarterWithRocksAndTasksQuery({
        quarter_id: currentQuarterId || '',
        token,
        include_comments: false
    }, {
        skip: !currentQuarterId
    });

    // State declarations (all hooks at top level)
    const [rocks, setRocks] = useState([]);
    const [editingRock, setEditingRock] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [deleteIdx, setDeleteIdx] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRock, setSelectedRock] = useState(null);
    const [isRockDetailOpen, setIsRockDetailOpen] = useState(false);
    // REMOVED: addNewDropdownOpen, setAddNewDropdownOpen
    const [refsDropdownOpen, setRefsDropdownOpen] = useState(false); // Moved to top level

    // API mutations
    const [updateQuarterStatus] = useUpdateQuarterStatusMutation();
    const [createRock] = useCreateRockMutation();
    const [updateRock] = useUpdateRockMutation();
    const [deleteRock] = useDeleteRockMutation();
    const [createRockTasks] = useCreateRockTasksMutation();
    const [updateRockTasks] = useUpdateRockTasksMutation();
    const [deleteRockTasks] = useDeleteRockTasksMutation();
    const [updateRockObjective] = useUpdateRockObjectiveMutation();

    // Refs for TaskListCard modals
    const taskListRef = useRef();
    const issueListRef = useRef();

    // Update rocks when API data changes or when coming from ViewDrafts/Upload
    useEffect(() => {
        if (quarterData?.rocks) {
            console.log('Setting rocks from API data:', quarterData.rocks);
            setRocks(quarterData.rocks);
        } else if (location.state?.rocks) {
            console.log('Setting rocks from navigation state:', location.state.rocks);
            setRocks(location.state.rocks);
        } else if ((location.state?.fromDrafts || location.state?.fromUpload || location.state?.fromUpload === false) && currentQuarterId) {
            console.log('Coming from drafts/upload/quarter creation, refetching data for quarter:', currentQuarterId);
            refetch();
        }
    }, [quarterData, location.state, currentQuarterId, refetch]);

    // Role-based redirect
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'employee') {
            navigate('/current-meeting-analysis', { replace: true });
        }
    }, [navigate]);

    // Handle delayed rock generation from backend pipeline
    useEffect(() => {
        let retryInterval;

        if (location.state?.fromUpload === true && currentQuarterId && (!rocks || rocks.length === 0) && !isLoading && !error) {
            console.log('Coming from upload with no rocks yet, setting up retry mechanism');

            const attemptRefetch = async () => {
                console.log('Attempting to refetch rocks for uploaded quarter:', currentQuarterId);
                try {
                    const result = await refetch();
                    if (result.data?.rocks && result.data.rocks.length > 0) {
                        console.log('Successfully found rocks:', result.data.rocks.length);
                        clearInterval(retryInterval);
                    }
                } catch (error) {
                    console.log('Refetch attempt failed:', error);
                }
            };

            attemptRefetch();

            let attempts = 0;
            const maxAttempts = 24;

            retryInterval = setInterval(() => {
                attempts++;
                console.log(`Retry attempt ${attempts}/${maxAttempts} for quarter: ${currentQuarterId}`);

                if (attempts >= maxAttempts) {
                    console.log('Max retry attempts reached, stopping');
                    clearInterval(retryInterval);
                    return;
                }

                if (rocks && rocks.length > 0) {
                    console.log('Rocks found, stopping retry');
                    clearInterval(retryInterval);
                    return;
                }

                attemptRefetch();
            }, 5000);
        }

        return () => {
            if (retryInterval) {
                clearInterval(retryInterval);
            }
        };
    }, [location.state?.fromUpload, currentQuarterId, rocks, isLoading, error, refetch]);

    // Consolidated click-outside handler for both dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (refsDropdownOpen && !event.target.closest('.refs-dropdown')) {
                setRefsDropdownOpen(false);
            }
        };

        if (refsDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [refsDropdownOpen]);

    // Helper functions
    const getUserIdByName = (userName) => {
        if (!users || !Array.isArray(users) || !userName) return null;
        const user = users.find(u => u.name === userName || u.username === userName);
        return user ? user.employee_id || user.id : null;
    };

    const transformRockToBackend = (rock) => {
        const assignedToId = rock.assigned_to_id || getUserIdByName(rock.assigned_to_name);
        return {
            rock_name: rock.rock_name,
            smart_objective: rock.smart_objective,
            quarter_id: currentQuarterId,
            assigned_to_id: assignedToId || "00000000-0000-0000-0000-000000000000",
            assigned_to_name: rock.assigned_to_name
        };
    };

    const transformTasksToBackend = (tasks) => {
        if (!Array.isArray(tasks)) return [];
        return tasks.map(task => ({
            task: task.task || task.title,
            week: task.week || 1,
            sub_tasks: task.sub_tasks || task.subtasks || []
        }));
    };

    const extractTasksFromMilestones = (milestones) => {
        if (!Array.isArray(milestones)) return [];
        const tasks = [];
        milestones.forEach((milestone, milestoneIdx) => {
            if (milestone.tasks && Array.isArray(milestone.tasks)) {
                milestone.tasks.forEach(task => {
                    tasks.push({
                        task: task.title || task.task,
                        week: milestoneIdx + 1,
                        sub_tasks: task.subtasks || task.sub_tasks || []
                    });
                });
            }
        });
        return tasks;
    };

    // Get ONLY todos from quarter API response for To-Do card (NO rock tasks) - similar to MeetingSummary
    const getAllTasks = () => {
        console.log('🔍 RocksPage - getAllTasks - Quarter data:', quarterData);
        
        if (!quarterData || !quarterData.todos || !Array.isArray(quarterData.todos)) {
            console.log('🔍 RocksPage - No todos found in quarterData:', quarterData?.todos);
            return [];
        }
        
        console.log('🔍 RocksPage - Processing todos from quarterData:', quarterData.todos.length);
        
        // Map todos to format expected by TaskListCard
        const mappedTodos = quarterData.todos.map((todo, index) => {
            console.log(`🔍 RocksPage - Processing todo ${index + 1}:`, todo);
            return {
                id: todo.todo_id || todo.id,
                todo_id: todo.todo_id || todo.id,
                to_do: todo.task_title, // TaskListCard looks for 'to_do' field
                title: todo.task_title, // Also provide 'title' as fallback
                description: todo.description,
                linked_issue: todo.linked_issue,
                assignedTo: todo.assigned_to,
                assigned_to: todo.assigned_to,
                owner: todo.assigned_to, // TaskListCard also looks for 'owner'
                due_date: todo.due_date,
                priority: todo.priority,
                status: todo.status,
                designation: todo.designation,
                type: 'todo'
            };
        });
        
        console.log('🔍 RocksPage - Final mapped todos:', mappedTodos.length, mappedTodos);
        
        // Sort todos by due_date
        return mappedTodos.sort((a, b) => {
            return new Date(a.due_date || 0) - new Date(b.due_date || 0);
        });
    };

    // Get issues from quarter API response - similar to MeetingSummary
    const getIssues = () => {
        console.log('🔍 RocksPage - getIssues - Quarter data:', quarterData);
        
        if (!quarterData || !quarterData.issues || !Array.isArray(quarterData.issues)) {
            console.log('🔍 RocksPage - No issues found in quarterData:', quarterData?.issues);
            return [];
        }
        
        console.log('🔍 RocksPage - Processing issues from quarterData:', quarterData.issues.length);
        
        // Map issues to format expected by TaskListCard
        const mappedIssues = quarterData.issues.map((issue, index) => {
            console.log(`🔍 RocksPage - Processing issue ${index + 1}:`, issue);
            return {
                id: issue.issue_id || issue.id,
                issue_id: issue.issue_id || issue.id,
                to_do: issue.issue_title, // TaskListCard looks for 'to_do' field for title
                title: issue.issue_title, // Also provide 'title' as fallback
                description: issue.description,
                linked_issue: issue.linked_solution_ref,
                owner: issue.raised_by, // TaskListCard looks for 'owner'
                assignedTo: issue.raised_by,
                assigned_to: issue.raised_by,
                status: issue.status,
                discussion_notes: issue.discussion_notes,
                linked_solution_type: issue.linked_solution_type,
                type: 'issue'
            };
        });
        
        console.log('🔍 RocksPage - Final mapped issues:', mappedIssues.length, mappedIssues);
        return mappedIssues;
    };

    // Handlers
    const handleEdit = (rock, idx) => {
        setEditingRock({ ...rock, idx });
        setIsAddMode(false);
        setEditModalOpen(true);
    };

    const handleAdd = () => {
        setEditingRock({
            rock_name: '',
            assigned_to_name: '',
            smart_objective: '',
            tasks: []
        });
        setIsAddMode(true);
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedRock) => {
        try {
            if (isAddMode) {
                const rockData = transformRockToBackend(updatedRock);
                console.log('Creating rock with data:', rockData);
                const createdRock = await createRock({ rock: rockData, token }).unwrap();
                console.log('Rock created:', createdRock);

                const tasks = updatedRock.milestones ?
                    extractTasksFromMilestones(updatedRock.milestones) :
                    transformTasksToBackend(updatedRock.tasks || []);

                if (tasks.length > 0) {
                    console.log('Creating tasks for rock:', tasks);
                    const rockId = createdRock.rock_id || createdRock.id;
                    await createRockTasks({
                        rock_id: rockId,
                        tasks,
                        token
                    }).unwrap();
                }

                refetch();
            } else {
                const rockId = updatedRock.rock_id || updatedRock.id;
                console.log('Updating rock with ID:', rockId);
                const rockData = transformRockToBackend(updatedRock);
                console.log('Updating rock with data:', rockData);
                await updateRock({ rock_id: rockId, rock: rockData, token }).unwrap();

                try {
                    await deleteRockTasks({ rock_id: rockId, token }).unwrap();
                } catch (error) {
                    console.log('No existing tasks to delete or error deleting:', error);
                }

                const tasks = updatedRock.milestones ?
                    extractTasksFromMilestones(updatedRock.milestones) :
                    transformTasksToBackend(updatedRock.tasks || []);

                if (tasks.length > 0) {
                    console.log('Creating new tasks for rock:', tasks);
                    await createRockTasks({
                        rock_id: rockId,
                        tasks,
                        token
                    }).unwrap();
                }

                refetch();
            }

            setEditModalOpen(false);
            setEditingRock(null);
            setIsAddMode(false);
        } catch (error) {
            console.error('Error saving rock:', error);
            alert('Error saving rock: ' + (error?.data?.detail || error.message));
        }
    };

    const handleFinalSave = async () => {
        try {
            const quarter_id = getQuarterId();
            console.log('handleFinalSave - Using quarter ID:', quarter_id);
            if (quarter_id) {
                await updateQuarterStatus({ quarter_id, status: 1, token }).unwrap();
                console.log('Quarter status updated to published (1)');
                await new Promise(resolve => setTimeout(resolve, 500));
                navigate('/admin/meeting-summary');
            } else {
                console.error('No quarter ID available for final save');
                alert('Error: Quarter ID not found. Cannot save.');
            }
        } catch (error) {
            console.error('Error saving and navigating to meeting summary:', error);
            alert('Error publishing quarter: ' + (error?.data?.detail || error.message));
        }
    };

    const handleSaveAsDraft = async () => {
        try {
            const quarter_id = getQuarterId();
            console.log('handleSaveAsDraft - Using quarter ID:', quarter_id);
            if (quarter_id) {
                await updateQuarterStatus({ quarter_id, status: 0, token }).unwrap();
                console.log('Quarter status updated to draft (0)');
                alert('Quarter saved as draft successfully!');
            } else {
                console.error('No quarter ID available for saving as draft');
                alert('Error: Quarter ID not found. Cannot save as draft.');
            }
        } catch (error) {
            console.error('Error saving as draft:', error);
            alert('Error saving as draft: ' + (error?.data?.detail || error.message));
        }
    };

    // REMOVED: Add New dropdown handlers (no longer needed)

    const handleRockSelect = (rock) => {
        if (selectedRock && selectedRock.id === rock.id && isRockDetailOpen) {
            setIsRockDetailOpen(false);
            setSelectedRock(null);
        } else {
            setSelectedRock(rock);
            setIsRockDetailOpen(true);
        }
    };

    const handleCloseRockDetail = () => {
        setIsRockDetailOpen(false);
        setSelectedRock(null);
    };

    const handleEditRock = (rock, index) => {
        handleEdit(rock, index);
    };

    const handleDeleteRock = (rock, index) => {
        setDeleteIdx(index);
        setDeleteDialogOpen(true);
    };

    const handleEditTask = (task, index) => {
        console.log('Edit task:', task, 'at index:', index);
        // TODO: Implement actual task update logic
    };

    const handleDeleteTask = (task, index) => {
        console.log('Delete task:', task, 'at index:', index);
        // TODO: Implement actual task deletion logic
    };

    const handleAddTask = (task) => {
        console.log('Add new task:', task);
        // TODO: Implement actual task creation logic
    };

    const handleEditIssue = (issue, index) => {
        console.log('Edit issue:', issue, 'at index:', index);
        // TODO: Implement actual issue update logic
    };

    const handleDeleteIssue = (issue, index) => {
        console.log('Delete issue:', issue, 'at index:', index);
        // TODO: Implement actual issue deletion logic
    };

    const handleAddIssue = (issue) => {
        console.log('Add new issue:', issue);
        // TODO: Implement actual issue creation logic
    };

    // Only render for admin
    const role = localStorage.getItem('role');
    if (role === 'employee') return null;

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 px-4 pt-1 pl-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-600 mb-2">Loading Rocks...</div>
                        <div className="text-xs text-gray-500">
                            {location.state?.fromUpload ?
                                'Fetching generated rocks from backend processing...' :
                                'Fetching quarter data'
                            }
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (location.state?.fromUpload === true && (!rocks || rocks.length === 0) && !error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 px-4 pt-1 pl-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 mb-2">Processing Upload...</div>
                        <div className="text-xs text-gray-500 mb-3">
                            The backend is generating rocks and tasks from your upload.<br />
                            This may take a few moments.
                        </div>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-3">
                            Automatically checking for updates...
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (location.state?.fromUpload === false && (!rocks || rocks.length === 0) && !error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 px-4 pt-1 pl-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-green-600 mb-2">Quarter Created Successfully!</div>
                        <div className="text-xs text-gray-500 mb-3">
                            You can now start adding rocks and tasks for this quarter.
                        </div>
                        <div className="text-xs text-gray-400 mt-3">
                            Loading empty quarter...
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 px-8 pt-2 pl-2 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xl font-semibold text-red-600 mb-2">Error Loading Rocks</div>
                        <div className="text-sm text-gray-500 mb-4">{error?.data?.detail || error.message}</div>
                        <button
                            onClick={() => refetch()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!currentQuarterId) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 px-8 pt-2 pl-2 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xl font-semibold text-gray-600 mb-2">No Quarter Selected</div>
                        <div className="text-sm text-gray-500 mb-4">Please create a new quarter or select a draft</div>
                        <button
                            onClick={() => navigate('/employee-data-upload')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Create New Quarter
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <style>{scrollbarStyles}</style>
            <div className="min-h-screen bg-gray-50 px-4 pt-4 pl-1">
                <div className="flex items-center justify-between mb-4 w-full">
                    <div>
                        <h1 className="text-xl font-bold text-black">Quarter Summary</h1>
                        {(location.state?.selectedQuarter || quarterData) && (
                            <p className="text-gray-600 mt-0.5 text-sm">
                                {location.state?.selectedQuarter ?
                                    `${location.state.selectedQuarter.quarter} ${location.state.selectedQuarter.year} - ${location.state.selectedQuarter.title || 'Draft Quarter'}` :
                                    quarterData?.quarter ? `${quarterData.quarter} ${quarterData.year}` : ''
                                }
                            </p>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        {/* References dropdown */}
                        <div className="relative refs-dropdown">
                            <button
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md font-medium text-xs border border-indigo-200 hover:bg-indigo-200 transition-all duration-200 cursor-pointer"
                                onClick={() => setRefsDropdownOpen((v) => !v)}
                                type="button"
                            >
                                <AudioLines size={16} className="mr-1 text-indigo-400" />
                                References
                                <ChevronDown size={12} className={`ml-1 transition-transform duration-200 ${refsDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {refsDropdownOpen && (
                                <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[180px] max-w-xs max-h-60 overflow-y-auto py-2">
                                    {(Array.isArray(location.state?.references) && location.state.references.length > 0
                                        ? location.state.references
                                        : [
                                            'Q2-2025-Leadership-Call.mp3',
                                            'AllHands_March_Transcript.pdf',
                                            'Customer-Review-Call.wav',
                                            'Strategy-Session-Notes.txt'
                                        ]).map((ref, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center px-3 py-1 text-xs text-gray-700 hover:bg-indigo-50 cursor-pointer truncate max-w-[220px]"
                                            title={ref}
                                        >
                                            <Mic size={14} className="mr-2 text-indigo-400 flex-shrink-0" />
                                            <span className="truncate" style={{ maxWidth: 150 }}>{ref.length > 28 ? ref.slice(0, 25) + '...' : ref}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Only Save as Draft and Save buttons remain here */}
                        <div className="flex gap-3 items-center">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded-lg font-medium text-xs shadow flex items-center gap-1"
                                onClick={handleSaveAsDraft}
                            >
                                <FilePlus size={14} className="mr-1" />
                                Save as Draft
                            </button>
                            <button
                                className="bg-indigo-500 text-white rounded-md font-medium text-xs hover:bg-indigo-700 transition-colors shadow-none px-4 py-1.5 flex items-center gap-1"
                                onClick={handleFinalSave}
                            >
                                <Save size={14} className="mr-1" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full" style={{ marginBottom: '2.5rem' }}>
                    {/* Card Layout - All cards maintain width, smooth horizontal scroll */}
                    <div 
                        className={`relative w-full rounded-md transition-all duration-300 ease-out ${
                            isRockDetailOpen ? 'overflow-x-auto overflow-y-hidden custom-scrollbar' : 'overflow-hidden'
                        }`}
                        style={{ 
                            minHeight: 'calc(100vh - 200px)',
                            height: '70vh',
                            minHeight: 350,
                            maxHeight: '80vh'
                        }}
                    >
                        <div 
                            className="flex gap-6 transition-all duration-300 ease-out"
                            style={{ 
                                width: isRockDetailOpen ? 'max-content' : '100%',
                                minWidth: '100%',
                                height: '100%',
                            }}
                        >
                            {/* Rocks Card - Fixed width, detail slides out to right */}
                            <div 
                                className="flex-shrink-0"
                                style={{ 
                                    height: '100%',
                                    width: 'calc(33.333% - 16px)' // Always 1/3 width - never changes
                                }}
                            >
                                <RocksCard
                                    rocks={rocks}
                                    onEditRock={handleEditRock}
                                    onDeleteRock={handleDeleteRock}
                                    selectedRock={selectedRock}
                                    onRockSelect={handleRockSelect}
                                    onCloseRockDetail={handleCloseRockDetail}
                                    isRockDetailOpen={isRockDetailOpen}
                                    showEditDelete={true}
                                    isRocksPage={true} // Show add button in RocksPage
                                    onAddRock={handleAdd}
                                    style={{ height: '100%' }}
                                />
                            </div>

                            {/* To-Do List Card - Fixed width */}
                            <div 
                                className="flex-shrink-0"
                                style={{ 
                                    height: '100%',
                                    width: 'calc(33.333% - 16px)' // Always 1/3 width - never changes
                                }}
                            >
                                <TaskListCard
                                    ref={taskListRef}
                                    title="To-Do Items"
                                    type="task"
                                    items={getAllTasks()}
                                    onAddItem={handleAddTask}
                                    onEditItem={handleEditTask}
                                    onDeleteItem={handleDeleteTask}
                                    showEditDelete={true}
                                    isRocksPage={true} // Changed to true to enable proper modal behavior
                                    style={{ height: '100%' }}
                                    emptyMessage="No todos found"
                                    placeholder="Add new task..."
                                />
                            </div>

                            {/* Issues Card - Fixed width */}
                            <div 
                                className="flex-shrink-0"
                                style={{ 
                                    height: '100%',
                                    width: 'calc(33.333% - 16px)' // Always 1/3 width - never changes
                                }}
                            >
                                <TaskListCard
                                    ref={issueListRef}
                                    title="Issues"
                                    type="issue"
                                    items={getIssues()}
                                    onAddItem={handleAddIssue}
                                    onEditItem={handleEditIssue}
                                    onDeleteItem={handleDeleteIssue}
                                    showEditDelete={true}
                                    isRocksPage={true} // Changed to true to enable proper modal behavior
                                    style={{ height: '100%' }}
                                    emptyMessage="No issues reported"
                                    placeholder="Report new issue..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <EditRockModal
                    open={editModalOpen}
                    rock={editingRock}
                    onClose={() => { setEditModalOpen(false); setEditingRock(null); setIsAddMode(false); }}
                    onSave={handleSaveEdit}
                    title={isAddMode ? "Add a Rock" : "Edit Rock"}
                    currentRocks={rocks}
                    users={users}
                />
                {deleteDialogOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                        onClick={e => {
                            if (e.target === e.currentTarget) {
                                setDeleteDialogOpen(false);
                                setDeleteIdx(null);
                            }
                        }}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-xs flex flex-col items-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-sm font-bold text-gray-800 mb-2">Are you sure you want to delete this rock?</h2>
                            <div className="flex gap-2 mt-3">
                                <button
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded font-medium text-xs"
                                    onClick={() => { setDeleteDialogOpen(false); setDeleteIdx(null); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors px-3 py-1.5"
                                    onClick={async () => {
                                        try {
                                            const rockToDelete = rocks[deleteIdx];
                                            const rockId = rockToDelete.rock_id || rockToDelete.id;
                                            console.log('Deleting rock:', rockId);
                                            await deleteRock({ rock_id: rockId, token }).unwrap();
                                            refetch();
                                            setDeleteDialogOpen(false);
                                            setDeleteIdx(null);
                                        } catch (error) {
                                            console.error('Error deleting rock:', error);
                                            alert('Error deleting rock: ' + (error?.data?.detail || error.message));
                                        }
                                    }}
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RocksPage;