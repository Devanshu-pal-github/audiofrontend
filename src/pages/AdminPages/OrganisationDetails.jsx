import React, { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box } from '@mui/material';
import { Plus, Upload, Search, Filter } from "lucide-react";
import CsvUploadModal from "../../components/CsvUploadModal";
import AddEmployeeModal from "../../components/AddEmployeeModal";
import Papa from "papaparse";
import { useCreateUserMutation, useGetUsersQuery } from '../../services/api';

const columns = [
  { 
    field: 'sNo', 
    headerName: 'S. No.', 
    width: 70, 
    headerClassName: 'mui-header',
    cellClassName: 'mui-serial-cell',
  },
  { 
    field: 'name', 
    headerName: 'Employee Name', 
    flex: 1, 
    minWidth: 160, 
    headerClassName: 'mui-header',
    renderCell: (params) => (
      <span style={{ fontWeight: 500, color: '#111827' }}>{params.value}</span>
    ),
  },
  {
    field: 'employeeCode',
    headerName: 'Employee Code',
    flex: 0.8,
    minWidth: 110,
    headerClassName: 'mui-header',
    renderCell: (params) => {
      const id = params.value || '';
      return (
        <span style={{ 
          cursor: 'pointer', 
          fontWeight: 500, 
          letterSpacing: '0.5px',
          color: '#2563eb',
          fontSize: '0.8rem'
        }}>
          {id}
        </span>
      );
    },
  },
  { 
    field: 'email', 
    headerName: 'Email', 
    flex: 1.2, 
    minWidth: 160, 
    headerClassName: 'mui-header',
    renderCell: (params) => (
      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{params.value}</span>
    ),
  },
  {
    field: 'designation',
    headerName: 'Designation',
    flex: 1,
    minWidth: 140,
    headerClassName: 'mui-header',
    renderCell: (params) => {
      const designation = params.value;
      return (
        <Chip 
          label={designation || ''} 
          size="small"
          sx={{
            backgroundColor: '#e0f2fe',
            color: '#0277bd',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
          }}
        />
      );
    }
  },
  {
    field: 'responsibilities',
    headerName: 'Responsibilities',
    flex: 1.5,
    minWidth: 200,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const value = Array.isArray(params.value) ? params.value.join(', ') : (params.value || '');
      const words = value.split(' ');
      const shortText = words.length > 6 ? words.slice(0, 6).join(' ') + '...' : value;
      return (
        <span 
          title={value} 
          style={{ 
            cursor: value.length > 0 ? 'pointer' : 'default', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            display: 'inline-block', 
            maxWidth: 180,
            color: '#6b7280',
            fontSize: '0.8rem'
          }}
        >
          {shortText}
        </span>
      );
    },
    headerClassName: 'mui-header',
  },
];

const OrganisationDetails = ({ isModal, onClose }) => {
    const token = localStorage.getItem('token');
    const { data: users, isLoading: usersLoading, error: usersError, refetch } = useGetUsersQuery({ token });
    console.log("Users data:", users);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [csvUploadOpen, setCsvUploadOpen] = useState(false);
    const [csvData, setCsvData] = useState(null);

    const employees = useMemo(() => {
        if (!users) return [];
        return users.map((u, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            name: u.employee_name,
            employeeCode: u.employee_code || u.employee_id,
            email: u.employee_email,
            designation: u.employee_designation,
            responsibilities: u.employee_responsibilities || u.responsibilities || '',
        }));
    }, [users]);

    // Filter by designation (not role)
    const filteredRows = useMemo(() => {
        const data = csvData || employees;
        return data.filter(emp => {
            const matchesSearch =
                emp.name.toLowerCase().includes(search.toLowerCase()) ||
                (emp.employeeCode && emp.employeeCode.toLowerCase().includes(search.toLowerCase())) ||
                (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
                (emp.roleDesignation && emp.roleDesignation.toLowerCase().includes(search.toLowerCase())) ||
                (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()));
            const matchesRole = role === "" || emp.designation === role;
            return matchesSearch && matchesRole;
        });
    }, [search, role, employees, csvData]);

    // Unique designations for dropdown
    const uniqueDesignations = [...new Set((csvData || employees).map(emp => emp.designation).filter(Boolean))];

    const content = (
        <>
            <div className={isModal ? "w-full" : "w-full mt-4"}>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Manage Your Organisation</h1>
                    <div className="text-sm text-gray-500">
                        {filteredRows.length} employee{filteredRows.length !== 1 ? 's' : ''}
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col w-full max-w-full" style={{ height: 'calc(100vh - 140px)', marginBottom: '50px' }}>
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-white"
                                />
                            </div>
                            <div className="relative">
                                <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    className="border border-gray-300 rounded-md pl-10 pr-8 py-2 w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-white appearance-none"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                >
                                    <option value="">All Designations</option>
                                    {uniqueDesignations.map(designationOption => (
                                        <option key={designationOption} value={designationOption}>{designationOption}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outlined"
                                onClick={() => setCsvUploadOpen(true)}
                                sx={{
                                    color: '#2563eb',
                                    borderColor: '#e5e7eb',
                                    textTransform: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: 500,
                                    fontSize: '0.8rem',
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: 'white',
                                    '&:hover': { 
                                        backgroundColor: '#f8fafc', 
                                        borderColor: '#2563eb',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    },
                                }}
                            >
                                <Upload size={16} /> Upload Organisation Structure
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => setOpenDialog(true)}
                                sx={{
                                    backgroundColor: '#2563eb',
                                    textTransform: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: 500,
                                    fontSize: '0.8rem',
                                    padding: '8px 16px',
                                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    '&:hover': { 
                                        backgroundColor: '#1e40af', 
                                        boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)' 
                                    },
                                }}
                            >
                                <Plus size={16} /> Add Employee
                            </Button>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            getRowHeight={() => 50}
                            sx={{
                                border: 'none',
                                fontFamily: 'inherit',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8fafc',
                                    color: '#374151',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    borderBottom: '2px solid #e5e7eb',
                                },
                                '& .MuiDataGrid-cell': {
                                    color: '#374151',
                                    fontSize: '0.8rem',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                                '& .mui-serial-cell': {
                                    color: '#111827',
                                    fontWeight: 600,
                                    justifyContent: 'center',
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid #f3f4f6',
                                    '&:hover': {
                                        backgroundColor: '#f8fafc',
                                    },
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    backgroundColor: '#f8fafc',
                                    borderTop: '1px solid #e5e7eb',
                                },
                                '& .MuiDataGrid-selectedRowCount': {
                                    fontSize: '0.8rem',
                                },
                                '& .MuiButton-root': {
                                    boxShadow: 'none',
                                    fontSize: '0.8rem',
                                },
                                '& .MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                },
                                '& .MuiDataGrid-columnHeader:focus': {
                                    outline: 'none',
                                },
                            }}
                            autoHeight={false}
                        />
                    </div>
                    
                    <CsvUploadModal 
                        open={csvUploadOpen} 
                        onClose={() => setCsvUploadOpen(false)}
                        onCsvFileSelected={csvResponse => {
                            // csvResponse is the backend response, e.g. { users_created: [...], ... }
                            if (csvResponse && Array.isArray(csvResponse.users_created)) {
                                // Map backend users_created to table format
                                const parsed = csvResponse.users_created.map((user, idx) => ({
                                    id: idx + 1,
                                    sNo: idx + 1,
                                    name: user.employee_name || user.name || '',
                                    employeeCode: user.employee_code || user.employeeCode || '',
                                    email: user.employee_email || user.email || '',
                                    designation: user.employee_designation || user.designation || '',
                                    responsibilities: user.employee_responsibilities || user.responsibilities || '',
                                }));
                                setCsvData(parsed);
                            }
                        }}
                    />
                </div>

                <AddEmployeeModal 
                    open={openDialog} upload
                    onClose={() => setOpenDialog(false)} 
                    onSuccess={refetch}
                />
            </div>
        </>
    );

    if (isModal) {
        return (
            <>
                {content}
            </>
        );
    }
    return (
        <Layout>{content}</Layout>
    );
};

export default OrganisationDetails;