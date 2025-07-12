import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, ChevronRight, ChevronDown } from "lucide-react";
import QuarterSelector from "../../components/QuarterSelector";
import TaskListCard from "../../components/TaskListCard";
import RocksCard from "../../components/RocksCard";
import { useGetQuarterWithRocksAndTasksQuery, useGetQuarterQuery, useGetQuartersByStatusQuery } from "../../services/api";
import { decodeJWT, getQuarterIdsFromToken, getLatestQuarterId } from "../../utils/jwt";

import Layout from "../../components/Layout";

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

// Transform backend tasks data to the format expected by MeetingSummary
const transformBackendDataToMeetingFormat = (quarterApiResponse, rocksData, tasksData, finalResponseData) => {
    console.log('🔍 transformBackendDataToMeetingFormat - Input parameters:');
    console.log('  - quarterApiResponse:', quarterApiResponse);
    console.log('  - rocksData:', rocksData);
    console.log('  - tasksData:', tasksData);
    console.log('  - finalResponseData:', finalResponseData);
    
    // Priority 1: Use quarter API response (includes rocks, todos, issues)
    if (quarterApiResponse) {
        console.log('🔍 Using quarterApiResponse for transformation');
        console.log('🔍 quarterApiResponse structure:', Object.keys(quarterApiResponse));
        console.log('🔍 quarterApiResponse.rocks exists:', !!quarterApiResponse.rocks);
        console.log('🔍 quarterApiResponse.todos exists:', !!quarterApiResponse.todos);
        console.log('🔍 quarterApiResponse.issues exists:', !!quarterApiResponse.issues);
        
        const rocks = quarterApiResponse.rocks || [];
        const todos = quarterApiResponse.todos || [];
        const issues = quarterApiResponse.issues || [];
        
        console.log('🔍 Extracted from quarterApiResponse:');
        console.log('  - rocks:', rocks.length, rocks);
        console.log('  - todos:', todos.length, todos);
        console.log('  - issues:', issues.length, issues);
        
        const rocksWithMilestones = rocks.map(rock => {
            const tasksByWeek = {};
            
            // Group this rock's tasks by week
            if (rock.tasks && Array.isArray(rock.tasks)) {
                rock.tasks.forEach(task => {
                    const week = `Week${task.week}`;
                    if (!tasksByWeek[week]) {
                        tasksByWeek[week] = [];
                    }
                    tasksByWeek[week].push({
                        title: task.task,
                        subtasks: task.sub_tasks || []
                    });
                });
            }

            // Convert to milestones array
            const milestones = Object.keys(tasksByWeek)
                .sort((a, b) => {
                    const nA = parseInt(a.replace(/\D/g, ""), 10);
                    const nB = parseInt(b.replace(/\D/g, ""), 10);
                    return nA - nB;
                })
                .map(week => ({
                    week: week,
                    tasks: tasksByWeek[week]
                }));

            return {
                rock_title: rock.rock_name,
                owner: rock.assigned_to_name,
                smart_objective: rock.smart_objective,
                milestones: milestones,
                review: { status: "Pending", comments: "" }
            };
        });

        const result = {
            session_summary: quarterApiResponse.session_summary || "Quarter planning session with detailed task breakdown",
            rocks: rocksWithMilestones,
            todos: todos,
            issues: issues
        };
        
        console.log('🔍 transformBackendDataToMeetingFormat - Final result:', result);
        return result;
    }

    // Priority 2: Use final_response.json as fallback
    if (finalResponseData && finalResponseData.rocks && finalResponseData.rocks.length > 0) {
        return {
            session_summary: finalResponseData.session_summary || "",
            rocks: finalResponseData.rocks.map(rock => ({
                rock_title: rock.rock_title,
                owner: rock.owner,
                smart_objective: rock.smart_objective,
                milestones: rock.weekly_tasks ? rock.weekly_tasks.map(weekData => ({
                    week: `Week${weekData.week}`,
                    tasks: weekData.tasks ? weekData.tasks.map(task => ({
                        title: task.task_title,
                        subtasks: task.sub_tasks || []
                    })) : []
                })) : [],
                review: rock.review || { status: "Pending", comments: "" }
            })),
            todos: [],
            issues: []
        };
    }

    // Priority 3: Use rocksData with nested tasks (fallback)
    if (rocksData && Array.isArray(rocksData) && rocksData.length > 0) {
        // Group tasks by rock and week
        const rocksWithMilestones = rocksData.map(rock => {
            const tasksByWeek = {};
            
            // Group this rock's tasks by week
            if (rock.tasks && Array.isArray(rock.tasks)) {
                rock.tasks.forEach(task => {
                    const week = `Week${task.week}`;
                    if (!tasksByWeek[week]) {
                        tasksByWeek[week] = [];
                    }
                    tasksByWeek[week].push({
                        title: task.task,
                        subtasks: task.sub_tasks || []
                    });
                });
            }

            // Convert to milestones array
            const milestones = Object.keys(tasksByWeek)
                .sort((a, b) => {
                    const nA = parseInt(a.replace(/\D/g, ""), 10);
                    const nB = parseInt(b.replace(/\D/g, ""), 10);
                    return nA - nB;
                })
                .map(week => ({
                    week: week,
                    tasks: tasksByWeek[week]
                }));

            return {
                rock_title: rock.rock_name,
                owner: rock.assigned_to_name,
                smart_objective: rock.smart_objective,
                milestones: milestones,
                review: { status: "Pending", comments: "" }
            };
        });

        return {
            session_summary: "Quarter planning session with detailed task breakdown",
            rocks: rocksWithMilestones,
            todos: [],
            issues: []
        };
    }

    // If no data found, return empty structure
    return { session_summary: "No session data available", rocks: [], todos: [], issues: [] };
};

const getAllWeeks = (rocks) => {
    const weekSet = new Set();
    rocks.forEach(rock => {
        if (rock.milestones && Array.isArray(rock.milestones)) {
            rock.milestones.forEach(m => weekSet.add(m.week));
        }
    });
    return Array.from(weekSet).sort((a, b) => {
        const nA = parseInt(a.replace(/\D/g, ""), 10);
        const nB = parseInt(b.replace(/\D/g, ""), 10);
        return nA - nB;
    });
};

const getUnionTasksByWeek = (rocks, week) => {
    const tasks = [];
    rocks.forEach(rock => {
        if (rock.milestones && Array.isArray(rock.milestones)) {
            const milestone = rock.milestones.find(m => m.week === week);
            if (milestone && milestone.tasks) {
                milestone.tasks.forEach(task => {
                    tasks.push({ 
                        task: task, 
                        rock: rock 
                    });
                });
            }
        }
    });
    return tasks;
};

const MeetingSummaryPage = () => {
    // Helper to format date as 'Monday, June 25, 2025'
    function formatLongDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    // --- ALL HOOKS MUST BE CALLED AT THE TOP LEVEL ---
    // React Router hooks
    const location = useLocation();
    const navigate = useNavigate();

    // Role-based redirect - protect admin route
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'employee') {
            navigate('/current-meeting-analysis', { replace: true });
        }
    }, [navigate]);
    
    // State hooks
    const [selectedQuarter, setSelectedQuarter] = useState("");
    const [globalSearch, setGlobalSearch] = useState("");
    const [allQuartersData, setAllQuartersData] = useState({}); // Store data for all quarters
    const [availableQuarters, setAvailableQuarters] = useState([]); // Store available quarter options
    const [selectedRock, setSelectedRock] = useState(null); // For expandable rock detail
    const [isRockDetailOpen, setIsRockDetailOpen] = useState(false); // Animation state
    
    // Get token once at the top level
    const token = localStorage.getItem('token');
    
    // Memoize quarter IDs and latest quarter ID to avoid recalculating
    const allQuarterIds = useMemo(() => getQuarterIdsFromToken(token), [token]);
    const latestQuarterId = useMemo(() => getLatestQuarterId(allQuarterIds), [allQuarterIds]);
    
    // Get quarter ID from token only, fallback to latest from token
    const currentQuarterId = latestQuarterId;
    // No longer using currentQuarterName/currentQuarterYear from localStorage
    // Provide a fallback static list for quarterOptions if needed
    const quarterOptions = useMemo(() => ["Q1 2025", "Q4 2024", "Q3 2024"], []);

    // Always call API hooks at the top level, but control them with skip parameter
    const { data: quarterDetails, isLoading: quarterLoading, error: quarterError } = useGetQuarterQuery({
        quarter_id: currentQuarterId || '',
        token
    }, {
        skip: !currentQuarterId || !token
    });

    // Calculate shouldFetchQuarterData but don't use it to conditionally call hooks
    const shouldFetchQuarterData = useMemo(() => {
        return quarterDetails && quarterDetails.status === 1;
    }, [quarterDetails]);

    // Always call the hook, but skip the query if conditions aren't met
    const { data: quarterData, isLoading, error, refetch } = useGetQuarterWithRocksAndTasksQuery({
        quarter_id: currentQuarterId || '',
        token,
        include_comments: false
    }, {
        skip: !currentQuarterId || !token || !shouldFetchQuarterData
    });

    // Fetch all published quarters (status = 1) for dropdown selection
    const { data: publishedQuarters } = useGetQuartersByStatusQuery({
        status: 1,
        token
    }, {
        skip: !token
    });

    // Get the quarter ID for the selected quarter from the data map
    const getSelectedQuarterId = () => {
        if (selectedQuarter && allQuartersData[selectedQuarter]) {
            return allQuartersData[selectedQuarter].quarterId;
        }
        return currentQuarterId;
    };

    const selectedQuarterId = getSelectedQuarterId();

    // NOTE: We now get todos and issues from the main quarter API response
    // No need for separate API calls since the /quarters/{quarter_id}/all endpoint includes them
    // const { data: todosData, isLoading: todosLoading } = useGetTodosByQuarterQuery({
    //     quarter_id: selectedQuarterId || '',
    //     token
    // }, {
    //     skip: !selectedQuarterId || !token
    // });

    // const { data: issuesData, isLoading: issuesLoading } = useGetIssuesByQuarterQuery({
    //     quarter_id: selectedQuarterId || '',
    //     token
    // }, {
    //     skip: !selectedQuarterId || !token
    // });

    // All useEffect hooks at the top level
    useEffect(() => {
        if (currentQuarterId && shouldFetchQuarterData && token) {
            refetch();
        }
    }, [currentQuarterId, shouldFetchQuarterData, refetch, token]);

    useEffect(() => {
        async function fetchAllQuartersData() {
            console.log('=== DEBUG TOKEN EXTRACTION ===');
            console.log('Token exists:', !!token);
            console.log('allQuarterIds:', allQuarterIds);
            console.log('publishedQuarters:', publishedQuarters);

            if (!token) {
                console.log('❌ No token found');
                setAllQuartersData({});
                setAvailableQuarters([]);
                return;
            }

            console.log('=== FETCHING DATA FOR ALL QUARTERS ===');
            
            const quarterDataMap = {};
            const quarterOptions = [];
            
            // Combine quarter IDs from token and published quarters
            const allQuarterSources = [];
            
            // Add quarters from token
            if (Array.isArray(allQuarterIds) && allQuarterIds.length > 0) {
                allQuarterSources.push(...allQuarterIds.map(id => ({ id, source: 'token' })));
            }
            
            // Add published quarters (status = 1)
            if (Array.isArray(publishedQuarters) && publishedQuarters.length > 0) {
                publishedQuarters.forEach(quarter => {
                    // Avoid duplicates by checking if quarter ID already exists
                    const existingQuarter = allQuarterSources.find(q => q.id === quarter.id);
                    if (!existingQuarter) {
                        allQuarterSources.push({ id: quarter.id, source: 'published', quarterDetails: quarter });
                    }
                });
            }
            
            console.log('Combined quarter sources:', allQuarterSources);

            if (allQuarterSources.length === 0) {
                console.log('❌ No quarters found from token or published quarters');
                setAllQuartersData({});
                setAvailableQuarters([]);
                return;
            }

            for (const quarterSource of allQuarterSources) {
                try {
                    console.log(`\n--- Fetching data for Quarter ID: ${quarterSource.id} (${quarterSource.source}) ---`);
                    
                    let quarterDetails;
                    
                    // Use existing quarter details if available from published quarters
                    if (quarterSource.quarterDetails) {
                        quarterDetails = quarterSource.quarterDetails;
                        console.log(`📊 Quarter ${quarterSource.id} - Using published quarter details:`, quarterDetails);
                    } else {
                        // Fetch quarter details
                        const quarterDetailsResponse = await fetch(`http://localhost:8000/quarters/${quarterSource.id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (!quarterDetailsResponse.ok) {
                            console.log(`❌ Quarter ${quarterSource.id} - Details ERROR:`, quarterDetailsResponse.status);
                            continue;
                        }
                        quarterDetails = await quarterDetailsResponse.json();
                        console.log(`📊 Quarter ${quarterSource.id} - Fetched details:`, quarterDetails);
                    }
                    
                    // Only show quarters with status = 1 (published)
                    if (quarterDetails.status !== 1) {
                        console.log(`⏭️ Quarter ${quarterSource.id} - Skipping (status: ${quarterDetails.status})`);
                        continue;
                    }
                    
                    const quarterDisplayName = `${quarterDetails.quarter} ${quarterDetails.year} - ${quarterDetails.title || quarterSource.id.slice(0, 8)}`;
                    const response = await fetch(`http://localhost:8000/quarters/${quarterSource.id}/all`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`✅ Quarter ${quarterSource.id} - SUCCESS:`, data);
                        quarterDataMap[quarterDisplayName] = {
                            quarterId: quarterSource.id,
                            quarterDetails,
                            data,
                            displayName: quarterDisplayName
                        };
                        quarterOptions.push(quarterDisplayName);
                        
                        // Log detailed breakdown for each quarter
                        console.log(`📊 Quarter "${quarterDisplayName}" data breakdown:`);
                        console.log(`  - Rocks: ${data.rocks?.length || 0}`);
                        console.log(`  - Todos: ${data.todos?.length || 0}`);
                        console.log(`  - Issues: ${data.issues?.length || 0}`);
                        console.log(`  - Total tasks: ${data.total_tasks || 0}`);
                        
                        if (data.rocks && Array.isArray(data.rocks)) {
                            console.log(`📋 Rocks count for Quarter ${quarterDisplayName}:`, data.rocks.length);
                            data.rocks.forEach((rock, index) => {
                                console.log(`  Rock ${index + 1}:`, rock.rock_name, `(${rock.assigned_to_name}) - ${rock.tasks?.length || 0} tasks`);
                            });
                        }
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.log(`❌ Quarter ${quarterSource.id} - ERROR:`, response.status, errorData);
                    }
                } catch (error) {
                    console.log(`❌ Quarter ${quarterSource.id} - FETCH ERROR:`, error.message);
                }
            }
            setAllQuartersData(quarterDataMap);
            setAvailableQuarters(quarterOptions);
            if (quarterOptions.length > 0 && !selectedQuarter) {
                setSelectedQuarter(quarterOptions[0]);
            }
            console.log('\n=== FINISHED FETCHING ALL QUARTERS DATA ===');
            console.log('Available quarters:', quarterOptions);
            console.log('Quarter data map:', quarterDataMap);
        }
        fetchAllQuartersData();
    }, [allQuarterIds, token, selectedQuarter, publishedQuarters]);

    // Set selected quarter to first available quarter if not already set
    useEffect(() => {
        if (
            availableQuarters.length > 0 &&
            (!selectedQuarter || !availableQuarters.includes(selectedQuarter))
        ) {
            setSelectedQuarter(availableQuarters[0]);
        }
    }, [availableQuarters, selectedQuarter]);

    // --- COMPUTED VALUES AND FUNCTIONS ---
    // Get backend data - prioritize selected quarter data, then API response, then navigation state, finally mock data
    const getBackendData = () => {
        // Priority 1: Use data from selected quarter if available
        if (selectedQuarter && allQuartersData[selectedQuarter]) {
            const selectedQuarterData = allQuartersData[selectedQuarter];
            console.log('Using selected quarter data:', selectedQuarter, selectedQuarterData.data);
            return transformBackendDataToMeetingFormat(
                selectedQuarterData.data, // Pass full quarter API response
                selectedQuarterData.data.rocks, 
                selectedQuarterData.data.tasks, 
                selectedQuarterData.data.final_response
            );
        }

        // Priority 2: Use fresh API data (fallback)
        if (quarterData && quarterData.rocks && quarterData.rocks.length > 0) {
            console.log('Using fresh API data:', quarterData);
            return transformBackendDataToMeetingFormat(quarterData, quarterData.rocks, null, null);
        }

        // Priority 3: Try to get data from navigation state (when coming from RocksPage save)
        if (location.state) {
            const { rocksData, tasksData, finalResponseData } = location.state;
            if (rocksData && rocksData.length > 0) {
                console.log('Using data from navigation:', { 
                    rocksDataExists: !!rocksData, 
                    rocksCount: rocksData?.length || 0,
                    finalResponseDataExists: !!finalResponseData 
                });
                
                return transformBackendDataToMeetingFormat(null, rocksData, tasksData, finalResponseData);
            }
        }

        // No data available
        console.log('No quarter data available');
        return {
            session_summary: "No data available",
            rocks: [],
            todos: [],
            issues: []
        };
    };

    const meetingData = getBackendData();
    
    // Debug logging to see what data we're getting
    console.log('🔍 MeetingSummary - meetingData:', meetingData);
    console.log('🔍 MeetingSummary - selectedQuarter:', selectedQuarter);
    console.log('🔍 MeetingSummary - allQuartersData:', allQuartersData);
    console.log('🔍 MeetingSummary - quarterData from API:', quarterData);
    
    // Use the transformed data - now includes todos and issues from quarter API
    const { session_summary = "", rocks = [], todos = [], issues = [] } = meetingData;
    
    console.log('🔍 MeetingSummary - Destructured data:');
    console.log('  - rocks:', rocks.length, rocks);
    console.log('  - todos:', todos.length, todos);
    console.log('  - issues:', issues.length, issues);

    // Handle quarter selection change
    const handleQuarterChange = (event) => {
        const newQuarter = event.target.value;
        console.log(`🔄 Quarter changed from "${selectedQuarter}" to "${newQuarter}"`);
        setSelectedQuarter(newQuarter);
        
        // Log the data for the selected quarter
        if (allQuartersData[newQuarter]) {
            const quarterData = allQuartersData[newQuarter].data;
            console.log(`📊 Data for selected quarter "${newQuarter}":`, quarterData);
            console.log(`📊 Quarter "${newQuarter}" summary:`);
            console.log(`  - Rocks: ${quarterData.rocks?.length || 0}`);
            console.log(`  - Todos: ${quarterData.todos?.length || 0}`);
            console.log(`  - Issues: ${quarterData.issues?.length || 0}`);
            console.log(`  - Total tasks: ${quarterData.total_tasks || 0}`);
        }
    };

    // Handle rock selection for detail view
    const handleRockSelect = (rock) => {
        setSelectedRock(rock);
        setIsRockDetailOpen(true);
    };

    const handleCloseRockDetail = () => {
        setIsRockDetailOpen(false);
        setTimeout(() => setSelectedRock(null), 300); // Wait for animation to complete
    };

    // Group tasks by week for selected rock
    const getTasksByWeekForRock = (rock) => {
        if (!rock || !rock.tasks) return [];
        
        const tasksByWeek = {};
        rock.tasks.forEach(task => {
            const week = `Week ${task.week}`;
            if (!tasksByWeek[week]) {
                tasksByWeek[week] = [];
            }
            tasksByWeek[week].push(task);
        });

        return Object.keys(tasksByWeek)
            .sort((a, b) => {
                const nA = parseInt(a.replace(/\D/g, ""), 10);
                const nB = parseInt(b.replace(/\D/g, ""), 10);
                return nA - nB;
            })
            .map(week => ({
                week,
                tasks: tasksByWeek[week]
            }));
    };

    // Get ONLY todos from main API response for To-Do card (NO rock tasks)
    const getAllTasks = () => {
        console.log('🔍 getAllTasks - Input data:');
        console.log('  - todos:', todos?.length || 0, todos);
        console.log('  - selectedQuarter:', selectedQuarter);
        console.log('  - selectedQuarterId:', selectedQuarterId);
        
        const allTasks = [];
        
        // Get raw quarter API response data to access original todos
        let rawQuarterData = null;
        
        // Get raw data from the appropriate source - ONLY for the selected quarter
        if (selectedQuarter && allQuartersData[selectedQuarter]) {
            rawQuarterData = allQuartersData[selectedQuarter].data;
            console.log('🔍 getAllTasks - Using selected quarter data:', selectedQuarter);
            console.log('🔍 getAllTasks - Selected quarter ID:', allQuartersData[selectedQuarter].quarterId);
        } else if (quarterData && (!selectedQuarter || selectedQuarterId === currentQuarterId)) {
            // Only use quarterData if no quarter is selected or if it matches the current quarter
            rawQuarterData = quarterData;
            console.log('🔍 getAllTasks - Using fresh quarterData for current quarter');
        } else {
            console.log('🔍 getAllTasks - No matching quarter data found for selectedQuarter:', selectedQuarter);
        }
        
        console.log('🔍 getAllTasks - rawQuarterData:', rawQuarterData);
        
        // ONLY add todos from raw quarter API response (NO rock tasks)
        if (rawQuarterData && rawQuarterData.todos && Array.isArray(rawQuarterData.todos)) {
            console.log('🔍 getAllTasks - Processing todos from rawQuarterData:', rawQuarterData.todos.length);
            rawQuarterData.todos.forEach((todo, todoIndex) => {
                console.log(`🔍 getAllTasks - Processing todo ${todoIndex + 1}:`, todo);
                allTasks.push({
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
                });
            });
        } else {
            console.log('🔍 getAllTasks - No todos found in rawQuarterData:', rawQuarterData?.todos);
        }
        
        console.log('🔍 getAllTasks - Final todos only:', allTasks.length, allTasks);
        
        // Sort todos by due_date
        return allTasks.sort((a, b) => {
            return new Date(a.due_date || 0) - new Date(b.due_date || 0);
        });
    };

    // Filter tasks based on search
    const getFilteredTasks = () => {
        const allTasks = getAllTasks();
        if (!globalSearch.trim()) return allTasks;
        
        const searchValue = globalSearch.toLowerCase();
        return allTasks.filter(task => {
            const taskText = task.task || task.title || '';
            const assignedTo = task.assignedTo || '';
            const rockName = task.rockName || '';
            const description = task.description || '';
            
            return taskText.toLowerCase().includes(searchValue) ||
                   assignedTo.toLowerCase().includes(searchValue) ||
                   rockName.toLowerCase().includes(searchValue) ||
                   description.toLowerCase().includes(searchValue);
        });
    };

    // Handler functions for adding items
    const handleAddTask = (newTask) => {
        console.log('Adding new task:', newTask);
        // TODO: Implement API call to add task
    };

    const handleAddIssue = (newIssue) => {
        console.log('Adding new issue:', newIssue);
        // TODO: Implement API call to add issue
    };

    const handleAddRock = (newRock) => {
        console.log('Adding new rock:', newRock);
        // TODO: Implement API call to add rock
    };

    // Get issues from main quarter API response (not separate API call)
    const getIssues = () => {
        console.log('🔍 getIssues - Input issues data:', issues?.length || 0, issues);
        console.log('🔍 getIssues - selectedQuarter:', selectedQuarter);
        
        // Get raw quarter data to access original issues
        let rawQuarterData = null;
        
        if (selectedQuarter && allQuartersData[selectedQuarter]) {
            rawQuarterData = allQuartersData[selectedQuarter].data;
            console.log('🔍 getIssues - Using selected quarter data:', selectedQuarter);
        } else if (quarterData && selectedQuarterId === currentQuarterId) {
            rawQuarterData = quarterData;
            console.log('🔍 getIssues - Using fresh quarterData for current quarter');
        }
        
        if (!rawQuarterData || !rawQuarterData.issues || !Array.isArray(rawQuarterData.issues)) {
            console.log('🔍 getIssues - No issues found in rawQuarterData:', rawQuarterData?.issues);
            return [];
        }
        
        console.log('🔍 getIssues - Processing issues from rawQuarterData:', rawQuarterData.issues.length);
        
        // Map issues to format expected by TaskListCard
        const mappedIssues = rawQuarterData.issues.map((issue, index) => {
            console.log(`🔍 getIssues - Processing issue ${index + 1}:`, issue);
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
        
        console.log('🔍 getIssues - Final mapped issues:', mappedIssues.length, mappedIssues);
        return mappedIssues;
    };

    // Get raw rocks data for RocksCard (not transformed)
    const getRawRocks = () => {
        console.log('🔍 getRawRocks - selectedQuarter:', selectedQuarter);
        
        // Get raw quarter data to access original rocks
        let rawQuarterData = null;
        
        if (selectedQuarter && allQuartersData[selectedQuarter]) {
            rawQuarterData = allQuartersData[selectedQuarter].data;
            console.log('🔍 getRawRocks - Using selected quarter data:', selectedQuarter);
        } else if (quarterData && (!selectedQuarter || selectedQuarterId === currentQuarterId)) {
            rawQuarterData = quarterData;
            console.log('🔍 getRawRocks - Using fresh quarterData for current quarter');
        } else {
            console.log('🔍 getRawRocks - No matching quarter data found for selectedQuarter:', selectedQuarter);
        }
        
        if (!rawQuarterData || !rawQuarterData.rocks || !Array.isArray(rawQuarterData.rocks)) {
            console.log('🔍 getRawRocks - No rocks found in rawQuarterData:', rawQuarterData?.rocks);
            return [];
        }
        
        console.log('🔍 getRawRocks - Found rocks:', rawQuarterData.rocks.length, rawQuarterData.rocks);
        return rawQuarterData.rocks;
    };

    // --- RENDER LOGIC ---
    // Show loading state - only check main API loading since todos/issues come from main API
    if (quarterLoading || isLoading) {
        return (
            <Layout>
                <div className="w-full mt-2 flex flex-col gap-3 px-0 py-6 sm:px-0 md:px-0 lg:px-0 xl:px-0">
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <div className="text-base font-semibold text-gray-600 mb-2">Loading Meeting Summary...</div>
                            <div className="text-xs text-gray-500">Fetching quarter data</div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error state for quarter details
    if (quarterError) {
        return (
            <Layout>
                <div className="w-full mt-2 flex flex-col gap-3 px-0 py-6 sm:px-0 md:px-0 lg:px-0 xl:px-0">
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <div className="text-base font-semibold text-red-600 mb-2">Quarter Not Found</div>
                            <div className="text-xs text-gray-500 mb-3">The selected quarter could not be found or you don't have access to it.</div>
                            <button 
                                onClick={() => navigate('/employee-data-upload')}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs"
                            >
                                Create New Quarter
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show access denied if quarter is not saved (status !== 1)
    if (quarterDetails && quarterDetails.status !== 1) {
        return (
            <Layout>
                <div className="w-full mt-2 flex flex-col gap-3 px-0 py-6 sm:px-0 md:px-0 lg:px-0 xl:px-0">
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <div className="text-base font-semibold text-yellow-600 mb-2">Quarter Not Published</div>
                            <div className="text-xs text-gray-500 mb-3">This quarter is still in draft mode. Only published quarters can be viewed here.</div>
                            <div className="flex gap-2 justify-center">
                                <button 
                                    onClick={() => navigate('/rocks')}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs"
                                >
                                    Edit Quarter
                                </button>
                                <button 
                                    onClick={() => navigate('/employee-data-upload')}
                                    className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-xs"
                                >
                                    Create New Quarter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error state
    if (error && !location.state) {
        return (
            <Layout>
                <div className="w-full mt-2 flex flex-col gap-3 px-0 py-6 sm:px-0 md:px-0 lg:px-0 xl:px-0">
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <div className="text-base font-semibold text-red-600 mb-2">Error Loading Data</div>
                            <div className="text-xs text-gray-500 mb-3">{error?.data?.detail || error.message}</div>
                            <button 
                                onClick={() => refetch()}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 mr-2 text-xs"
                            >
                                Retry
                            </button>
                            <button 
                                onClick={() => navigate('/employee-data-upload')}
                                className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-xs"
                            >
                                Create New Quarter
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
    <Layout>
        <style>{scrollbarStyles}</style>
        <div className="w-full h-full flex flex-col gap-2 px-0 py-4 sm:px-0 md:px-0 lg:px-0 xl:px-0" style={{ minHeight: 0, height: '100%' }}>
                {/* Meeting Header */}
                <div className="mb-1 w-full flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full mb-1">
                        <div className="flex flex-col">
                            <div className="text-xl font-bold text-black">Quarterly Planning Meeting</div>
                            <span className="text-gray-500 text-sm mt-0.5">{formatLongDate(new Date())}</span>
                        </div>
                        <div className="flex flex-row items-center gap-2 ml-auto">
                            
                            {/* <div className="text-xs text-gray-500 mr-2">
                                R:{getRawRocks().length} T:{getAllTasks().length} I:{getIssues().length}
                            </div> */}
                            <QuarterSelector
                                value={selectedQuarter}
                                onChange={handleQuarterChange}
                                options={availableQuarters.length > 0 ? availableQuarters : quarterOptions}
                                className="h-8 px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs font-normal"
                            />
                        </div>
                    </div>
                </div>

            {/* Quarter Summary Card - dynamic, scrollable after 5 bullets, shrinks if less */}
            <div className="w-full mb-2 flex-shrink-0">
                <div className="bg-white border border-gray-200 shadow rounded-lg py-2 px-3 flex flex-col gap-1">
                    <div className="text-base font-semibold text-black">Quarter Summary</div>
                    {/* Dynamic summary rendering */}
                    {(() => {
                        // Split session summary into bullet points (by line or by ". ")
                        let summaryBullets = [];
                        if (session_summary && typeof session_summary === 'string') {
                            summaryBullets = session_summary.split('\n').map(s => s.trim()).filter(Boolean);
                            if (summaryBullets.length <= 1) {
                                summaryBullets = session_summary.split('. ').map(s => s.trim()).filter(Boolean);
                            }
                        }
                        const summaryScrollable = summaryBullets.length > 5;
                        const summaryContainerClass = summaryScrollable
                            ? "max-h-[180px] overflow-y-auto min-h-0"
                            : "h-auto min-h-0";
                        return (
                            <div className={summaryContainerClass + " text-gray-700 text-sm transition-all duration-300"}>
                                {summaryBullets.length > 0 ? (
                                    <ul className="list-disc pl-4 mt-1 text-gray-600">
                                        {summaryBullets.map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No summary available.</p>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

                {/* Empty State Message */}
                {(!getRawRocks() || getRawRocks().length === 0) && !isLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 text-center">
                        <div className="text-blue-800">
                            <h3 className="text-base font-semibold mb-1">No Rocks Data Available</h3>
                            <p className="text-xs mb-2">
                                {!currentQuarterId 
                                    ? "No quarter selected. Please create a new quarter or select a draft."
                                    : "It looks like no quarter planning data has been uploaded yet. Upload your meeting data to see the weekly schedule and tasks."
                                }
                            </p>
                            <button
                                onClick={() => navigate('/employee-data-upload')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium transition-colors text-xs"
                            >
                                {!currentQuarterId ? 'Create New Quarter' : 'Upload Meeting Data'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Section - Show only if we have real data from database */}
                {(getRawRocks() && getRawRocks().length > 0) ? (
                    <>
                        {/* Search Bar */}
                        <div className="mb-3 w-full flex-shrink-0">
                            <div className="relative w-full max-w-md">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by name, rock or to do's.."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Card Layout - All cards maintain width, smooth horizontal scroll */}
                        <div 
                            className={`relative w-full flex-1 rounded-md transition-all duration-300 ease-out ${
                                isRockDetailOpen ? 'overflow-x-auto overflow-y-hidden custom-scrollbar' : 'overflow-hidden'
                            }`}
                            style={{ minHeight: 0 }}
                        >
                            <div 
                                className="flex gap-4 transition-all duration-300 ease-out"
                                style={{ 
                                    width: isRockDetailOpen ? 'max-content' : '100%',
                                    minWidth: '100%',
                                    height: '100%',
                                }}
                            >
                                {/* Rocks Card - Fixed width, detail slides out to right */}
                                <div 
                                    className="flex-shrink-0 flex"
                                    style={{ 
                                        height: '100%',
                                        width: 'calc(33.333% - 10.67px)' // Always 1/3 width - never changes
                                    }}
                                >
                                    <RocksCard
                                        rocks={getRawRocks()}
                                        onAddRock={handleAddRock}
                                        selectedRock={selectedRock}
                                        onRockSelect={handleRockSelect}
                                        onCloseRockDetail={handleCloseRockDetail}
                                        isRockDetailOpen={isRockDetailOpen}
                                    />
                                </div>

                                {/* To-Do List Card - Fixed width */}
                                <div 
                                    className="flex-shrink-0"
                                    style={{ 
                                        height: '100%',
                                        width: 'calc(33.333% - 10.67px)' // Always 1/3 width - never changes
                                    }}
                                >
                                    <TaskListCard
                                        title="To-Do List"
                                        items={getFilteredTasks()}
                                        type="task"
                                        onAddItem={handleAddTask}
                                        emptyMessage="No tasks found"
                                        placeholder="Add new task..."
                                    />
                                </div>

                                {/* Issues Card - Fixed width */}
                                <div 
                                    className="flex-shrink-0"
                                    style={{ 
                                        height: '100%',
                                        width: 'calc(33.333% - 10.67px)' // Always 1/3 width - never changes
                                    }}
                                >
                                    <TaskListCard
                                        title="Issues & IDS"
                                        items={getIssues()}
                                        type="issue"
                                        onAddItem={handleAddIssue}
                                        emptyMessage="No issues reported"
                                        placeholder="Report new issue..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rock Detail Sidebar is now managed inside RocksCard */}
                    </>
                ) : (
                    /* No Data Available Message */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                            <p className="text-gray-500 mb-4">There are no rocks, tasks, or issues for the selected quarter.</p>
                            <button
                                onClick={() => navigate('/employee-data-upload?method=recording')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Upload Meeting Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MeetingSummaryPage;