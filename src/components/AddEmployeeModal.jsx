import React, { useState } from "react";
import { Dialog, Button, TextField, MenuItem } from '@mui/material';
import { useCreateUserMutation } from '../services/api';

const AddEmployeeModal = ({ open, onClose, onSuccess }) => {
    const token = localStorage.getItem('token');
    const [createUser] = useCreateUserMutation();
    const [newEmployee, setNewEmployee] = useState({
        name: "",
        employeeCode: "",
        email: "",
        designation: "",
        role: "",
        responsibilities: [],
        password: ""
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const roleOptions = [
        { value: 'employee', label: 'Employee' },
        { value: 'admin', label: 'Admin' },
    ];

    const handleAddEmployee = async () => {
        setAddError("");
        if (newEmployee.name && newEmployee.employeeCode && newEmployee.email && newEmployee.designation && newEmployee.role && newEmployee.password) {
            setAddLoading(true);
            try {
                // Prepare user payload for backend
                const userPayload = {
                    employee_name: newEmployee.name,
                    employee_code: newEmployee.employeeCode,
                    employee_email: newEmployee.email,
                    employee_designation: newEmployee.designation,
                    employee_password: newEmployee.password,
                    employee_role: newEmployee.role,
                    employee_responsibilities: typeof newEmployee.responsibilities === 'string' ? newEmployee.responsibilities : newEmployee.responsibilities.join(' '),
                };
                await createUser({ data: userPayload, token }).unwrap();
                
                // Reset form
                setNewEmployee({ name: "", employeeCode: "", email: "", designation: "", role: "", responsibilities: [], password: "" });
                setAddError("");
                onClose();
                
                // Call success callback if provided
                if (onSuccess) {
                    onSuccess();
                }
            } catch (err) {
                let msg = err?.data?.detail;
                if (Array.isArray(msg)) {
                    msg = msg.map(e => e.msg).join('; ');
                } else if (typeof msg === 'object') {
                    msg = JSON.stringify(msg);
                }
                setAddError(msg || "Failed to add employee");
            }
            setAddLoading(false);
        }
    };

    const handleClose = () => {
        setNewEmployee({ name: "", employeeCode: "", email: "", designation: "", role: "", responsibilities: [], password: "" });
        setAddError("");
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    maxWidth: '480px',
                    minWidth: { xs: '320px', sm: '400px' },
                    borderRadius: 2,
                },
            }}
        >
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'white',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1e293b', margin: 0, letterSpacing: 0 }}>Add New Employee</h2>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#64748b', cursor: 'pointer', fontWeight: 500, lineHeight: 1 }} aria-label="Close">&times;</button>
                </div>
                <div style={{ width: '100%', flex: 1, overflow: 'auto', background: 'white', padding: '16px 20px', maxHeight: '500px' }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Employee Name"
                        fullWidth
                        variant="outlined"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                        sx={{ mb: 1.5 }}
                        size="small"
                    />
                    <TextField
                        margin="dense"
                        label="Employee Code"
                        fullWidth
                        variant="outlined"
                        value={newEmployee.employeeCode}
                        onChange={(e) => setNewEmployee({...newEmployee, employeeCode: e.target.value})}
                        sx={{ mb: 1.5 }}
                        size="small"
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        variant="outlined"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        sx={{ mb: 1.5 }}
                        size="small"
                    />
                    <TextField
                        margin="dense"
                        label="Designation"
                        fullWidth
                        variant="outlined"
                        value={newEmployee.designation}
                        onChange={e => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                        sx={{ mb: 1.5 }}
                        size="small"
                        placeholder="e.g. Software Engineer, HR Manager"
                    />
                    <TextField
                        margin="dense"
                        label="Role"
                        fullWidth
                        variant="outlined"
                        select
                        value={newEmployee.role}
                        onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        sx={{ mb: 1.5 }}
                        size="small"
                    >
                        {roleOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Responsibilities"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={typeof newEmployee.responsibilities === 'string' ? newEmployee.responsibilities : newEmployee.responsibilities.join(' ')}
                        onChange={e => setNewEmployee({ ...newEmployee, responsibilities: e.target.value })}
                        sx={{ mb: 1.5 }}
                        size="small"
                        placeholder="e.g. Leading marketing team, managing campaigns..."
                    />
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                        sx={{ mb: 1.5 }}
                        size="small"
                        placeholder="Set employee password"
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
                    <Button 
                        onClick={handleClose}
                        sx={{ color: '#6b7280', fontSize: '0.875rem' }}
                        disabled={addLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddEmployee}
                        variant="contained"
                        disabled={addLoading}
                        sx={{
                            backgroundColor: '#2563eb',
                            fontSize: '0.875rem',
                            '&:hover': { backgroundColor: '#1e40af' },
                        }}
                    >
                        {addLoading ? 'Adding...' : 'Add Employee'}
                    </Button>
                </div>
                {addError && <div style={{ color: 'red', marginTop: 6, padding: '0 20px 12px 20px', fontSize: '0.75rem' }}>{addError}</div>}
            </div>
        </Dialog>
    );
};

export default AddEmployeeModal;