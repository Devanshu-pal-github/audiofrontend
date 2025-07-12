
import React, { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { Calendar } from "lucide-react";
import { useLocation } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';

// Only show real employee data from database
const employees = [];

const columns = [
  { field: 'name', headerName: 'Employee Name', flex: 1, minWidth: 180, headerClassName: 'mui-header' },
  { field: 'empId', headerName: 'Employee ID', flex: 1, minWidth: 120, headerClassName: 'mui-header' },
  { field: 'role', headerName: 'Role', flex: 1, minWidth: 120, headerClassName: 'mui-header' },
  {
    field: 'tasks',
    headerName: 'Tasks',
    flex: 1,
    minWidth: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Button
        variant="contained"
        size="small"
        sx={{
          backgroundColor: '#2563eb',
          textTransform: 'none',
          borderRadius: '0.375rem',
          fontWeight: 500,
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#1e40af', boxShadow: 'none' },
        }}
      >
        View Tasks
      </Button>
    ),
    headerClassName: 'mui-header',
  },
];



const MeetingDetails = () => {
    const location = useLocation();
    const { title = "Product Strategy Review", date = "Feb 15, 2024", quarter = "Q1 2024" } = location.state || {};

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");

    const filteredRows = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch =
                emp.name.toLowerCase().includes(search.toLowerCase()) ||
                emp.empId.toLowerCase().includes(search.toLowerCase());
            const matchesRole = role === "" || emp.role === role;
            return matchesSearch && matchesRole;
        });
    }, [search, role]);

    return (
        <Layout>
            <div className="w-full mt-2">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-full">
                    <div>
                        <div className="font-semibold text-xl mb-1">{title}</div>
                        <div className="flex items-center text-gray-500 text-base">
                            <Calendar size={18} className="mr-2" />
                            <span>{date}</span>
                        </div>
                    </div>
                    <div>
                        <span className="px-4 py-1 rounded-md border border-gray-200 bg-gray-50 text-base font-medium text-gray-700">{quarter}</span>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-0 flex flex-col h-[60vh] md:h-[70vh] w-full max-w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-2 pt-4">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <select
                            className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="Marketing Manager">Marketing Manager</option>
                            <option value="Content Strategist">Content Strategist</option>
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Sales Executive">Sales Executive</option>
                            <option value="Account Manager">Account Manager</option>
                            <option value="Financial Analyst">Financial Analyst</option>
                            <option value="HR Specialist">HR Specialist</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-0">
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSize={8}
                            rowsPerPageOptions={[8]}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                fontFamily: 'inherit',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f9fafb',
                                    color: '#374151',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                },
                                '& .MuiDataGrid-cell': {
                                    color: '#374151',
                                    fontSize: '1rem',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: '#f1f5f9',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    backgroundColor: '#f9fafb',
                                },
                                '& .MuiButton-root': {
                                    boxShadow: 'none',
                                },
                            }}
                            autoHeight={false}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MeetingDetails;
