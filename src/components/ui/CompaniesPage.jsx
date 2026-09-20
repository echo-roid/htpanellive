import React, { useState, useEffect } from "react";
import { MoreVertical, Edit, Trash2, Search, Filter, Plus, Calendar, CheckCircle, Clock, AlertCircle, Eye, EyeOff, TrendingUp, Users, Building2, Award, BarChart3, Activity, Globe, Briefcase, PieChart } from "lucide-react";
import * as api from "../../api/Companie";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import bookImage from "../../assets/book.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

const COMPANY_API_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api/contacts";

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

const maskPAN = (pan) => {
  if (!pan || typeof pan !== 'string') return '';
  
  if (pan.length <= 4) {
    return 'XXXXX' + pan;
  }
  
  const firstFive = pan.substring(0, 5);
  const lastFour = pan.substring(pan.length - 4);
  return `${firstFive}XXXX${lastFour}`;
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
      case 'pan':
        return maskPAN(value);
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

// Dashboard Statistics Component
const DashboardStats = ({ companies }) => {
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === "Active").length;
  const inactiveCompanies = companies.filter(c => c.status === "Inactive").length;
  const pendingCompanies = companies.filter(c => c.status === "Pending").length;
  
  // Count by client type
  const individualCount = companies.filter(c => c.client_type === "Individual").length;
  const corporateCount = companies.filter(c => c.client_type === "Corporate").length;
  const governmentCount = companies.filter(c => c.client_type === "Government").length;
  const nonProfitCount = companies.filter(c => c.client_type === "Non-Profit").length;

  // Count by industry
  const industryCount = {};
  companies.forEach(c => {
    if (c.industry_type) {
      industryCount[c.industry_type] = (industryCount[c.industry_type] || 0) + 1;
    }
  });

  const stats = [
    {
      label: "Total Clients",
      value: totalCompanies,
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
      subtitle: `${activeCompanies} Active`
    },
    {
      label: "Active Clients",
      value: activeCompanies,
      icon: <Users className="w-5 h-5 text-green-500" />,
      color: "bg-green-50 border-green-200",
      subtitle: `${((activeCompanies/totalCompanies)*100 || 0).toFixed(1)}% of total`
    },
    {
      label: "Client Types",
      value: `${corporateCount} Corporate`,
      icon: <Briefcase className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-50 border-purple-200",
      subtitle: `${individualCount} Individual, ${governmentCount} Govt`
    },
    {
      label: "Industries",
      value: Object.keys(industryCount).length,
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
      color: "bg-orange-50 border-orange-200",
      subtitle: "Different sectors"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((stat, index) => (
        <div key={index} className={`border rounded-lg p-3 ${stat.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">{stat.value}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{stat.subtitle}</p>
            </div>
            <div className="p-1.5 bg-white rounded-full shadow-sm">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Client Type Distribution Chart
const ClientTypeChart = ({ companies }) => {
  const typeCount = {
    Individual: companies.filter(c => c.client_type === "Individual").length,
    Corporate: companies.filter(c => c.client_type === "Corporate").length,
    Government: companies.filter(c => c.client_type === "Government").length,
    "Non-Profit": companies.filter(c => c.client_type === "Non-Profit").length
  };

  const data = {
    labels: Object.keys(typeCount),
    datasets: [
      {
        label: 'Client Types',
        data: Object.values(typeCount),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)'
        ],
        borderColor: [
          'rgb(147, 51, 234)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Client Type Distribution',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Pie data={data} options={options} />
    </div>
  );
};

// Status Distribution Chart
const StatusDistributionChart = ({ companies }) => {
  const statusCount = {
    Active: companies.filter(c => c.status === "Active").length,
    Inactive: companies.filter(c => c.status === "Inactive").length,
    Pending: companies.filter(c => c.status === "Pending").length
  };

  const data = {
    labels: Object.keys(statusCount),
    datasets: [
      {
        label: 'Client Status',
        data: Object.values(statusCount),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(234, 179, 8, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(107, 114, 128)',
          'rgb(234, 179, 8)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Client Status Distribution',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

// Industry Distribution Chart
const IndustryChart = ({ companies }) => {
  const industryCount = {};
  companies.forEach(c => {
    if (c.industry_type) {
      industryCount[c.industry_type] = (industryCount[c.industry_type] || 0) + 1;
    }
  });

  const colors = [
    'rgba(236, 72, 153, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(251, 146, 60, 0.8)',
    'rgba(52, 211, 153, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(239, 68, 68, 0.8)'
  ];

  const data = {
    labels: Object.keys(industryCount),
    datasets: [
      {
        label: 'Industries',
        data: Object.values(industryCount),
        backgroundColor: colors.slice(0, Object.keys(industryCount).length),
        borderColor: colors.slice(0, Object.keys(industryCount).length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Industry Distribution',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <PolarArea data={data} options={options} />
    </div>
  );
};

// Monthly Growth Chart
const MonthlyGrowthChart = ({ companies }) => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: month.getMonth(),
      year: month.getFullYear(),
      label: `${monthNames[month.getMonth()]} ${month.getFullYear()}`
    });
  }

  const monthlyData = months.map(({ month, year }) => {
    const count = companies.filter(c => {
      if (!c.created_at) return false;
      const createdDate = new Date(c.created_at);
      return createdDate.getMonth() === month && createdDate.getFullYear() === year;
    }).length;
    return count;
  });

  const data = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'New Clients',
        data: monthlyData,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 10
          },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Monthly Client Growth',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 9
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 9
          }
        }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Line data={data} options={options} />
    </div>
  );
};

// Business Type Chart
const BusinessTypeChart = ({ companies }) => {
  const typeCount = {
    B2B: companies.filter(c => c.business_type === "B2B").length,
    B2C: companies.filter(c => c.business_type === "B2C").length,
    B2G: companies.filter(c => c.business_type === "B2G").length
  };

  const data = {
    labels: Object.keys(typeCount),
    datasets: [
      {
        label: 'Business Types',
        data: Object.values(typeCount),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 10
          },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Business Type Distribution',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 9
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[200px]">
      <Bar data={data} options={options} />
    </div>
  );
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  
  // Form data with all possible fields
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    panNumber: "",
    address: "",
    pinCode: "",
    state: "",
    clientType: "",
    contactPerson: "",
    contactNumber: "",
    cinNumber: "",
    website: "",
    industryType: "",
    businessType: "",
    contracts: "",
    relationManager: "",
    client_code: "",
    status: "Active"
  });
  
  const [editingId, setEditingId] = useState(null);
  
  // States for contact person dropdown
  const [contactsList, setContactsList] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactError, setContactError] = useState(null);

  // Task Management States
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
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
    email: true,
    panNumber: true,
    contactNumber: true,
    cinNumber: true
  });

  const [maskedTableData, setMaskedTableData] = useState({});

  // Check if client type is Individual
  const isIndividualClient = formData.clientType === "Individual";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.relative')) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenu]);

  // Fetch companies from API
  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.getCompanies();
      setCompanies(data.companies);
      
      const initialMaskedData = {};
      data.companies.forEach(company => {
        initialMaskedData[company.id] = {
          email: true,
          panNumber: true,
          contactNumber: true,
          cinNumber: true
        };
      });
      setMaskedTableData(initialMaskedData);
    } catch (err) {
      setError("Failed to load companies. Please try again later.");
      console.error("Failed to fetch companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts for dropdown
  const fetchContactsList = async () => {
    setLoadingContacts(true);
    setContactError(null);
    try {
      const response = await fetch(COMPANY_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const contacts = result?.data?.contacts || [];
      setContactsList(contacts);
      setFilteredContacts(contacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContactError(err.message);
      setContactsList([]);
      setFilteredContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Task Management Functions
  const fetchTasks = async (clientId) => {
    try {
      const mockTasks = [
        {
          id: 1,
          title: "Follow up on proposal",
          description: "Contact client regarding the submitted proposal and discuss next steps",
          dueDate: "2024-01-15",
          priority: "High",
          status: "Pending",
          assignedTo: "John Doe",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Send contract documents",
          description: "Email the signed contract copies and follow up for confirmation",
          dueDate: "2024-01-20",
          priority: "Medium",
          status: "In Progress",
          assignedTo: "Jane Smith",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: "Quarterly review meeting",
          description: "Schedule and prepare for quarterly performance review",
          dueDate: "2024-02-01",
          priority: "Low",
          status: "Completed",
          assignedTo: "Mike Johnson",
          createdAt: new Date().toISOString()
        }
      ];
      setTasks(mockTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const handleOpenTasks = (client) => {
    setSelectedClient(client);
    fetchTasks(client.id);
    setIsTaskDrawerOpen(true);
    setOpenActionMenu(null);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    const taskData = {
      ...taskFormData,
      clientId: selectedClient.id,
      clientName: selectedClient.client_name || selectedClient.name
    };

    try {
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
    } catch (err) {
      console.error("Failed to save task:", err);
    }
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

  // Masking handlers for form
  const toggleMask = (field) => {
    setMaskedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Masking handlers for table
  const toggleTableMask = (companyId, field) => {
    setMaskedTableData(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [field]: !prev[companyId]?.[field]
      }
    }));
  };

  // Generate UUID for client code
  const generateClientCode = () => {
    return uuidv4().substring(0, 8).toUpperCase();
  };

  // Filter contacts based on search input
  useEffect(() => {
    if (contactSearch) {
      const filtered = contactsList.filter(contact => 
        contact.name.toLowerCase().includes(contactSearch.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contactsList);
    }
  }, [contactSearch, contactsList]);

  // Handle contact selection from dropdown
  const handleContactSelect = (contact) => {
    setFormData(prev => ({ 
      ...prev, 
      contactPerson: contact.name,
      contactNumber: contact.phone || contact.mobile || contact.contact_number || "",
      email: contact.email || prev.email
    }));
    setShowContactDropdown(false);
  };

  // Handle manual addition of contact
  const handleAddManualContact = () => {
    if (contactSearch.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        contactPerson: contactSearch,
        contactNumber: "",
      }));
      setShowContactDropdown(false);
      setContactSearch("");
    }
  };

  // Search companies
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCompanies();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.searchCompanies(searchQuery);
      setCompanies(data.companies);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "clientType" && value === "Individual") {
      setFormData(prev => ({
        ...prev,
        cinNumber: "",
        website: "",
        industryType: "",
        businessType: "",
        contracts: "",
        relationManager: ""
      }));
    }
  };

  // Handle task input changes
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const finalClientCode = formData.client_code +"C0001"

      const submitData = {
        clientName: formData.clientName,
        email: formData.email,
        panNumber: formData.panNumber,
        address: formData.address,
        pinCode: formData.pinCode,
        state: formData.state,
        clientType: formData.clientType,
        contactPerson: formData.contactPerson,
        contactNumber: formData.contactNumber,
        client_code: finalClientCode,
        status: formData.status,
        cinNumber: formData.cinNumber,
        website: formData.website,
        industryType: formData.industryType,
        businessType: formData.businessType,
        contracts: formData.contracts,
        relationManager: formData.relationManager
      };

      if (editingId) {
        await api.updateCompany(editingId, submitData);
      } else {
        await api.createCompany(submitData);
      }

      await fetchCompanies();
      setIsDrawerOpen(false);
      resetForm();
    } catch (err) {
      setError("Failed to save client. Please check your data and try again.");
      console.error("Failed to save client:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit company
  const handleEdit = (company) => {
    setFormData({
      clientName: company.client_name || company.name,
      email: company.email,
      panNumber: company.pan_number,
      address: company.address,
      pinCode: company.pin_code,
      state: company.state,
      clientType: company.client_type,
      contactPerson: company.contact_person,
      contactNumber: company.contact_number,
      cinNumber: company.cin_number || "",
      website: company.website || "",
      industryType: company.industry_type || "",
      businessType: company.business_type || "",
      contracts: company.contracts || "",
      relationManager: company.relation_manager || "",
      client_code: company.client_code || "",
      status: company.status || "Active"
    });
    setEditingId(company.id);
    setIsDrawerOpen(true);
    setOpenActionMenu(null);
  };

  // Delete company
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.deleteCompany(id);
      await fetchCompanies();
    } catch (err) {
      setError("Failed to delete client. Please try again.");
      console.error("Failed to delete client:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      clientName: "",
      email: "",
      panNumber: "",
      address: "",
      pinCode: "",
      state: "",
      clientType: "",
      contactPerson: "",
      contactNumber: "",
      cinNumber: "",
      website: "",
      industryType: "",
      businessType: "",
      contracts: "",
      relationManager: "",
      client_code: "",
      status: "Active"
    });
    setEditingId(null);
    setContactSearch("");
    setShowContactDropdown(false);
    setMaskedFields({
      email: true,
      panNumber: true,
      contactNumber: true,
      cinNumber: true
    });
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <>
      <div className="p-4 rounded-md">
        <div className='flex justify-between align-center'>
          <h6 className='!font-bold text-[22px] mb-5'>Company Dashboard</h6>
          <p className='mb-0 text-[10px] flex gap-1'>
            <img src={bookImage} className='mt-0 w-[15px] h-[15px]' alt="book"/>
            Learn More About The Company
          </p>
        </div>

        {/* Toggle Dashboard/Table View */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {showDashboard ? (
              <>
                <BarChart3 size={14} />
                Hide Dashboard
              </>
            ) : (
              <>
                <Activity size={14} />
                Show Dashboard
              </>
            )}
          </button>
        </div>

        {/* Dashboard Section */}
        {showDashboard && (
          <>
            <DashboardStats companies={companies} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              <MonthlyGrowthChart companies={companies} />
              <StatusDistributionChart companies={companies} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <ClientTypeChart companies={companies} />
              <IndustryChart companies={companies} />
              <BusinessTypeChart companies={companies} />
            </div>
          </>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Search and action bar */}
        <div className="flex justify-between items-center mb-2 text-[10px]">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center w-1/3 h-6">
            <input
              type="text"
              placeholder="Search clients..."
              className="border rounded-l px-2 py-0.5 w-full h-6 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gray-100 border border-l-0 rounded-r px-2 h-6 flex items-center justify-center hover:bg-gray-200"
              disabled={isLoading}
            >
              <Search size={12} />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              className="border px-2 h-6 rounded flex items-center gap-1 hover:bg-gray-50"
              disabled={isLoading}
            >
              <Filter size={12} />
              <span>Sort</span>
            </button>

            <button
              className="bg-purple-100 text-purple-700 px-2 h-6 rounded hover:bg-purple-200"
              disabled={isLoading}
            >
              Manage Columns
            </button>

            <button
              className="bg-red-500 text-white px-2 h-6 rounded flex items-center gap-1 hover:bg-red-600"
              onClick={() => {
                resetForm();
                setIsDrawerOpen(true);
              }}
              disabled={isLoading}
            >
              <Plus size={12} />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading clients...
            </div>
          </div>
        )}

        {/* Companies table */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border text-left leading-none border-collapse">
              {/* ================= HEADER ================= */}
              <thead className="bg-gray-100">
                <tr className="h-6">
                  <th className="px-2 py-0.5 whitespace-nowrap">SR.NO</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Client Name</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Email</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Contact No</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Industry</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Business</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">RM</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Client Code</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Status</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Created</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Updated</th>
                  <th className="px-2 py-0.5 whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              {/* ================= BODY ================= */}
              <tbody>
                {companies.length > 0 ? (
                  companies.map((company, index) => (
                    <tr
                      key={company.id}
                      className="border-b hover:bg-gray-50 h-6"
                    >
                      {/* Serial Number */}
                      <td className="px-2 py-0.5 align-middle text-gray-600">
                        {index + 1}
                      </td>

                      {/* Client Name */}
                      <td className="px-2 py-0.5 font-semibold whitespace-nowrap">
                        <Link
                          to={`/InsideClientPage/${company.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {company.client_name || company.name}
                        </Link>
                      </td>

                      {/* Email */}
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        {company.email ? (
                          <MaskedDisplay
                            value={company.email}
                            type="email"
                            isMasked={maskedTableData[company.id]?.email ?? true}
                            onUnmask={() => toggleTableMask(company.id, "email")}
                            onMask={() => toggleTableMask(company.id, "email")}
                          />
                        ) : "-"}
                      </td>

                      {/* Contact Number */}
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        {company.contact_number ? (
                          <MaskedDisplay
                            value={company.contact_number}
                            type="phone"
                            isMasked={maskedTableData[company.id]?.contactNumber ?? true}
                            onUnmask={() => toggleTableMask(company.id, "contactNumber")}
                            onMask={() => toggleTableMask(company.id, "contactNumber")}
                          />
                        ) : "-"}
                      </td>

                      {/* Industry */}
                      <td className="px-2 py-0.5">{company.industry_type || "-"}</td>

                      {/* Business */}
                      <td className="px-2 py-0.5">{company.business_type || "-"}</td>

                      {/* RM */}
                      <td className="px-2 py-0.5">{company.relation_manager || "-"}</td>

                      {/* Client Code */}
                      <td className="px-2 py-0.5 font-mono">
                        {company.client_code || "-"}
                      </td>

                      {/* Status */}
                      <td className="px-2 py-0.5">
                        <span
                          className={`px-1.5 py-[1px] rounded text-[8px] font-semibold text-white ${
                            company.status === "Active"
                              ? "bg-green-500"
                              : company.status === "Inactive"
                              ? "bg-gray-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        {new Date(company.created_at).toLocaleDateString()}
                      </td>

                      {/* Updated */}
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        {new Date(company.updated_at).toLocaleDateString()}
                      </td>

                      {/* Actions with Dropdown */}
                      <td className="px-2 py-0.5">
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setOpenActionMenu(openActionMenu === company.id ? null : company.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical size={10} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openActionMenu === company.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-white border rounded-md shadow-lg z-10 py-1 text-[10px]">
                              <button
                                onClick={() => handleEdit(company)}
                                className="w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <Edit size={10} />
                                Edit
                              </button>
                              
                              <button
                                onClick={() => handleDelete(company.id)}
                                className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={10} />
                                Delete
                              </button>
                              
                              <button
                                onClick={() => handleOpenTasks(company)}
                                className="w-full text-left px-3 py-1.5 text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <Calendar size={10} />
                                Tasks
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-2 py-6 text-center text-gray-500">
                      <p className="text-[10px]">No clients found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Client Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
          <div className="bg-white h-full w-full max-w-4xl p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Client" : "Add New Client"}
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
              {/* Common fields for all client types */}
              <div className="grid grid-cols-2 gap-4">
                  
                <div>
                  <label className="block font-medium">Client Code *</label>
                  <input
                    type="text"
                    name="client_code"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.client_code}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    placeholder="Enter client code"
                  />
                </div>
               
                <div>
                  <label className="block font-medium">Client Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block font-medium">Email *</label>
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
                    <div className="mt-1 text-sm text-gray-600">
                      Preview: {maskedFields.email ? maskEmail(formData.email) : formData.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">PAN Number</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="panNumber"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {formData.panNumber && (
                      <button
                        type="button"
                        onClick={() => toggleMask('panNumber')}
                        className="mt-1 text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
                        title={maskedFields.panNumber ? "Show PAN" : "Mask PAN"}
                      >
                        {maskedFields.panNumber ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </div>
                  {formData.panNumber && (
                    <div className="mt-1 text-sm text-gray-600">
                      Preview: {maskedFields.panNumber ? maskPAN(formData.panNumber) : formData.panNumber}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-medium">Client Type *</label>
                  <select
                    name="clientType"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.clientType}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Client Type</option>
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Government">Government</option>
                    <option value="Non-Profit">Non-Profit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium">Address</label>
                <textarea
                  name="address"
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Pin Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="text-xs text-gray-500">API</span>
                </div>
                <div>
                  <label className="block font-medium">State</label>
                  <input
                    type="text"
                    name="state"
                    className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="text-xs text-gray-500">API</span>
                </div>
              </div>

              {/* Conditional fields based on client type */}
              {!isIndividualClient && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium">CIN Number</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="cinNumber"
                          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={formData.cinNumber}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                        {formData.cinNumber && (
                          <button
                            type="button"
                            onClick={() => toggleMask('cinNumber')}
                            className="mt-1 text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
                            title={maskedFields.cinNumber ? "Show CIN" : "Mask CIN"}
                          >
                            {maskedFields.cinNumber ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                        )}
                      </div>
                      {formData.cinNumber && (
                        <div className="mt-1 text-sm text-gray-600">
                          Preview: {maskedFields.cinNumber ? maskText(formData.cinNumber, 4) : formData.cinNumber}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium">Website</label>
                      <input
                        type="url"
                        name="website"
                        className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium">Industry Type</label>
                      <select
                        name="industryType"
                        className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={formData.industryType}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      >
                        <option value="">Select Industry</option>
                        <option value="IT">Information Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium">Business Type</label>
                      <select
                        name="businessType"
                        className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      >
                        <option value="">Select Business Type</option>
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                        <option value="B2G">B2G</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium">Contracts</label>
                    <textarea
                      name="contracts"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="2"
                      value={formData.contracts}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Enter contract details"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Relation Manager</label>
                    <input
                      type="text"
                      name="relationManager"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.relationManager}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Contact fields with conditional rendering note */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Contact Person</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="contactPerson"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.contactPerson}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, contactPerson: e.target.value }));
                        setContactSearch(e.target.value);
                      }}
                      onFocus={() => {
                        setShowContactDropdown(true);
                        if (contactsList.length === 0) {
                          fetchContactsList();
                        }
                      }}
                      disabled={isLoading}
                    />
                    
                    {/* Contact Person Dropdown */}
                    {showContactDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {/* Search input inside dropdown */}
                        <div className="p-2 border-b">
                          <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            value={contactSearch}
                            onChange={(e) => setContactSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        
                        {/* Loading state */}
                        {loadingContacts && (
                          <div className="px-4 py-2 text-gray-500">Loading contacts...</div>
                        )}
                        
                        {/* Error state */}
                        {contactError && (
                          <div className="px-4 py-2 text-red-500 text-sm">{contactError}</div>
                        )}
                        
                        {/* Contacts list */}
                        {!loadingContacts && !contactError && (
                          <>
                            {filteredContacts.length > 0 ? (
                              filteredContacts.map((contact, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                  onClick={() => handleContactSelect(contact)}
                                >
                                  <div className="font-medium">{contact.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {contact.phone && `${contact.phone} • `}
                                    {contact.email}
                                  </div>
                                </div>
                              ))
                            ) : contactSearch ? (
                              <div className="px-4 py-2 text-gray-500">No contacts found</div>
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No contacts available</div>
                            )}
                            
                            {/* Add manual contact button */}
                            {contactSearch && (
                              <div
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 bg-blue-50 border-t transition-colors font-medium text-blue-600"
                                onClick={handleAddManualContact}
                              >
                                + Add "{contactSearch}" as new contact
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isIndividualClient 
                      ? "Required for Individual clients" 
                      : "In Case of Company it's not required there"}
                  </p>
                </div>
                <div>
                  <label className="block font-medium">Contact Number</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      name="contactNumber"
                      className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {formData.contactNumber && (
                      <button
                        type="button"
                        onClick={() => toggleMask('contactNumber')}
                        className="mt-1 text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
                        title={maskedFields.contactNumber ? "Show number" : "Mask number"}
                      >
                        {maskedFields.contactNumber ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </div>
                  {formData.contactNumber && (
                    <div className="mt-1 text-sm text-gray-600">
                      Preview: {maskedFields.contactNumber ? maskPhoneNumber(formData.contactNumber) : formData.contactNumber}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {isIndividualClient 
                      ? "Required for Individual clients" 
                      : "In Case of Company it's not required there"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-medium">Status *</label>
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
                <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : editingId ? (
                    "Update Client"
                  ) : (
                    "Create Client"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Management Drawer */}
      {isTaskDrawerOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
          <div className="bg-white h-full w-full max-w-4xl p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-xl font-semibold">Task Management</h2>
                <p className="text-gray-600">Client: {selectedClient.client_name || selectedClient.name}</p>
              </div>
              <button 
                onClick={() => {
                  setIsTaskDrawerOpen(false);
                  setSelectedClient(null);
                  resetTaskForm();
                }} 
                className="text-gray-600 hover:text-black text-2xl transition-colors"
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
      )}
    </>
  );
};

export default CompaniesPage;