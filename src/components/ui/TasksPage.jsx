import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Send, 
  Clock, 
  Calendar, 
  Bell, 
  Eye, 
  Edit3,
  Filter,
  CalendarDays,
  X
} from "lucide-react";

// Badge color helper
const getBadgeColor = (label) => {
  const colors = {
    Calls: "bg-teal-600 text-white",
    Email: "bg-yellow-400 text-black",
    Pending: "bg-indigo-500 text-white",
    Inprogress: "bg-orange-400 text-white",
    Completed: "bg-green-500 text-white",
    Promotion: "bg-purple-200 text-purple-800",
    Rejected: "bg-red-200 text-red-700",
    Collab: "bg-green-200 text-green-700",
    Rated: "bg-yellow-200 text-yellow-700",
    Task: "bg-blue-500 text-white",
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-500 text-black",
    Low: "bg-green-500 text-white",
  };
  return colors[label] || "bg-gray-200 text-gray-800";
};

// Notification Component
const SendTaskNotification = ({ task, onClose }) => {
  const [notificationData, setNotificationData] = useState({
    title: `Update: ${task.task_name}`,
    message: '',
    type: 'info'
  });
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const organizerId = user?.employee?.id;

  const notificationTypes = [
    { value: 'info', label: 'Information' },
    { value: 'warning', label: 'Warning' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'update', label: 'Update' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task_id: task.id, 
          ...notificationData,
          sender_id: organizerId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send notification');
      alert('Notification sent successfully!');
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Send Notification for Task</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={notificationData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={notificationData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={notificationData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !notificationData.message}
            className={`px-4 py-2 flex items-center ${
              loading || !notificationData.message
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-md transition-colors`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-1" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onUpdateStatus, onViewTask, onEditTask }) => {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const isNewTask = new Date() - new Date(task.created_at) < 24 * 60 * 60 * 1000;
  const isCompleted = task.status === "Completed";
  
  // Measure content height when expanded
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isExpanded]);

  return (
    <div className={`border-b px-4 py-2 hover:bg-gray-50 ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Accordion Header */}
      <div 
        className={`relative flex items-center gap-3 py-2 pl-2 pr-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
          isCompleted ? 'bg-gray-50' : 'bg-white'
        } ${isExpanded ? 'rounded-b-none' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Task indicator bar */}
        <div className={`w-1 h-8 rounded-full transition-colors duration-300 ${
          isCompleted 
            ? "bg-gradient-to-b from-gray-400 to-gray-500" 
            : "bg-gradient-to-b from-blue-400 to-indigo-600"
        }`}></div>
        
        {/* Task name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate max-w-[220px] block transition-colors duration-300 ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.task_name}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-800">
                Completed
              </span>
            )}
          </div>
        </div>
        
        {/* Checkbox */}
        <div className="relative flex items-center">
          <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onUpdateStatus(task.id, e.target.checked ? "Completed" : "Pending")}
              className="hidden"
            />
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-in-out ${
              isCompleted 
                ? "bg-indigo-500 border-indigo-500" 
                : "border-gray-300 hover:border-indigo-400"
            }`}>
              {isCompleted && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>
          
          {/* New task indicator */}
          {isNewTask && !isCompleted && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
        </div>
        
        {/* Chevron icon */}
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {/* Accordion Content */}
      <div 
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCompleted ? 'bg-gray-50' : 'bg-white'
        }`}
        style={{ maxHeight: `${contentHeight}px` }}
      >
        <div className={`pl-8 pr-4 rounded-b-lg shadow-inner py-3`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {task.reminder_due && !isCompleted && (
                <span className="text-red-500 text-xs font-semibold flex items-center">
                  <Clock size={14} className="mr-1" /> Due Soon!
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-md ${getBadgeColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-md ${getBadgeColor(task.tag_label)}`}>
                {task.tag_label}
              </span>
              <span className="flex items-center text-xs text-gray-500 gap-1">
                <Calendar size={14} /> 
                {new Date(task.end_datetime).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {task.participants?.map((p, idx) => (
                  <img
                    key={idx}
                    src={p.photo || `https://i.pravatar.cc/32?img=${idx + 5}`}
                    alt={p.name}
                    title={p.name}
                    className="w-6 h-6 rounded-full border-2 border-white"
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <button
                className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotificationDialog(true);
                }}
              >
                <Bell size={14} className="mr-1" /> Notify
              </button>
              <button
                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewTask(task);
                }}
              >
                <Eye size={14} className="mr-1" /> View
              </button>
              <button
                className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
              >
                <Edit3 size={14} className="mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showNotificationDialog && (
        <SendTaskNotification 
          task={task} 
          onClose={() => setShowNotificationDialog(false)} 
        />
      )}
    </div>
  );
};

const EditTaskModal = ({ task, onClose, onTaskUpdated }) => {
  const [taskData, setTaskData] = useState({
    task_name: '',
    description: '',
    priority: '',
    tag_label: '',
    assign_datetime: '',
    end_datetime: '',
    included_people: [],
    updated_by: ''
  });
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (task) {
      setTaskData({
        task_name: task.task_name || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        tag_label: task.tag_label || 'Task',
        assign_datetime: task.assign_datetime.split(":00")[0] || '',
        end_datetime: task.end_datetime.split(":00")[0] || '',
        included_people: task.participants?.map(p => p.id) || [],
        updated_by: user?.employee?.id || ''
      });
    }
  }, [task, user]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/employees");
        const data = await res.json();
        const options = data.map(emp => ({
          value: emp.id,
          label: emp.name,
          avatar: emp.photo || `https://i.pravatar.cc/32?img=${emp.id % 70}`,
        }));
        setEmployeeOptions(options);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handlePeopleChange = selected => {
    const values = selected.map(opt => opt.value);
    setTaskData(prev => ({ ...prev, included_people: values }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Task updated successfully!');
        if (onTaskUpdated) onTaskUpdated(result.task);
        onClose();
      } else {
        console.error('Error:', result);
        alert('Failed to update task: ' + result.error);
      }
    } catch (err) {
      console.error('Request failed:', err);
      alert('Network error. Try again later.');
    }
  };

  const selectedParticipants = employeeOptions.filter(opt => 
    taskData.included_people.includes(opt.value)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="task_name"
            value={taskData.task_name}
            onChange={handleChange}
            placeholder="Task Name"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <textarea
            name="description"
            value={taskData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
          <select 
            name="priority" 
            value={taskData.priority} 
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            name="tag_label"
            value={taskData.tag_label}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Task">Task</option>
            <option value="Calls">Calls</option>
            <option value="Email">Email</option>
          </select>
          <input
            type="datetime-local"
            name="end_datetime"
            value={taskData.end_datetime}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <Select
            isMulti
            options={employeeOptions}
            value={selectedParticipants}
            onChange={handlePeopleChange}
            className="basic-multi-select"
            classNamePrefix="select"
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const groupTasksByDate = (tasks) => {
  return tasks.reduce((acc, task) => {
    const dateKey = new Date(task.end_datetime).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});
};

const CustomOption = ({ data, innerRef, innerProps }) => (
  <div ref={innerRef} {...innerProps} className="flex items-center px-2 py-1 hover:bg-gray-100">
    <img src={data.avatar} alt={data.label} className="w-6 h-6 rounded-full mr-2 border" />
    <span>{data.label}</span>
  </div>
);

const CustomMultiValue = ({ data, removeProps }) => (
  <div className="flex items-center bg-gray-200 px-2 py-1 rounded mr-1">
    <img src={data.avatar} alt={data.label} className="w-5 h-5 rounded-full mr-1" />
    <span className="text-sm">{data.label}</span>
    <span className="ml-1 text-red-500 cursor-pointer" onClick={removeProps.onClick}>×</span>
  </div>
);

// Helper function to filter tasks for specific month
const filterTasksForMonth = (tasks, month, year) => {
  return tasks.filter(task => {
    const taskDate = new Date(task.assign_datetime);
    return (
      taskDate.getMonth() === month && 
      taskDate.getFullYear() === year
    );
  });
};

// Generate month options for dropdown
const generateMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  
  // Add previous months
  for (let i = 6; i >= 1; i--) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    options.push({
      value: date,
      label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  }
  
  // Add current and future months
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() + i);
    options.push({
      value: date,
      label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  }
  
  return options;
};

// Generate date options for the next 30 days and yesterday
const generateDateOptions = () => {
  const options = [];
  const today = new Date();
  
  // Yesterday option
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  options.push({
    value: yesterday.toISOString().split('T')[0],
    label: "Yesterday",
    date: yesterday
  });
  
  // Today option
  options.push({
    value: today.toISOString().split('T')[0],
    label: "Today",
    date: today
  });
  
  // Tomorrow option
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  options.push({
    value: tomorrow.toISOString().split('T')[0],
    label: "Tomorrow",
    date: tomorrow
  });
  
  // Next 7 days
  for (let i = 2; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    options.push({
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      date: date
    });
  }
  
  // Specific dates for the rest of the month
  for (let i = 8; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    options.push({
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date
    });
  }
  
  return options;
};

const TaskLayout = () => {
  const [tasks, setTasks] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    priority: "Medium",
    tag_label: "Task",
    assign_datetime: new Date().toISOString().slice(0, 16),
    end_datetime: "",
    participants: [],
  });

  const user = useSelector((state) => state.auth.user);
  const organizerId = user?.employee?.id;

  // Generate month and date options for dropdowns
  const monthOptions = generateMonthOptions();
  const dateOptions = generateDateOptions();
  
  // Get the current month name for display
  const currentMonthName = selectedMonth.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Helper to format date display
  const getDisplayDate = (dateStr) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const date = new Date(dateStr);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Initialize expanded groups
  useEffect(() => {
    if (filteredTasks.length > 0) {
      const groups = Object.keys(groupedTasks);
      const initialState = groups.reduce((acc, date) => {
        acc[date] = true;
        return acc;
      }, {});
      setExpandedGroups(initialState);
    }
  }, [filteredTasks]);

  // Toggle group expansion
  const toggleGroup = (date) => {
    setExpandedGroups(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks?userId=${organizerId}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data.tasks || []);
        
        // Filter tasks based on current filters
        updateFilteredTasks(data.tasks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (organizerId) fetchTasks();
  }, [organizerId]);

  // Group filtered tasks by date
  const groupedTasks = groupTasksByDate(filteredTasks);

  // Update filtered tasks when tasks, month, or date change
  const updateFilteredTasks = (tasksList) => {
    let filtered = tasksList;
    
    // Apply month filter
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();
    filtered = filterTasksForMonth(tasksList, month, year);
    
    // Apply date filter if selected
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.end_datetime);
        return (
          taskDate.getDate() === filterDate.getDate() &&
          taskDate.getMonth() === filterDate.getMonth() &&
          taskDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }
    
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    if (tasks.length > 0) {
      updateFilteredTasks(tasks);
    }
  }, [tasks, selectedMonth, selectedDate]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/employees");
        const data = await res.json();
        const options = data.map(emp => ({
          value: emp.id,
          label: emp.name,
          avatar: emp.photo || `https://i.pravatar.cc/32?img=${emp.id % 70}`,
        }));
        setEmployeeOptions(options);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const included_people = formData.participants.map(p => p.value);
      const res = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          included_people,
          created_by: organizerId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const data = await res.json();
      
      // Add new task to tasks
      setTasks(prev => [data.task, ...prev]);
      
      setShowModal(false);
      setFormData({
        task_name: "",
        description: "",
        priority: "Medium",
        tag_label: "Task",
        assign_datetime: new Date().toISOString().slice(0, 16),
        end_datetime: "",
        participants: [],
      });
    } catch (err) {
      alert("Error creating task: " + err.message);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks/${taskId}/status?userId=${organizerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update task status");

      // Update tasks
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      alert("Failed to update task status: " + err.message);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    // Update tasks
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setEditTask(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="🔍 Search Task" 
          className="w-1/3 px-4 py-2 border rounded-md" 
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-purple-600" defaultChecked />
            Mark all as read
          </label>
          
          {/* Date Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="pl-9 pr-8 py-2 border rounded-md text-sm appearance-none bg-white"
            >
              <option value="">All Dates</option>
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <CalendarDays size={16} className="text-gray-500" />
            </div>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Month Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth.toISOString()}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="pl-9 pr-8 py-2 border rounded-md text-sm appearance-none bg-white"
            >
              {monthOptions.map((option) => (
                <option key={option.label} value={option.value.toISOString()}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-gray-500" />
            </div>
          </div>
          
          <button
            className="bg-[#3F8CFF] text-sm text-white rounded-lg px-4 py-2 flex items-center gap-1 shadow-md"
            onClick={() => setShowModal(true)}
          >
            Add New Tasks
          </button>
        </div>
      </div>

      {/* Display current filters */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">
          {selectedDate 
            ? `Tasks for ${getDisplayDate(selectedDate)}`
            : `Tasks for ${currentMonthName}`}
          <span className="text-sm text-gray-500 ml-2">
            ({filteredTasks.length} tasks)
          </span>
        </h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const prevMonth = new Date(selectedMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setSelectedMonth(prevMonth);
              setSelectedDate(null);
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => {
              setSelectedMonth(new Date());
              setSelectedDate(null);
            }}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
          >
            Current Month
          </button>
          <button 
            onClick={() => {
              const nextMonth = new Date(selectedMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setSelectedMonth(nextMonth);
              setSelectedDate(null);
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading && <div>Loading tasks...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="bg-white rounded-md shadow-md">
        {Object.keys(groupedTasks).length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-500">
            No tasks found for {selectedDate 
              ? getDisplayDate(selectedDate)
              : currentMonthName}
          </div>
        ) : (
          Object.keys(groupedTasks).map((date) => (
            <div key={date} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              {/* Group Header - Accordion Toggle */}
              <div 
                className="bg-gray-100 px-4 flex justify-between items-center py-3 font-semibold text-md cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => toggleGroup(date)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getDisplayDate(date)}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {groupedTasks[date].length} {groupedTasks[date].length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform duration-300 ${
                    expandedGroups[date] ? 'rotate-180' : ''
                  }`} 
                />
              </div>
              
              {/* Group Content - Tasks */}
              <div className={`overflow-hidden transition-all duration-300 ${
                expandedGroups[date] ? 'max-h-[2000px]' : 'max-h-0'
              }`}>
                {expandedGroups[date] && groupedTasks[date].map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onUpdateStatus={updateTaskStatus} 
                    onViewTask={setViewTask}
                    onEditTask={setEditTask}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Task Modal */}
      {viewTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
          onClick={() => setViewTask(null)}
          onKeyDown={(e) => e.key === "Escape" && setViewTask(null)}
          tabIndex={0}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-bold text-blue-700">📝 Task Details</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
                onClick={() => setViewTask(null)}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>📌 Task:</strong>
                <p>{viewTask.task_name}</p>
              </div>
              <div>
                <strong>🏷️ Tag:</strong>
                <p>{viewTask.tag_label}</p>
              </div>
              <div>
                <strong>⚡ Priority:</strong>
                <p>{viewTask.priority}</p>
              </div>
              <div>
                <strong>📊 Status:</strong>
                <p>{viewTask.status}</p>
              </div>
              <div>
                <strong>📅 Start:</strong>
                <p>{new Date(viewTask.assign_datetime).toLocaleString()}</p>
              </div>
              <div>
                <strong>📆 End:</strong>
                <p>{new Date(viewTask.end_datetime).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <strong>📝 Description:</strong>
                <p className="mt-1 text-gray-600">{viewTask.description || "No description provided."}</p>
              </div>
              <div className="col-span-2">
                <strong>👥 Participants:</strong>
                <div className="mt-1 flex flex-wrap gap-3">
                  {viewTask.participants?.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                      <img
                        src={p.photo || `https://i.pravatar.cc/32?img=${idx + 10}`}
                        alt={p.name}
                        className="w-6 h-6 rounded-full border"
                      />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewTask(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task Name"
                value={formData.task_name}
                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <textarea
                placeholder="Task Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
              <input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <Select
                isMulti
                options={employeeOptions}
                value={formData.participants}
                onChange={(selected) => setFormData({ ...formData, participants: selected })}
                components={{ Option: CustomOption, MultiValue: CustomMultiValue }}
              />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select
                value={formData.tag_label}
                onChange={(e) => setFormData({ ...formData, tag_label: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option>Task</option>
                <option>Calls</option>
                <option>Email</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <EditTaskModal 
          task={editTask} 
          onClose={() => setEditTask(null)} 
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default TaskLayout;