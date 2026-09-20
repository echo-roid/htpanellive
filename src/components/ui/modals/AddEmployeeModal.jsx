import React, { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2, User, Briefcase, Calendar, DollarSign, CalendarDays } from "lucide-react";
import addimg from "../../../assets/addimg.png";
import Select from "react-select";

export default function AddEmployeeModal({ onClose, employee }) {
  const [activeTab, setActiveTab] = useState("personal");
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    designation: "",
    level: "",
    email: "",
    identity_id: "",
    contact_number: "",
    password: "",
    house_address: "",
    date_of_birth: "",
    team_name: "",
    reporting_manager_id: "",
    reporting_manager: "",
    father_name: "",
    mother_name: "",
    joining_date: "",
    current_project: "no",
    appraisal_points: 0,
    photo: null,
    empId: null,
    confirm_date: "",
    resigned_date: "",
    left_date: "",
    marriage_date: "",
    retired_date: "",
    resign_reason: "",
    ctc: "",
    official_email: "",
    official_email_password: "",
  });

  const [leaveQuotas, setLeaveQuotas] = useState([]);
  const [workingHours, setWorkingHours] = useState(8);
  const [workingDays, setWorkingDays] = useState(6);
  
  const [allowances, setAllowances] = useState([
    { id: 1, name: "Basic", amount: 0 },
    { id: 2, name: "HRA", amount: 0 },
    { id: 3, name: "Conveyance", amount: 0 },
    { id: 4, name: "Special Allowance", amount: 0 },
    { id: 5, name: "Other Allowance", amount: 0 },
  ]);
  
  const [deductions, setDeductions] = useState([
    { id: 1, name: "PF", amount: 0, type: "percentage", value: 12 },
    { id: 2, name: "Professional Tax", amount: 0, type: "fixed", value: 200 },
    { id: 3, name: "TDS", amount: 0, type: "percentage", value: 10 },
  ]);
  
  const [managers, setManagers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [nextAllowanceId, setNextAllowanceId] = useState(6);
  const [nextDeductionId, setNextDeductionId] = useState(4);

  // Calculate totals without setting state
  const calculateTotalEarnings = useCallback(() => {
    return allowances.reduce((total, allowance) => total + (parseFloat(allowance.amount) || 0), 0);
  }, [allowances]);

  const calculateTotalDeductions = useCallback(() => {
    return deductions.reduce((total, deduction) => total + (parseFloat(deduction.amount) || 0), 0);
  }, [deductions]);

  const calculateNetSalary = useCallback(() => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  }, [calculateTotalEarnings, calculateTotalDeductions]);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "dates", label: "Date Details", icon: Calendar },
    { id: "salary", label: "Salary & Allowances", icon: DollarSign },
    { id: "leaves", label: "Leave Quotas", icon: CalendarDays },
  ];

  const experienceLevels = [
    { value: "Intern", label: "Intern" },
    { value: "Junior", label: "Junior" },
    { value: "Mid", label: "Mid" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
  ];

  const calculateAge = (dobStr) => {
    if (!dobStr) return "";
    const dob = new Date(dobStr);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.contact_number) newErrors.contact_number = "Contact number is required";
    if (!formData.password && !formData.empId) newErrors.password = "Password is required for new employees";
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (!formData.level) newErrors.level = "Experience level is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.joining_date) newErrors.joining_date = "Joining date is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.contact_number && !phoneRegex.test(formData.contact_number)) {
      newErrors.contact_number = "Contact number must be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
        email: employee.email || "",
        contact_number: employee.contact_number || "",
        father_name: employee.father_name || "",
        mother_name: employee.mother_name || "",
        date_of_birth: employee.birth_date
          ? new Date(employee.birth_date).toISOString().split("T")[0]
          : "",
        age: employee.birth_date ? calculateAge(employee.birth_date) : "",
        house_address: `${employee.house_number || ""}, ${employee.address || ""}, ${employee.city || ""}, ${employee.state || ""}`.replace(/^,|,$/g, '').replace(/, ,/g, ', '),
        identity_id: employee.pan_number || "",
        photo: employee.photo_path || null,
        empId: employee.id || null,
        confirm_date: employee.confirm_date ? new Date(employee.confirm_date).toISOString().split("T")[0] : "",
        resigned_date: employee.resigned_date ? new Date(employee.resigned_date).toISOString().split("T")[0] : "",
        left_date: employee.left_date ? new Date(employee.left_date).toISOString().split("T")[0] : "",
        marriage_date: employee.marriage_date ? new Date(employee.marriage_date).toISOString().split("T")[0] : "",
        retired_date: employee.retired_date ? new Date(employee.retired_date).toISOString().split("T")[0] : "",
        resign_reason: employee.resign_reason || "",
        ctc: employee.annual_ctc || "",
        official_email: employee.official_email || "",
        level: employee.level || "",
        designation: employee.designation || "",
        team_name: employee.team_name || "",
        reporting_manager_id: employee.reporting_manager_id || "",
        reporting_manager: employee.reporting_manager || "",
        current_project: employee.current_project || "no",
        appraisal_points: employee.appraisal_points || 0,
      }));
      
      if (employee.allowances && employee.allowances.length > 0) {
        setAllowances(employee.allowances.map((allow, idx) => ({ ...allow, id: idx + 1 })));
        setNextAllowanceId(employee.allowances.length + 1);
      }
      
      if (employee.deductions && employee.deductions.length > 0) {
        setDeductions(employee.deductions.map((ded, idx) => ({ ...ded, id: idx + 1 })));
        setNextDeductionId(employee.deductions.length + 1);
      }
      
      // Set leave quotas if employee has them
      if (employee.leave_quotas && employee.leave_quotas.length > 0) {
        setLeaveQuotas(employee.leave_quotas);
      }
    }
  }, [employee]);

  // Fetch leave settings from API - Updated to use the correct endpoint
  useEffect(() => {
    fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/leave-settings/leave-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setWorkingHours(data.workingHours || 8);
          setWorkingDays(data.workingDays || 6);
          
          // Get selected leaves from API response
          const selectedLeaves = data.selectedLeaves || [];
          const leaveQuotasData = data.leaveQuotas || {};
          
          // Initialize leave quotas only for selected leaves
          const initialLeaveQuotas = selectedLeaves.map(leaveType => {
            // Map leave type to display label
            let label = leaveType;
            let typeCode = leaveType;
            
            switch(leaveType) {
              case "Casual Leave":
                label = "Casual Leave";
                typeCode = "CL";
                break;
              case "Sick Leave":
                label = "Sick Leave";
                typeCode = "SL";
                break;
              case "Earned Leave":
                label = "Earned Leave";
                typeCode = "EL";
                break;
              case "Maternity Leave":
                label = "Maternity Leave";
                typeCode = "ML";
                break;
              case "Paternity Leave":
                label = "Paternity Leave";
                typeCode = "PL";
                break;
              case "Compensatory Leave":
                label = "Compensatory Leave";
                typeCode = "CO";
                break;
              default:
                label = leaveType;
                typeCode = leaveType.substring(0, 2).toUpperCase();
            }
            
            // Get quota from API or set defaults
            const quota = leaveQuotasData[leaveType] || { yearly: 0, monthly: 0 };
            
            return {
              type: typeCode,
              originalType: leaveType,
              label: label,
              monthly: quota.monthly || 0,
              yearly: quota.yearly || 0,
              custom_allocation: 0,
              total_yearly: quota.yearly || 0
            };
          });
          
          setLeaveQuotas(initialLeaveQuotas);
        }
      })
      .catch((err) => {
        console.error("Error fetching leave settings:", err.message);
        // Set default leave quotas if API fails
        setLeaveQuotas([
          { type: "CL", originalType: "Casual Leave", label: "Casual Leave", monthly: 1, yearly: 12, custom_allocation: 0, total_yearly: 12 },
          { type: "SL", originalType: "Sick Leave", label: "Sick Leave", monthly: 1, yearly: 12, custom_allocation: 0, total_yearly: 12 },
          { type: "EL", originalType: "Earned Leave", label: "Earned Leave", monthly: 0, yearly: 0, custom_allocation: 0, total_yearly: 0 },
        ]);
      });

    fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/employees/allmanagers/")
      .then((res) => res.json())
      .then((data) => {
        setManagers(data || []);
      })
      .catch((err) => {
        console.error("Error fetching managers:", err.message);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    } else if (name === "reporting_manager_id") {
      const selectedManager = managers.find(
        (mgr) => mgr.id.toString() === value
      );
      setFormData((prev) => ({
        ...prev,
        reporting_manager_id: value,
        reporting_manager: selectedManager ? selectedManager.name : "",
      }));
    } else if (name === "date_of_birth") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        date_of_birth: value,
        age: age,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLeaveQuotaChange = (index, field, value) => {
    const updatedQuotas = [...leaveQuotas];
    const numValue = parseFloat(value) || 0;
    updatedQuotas[index][field] = numValue;
    
    // Update total yearly when yearly or custom_allocation changes
    if (field === 'yearly' || field === 'custom_allocation') {
      updatedQuotas[index].total_yearly = updatedQuotas[index].yearly + updatedQuotas[index].custom_allocation;
    }
    
    setLeaveQuotas(updatedQuotas);
  };

  const handleAllowanceChange = (id, field, value) => {
    setAllowances(prev => prev.map(allowance => 
      allowance.id === id ? { ...allowance, [field]: value } : allowance
    ));
  };

  const addNewAllowance = () => {
    setAllowances(prev => [...prev, { 
      id: nextAllowanceId, 
      name: "New Allowance", 
      amount: 0 
    }]);
    setNextAllowanceId(prev => prev + 1);
  };

  const removeAllowance = (id) => {
    setAllowances(prev => prev.filter(allowance => allowance.id !== id));
  };

  const handleDeductionChange = (id, field, value) => {
    setDeductions(prev => prev.map(deduction => 
      deduction.id === id ? { ...deduction, [field]: value } : deduction
    ));
  };

  const addNewDeduction = () => {
    setDeductions(prev => [...prev, { 
      id: nextDeductionId, 
      name: "New Deduction", 
      amount: 0, 
      type: "fixed", 
      value: 0 
    }]);
    setNextDeductionId(prev => prev + 1);
  };

  const removeDeduction = (id) => {
    setDeductions(prev => prev.filter(deduction => deduction.id !== id));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab("personal");
      return;
    }
    
    setIsSubmitting(true);
    
    const submitData = new FormData();
    
    // Map form fields to backend expected field names
    const fieldMapping = {
      empId: "empId",
      name: "name",
      designation: "designation",
      level: "level",
      email: "email",
      password: "password",
      age: "age",
      identity_id: "identity_id",
      contact_number: "contact_number",
      house_address: "house_address",
      date_of_birth: "date_of_birth",
      team_name: "team_name",
      reporting_manager_id: "reporting_manager_id",
      reporting_manager: "reporting_manager",
      father_name: "father_name",
      mother_name: "mother_name",
      joining_date: "joining_date",
      current_project: "current_project",
      appraisal_points: "appraisal_points",
      confirm_date: "confirm_date",
      resigned_date: "resigned_date",
      left_date: "left_date",
      marriage_date: "marriage_date",
      retired_date: "retired_date",
      resign_reason: "resign_reason",
      official_email: "official_email",
      official_email_password: "official_email_password",
      ctc: "annual_ctc",
    };
    
    for (const [frontendKey, backendKey] of Object.entries(fieldMapping)) {
      const value = formData[frontendKey];
      if (value !== null && value !== undefined && value !== "") {
        if (typeof value !== "object") {
          submitData.append(backendKey, value.toString());
        }
      }
    }
    
    // Handle salary allowance amounts
    const basicAllowance = allowances.find(a => a.name === "Basic");
    const hraAllowance = allowances.find(a => a.name === "HRA");
    const conveyanceAllowance = allowances.find(a => a.name === "Conveyance");
    const specialAllowance = allowances.find(a => a.name === "Special Allowance");
    const otherAllowance = allowances.find(a => a.name === "Other Allowance");
    
    if (basicAllowance) submitData.append("basic_salary", basicAllowance.amount);
    if (hraAllowance) submitData.append("hra", hraAllowance.amount);
    if (conveyanceAllowance) submitData.append("conveyance", conveyanceAllowance.amount);
    if (specialAllowance) submitData.append("special_allowance", specialAllowance.amount);
    if (otherAllowance) submitData.append("other_allowance", otherAllowance.amount);
    
    submitData.append("total_earnings", calculateTotalEarnings());
    submitData.append("total_deductions", calculateTotalDeductions());
    submitData.append("net_salary", calculateNetSalary());
    
    // Handle deduction values
    const pfDeduction = deductions.find(d => d.name === "PF");
    const profTaxDeduction = deductions.find(d => d.name === "Professional Tax");
    const tdsDeduction = deductions.find(d => d.name === "TDS");
    
    if (pfDeduction) submitData.append("pf_percentage", pfDeduction.value);
    if (profTaxDeduction) submitData.append("professional_tax_fixed", profTaxDeduction.amount);
    if (tdsDeduction) submitData.append("tds_percentage", tdsDeduction.value);
    
    // Handle photo
    if (formData.photo instanceof File) {
      submitData.append("photo", formData.photo);
    }
    
    // Handle leave quotas - send all selected leaves
    leaveQuotas.forEach(leave => {
      submitData.append(`leave_quota_${leave.type}_monthly`, leave.monthly);
      submitData.append(`leave_quota_${leave.type}_yearly`, leave.yearly);
      submitData.append(`leave_quota_${leave.type}_custom_allocation`, leave.custom_allocation);
      submitData.append(`leave_quota_${leave.type}_total_yearly`, leave.total_yearly);
      submitData.append(`leave_quota_${leave.type}_original_type`, leave.originalType);
    });
    
    submitData.append("leave_quotas", JSON.stringify(leaveQuotas));

    try {
      const url = "https://tableware-dweeb-estate.ngrok-free.dev/api/employees";
      
      if (formData.empId) {
        const response = await fetch(`${url}`, {
          method: "POST",
          body: submitData,
        });
        
        if (response.ok) {
          alert("Employee updated successfully!");
          onClose(true);
        } else {
          const err = await response.json();
          alert("❌ Failed to update employee: " + (err?.error || err?.message || "Unknown error"));
        }
      } else {
        const response = await fetch(url, {
          method: "POST",
          body: submitData,
        });
        
        if (response.ok) {
          alert("Employee created successfully!");
          onClose(true);
        } else {
          const err = await response.json();
          alert("❌ Failed to create employee: " + (err?.error || err?.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl relative max-h-[95vh] flex flex-col">
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800" style={{ fontSize: '14px' }}>
            {formData.empId ? "Edit Employee" : "Add New Employee"}
          </h2>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b bg-gray-50 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
                style={{ fontSize: '11px' }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ fontSize: '10px' }}>
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div>
              <div className="w-full flex justify-center mb-4">
                <img 
                  src={addimg} 
                  alt="Add employee" 
                  className="rounded-lg w-full max-h-24 object-cover" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`w-full px-2 py-1.5 rounded border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    style={{ fontSize: '10px' }}
                  />
                  {errors.name && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    readOnly
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-gray-50"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                    Personal Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="employee@company.com"
                    className={`w-full px-2 py-1.5 rounded border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    style={{ fontSize: '10px' }}
                  />
                  {errors.email && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.email}</p>}
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    name="official_email"
                    value={formData.official_email}
                    onChange={handleChange}
                    placeholder="official@company.com"
                    className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                    Official Email Password
                  </label>
                  <input
                    type="password"
                    name="official_email_password"
                    value={formData.official_email_password}
                    onChange={handleChange}
                    placeholder="Official email password"
                    className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full px-2 py-1.5 rounded border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    style={{ fontSize: '10px' }}
                  />
                  {errors.contact_number && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.contact_number}</p>}
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>PAN Number</label>
                  <input
                    type="text"
                    name="identity_id"
                    value={formData.identity_id}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 uppercase"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Father's Name</label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleChange}
                    placeholder="Father's full name"
                    className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Mother's Name</label>
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleChange}
                    placeholder="Mother's full name"
                    className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>House Address</label>
                  <textarea
                    name="house_address"
                    value={formData.house_address}
                    onChange={handleChange}
                    placeholder="Full address"
                    rows="2"
                    className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                    style={{ fontSize: '10px' }}
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Employee Photo</label>
                  {formData.photo && typeof formData.photo === "string" && (
                    <div className="mb-1">
                      <img
                        src={formData.photo}
                        alt="Employee"
                        className="w-12 h-12 rounded-full border object-cover"
                        onError={(e) => { e.target.src = addimg }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full"
                    style={{ fontSize: '9px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Employment Information Tab */}
          {activeTab === "employment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`w-full px-2 py-1.5 rounded border ${errors.designation ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  style={{ fontSize: '10px' }}
                >
                  <option value="">Select Designation</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Developer">Developer</option>
                  <option value="QA">QA</option>
                  <option value="Designer">Designer</option>
                  <option value="Intern">Intern</option>
                </select>
                {errors.designation && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.designation}</p>}
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full px-2 py-1.5 rounded border ${errors.level ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  style={{ fontSize: '10px' }}
                >
                  <option value="">Select Experience Level</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.level}</p>}
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Team Name</label>
                <input
                  type="text"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleChange}
                  placeholder="e.g., Development"
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Reporting Manager</label>
                <Select
                  value={managers
                    .map((manager) => ({
                      value: manager.id,
                      label: manager.name,
                      photo: manager.photo || addimg,
                    }))
                    .find(
                      (opt) =>
                        opt?.value?.toString() === formData.reporting_manager_id?.toString()
                    )}
                  onChange={(selected) => {
                    const selectedManager = managers.find(
                      (mgr) => mgr.id.toString() === selected.value.toString()
                    );
                    setFormData((prev) => ({
                      ...prev,
                      reporting_manager_id: selected.value,
                      reporting_manager: selectedManager?.name || "",
                    }));
                  }}
                  options={managers.map((manager) => ({
                    value: manager.id,
                    label: manager.name,
                    photo: manager.photo || addimg,
                  }))}
                  formatOptionLabel={(e) => (
                    <div className="flex items-center gap-1">
                      <img
                        src={e.photo}
                        alt={e.label}
                        className="w-4 h-4 rounded-full object-cover"
                        onError={(e) => { e.target.src = addimg }}
                      />
                      <span style={{ fontSize: '10px' }}>{e.label}</span>
                    </div>
                  )}
                  placeholder="Select manager..."
                  isClearable
                  styles={{
                    control: (base) => ({ ...base, minHeight: '32px', fontSize: '10px' }),
                    dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
                    clearIndicator: (base) => ({ ...base, padding: '4px' }),
                    menu: (base) => ({ ...base, fontSize: '10px' }),
                    option: (base) => ({ ...base, fontSize: '10px', padding: '6px 10px' }),
                  }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                  {formData.empId ? "New Password (optional)" : "Create Password"} {!formData.empId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={formData.empId ? "Leave blank to keep current" : "Enter password"}
                  className={`w-full px-2 py-1.5 rounded border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  style={{ fontSize: '10px' }}
                />
                {errors.password && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.password}</p>}
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Current Project</label>
                <input
                  type="text"
                  name="current_project"
                  value={formData.current_project}
                  onChange={handleChange}
                  placeholder="Project name"
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Appraisal Points</label>
                <input
                  type="number"
                  name="appraisal_points"
                  value={formData.appraisal_points}
                  onChange={handleChange}
                  placeholder="0.0"
                  step="0.5"
                  min="0"
                  max="10"
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>
          )}

          {/* Date Details Tab */}
          {activeTab === "dates" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className={`w-full px-2 py-1.5 rounded border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  style={{ fontSize: '10px' }}
                />
                {errors.date_of_birth && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.date_of_birth}</p>}
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className={`w-full px-2 py-1.5 rounded border ${errors.joining_date ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  style={{ fontSize: '10px' }}
                />
                {errors.joining_date && <p className="text-red-500 mt-0.5" style={{ fontSize: '8px' }}>{errors.joining_date}</p>}
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Confirm Date</label>
                <input
                  type="date"
                  name="confirm_date"
                  value={formData.confirm_date}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Resigned Date</label>
                <input
                  type="date"
                  name="resigned_date"
                  value={formData.resigned_date}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Left Date</label>
                <input
                  type="date"
                  name="left_date"
                  value={formData.left_date}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Marriage Date</label>
                <input
                  type="date"
                  name="marriage_date"
                  value={formData.marriage_date}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Retired Date</label>
                <input
                  type="date"
                  name="retired_date"
                  value={formData.retired_date}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>Resign Reason</label>
                <textarea
                  name="resign_reason"
                  value={formData.resign_reason}
                  onChange={handleChange}
                  placeholder="Resignation reason"
                  rows="2"
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>
          )}

          {/* Salary & Allowances Tab */}
          {activeTab === "salary" && (
            <div>
              <div className="mb-4">
                <label className="font-medium text-gray-700 block mb-0.5" style={{ fontSize: '9px' }}>
                  Cost to Company (CTC) <span className="text-gray-500">(Annual)</span>
                </label>
                <input
                  type="number"
                  name="ctc"
                  value={formData.ctc}
                  onChange={handleChange}
                  placeholder="Enter annual CTC"
                  className="w-full px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ fontSize: '10px' }}
                  min="0"
                  step="10000"
                />
              </div>

              {/* Allowances Table */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-700" style={{ fontSize: '10px' }}>Salary Allowances</h4>
                  <button
                    type="button"
                    onClick={addNewAllowance}
                    className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                    style={{ fontSize: '9px' }}
                  >
                    <Plus size={12} />
                    Add Allowance
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Allowance Name</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Amount (₹)</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-700 w-12" style={{ fontSize: '9px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allowances.map((allowance) => (
                        <tr key={allowance.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1">
                            <input
                              type="text"
                              value={allowance.name}
                              onChange={(e) => handleAllowanceChange(allowance.id, "name", e.target.value)}
                              className="w-full px-1 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <input
                              type="number"
                              value={allowance.amount}
                              onChange={(e) => {
                                handleAllowanceChange(allowance.id, "amount", parseFloat(e.target.value) || 0);
                              }}
                              className="w-full px-1 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                              min="0"
                              step="100"
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            <button
                              onClick={() => removeAllowance(allowance.id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={allowances.length === 1}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-300 px-2 py-1 text-right" style={{ fontSize: '9px' }}>Total Earnings: </td>
                        <td className="border border-gray-300 px-2 py-1 text-green-600 font-bold" style={{ fontSize: '9px' }}>
                          ₹ {calculateTotalEarnings().toLocaleString('en-IN')}
                        </td>
                        <td className="border border-gray-300"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-700" style={{ fontSize: '10px' }}>Salary Deductions</h4>
                  <button
                    type="button"
                    onClick={addNewDeduction}
                    className="flex items-center gap-0.5 px-2 py-0.5 bg-orange-600 text-white rounded hover:bg-orange-700"
                    style={{ fontSize: '9px' }}
                  >
                    <Plus size={12} />
                    Add Deduction
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-50 to-orange-50">
                        <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Name</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Type</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Value</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Amount</th>
                        <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-700 w-12" style={{ fontSize: '9px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deductions.map((deduction) => (
                        <tr key={deduction.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1">
                            <input
                              type="text"
                              value={deduction.name}
                              onChange={(e) => handleDeductionChange(deduction.id, "name", e.target.value)}
                              className="w-full px-1 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <select
                              value={deduction.type}
                              onChange={(e) => {
                                handleDeductionChange(deduction.id, "type", e.target.value);
                                handleDeductionChange(deduction.id, "amount", 0);
                              }}
                              className="w-full px-1 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="percentage">Percentage</option>
                            </select>
                           </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <input
                              type="number"
                              value={deduction.value}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                handleDeductionChange(deduction.id, "value", newValue);
                                if (deduction.type === "fixed") {
                                  handleDeductionChange(deduction.id, "amount", newValue);
                                } else {
                                  const basicAmount = allowances.find(a => a.name === "Basic")?.amount || 0;
                                  const newAmount = (basicAmount * newValue) / 100;
                                  handleDeductionChange(deduction.id, "amount", newAmount);
                                }
                              }}
                              className="w-full px-1 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                              min="0"
                            />
                           </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <input
                              type="number"
                              value={deduction.amount}
                              readOnly={deduction.type === "percentage"}
                              onChange={(e) => {
                                const newAmount = parseFloat(e.target.value) || 0;
                                handleDeductionChange(deduction.id, "amount", newAmount);
                                if (deduction.type === "fixed") {
                                  handleDeductionChange(deduction.id, "value", newAmount);
                                }
                              }}
                              className={`w-full px-1 py-0.5 rounded border border-gray-300 ${deduction.type === "percentage" ? "bg-gray-50" : "focus:outline-none focus:ring-1 focus:ring-blue-400"}`}
                              style={{ fontSize: '9px' }}
                              min="0"
                            />
                           </td>
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            <button
                              onClick={() => removeDeduction(deduction.id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={deductions.length === 1}
                            >
                              <Trash2 size={12} />
                            </button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-semibold">
                        <td colSpan="3" className="border border-gray-300 px-2 py-1 text-right" style={{ fontSize: '9px' }}>Total Deductions: </td>
                        <td className="border border-gray-300 px-2 py-1 text-red-600 font-bold" style={{ fontSize: '9px' }}>
                          ₹ {calculateTotalDeductions().toLocaleString('en-IN')}
                        </td>
                        <td className="border border-gray-300"></td>
                      </tr>
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan="3" className="border border-gray-300 px-2 py-1 text-right" style={{ fontSize: '9px' }}>Net Salary: </td>
                        <td colSpan="2" className="border border-gray-300 px-2 py-1 text-blue-600" style={{ fontSize: '9px' }}>
                          ₹ {calculateNetSalary().toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Leave Quotas Tab - Integrated with API */}
          {activeTab === "leaves" && (
            <div>
              {/* Working Hours & Days Info */}
              <div className="mb-4 bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-600">Working Hours/Day:</span>
                    <span className="ml-2 font-semibold text-blue-700">{workingHours} hours</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Working Days/Week:</span>
                    <span className="ml-2 font-semibold text-blue-700">{workingDays} days</span>
                  </div>
                </div>
              </div>

              {leaveQuotas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leave types configured. Please contact administrator.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Leave Type</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Monthly Quota</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Yearly Quota</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Custom Allocation</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700" style={{ fontSize: '9px' }}>Total Yearly</th>
                       </tr>
                    </thead>
                    <tbody>
                      {leaveQuotas.map((leave, index) => (
                        <tr key={leave.type} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2" style={{ fontSize: '9px' }}>
                            <span className="font-semibold">{leave.label}</span>
                            <span className="text-gray-500 ml-1" style={{ fontSize: '8px' }}>({leave.type})</span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={leave.monthly}
                              onChange={(e) => handleLeaveQuotaChange(index, "monthly", e.target.value)}
                              className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                              step="0.5"
                              min="0"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={leave.yearly}
                              onChange={(e) => handleLeaveQuotaChange(index, "yearly", e.target.value)}
                              className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                              step="0.5"
                              min="0"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={leave.custom_allocation}
                              onChange={(e) => handleLeaveQuotaChange(index, "custom_allocation", e.target.value)}
                              className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              style={{ fontSize: '9px' }}
                              step="0.5"
                              min="0"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <span className="font-semibold text-blue-600" style={{ fontSize: '9px' }}>
                              {(leave.total_yearly || leave.yearly + leave.custom_allocation).toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Leave Info Note */}
              {leaveQuotas.length > 0 && (
                <div className="mt-4 text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                  💡 Note: Monthly quota is the number of leaves earned per month. 
                  Yearly quota is the total leaves allocated per year. 
                  Custom allocation can be used to add extra leaves.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-1.5 font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            style={{ fontSize: '10px' }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 font-semibold shadow-md bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            style={{ fontSize: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Save Employee"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}