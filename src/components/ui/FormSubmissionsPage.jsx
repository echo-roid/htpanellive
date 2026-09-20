import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Image as ImageIcon, 
    X, 
    Download, 
    File, 
    DownloadCloud, 
    Upload, 
    GripVertical, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight,
    Filter,
    Search,
    SlidersHorizontal,
    AlertTriangle,
    Palette,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Plus,
    Send,
    Settings,
    // Book,
    Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Gestlist from "../ui/Gestlist"
import bookImage  from "../../assets/book.png"

// Task Management Component
const TaskManagementDrawer = ({
    isOpen,
    onClose,
    selectedSubmission,
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
            submissionId: selectedSubmission.id,
            submissionName: `Submission #${selectedSubmission.id}`
        };

        if (editingTaskId) {
            // Update existing task
            setTasks(tasks.map(task => 
                task.id === editingTaskId 
                    ? { ...task, ...taskData, id: editingTaskId, updatedAt: new Date().toISOString() }
                    : task
            ));
        } else {
            // Add new task
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

    if (!isOpen || !selectedSubmission) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
            <div className="bg-white h-full w-full max-w-4xl p-6 overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center border-b pb-3">
                    <div>
                        <h2 className="text-xl font-semibold">Task Management</h2>
                        <p className="text-gray-600">Submission: #{selectedSubmission.id}</p>
                        <p className="text-sm text-gray-500">
                            Created: {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                        </p>
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
                                <label className="block font-medium">Task Title *</label>
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
                                <label className="block font-medium">Due Date</label>
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
                            <label className="block font-medium">Description</label>
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
                                <label className="block font-medium">Priority</label>
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
                                <label className="block font-medium">Status</label>
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
                                <label className="block font-medium">Assigned To</label>
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
                        <div className="flex gap-2">
                            <span className="text-sm text-gray-500">
                                {tasks.filter(t => t.status === 'Completed').length} completed
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
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

const FormSubmissionsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fieldOrder, setFieldOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popupImage, setPopupImage] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    
    // Column management state
    const [columns, setColumns] = useState([]);
    const [isManagingColumns, setIsManagingColumns] = useState(false);
    const [dragItem, setDragItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    // Edit and Delete states
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Individual field editing state
    const [individualEditing, setIndividualEditing] = useState(null);
    const [individualEditValue, setIndividualEditValue] = useState('');

    // Task Management States
    const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [availableFilterFields, setAvailableFilterFields] = useState([]);

    // Duplicate detection state
    const [duplicateConfig, setDuplicateConfig] = useState({
        enabled: false,
        fields: [],
        duplicates: {},
        groupColors: {}
    });

     const [activeTab, setActiveTab] = useState(1);

      const [SelectedChoose, setSelectedChoose] = useState("guest");

  const tabs = [
    { id: 1, label: "FIRST TAB" },
    { id: 2, label: "SECOND TAB" },
    { id: 3, label: "THIRD TAB" },
  ];

  const [form, setForm] = useState({
    uniqueId: "",
    fullName: "",
    email: "",
    paxCount: 1,
    additionalPax: 0,
    amountPerPax: 0,
    totalAmount: 0,
    remarks: "",
  });

  


  // Proper Letter (Capitalize Each Word)

// Status and notes state
    const [statusFilter, setStatusFilter] = useState('all');

    // Status configuration
    const statusConfig = {
        'approved': {
            label: 'Approved',
            color: 'bg-green-100 text-green-800 border border-green-200',
            icon: <CheckCircle size={16} className="text-green-500" />
        },
        'rejected': {
            label: 'Rejected',
            color: 'bg-red-100 text-red-800 border border-red-200',
            icon: <X size={16} className="text-red-500" />
        },
        'pending': {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            icon: <Clock size={16} className="text-yellow-500" />
        }
    };

    const Throwme = () => {
        console.log(submissions, "dfgh");
        navigate('/QCPage', { state: { submissions } });
    };

    // Age categorization function
    const getAgeCategory = (dobString) => {
        if (!dobString || dobString === 'N/A') return 'N/A';
        
        try {
            const dob = new Date(dobString);
            const today = new Date();
            
            // Check if date is valid
            if (isNaN(dob.getTime())) return 'Invalid Date';
            
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            
            // Adjust age if birthday hasn't occurred this year
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            // Categorize age
            if (age < 2) return 'Infant';
            if (age >= 2 && age <= 12) return 'Child';
            return 'Adult';
        } catch (error) {
            console.error('Error calculating age:', error);
            return 'Invalid Date';
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    // Load column preferences from localStorage
    useEffect(() => {
        const savedColumns = localStorage.getItem(`formSubmissionsColumns_${id}`);
        if (savedColumns) {
            setColumns(JSON.parse(savedColumns));
        }
    }, [id]);

    // Save column preferences to localStorage whenever they change
    useEffect(() => {
        if (columns.length > 0) {
            localStorage.setItem(`formSubmissionsColumns_${id}`, JSON.stringify(columns));
        }
    }, [columns, id]);

    // Apply filters when submissions, filters, or search term change
    useEffect(() => {
        applyFilters();
    }, [submissions, filters, searchTerm, statusFilter]);

    // Detect duplicates when filtered submissions change
    useEffect(() => {
        if (duplicateConfig.enabled && duplicateConfig.fields.length > 0) {
            detectDuplicates();
        } else {
            setDuplicateConfig(prev => ({ ...prev, duplicates: {}, groupColors: {} }));
        }
    }, [filteredSubmissions, duplicateConfig.enabled, duplicateConfig.fields]);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${id}/submissions`);
            console.log('API Response:', res.data);
            
            if (res.data.success && res.data.submissions.length > 0) {
                const apiSubmissions = res.data.submissions;
                setSubmissions(apiSubmissions);
                setTotalItems(apiSubmissions.length);

                const firstSubmission = apiSubmissions[0];
                const fieldLabels = [];
                const fieldOrderArray = [];
                const initialColumns = [];
                const filterFields = [];

                // Add index column
                initialColumns.push({ id: 'index', label: '#', visible: true });

                // Add status column
                initialColumns.push({ 
                    id: 'status', 
                    label: 'QC Status', 
                    visible: true,
                    type: 'status'
                });

                firstSubmission.data.forEach(item => {
                    if (item.type === 'banner' || item.type === 'paragraph' || item.type === 'heading') {
                        return;
                    }

                    if (item.type === 'aadhar' || item.type === 'ocr-aadhar') {
                        const aadharFields = [
                            'Aadhar Number',
                            'First Name',
                            'Last Name',
                            'Date of Birth',
                            'Gender',
                            'Address',
                            'Aadhar Front',
                            'Aadhar Back'
                        ];
                        
                        fieldLabels.push(...aadharFields);
                        aadharFields.forEach(field => {
                            initialColumns.push({ 
                                id: `aadhar_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                                label: field, 
                                visible: true,
                                type: 'aadhar',
                                field_id: item.field_id,
                                subfield: field.toLowerCase().replace(/\s+/g, '_')
                            });
                            if (!['Aadhar Front', 'Aadhar Back'].includes(field)) {
                                filterFields.push({
                                    id: `aadhar_${field.replace(/\s+/g, '_').toLowerCase()}`,
                                    label: field,
                                    type: 'aadhar',
                                    field_id: item.field_id
                                });
                            }
                        });
                        fieldOrderArray.push({ type: 'aadhar', field_id: item.field_id });
                    } else if (item.type === 'passport' || item.type === 'ocr-password') {
                        const passportFields = [
                            'Passport Number', 
                            'First Name',
                            'Last Name',
                            'Nationality', 
                            'Date of Birth',
                            'Place of Birth',
                            'Date of Issue',
                            'Date of Expiry',
                            'Passport Front',
                            'Passport Back'
                        ];
                        
                        fieldLabels.push(...passportFields);
                        passportFields.forEach(field => {
                            initialColumns.push({ 
                                id: `passport_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                                label: field, 
                                visible: true,
                                type: 'passport',
                                field_id: item.field_id,
                                subfield: field.toLowerCase().replace(/\s+/g, '_')
                            });
                            if (!['Passport Front', 'Passport Back'].includes(field)) {
                                filterFields.push({
                                    id: `passport_${field.replace(/\s+/g, '_').toLowerCase()}`,
                                    label: field,
                                    type: 'passport',
                                    field_id: item.field_id
                                });
                            }
                        });
                        fieldOrderArray.push({ type: 'passport', field_id: item.field_id });
                    } else if (item.type === 'nearest-airport') {
                        const airportFields = [
                            'Airport Name',
                            'Airport Code', 
                            'Address',
                            'Distance (km)'
                        ];
                        
                        fieldLabels.push(...airportFields);
                        airportFields.forEach(field => {
                            initialColumns.push({ 
                                id: `airport_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                                label: field, 
                                visible: true,
                                type: 'nearest-airport',
                                field_id: item.field_id,
                                subfield: field.toLowerCase().replace(/\s+/g, '_')
                            });
                            filterFields.push({
                                id: `airport_${field.replace(/\s+/g, '_').toLowerCase()}`,
                                label: field,
                                type: 'nearest-airport',
                                field_id: item.field_id
                            });
                        });
                        fieldOrderArray.push({ type: 'nearest-airport', field_id: item.field_id });
                    } else if (item.type === 'address') {
                        const addressFields = [
                            'Street 1',
                            'Street 2',
                            'City',
                            'State',
                            'Postal Code'
                        ];
                        
                        fieldLabels.push(...addressFields);
                        addressFields.forEach(field => {
                            initialColumns.push({ 
                                id: `address_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                                label: field, 
                                visible: true,
                                type: 'address',
                                field_id: item.field_id,
                                subfield: field.toLowerCase().replace(/\s+/g, '_')
                            });
                            filterFields.push({
                                id: `address_${field.replace(/\s+/g, '_').toLowerCase()}`,
                                label: field,
                                type: 'address',
                                field_id: item.field_id
                            });
                        });
                        fieldOrderArray.push({ type: 'address', field_id: item.field_id });
                    } else {
                        const label = item.label || item.field_id || 'Field';
                        fieldLabels.push(label);
                        initialColumns.push({ 
                            id: item.field_id || `field_${label.replace(/\s+/g, '_').toLowerCase()}`,
                            label: label, 
                            visible: true,
                            type: item.type,
                            field_id: item.field_id
                        });
                        filterFields.push({
                            id: item.field_id || `field_${label.replace(/\s+/g, '_').toLowerCase()}`,
                            label: label,
                            type: item.type,
                            field_id: item.field_id
                        });
                        fieldOrderArray.push({ 
                            type: item.type, 
                            field_id: item.field_id,
                            label: label
                        });
                    }
                });

                // Add actions column
                initialColumns.push({ id: 'actions', label: 'Actions', visible: true });

                setHeaders(fieldLabels);
                setFieldOrder(fieldOrderArray);
                setAvailableFilterFields(filterFields);
                
                if (columns.length === 0) {
                    setColumns(initialColumns);
                }

                // Initialize duplicate detection with common fields
                const commonDuplicateFields = initialColumns
                    .filter(col => 
                        !['index', 'actions', 'status'].includes(col.id) && 
                        !col.label.includes('Front') && 
                        !col.label.includes('Back') &&
                        col.type !== 'file-upload'
                    )
                    .map(col => col.id)
                    .slice(0, 3); // Take first 3 fields as default

                setDuplicateConfig(prev => ({
                    ...prev,
                    fields: commonDuplicateFields
                }));
            } else {
                setSubmissions([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setSubmissions([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    // Task Management Functions
    const handleOpenTasks = (submission) => {
        setSelectedSubmission(submission);
        // Fetch tasks for this submission - in a real app, you'd make an API call here
        const mockTasks = [
            {
                id: 1,
                title: "Review submission data",
                description: "Verify the accuracy of the submitted information and check for completeness",
                dueDate: "2024-01-18",
                priority: "High",
                status: "Pending",
                assignedTo: "Quality Team",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Follow up on missing information",
                description: "Contact submitter for any incomplete or unclear data",
                dueDate: "2024-01-22",
                priority: "Medium",
                status: "In Progress",
                assignedTo: "Support Team",
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Process submission",
                description: "Enter submission data into the main system",
                dueDate: "2024-01-25",
                priority: "Low",
                status: "Completed",
                assignedTo: "Data Entry Team",
                createdAt: new Date().toISOString()
            }
        ];
        setTasks(mockTasks);
        setIsTaskDrawerOpen(true);
    };

    const closeTaskDrawer = () => {
        setIsTaskDrawerOpen(false);
        setSelectedSubmission(null);
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

    // Duplicate detection function
    const detectDuplicates = () => {
        if (!duplicateConfig.enabled || duplicateConfig.fields.length === 0) {
            setDuplicateConfig(prev => ({ ...prev, duplicates: {}, groupColors: {} }));
            return;
        }

        const duplicates = {};
        const groupColors = {};
        
        filteredSubmissions.forEach((submission, index) => {
            const key = duplicateConfig.fields.map(fieldId => {
                const column = columns.find(col => col.id === fieldId);
                if (!column) return '';
                
                const field = getFieldValue(submission, column);
                return getFieldValueForDuplicate(field, column);
            }).join('|');

            if (key && key !== '|') {
                if (!duplicates[key]) {
                    duplicates[key] = [];
                }
                duplicates[key].push(submission.id || index);
            }
        });

        // Filter out single entries (non-duplicates) and assign colors
        let colorIndex = 0;
        Object.keys(duplicates).forEach(key => {
            if (duplicates[key].length <= 1) {
                delete duplicates[key];
            } else {
                // Assign color to this duplicate group
                groupColors[key] = duplicateColors[colorIndex % duplicateColors.length];
                colorIndex++;
            }
        });

        setDuplicateConfig(prev => ({ 
            ...prev, 
            duplicates,
            groupColors 
        }));
    };

    // Predefined color palette for duplicate groups
    const duplicateColors = [
        '#fef3cd', // Light yellow
        '#d1ecf1', // Light blue
        '#d4edda', // Light green
        '#f8d7da', // Light red
        '#e2e3e5', // Light gray
        '#fff3cd', // Light amber
        '#d1e7ff', // Light sky blue
        '#d6f4d6', // Light mint
        '#fce5cd', // Light orange
        '#e9d8fd', // Light purple
        '#c6f6d5', // Light emerald
        '#fed7d7', // Light coral
        '#c6f6f6', // Light cyan
        '#fbb6ce', // Light pink
        '#ecc94b', // Light gold
    ];

    // Get field value for duplicate detection
    const getFieldValueForDuplicate = (field, column) => {
        if (!field) return '';
        
        const { type, value } = field;

        // Handle complex fields
        if (type === 'aadhar' || type === 'ocr-aadhar' || 
            type === 'passport' || type === 'ocr-password' ||
            type === 'nearest-airport' || type === 'address') {
            
            return getRawComplexFieldValue(field, column.label);
        }

        // Handle simple fields
        if (typeof value === 'object' && value !== null) {
            return value.value || value.selectedOption || 
                   (value.selectedOptions && value.selectedOptions.join(', ')) || 
                   '';
        }

        return value || '';
    };

    // Check if a row has duplicates and get its group info
    const getDuplicateGroupInfo = (submissionId) => {
        for (const [key, ids] of Object.entries(duplicateConfig.duplicates)) {
            if (ids.includes(submissionId)) {
                return {
                    isDuplicate: true,
                    groupKey: key,
                    color: duplicateConfig.groupColors[key],
                    count: ids.length
                };
            }
        }
        return { isDuplicate: false, groupKey: null, color: null, count: 0 };
    };

    // Toggle duplicate detection
    const toggleDuplicateDetection = () => {
        setDuplicateConfig(prev => ({
            ...prev,
            enabled: !prev.enabled
        }));
    };

    // Add/remove field from duplicate detection
    const toggleDuplicateField = (fieldId) => {
        setDuplicateConfig(prev => {
            const newFields = prev.fields.includes(fieldId)
                ? prev.fields.filter(f => f !== fieldId)
                : [...prev.fields, fieldId];
            
            return {
                ...prev,
                fields: newFields
            };
        });
    };

    // Filter functions
    const applyFilters = () => {
        let filtered = [...submissions];

        // Apply search term filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(submission => 
                submission.data.some(field => {
                    const value = getFieldDisplayValue(field);
                    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(submission => 
                (submission.status || submission.qc_status) === statusFilter
            );
        }

        // Apply column filters
        Object.keys(filters).forEach(columnId => {
            const filterValue = filters[columnId];
            if (filterValue && filterValue.trim()) {
                filtered = filtered.filter(submission => {
                    const column = columns.find(col => col.id === columnId);
                    if (!column) return true;

                    const field = getFieldValue(submission, column);
                    const value = getFieldDisplayValue(field);
                    
                    return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });

        setFilteredSubmissions(filtered);
        setTotalItems(filtered.length);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const getFieldDisplayValue = (field) => {
        if (!field || !field.value) return '';
        
        const { type, value } = field;

        if (type === 'aadhar' || type === 'ocr-aadhar' || 
            type === 'passport' || type === 'ocr-password' ||
            type === 'nearest-airport' || type === 'address') {
            // For complex fields, convert the entire object to string for searching
            return JSON.stringify(value);
        }

        if (typeof value === 'object' && value !== null) {
            return value.value || value.selectedOption || 
                   (value.selectedOptions && value.selectedOptions.join(', ')) || 
                   JSON.stringify(value);
        }

        return value || '';
    };

    const handleFilterChange = (columnId, value) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    const clearFilter = (columnId) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[columnId];
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setFilters({});
        setSearchTerm('');
        setStatusFilter('all');
    };

    const getActiveFilterCount = () => {
        let count = searchTerm.trim() ? 1 : 0;
        count += Object.values(filters).filter(value => value && value.trim()).length;
        if (statusFilter !== 'all') count += 1;
        return count;
    };

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = parseInt(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    // Delete submission function
    const deleteSubmission = async (submissionId) => {
        if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        setDeletingId(submissionId);
        try {
           const response = await axios.delete(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${submissionId}/submissionsRowDelete`);
            
            if (response.data.success) {
                setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
                setTotalItems(prev => prev - 1);
                alert('Submission deleted successfully');
                
                if (currentSubmissions.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            } else {
                alert('Failed to delete submission: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            alert('Error deleting submission: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeletingId(null);
        }
    };

    // Edit submission function
    const editSubmission = async (submissionId, fieldId, newValue, isIndividualField = false, subfield = null) => {
        setIsEditing(true);
        try {
            let payload = {
                fieldId,
                newValue
            };

            if (isIndividualField && subfield) {
                payload = {
                    fieldId,
                    subfield,
                    newValue
                };
            }

            const response = await axios.put(`https://tableware-dweeb-estate.ngrok-free.dev/api/submissions/${submissionId}/edit`, payload);

            if (response.data.success) {
                setSubmissions(prev => prev.map(sub => {
                    if (sub.id === submissionId) {
                        return {
                            ...sub,
                            data: sub.data.map(field => {
                                if (field.field_id === fieldId) {
                                    if (isIndividualField && subfield && field.value && typeof field.value === 'object') {
                                        return {
                                            ...field,
                                            value: {
                                                ...field.value,
                                                [subfield]: newValue
                                            }
                                        };
                                    } else {
                                        return { ...field, value: newValue };
                                    }
                                }
                                return field;
                            })
                        };
                    }
                    return sub;
                }));
                
                setEditingField(null);
                setEditValue('');
                setIndividualEditing(null);
                setIndividualEditValue('');
                alert('Field updated successfully');
            } else {
                alert('Failed to update field: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error updating submission:', error);
            alert('Error updating field: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsEditing(false);
        }
    };

    // Start editing a field
    const startEditing = (submissionId, fieldId, currentValue, fieldType = 'text') => {
        setEditingField({ submissionId, fieldId, fieldType });
        setEditValue(currentValue);
    };

    // Start individual field editing
    const startIndividualEditing = (submissionId, fieldId, subfield, currentValue, fieldType = 'text') => {
        setIndividualEditing({ submissionId, fieldId, subfield, fieldType });
        setIndividualEditValue(currentValue);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingField(null);
        setEditValue('');
        setIndividualEditing(null);
        setIndividualEditValue('');
    };

    // Save edited value
    const saveEdit = () => {
        if (editingField && editValue.trim() !== '') {
            editSubmission(editingField.submissionId, editingField.fieldId, editValue.trim());
        }
    };

    // Save individual field edit
    const saveIndividualEdit = () => {
        if (individualEditing && individualEditValue.trim() !== '') {
            editSubmission(
                individualEditing.submissionId, 
                individualEditing.fieldId, 
                individualEditValue.trim(), 
                true, 
                individualEditing.subfield
            );
        }
    };

    // Handle keyboard events
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (editingField) {
                saveEdit();
            } else if (individualEditing) {
                saveIndividualEdit();
            }
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    // Export to Excel function
    const exportToExcel = () => {
        if (filteredSubmissions.length === 0) {
            alert('No data to export');
            return;
        }

        const excelData = filteredSubmissions.map((submission, index) => {
            const rowData = {
                '#': index + 1,
                'QC Status': statusConfig[submission.status || submission.qc_status]?.label || 'Pending',
                'QC Notes': submission.qc_notes || submission.notes || '',
                'Reviewed By': submission.reviewed_by || 'Not reviewed',
                'Review Date': submission.qc_review_date ? new Date(submission.qc_review_date).toLocaleDateString() : 'Not reviewed'
            };

            fieldOrder.forEach((fieldInfo, idx) => {
                const field = getFieldValue(submission, fieldInfo);
                const header = headers[idx];
                rowData[header] = getFieldExportValue(field);
            });

            return rowData;
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Form Submissions');
        
        const fileName = `form-submissions-${id}-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Get field value for export
    const getFieldExportValue = (field) => {
        if (!field) return 'N/A';

        const { type, value } = field;

        if (type === 'file-upload') {
            let fileValue;
            if (typeof value === 'object' && value !== null) {
                fileValue = value.value || value;
            } else {
                fileValue = value;
            }
            
            if (!fileValue || fileValue === '') return 'N/A';
            
            const fileUrl = typeof fileValue === 'object' ? objectToString(fileValue) : fileValue;
            return isBlobUrl(fileUrl) ? 'File Uploaded' : 'File Available';
        }

        if (type === 'aadhar' || type === 'ocr-aadhar') {
            if (!value.aadharNumber) return 'N/A';
            return value.aadharNumber;
        }

        if (type === 'passport' || type === 'ocr-password') {
            if (!value.passportNumber) return 'N/A';
            return value.passportNumber;
        }

        if (type === 'nearest-airport') {
            if (!value.selectedAirport) return 'N/A';
            return value.selectedAirport;
        }

        if (type === 'address') {
            if (!value.street1 && !value.city && !value.state) return 'N/A';
            return `${value.street1 || ''} ${value.street2 || ''}, ${value.city || ''}, ${value.state || ''} ${value.postalCode || ''}`.trim();
        }

        let displayValue;
        if (typeof value === 'object' && value !== null) {
            displayValue = value.value !== undefined ? value.value : 
                         value.selectedOption !== undefined ? value.selectedOption :
                         value.selectedOptions !== undefined ? value.selectedOptions.join(', ') :
                         'N/A';
        } else {
            displayValue = value;
        }
        
        return displayValue || 'N/A';
    };

    // File import handler
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const importedSubmissions = jsonData.map((row, index) => {
                    const submissionData = [];
                    
                    fieldOrder.forEach((fieldInfo, idx) => {
                        const header = headers[idx];
                        const value = row[header] || 'N/A';
                        
                        let fieldValue;
                        if (fieldInfo.type === 'aadhar' || fieldInfo.type === 'ocr-aadhar') {
                            fieldValue = { 
                                aadharNumber: value !== 'N/A' ? value : '',
                                firstName: '',
                                lastName: ''
                            };
                        } else if (fieldInfo.type === 'passport' || fieldInfo.type === 'ocr-password') {
                            fieldValue = { 
                                passportNumber: value !== 'N/A' ? value : '',
                                firstName: '',
                                lastName: ''
                            };
                        } else if (fieldInfo.type === 'nearest-airport') {
                            fieldValue = { selectedAirport: value !== 'N/A' ? value : '' };
                        } else if (fieldInfo.type === 'address') {
                            fieldValue = { 
                                street1: value !== 'N/A' ? value : '',
                                city: '',
                                state: '',
                                postalCode: ''
                            };
                        } else {
                            fieldValue = { value: value !== 'N/A' ? value : '' };
                        }

                        submissionData.push({
                            type: fieldInfo.type,
                            label: fieldInfo.label || header,
                            value: fieldValue,
                            field_id: fieldInfo.field_id || `imported-${idx}`
                        });
                    });

                    return {
                        id: `imported-${index}`,
                        form_id: id,
                        lead_id: 0,
                        data: submissionData,
                        submitted_at: new Date().toISOString(),
                        client_name: 'Imported',
                        sales_person: 'Imported',
                        client_coordinator: 'Imported',
                        status: 'pending',
                        qc_status: 'pending'
                    };
                });

                setSubmissions(prev => [...prev, ...importedSubmissions]);
                setTotalItems(prev => prev + importedSubmissions.length);
                setShowImportModal(false);
                alert(`Successfully imported ${importedSubmissions.length} records`);
            } catch (error) {
                console.error('Error importing Excel file:', error);
                alert('Error importing Excel file. Please check the format.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Column management functions
    const toggleColumnVisibility = (columnId) => {
        setColumns(columns.map(column =>
            column.id === columnId ? { ...column, visible: !column.visible } : column
        ));
    };

    const handleDragStart = (e, index) => {
        setDragItem(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverItem(index);
    };

    const handleDrop = () => {
        if (dragItem === null || dragOverItem === null) return;
        
        const newColumns = [...columns];
        const draggedItem = newColumns[dragItem];
        newColumns.splice(dragItem, 1);
        newColumns.splice(dragOverItem, 0, draggedItem);
        
        setColumns(newColumns);
        setDragItem(null);
        setDragOverItem(null);
    };

    const resetColumns = () => {
        const initialColumns = [{ id: 'index', label: '#', visible: true }];
        
        // Add status column
        initialColumns.push({ 
            id: 'status', 
            label: 'QC Status', 
            visible: true,
            type: 'status'
        });

        fieldOrder.forEach(fieldInfo => {
            if (fieldInfo.type === 'aadhar' || fieldInfo.type === 'ocr-aadhar') {
                const aadharFields = [
                    'Aadhar Number',
                    'First Name',
                    'Last Name',
                    'Date of Birth',
                    'Gender',
                    'Address',
                    'Aadhar Front',
                    'Aadhar Back'
                ];
                
                aadharFields.forEach(field => {
                    initialColumns.push({ 
                        id: `aadhar_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                        label: field, 
                        visible: true,
                        type: 'aadhar',
                        field_id: fieldInfo.field_id,
                        subfield: field.toLowerCase().replace(/\s+/g, '_')
                    });
                });
            } else if (fieldInfo.type === 'passport' || fieldInfo.type === 'ocr-password') {
                const passportFields = [
                    'Passport Number', 
                    'First Name',
                    'Last Name',
                    'Nationality', 
                    'Date of Birth',
                    'Place of Birth',
                    'Date of Issue',
                    'Date of Expiry',
                    'Passport Front',
                    'Passport Back'
                ];
                
                passportFields.forEach(field => {
                    initialColumns.push({ 
                        id: `passport_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                        label: field, 
                        visible: true,
                        type: 'passport',
                        field_id: fieldInfo.field_id,
                        subfield: field.toLowerCase().replace(/\s+/g, '_')
                    });
                });
            } else if (fieldInfo.type === 'nearest-airport') {
                const airportFields = [
                    'Airport Name',
                    'Airport Code',
                    'Address',
                    'Distance (km)'
                ];
                
                airportFields.forEach(field => {
                    initialColumns.push({ 
                        id: `airport_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                        label: field, 
                        visible: true,
                        type: 'nearest-airport',
                        field_id: fieldInfo.field_id,
                        subfield: field.toLowerCase().replace(/\s+/g, '_')
                    });
                });
            } else if (fieldInfo.type === 'address') {
                const addressFields = [
                    'Street 1',
                    'Street 2',
                    'City',
                    'State',
                    'Postal Code'
                ];
                
                addressFields.forEach(field => {
                    initialColumns.push({ 
                        id: `address_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                        label: field, 
                        visible: true,
                        type: 'address',
                        field_id: fieldInfo.field_id,
                        subfield: field.toLowerCase().replace(/\s+/g, '_')
                    });
                });
            } else {
                initialColumns.push({ 
                    id: fieldInfo.field_id || `field_${fieldInfo.label.replace(/\s+/g, '_').toLowerCase()}`,
                    label: fieldInfo.label, 
                    visible: true,
                    type: fieldInfo.type,
                    field_id: fieldInfo.field_id
                });
            }
        });

        initialColumns.push({ id: 'actions', label: 'Actions', visible: true });

        setColumns(initialColumns);
    };

    const getFieldValue = (submission, fieldInfo) => {
        return submission.data.find(f => f.field_id === fieldInfo.field_id);
    };

    const isBlobUrl = (url) => {
        return url && typeof url === 'string' && url.startsWith('blob:');
    };

    const objectToString = (obj) => {
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'object' && obj !== null) {
            if (obj.url) return obj.url;
            const keys = Object.keys(obj).filter(key => !isNaN(key)).sort((a, b) => a - b);
            if (keys.length > 0) {
                return keys.map(key => obj[key]).join('');
            }
            try {
                return JSON.stringify(obj);
            } catch (e) {
                return 'Invalid data';
            }
        }
        return String(obj);
    };

    // Get specific field value for complex fields
    const getComplexFieldValue = (field, columnLabel, column) => {
        if (!field || !field.value) return 'N/A';

        const { type, value } = field;

        if (type === 'aadhar' || type === 'ocr-aadhar') {
            switch(columnLabel) {
                case 'Aadhar Number': return value.aadharNumber || 'N/A';
                case 'First Name': return value.firstName || 'N/A';
                case 'Last Name': return value.lastName || 'N/A';
                case 'Date of Birth': 
                    const dob = value.dob || 'N/A';
                    if (dob !== 'N/A') {
                        const ageCategory = getAgeCategory(dob);
                        return `${dob} (${ageCategory})`;
                    }
                    return dob;
                case 'Gender': return value.gender || 'N/A';
                case 'Address': return value.address || 'N/A';
                default: return 'N/A';
            }
        } else if (type === 'passport' || type === 'ocr-password') {
            switch(columnLabel) {
                case 'Passport Number': return value.passportNumber || 'N/A';
                case 'First Name': return value.firstName || 'N/A';
                case 'Last Name': return value.lastName || 'N/A';
                case 'Nationality': return value.nationality || 'N/A';
                case 'Date of Birth': 
                    const dob = value.dob || 'N/A';
                    if (dob !== 'N/A') {
                        const ageCategory = getAgeCategory(dob);
                        return `${dob} (${ageCategory})`;
                    }
                    return dob;
                case 'Place of Birth': return value.placeOfBirth || 'N/A';
                case 'Date of Issue': return value.dateOfIssue || 'N/A';
                case 'Date of Expiry': return value.dateOfExpiry || 'N/A';
                default: return 'N/A';
            }
        } else if (type === 'nearest-airport') {
            switch(columnLabel) {
                case 'Airport Name': 
                    return value.selectedAirport || value.airportName || 'N/A';
                case 'Airport Code': 
                    return value.airportCode || 'N/A';
                case 'Address': 
                    return value.address || 'N/A';
                case 'Distance (km)': 
                    return value.distanceKm || value.distance || 'N/A';
                default: return 'N/A';
            }
        } else if (type === 'address') {
            switch(columnLabel) {
                case 'Street 1': return value.street1 || 'N/A';
                case 'Street 2': return value.street2 || 'N/A';
                case 'City': return value.city || 'N/A';
                case 'State': return value.state || 'N/A';
                case 'Postal Code': return value.postalCode || 'N/A';
                default: return 'N/A';
            }
        }

        return 'N/A';
    };

    // Get raw field value for complex fields (without formatting)
    const getRawComplexFieldValue = (field, columnLabel) => {
        if (!field || !field.value) return 'N/A';

        const { type, value } = field;

        if (type === 'aadhar' || type === 'ocr-aadhar') {
            switch(columnLabel) {
                case 'Aadhar Number': return value.aadharNumber || 'N/A';
                case 'First Name': return value.firstName || 'N/A';
                case 'Last Name': return value.lastName || 'N/A';
                case 'Date of Birth': return value.dob || 'N/A';
                case 'Gender': return value.gender || 'N/A';
                case 'Address': return value.address || 'N/A';
                default: return 'N/A';
            }
        } else if (type === 'passport' || type === 'ocr-password') {
            switch(columnLabel) {
                case 'Passport Number': return value.passportNumber || 'N/A';
                case 'First Name': return value.firstName || 'N/A';
                case 'Last Name': return value.lastName || 'N/A';
                case 'Nationality': return value.nationality || 'N/A';
                case 'Date of Birth': return value.dob || 'N/A';
                case 'Place of Birth': return value.placeOfBirth || 'N/A';
                case 'Date of Issue': return value.dateOfIssue || 'N/A';
                case 'Date of Expiry': return value.dateOfExpiry || 'N/A';
                default: return 'N/A';
            }
        } else if (type === 'nearest-airport') {
            switch(columnLabel) {
                case 'Airport Name': 
                    return value.selectedAirport || value.airportName || 'N/A';
                case 'Airport Code': 
                    return value.airportCode || 'N/A';
                case 'Address': 
                    return value.address || 'N/A';
                case 'Distance (km)': 
                    return value.distanceKm || value.distance || 'N/A';
                default: return 'N/A';
            }
        } else if (type === 'address') {
            switch(columnLabel) {
                case 'Street 1': return value.street1 || 'N/A';
                case 'Street 2': return value.street2 || 'N/A';
                case 'City': return value.city || 'N/A';
                case 'State': return value.state || 'N/A';
                case 'Postal Code': return value.postalCode || 'N/A';
                default: return 'N/A';
            }
        }

        return 'N/A';
    };

    // Check if field is editable
    const isFieldEditable = (column) => {
        const nonEditableTypes = ['file-upload', 'aadhar_front', 'aadhar_back', 'passport_front', 'passport_back', 'status'];
        const nonEditableLabels = ['Aadhar Front', 'Aadhar Back', 'Passport Front', 'Passport Back', 'QC Status'];
        
        return !nonEditableTypes.includes(column.type) && 
               !nonEditableLabels.includes(column.label) &&
               column.id !== 'index' && 
               column.id !== 'actions';
    };

    // Check if individual field is editable
    const isIndividualFieldEditable = (column) => {
        const complexFieldTypes = ['aadhar', 'ocr-aadhar', 'passport', 'ocr-password', 'nearest-airport', 'address'];
        return complexFieldTypes.includes(column.type) && column.subfield;
    };

    // Get status display component
    const getStatusDisplay = (submission) => {
        const status = submission.status || submission.qc_status || 'pending';
        const config = statusConfig[status] || statusConfig.pending;
        const notes = submission.qc_notes || submission.notes || 'No notes available';
        const reviewedBy = submission.reviewed_by || 'Not reviewed';
        const reviewDate = submission.qc_review_date || submission.qc_date;

        return (
            <div className="relative group">
                <div className={`px-3 py-0 rounded-full  font-medium flex items-center gap-1 ${config.color} cursor-help text-[10px]`}>
                    {/* {config.icon} */}
                    {config.label}
                    <Info size={10} className="opacity-60" />
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64">
                    <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl">
                        <div className="font-semibold mb-2">QC Details</div>
                        
                        <div className="space-y-2">
                            <div>
                                <span className="text-gray-300">Status:</span>
                                <span className="ml-2 font-medium">{config.label}</span>
                            </div>
                            
                            <div>
                                <span className="text-gray-300">Reviewed by:</span>
                                <span className="ml-2 font-medium">{reviewedBy}</span>
                            </div>
                            
                            {reviewDate && (
                                <div>
                                    <span className="text-gray-300">Review date:</span>
                                    <span className="ml-2 font-medium">
                                        {new Date(reviewDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            
                            <div className="pt-2 border-t border-gray-700">
                                <span className="text-gray-300">Notes:</span>
                                <div className="mt-1 text-white font-normal max-h-20 overflow-y-auto">
                                    {notes}
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    };

    // Status statistics component
    // const StatusStatsTable = () => {
    //     const stats = {
    //         all: filteredSubmissions.length,
    //         approved: filteredSubmissions.filter(s => (s.status || s.qc_status) === 'approved').length,
    //         rejected: filteredSubmissions.filter(s => (s.status || s.qc_status) === 'rejected').length,
    //         pending: filteredSubmissions.filter(s => (s.status || s.qc_status) === 'pending').length
    //     };

    //     return (
    //         <div className="mb-6 bg-white rounded-lg shadow border">
    //             <div className="px-4 py-3 border-b">
    //                 <h3 className="text-lg font-semibold text-gray-800">QC Status Overview</h3>
    //             </div>
                
    //             <div className="p-4">
    //                 {/* Status Filter Buttons */}
    //                 <div className="flex flex-wrap gap-2 mb-4">
    //                     {['all', 'approved', 'pending', 'rejected'].map(status => (
    //                         <button
    //                             key={status}
    //                             onClick={() => setStatusFilter(status)}
    //                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    //                                 statusFilter === status
    //                                     ? status === 'all' 
    //                                         ? 'bg-blue-500 text-white'
    //                                         : statusConfig[status]?.color.replace('bg-', 'bg-').replace(' text-', ' text-white')
    //                                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    //                             }`}
    //                         >
    //                             {status === 'all' ? 'All' : statusConfig[status]?.label}
    //                             <span className="ml-2 bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs">
    //                                 {stats[status]}
    //                             </span>
    //                         </button>
    //                     ))}
    //                 </div>

    //                 {/* Statistics Grid */}
    //                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    //                     {['approved', 'pending', 'rejected'].map(status => (
    //                         <div 
    //                             key={status}
    //                             className={`p-4 rounded-lg border-2 ${
    //                                 statusConfig[status]?.color
    //                             } text-center cursor-pointer hover:shadow-md transition-shadow`}
    //                             onClick={() => setStatusFilter(status)}
    //                         >
    //                             <div className="flex items-center justify-center gap-2 mb-2">
    //                                 {statusConfig[status]?.icon}
    //                                 <span className="font-semibold">{statusConfig[status]?.label}</span>
    //                             </div>
    //                             <div className="text-2xl font-bold">{stats[status]}</div>
    //                             <div className="text-sm opacity-75">
    //                                 {Math.round((stats[status] / stats.all) * 100)}% of total
    //                             </div>
    //                         </div>
    //                     ))}
                        
    //                     {/* Total Submissions */}
    //                     <div 
    //                         className="p-4 rounded-lg border-2 bg-blue-100 text-blue-800 border-blue-200 text-center cursor-pointer hover:shadow-md transition-shadow"
    //                         onClick={() => setStatusFilter('all')}
    //                     >
    //                         <div className="flex items-center justify-center gap-2 mb-2">
    //                             <CheckCircle size={20} className="text-blue-500" />
    //                             <span className="font-semibold">Total Submissions</span>
    //                         </div>
    //                         <div className="text-2xl font-bold">{stats.all}</div>
    //                         <div className="text-sm opacity-75">100%</div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    // Render editable field with edit icon
    const renderEditableField = (value, submissionId, column, field = null) => {
        const isEditingThisField = editingField && 
            editingField.submissionId === submissionId && 
            editingField.fieldId === column.field_id;

        if (isEditingThisField) {
            return (
                <div className="flex flex-col space-y-2">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="border rounded px-2 py-1 text-sm w-full"
                        autoFocus
                        placeholder="Enter new value..."
                    />
                    <div className="flex space-x-2 justify-center">
                        <button
                            onClick={saveEdit}
                            disabled={isEditing}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {isEditing ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={cancelEditing}
                            disabled={isEditing}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between group">
                <span className="flex-1">{value || 'N/A'}</span>
                {isFieldEditable(column) && (
                    <button
                        onClick={() => startEditing(submissionId, column.field_id, value, column.type)}
                        className="ml-2 p-1 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit field"
                    >
                        <Edit size={14} />
                    </button>
                )}
            </div>
        );
    };

    // Render individual field for complex objects
    const renderIndividualField = (value, submissionId, column, field = null) => {
        const isEditingThisField = individualEditing && 
            individualEditing.submissionId === submissionId && 
            individualEditing.fieldId === column.field_id &&
            individualEditing.subfield === column.subfield;

        if (isEditingThisField) {
            return (
                <div className="flex flex-col space-y-2">
                    <input
                        type="text"
                        value={individualEditValue}
                        onChange={(e) => setIndividualEditValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="border rounded px-2 py-1 text-sm w-full"
                        autoFocus
                        placeholder="Enter new value..."
                    />
                    <div className="flex space-x-2 justify-center">
                        <button
                            onClick={saveIndividualEdit}
                            disabled={isEditing}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {isEditing ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={cancelEditing}
                            disabled={isEditing}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }

        const rawValue = getRawComplexFieldValue(field, column.label);
        const displayValue = column.label === 'Date of Birth' && rawValue !== 'N/A' ? 
            `${rawValue} (${getAgeCategory(rawValue)})` : value;

        return (
            <div className="flex items-center justify-between group">
                <span className="flex-1">{displayValue || 'N/A'}</span>
                {isIndividualFieldEditable(column) && (
                    <button
                        onClick={() => startIndividualEditing(
                            submissionId, 
                            column.field_id, 
                            column.subfield, 
                            rawValue, 
                            column.type
                        )}
                        className="ml-2 p-1 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Edit ${column.label}`}
                    >
                        <Edit size={14} />
                    </button>
                )}
            </div>
        );
    };

    const renderFileUploadField = (value) => {
        let fileValue;
        if (typeof value === 'object' && value !== null) {
            fileValue = value.value || value;
        } else {
            fileValue = value;
        }
        
        if (!fileValue || fileValue === '') {
            return <div className="text-center">N/A</div>;
        }

        const fileUrl = typeof fileValue === 'object' ? objectToString(fileValue) : fileValue;
        
        if (isBlobUrl(fileUrl)) {
            return (
                <div className="flex flex-col items-center space-y-2">
                    <File size={24} className="text-blue-500 mb-1" />
                    <span className="text-sm font-medium text-gray-700">File Uploaded</span>
                    <div className="flex space-x-2 mt-1">
                        <button 
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            onClick={() => window.open(fileUrl, '_blank')}
                        >
                            View
                        </button>
                        <a
                            href={fileUrl}
                            download="uploaded-file"
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                            Download
                        </a>
                    </div>
                </div>
            );
        }

        const fileName = fileUrl.split('/').pop() || 'Download file';
        const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || fileUrl.startsWith('data:image');

        return (
            <div className="flex flex-col items-center space-y-2">
                {isImage ? (
                    <>
                        <button 
                            className="flex items-center text-blue-600 hover:text-blue-800"
                            onClick={() => setPopupImage(fileUrl)}
                        >
                            <ImageIcon size={18} className="mr-1" /> View
                        </button>
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="flex items-center text-green-600 hover:text-green-800"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download size={16} className="mr-1" /> Download
                        </a>
                    </>
                ) : (
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="flex items-center text-green-600 hover:text-green-800"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Download size={16} className="mr-1" /> Download File
                    </a>
                )}
            </div>
        );
    };

    const renderImageField = (imageValue, altText = 'Image') => {
        if (!imageValue) return 'N/A';

        const imageUrl = typeof imageValue === 'object' ? objectToString(imageValue) : imageValue;
        
        if (isBlobUrl(imageUrl)) {
            return (
                <button 
                    className="flex items-center text-blue-600 hover:text-blue-800 mx-auto"
                    onClick={() => setPopupImage(imageUrl)}
                >
                    <ImageIcon size={18} className="mr-1" /> View
                </button>
            );
        }

        return (
            <span className="text-gray-500">Image data</span>
        );
    };

    if (loading) return <div className="text-center text-lg p-8">Loading submissions...</div>;

    return (
        <div className="px-3 pb-6">
                    
            <div className='flex justify-between align-center'>
                     <h6 className='!font-bold text-[22px] mb-5'>
                Support & Forms
            </h6>

            <p className='mb-0 text-[10px] flex gap-1'> <img src={bookImage}  className='mt-0 w-[15px]  h-[15px]'/>  Learn More About The Support & Forms</p>
            </div>
           
             <div className="flex gap-3">
                     <button
                        onClick={() => setSelectedChoose("guest")}
                        className={`flex items-center border-b-2 text-black-900 px-1 py-1  ${SelectedChoose ==="guest" && "border-blue-600"} transition-colors text-[13px] h-[24px]`}
                    >
                       
                        Guest List
                    </button>
                    <button
                         onClick={() => setSelectedChoose("form")}
                        className={`flex items-center border-b-2 gap-2 ${SelectedChoose ==="form" && "border-blue-600"} text-black-900 px-1 py-1   transition-colors text-[13px] h-[24px]`}
                    >
                       
                       Form Data
                    </button>
            </div>  

            {



       SelectedChoose ==="form" ? 
<>



                      <div className="flex justify-end items-center  mb-0">
                {/* <h1 className="text-3xl font-bold text-blue-600">Form Submissions</h1> */}
                <div className="flex space-x-1">
                    {/* Duplicate Detection Toggle */}
                    <button
                        onClick={toggleDuplicateDetection}
                        className={`flex items-center px-1 py-1 rounded-[5px] h-[24px] transition-colors ${
                            duplicateConfig.enabled
                                ? 'border border-yellow-500 text-black-700 hover:bg-yellow-600 text-[10px]'
                                : ' border border-gray-200 text-black-700 hover:bg-gray-300 text-[10px]'
                        }`}
                    >
                        <Palette size={10} className="" />
                        {duplicateConfig.enabled ? 'Color Duplicates On' : 'Color Duplicates Off'}
                        {duplicateConfig.enabled && Object.keys(duplicateConfig.duplicates).length > 0 && (
                            <span className="ml-2 bg-white text-yellow-500 rounded-full px-2 py-1 text-xs font-bold">
                                {Object.keys(duplicateConfig.duplicates).length} groups
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsManagingColumns(true)}
                        className="flex items-center border border-purple-600 text-black-700 px-1 py-1 rounded-[5px] hover:bg-purple-700 transition-colors text-[10px] h-[24px]"
                    >
                        <GripVertical size={10} className="" />
                        Manage Columns
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center border border-blue-600 text-black-700 px-1 py-1 rounded-[5px] hover:bg-blue-700 transition-colors text-[10px] h-[24px]"
                    >
                        <Upload size={10} className="" />
                        Import Excel
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center border border-green-600 text-black-700 px-1 py-1 rounded-[5px] hover:bg-green-700 transition-colors text-[10px] h-[24px]"
                    >
                        <DownloadCloud size={10} className="" />
                        Export to Excel
                    </button>

                    <button
                       
                        className="flex items-center border border-green-600 text-black-700 px-1 py-1 rounded-[5px] hover:bg-green-700 transition-colors text-[10px] h-[24px]"
                    >
                        <Settings size={10} className="" />
                        Setting
                    </button>
                </div>
           
                </div>
           

            {/* Status Statistics Table */}
                {/* <StatusStatsTable /> */}

            {/* Duplicate Configuration Panel */}
            {duplicateConfig.enabled && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg shadow border border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                            <Palette size={20} className="mr-2" />
                            Color-Coded Duplicate Detection
                        </h3>
                        <span className="text-sm text-yellow-700">
                            {Object.keys(duplicateConfig.duplicates).length} duplicate groups found • 
                            Different colors for each group
                        </span>
                    </div>
                    <p className="text-sm text-yellow-600 mb-3">
                        Select fields to check for duplicates. Each duplicate group will be highlighted with a different color.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                        {columns
                            .filter(col => 
                                !['index', 'actions', 'status'].includes(col.id) && 
                                !col.label.includes('Front') && 
                                !col.label.includes('Back') &&
                                col.type !== 'file-upload'
                            )
                            .map(column => (
                                <label key={column.id} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={duplicateConfig.fields.includes(column.id)}
                                        onChange={() => toggleDuplicateField(column.id)}
                                        className="rounded text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span className="text-yellow-800">{column.label}</span>
                                </label>
                            ))
                        }
                    </div>

                    {/* Color Legend */}
                    {Object.keys(duplicateConfig.duplicates).length > 0 && (
                        <div className="mt-4 pt-3 border-t border-yellow-200">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Duplicate Groups Legend:</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(duplicateConfig.duplicates).map(([key, ids], index) => (
                                    <div 
                                        key={key}
                                        className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium"
                                        style={{ 
                                            backgroundColor: duplicateConfig.groupColors[key],
                                            border: `2px solid ${duplicateConfig.groupColors[key]}`,
                                            color: '#000'
                                        }}
                                    >
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: duplicateConfig.groupColors[key] }}
                                        ></div>
                                        <span>Group {index + 1} ({ids.length} rows)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search and Filter Section */}
            {/* <div className="mb-6 p-4 bg-white rounded-lg shadow border">
                <div className="flex flex-col lg:flex-row gap-4">
                   
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search across all fields..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                   
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                showFilters || getActiveFilterCount() > 0
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Filter size={20} className="mr-2" />
                            Filters
                            {getActiveFilterCount() > 0 && (
                                <span className="ml-2 bg-white text-orange-500 rounded-full px-2 py-1 text-xs font-bold">
                                    {getActiveFilterCount()}
                                </span>
                            )}
                        </button>

                        {getActiveFilterCount() > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <X size={20} className="mr-2" />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

              
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">Advanced Filters</h3>
                            <SlidersHorizontal size={20} className="text-gray-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {availableFilterFields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={`Filter by ${field.label}...`}
                                            value={filters[field.id] || ''}
                                            onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {filters[field.id] && (
                                            <button
                                                onClick={() => clearFilter(field.id)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div> */}

            {/* Pagination Controls - Top */}
            {/* {filteredSubmissions.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                        <span className="text-sm text-gray-700 text-[10px]">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                            {getActiveFilterCount() > 0 && ' (filtered)'}
                            {duplicateConfig.enabled && Object.keys(duplicateConfig.duplicates).length > 0 && (
                                <span className="ml-2 text-yellow-600 font-medium">
                                    {Object.values(duplicateConfig.duplicates).flat().length} duplicate rows across {Object.keys(duplicateConfig.duplicates).length} groups
                                </span>
                            )}
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="First page"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white'
                                            : 'hover:bg-gray-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Last page"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )} */}

            {/* Column Management Modal */}
            {isManagingColumns && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-600">Manage Columns</h2>
                            <button
                                className="text-gray-700 hover:text-red-600"
                                onClick={() => setIsManagingColumns(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Drag to reorder columns or toggle visibility</p>
                        
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {columns.map((column, index) => (
                                <div
                                    key={column.id}
                                    className={`flex items-center justify-between p-2 border rounded ${
                                        dragOverItem === index ? 'bg-blue-50 border-blue-200' : ''
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex items-center">
                                        <GripVertical size={16} className="text-gray-400 mr-2 cursor-move" />
                                        <span>{column.label}</span>
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={column.visible}
                                                onChange={() => toggleColumnVisibility(column.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-10 h-6 rounded-full ${column.visible ? 'bg-blue-500' : 'bg-gray-300'} transition`} />
                                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform bg-white ${column.visible ? 'transform translate-x-5' : 'translate-x-1'}`} />
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={resetColumns}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Reset to Default
                            </button>
                            <button
                                onClick={() => setIsManagingColumns(false)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

             <div className="flex items-end   relative">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-1 font-semibold uppercase
                transition-all duration-300 text-[8px]
                ${isActive ? "text-white" : "text-gray-600"}
              `}
            >
              {/* Tab Shape */}
              <span
                className={`
                  absolute inset-0 -skew-x-12 origin-bottom
                  ${isActive ? "bg-[#3b82f6]" : "bg-white"}
                  border border-gray-300
                `}
              />

              {/* Fix text skew */}
              <span className="relative skew-x-12">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

            {filteredSubmissions.length === 0 ? (
                <div className="text-center text-lg p-8 bg-gray-100 rounded-lg">
                    {submissions.length === 0 ? (
                        "No submissions found. Import data using the Import Excel button."
                    ) : (
                        "No submissions match your current filters. Try adjusting your search criteria."
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto shadow rounded-lg border">
                    { activeTab ===1 &&
                                  <table className="min-w-full text-sm border-separate border-spacing-0">
                        <thead className="bg-[#f3f4f6] text-[#170f0f]">
                            <tr>
                                {columns.map((column) => (
                                    column.visible && (
                                        <th key={column.id} className="border px-4 py-1 sticky top-0 bg-[#f3f4f6] text-center whitespace-nowrap text-[10px]">
                                            {column.label}
                                        </th>
                                    )
                                ))}
                            </tr>
                        </thead> 
                        <tbody>
                            {currentSubmissions.map((submission, index) => {
                                const duplicateInfo = getDuplicateGroupInfo(submission.id || index);
                                
                                return (
                                    <tr 
                                        key={submission.id || index} 
                                        className="hover:bg-gray-50 text-[10px]"
                                        style={duplicateInfo.isDuplicate ? { 
                                            backgroundColor: duplicateInfo.color,
                                            borderLeft: `4px solid ${duplicateInfo.color}` 
                                        } : {}}
                                    >
                                        {columns.map((column) => {
                                            if (!column.visible) return null;
                                            
                                            if (column.id === 'index') {
                                                return (
                                                    <td key={column.id} className="border px-4 py-0 text-center font-medium whitespace-nowrap text-[10px]">
                                                        <div className="flex items-center justify-center">
                                                            {startIndex + index + 1}
                                                            {duplicateInfo.isDuplicate && (
                                                                <div 
                                                                    className="ml-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                                                    style={{ backgroundColor: duplicateInfo.color }}
                                                                    title={`Duplicate group (${duplicateInfo.count} matches)`}
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            // Status Column
                                            if (column.id === 'status') {
                                                return (
                                                    <td key={column.id} className="border px-4 py-0 text-center whitespace-nowrap text-[10px]">
                                                        {getStatusDisplay(submission)}
                                                    </td>
                                                );
                                            }

                                            if (column.id === 'actions') {
                                                return (
                                                    <td key={column.id} className="border px-4 py-0 h-[10px] text-center whitespace-nowrap">
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenTasks(submission)}
                                                                className="p-1 text-green-600 hover:text-green-800"
                                                                title="Manage Tasks"
                                                            >
                                                                <Calendar size={18} />
                                                            </button>

                                                            <button
                                                                onClick={Throwme}
                                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                                title="QC Review"
                                                            >
                                                                <Send size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSubmission(submission.id)}
                                                                disabled={deletingId === submission.id}
                                                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                                                title="Delete submission"
                                                            >
                                                                {deletingId === submission.id ? (
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                                                ) : (
                                                                    <Trash2 size={18} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                );
                                            }
                                            
                                            const field = getFieldValue(submission, column);
                                            
                                            return (
                                                <td key={column.id} className="border px-4 py-0 h-[10px] text-center whitespace-nowrap">
                                                    {/* Aadhar Fields */}
                                                    {(column.type === 'aadhar' || column.type === 'ocr-aadhar') && (
                                                        <>
                                                            {['Aadhar Front', 'Aadhar Back'].includes(column.label) ? (
                                                                renderImageField(
                                                                    field?.value?.[column.label === 'Aadhar Front' ? 'frontImage' : 'backImage'],
                                                                    column.label
                                                                )
                                                            ) : (
                                                                renderIndividualField(
                                                                    getComplexFieldValue(field, column.label, column),
                                                                    submission.id,
                                                                    column,
                                                                    field
                                                                )
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Passport Fields */}
                                                    {(column.type === 'passport' || column.type === 'ocr-password') && (
                                                        <>
                                                            {['Passport Front', 'Passport Back'].includes(column.label) ? (
                                                                renderImageField(
                                                                    field?.value?.[column.label === 'Passport Front' ? 'frontImage' : 'backImage'],
                                                                    column.label
                                                                )
                                                            ) : (
                                                                renderIndividualField(
                                                                    getComplexFieldValue(field, column.label, column),
                                                                    submission.id,
                                                                    column,
                                                                    field
                                                                )
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Airport Fields */}
                                                    {column.type === 'nearest-airport' && (
                                                        renderIndividualField(
                                                            getComplexFieldValue(field, column.label, column),
                                                            submission.id,
                                                            column,
                                                            field
                                                        )
                                                    )}

                                                    {/* Address Fields */}
                                                    {column.type === 'address' && (
                                                        renderIndividualField(
                                                            getComplexFieldValue(field, column.label, column),
                                                            submission.id,
                                                            column,
                                                            field
                                                        )
                                                    )}

                                                    {/* File Upload Fields */}
                                                    {column.type === 'file-upload' && (
                                                        renderFileUploadField(field?.value)
                                                    )}

                                                    {/* Default Fields */}
                                                    {!['aadhar', 'ocr-aadhar', 'passport', 'ocr-password', 'nearest-airport', 'address', 'file-upload'].includes(column.type) && field && (
                                                        renderEditableField(
                                                            typeof field.value === 'object' ? 
                                                                (field.value.value || field.value.selectedOption || (field.value.selectedOptions && field.value.selectedOptions.join(', ')) || 'N/A') : 
                                                                (field.value || 'N/A'),
                                                            submission.id,
                                                            column,
                                                            field
                                                        )
                                                    )}

                                                    {/* No Field Found */}
                                                    {!field && (
                                                        <div className="text-gray-400">N/A</div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table> 
                    }
                  
                </div>
            )}

            {/* Pagination Controls - Bottom */}
            {filteredSubmissions.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                        <span className="text-[10px] text-gray-700">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                            {getActiveFilterCount() > 0 && ' (filtered)'}
                            {duplicateConfig.enabled && Object.keys(duplicateConfig.duplicates).length > 0 && (
                                <span className="ml-2 text-yellow-600 font-medium">
                                    {Object.values(duplicateConfig.duplicates).flat().length} duplicate rows across {Object.keys(duplicateConfig.duplicates).length} groups
                                </span>
                            )}
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border rounded px-2 py-1 text-[10px]"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="First page"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 rounded text-[10px] ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white'
                                            : 'hover:bg-gray-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Last page"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Task Management Drawer */}
            <TaskManagementDrawer
                isOpen={isTaskDrawerOpen}
                onClose={closeTaskDrawer}
                selectedSubmission={selectedSubmission}
                tasks={tasks}
                setTasks={setTasks}
                taskFormData={taskFormData}
                setTaskFormData={setTaskFormData}
                editingTaskId={editingTaskId}
                setEditingTaskId={setEditingTaskId}
            />

            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <button
                            className="absolute top-2 right-2 text-gray-700 hover:text-red-600"
                            onClick={() => setShowImportModal(false)}
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-blue-600">Import Excel File</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Upload an Excel file with the same structure as the exported file.
                        </p>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileImport}
                            className="w-full p-2 border rounded mb-4"
                        />
                    </div>
                </div>
            )}

            {popupImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-[90%] max-h-[90%]">
                        <button
                            className="absolute top-2 right-2 text-gray-700 hover:text-red-600"
                            onClick={() => setPopupImage(null)}
                        >
                            <X size={24} />
                        </button>
                        <img src={popupImage} alt="Preview" className="max-w-full max-h-[80vh] rounded" />
                    </div>
                </div>
            )}
</> : <Gestlist leaD={13}/>


            }
               
                                
          

        </div>
    );



};

export default FormSubmissionsPage;