import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ChevronDown, ChevronRight, Users, Shield, Briefcase, Copy, Check, 
  Settings, Database, FileText, Headphones, Plane, Bus, Hotel, ShieldCheck, 
  Receipt, Calendar, DollarSign, CreditCard, Truck, PlaneLand, Globe, ChevronUp,
  Notebook, CalendarDays, Umbrella, MessageSquare, User, FileBox, ListChecks,
  UserCheck, Clock, Building2, Gift, MapPin, LifeBuoy, FileSpreadsheet,
  Bell, Wallet, ListTodo, Building, Banknote, Calculator, HelpCircle, Car,
  PartyPopper, Sheet, List, File, CreditCard as CreditCardIcon, Plus, Minus, AlertCircle,
  TrendingUp, TrendingDown, Clock as ClockIcon, DollarSign as DollarIcon, Calendar as CalendarIcon,
  Moon, Sunrise, Sunset, MapPinned, Navigation, Store, Edit2, Trash2, Search, X,
  ToggleLeft, ToggleRight
} from 'lucide-react';

const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';

const leaveTypesDefault = [
  'Sick Leave',
  'Casual Leave',
  'Earned Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Compensatory Leave',
];

// Available pages/modules for access control - Complete with all pages
const availablePages = [
  { id: 'note', name: 'Note', icon: '📝', category: 'Quick Access', parent: null, isCategory: false, path: '/Note' },
  { id: 'calendar', name: 'Calendar', icon: '📅', category: 'Quick Access', parent: null, isCategory: false, path: '/calendar' },
  { id: 'vacations', name: 'Vacations', icon: '🏖️', category: 'Quick Access', parent: null, isCategory: false, path: '/vacations' },
  { id: 'employees', name: 'Employees', icon: '👥', category: 'Quick Access', parent: null, isCategory: false, path: '/employees', hrOnly: true },
  { id: 'messenger', name: 'Messenger', icon: '💬', category: 'Quick Access', parent: null, isCategory: false, path: '/messenger', hrOnly: true },
  { id: 'myProfile', name: 'My Profile', icon: '👤', category: 'Quick Access', parent: null, isCategory: false, path: '/Employees/{EmpId}' },
  { id: 'reimbForm', name: 'ReimbForm', icon: '💰', category: 'Quick Access', parent: null, isCategory: false, path: '/ReimbursementForm' },
  { id: 'reimbList', name: 'ReimbList', icon: '📋', category: 'Quick Access', parent: null, isCategory: false, path: '/ReimbursementList' },
  { id: 'empFormList', name: 'EmpFormList', icon: '📝', category: 'Quick Access', parent: null, isCategory: false, path: '/EmpFormList', hrOnly: true },
  { id: 'attendance', name: 'Attendance', icon: '⏰', category: 'Quick Access', parent: null, isCategory: false, path: '/attendance', hrOnly: true },
  { id: 'sales', name: 'Sales', icon: '💰', category: 'Sales', parent: null, isCategory: true },
  { id: 'leads', name: 'Leads', icon: '🔔', category: 'Sales', parent: 'sales', path: '/Leads' },
  { id: 'contacts', name: 'Contacts', icon: '⚙️', category: 'Sales', parent: 'sales', path: '/contact' },
  { id: 'client', name: 'Client', icon: '🔔', category: 'Sales', parent: 'sales', path: '/CompaniesPage' },
  { id: 'accounts', name: 'Accounts', icon: '🏢', category: 'Accounts', parent: null, isCategory: true },
  { id: 'payments', name: 'Payments', icon: '💰', category: 'Accounts', parent: 'accounts' },
  { id: 'upcoming', name: 'Up Coming', icon: '👥', category: 'Accounts', parent: 'payments', path: '/accounts/upcoming' },
  { id: 'toBePay', name: 'To Be Pay', icon: '👥', category: 'Accounts', parent: 'payments', path: '/accounts/tobepay' },
  { id: 'paid', name: 'Paid', icon: '👥', category: 'Accounts', parent: 'payments', path: '/accounts/paid' },
  { id: 'receipt', name: 'Receipt', icon: '💰', category: 'Accounts', parent: 'accounts', path: '/accounts/receipt' },
  { id: 'accountSettings', name: 'Settings', icon: '⚙️', category: 'Accounts', parent: 'accounts', path: '/accounts/settings' },
  { id: 'reconciliation', name: 'Reconciliation', icon: '🧮', category: 'Accounts', parent: 'accounts', path: '/accounts/reconciliation' },
  { id: 'project', name: 'Project', icon: '💼', category: 'Project', parent: null, isCategory: false, path: '/WonLeadsListing' },
  { id: 'vendor', name: 'Vendor', icon: '👥', category: 'Vendor', parent: null, isCategory: false, path: '/accounts/vendor' },
  { id: 'operation', name: 'Operation', icon: '⚙️', category: 'Operation', parent: null, isCategory: true },
  { id: 'setup', name: 'SetUp', icon: '👥', category: 'Operation', parent: 'operation', path: '/operations/SetupPage' },
  { id: 'guestDatabase', name: 'Guest Database', icon: '🗄️', category: 'Operation', parent: 'operation', path: '/operations/Gestlist' },
  { id: 'formsListing', name: 'FormsListing', icon: '📄', category: 'Operation', parent: 'operation', path: '/operations/FormsByLead' },
  { id: 'support', name: 'Support', icon: '❓', category: 'Operation', parent: 'operation', path: '/operations/LeadFormsPage' },
  { id: 'flightTicketing', name: 'Flight Ticketing', icon: '✈️', category: 'Operation', parent: 'operation', path: '/operations/flight' },
  { id: 'transitCabBus', name: 'Transit Cab & Bus', icon: '🚗', category: 'Operation', parent: 'operation', path: '/operations/CabManagementPage' },
  { id: 'hotels', name: 'Hotels', icon: '🏨', category: 'Operation', parent: 'operation', path: '/operations/Hotel' },
  { id: 'insurance', name: 'Insurance', icon: '🏨', category: 'Operation', parent: 'operation', path: '/operations/InsurancePage' },
  { id: 'visa', name: 'Visa', icon: '🌐', category: 'Operation', parent: 'operation', path: '/operations/visa' },
  { id: 'reimbursements', name: 'Reimbursements', icon: '💳', category: 'Operation', parent: 'operation', path: '/operations/reimbursements' },
  { id: 'events', name: 'Events', icon: '🎉', category: 'Operation', parent: 'operation', path: '/operations/events' },
  { id: 'costSheets', name: 'Cost Sheets', icon: '📊', category: 'Operation', parent: 'operation', path: '/operations/cost-sheets' },
  { id: 'vendorPayments', name: 'Vendor Payments', icon: '💰', category: 'Operation', parent: 'operation', path: '/operations/vendor-payments' },
  { id: 'vendorList', name: 'Vendor List', icon: '📋', category: 'Operation', parent: 'operation', path: '/operations/OprationVendor' },
  { id: 'flightStatus', name: 'Flight Status', icon: '📋', category: 'Operation', parent: 'operation', path: '/operations/FlightLiveMian' },
];

const availableActions = ['view', 'create', 'edit', 'delete', 'approve'];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('leaves');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedPages, setExpandedPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Overtime Rules State (Updated with Expire Days)
  const [overtimeRules, setOvertimeRules] = useState({
    minimumOvertimeHours: 1,
    overtimeCompensationOption: 'compensatory_leave',
    allowCompensatoryLeave: true,
    allowOvertimePayment: false,
    allowTimeOffAdjustment: false,
    compensatoryLeaveExpireDays: 30 // New field with default 30 days
  });
  
  // Late Threshold Rules State (Simplified)
  const [lateThresholdRules, setLateThresholdRules] = useState({
    officeStartTime: '09:00',
    halfDayLateThresholdMinutes: 15,
    lateCompensationOption: 'half_salary_deduction',
    halfSalaryDeductionEnabled: true,
    allowOvertimeAdjustmentForLateArrival: false
  });
  
  // Leave Settings State
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [leaveStatus, setLeaveStatus] = useState({});
  const [workingHours, setWorkingHours] = useState(8);
  const [workingDays, setWorkingDays] = useState(5);
  const [customLeaveName, setCustomLeaveName] = useState('');
  const [customLeaves, setCustomLeaves] = useState([]);
  const [leaveQuotas, setLeaveQuotas] = useState({});
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(15);
  
  // Company Branches State
  const [companyBranches, setCompanyBranches] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    is_headquarters: false,
    working_hours: { start: '09:00', end: '18:00' },
    timezone: 'Asia/Kolkata',
    employee_count: 0
  });

  // Authorization states
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [designationPermissions, setDesignationPermissions] = useState({});
  const [expandedDesignation, setExpandedDesignation] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [copySuccess, setCopySuccess] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Quick Access', 'Sales', 'Accounts', 'Project', 'Vendor', 'Operation'];

  const topLevelCategories = [
    { id: 'quickAccess', name: 'Quick Access', icon: '⚡', category: 'Quick Access', parent: null, isCategory: true },
    { id: 'sales', name: 'Sales', icon: '💰', category: 'Sales', parent: null, isCategory: true },
    { id: 'accounts', name: 'Accounts', icon: '🏢', category: 'Accounts', parent: null, isCategory: true },
    { id: 'project', name: 'Project', icon: '💼', category: 'Project', parent: null, isCategory: true },
    { id: 'vendor', name: 'Vendor', icon: '👥', category: 'Vendor', parent: null, isCategory: true },
    { id: 'operation', name: 'Operation', icon: '⚙️', category: 'Operation', parent: null, isCategory: true },
  ];
  
  const getChildren = (parentId) => {
    return availablePages.filter(page => page.parent === parentId);
  };

  const getAllDescendants = (pageId) => {
    const children = getChildren(pageId);
    let descendants = [...children];
    children.forEach(child => {
      descendants = [...descendants, ...getAllDescendants(child.id)];
    });
    return descendants;
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const togglePageExpand = (pageId) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const handleGrantWithDescendants = (designation, pageId) => {
    const allPages = [pageId, ...getAllDescendants(pageId).map(p => p.id)];
    
    allPages.forEach(pageId => {
      const allActionsGranted = {};
      availableActions.forEach(action => {
        allActionsGranted[action] = true;
      });
      
      setDesignationPermissions(prev => ({
        ...prev,
        [designation]: {
          ...(prev[designation] || {}),
          [pageId]: allActionsGranted
        }
      }));
    });
  };

  const allLeaveTypes = [...leaveTypesDefault, ...customLeaves];

  // Handle Overtime Compensation Option Change
  const handleOvertimeOptionChange = (option) => {
    setOvertimeRules(prev => ({
      ...prev,
      overtimeCompensationOption: option,
      allowCompensatoryLeave: option === 'compensatory_leave',
      allowOvertimePayment: option === 'overtime_payment',
      allowTimeOffAdjustment: option === 'time_off_adjustment'
    }));
  };

  // Handle Late Compensation Option Change
  const handleLateOptionChange = (option) => {
    setLateThresholdRules(prev => ({
      ...prev,
      lateCompensationOption: option,
      halfSalaryDeductionEnabled: option === 'half_salary_deduction',
      allowOvertimeAdjustmentForLateArrival: option === 'overtime_adjustment'
    }));
  };

  // ============ API INTEGRATION FUNCTIONS ============

  // Fetch Leave Settings
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-settings/leave-settings`);
      const data = await response.json();

      setWorkingHours(data.workingHours || 8);
      setWorkingDays(data.workingDays || 5);
      setLeaveStatus(data.leaveStatus || {});
      setLeaveQuotas(data.leaveQuotas || {});
      setCustomLeaves(data.customLeaves || []);
      setSelectedLeaves(data.selectedLeaves || []);
      setLateThresholdMinutes(data.lateThresholdMinutes || 15);
      
      // Load simplified overtime rules with expire days
      if (data.overtimeRules) {
        let option = 'compensatory_leave';
        if (data.overtimeRules.allowOvertimePayment) option = 'overtime_payment';
        if (data.overtimeRules.allowTimeOffAdjustment) option = 'time_off_adjustment';
        
        setOvertimeRules({
          minimumOvertimeHours: data.overtimeRules.minimumOvertimeHours || 1,
          overtimeCompensationOption: option,
          allowCompensatoryLeave: data.overtimeRules.allowCompensatoryLeave || option === 'compensatory_leave',
          allowOvertimePayment: data.overtimeRules.allowOvertimePayment || option === 'overtime_payment',
          allowTimeOffAdjustment: data.overtimeRules.allowTimeOffAdjustment || option === 'time_off_adjustment',
          compensatoryLeaveExpireDays: data.overtimeRules.compensatoryLeaveExpireDays || 30
        });
      }
      
      // Load simplified late threshold rules
      if (data.lateThresholdRules) {
        let option = 'half_salary_deduction';
        if (data.lateThresholdRules.allowOvertimeAdjustmentForLateArrival) option = 'overtime_adjustment';
        
        setLateThresholdRules({
          officeStartTime: data.lateThresholdRules.officeStartTime || '09:00',
          halfDayLateThresholdMinutes: data.lateThresholdRules.halfDayLateThresholdMinutes || 15,
          lateCompensationOption: option,
          halfSalaryDeductionEnabled: data.lateThresholdRules.halfSalaryDeductionEnabled ?? (option === 'half_salary_deduction'),
          allowOvertimeAdjustmentForLateArrival: data.lateThresholdRules.allowOvertimeAdjustmentForLateArrival ?? (option === 'overtime_adjustment')
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Company Branches from API
  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leave-settings/company-branches`);
      const data = await response.json();
      setCompanyBranches(data.branches || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setCompanyBranches([]);
    } finally {
      setBranchLoading(false);
    }
  };

  // Save Branch (Create or Update)
  const saveBranch = async () => {
    if (!branchFormData.name || !branchFormData.city) {
      alert('Please fill required fields (Name and City)');
      return;
    }

    setSaving(true);
    try {
      const url = editingBranch 
        ? `${API_BASE_URL}/company-branches/${editingBranch.id}`
        : `${API_BASE_URL}/company-branches`;
      
      const method = editingBranch ? 'PUT' : 'POST';
      
      const branchData = {
        name: branchFormData.name,
        address: branchFormData.address,
        city: branchFormData.city,
        state: branchFormData.state,
        country: branchFormData.country,
        pincode: branchFormData.pincode,
        latitude: branchFormData.latitude ? parseFloat(branchFormData.latitude) : null,
        longitude: branchFormData.longitude ? parseFloat(branchFormData.longitude) : null,
        phone: branchFormData.phone,
        email: branchFormData.email,
        is_headquarters: branchFormData.is_headquarters,
        working_hours: branchFormData.working_hours,
        timezone: branchFormData.timezone,
        employee_count: branchFormData.employee_count || 0
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData)
      });
      
      if (response.ok) {
        alert(editingBranch ? 'Branch updated successfully!' : 'Branch added successfully!');
        await fetchBranches();
        setShowBranchModal(false);
        resetBranchForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save branch'}`);
      }
    } catch (err) {
      console.error('Error saving branch:', err);
      alert('Error saving branch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Branch
  const deleteBranch = async (branchId) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/company-branches/${branchId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Branch deleted successfully!');
        await fetchBranches();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete branch'}`);
      }
    } catch (err) {
      console.error('Error deleting branch:', err);
      alert('Error deleting branch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Edit Branch (populate form)
  const editBranch = (branch) => {
    setEditingBranch(branch);
    setBranchFormData({
      name: branch.name,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || 'India',
      pincode: branch.pincode || '',
      latitude: branch.latitude || '',
      longitude: branch.longitude || '',
      phone: branch.phone || '',
      email: branch.email || '',
      is_headquarters: branch.is_headquarters || false,
      working_hours: branch.working_hours || { start: '09:00', end: '18:00' },
      timezone: branch.timezone || 'Asia/Kolkata',
      employee_count: branch.employee_count || 0
    });
    setShowBranchModal(true);
  };

  const resetBranchForm = () => {
    setBranchFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
      is_headquarters: false,
      working_hours: { start: '09:00', end: '18:00' },
      timezone: 'Asia/Kolkata',
      employee_count: 0
    });
    setEditingBranch(null);
  };

  const getCoordinatesFromAddress = async () => {
    const addressParts = [
      branchFormData.address,
      branchFormData.city,
      branchFormData.state,
      branchFormData.country
    ].filter(part => part && part.trim());
    
    const address = addressParts.join(', ');
    
    if (!address) {
      alert('Please enter address details first');
      return;
    }
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setBranchFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
        alert('Coordinates fetched successfully!');
      } else {
        alert('Could not find coordinates for this address. Please enter manually.');
      }
    } catch (err) {
      console.error('Error fetching coordinates:', err);
      alert('Error fetching coordinates. Please enter manually.');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBranchFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          alert('Current location set!');
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      const data = await response.json();
      setEmployees(data);
      
      const uniqueDesignations = [...new Map(data.map(emp => [emp.designation, emp.designation])).values()];
      setDesignations(uniqueDesignations);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // Fetch designation permissions
  const fetchDesignationPermissions = async (designation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/designation-permissions/${encodeURIComponent(designation)}`);
      const data = await response.json();
      setDesignationPermissions(prev => ({
        ...prev,
        [designation]: data.permissions || {}
      }));
    } catch (err) {
      console.error('Failed to fetch designation permissions:', err);
    }
  };

  // Save all settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        workingHours,
        workingDays,
        leaveTypes: allLeaveTypes,
        customLeaves,
        leaveStatus,
        leaveQuotas,
        selectedLeaves,
        lateThresholdMinutes,
        overtimeRules: {
          minimumOvertimeHours: overtimeRules.minimumOvertimeHours,
          allowCompensatoryLeave: overtimeRules.allowCompensatoryLeave,
          allowOvertimePayment: overtimeRules.allowOvertimePayment,
          allowTimeOffAdjustment: overtimeRules.allowTimeOffAdjustment,
          compensatoryLeaveExpireDays: overtimeRules.compensatoryLeaveExpireDays
        },
        lateThresholdRules: {
          officeStartTime: lateThresholdRules.officeStartTime,
          halfDayLateThresholdMinutes: lateThresholdRules.halfDayLateThresholdMinutes,
          halfSalaryDeductionEnabled: lateThresholdRules.halfSalaryDeductionEnabled,
          allowOvertimeAdjustmentForLateArrival: lateThresholdRules.allowOvertimeAdjustmentForLateArrival
        }
      };
      
      const response = await fetch(`${API_BASE_URL}/leave-settings/leave-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings.');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Settings saved successfully!');
        fetchSettings();
      } else {
        alert('❌ Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveToggle = (type) => {
    const updatedStatus = { ...leaveStatus, [type]: !leaveStatus[type] };
    setLeaveStatus(updatedStatus);

    if (!updatedStatus[type]) {
      setSelectedLeaves(prev => prev.filter(l => l !== type));
    } else {
      setSelectedLeaves(prev => [...new Set([...prev, type])]);
    }
  };

  const handleCreateCustomLeave = () => {
    const trimmed = customLeaveName.trim();
    if (!trimmed) return alert('Enter a name for the custom leave.');
    if (leaveStatus[trimmed]) return alert('This leave already exists.');

    setCustomLeaves([...customLeaves, trimmed]);
    setLeaveStatus(prev => ({ ...prev, [trimmed]: true }));
    setLeaveQuotas(prev => ({ ...prev, [trimmed]: { yearly: 0, monthly: 0 } }));
    setSelectedLeaves(prev => [...prev, trimmed]);
    setCustomLeaveName('');
  };

  const handlePermissionToggle = (designation, pageId, action) => {
    setDesignationPermissions(prev => {
      const currentPermissions = prev[designation] || {};
      const currentPagePermissions = currentPermissions[pageId] || {};
      
      return {
        ...prev,
        [designation]: {
          ...currentPermissions,
          [pageId]: {
            ...currentPagePermissions,
            [action]: !currentPagePermissions[action]
          }
        }
      };
    });
  };

  const handleGrantAllPermissions = (designation, pageId) => {
    const allActionsGranted = {};
    availableActions.forEach(action => {
      allActionsGranted[action] = true;
    });
    
    setDesignationPermissions(prev => ({
      ...prev,
      [designation]: {
        ...(prev[designation] || {}),
        [pageId]: allActionsGranted
      }
    }));
  };

  const handleRevokeAllPermissions = (designation, pageId) => {
    setDesignationPermissions(prev => ({
      ...prev,
      [designation]: {
        ...(prev[designation] || {}),
        [pageId]: {}
      }
    }));
  };

  const copyPermissionsFromDesignation = (sourceDesignation, targetDesignation) => {
    const sourcePermissions = designationPermissions[sourceDesignation];
    if (!sourcePermissions) {
      alert('No permissions set for source designation');
      return;
    }
    
    setDesignationPermissions(prev => ({
      ...prev,
      [targetDesignation]: JSON.parse(JSON.stringify(sourcePermissions))
    }));
    
    setCopySuccess({ [targetDesignation]: true });
    setTimeout(() => {
      setCopySuccess({});
    }, 2000);
  };

  const saveDesignationPermissions = async (designation, applyToEmployees = false) => {
    try {
      const permissions = designationPermissions[designation];
      
      const response = await fetch(`${API_BASE_URL}/designation-permissions/${encodeURIComponent(designation)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save designation permissions');
      }
      
      if (applyToEmployees) {
        const employeesWithDesignation = employees.filter(emp => emp.designation === designation);
        
        const savePromises = employeesWithDesignation.map(employee => 
          fetch(`${API_BASE_URL}/employee-permissions/${employee.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions })
          })
        );
        
        await Promise.all(savePromises);
        alert(`✅ Permissions saved for designation "${designation}" and applied to ${employeesWithDesignation.length} employee(s)!`);
      } else {
        alert(`✅ Permissions saved for designation "${designation}"!`);
      }
    } catch (err) {
      console.error('Error saving permissions:', err);
      alert('Error saving permissions.');
    }
  };

  const toggleDesignationExpand = (designation) => {
    if (expandedDesignation === designation) {
      setExpandedDesignation(null);
    } else {
      setExpandedDesignation(designation);
      if (!designationPermissions[designation]) {
        fetchDesignationPermissions(designation);
      }
    }
  };

  const getEmployeeCountByDesignation = (designation) => {
    return employees.filter(emp => emp.designation === designation).length;
  };

  const getEmployeesByDesignation = (designation) => {
    return employees.filter(emp => emp.designation === designation);
  };

  const filteredBranches = companyBranches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.city && branch.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (branch.address && branch.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchSettings();
    fetchEmployees();
    fetchBranches();
  }, []);

  // Radio Button Component
  const RadioGroup = ({ options, value, onChange, name, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-sky-600 focus:ring-sky-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-800">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              )}
            </div>
            {value === option.value && (
              <CheckCircle className="w-5 h-5 text-sky-600" />
            )}
          </label>
        ))}
      </div>
    </div>
  );

  // Overtime Utilization Component with Radio Buttons and Expire Days
  const OvertimeUtilizationConfig = () => {
    const overtimeOptions = [
      {
        value: 'compensatory_leave',
        label: 'Allow Compensatory Leave',
        description: 'Employee can convert overtime into leave days'
      },
      {
        value: 'overtime_payment',
        label: 'Allow Overtime Payment',
        description: 'Employee can receive monetary compensation for overtime hours'
      },
      {
        value: 'time_off_adjustment',
        label: 'Allow Time-Off Adjustment',
        description: 'Employee can use accumulated overtime to take time off'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">Overtime Utilization Rules</h3>
          </div>
          
          <div className="space-y-6">
            {/* Minimum Overtime Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Overtime Hours
              </label>
              <input 
                type="number" 
                min="0" 
                max="24" 
                step="0.5"
                value={overtimeRules.minimumOvertimeHours} 
                onChange={(e) => setOvertimeRules(prev => ({ 
                  ...prev, 
                  minimumOvertimeHours: parseFloat(e.target.value) 
                }))} 
                className="w-48 p-2 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum overtime required before overtime is counted. Example: If set to 1, overtime is only counted after completing at least 1 extra hour.
              </p>
            </div>

            {/* Compensatory Leave Expire Days - NEW */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compensatory Leave Expire Days
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      (Only applies when "Allow Compensatory Leave" is selected)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="0" 
                      max="365" 
                      step="1"
                      value={overtimeRules.compensatoryLeaveExpireDays || 30} 
                      onChange={(e) => setOvertimeRules(prev => ({ 
                        ...prev, 
                        compensatoryLeaveExpireDays: parseInt(e.target.value) || 0 
                      }))} 
                      className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      disabled={overtimeRules.overtimeCompensationOption !== 'compensatory_leave'}
                    />
                    <span className="text-sm text-gray-500">days</span>
                    {overtimeRules.overtimeCompensationOption !== 'compensatory_leave' && (
                      <span className="text-xs text-gray-400 italic">
                        (Enable "Allow Compensatory Leave" to configure)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {overtimeRules.compensatoryLeaveExpireDays === 0 ? 
                      '⚠️ Set to 0: Compensatory leave will expire immediately (not recommended)' :
                      `The number of days after a Compensatory Leave is credited during which it remains valid. Once this period ends (${overtimeRules.compensatoryLeaveExpireDays} days), the Compensatory Leave expires and cannot be used.`
                    }
                  </p>
                  {overtimeRules.compensatoryLeaveExpireDays > 0 && overtimeRules.overtimeCompensationOption === 'compensatory_leave' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700">
                        💡 Example: If Expire Days = {overtimeRules.compensatoryLeaveExpireDays}, 
                        an employee must use the Compensatory Leave within {overtimeRules.compensatoryLeaveExpireDays} days 
                        from the date it was earned. After {overtimeRules.compensatoryLeaveExpireDays} days, 
                        the leave expires and can no longer be used.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Radio Group for Overtime Compensation */}
            <RadioGroup
              options={overtimeOptions}
              value={overtimeRules.overtimeCompensationOption}
              onChange={handleOvertimeOptionChange}
              name="overtimeCompensation"
              label="Select Overtime Compensation Method"
            />
          </div>
        </div>

        {/* Summary Card - Updated to include Expire Days */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">📋 Overtime Rules Summary</h4>
          <div className="text-sm space-y-1 text-gray-700">
            <p>• <strong>Minimum Overtime Hours:</strong> {overtimeRules.minimumOvertimeHours} hour(s)</p>
            <p>• <strong>Selected Option:</strong> {
              overtimeRules.overtimeCompensationOption === 'compensatory_leave' ? 'Compensatory Leave' :
              overtimeRules.overtimeCompensationOption === 'overtime_payment' ? 'Overtime Payment' :
              'Time-Off Adjustment'
            }</p>
            {overtimeRules.overtimeCompensationOption === 'compensatory_leave' && (
              <p>• <strong>Compensatory Leave Expire Days:</strong> {
                overtimeRules.compensatoryLeaveExpireDays === 0 ? 'Immediate Expiry' : `${overtimeRules.compensatoryLeaveExpireDays} days`
              }</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Late Threshold Configuration Component with Radio Buttons
  const LateThresholdConfig = () => {
    const lateOptions = [
      {
        value: 'half_salary_deduction',
        label: 'Half-Salary Deduction',
        description: 'Deduct half-day salary when late threshold is exceeded'
      },
      {
        value: 'overtime_adjustment',
        label: 'Allow Overtime Adjustment for Late Arrival',
        description: 'Employee can use accumulated overtime hours to offset late arrival penalties'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-semibold text-gray-800">Late Threshold Rules</h3>
          </div>

          <div className="space-y-6">
            {/* Office Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Start Time
              </label>
              <input 
                type="time" 
                value={lateThresholdRules.officeStartTime} 
                onChange={(e) => setLateThresholdRules(prev => ({ 
                  ...prev, 
                  officeStartTime: e.target.value 
                }))} 
                className="w-48 p-2 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Official shift start time. Example: 09:00
              </p>
            </div>

            {/* Half-Day Late Threshold Minutes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Half-Day Late Threshold (Minutes)
              </label>
              <input 
                type="number" 
                min="0" 
                max="480" 
                step="15"
                value={lateThresholdRules.halfDayLateThresholdMinutes} 
                onChange={(e) => setLateThresholdRules(prev => ({ 
                  ...prev, 
                  halfDayLateThresholdMinutes: parseInt(e.target.value) 
                }))} 
                className="w-48 p-2 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                If an employee arrives after this threshold, it is marked as a half-day.
              </p>
            </div>

            {/* Radio Group for Late Compensation */}
            <RadioGroup
              options={lateOptions}
              value={lateThresholdRules.lateCompensationOption}
              onChange={handleLateOptionChange}
              name="lateCompensation"
              label="Select Late Arrival Handling Method"
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
          <h4 className="font-semibold text-gray-800 mb-2">📋 Late Arrival Rules Summary</h4>
          <div className="text-sm space-y-1 text-gray-700">
            <p>• <strong>Office Start Time:</strong> {lateThresholdRules.officeStartTime}</p>
            <p>• <strong>Half-Day Threshold:</strong> {lateThresholdRules.halfDayLateThresholdMinutes} minutes late</p>
            <p>• <strong>Selected Option:</strong> {
              lateThresholdRules.lateCompensationOption === 'half_salary_deduction' ? 'Half-Salary Deduction' :
              'Overtime Adjustment for Late Arrival'
            }</p>
          </div>
        </div>
      </div>
    );
  };

  // Company Branches Component
  const CompanyBranchesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Company Branches</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage multiple branch locations with their coordinates and details
          </p>
        </div>
        <button
          onClick={() => {
            resetBranchForm();
            setShowBranchModal(true);
          }}
          disabled={saving}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search branches by name, city, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Loading State */}
      {branchLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading branches...</p>
        </div>
      )}

      {/* Branches Grid */}
      {!branchLoading && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBranches.map((branch) => {
              const latitude = branch.latitude ? parseFloat(branch.latitude) : null;
              const longitude = branch.longitude ? parseFloat(branch.longitude) : null;
              
              return (
                <div key={branch.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className={`p-4 ${branch.is_headquarters ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gray-50'} border-b`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-sky-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{branch.name}</h3>
                          {branch.is_headquarters && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                              Headquarters
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editBranch(branch)} className="p-1 hover:bg-gray-200 rounded transition">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => deleteBranch(branch.id)} className="p-1 hover:bg-red-100 rounded transition" disabled={saving}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">{branch.address || 'Address not provided'}</p>
                        <p className="text-gray-500 text-xs">
                          {branch.city || ''}{branch.state ? `, ${branch.state}` : ''}{branch.pincode ? ` - ${branch.pincode}` : ''}
                        </p>
                        <p className="text-gray-500 text-xs">{branch.country || 'India'}</p>
                      </div>
                    </div>

                    {(latitude !== null || longitude !== null) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <Navigation className="w-3 h-3" />
                        <span>
                          Lat: {latitude !== null ? latitude.toFixed(6) : 'N/A'}, 
                          Lng: {longitude !== null ? longitude.toFixed(6) : 'N/A'}
                        </span>
                      </div>
                    )}

                    {branch.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{branch.email}</span>
                      </div>
                    )}

                    {branch.working_hours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-2 mt-2">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {branch.working_hours.start} - {branch.working_hours.end} ({branch.timezone || 'Asia/Kolkata'})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-3 h-3" />
                      <span className="text-xs">{branch.employee_count || 0} employees</span>
                    </div>
                  </div>

                  {(latitude !== null && longitude !== null) && (
                    <div className="px-4 pb-3">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <MapPinned className="w-3 h-3" />
                        View on Map
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredBranches.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No branches found. Click "Add Branch" to create one.</p>
            </div>
          )}

          {companyBranches.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-2">📊 Branch Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Branches</p>
                  <p className="text-2xl font-bold text-sky-600">{companyBranches.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Headquarters</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {companyBranches.filter(b => b.is_headquarters).length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Employees</p>
                  <p className="text-2xl font-bold text-green-600">
                    {companyBranches.reduce((sum, b) => sum + (b.employee_count || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Countries</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(companyBranches.map(b => b.country).filter(c => c)).size}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button onClick={() => { setShowBranchModal(false); resetBranchForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g., Mumbai Headquarters"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" value={branchFormData.address} onChange={(e) => setBranchFormData(prev => ({ ...prev, address: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="Street address" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
                  <input type="text" value={branchFormData.city} onChange={(e) => setBranchFormData(prev => ({ ...prev, city: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="City" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" value={branchFormData.state} onChange={(e) => setBranchFormData(prev => ({ ...prev, state: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="State" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" value={branchFormData.country} onChange={(e) => setBranchFormData(prev => ({ ...prev, country: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="Country" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input type="text" value={branchFormData.pincode} onChange={(e) => setBranchFormData(prev => ({ ...prev, pincode: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="Pincode" />
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">GPS Coordinates</label>
                  <div className="flex gap-2">
                    <button onClick={getCoordinatesFromAddress} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200" type="button">🌍 Get from Address</button>
                    <button onClick={getCurrentLocation} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200" type="button">📍 Current Location</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                    <input type="number" step="any" value={branchFormData.latitude} onChange={(e) => setBranchFormData(prev => ({ ...prev, latitude: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="e.g., 19.1136" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                    <input type="number" step="any" value={branchFormData.longitude} onChange={(e) => setBranchFormData(prev => ({ ...prev, longitude: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="e.g., 72.8697" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" value={branchFormData.phone} onChange={(e) => setBranchFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="Contact number" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={branchFormData.email} onChange={(e) => setBranchFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full p-2 border rounded-md" placeholder="branch@company.com" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Working Hours Start</label>
                  <input type="time" value={branchFormData.working_hours.start} onChange={(e) => setBranchFormData(prev => ({ ...prev, working_hours: { ...prev.working_hours, start: e.target.value } }))} className="w-full p-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Working Hours End</label>
                  <input type="time" value={branchFormData.working_hours.end} onChange={(e) => setBranchFormData(prev => ({ ...prev, working_hours: { ...prev.working_hours, end: e.target.value } }))} className="w-full p-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select value={branchFormData.timezone} onChange={(e) => setBranchFormData(prev => ({ ...prev, timezone: e.target.value }))} className="w-full p-2 border rounded-md">
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="Asia/Dubai">GST (Asia/Dubai)</option>
                    <option value="Asia/Singapore">SGT (Asia/Singapore)</option>
                    <option value="America/New_York">EST (America/New_York)</option>
                    <option value="Europe/London">GMT (Europe/London)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isHeadquarters" checked={branchFormData.is_headquarters} onChange={(e) => setBranchFormData(prev => ({ ...prev, is_headquarters: e.target.checked }))} className="rounded border-gray-300" />
                <label htmlFor="isHeadquarters" className="text-sm text-gray-700">This is the Headquarters / Main Office</label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-2">
              <button onClick={() => { setShowBranchModal(false); resetBranchForm(); }} className="px-4 py-2 border rounded-md hover:bg-gray-100" disabled={saving}>Cancel</button>
              <button onClick={saveBranch} disabled={saving} className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:opacity-50 flex items-center gap-2">
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {editingBranch ? 'Update Branch' : 'Add Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render nested page structure
  const renderNestedPage = (page, designation, level = 0) => {
    const children = getChildren(page.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedPages[page.id];
    const desigPerms = designationPermissions[designation]?.[page.id] || {};
    const hasAnyPermission = Object.values(desigPerms).some(v => v === true);
    
    return (
      <div key={page.id} style={{ marginLeft: `${level * 20}px` }} className="mb-2">
        <div className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition ${level > 0 ? 'border-l-4 border-l-gray-300' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button onClick={() => togglePageExpand(page.id)} className="p-0.5 hover:bg-gray-100 rounded">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
              )}
              <span className="text-lg">{page.icon}</span>
              <span className={`font-medium ${level === 0 ? 'text-gray-800' : 'text-gray-700'}`}>{page.name}</span>
              {page.hrOnly && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">HR Only</span>}
            </div>
            {hasAnyPermission && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {availableActions.map((action) => (
              <label key={action} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={desigPerms[action] || false} onChange={() => handlePermissionToggle(designation, page.id, action)} className="rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                <span className="capitalize text-gray-600">{action}</span>
              </label>
            ))}
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={() => handleGrantAllPermissions(designation, page.id)} className="text-xs text-blue-600 hover:text-blue-700">Grant All</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => handleRevokeAllPermissions(designation, page.id)} className="text-xs text-red-600 hover:text-red-700">Revoke All</button>
            {hasChildren && <>
              <span className="text-gray-300">|</span>
              <button onClick={() => handleGrantWithDescendants(designation, page.id)} className="text-xs text-purple-600 hover:text-purple-700">Grant All (Including Sub-pages)</button>
            </>}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2">{children.map(child => renderNestedPage(child, designation, level + 1))}</div>
        )}
      </div>
    );
  };

  const getPagesByCategory = (categoryName) => {
    return availablePages.filter(page => page.category === categoryName && page.parent === null);
  };

  const renderCategory = (category, designation) => {
    const isExpanded = expandedCategories[category.id];
    const pages = getPagesByCategory(category.name);
    const allDescendants = availablePages.filter(page => page.category === category.name);
    
    return (
      <div key={category.id} className="mb-4">
        <div className={`bg-gradient-to-r rounded-lg p-3 cursor-pointer hover:shadow-md transition mb-2 ${category.name === 'Quick Access' ? 'from-purple-50 to-pink-50' : category.name === 'Sales' ? 'from-green-50 to-emerald-50' : category.name === 'Accounts' ? 'from-blue-50 to-cyan-50' : 'from-sky-50 to-blue-50'} border`} onClick={() => toggleCategoryExpand(category.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                <p className="text-xs text-gray-500">{pages.length} modules • {allDescendants.length} total pages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); allDescendants.forEach(page => { const allActions = {}; availableActions.forEach(action => { allActions[action] = true; }); setDesignationPermissions(prev => ({ ...prev, [designation]: { ...(prev[designation] || {}), [page.id]: allActions } })); }); alert(`✅ All ${allDescendants.length} pages under ${category.name} have been granted!`); }} className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600">Grant All {category.name}</button>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </div>
          </div>
        </div>
        {isExpanded && <div className="pl-4 space-y-2">{pages.map(page => renderNestedPage(page, designation, 1))}</div>}
      </div>
    );
  };

  const AuthorizeTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Designation-Based Access Control</h2>
          <p className="text-sm text-gray-500 mt-1">Complete access control for all modules</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg"><Shield className="w-6 h-6 text-blue-600" /></div>
      </div>

      {designations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg"><Users className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No designations found.</p></div>
      ) : (
        <div className="space-y-4">
          {designations.map((designation) => {
            const employeeCount = getEmployeeCountByDesignation(designation);
            const employeesList = getEmployeesByDesignation(designation);
            
            return (
              <div key={designation} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => toggleDesignationExpand(designation)}>
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded-lg"><Briefcase className="w-5 h-5 text-sky-600" /></div>
                    <div><h3 className="font-semibold text-gray-800">{designation}</h3><p className="text-xs text-gray-500">{employeeCount} employee(s)</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); saveDesignationPermissions(designation, true); }} className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Apply to All ({employeeCount})</button>
                    <button onClick={(e) => { e.stopPropagation(); saveDesignationPermissions(designation, false); }} className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600">Save</button>
                    {expandedDesignation === designation ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {expandedDesignation === designation && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2"><Copy className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-700">Copy permissions from:</span></div>
                        <div className="flex gap-2">
                          <select className="px-3 py-1 text-sm border rounded-md" onChange={(e) => setSelectedDesignation(e.target.value)} value={selectedDesignation || ''}><option value="">Select designation</option>{designations.filter(d => d !== designation).map(d => <option key={d} value={d}>{d}</option>)}</select>
                          <button onClick={() => { if (selectedDesignation) copyPermissionsFromDesignation(selectedDesignation, designation); }} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Copy</button>
                        </div>
                        {copySuccess[designation] && <div className="flex items-center gap-1 text-green-600 text-sm"><Check className="w-4 h-4" /><span>Copied!</span></div>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category:</label>
                      <select className="px-3 py-2 border rounded-md text-sm w-64" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? '📁 All Categories' : `📂 ${cat}`}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto p-2">
                      {topLevelCategories.filter(cat => selectedCategory === 'all' || cat.name === selectedCategory).map(category => renderCategory(category, designation))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 text-gray-800">
      <h1 className="text-4xl font-bold text-sky-600">Admin Settings</h1>
      
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 flex-wrap">
          <button onClick={() => setActiveTab('leaves')} className={`pb-3 px-1 font-medium transition ${activeTab === 'leaves' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>Leave Settings</button>
          <button onClick={() => setActiveTab('overtime')} className={`pb-3 px-1 font-medium transition ${activeTab === 'overtime' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>Overtime Utilization</button>
          <button onClick={() => setActiveTab('lateThreshold')} className={`pb-3 px-1 font-medium transition ${activeTab === 'lateThreshold' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>Late Threshold Rules</button>
          <button onClick={() => setActiveTab('branches')} className={`pb-3 px-1 font-medium transition ${activeTab === 'branches' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>Company Branches</button>
          <button onClick={() => setActiveTab('authorize')} className={`pb-3 px-1 font-medium transition ${activeTab === 'authorize' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>Authorize Access</button>
        </nav>
      </div>

      {activeTab === 'leaves' && (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Manage Leave Types</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {allLeaveTypes.map((type) => (
                <div key={type} className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-lg">{type}</span>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" checked={leaveStatus[type] || false} onChange={() => handleLeaveToggle(type)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full shadow-inner transition duration-300 ${leaveStatus[type] ? 'bg-sky-500' : 'bg-gray-300'}`} />
                        <div className={`dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition transform ${leaveStatus[type] ? 'translate-x-5' : ''}`} />
                      </div>
                    </label>
                  </div>
                  {leaveStatus[type] && (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-600 mb-1">Yearly Quota</label><input type="number" min="0" value={leaveQuotas[type]?.yearly || ''} onChange={(e) => { const yearly = Number(e.target.value); setLeaveQuotas(prev => ({ ...prev, [type]: { yearly, monthly: yearly ? Math.round(yearly / 12) : 0 } })); }} className="w-full p-2 border rounded-md" /></div>
                      <div><label className="block text-sm font-medium text-gray-600 mb-1">Monthly Quota</label><input type="number" readOnly value={leaveQuotas[type]?.monthly || ''} className="w-full p-2 border rounded-md bg-gray-100" /></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Create Custom Leave</h2>
            <div className="flex gap-4 items-center flex-wrap">
              <input type="text" value={customLeaveName} onChange={(e) => setCustomLeaveName(e.target.value)} placeholder="Enter custom leave name" className="p-2 border rounded-md w-80" />
              <button onClick={handleCreateCustomLeave} className="px-4 py-2 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-600">Create Leave</button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Working Hours</h2>
            <div className="flex items-center gap-4"><input type="range" min="1" max="12" value={workingHours} onChange={(e) => setWorkingHours(Number(e.target.value))} className="w-64 accent-sky-500" /><span className="text-gray-600"><strong className="text-sky-600">{workingHours}</strong> hours/day</span></div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Working Days Per Week</h2>
            <div className="flex gap-4">
              {[4, 5, 6].map((day) => (
                <button key={day} onClick={() => setWorkingDays(day)} className={`px-4 py-2 rounded-full border font-medium transition ${workingDays === day ? 'bg-sky-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{day} Days</button>
              ))}
            </div>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-xl font-medium mb-4">Current Settings</h2>
            <div className="bg-gray-50 p-4 rounded border shadow-sm text-sm space-y-2">
              <p><strong>Working Hours:</strong> {workingHours} hrs/day</p>
              <p><strong>Working Days:</strong> {workingDays} days/week</p>
              <p><strong>Enabled Leaves:</strong> {allLeaveTypes.filter(type => leaveStatus[type]).join(', ') || 'None'}</p>
              {customLeaves.length > 0 && <p><strong>Custom Leaves:</strong> {customLeaves.join(', ')}</p>}
              <div>
                <p className="font-semibold">Leave Quotas:</p>
                <ul className="list-disc ml-6">
                  {Object.entries(leaveQuotas).map(([type, quota]) => leaveStatus[type] ? (<li key={type}>{type}: {quota.yearly} yearly / {quota.monthly} monthly</li>) : null)}
                </ul>
              </div>
            </div>

            <button onClick={saveSettings} disabled={saving} className="mt-6 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded hover:from-sky-600 hover:to-blue-700 shadow-md disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <CheckCircle className="inline-block" size={18} />
              Save Settings
            </button>
          </section>
        </>
      )}

      {activeTab === 'overtime' && <OvertimeUtilizationConfig />}
      {activeTab === 'lateThreshold' && <LateThresholdConfig />}
      {activeTab === 'branches' && <CompanyBranchesTab />}
      {activeTab === 'authorize' && <AuthorizeTab />}
    </div>
  );
};

// Helper component for Phone icon
const Phone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

// Helper component for Mail icon
const Mail = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default AdminSettings;