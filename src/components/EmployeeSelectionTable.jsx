import React, { useState, useMemo } from "react";
import { useGetUsersQuery } from '../services/api';
import AddEmployeeModal from './AddEmployeeModal';
import { Plus, Search } from 'lucide-react';




const EmployeeSelectionTable = ({ selectedEmployees, onSelectionChange, minimal = false }) => {
    const [search, setSearch] = useState("");
    const [designation, setDesignation] = useState("");
    const [openAddEmployeeModal, setOpenAddEmployeeModal] = useState(false);
    const token = localStorage.getItem('token');
    const { data: users, isLoading, error, refetch } = useGetUsersQuery({ token });

    // Map backend users to table format
    const employees = useMemo(() => {
        if (!users) return [];
        return users.map((u, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            empCode: u.employee_code || u.employee_id,
            name: u.employee_name,
            designation: u.employee_designation,
            responsibilities: u.employee_responsibilities || u.responsibilities || '',
            email: u.employee_email,
        }));
    }, [users]);

    const uniqueDesignations = useMemo(() => {
        return [...new Set(employees.map(emp => emp.designation).filter(Boolean))];
    }, [employees]);

    const filteredRows = useMemo(() => {
        return employees.filter(emp => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                emp.name.toLowerCase().includes(searchLower) ||
                emp.designation?.toLowerCase().includes(searchLower) ||
                emp.email?.toLowerCase().includes(searchLower) ||
                (!minimal && emp.empCode.toLowerCase().includes(searchLower));
            const matchesDesignation = designation === "" || emp.designation === designation;
            return matchesSearch && matchesDesignation;
        });
    }, [search, minimal, employees, designation]);

    // No roles now, so no uniqueRoles

// Instead of just ids, selectedEmployees will be array of { empCode, index } objects
const getEmpKey = (emp, idx) => ({ empCode: emp.empCode, index: idx });
const isSelected = (emp, idx) => selectedEmployees.some(sel => sel.empCode === emp.empCode && sel.index === idx);



    // Calculate dynamic maxHeight for the table wrapper
    const rowHeight = 40; // px, approx height per row (including padding)
    const maxVisibleRows = 7;
    const tableRows = filteredRows.length;
    const tableHeight = tableRows > maxVisibleRows ? rowHeight * maxVisibleRows : rowHeight * tableRows;

    return (
        <div className={`p-0 flex flex-col w-full max-w-full`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 px-4 pt-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-full md:w-80">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder={minimal ? "Search by name, designation, email..." : "Search by name, designation, email..."}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        />
                    </div>
                    <select
                        className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        value={designation}
                        onChange={e => setDesignation(e.target.value)}
                    >
                        <option value="">All Designations</option>
                        {uniqueDesignations.map(des => (
                            <option key={des} value={des}>{des}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setOpenAddEmployeeModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-1 text-xs font-medium transition-colors whitespace-nowrap"
                    >
                        <Plus size={14} />
                        Add Employee
                    </button>
                </div>
                <div className="text-xs text-gray-600">
                    {selectedEmployees.length} of {employees.length} employees selected
                </div>
            </div>
            <div
                className="flex-1 min-h-0 px-4 pb-4"
                style={{
                    overflowY: tableRows > maxVisibleRows ? 'auto' : 'visible',
                    maxHeight: tableRows > maxVisibleRows ? `${rowHeight * maxVisibleRows}px` : 'none',
                    height: tableRows > 0 && tableRows <= maxVisibleRows ? `${rowHeight * tableRows}px` : undefined,
                    transition: 'height 0.2s',
                }}
            >
                {isLoading ? (
                    <div className="py-6 text-center text-gray-400 text-sm">Loading users...</div>
                ) : error ? (
                    <div className="py-6 text-center text-red-500 text-sm">Failed to load users</div>
                ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                <input
                                    type="checkbox"
                                    checked={filteredRows.length > 0 && filteredRows.every((emp, idx) => isSelected(emp, idx))}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            // Select all filtered
                                            const newSelection = Array.from(new Set([
                                                ...selectedEmployees.map(sel => JSON.stringify(sel)),
                                                ...filteredRows.map((emp, idx) => JSON.stringify(getEmpKey(emp, idx)))
                                            ])).map(str => JSON.parse(str));
                                            onSelectionChange(newSelection);
                                        } else {
                                            // Deselect all filtered
                                            const newSelection = selectedEmployees.filter(sel => !filteredRows.some((emp, idx) => sel.empId === emp.empId && sel.index === idx));
                                            onSelectionChange(newSelection);
                                        }
                                    }}
                                />
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">S. No.</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee Code</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                        </tr>
                    </thead>
                    <tbody className=" divide-y divide-gray-200">
                        {filteredRows.map((emp, idx) => (
                            <tr key={emp.id} className={isSelected(emp, idx) ? "bg-blue-50" : ""}>
                                <td className="px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={isSelected(emp, idx)}
                                        onChange={e => {
                                            const empKey = getEmpKey(emp, idx);
                                            if (e.target.checked) {
                                                onSelectionChange([...selectedEmployees, empKey]);
                                            } else {
                                                onSelectionChange(selectedEmployees.filter(sel => !(sel.empCode === empKey.empCode && sel.index === empKey.index)));
                                            }
                                        }}
                                    />
                                </td>
                                <td className="px-3 py-2 font-medium text-gray-800 text-sm">{emp.sNo}</td>
                                <td className="px-3 py-2 text-sm">{emp.name}</td>
                                <td className="px-3 py-2 text-sm">{emp.empCode}</td>
                                <td className="px-3 py-2 text-sm">{emp.email}</td>
                                <td className="px-3 py-2 text-sm">{emp.designation}</td>
                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-3 py-6 text-center text-gray-400 text-sm">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>
            
            <AddEmployeeModal 
                open={openAddEmployeeModal} 
                onClose={() => setOpenAddEmployeeModal(false)} 
                onSuccess={refetch}
            />
        </div>
    );
};

// Utility to extract employee_id (UUID) from selectedEmployees for backend
export function getSelectedEmployeeUUIDs(selectedEmployees, users) {
    // selectedEmployees: [{ empCode, index }], users: [{ employee_code, employee_id, ... }]
    // Return array of employee_id (UUID string) for backend
    if (!Array.isArray(selectedEmployees) || !Array.isArray(users)) return [];
    return selectedEmployees.map(sel => {
        // Find the user in the users array by employee_code (not employee_id)
        const user = users.find(u => u.employee_code === sel.empCode);
        return user ? user.employee_id : null;
    }).filter(uuid => typeof uuid === 'string' && uuid.length > 0);
}

export default EmployeeSelectionTable;