import React, { useState, useEffect } from "react";
import { Edit, Trash2, Search, Filter, Plus, Calendar, CheckCircle, Clock, AlertCircle, Eye, EyeOff, ArrowUpDown, ChevronDown, X, MoreVertical, Pencil } from "lucide-react";
import * as api from "../../api/services";
import * as apiCo from "../../api/Companie";
import bookImage from "../../assets/book.png";
import { Link } from "react-router-dom";

const CLIENT_API_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api/companies";

// Masking utility functions
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  if (localPart.length <= 2) {
    return `${localPart[0]}****@${domain}`;
  }
  
  const visiblePart = localPart.slice(0, 2);
  const maskedPart = '*'.repeat(Math.max(localPart.length - 2, 4));
  return `${visiblePart}${maskedPart}@${domain}`;
};

const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length <= 4) {
    return 'XXXX-XXXX-XXXX';
  }
  
  const lastFour = digitsOnly.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
};

const maskText = (text, visibleChars = 2) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= visibleChars) return text;
  
  const visiblePart = text.slice(0, visibleChars);
  const maskedPart = '*'.repeat(Math.max(text.length - visibleChars, 4));
  return `${visiblePart}${maskedPart}`;
};

// Masked Display Component
const MaskedDisplay = ({ value, type = 'text', onUnmask, isMasked, onMask, visibleChars = 2 }) => {
  const getDisplayValue = () => {
    if (!isMasked) return value;
    
    switch (type) {
      case 'email':
        return maskEmail(value);
      case 'phone':
        return maskPhoneNumber(value);
      case 'text':
        return maskText(value, visibleChars);
      default:
        return value;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{getDisplayValue()}</span>
      <button
        type="button"
        onClick={isMasked ? onUnmask : onMask}
        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
        title={isMasked ? "Show original" : "Mask sensitive data"}
      >
        {isMasked ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
};

// Sort Dropdown Component
const SortDropdown = ({ sortConfig, onSortChange, onClose }) => {
  const sortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone' },
    { field: 'status', label: 'Status' },
    { field: 'createdAt', label: 'Date Created' }
  ];

  return (
    <div className="absolute right-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-20 p-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-xs">Sort By</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={14} />
        </button>
      </div>
      
      <select
        className="w-full border rounded px-2 py-1.5 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-red-500"
        value={sortConfig.field}
        onChange={(e) => onSortChange({ ...sortConfig, field: e.target.value })}
      >
        <option value="">Select Field</option>
        {sortOptions.map(option => (
          <option key={option.field} value={option.field}>
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="flex gap-2">
        <button
          className={`flex-1 px-2 py-1.5 text-xs rounded ${sortConfig.direction === 'asc' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => onSortChange({ ...sortConfig, direction: 'asc' })}
        >
          Ascending
        </button>
        <button
          className={`flex-1 px-2 py-1.5 text-xs rounded ${sortConfig.direction === 'desc' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => onSortChange({ ...sortConfig, direction: 'desc' })}
        >
          Descending
        </button>
      </div>
      
      {sortConfig.field && (
        <button
          className="w-full mt-2 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
          onClick={() => onSortChange({ field: '', direction: 'asc' })}
        >
          Clear Sort
        </button>
      )}
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ filters, onFilterChange, onClose, companiesList }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      status: '',
      company: '',
      dateRange: { start: '', end: '' }
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-1 w-72 bg-white border rounded-md shadow-lg z-20 p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-xs">Filter Contacts</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={14} />
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-1">Status</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
          value={localFilters.status}
          onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Company Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-1">Company</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
          value={localFilters.company}
          onChange={(e) => setLocalFilters({ ...localFilters, company: e.target.value })}
        >
          <option value="">All Companies</option>
          {companiesList.map((company, index) => (
            <option key={index} value={company}>{company}</option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-1">Date Range</label>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-1/2 border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            value={localFilters.dateRange.start}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              dateRange: { ...localFilters.dateRange, start: e.target.value }
            })}
            placeholder="Start Date"
          />
          <input
            type="date"
            className="w-1/2 border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            value={localFilters.dateRange.end}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              dateRange: { ...localFilters.dateRange, end: e.target.value }
            })}
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Task Management Component
const TaskManagementDrawer = ({
  isOpen,
  onClose,
  selectedContact,
  tasks,
  setTasks,
  taskFormData,
  setTaskFormData,
  editingTaskId,
  setEditingTaskId
}) => {
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...taskFormData,
      contactId: selectedContact.id,
      contactName: selectedContact.name
    };

    if (editingTaskId) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { ...task, ...taskData, id: editingTaskId, updatedAt: new Date().toISOString() }
          : task
      ));
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
    }

    resetTaskForm();
  };

  const handleEditTask = (task) => {
    setTaskFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo
    });
    setEditingTaskId(task.id);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: ""
    });
    setEditingTaskId(null);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border border-green-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle size={16} className="text-green-500" />;
      case "In Progress": return <Clock size={16} className="text-blue-500" />;
      case "Pending": return <AlertCircle size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-50 text-green-700 border border-green-200";
      case "In Progress": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Pending": return "bg-orange-50 text-orange-700 border border-orange-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (!isOpen || !selectedContact) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
      <div className="bg-white h-full w-full max-w-4xl p-6 overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-xl font-semibold">Task Management</h2>
            <p className="text-gray-600">Contact: {selectedContact.name}</p>
            <p className="text-sm text-gray-500">{selectedContact.email} • {selectedContact.phone}</p>
          </div>
          <button 
            onClick={() => {
              onClose();
              resetTaskForm();
            }} 
            className="text-gray-600 hover:text-black text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Add/Edit Task Form */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">
            {editingTaskId ? "Edit Task" : "Add New Task"}
          </h3>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-sm">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskFormData.title}
                  onChange={handleTaskInputChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-sm">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskFormData.dueDate}
                  onChange={handleTaskInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-sm">Description</label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                value={taskFormData.description}
                onChange={handleTaskInputChange}
                placeholder="Enter task description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-sm">Priority</label>
                <select
                  name="priority"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskFormData.priority}
                  onChange={handleTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-sm">Status</label>
                <select
                  name="status"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskFormData.status}
                  onChange={handleTaskInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-sm">Assigned To</label>
                <input
                  type="text"
                  name="assignedTo"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskFormData.assignedTo}
                  onChange={handleTaskInputChange}
                  placeholder="Assign to..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              {editingTaskId && (
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                {editingTaskId ? "Update Task" : "Add Task"}
              </button>
            </div>
          </form>
        </div>

        {/* Tasks List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Tasks ({tasks.length})</h3>
            <div className="flex gap-2 text-sm">
              <span className="text-gray-500">
                {tasks.filter(t => t.status === 'Completed').length} completed
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {tasks.filter(t => t.status === 'Pending').length} pending
              </span>
            </div>
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{task.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)} flex items-center gap-1`}>
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.assignedTo && (
                          <div>Assigned to: <span className="font-medium">{task.assignedTo}</span></div>
                        )}
                        <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleEditTask(task)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit Task"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm">Add a task to get started with task management</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Action Menu Dropdown Component
const ActionMenu = ({ contact, onEdit, onDelete, onTasks, isOpen, onToggle, onClose }) => {
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
        title="Actions"
      >
        <MoreVertical size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-30 py-1">
          <button
            onClick={() => {
              onEdit(contact);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
          
          <button
            onClick={() => {
              onDelete(contact.id);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
          
          <button
            onClick={() => {
              onTasks(contact);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
          >
            <Calendar size={12} />
            Tasks
          </button>
        </div>
      )}
    </div>
  );
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sorting and Filtering states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: '', direction: 'asc' });
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    dateRange: { start: '', end: '' }
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Action menu state
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companies: "",
    status: "Active"
  });
  const [editingId, setEditingId] = useState(null);
  
  // States for companies dropdown
  const [companiesList, setCompaniesList] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companyError, setCompanyError] = useState(null);

  // Task Management States
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    assignedTo: ""
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Masking states
  const [maskedFields, setMaskedFields] = useState({
    phone: true,
    email: true
  });

  const [maskedTableData, setMaskedTableData] = useState({});

  // Format companies data from API response
  const formatCompanies = (companies) => {
    if (Array.isArray(companies)) return companies;
    if (typeof companies === 'string') {
      return companies.split(',').map(c => c.trim()).filter(c => c);
    }
    return [];
  };

  // Fetch companies for dropdown
  const fetchCompaniesList = async () => {
    setLoadingCompanies(true);
    setCompanyError(null);
    try {
      const response = await fetch(CLIENT_API_URL);
      console.log(response,"run con")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const companyNames = result?.data?.companies?.map(company => company.name) || [];
      
      setCompaniesList(companyNames);
      setFilteredCompanies(companyNames);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanyError(err.message);
      setCompaniesList([]);
      setFilteredCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Filter companies based on search input
  useEffect(() => {
    if (companySearch) {
      const filtered = companiesList.filter(company => 
        company.toLowerCase().includes(companySearch.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companiesList);
    }
  }, [companySearch, companiesList]);

  // Handle company selection from dropdown
  const handleCompanySelect = (company) => {
    const currentCompanies = formData.companies 
      ? formData.companies.split(',').map(c => c.trim()).filter(c => c)
      : [];
    
    if (!currentCompanies.includes(company)) {
      const newCompanies = [...currentCompanies, company].join(', ');
      setFormData(prev => ({ ...prev, companies: newCompanies }));
    }
    
    setShowCompaniesDropdown(false);
    setCompanySearch("");
  };

  // Handle manual addition of company
  const handleAddManualCompany = () => {
    if (companySearch.trim()) {
      const currentCompanies = formData.companies 
        ? formData.companies.split(',').map(c => c.trim()).filter(c => c)
        : [];
      
      if (!currentCompanies.includes(companySearch)) {
        const newCompanies = [...currentCompanies, companySearch].join(', ');
        setFormData(prev => ({ ...prev, companies: newCompanies }));
      }
      
      setShowCompaniesDropdown(false);
      setCompanySearch("");
    }
  };

  // Handle manual company input
  const handleCompanyInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, companies: value }));
  };

  // Sorting function
  const sortContacts = (contactsToSort, field, direction) => {
    if (!field) return contactsToSort;

    return [...contactsToSort].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === 'companies') {
        aValue = formatCompanies(a.companies).join(', ');
        bValue = formatCompanies(b.companies).join(', ');
      }

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filtering function
  const filterContacts = (contactsToFilter) => {
    return contactsToFilter.filter(contact => {
      if (filters.status && contact.status !== filters.status) {
        return false;
      }

      if (filters.company) {
        const contactCompanies = formatCompanies(contact.companies);
        if (!contactCompanies.includes(filters.company)) {
          return false;
        }
      }

      if (filters.dateRange.start || filters.dateRange.end) {
        const contactDate = new Date(contact.createdAt || contact.updatedAt || Date.now());
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (contactDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (contactDate > endDate) return false;
        }
      }

      return true;
    });
  };

  // Search function
  const searchContacts = (contactsToSearch, query) => {
    if (!query.trim()) return contactsToSearch;

    const lowerQuery = query.toLowerCase();
    return contactsToSearch.filter(contact => 
      contact.name?.toLowerCase().includes(lowerQuery) ||
      contact.email?.toLowerCase().includes(lowerQuery) ||
      contact.phone?.toLowerCase().includes(lowerQuery) ||
      formatCompanies(contact.companies).some(company => 
        company.toLowerCase().includes(lowerQuery)
      )
    );
  };

  // Apply all transformations (search, filter, sort)
  const applyTransformations = (contactsList) => {
    let result = [...contactsList];

    result = searchContacts(result, searchQuery);
    result = filterContacts(result);
    result = sortContacts(result, sortConfig.field, sortConfig.direction);

    return result;
  };

  // Update filtered contacts whenever contacts, search, filters, or sort changes
  useEffect(() => {
    setFilteredContacts(applyTransformations(contacts));
    
    let count = 0;
    if (filters.status) count++;
    if (filters.company) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    setActiveFilterCount(count);
  }, [contacts, searchQuery, filters, sortConfig]);

  // Fetch contacts from API
  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.getContacts();
      const formattedContacts = data.contacts.map(contact => ({
        ...contact,
        companies: formatCompanies(contact.companies)
      }));
      setContacts(formattedContacts);
      
      const initialMaskedData = {};
      formattedContacts.forEach(contact => {
        initialMaskedData[contact.id] = {
          phone: true,
          email: true
        };
      });
      setMaskedTableData(initialMaskedData);
    } catch (err) {
      setError("Failed to load contacts. Please try again later.");
      console.error("Failed to fetch contacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Handle sort change
  const handleSortChange = (newSortConfig) => {
    setSortConfig(newSortConfig);
    setShowSortDropdown(false);
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      status: '',
      company: '',
      dateRange: { start: '', end: '' }
    });
    setSortConfig({ field: '', direction: 'asc' });
    setSearchQuery('');
  };

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Masking handlers for form
  const toggleMask = (field) => {
    setMaskedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Masking handlers for table
  const toggleTableMask = (contactId, field) => {
    setMaskedTableData(prev => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        [field]: !prev[contactId]?.[field]
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const companiesArray = formData.companies
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

      const contactData = {
        ...formData,
        companies: companiesArray
      };

      if (editingId) {
        await api.updateContact(editingId, contactData);
      } else {
        await api.createContact(contactData);
      }

      await fetchContacts();
      setIsDrawerOpen(false);
      resetForm();
    } catch (err) {
      setError("Failed to save contact. Please check your data and try again.");
      console.error("Failed to save contact:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit contact
  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      companies: contact.companies.join(", "),
      status: contact.status
    });
    setEditingId(contact.id);
    setIsDrawerOpen(true);
  };

  // Delete contact
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.deleteContact(id);
      await fetchContacts();
    } catch (err) {
      setError("Failed to delete contact. Please try again.");
      console.error("Failed to delete contact:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Task Management Functions
  const handleOpenTasks = (contact) => {
    setSelectedContact(contact);
    const mockTasks = [
      {
        id: 1,
        title: "Follow up on inquiry",
        description: "Contact regarding their recent inquiry about services",
        dueDate: "2024-01-18",
        priority: "High",
        status: "Pending",
        assignedTo: "Sales Team",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Schedule meeting",
        description: "Arrange a product demonstration meeting",
        dueDate: "2024-01-22",
        priority: "Medium",
        status: "In Progress",
        assignedTo: "Account Manager",
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "Send follow-up email",
        description: "Send additional information about our services",
        dueDate: "2024-01-15",
        priority: "Low",
        status: "Completed",
        assignedTo: "Marketing Team",
        createdAt: new Date().toISOString()
      }
    ];
    setTasks(mockTasks);
    setIsTaskDrawerOpen(true);
  };

  const closeTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setSelectedContact(null);
    setTaskFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: ""
    });
    setEditingTaskId(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      companies: "",
      status: "Active"
    });
    setEditingId(null);
    setCompanySearch("");
    setShowCompaniesDropdown(false);
    setMaskedFields({
      phone: true,
      email: true
    });
  };

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  async function createEmptyCompanies(val) {
    const obj = {
      clientName: val,
      email: "-",
      panNumber: "-",
      address: "-",
      pinCode: "-",
      state: "",
      clientType: "Individual",
      contactPerson: "-",
      contactNumber: "-",
      cinNumber: "-",
      website: "-",
      industryType: "-",
      businessType: "-",
      contracts: "-",
      relationManager: "-",
      client_code: "-",
      status: "Active"
    };

    await apiCo.createCompany(obj);
  }

  // Action menu handlers
  const toggleActionMenu = (contactId) => {
    setOpenActionMenuId(openActionMenuId === contactId ? null : contactId);
  };

  const closeActionMenu = () => {
    setOpenActionMenuId(null);
  };

  return (
    <>
      <div className="p-4 rounded-md">
        <div className='flex justify-between align-center'>
          <h6 className='!font-bold text-[22px] mb-5'>Contacts Page</h6>
          <p className='mb-0 text-[10px] flex gap-1'>
            <img src={bookImage} className='mt-0 w-[15px] h-[15px]' alt="book" />
            Learn More About The Contacts
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 text-[10px]">
            {error}
          </div>
        )}

        {/* Search and action bar */}
        <div className="flex justify-between items-center mb-1 h-7">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center w-1/3 h-6">
            <input
              type="text"
              placeholder="Search contacts..."
              className="border rounded-l px-2 text-[10px] h-6 w-full leading-none focus:outline-none focus:ring-1 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gray-100 border border-l-0 rounded-r px-2 h-6 flex items-center justify-center"
              disabled={isLoading}
            >
              <Search size={12} />
            </button>
          </form>

          {/* Sort, Filter, and Actions */}
          <div className="flex items-center gap-1 h-6">
            {/* Active filters indicator */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2 bg-red-50 text-red-600 text-[10px] h-6 rounded hover:bg-red-100 transition-colors"
              >
                <X size={10} />
                Clear ({activeFilterCount})
              </button>
            )}

            {/* Sort Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className={`flex items-center gap-1 px-2 text-[10px] h-6 rounded transition-colors ${
                  sortConfig.field ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowUpDown size={10} />
                Sort
                {sortConfig.field && <ChevronDown size={10} />}
              </button>
              {showSortDropdown && (
                <SortDropdown
                  sortConfig={sortConfig}
                  onSortChange={handleSortChange}
                  onClose={() => setShowSortDropdown(false)}
                />
              )}
            </div>

            {/* Filter Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
                className={`flex items-center gap-1 px-2 text-[10px] h-6 rounded transition-colors ${
                  activeFilterCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter size={10} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-white text-red-500 rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {showFilterDropdown && (
                <FilterDropdown
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClose={() => setShowFilterDropdown(false)}
                  companiesList={companiesList}
                />
              )}
            </div>

            <button
              className="bg-purple-100 text-purple-700 px-2 text-[10px] h-6 rounded font-medium"
              disabled={isLoading}
            >
              Manage Columns
            </button>

            <button
              className="bg-red-500 text-white px-2 text-[10px] h-6 rounded flex items-center gap-1"
              onClick={() => {
                resetForm();
                setIsDrawerOpen(true);
              }}
              disabled={isLoading}
            >
              <Plus size={10} /> Add Contact
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-2 text-[9px] text-gray-600">
          Showing {filteredContacts.length} of {contacts.length} contacts
          {searchQuery && ` (filtered from search: "${searchQuery}")`}
          {activeFilterCount > 0 && ` (${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''})`}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-4 text-center text-gray-500 text-[10px]">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading contacts...
            </div>
          </div>
        )}

        {/* Contacts table */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] text-left leading-none border-collapse border">
              <thead className="bg-gray-100">
                <tr className="h-6">
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">SR.NO</th>
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">Name</th>
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">Phone</th>
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">Email</th>
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">Companies</th>
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">Status</th>
                  <th className="px-2 py-0.5 whitespace-nowrap h-6 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, i) => (
                    <tr key={contact.id} className="border-b hover:bg-gray-50 transition-colors h-6">
                      <td className="px-2 py-0.5 font-semibold whitespace-nowrap align-middle">
                        {i + 1}
                      </td>

                      <td className="px-2 py-0.5 font-semibold whitespace-nowrap align-middle">
                        <Link to="/InsideContactPage" className="text-blue-600 hover:underline">
                          {contact.name}
                        </Link>
                      </td>

                      <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                        {contact.phone ? (
                          <MaskedDisplay
                            value={contact.phone}
                            type="phone"
                            isMasked={maskedTableData[contact.id]?.phone ?? true}
                            onUnmask={() => toggleTableMask(contact.id, "phone")}
                            onMask={() => toggleTableMask(contact.id, "phone")}
                          />
                        ) : "-"}
                      </td>

                      <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                        {contact.email ? (
                          <MaskedDisplay
                            value={contact.email}
                            type="email"
                            isMasked={maskedTableData[contact.id]?.email ?? true}
                            onUnmask={() => toggleTableMask(contact.id, "email")}
                            onMask={() => toggleTableMask(contact.id, "email")}
                          />
                        ) : "-"}
                      </td>

                      <td className="px-2 py-0.5 whitespace-nowrap align-middle max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {formatCompanies(contact.companies).length > 0
                            ? formatCompanies(contact.companies).map((company, index) => (
                                <span
                                  key={index}
                                  className="px-1.5 py-[1px] bg-blue-100 text-blue-800 text-[8px] rounded-full leading-none"
                                >
                                  {company}
                                </span>
                              ))
                            : "-"}
                        </div>
                      </td>

                      <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                        <span
                          className={`px-1.5 py-[1px] rounded text-[8px] leading-none font-semibold text-white ${
                            contact.status === "Active"
                              ? "bg-green-500"
                              : contact.status === "Inactive"
                              ? "bg-gray-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>

                      <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                        <ActionMenu
                          contact={contact}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onTasks={handleOpenTasks}
                          isOpen={openActionMenuId === contact.id}
                          onToggle={() => toggleActionMenu(contact.id)}
                          onClose={closeActionMenu}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-2 py-6 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Search size={28} className="text-gray-300 mb-1" />
                        <p className="text-[10px] font-medium">No contacts found</p>
                        <p className="text-[9px]">
                          {searchQuery || activeFilterCount > 0 
                            ? "Try adjusting your search or filters" 
                            : "Add a new contact to get started"}
                        </p>
                        {(searchQuery || activeFilterCount > 0) && (
                          <button
                            onClick={clearAllFilters}
                            className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-[9px] rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Contact Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
          <div className="bg-white h-full w-full max-w-3xl p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Contact" : "Add New Contact"}
              </h2>
              <button 
                onClick={() => {
                  setIsDrawerOpen(false);
                  resetForm();
                }} 
                className="text-gray-600 hover:text-black text-2xl transition-colors"
                disabled={isLoading}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-sm">Name*</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block font-medium text-sm">Phone*</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      name="phone"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    {formData.phone && (
                      <button
                        type="button"
                        onClick={() => toggleMask('phone')}
                        className="mt-1 text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
                        title={maskedFields.phone ? "Show phone" : "Mask phone"}
                      >
                        {maskedFields.phone ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </div>
                  {formData.phone && (
                    <div className="mt-1 text-xs text-gray-600">
                      Preview: {maskedFields.phone ? maskPhoneNumber(formData.phone) : formData.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-sm">Email*</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      name="email"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    {formData.email && (
                      <button
                        type="button"
                        onClick={() => toggleMask('email')}
                        className="mt-1 text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
                        title={maskedFields.email ? "Show email" : "Mask email"}
                      >
                        {maskedFields.email ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </div>
                  {formData.email && (
                    <div className="mt-1 text-xs text-gray-600">
                      Preview: {maskedFields.email ? maskEmail(formData.email) : formData.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm">Companies* (comma separated)</label>
                <div className="relative">
                  <textarea
                    name="companies"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    value={formData.companies}
                    onChange={handleCompanyInputChange}
                    onFocus={() => {
                      setShowCompaniesDropdown(true);
                      if (companiesList.length === 0) {
                        fetchCompaniesList();
                      }
                    }}
                    required
                    disabled={isLoading}
                    placeholder="Company A, Company B, Company C"
                  />
                  
                  {/* Companies Dropdown */}
                  {showCompaniesDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search companies..."
                          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      {loadingCompanies && (
                        <div className="px-4 py-2 text-gray-500 text-sm">Loading companies...</div>
                      )}
                      
                      {companyError && (
                        <div className="px-4 py-2 text-red-500 text-sm">{companyError}</div>
                      )}
                      
                      {!loadingCompanies && !companyError && (
                        <>
                          {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm transition-colors"
                                onClick={() => handleCompanySelect(company)}
                              >
                                {company}
                              </div>
                            ))
                          ) : companySearch ? (
                            <div className="px-4 py-2 text-gray-500 text-sm">No companies found</div>
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">No companies available</div>
                          )}
                          
                          {companySearch && (
                            <div
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 bg-blue-50 border-t text-sm transition-colors font-medium text-blue-600"
                              onClick={()=>{
                                handleAddManualCompany();
                                createEmptyCompanies(companySearch);
                              }}
                            >
                              + Add "{companySearch}" as new company
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm">Status*</label>
                <select
                  name="status"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : editingId ? (
                    "Update Contact"
                  ) : (
                    "Create Contact"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Management Drawer */}
      <TaskManagementDrawer
        isOpen={isTaskDrawerOpen}
        onClose={closeTaskDrawer}
        selectedContact={selectedContact}
        tasks={tasks}
        setTasks={setTasks}
        taskFormData={taskFormData}
        setTaskFormData={setTaskFormData}
        editingTaskId={editingTaskId}
        setEditingTaskId={setEditingTaskId}
      />
    </>
  );
};

export default ContactsPage;