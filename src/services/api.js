
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Custom baseQuery to handle token expiration/lockout globally
const customBaseQuery = async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({ baseUrl: 'http://localhost:8000' });
    const result = await baseQuery(args, api, extraOptions);
    if (result?.error) {
        const status = result.error.status;
        // Check for 401 Unauthorized, 403 Forbidden, or lockout error message
        if (
            status === 401 ||
            status === 403 ||
            (typeof result.error.data === 'object' && (result.error.data?.detail?.toLowerCase().includes('token') || result.error.data?.detail?.toLowerCase().includes('lock')))
        ) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            // Redirect to login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    }
    return result;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: ({ username, password }) => ({
                url: '/auth/login',
                method: 'POST',
                body: new URLSearchParams({
                    username,
                    password,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }),
        }),
        uploadCsv: builder.mutation({
            query: ({ file, token }) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/upload', // Updated to new backend endpoint
                    method: 'POST',
                    body: formData,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),
        createQuarter: builder.mutation({
            query: ({ data, token }) => ({
                url: '/quarters',
                method: 'POST',
                body: data,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),
        uploadAudio: builder.mutation({
            query: ({ file, quarter_id, quarterWeeks, participants, token }) => {
                const formData = new FormData();
                formData.append('file', file);
                if (quarter_id) formData.append('id', quarter_id); // Backend expects 'id' not 'quarter_id'
                if (quarterWeeks) formData.append('quarterWeeks', quarterWeeks.toString());
                if (participants && Array.isArray(participants)) {
                    // Convert participant UUIDs to comma-separated string
                    formData.append('participants', participants.join(','));
                }
                
                // Debug logging
                console.log('Sending audio upload with:', {
                    file: file.name,
                    quarter_id,
                    quarterWeeks,
                    participants
                });
                
                return {
                    url: '/admin/upload-audio', // Correct backend endpoint with /admin prefix
                    method: 'POST',
                    body: formData,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),
        createUser: builder.mutation({
            query: ({ data, token }) => ({
                url: '/users',
                method: 'POST',
                body: data,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),
        getUsers: builder.query({
            query: ({ token, role } = {}) => {
                let url = '/users';
                if (role) url += `?role=${encodeURIComponent(role)}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),
        getCurrentUser: builder.query({
            query: ({ token } = {}) => ({
                url: '/users/me',
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        // Upload transcript endpoint
        uploadTranscript: builder.mutation({
            query: ({ file, token, quarterWeeks, quarter_id, participants }) => {
                const formData = new FormData();
                formData.append('file', file);
                if (quarterWeeks) formData.append('quarterWeeks', quarterWeeks.toString());
                if (quarter_id) formData.append('id', quarter_id); // Backend expects 'id' not 'quarter_id'
                if (participants && Array.isArray(participants)) {
                    // Convert participant UUIDs to comma-separated string
                    formData.append('participants', participants.join(','));
                }
                
                // Debug logging
                console.log('Sending transcript upload with:', {
                    file: file.name,
                    quarter_id,
                    quarterWeeks,
                    participants
                });
                
                return {
                    url: '/admin/upload-transcript', // Correct backend endpoint with /admin prefix
                    method: 'POST',
                    body: formData,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        // Get rocks and tasks for a quarter
        getQuarterWithRocksAndTasks: builder.query({
            query: ({ quarter_id, token, include_comments = false }) => {
                let url = `/quarters/${quarter_id}/all`;
                if (include_comments) url += '?include_comments=true';
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        // Get quarter details (including status)
        getQuarter: builder.query({
            query: ({ quarter_id, token }) => ({
                url: `/quarters/${quarter_id}`,
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        // Update quarter status
        updateQuarterStatus: builder.mutation({
            query: ({ quarter_id, status, token }) => ({
                url: `/quarters/${quarter_id}/status`,
                method: 'PUT',
                body: { status },
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        // Get quarters by status (for drafts)
        getQuartersByStatus: builder.query({
            query: ({ status, token }) => ({
                url: `/quarters/status/${status}`,
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        // Rock APIs
        createRock: builder.mutation({
            query: ({ rock, token }) => ({
                url: '/rocks',
                method: 'POST',
                body: rock,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        updateRock: builder.mutation({
            query: ({ rock_id, rock, token }) => ({
                url: `/rocks/${rock_id}`,
                method: 'PUT',
                body: rock,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        deleteRock: builder.mutation({
            query: ({ rock_id, token }) => ({
                url: `/rocks/${rock_id}`,
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        // Task APIs
        createRockTasks: builder.mutation({
            query: ({ rock_id, tasks, token }) => ({
                url: `/rocks/${rock_id}/tasks`,
                method: 'POST',
                body: tasks,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        updateRockTasks: builder.mutation({
            query: ({ rock_id, tasks, token }) => ({
                url: `/rocks/${rock_id}/tasks`,
                method: 'PUT',
                body: tasks,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        deleteRockTasks: builder.mutation({
            query: ({ rock_id, token }) => ({
                url: `/rocks/${rock_id}/tasks`,
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        // Update specific rock objective
        updateRockObjective: builder.mutation({
            query: ({ quarter_id, rock_id, smart_objective, token }) => ({
                url: `/rocks/quarter/${quarter_id}/smart-objective/${rock_id}`,
                method: 'PUT',
                body: { smart_objective },
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        // Bulk operations
        bulkCreateRocksAndTasks: builder.mutation({
            query: ({ rocks, tasks_by_rock, token }) => ({
                url: '/rocks/bulk',
                method: 'POST',
                body: { rocks, tasks_by_rock },
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        // Todos APIs
        getTodosByQuarter: builder.query({
            query: ({ quarter_id, token }) => ({
                url: `/quarters/${quarter_id}/todos`,
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        createTodo: builder.mutation({
            query: ({ todo, token }) => ({
                url: '/todos',
                method: 'POST',
                body: todo,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        updateTodo: builder.mutation({
            query: ({ todo_id, todo, token }) => ({
                url: `/todos/${todo_id}`,
                method: 'PUT',
                body: todo,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        deleteTodo: builder.mutation({
            query: ({ todo_id, token }) => ({
                url: `/todos/${todo_id}`,
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        getTodosByStatus: builder.query({
            query: ({ status, quarter_id, token }) => {
                let url = `/todos?status=${status}`;
                if (quarter_id) url += `&quarter_id=${quarter_id}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        getOverdueTodos: builder.query({
            query: ({ token }) => ({
                url: '/todos/overdue',
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        getTodosDueSoon: builder.query({
            query: ({ days = 7, token }) => ({
                url: `/todos/due-soon?days=${days}`,
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        getTodoStatistics: builder.query({
            query: ({ quarter_id, token }) => {
                let url = '/todos/statistics';
                if (quarter_id) url += `?quarter_id=${quarter_id}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        // Issues APIs
        getIssuesByQuarter: builder.query({
            query: ({ quarter_id, token }) => ({
                url: `/quarters/${quarter_id}/issues`,
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        createIssue: builder.mutation({
            query: ({ issue, token }) => ({
                url: '/issues',
                method: 'POST',
                body: issue,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        updateIssue: builder.mutation({
            query: ({ issue_id, issue, token }) => ({
                url: `/issues/${issue_id}`,
                method: 'PUT',
                body: issue,
                headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
            }),
        }),

        deleteIssue: builder.mutation({
            query: ({ issue_id, token }) => ({
                url: `/issues/${issue_id}`,
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),

        getIssuesByStatus: builder.query({
            query: ({ status, quarter_id, token }) => {
                let url = `/issues?status=${status}`;
                if (quarter_id) url += `&quarter_id=${quarter_id}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        getIssuesBySolutionType: builder.query({
            query: ({ solution_type, quarter_id, token }) => {
                let url = `/issues/solution-type/${solution_type}`;
                if (quarter_id) url += `?quarter_id=${quarter_id}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        searchIssues: builder.query({
            query: ({ query, quarter_id, token }) => {
                let url = `/issues/search?q=${encodeURIComponent(query)}`;
                if (quarter_id) url += `&quarter_id=${quarter_id}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        getIssueStatistics: builder.query({
            query: ({ quarter_id, token }) => {
                let url = '/issues/statistics';
                if (quarter_id) url += `?quarter_id=${quarter_id}`;
                return {
                    url,
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                };
            },
        }),

        // Get all quarters (for meetings dashboard)
        getAllQuarters: builder.query({
            query: ({ token }) => ({
                url: '/quarters',
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        }),
    }),
});

export const { 
    useLoginMutation, 
    useUploadCsvMutation, 
    useUploadAudioMutation, 
    useCreateQuarterMutation, 
    useCreateUserMutation, 
    useGetUsersQuery, 
    useGetCurrentUserQuery,
    useUploadTranscriptMutation, 
    useGetQuarterWithRocksAndTasksQuery, 
    useGetQuarterQuery,
    useUpdateQuarterStatusMutation, 
    useGetQuartersByStatusQuery,
    useGetAllQuartersQuery,
    // Rock APIs
    useCreateRockMutation,
    useUpdateRockMutation,
    useDeleteRockMutation,
    useCreateRockTasksMutation,
    useUpdateRockTasksMutation,
    useDeleteRockTasksMutation,
    useUpdateRockObjectiveMutation,
    useBulkCreateRocksAndTasksMutation,
    // Todo APIs
    useGetTodosByQuarterQuery,
    useCreateTodoMutation,
    useUpdateTodoMutation,
    useDeleteTodoMutation,
    useGetTodosByStatusQuery,
    useGetOverdueTodosQuery,
    useGetTodosDueSoonQuery,
    useGetTodoStatisticsQuery,
    // Issue APIs
    useGetIssuesByQuarterQuery,
    useCreateIssueMutation,
    useUpdateIssueMutation,
    useDeleteIssueMutation,
    useGetIssuesByStatusQuery,
    useGetIssuesBySolutionTypeQuery,
    useSearchIssuesQuery,
    useGetIssueStatisticsQuery
} = api;

