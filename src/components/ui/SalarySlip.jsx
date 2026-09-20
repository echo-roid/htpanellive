import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  Eye,
  Loader,
} from "lucide-react";
import axios from "axios";

const SalarySlip = ({ employee, month, year, onClose }) => {
  console.log(employee,"jjhj")
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [leaveSettings, setLeaveSettings] = useState(null);

  // Fetch complete employee details from API
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!employee || !employee.empCode) return;
      
      setLoading(true);
      try {
        const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/employees/${employee.empCode}`);
        const data = await response.json();
        if (data) {
          setEmployeeDetails(data);
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employee]);

  // Fetch leave settings for late threshold rules
  useEffect(() => {
    const fetchLeaveSettings = async () => {
      try {
        const res = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/leave-settings/leave-settings');
        setLeaveSettings(res.data);
        console.log("✅ Leave settings loaded:", res.data);
      } catch (err) {
        console.error("❌ Error fetching leave settings:", err);
      }
    };
    fetchLeaveSettings();
  }, []);

  // Calculate salary details based on attendance and employee data
  const salaryDetails = useMemo(() => {
    if (!employee) return null;

    const attendance = Object.values(employee.attendance || {});
    
    // Count attendance types
    const presentDays = attendance.filter((d) => d.status === "P").length;
    const absentDays = attendance.filter((d) => d.status === "A").length;
    const leaveDays = attendance.filter((d) => d.status === "L").length;
    const halfDays = attendance.filter((d) => d.status === "HD").length;
    const weeklyOffs = attendance.filter((d) => d.status === "WO").length;
    
    // Count late arrivals (days with late flag)
    const lateDays = attendance.filter((d) => d.late === true).length;

    // Get employee salary data from API using the new structured format
    const empData = employeeDetails || {};
    
    // Get allowance data from the new structure
    const allowance = empData.allowance || {};
    const deductions = empData.deductions || {};
    
    // Parse salary components from allowance object
    const basicSalary = allowance.basic_salary !== null && allowance.basic_salary !== undefined 
      ? parseFloat(allowance.basic_salary) 
      : null;
    
    const hra = allowance.hra !== null && allowance.hra !== undefined 
      ? parseFloat(allowance.hra) 
      : null;
    
    const conveyance = allowance.conveyance !== null && allowance.conveyance !== undefined 
      ? parseFloat(allowance.conveyance) 
      : null;
    
    const medical = allowance.medical !== null && allowance.medical !== undefined 
      ? parseFloat(allowance.medical) 
      : null;
    
    const specialAllowance = allowance.special_allowance !== null && allowance.special_allowance !== undefined 
      ? parseFloat(allowance.special_allowance) 
      : null;
    
    const otherAllowance = allowance.other_allowance !== null && allowance.other_allowance !== undefined 
      ? parseFloat(allowance.other_allowance) 
      : null;
    
    const totalEarnings = allowance.total_earnings !== null && allowance.total_earnings !== undefined 
      ? parseFloat(allowance.total_earnings) 
      : null;
    
    const annualCTC = allowance.annual_ctc !== null && allowance.annual_ctc !== undefined 
      ? parseFloat(allowance.annual_ctc) 
      : null;

    // Get deduction data from the new structure
    const pfPercentage = deductions.pf_percentage !== null && deductions.pf_percentage !== undefined 
      ? parseFloat(deductions.pf_percentage) 
      : null;
    
    const pfAmount = deductions.pf_amount !== null && deductions.pf_amount !== undefined 
      ? parseFloat(deductions.pf_amount) 
      : null;
    
    const professionalTax = deductions.professional_tax !== null && deductions.professional_tax !== undefined 
      ? parseFloat(deductions.professional_tax) 
      : null;
    
    const tdsPercentage = deductions.tds_percentage !== null && deductions.tds_percentage !== undefined 
      ? parseFloat(deductions.tds_percentage) 
      : null;
    
    const tdsAmount = deductions.tds_amount !== null && deductions.tds_amount !== undefined 
      ? parseFloat(deductions.tds_amount) 
      : null;
    
    const totalDeductions = deductions.total_deductions !== null && deductions.total_deductions !== undefined 
      ? parseFloat(deductions.total_deductions) 
      : null;

    // Get net salary
    const netSalary = empData.net_salary !== null && empData.net_salary !== undefined 
      ? parseFloat(empData.net_salary) 
      : null;

    // Calculate total earnings if not provided
    let calculatedTotalEarnings = totalEarnings;
    if (calculatedTotalEarnings === null || calculatedTotalEarnings === 0) {
      calculatedTotalEarnings = 0;
      if (basicSalary !== null) calculatedTotalEarnings += basicSalary;
      if (hra !== null) calculatedTotalEarnings += hra;
      if (conveyance !== null) calculatedTotalEarnings += conveyance;
      if (medical !== null) calculatedTotalEarnings += medical;
      if (specialAllowance !== null) calculatedTotalEarnings += specialAllowance;
      if (otherAllowance !== null) calculatedTotalEarnings += otherAllowance;
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate the actual working days (excluding weekly offs)
    const workingDaysInMonth = daysInMonth - weeklyOffs;
    
    // Calculate days worked (Present days + half days count as 0.5)
    const daysWorked = presentDays + (halfDays * 0.5);
    
    // Calculate daily rate based on total earnings and working days
    const dailyRate = workingDaysInMonth > 0 && calculatedTotalEarnings > 0 
      ? calculatedTotalEarnings / workingDaysInMonth 
      : 0;
    
    const hourlyRate = dailyRate / (leaveSettings?.workingHours || 8);

    // Calculate prorated earnings based on actual days worked
    // If days worked is 0, prorated earnings should be 0
    let proratedTotalEarnings = 0;
    if (daysWorked > 0 && workingDaysInMonth > 0) {
      proratedTotalEarnings = daysWorked * dailyRate;
    }
    // If there are no working days, salary is 0
    if (workingDaysInMonth === 0) {
      proratedTotalEarnings = 0;
    }

    // Round to 2 decimal places
    proratedTotalEarnings = Math.round(proratedTotalEarnings);

    // Calculate absent deduction (for display only)
    const absentDeduction = absentDays * dailyRate;
    const halfDayDeduction = halfDays * (dailyRate / 2);

    // Calculate late arrival deductions based on leave settings
    let lateDeduction = 0;
    let halfSalaryDeductionApplied = false;
    let excessiveLateDays = 0;
    
    if (leaveSettings?.lateThresholdRules) {
      const rules = leaveSettings.lateThresholdRules;
      
      if (rules.halfSalaryDeductionEnabled) {
        const halfDayLateThreshold = rules.halfDayLateThresholdMinutes || 15;
        
        excessiveLateDays = attendance.filter((d) => {
          if (d.late && d.lateMinutes) {
            return d.lateMinutes > halfDayLateThreshold;
          }
          return false;
        }).length;

        if (excessiveLateDays > 0) {
          halfSalaryDeductionApplied = true;
          lateDeduction = excessiveLateDays * (dailyRate / 2);
        }
      }
    }

    // Calculate PF - prorated based on days worked
    let calculatedPfAmount = pfAmount;
    if (calculatedPfAmount === null || calculatedPfAmount === 0) {
      if (basicSalary !== null && pfPercentage !== null) {
        calculatedPfAmount = (basicSalary * pfPercentage) / 100;
      } else {
        calculatedPfAmount = 0;
      }
    }
    
    // Prorate PF based on days worked
    let proratedPfAmount = 0;
    if (workingDaysInMonth > 0 && daysWorked > 0) {
      proratedPfAmount = (calculatedPfAmount * daysWorked) / workingDaysInMonth;
    } else {
      proratedPfAmount = 0;
    }
    proratedPfAmount = Math.round(proratedPfAmount);

    // Calculate TDS - prorated based on days worked
    let calculatedTdsAmount = tdsAmount;
    if (calculatedTdsAmount === null || calculatedTdsAmount === 0) {
      if (proratedTotalEarnings > 0 && tdsPercentage !== null) {
        calculatedTdsAmount = (proratedTotalEarnings * tdsPercentage) / 100;
      } else {
        calculatedTdsAmount = 0;
      }
    }
    
    // Prorate TDS
    let proratedTdsAmount = calculatedTdsAmount;
    if (workingDaysInMonth > 0 && daysWorked > 0) {
      proratedTdsAmount = (calculatedTdsAmount * daysWorked) / workingDaysInMonth;
    } else {
      proratedTdsAmount = 0;
    }
    proratedTdsAmount = Math.round(proratedTdsAmount);

    // Prorate Professional Tax
    let proratedProfessionalTax = 0;
    if (professionalTax !== null && professionalTax > 0) {
      if (workingDaysInMonth > 0 && daysWorked > 0) {
        proratedProfessionalTax = (professionalTax * daysWorked) / workingDaysInMonth;
      } else {
        proratedProfessionalTax = 0;
      }
    }
    proratedProfessionalTax = Math.round(proratedProfessionalTax);

    // Calculate total deductions
    let totalDeductionAmount = 0;
    totalDeductionAmount += proratedPfAmount;
    totalDeductionAmount += proratedProfessionalTax;
    totalDeductionAmount += proratedTdsAmount;

    // Calculate net payable (prorated salary - prorated deductions)
    let calculatedNetPayable = Math.max(0, proratedTotalEarnings - totalDeductionAmount);

    // If net salary is provided from API, use it (but cap it at prorated earnings)
    if (netSalary !== null && netSalary > 0) {
      // Only use API net salary if it's less than or equal to prorated earnings
      // This prevents showing full salary when employee was absent
      if (netSalary <= proratedTotalEarnings) {
        calculatedNetPayable = Math.round(netSalary);
      } else {
        // If API net salary is greater than prorated earnings, use prorated earnings minus deductions
        calculatedNetPayable = Math.max(0, Math.round(proratedTotalEarnings - totalDeductionAmount));
      }
    }

    // If no days worked, net salary should be 0
    if (daysWorked === 0) {
      calculatedNetPayable = 0;
    }

    // Calculate annual CTC
    let calculatedAnnualCTC = 0;
    if (annualCTC !== null && annualCTC > 0) {
      calculatedAnnualCTC = annualCTC;
    } else {
      calculatedAnnualCTC = calculatedTotalEarnings * 12;
    }

    // Get bank details
    const bankDetails = empData.bank_details || {};

    return {
      // Allowance
      basicSalary,
      hra,
      conveyance,
      medical,
      specialAllowance,
      otherAllowance,
      totalEarnings: Math.round(calculatedTotalEarnings),
      proratedTotalEarnings: proratedTotalEarnings,
      annualCTC: calculatedAnnualCTC,
      
      // Deductions
      absentDeduction: Math.round(absentDeduction),
      halfDayDeduction: Math.round(halfDayDeduction),
      lateDeduction: Math.round(lateDeduction),
      pfAmount: proratedPfAmount,
      pfPercentage,
      professionalTax: proratedProfessionalTax,
      tdsAmount: proratedTdsAmount,
      tdsPercentage,
      totalDeductions: Math.round(totalDeductionAmount),
      
      // Net
      netPayable: calculatedNetPayable,
      
      // Attendance
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      weeklyOffs,
      lateDays,
      excessiveLateDays,
      halfSalaryDeductionApplied,
      daysWorked: Math.round(daysWorked * 10) / 10,
      workingDaysInMonth,
      
      // Rates
      dailyRate: Math.round(dailyRate * 100) / 100,
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      daysInMonth,
      
      // Employee details
      joiningDate: empData.joining_date,
      confirmDate: empData.confirm_date,
      designation: empData.designation || 'N/A',
      level: empData.level || 'N/A',
      fatherName: empData.father_name || 'N/A',
      motherName: empData.mother_name || 'N/A',
      
      // Bank details
      bankName: bankDetails.bank_name || 'N/A',
      bankAccountNumber: bankDetails.bank_account_number || 'N/A',
      bankIfsc: bankDetails.bank_ifsc || 'N/A',
      bankBranch: bankDetails.bank_branch || 'N/A',
      bankAccountName: bankDetails.bank_account_name || 'N/A',
      uanNumber: bankDetails.uan_number || 'N/A',
      panNumber: bankDetails.pan_number || 'N/A',
      
      // Settings
      officeStartTime: leaveSettings?.lateThresholdRules?.officeStartTime || '09:00',
      halfDayLateThreshold: leaveSettings?.lateThresholdRules?.halfDayLateThresholdMinutes || 15,
    };
  }, [employee, employeeDetails, leaveSettings, month, year]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("PDF download will be implemented with html2canvas and jspdf");
  };

  if (!employee || !salaryDetails) return null;

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-auto bg-white rounded-lg shadow-xl border border-gray-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-start justify-between z-10">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900">
              Salary Slip
            </h3>
            <p className="text-[12px] text-gray-600 mt-1">
              <strong>Emp Code:</strong> {employee.empCode}{" "}
              <span className="mx-1">|</span>
              <strong>Name:</strong> {employee.empName}{" "}
              <span className="mx-1">|</span>
              <strong>Department:</strong> {employee.department}
            </p>
            <p className="text-[12px] text-gray-600">
              <strong>Month:</strong> {monthName} {year}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-8 px-3 border border-gray-300 bg-white rounded text-[12px] font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="h-8 px-3 border border-gray-300 bg-white rounded text-[12px] font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          /* Salary Slip Content */
          <div id="salary-slip-content" className="p-6 print:p-4">
            {/* Company Header */}
            <div className="text-center border-b border-gray-200 pb-4 mb-6">
              <h1 className="text-[24px] font-bold text-gray-900">
                Hi Walk Travels PVT LTD
              </h1>
              <p className="text-[12px] text-gray-600">
                Noida, Uttar Pradesh, India
              </p>
              <p className="text-[12px] text-gray-600">
                GST: 09ABCDE1234F1Z5 | PAN: ABCDE1234F
              </p>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Employee Code</p>
                <p className="text-[14px] font-semibold">{employee.empCode}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Employee Name</p>
                <p className="text-[14px] font-semibold">{employee.empName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Designation</p>
                <p className="text-[14px] font-semibold">{salaryDetails.designation}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Level</p>
                <p className="text-[14px] font-semibold">{salaryDetails.level}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Department</p>
                <p className="text-[14px] font-semibold">{employee.department}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Month</p>
                <p className="text-[14px] font-semibold">{monthName} {year}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Present Days</p>
                <p className="text-[14px] font-semibold text-green-600">{salaryDetails.presentDays}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Absent Days</p>
                <p className="text-[14px] font-semibold text-red-600">{salaryDetails.absentDays}</p>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Earnings */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-[14px] font-bold text-gray-800">Earnings</h4>
                </div>
                <div className="p-4">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[12px] text-gray-600">Basic Salary</span>
                    <span className="text-[12px] font-semibold">
                      {salaryDetails.basicSalary !== null && salaryDetails.basicSalary > 0 
                        ? `₹${salaryDetails.basicSalary.toLocaleString()}` 
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[12px] text-gray-600">House Rent Allowance (HRA)</span>
                    <span className="text-[12px] font-semibold">
                      {salaryDetails.hra !== null && salaryDetails.hra > 0 
                        ? `₹${salaryDetails.hra.toLocaleString()}` 
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[12px] text-gray-600">Conveyance Allowance</span>
                    <span className="text-[12px] font-semibold">
                      {salaryDetails.conveyance !== null && salaryDetails.conveyance > 0 
                        ? `₹${salaryDetails.conveyance.toLocaleString()}` 
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[12px] text-gray-600">Medical Allowance</span>
                    <span className="text-[12px] font-semibold">
                      {salaryDetails.medical !== null && salaryDetails.medical > 0 
                        ? `₹${salaryDetails.medical.toLocaleString()}` 
                        : '-'}
                    </span>
                  </div>
                  {salaryDetails.specialAllowance !== null && salaryDetails.specialAllowance > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">Special Allowance</span>
                      <span className="text-[12px] font-semibold">
                        ₹{salaryDetails.specialAllowance.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {salaryDetails.otherAllowance !== null && salaryDetails.otherAllowance > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">Other Allowance</span>
                      <span className="text-[12px] font-semibold">
                        ₹{salaryDetails.otherAllowance.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-gray-100 bg-blue-50">
                    <span className="text-[12px] font-medium text-blue-700">Prorated Total Earnings</span>
                    <span className="text-[12px] font-semibold text-blue-700">
                      {salaryDetails.proratedTotalEarnings > 0 
                        ? `₹${salaryDetails.proratedTotalEarnings.toLocaleString()}` 
                        : '₹0'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 mt-1 rounded px-2">
                    <span className="text-[12px] text-gray-600">Monthly Total Earnings</span>
                    <span className="text-[12px] text-gray-700">
                      {salaryDetails.totalEarnings > 0 
                        ? `₹${salaryDetails.totalEarnings.toLocaleString()}` 
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-[14px] font-bold text-gray-800">Deductions</h4>
                </div>
                <div className="p-4">
                  {salaryDetails.absentDays > 0 && salaryDetails.absentDeduction > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">
                        Absent Deduction ({salaryDetails.absentDays} days)
                      </span>
                      <span className="text-[12px] font-semibold text-red-600">
                        -₹{salaryDetails.absentDeduction.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {salaryDetails.halfDays > 0 && salaryDetails.halfDayDeduction > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">
                        Half Day Deduction ({salaryDetails.halfDays} days)
                      </span>
                      <span className="text-[12px] font-semibold text-red-600">
                        -₹{salaryDetails.halfDayDeduction.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {salaryDetails.lateDeduction > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">
                        Late Arrival Deduction ({salaryDetails.excessiveLateDays} days)
                      </span>
                      <span className="text-[12px] font-semibold text-red-600">
                        -₹{salaryDetails.lateDeduction.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {salaryDetails.pfPercentage !== null && salaryDetails.pfAmount > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">
                        Provident Fund ({salaryDetails.pfPercentage}%)
                      </span>
                      <span className="text-[12px] font-semibold text-red-600">
                        -₹{salaryDetails.pfAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {salaryDetails.professionalTax !== null && salaryDetails.professionalTax > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">Professional Tax</span>
                      <span className="text-[12px] font-semibold text-red-600">
                        -₹{salaryDetails.professionalTax.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {salaryDetails.tdsPercentage !== null && salaryDetails.tdsAmount > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[12px] text-gray-600">
                        TDS ({salaryDetails.tdsPercentage}%)
                      </span>
                      <span className="text-[12px] font-semibold text-red-600">
                        -₹{salaryDetails.tdsAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 bg-red-50 mt-2 rounded px-2">
                    <span className="text-[13px] font-bold text-gray-800">Total Deductions</span>
                    <span className="text-[13px] font-bold text-red-600">
                      {salaryDetails.totalDeductions > 0 
                        ? `-₹${salaryDetails.totalDeductions.toLocaleString()}` 
                        : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Payable */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <p className="text-[12px] text-gray-600">Net Payable for {monthName} {year}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Annual CTC: {salaryDetails.annualCTC > 0 ? `₹${salaryDetails.annualCTC.toLocaleString()}` : 'N/A'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Working Days: {salaryDetails.workingDaysInMonth} | Present: {salaryDetails.presentDays} | Absent: {salaryDetails.absentDays}
                  </p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className="text-[28px] font-bold text-blue-700">
                    {salaryDetails.netPayable > 0 ? `₹${salaryDetails.netPayable.toLocaleString()}` : '₹0'}
                  </p>
                  {salaryDetails.netPayable > 0 && (
                    <p className="text-[10px] text-gray-500">
                      (In words: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
                        .format(salaryDetails.netPayable)
                        .replace('₹', '')} only)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Present</p>
                <p className="text-[16px] font-bold text-green-600">{salaryDetails.presentDays}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Absent</p>
                <p className="text-[16px] font-bold text-red-600">{salaryDetails.absentDays}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Leave</p>
                <p className="text-[16px] font-bold text-blue-600">{salaryDetails.leaveDays}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Half Day</p>
                <p className="text-[16px] font-bold text-orange-600">{salaryDetails.halfDays}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Late</p>
                <p className="text-[16px] font-bold text-yellow-600">{salaryDetails.lateDays}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Weekly Off</p>
                <p className="text-[16px] font-bold text-purple-600">{salaryDetails.weeklyOffs}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Days Worked</p>
                <p className="text-[16px] font-bold text-indigo-600">{salaryDetails.daysWorked}</p>
              </div>
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Bank Name</p>
                <p className="text-[12px] font-semibold">{salaryDetails.bankName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Account Number</p>
                <p className="text-[12px] font-semibold">{salaryDetails.bankAccountNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">IFSC Code</p>
                <p className="text-[12px] font-semibold">{salaryDetails.bankIfsc}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Account Holder</p>
                <p className="text-[12px] font-semibold">{salaryDetails.bankAccountName}</p>
              </div>
            </div>

            {/* Additional Details - Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[12px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                {showDetails ? 'Hide' : 'Show'} Additional Details
              </button>

              {showDetails && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="font-semibold">Father's Name:</span> {salaryDetails.fatherName}
                    </div>
                    <div>
                      <span className="font-semibold">Mother's Name:</span> {salaryDetails.motherName}
                    </div>
                    <div>
                      <span className="font-semibold">Designation:</span> {salaryDetails.designation}
                    </div>
                    <div>
                      <span className="font-semibold">Joining Date:</span> {salaryDetails.joiningDate ? new Date(salaryDetails.joiningDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Confirm Date:</span> {salaryDetails.confirmDate ? new Date(salaryDetails.confirmDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Daily Rate:</span> ₹{salaryDetails.dailyRate.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold">Hourly Rate:</span> ₹{salaryDetails.hourlyRate.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold">Office Start Time:</span> {salaryDetails.officeStartTime}
                    </div>
                    <div>
                      <span className="font-semibold">Late Threshold:</span> {salaryDetails.halfDayLateThreshold} mins
                    </div>
                    <div>
                      <span className="font-semibold">PF Percentage:</span> {salaryDetails.pfPercentage !== null ? `${salaryDetails.pfPercentage}%` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">TDS Percentage:</span> {salaryDetails.tdsPercentage !== null ? `${salaryDetails.tdsPercentage}%` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Professional Tax:</span> {salaryDetails.professionalTax !== null ? `₹${salaryDetails.professionalTax.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <p className="text-[10px] text-gray-500">
                This is a system-generated salary slip. For any discrepancies, please contact HR department.
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Generated on: {new Date().toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: absolute !important;
            background: white !important;
          }
          .max-h-\\[92vh\\] {
            max-height: 100% !important;
            overflow: visible !important;
          }
          .overflow-auto {
            overflow: visible !important;
          }
          button {
            display: none !important;
          }
          .sticky {
            position: relative !important;
          }
          .bg-black\\/50 {
            background: white !important;
          }
          #salary-slip-content {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SalarySlip;