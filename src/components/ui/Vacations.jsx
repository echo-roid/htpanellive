import { Plus, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import filter from "../../assets/filter.png";
import dayjs from "dayjs";
import Addrequest from "./modals/Addrequest";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';

// API Service Functions
export const fetchLeaves = async ({ status, department, startDate, endDate } = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (status) queryParams.append("status", status);
    if (department) queryParams.append("department", department);
    if (startDate && endDate) {
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);
    }

    const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/all?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch leave records");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error("Error fetching leaves:", err);
    throw err;
  }
};

export const cancelLeave = async (leaveId) => {
  try {
    const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/${leaveId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Failed to cancel leave");
    }

    return await response.json();
  } catch (err) {
    console.error("Error canceling leave:", err);
    throw err;
  }
};

export default function EmployeeLeaveTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const user = useSelector((state) => state.auth.user);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user?.employee?.designation === "HR") {
        data = await fetchLeaves({ 
          startDate: "2025-01-01",
          endDate: "2025-12-01" 
        });
      } else {
        data = await fetchLeaves({ 
          department: user?.employee?.team_name 
        });
      }

      setLeaveData(data || []);
    } catch (err) {
      setError(err.message);
      setLeaveData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [user]);

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleCancelLeave = async (leaveId) => {
    try {
      await cancelLeave(leaveId);
      await fetchLeaveData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredLeaves = leaveData.filter(leave => {
    const matchesSearch = leave.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const currentItems = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Employee Leave Records</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search employees or leave types..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {user?.employee?.designation === "Manager" && 
            <Link to="/LeaveNotification" className="flex items-center justify-center">
              <img src={filter} alt="filter" className="bg-white w-10 h-10 rounded-lg p-2 shadow" />
            </Link>
          }
          
          <button 
            className="bg-[#3F8CFF] text-sm text-white rounded-lg px-4 py-2 flex items-center gap-1 shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Plus size={16} /> Add Request
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((emp) => (
                      <TableRow 
                        key={emp.id} 
                        employee={emp}
                        onView={handleViewDetails}
                        onCancel={handleCancelLeave}
                        getStatusBadge={getStatusBadge}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No leave records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}

      {isOpen && <Addrequest onClose={() => setIsOpen(false)} refreshData={fetchLeaveData} />}
      
      {showDetailsModal && selectedLeave && (
        <LeaveDetailsModal 
          leave={selectedLeave}
          onClose={() => setShowDetailsModal(false)}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
}

const TableRow = ({ employee, onView, onCancel, getStatusBadge }) => {
  const calculateDaysRequested = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') + 1;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {employee.employee_photo ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={employee.employee_photo}
                alt={employee.employee_name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {employee.employee_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {employee.employee_name || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">
              {employee.designation || 'No designation'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {employee.leave_type || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {dayjs(employee.start_date).format('MMM D, YYYY')} - {dayjs(employee.end_date).format('MMM D, YYYY')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {calculateDaysRequested(employee.start_date, employee.end_date)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getStatusBadge(employee.status)}>
          {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1) || 'Pending'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {employee.manager_photo ? (
            <img
              className="h-8 w-8 rounded-full mr-2 object-cover"
              src={employee.manager_photo}
              alt={employee.manager_name}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs text-gray-600">
                {employee.manager_name?.charAt(0) || 'M'}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {employee.manager_name || 'Not assigned'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onView(employee)}
          className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
        >
          <Eye className="w-4 h-4 mr-1" /> View
        </button>
        {/* {employee.status === 'pending' && (
          <button 
            onClick={() => onCancel(employee.id)}
            className="text-red-600 hover:text-red-900 flex items-center"
          >
            <X className="w-4 h-4 mr-1" /> Cancel
          </button>
        )} */}
      </td>
    </tr>
  );
};

const LeaveDetailsModal = ({ leave, onClose, getStatusBadge }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Leave Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {leave.employee_photo ? (
              <img
                src={leave.employee_photo}
                alt={leave.employee_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-medium">
                  {leave.employee_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{leave.employee_name}</h3>
              <p className="text-gray-600">{leave.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Leave Type</p>
              <p className="font-medium">{leave.leave_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={getStatusBadge(leave.status)}>
                {leave.status?.charAt(0).toUpperCase() + leave.status?.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{dayjs(leave.start_date).format('MMM D, YYYY')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{dayjs(leave.end_date).format('MMM D, YYYY')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Requested On</p>
              <p className="font-medium">{dayjs(leave.requested_at).format('MMM D, YYYY')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days</p>
              <p className="font-medium">
                {dayjs(leave.end_date).diff(dayjs(leave.start_date), 'day') + 1}
              </p>
            </div>
          </div>

          {leave.reason && (
            <div>
              <p className="text-sm text-gray-500">Reason</p>
              <p className="mt-1 p-3 bg-gray-50 rounded">{leave.reason}</p>
            </div>
          )}

          {leave.manager_comments && (
            <div>
              <p className="text-sm text-gray-500">Manager Comments</p>
              <p className="mt-1 p-3 bg-blue-50 rounded">{leave.manager_comments}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};