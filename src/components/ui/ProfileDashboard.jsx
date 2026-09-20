import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pencil, Mail, Phone, MapPin, Calendar, User, Briefcase,
  DollarSign, FileText, BookOpen, CreditCard, Users, Globe,
  Shield, Home, Award, Clock, CheckCircle, XCircle, Download, Eye,
  Building2, GraduationCap, Heart, PhoneCall, Printer, Share2, Star,
  IdCard, FileCheck, Key, Lock, TrendingUp, TrendingDown, Wallet,
  Building, Briefcase as BriefcaseIcon, Target, Award as AwardIcon,
  EyeOff, Eye as EyeIcon, Copy, Check, Server, ShieldCheck, Send, Loader, X,
  AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import axios from "axios";

// --- PDF IMPORTS ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
//  EMAIL SERVICE (unchanged)
// ============================================================
const sendEmployeeEmail = async (employeeData, emailType, customData = {}) => {
  try {
    let subject = '';
    let message = '';

    switch (emailType) {
      case 'welcome':
        subject = `Welcome to the Team, ${employeeData.name}!`;
        message = `Dear ${employeeData.name},\n\nWelcome to our team! We're excited to have you onboard.\n\nYour Employee ID: ${employeeData.id}\nDesignation: ${employeeData.designation}\nJoining Date: ${new Date(employeeData.joining_date).toLocaleDateString()}\n\nPlease find your login credentials below:\nPortal Email: ${employeeData.email}\nPortal Password: ${employeeData.password_plain || 'Please set your password'}\nOfficial Email: ${employeeData.official_email || 'Will be provided soon'}\n\nBest regards,\nHR Team`;
        break;
      case 'credentials':
        subject = `Your Account Credentials - ${employeeData.name}`;
        message = `Dear ${employeeData.name},\n\nHere are your account credentials:\n\nEmployee Portal Access:\nEmail: ${employeeData.email}\nPassword: ${employeeData.password_plain || '********'}\n\nOfficial Email Account:\nEmail: ${employeeData.official_email || 'Not assigned'}\nPassword: ${employeeData.official_email_password || 'Not set'}\n\nPlease change your password after first login for security purposes.\n\nRegards,\nIT Support Team`;
        break;
      case 'salary':
        subject = `Salary Details - ${new Date().toLocaleDateString()}`;
        message = `Dear ${employeeData.name},\n\nYour salary details for this month:\n\nBasic Salary: ₹${employeeData.basic_salary}\nHRA: ₹${employeeData.hra}\nTotal Earnings: ₹${employeeData.total_earnings}\nTotal Deductions: ₹${employeeData.total_deductions}\nNet Salary: ₹${employeeData.net_salary}\n\nFor any queries, please contact the finance department.\n\nRegards,\nFinance Team`;
        break;
      default:
        subject = customData.subject || `Important Update for ${employeeData.name}`;
        message = customData.message || '';
    }

    const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/email/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: employeeData.email,
        subject: subject,
        message: message
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send email');
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
//  EMAIL MODAL (unchanged)
// ============================================================
const EmailModal = ({ isOpen, onClose, onSend, employee, emailType }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSubject(getDefaultSubject());
      setMessage(getDefaultMessage());
    }
  }, [isOpen, emailType, employee]);

  const getDefaultSubject = () => {
    switch (emailType) {
      case 'welcome': return `Welcome to the Team, ${employee?.name}!`;
      case 'credentials': return `Your Account Credentials - ${employee?.name}`;
      case 'salary': return `Salary Details - ${new Date().toLocaleDateString()}`;
      default: return `Information for ${employee?.name}`;
    }
  };

  const getDefaultMessage = () => {
    switch (emailType) {
      case 'welcome':
        return `Dear ${employee?.name},\n\nWelcome to our team! We're excited to have you onboard.\n\nEmployee ID: ${employee?.id}\nDesignation: ${employee?.designation}\n\nBest regards,\nHR Team`;
      case 'credentials':
        return `Dear ${employee?.name},\n\nHere are your account credentials:\n\nEmployee Portal:\nEmail: ${employee?.email}\nPassword: ${employee?.password_plain || '********'}\n\nRegards,\nIT Support Team`;
      case 'salary':
        return `Dear ${employee?.name},\n\nYour salary details for this month:\n\nNet Salary: ₹${employee?.net_salary}\n\nRegards,\nFinance Team`;
      default:
        return `Dear ${employee?.name},\n\n`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSend(subject, message);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Send Email to {employee?.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
            <input type="email" value={employee?.email || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={12} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
//  SALARY SLIP GENERATOR with PDF DOWNLOAD
// ============================================================
// ============================================================
//  SALARY SLIP GENERATOR with PDF DOWNLOAD (INTEGRATED)
// ============================================================
const SalarySlipGenerator = ({ employeeId, employeeData, leaveSettings }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveBalanceData, setLeaveBalanceData] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const safeToFixed = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0.00";
    }
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(decimals);
  };

  const safeNumber = (value, defaultValue = 0) => {
    if (value === undefined || value === null) return defaultValue;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Extract rules from leaveSettings
  const overtimeRules = leaveSettings?.overtimeRules || leaveSettings?.overtime_config || {};
  const lateRules = leaveSettings?.lateThresholdRules || leaveSettings?.late_threshold_config || {};

  const minimumOvertimeHours = safeNumber(overtimeRules.minimumOvertimeHours, 1);
  const allowCompensatoryLeave = overtimeRules.allowCompensatoryLeave ?? true;
  const allowOvertimePayment = overtimeRules.allowOvertimePayment ?? true;
  const allowTimeOffAdjustment = overtimeRules.allowTimeOffAdjustment ?? false;

  const officeStartTime = lateRules.officeStartTime ?? '09:00';
  const halfDayLateThresholdMinutes = safeNumber(lateRules.halfDayLateThresholdMinutes, 15);
  const halfSalaryDeductionEnabled = lateRules.halfSalaryDeductionEnabled ?? true;
  const allowOvertimeAdjustmentForLateArrival = lateRules.allowOvertimeAdjustmentForLateArrival ?? true;

  const workingHoursPerDay = safeNumber(leaveSettings?.workingHours, 8);
  const workingDaysPerWeek = safeNumber(leaveSettings?.workingDays, 5);

  // -----------------------------------------------------------------
  // NEW: Calculate monthly salary components from employee data
  // -----------------------------------------------------------------
  const calculateMonthlyComponents = () => {
    // 1. Get annual CTC from employeeData or allowance
    let annualCTC = safeNumber(employeeData?.annual_ctc, 0);
    if (annualCTC === 0 && employeeData?.allowance?.annual_ctc) {
      annualCTC = safeNumber(employeeData.allowance.annual_ctc, 0);
    }

    // 2. Get individual monthly components from allowance
    const allowance = employeeData?.allowance || {};
    let basicSalary = safeNumber(allowance.basic_salary, 0);
    let hra = safeNumber(allowance.hra, 0);
    let conveyance = safeNumber(allowance.conveyance, 0);
    let specialAllowance = safeNumber(allowance.special_allowance, 0);
    let otherAllowance = safeNumber(allowance.other_allowance, 0);
    let medical = safeNumber(allowance.medical, 0); // not used in final but kept

    // 3. If annualCTC is still 0, compute from total_earnings if present
    let monthlyCTC = 0;
    if (annualCTC > 0) {
      monthlyCTC = annualCTC / 12;
    } else {
      const totalEarnings = safeNumber(allowance.total_earnings || employeeData?.total_earnings, 0);
      if (totalEarnings > 0) monthlyCTC = totalEarnings;
    }

    // 4. If no components are set, fallback to percentage split
    if (basicSalary === 0 && hra === 0 && conveyance === 0 && specialAllowance === 0 && otherAllowance === 0) {
      if (monthlyCTC > 0) {
        const percentages = {
          basic: 0.50,
          hra: 0.30,
          conveyance: 0.05,
          special: 0.10,
          other: 0.05
        };
        basicSalary = monthlyCTC * percentages.basic;
        hra = monthlyCTC * percentages.hra;
        conveyance = monthlyCTC * percentages.conveyance;
        specialAllowance = monthlyCTC * percentages.special;
        otherAllowance = monthlyCTC * percentages.other;
        // adjust to match monthlyCTC exactly
        const totalCalculated = basicSalary + hra + conveyance + specialAllowance + otherAllowance;
        if (totalCalculated !== monthlyCTC) {
          const adjustment = monthlyCTC - totalCalculated;
          basicSalary += adjustment;
        }
      }
    }

    // 5. Compute total earnings (sum of components) or use stored total_earnings
    let totalEarnings = basicSalary + hra + conveyance + specialAllowance + otherAllowance;
    const storedTotal = safeNumber(allowance.total_earnings || employeeData?.total_earnings, 0);
    if (storedTotal > 0) totalEarnings = storedTotal;

    // 6. Recompute annualCTC if still zero
    if (annualCTC === 0 && totalEarnings > 0) {
      annualCTC = totalEarnings * 12;
    }

    return {
      basicSalary: Math.round(basicSalary),
      hra: Math.round(hra),
      conveyance: Math.round(conveyance),
      specialAllowance: Math.round(specialAllowance),
      otherAllowance: Math.round(otherAllowance),
      totalEarnings: Math.round(totalEarnings),
      annualCTC: Math.round(annualCTC)
    };
  };

  // -----------------------------------------------------------------
  // Overtime / Late / Absent calculations (unchanged)
  // -----------------------------------------------------------------
  const calculateOvertimePay = (totalOvertimeHours) => {
    const overtimeHours = safeNumber(totalOvertimeHours, 0);
    if (!allowOvertimePayment) return 0;
    if (overtimeHours < minimumOvertimeHours) return 0;
    const monthlySalary = safeNumber(employeeData?.annual_ctc, 0) / 12;
    const hourlyRate = monthlySalary / (workingHoursPerDay * workingDaysPerWeek * 4);
    const overtimePayRate = 1.5;
    return overtimeHours * hourlyRate * overtimePayRate;
  };

  const calculateLateDeductions = (lateDays, dailySalary) => {
    const days = safeNumber(lateDays, 0);
    const dailySalaryNum = safeNumber(dailySalary, 0);
    if (!halfSalaryDeductionEnabled) return 0;
    if (days === 0) return 0;
    const deductionPerDay = dailySalaryNum * 0.5;
    return days * deductionPerDay;
  };

  const calculateAbsentDeductions = (absentDays, dailySalary) => {
    const days = safeNumber(absentDays, 0);
    const dailySalaryNum = safeNumber(dailySalary, 0);
    if (days === 0) return 0;
    return days * dailySalaryNum;
  };

  // -----------------------------------------------------------------
  // Fetch attendance and leave data (unchanged)
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) return;
      setLoading(true);
      setError(null);
      try {
        const attendanceRes = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/employee/${employeeId}`);
        setAttendanceData(attendanceRes.data);
        const leaveRes = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/employee/${employeeId}`);
        setLeaveBalanceData(leaveRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  useEffect(() => {
    if (attendanceData && employeeData) {
      calculateSalary();
    }
  }, [selectedMonth, selectedYear, attendanceData, employeeData]);

  // -----------------------------------------------------------------
  // Main salary calculation (updated to use actual components)
  // -----------------------------------------------------------------
  const calculateSalary = () => {
    const records = attendanceData?.history || [];
    const monthRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });
    
    let presentDays = 0;
    let leaveDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let lateMinutes = 0;
    let halfDays = 0;
    let overtimeHours = 0;
    let leaveRecords = [];
    const dailyRecords = [];
    
    monthRecords.forEach(record => {
      const status = record.status;
      const recordDate = new Date(record.date);
      const formattedDate = recordDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      let minutesLate = 0;
      let isLate = false;
      
      if (record.check_in && officeStartTime) {
        const checkInTime = record.check_in;
        const [officeHour, officeMinute] = officeStartTime.split(':');
        const [checkInHour, checkInMinute] = checkInTime.split(':');
        const officeTotalMinutes = parseInt(officeHour) * 60 + parseInt(officeMinute);
        const checkInTotalMinutes = parseInt(checkInHour) * 60 + parseInt(checkInMinute);
        if (checkInTotalMinutes > officeTotalMinutes) {
          minutesLate = checkInTotalMinutes - officeTotalMinutes;
          lateMinutes += minutesLate;
          isLate = true;
        }
      }
      
      let overtime = 0;
      if (record.overtime_hours) {
        overtime = safeNumber(record.overtime_hours, 0);
        overtimeHours += overtime;
      }
      
      let dayStatus = '';
      if (status === 'present' || status === 'Present') {
        presentDays++;
        dayStatus = 'Present';
      } else if (status === 'late' || status === 'Late') {
        presentDays++;
        lateDays++;
        dayStatus = 'Late';
      } else if (status === 'half_day' || status === 'Half Day' || status === 'HD') {
        presentDays += 0.5;
        halfDays++;
        dayStatus = 'Half Day';
      } else if (status === 'leave' || status === 'Leave' || status === 'L') {
        leaveDays++;
        dayStatus = `Leave (${record.leave_type || 'Casual Leave'})`;
        leaveRecords.push(record);
      } else if (status === 'absent' || status === 'Absent' || status === 'A') {
        absentDays++;
        dayStatus = 'Absent';
      }
      
      dailyRecords.push({
        date: formattedDate,
        checkIn: record.check_in || '-',
        checkOut: record.check_out || '-',
        status: dayStatus,
        isLate: isLate,
        minutesLate: minutesLate,
        overtime: overtime
      });
    });
    
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const monthlyComponents = calculateMonthlyComponents();
    const { basicSalary, hra, conveyance, specialAllowance, otherAllowance, totalEarnings, annualCTC } = monthlyComponents;
    const perDaySalary = daysInMonth > 0 ? totalEarnings / daysInMonth : 0;
    
    // Leave balance logic (unchanged)
    let availableLeaveBalance = 0;
    let monthlyLeaveQuota = 1;
    let rolloverBalance = 0;
    
    if (leaveBalanceData?.monthly_balance) {
      const leaveTypes = Object.keys(leaveBalanceData.yearly_balance || {});
      const leaveType = leaveTypes[0];
      if (leaveType && leaveBalanceData.monthly_balance[leaveType]) {
        const monthlyData = leaveBalanceData.monthly_balance[leaveType];
        if (monthlyData[selectedMonth + 1]) {
          const monthData = monthlyData[selectedMonth + 1];
          monthlyLeaveQuota = safeNumber(monthData.monthly_quota, 1);
          availableLeaveBalance = safeNumber(monthData.remaining, 0);
          rolloverBalance = safeNumber(monthData.rollover, 0);
        } else if (monthlyData.current && monthlyData.current.month === selectedMonth + 1) {
          const currentData = monthlyData.current;
          monthlyLeaveQuota = safeNumber(currentData.monthly_quota, 1);
          availableLeaveBalance = safeNumber(currentData.remaining, 0);
          rolloverBalance = safeNumber(currentData.rollover, 0);
        } else {
          monthlyLeaveQuota = 1;
          availableLeaveBalance = 1;
        }
      }
    }
    
    let totalLeavesTaken = 0;
    if (leaveBalanceData?.leave_history) {
      totalLeavesTaken = leaveBalanceData.leave_history.filter(leave => {
        const leaveStartDate = new Date(leave.start_date);
        return leaveStartDate.getMonth() === selectedMonth && 
               leaveStartDate.getFullYear() === selectedYear &&
               leave.status === 'approved';
      }).length;
    }
    totalLeavesTaken = Math.max(totalLeavesTaken, leaveRecords.length);
    const totalAvailableLeave = availableLeaveBalance + rolloverBalance;
    const totalUnpaidLeaves = Math.max(0, totalLeavesTaken - totalAvailableLeave);
    const leaveDeduction = totalUnpaidLeaves * perDaySalary;
    
    const lateDeduction = calculateLateDeductions(lateDays, perDaySalary);
    const absentDeduction = calculateAbsentDeductions(absentDays, perDaySalary);
    const overtimePay = calculateOvertimePay(overtimeHours);
    
    // --- Deductions from employee data ---
    const deductions = employeeData?.deductions || {};
    let pfPercentage = safeNumber(deductions.pf_percentage || employeeData?.pf_percentage, 12);
    const pfDeduction = (basicSalary * pfPercentage) / 100;
    
    // Professional Tax: fixed amount or computed
    let professionalTax = safeNumber(deductions.professional_tax || employeeData?.professional_tax_fixed, 0);
    if (professionalTax === 0) {
      // fallback to slab if not set
      if (totalEarnings <= 30000) professionalTax = 0;
      else if (totalEarnings <= 45000) professionalTax = 150;
      else if (totalEarnings <= 60000) professionalTax = 200;
      else professionalTax = 250;
    }
    
    // TDS percentage
    let tdsPercentage = safeNumber(deductions.tds_percentage || employeeData?.tds_percentage, 0);
    if (tdsPercentage === 0) {
      // fallback to slab based on annual income
      const annualIncome = totalEarnings * 12;
      if (annualIncome <= 250000) tdsPercentage = 0;
      else if (annualIncome <= 500000) tdsPercentage = 5;
      else if (annualIncome <= 750000) tdsPercentage = 10;
      else if (annualIncome <= 1000000) tdsPercentage = 15;
      else if (annualIncome <= 1500000) tdsPercentage = 20;
      else tdsPercentage = 30;
    }
    const tdsDeduction = (totalEarnings * tdsPercentage) / 100;
    
    const totalDeductions = pfDeduction + professionalTax + tdsDeduction + leaveDeduction + lateDeduction + absentDeduction;
    const netSalary = totalEarnings + overtimePay - totalDeductions;
    const expectedWorkingDays = daysInMonth - 8;
    const attendancePercentage = expectedWorkingDays > 0 ? ((presentDays / expectedWorkingDays) * 100).toFixed(2) : "100.00";
    
    setSalaryData({
      month: `${months[selectedMonth]} ${selectedYear}`,
      dailyRecords: dailyRecords,
      attendance: {
        totalWorkingDays: monthRecords.length,
        presentDays: Math.floor(presentDays),
        leaveDays: totalLeavesTaken,
        absentDays,
        lateDays,
        lateMinutes: safeNumber(lateMinutes),
        halfDays,
        overtimeHours: safeNumber(overtimeHours),
        attendancePercentage,
        expectedWorkingDays
      },
      leaveDetails: {
        totalLeavesTaken,
        monthlyLeaveQuota,
        availableLeaveBalance,
        rolloverBalance,
        totalUnpaidLeaves,
        paidLeaves: Math.max(0, totalLeavesTaken - totalUnpaidLeaves),
        perDaySalary: safeToFixed(perDaySalary, 2),
        leaveDeduction: safeNumber(leaveDeduction)
      },
      lateDetails: {
        lateDays,
        lateMinutes: safeNumber(lateMinutes),
        lateDeduction: safeNumber(lateDeduction),
        deductionPerLateDay: safeNumber(perDaySalary * 0.5),
        halfDayThreshold: halfDayLateThresholdMinutes,
        halfSalaryDeductionEnabled,
        allowOvertimeAdjustment: allowOvertimeAdjustmentForLateArrival,
        officeStartTime
      },
      absentDetails: {
        absentDays,
        absentDeduction: safeNumber(absentDeduction),
        deductionPerAbsentDay: safeNumber(perDaySalary)
      },
      overtimeDetails: {
        overtimeHours: safeNumber(overtimeHours),
        overtimePay: safeNumber(overtimePay),
        minimumOvertimeHours,
        allowCompensatoryLeave,
        allowOvertimePayment,
        allowTimeOffAdjustment
      },
      earnings: { 
        basicSalary: safeNumber(basicSalary), 
        hra: safeNumber(hra), 
        conveyance: safeNumber(conveyance), 
        specialAllowance: safeNumber(specialAllowance), 
        otherAllowance: safeNumber(otherAllowance), 
        totalEarnings: safeNumber(totalEarnings), 
        overtimePay: safeNumber(overtimePay) 
      },
      deductions: {
        leaveDeduction: safeNumber(leaveDeduction),
        lateDeduction: safeNumber(lateDeduction),
        absentDeduction: safeNumber(absentDeduction),
        pfDeduction: safeNumber(pfDeduction),
        pfPercentage: safeNumber(pfPercentage),
        professionalTax: safeNumber(professionalTax),
        tdsDeduction: safeNumber(tdsDeduction),
        tdsPercentage: safeNumber(tdsPercentage),
        totalDeductions: safeNumber(totalDeductions)
      },
      netSalary: Math.max(0, safeNumber(netSalary)),
      perDaySalary: safeToFixed(perDaySalary, 2),
      daysInMonth,
      annualCTC: safeNumber(annualCTC),
      rulesApplied: {
        minimumOvertimeHours,
        allowCompensatoryLeave,
        allowOvertimePayment,
        allowTimeOffAdjustment,
        halfDayLateThresholdMinutes,
        halfSalaryDeductionEnabled,
        allowOvertimeAdjustmentForLateArrival,
        officeStartTime,
        workingHoursPerDay,
        workingDaysPerWeek
      }
    });
  };

  // ============================================================
  //  PDF DOWNLOAD FUNCTION (uses the same data)
  // ============================================================
  const downloadSalarySlip = () => {
    if (!salaryData || !employeeData) return;

    const doc = new jsPDF();
    let y = 20;

    const centerText = (text, size = 16, style = 'bold') => {
      doc.setFontSize(size);
      doc.setFont(undefined, style);
      const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(text, (pageWidth - textWidth) / 2, y);
      y += 8;
    };

    // Header
    centerText('SALARY SLIP', 20, 'bold');
    centerText(salaryData.month, 14, 'normal');
    y += 4;

    // Employee Info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Employee Name: ${employeeData?.name || 'N/A'}`, 14, y);
    doc.text(`Employee ID: ${employeeId}`, 14, y + 6);
    doc.text(`Designation: ${employeeData?.designation || 'N/A'}`, 14, y + 12);
    doc.text(`Annual CTC: ₹${safeToFixed(salaryData.annualCTC)}`, 14, y + 18);
    y += 24;

    // Earnings Table
    const earningsData = [
      ['Basic Salary', `₹${safeToFixed(salaryData.earnings.basicSalary)}`],
      ['HRA', `₹${safeToFixed(salaryData.earnings.hra)}`],
      ['Conveyance', `₹${safeToFixed(salaryData.earnings.conveyance)}`],
      ['Special Allowance', `₹${safeToFixed(salaryData.earnings.specialAllowance)}`],
      ['Other Allowance', `₹${safeToFixed(salaryData.earnings.otherAllowance)}`],
    ];
    if (salaryData.earnings.overtimePay > 0) {
      earningsData.push(['Overtime Pay', `₹${safeToFixed(salaryData.earnings.overtimePay)}`]);
    }
    earningsData.push(['Total Earnings', `₹${safeToFixed(salaryData.earnings.totalEarnings + salaryData.earnings.overtimePay)}`]);

    autoTable(doc, {
      startY: y,
      head: [['Earnings', 'Amount (₹)']],
      body: earningsData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      footStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Deductions Table
    const deductionsData = [
      ['Leave Deduction', `₹${safeToFixed(salaryData.deductions.leaveDeduction)}`],
      ['Late Deduction', `₹${safeToFixed(salaryData.deductions.lateDeduction)}`],
      ['Absent Deduction', `₹${safeToFixed(salaryData.deductions.absentDeduction)}`],
      [`PF (${safeToFixed(salaryData.deductions.pfPercentage)}%)`, `₹${safeToFixed(salaryData.deductions.pfDeduction)}`],
      ['Professional Tax', `₹${safeToFixed(salaryData.deductions.professionalTax)}`],
      [`TDS (${safeToFixed(salaryData.deductions.tdsPercentage)}%)`, `₹${safeToFixed(salaryData.deductions.tdsDeduction)}`],
      ['Total Deductions', `₹${safeToFixed(salaryData.deductions.totalDeductions)}`],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Deductions', 'Amount (₹)']],
      body: deductionsData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
      footStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Net Salary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Net Salary: ₹${safeToFixed(salaryData.netSalary)}`, 14, y);
    y += 10;

    // Attendance Summary
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Attendance Summary', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const att = salaryData.attendance;
    doc.text(`Present: ${att.presentDays}  |  Leave: ${att.leaveDays}  |  Absent: ${att.absentDays}`, 14, y);
    y += 6;
    doc.text(`Late: ${att.lateDays}  |  Overtime: ${safeToFixed(att.overtimeHours, 1)} hrs  |  Attendance: ${att.attendancePercentage}%`, 14, y);
    y += 8;

    // Leave & Deduction Details
    doc.setFontSize(10);
    doc.text(`Unpaid Leaves: ${salaryData.leaveDetails.totalUnpaidLeaves}  |  Per Day Salary: ₹${salaryData.perDaySalary}`, 14, y);
    y += 6;
    doc.text(`Late Deduction: ${salaryData.lateDetails.lateDays} days × ₹${safeToFixed(salaryData.lateDetails.deductionPerLateDay)} = ₹${safeToFixed(salaryData.lateDetails.lateDeduction)}`, 14, y);
    y += 6;
    doc.text(`Absent Deduction: ${salaryData.absentDetails.absentDays} days × ₹${safeToFixed(salaryData.absentDetails.deductionPerAbsentDay)} = ₹${safeToFixed(salaryData.absentDetails.absentDeduction)}`, 14, y);
    y += 8;

    // Rules Applied
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Applied Rules:', 14, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    const rules = salaryData.rulesApplied;
    doc.text(`• Overtime Min: ${rules.minimumOvertimeHours} hrs  |  Payment: ${rules.allowOvertimePayment ? 'Enabled' : 'Disabled'}`, 14, y);
    y += 5;
    doc.text(`• Compensatory Leave: ${rules.allowCompensatoryLeave ? 'Enabled' : 'Disabled'}  |  Office Start: ${rules.officeStartTime}`, 14, y);
    y += 5;
    doc.text(`• Half-Day Threshold: ${rules.halfDayLateThresholdMinutes} min  |  Half Salary Deduction: ${rules.halfSalaryDeductionEnabled ? 'Enabled' : 'Disabled'}`, 14, y);
    y += 5;
    doc.text(`• Full Salary Deduction for Absent Days: Enabled`, 14, y);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Generated automatically by HR System', 14, pageHeight - 10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 5);

    doc.save(`Salary_Slip_${employeeId}_${salaryData.month.replace(' ', '_')}.pdf`);
  };

  // --- Render (unchanged) ---
  if (loading && !salaryData) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm text-center">
        <AlertCircle size={24} className="mx-auto mb-2" />
        {error}
      </div>
    );
  }

  if (!salaryData) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rules Applied Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-blue-600" />
          <h4 className="font-semibold text-gray-800 text-sm">Applied Rules</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="bg-white rounded-lg p-2">
            <span className="text-gray-500">Overtime Min:</span>
            <span className="ml-1 font-medium">{salaryData.rulesApplied.minimumOvertimeHours}h</span>
          </div>
          <div className="bg-white rounded-lg p-2">
            <span className="text-gray-500">Half-Day @:</span>
            <span className="ml-1 font-medium">{salaryData.rulesApplied.halfDayLateThresholdMinutes} min</span>
          </div>
          <div className="bg-white rounded-lg p-2">
            <span className="text-gray-500">Late Deduct:</span>
            <span className="ml-1 font-medium">50%</span>
          </div>
          <div className="bg-white rounded-lg p-2">
            <span className="text-gray-500">Absent Deduct:</span>
            <span className="ml-1 font-medium">100%</span>
          </div>
          <div className="bg-white rounded-lg p-2">
            <span className="text-gray-500">Per Day Salary:</span>
            <span className="ml-1 font-medium">₹{safeToFixed(salaryData.perDaySalary)}</span>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
        <button onClick={() => {
          if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
          } else {
            setSelectedMonth(selectedMonth - 1);
          }
        }} className="p-2 hover:bg-white rounded-lg transition">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">{months[selectedMonth]} {selectedYear}</h3>
          <p className="text-xs text-gray-500">Days: {salaryData.daysInMonth}</p>
        </div>
        <button onClick={() => {
          const currentDate = new Date();
          if (selectedMonth === 11) {
            if (selectedYear < currentDate.getFullYear()) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            }
          } else {
            if (selectedYear === currentDate.getFullYear() && selectedMonth + 1 <= currentDate.getMonth()) {
              setSelectedMonth(selectedMonth + 1);
            } else if (selectedYear < currentDate.getFullYear()) {
              setSelectedMonth(selectedMonth + 1);
            }
          }
        }} className="p-2 hover:bg-white rounded-lg transition">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* CTC Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl text-center">
        <p className="text-sm text-gray-600">Annual CTC</p>
        <p className="text-2xl font-bold text-purple-600">₹{safeToFixed(salaryData.annualCTC)}</p>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Present</p>
          <p className="text-xl font-bold text-green-600">{salaryData.attendance.presentDays}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Leave</p>
          <p className="text-xl font-bold text-yellow-600">{salaryData.attendance.leaveDays}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Absent</p>
          <p className="text-xl font-bold text-red-600">{salaryData.attendance.absentDays}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Attendance %</p>
          <p className="text-xl font-bold text-blue-600">{salaryData.attendance.attendancePercentage}%</p>
        </div>
      </div>

      {/* Daily Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                <th className="border p-3 text-left text-gray-700 font-semibold text-sm">Date</th>
                <th className="border p-3 text-center text-gray-700 font-semibold text-sm">Check In</th>
                <th className="border p-3 text-center text-gray-700 font-semibold text-sm">Check Out</th>
                <th className="border p-3 text-center text-gray-700 font-semibold text-sm">Status</th>
                <th className="border p-3 text-center text-gray-700 font-semibold text-sm">Late (min)</th>
                <th className="border p-3 text-center text-gray-700 font-semibold text-sm">Overtime (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.dailyRecords.map((record, index) => {
                let statusColor = '';
                if (record.status === 'Present') statusColor = 'text-green-600';
                else if (record.status.includes('Leave')) statusColor = 'text-yellow-600';
                else if (record.status === 'Late') statusColor = 'text-orange-600';
                else if (record.status === 'Absent') statusColor = 'text-red-600 font-semibold';
                else if (record.status === 'Half Day') statusColor = 'text-blue-600';
                return (
                  <tr key={index} className="hover:bg-gray-50 border-b">
                    <td className="border p-3 text-sm text-gray-800">{record.date}</td>
                    <td className="border p-3 text-sm text-center">{record.checkIn}</td>
                    <td className="border p-3 text-sm text-center">{record.checkOut}</td>
                    <td className={`border p-3 text-sm text-center font-medium ${statusColor}`}>{record.status}</td>
                    <td className="border p-3 text-sm text-center">
                      {record.minutesLate > 0 ? `${record.minutesLate} min` : '-'}
                    </td>
                    <td className="border p-3 text-sm text-center">
                      {record.overtime > 0 ? `${safeToFixed(record.overtime, 1)} hrs` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Late, Absent & Overtime Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Late Arrivals</p>
            <Clock size={14} className="text-orange-500" />
          </div>
          <p className="text-lg font-bold text-orange-600">{salaryData.lateDetails.lateDays} days</p>
          <p className="text-xs text-gray-500">{salaryData.lateDetails.lateMinutes} minutes late</p>
          {salaryData.lateDetails.lateDeduction > 0 && (
            <>
              <p className="text-xs text-red-500 mt-1">Deduction: ₹{safeToFixed(salaryData.lateDetails.lateDeduction)}</p>
              <p className="text-xs text-gray-400">
                ({salaryData.lateDetails.lateDays} days × ₹{safeToFixed(salaryData.lateDetails.deductionPerLateDay)})
              </p>
            </>
          )}
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Absent Days</p>
            <XCircle size={14} className="text-red-500" />
          </div>
          <p className="text-lg font-bold text-red-600">{salaryData.absentDetails.absentDays} days</p>
          {salaryData.absentDetails.absentDeduction > 0 && (
            <>
              <p className="text-xs text-red-500 mt-1">Deduction: ₹{safeToFixed(salaryData.absentDetails.absentDeduction)}</p>
              <p className="text-xs text-gray-400">
                ({salaryData.absentDetails.absentDays} days × ₹{safeToFixed(salaryData.absentDetails.deductionPerAbsentDay)})
              </p>
            </>
          )}
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Overtime</p>
            <TrendingUp size={14} className="text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600">{safeToFixed(salaryData.overtimeDetails.overtimeHours, 1)} hrs</p>
          {salaryData.overtimeDetails.overtimePay > 0 && (
            <p className="text-xs text-green-500 mt-1">Pay: ₹{safeToFixed(salaryData.overtimeDetails.overtimePay)}</p>
          )}
          {salaryData.rulesApplied.allowCompensatoryLeave && salaryData.overtimeDetails.overtimeHours >= salaryData.rulesApplied.minimumOvertimeHours && (
            <p className="text-xs text-blue-500 mt-1">
              → {(salaryData.overtimeDetails.overtimeHours / 8).toFixed(1)} days leave eligible
            </p>
          )}
        </div>
      </div>

      {/* Salary Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
              <th className="border p-2 text-left">Earnings</th>
              <th className="border p-2 text-right">Amount (₹)</th>
              <th className="border p-2 text-left">Deductions</th>
              <th className="border p-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Basic Salary</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.earnings.basicSalary)}</td>
              <td className="border p-2 text-red-600">Leave Deduction</td>
              <td className="border p-2 text-right text-red-600">-{safeToFixed(salaryData.deductions.leaveDeduction)}</td>
            </tr>
            <tr>
              <td className="border p-2">HRA</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.earnings.hra)}</td>
              <td className="border p-2 text-red-600">Late Deduction</td>
              <td className="border p-2 text-right text-red-600">-{safeToFixed(salaryData.deductions.lateDeduction)}</td>
            </tr>
            <tr>
              <td className="border p-2">Conveyance</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.earnings.conveyance)}</td>
              <td className="border p-2 text-red-600">Absent Deduction</td>
              <td className="border p-2 text-right text-red-600">-{safeToFixed(salaryData.deductions.absentDeduction)}</td>
            </tr>
            <tr>
              <td className="border p-2">Special Allowance</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.earnings.specialAllowance)}</td>
              <td className="border p-2">PF ({safeToFixed(salaryData.deductions.pfPercentage)}%)</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.deductions.pfDeduction)}</td>
            </tr>
            <tr>
              <td className="border p-2">Other Allowance</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.earnings.otherAllowance)}</td>
              <td className="border p-2">Professional Tax</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.deductions.professionalTax)}</td>
            </tr>
            <tr>
              <td className="border p-2">-</td>
              <td className="border p-2 text-right">-</td>
              <td className="border p-2">TDS ({safeToFixed(salaryData.deductions.tdsPercentage)}%)</td>
              <td className="border p-2 text-right">{safeToFixed(salaryData.deductions.tdsDeduction)}</td>
            </tr>
            {salaryData.earnings.overtimePay > 0 && (
              <tr className="bg-green-50">
                <td className="border p-2 font-medium">Overtime Pay</td>
                <td className="border p-2 text-right font-medium text-green-600">+{safeToFixed(salaryData.earnings.overtimePay)}</td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
              </tr>
            )}
            <tr className="bg-gray-100 font-semibold">
              <td className="border p-2">Total Earnings</td>
              <td className="border p-2 text-right text-green-600">{safeToFixed(salaryData.earnings.totalEarnings + salaryData.earnings.overtimePay)}</td>
              <td className="border p-2">Total Deductions</td>
              <td className="border p-2 text-right text-red-600">{safeToFixed(salaryData.deductions.totalDeductions)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <td colSpan="3" className="border p-3 text-right font-bold">Net Salary</td>
              <td className="border p-3 text-right font-bold text-blue-600 text-xl">₹{safeToFixed(salaryData.netSalary)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadSalarySlip}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Download size={16} /> Download Salary Slip (PDF)
      </button>
    </div>
  );
};

// ============================================================
//  MAIN EMPLOYEE DETAIL COMPONENT
// ============================================================
const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('');
  const [showOfficialPassword, setShowOfficialPassword] = useState(false);
  const [showPanelPassword, setShowPanelPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [actualLeaves, setActualLeaves] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveSettings, setLeaveSettings] = useState(null);

  // Fetch leave settings
  useEffect(() => {
    async function fetchLeaveSettings() {
      try {
        const res = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/leave-settings/leave-settings');
        const data = await res.json();
        setLeaveSettings(data);
        console.log("✅ Leave settings loaded:", data);
      } catch (err) {
        console.error("❌ Error fetching leave settings:", err);
      }
    }
    fetchLeaveSettings();
  }, []);

  // Fetch employee data
  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/employees/${id}`);
        const result = await res.json();
        if (result) setEmployee(result);
      } catch (err) {
        console.error("Network Error:", err);
      }
    }
    fetchEmployeeData();
  }, [id]);

  // Fetch leave info
  useEffect(() => {
    async function fetchLeaveInfo() {
      if (id && activeTab === "leave") {
        setLeaveLoading(true);
        try {
          const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/employee/${id}`);
          const result = await res.json();
          if (result) setLeaveData(result);
        } catch (err) {
          console.error("Error fetching leave data:", err);
        } finally {
          setLeaveLoading(false);
        }
      }
    }
    fetchLeaveInfo();
  }, [id, activeTab]);

  // Fetch attendance leaves
  useEffect(() => {
    async function fetchAttendanceLeaves() {
      if (id && (activeTab === "leave" || activeTab === "salary")) {
        try {
          const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/employee/${id}`);
          if (response.data && response.data.history) {
            setAttendanceRecords(response.data.history);
            const leavesCount = {};
            response.data.history.forEach(record => {
              if (record.status === 'leave' || record.status === 'Leave' || record.is_leave_day === 1) {
                const leaveType = record.leave_type || 'Casual Leave';
                leavesCount[leaveType] = (leavesCount[leaveType] || 0) + 1;
              }
            });
            setActualLeaves(leavesCount);
          }
        } catch (err) {
          console.error("Error fetching attendance:", err);
        }
      }
    }
    fetchAttendanceLeaves();
  }, [id, activeTab]);

  // Fetch employees list
  useEffect(() => {
    async function fetchEmployeesList() {
      try {
        const res = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/forms/list');
        const data = await res.json();
        if (res.ok) setEmployeesList(data.employees || []);
      } catch (error) {
        console.error('Error fetching employee list:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployeesList();
  }, []);

  // Fetch documents
  useEffect(() => {
    if (activeTab === "documents") {
      async function fetchDocuments() {
        try {
          const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/employeeSpecific/${id}`);
          const result = await res.json();
          if (result?.employee) setDocuments(result.employee);
        } catch (err) {
          console.error("Network Error:", err);
        }
      }
      fetchDocuments();
    }
  }, [id, activeTab]);

  const handleSendEmail = async (subject, message) => {
    const result = await sendEmployeeEmail(employee, emailType, { subject, message });
    if (result.success) {
      alert('Email sent successfully!');
      setShowEmailModal(false);
    } else {
      alert('Failed to send email: ' + result.error);
    }
  };

  const openEmailModal = (type) => {
    setEmailType(type);
    setShowEmailModal(true);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
    <div className="bg-white rounded-xl p-4 transition-all hover:scale-105 cursor-pointer shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`bg-${color}-600 p-3 rounded-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  const InfoCard = ({ icon: Icon, label, value, link, isPassword = false, showPassword = false, onTogglePassword, onCopy, copied }) => (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
          <Icon size={18} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-xs mb-1">{label}</p>
          {isPassword ? (
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800 text-sm font-mono">{showPassword ? value : '••••••••'}</p>
              <button onClick={onTogglePassword} className="text-gray-400 hover:text-gray-600 transition">
                {showPassword ? <EyeOff size={14} /> : <EyeIcon size={14} />}
              </button>
              {value && value !== '********' && (
                <button onClick={() => onCopy(value)} className="text-gray-400 hover:text-green-600 transition">
                  {copied === label ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          ) : link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 text-sm hover:text-blue-600 transition break-all">
              {value || "-"}
            </a>
          ) : (
            <p className="font-medium text-gray-800 text-sm break-all">{value || "-"}</p>
          )}
        </div>
      </div>
    </div>
  );

  const DocumentCard = ({ label, url, icon: Icon }) => {
    if (!url) return null;
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon size={18} className="text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-800 text-sm flex-1">{label}</h4>
        </div>
        <div className="flex gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition">
            <Eye size={12} /> View
          </a>
          <a href={url} download className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700 transition">
            <Download size={12} /> Download
          </a>
        </div>
      </div>
    );
  };

  const tabs = [
    { value: "personal", label: "Personal Info", icon: User },
    { value: "official", label: "Official Account", icon: Server },
    { value: "office", label: "Office Details", icon: Building2 },
    { value: "salary", label: "Salary & Payroll", icon: DollarSign },
    { value: "leave", label: "Leave Quotas", icon: Calendar },
    { value: "address", label: "Address", icon: Home },
    { value: "identity", label: "Identity", icon: IdCard },
    { value: "passport", label: "Passport", icon: Globe },
    { value: "bank", label: "Bank Details", icon: CreditCard },
    { value: "emergency", label: "Emergency", icon: Users },
    { value: "education", label: "Education", icon: BookOpen },
    { value: "documents", label: "Documents", icon: FileText },
  ];

  const employeeFormData = employeesList.find(emp => emp.id === parseInt(id));

  const documentFiles = [
    { key: "photo_path", label: "Profile Photo", icon: User },
    { key: "aadhar_front_path", label: "Aadhar Front", icon: IdCard },
    { key: "aadhar_back_path", label: "Aadhar Back", icon: IdCard },
    { key: "passport_front_path", label: "Passport Front", icon: Globe },
    { key: "passport_back_path", label: "Passport Back", icon: Globe },
    { key: "edu_10th_path", label: "10th Certificate", icon: GraduationCap },
    { key: "edu_12th_path", label: "12th Certificate", icon: GraduationCap },
    { key: "graduation_path", label: "Graduation", icon: AwardIcon },
    { key: "diploma_path", label: "Diploma", icon: BookOpen },
    { key: "pan_document_path", label: "PAN Card Document", icon: CreditCard },
    { key: "cancel_cheque_path", label: "Cancel Cheque", icon: CreditCard },
    { key: "uan_document_path", label: "UAN Document", icon: Shield },
  ];

  if (!employee && loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src={employee?.photo || employeeFormData?.photo_path} 
                  alt="avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" 
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (employee?.name || 'Employee') + "&background=random"; }} 
                />
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{employee?.name || `${employeeFormData?.first_name} ${employeeFormData?.last_name}`}</h1>
                <p className="text-blue-100 mt-1">{employee?.designation || "Employee"}</p>
                <div className="flex gap-4 mt-2 flex-wrap">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">EMP ID: {employee?.id}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{employee?.level || "Mid-Level"}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{employee?.team_name || "No Team"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                <Printer size={18} />
              </button>
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                <Share2 size={18} />
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                  <Mail size={16} /> Send Email
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button onClick={() => openEmailModal('welcome')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg">Welcome Email</button>
                  <button onClick={() => openEmailModal('credentials')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Send Credentials</button>
                  <button onClick={() => openEmailModal('salary')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Salary Details</button>
                  <button onClick={() => openEmailModal('custom')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg">Custom Message</button>
                </div>
              </div>
              <button onClick={() => navigate(`/employees/edit/${employee?.id}`)} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium">
                <Pencil size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BriefcaseIcon} label="Designation" value={employee?.designation || "N/A"} color="blue" />
          <StatCard icon={AwardIcon} label="Level" value={employee?.level || "N/A"} color="green" />
          <StatCard icon={Wallet} label="Net Salary" value={formatCurrency(employee?.net_salary)} color="purple" />
          <StatCard icon={Calendar} label="Experience" value={employee?.joining_date ? `${Math.floor((new Date() - new Date(employee.joining_date)) / (1000 * 60 * 60 * 24 * 365))} Years` : "N/A"} color="orange" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="border-b bg-white">
            <div className="flex flex-wrap px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === tab.value ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                  {activeTab === tab.value && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white">
            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg"><User size={18} className="text-blue-600" /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard icon={User} label="Full Name" value={employee?.name} />
                    <InfoCard icon={Mail} label="Personal Email" value={employee?.email} link={`mailto:${employee?.email}`} />
                    <InfoCard icon={Phone} label="Contact Number" value={employee?.contact_number} link={`tel:${employee?.contact_number}`} />
                    <InfoCard icon={Calendar} label="Date of Birth" value={formatDate(employee?.date_of_birth)} />
                    <InfoCard icon={Calendar} label="Age" value={employee?.age} />
                    <InfoCard icon={Shield} label="Blood Group" value={employeeFormData?.blood_group} />
                    <InfoCard icon={IdCard} label="PAN Number" value={employee?.identity_id} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg"><Heart size={18} className="text-blue-600" /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Family Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={User} label="Father's Name" value={employee?.father_name} />
                    <InfoCard icon={User} label="Mother's Name" value={employee?.mother_name} />
                  </div>
                </div>
              </div>
            )}

            {/* Official Account Tab */}
            {activeTab === "official" && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"><Server size={18} className="text-white" /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Official Account Credentials</h3>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg"><ShieldCheck size={20} className="text-white" /></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Employee Portal Access</h4>
                        <p className="text-xs text-gray-500">Login credentials for employee management system</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard icon={Mail} label="Portal Email ID" value={employee?.email || employeeFormData?.email} link={`mailto:${employee?.email}`} />
                      <InfoCard icon={Lock} label="Portal Password" value={employee?.password_plain || "********"} isPassword={true} showPassword={showPanelPassword} onTogglePassword={() => setShowPanelPassword(!showPanelPassword)} onCopy={(text) => copyToClipboard(text, "Portal Password")} copied={copiedField === "Portal Password"} />
                    </div>
                    <button onClick={() => openEmailModal('credentials')} className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm w-full">
                      <Mail size={16} /> Send Credentials via Email
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-600 rounded-lg"><Mail size={20} className="text-white" /></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Official Email Account</h4>
                        <p className="text-xs text-gray-500">Company email credentials</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard icon={Mail} label="Official Email ID" value={employee?.official_email || "Not assigned"} link={employee?.official_email ? `mailto:${employee.official_email}` : null} />
                      <InfoCard icon={Key} label="Official Email Password" value={employee?.official_email_password === '********' ? '********' : (employee?.official_email_password || "Not set")} isPassword={true} showPassword={showOfficialPassword} onTogglePassword={() => setShowOfficialPassword(!showOfficialPassword)} onCopy={(text) => copyToClipboard(text, "Official Email Password")} copied={copiedField === "Official Email Password"} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Office Details Tab */}
            {activeTab === "office" && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg"><Building2 size={18} className="text-blue-600" /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Employment Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard icon={Briefcase} label="Designation" value={employee?.designation} />
                    <InfoCard icon={Award} label="Experience Level" value={employee?.level} />
                    <InfoCard icon={Building} label="Team Name" value={employee?.team_name || "N/A"} />
                    <InfoCard icon={Users} label="Reporting Manager" value={employee?.reporting_manager} />
                    <InfoCard icon={Calendar} label="Joining Date" value={formatDate(employee?.joining_date)} />
                    <InfoCard icon={Calendar} label="Confirm Date" value={formatDate(employee?.confirm_date)} />
                    <InfoCard icon={Target} label="Current Project" value={employee?.current_project || "N/A"} />
                    <InfoCard icon={Star} label="Appraisal Points" value={employee?.appraisal_points || "0"} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg"><XCircle size={18} className="text-red-600" /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Exit Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={Calendar} label="Resigned Date" value={formatDate(employee?.resigned_date)} />
                    <InfoCard icon={Calendar} label="Left Date" value={formatDate(employee?.left_date)} />
                    <InfoCard icon={FileText} label="Resign Reason" value={employee?.resign_reason || "N/A"} />
                    <InfoCard icon={Calendar} label="Retired Date" value={formatDate(employee?.retired_date)} />
                  </div>
                </div>
              </div>
            )}

            {/* Salary & Payroll Tab */}
            {activeTab === "salary" && (
              <div className="space-y-6">
                <SalarySlipGenerator 
                  employeeId={id} 
                  employeeData={employee}
                  leaveSettings={leaveSettings}
                />
              </div>
            )}

            {/* Leave Quotas Tab - (unchanged; same as original) */}
            {activeTab === "leave" && (
              <div className="space-y-6">
                {leaveLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : leaveData ? (
                  <>
                    {/* Automatic Leave Conversion Section */}
                    {leaveSettings?.overtimeConfig?.leaveConversion?.enabled && (
                      (() => {
                        const totalOvertimeHours = attendanceRecords?.reduce((sum, record) => {
                          const overtime = record?.overtime_hours || record?.overtime || 0;
                          return sum + (typeof overtime === 'number' ? overtime : parseFloat(overtime) || 0);
                        }, 0) || 0;
                        
                        const conversionRate = leaveSettings?.overtimeConfig?.leaveConversion?.rate || 1;
                        const workingHoursPerDay = leaveSettings?.workingHours || 8;
                        const convertibleLeaveHours = totalOvertimeHours * conversionRate;
                        const convertibleLeaveDays = (convertibleLeaveHours / workingHoursPerDay).toFixed(1);
                        const alreadyConvertedDays = leaveData?.converted_leaves || 0;
                        const pendingConversionDays = Math.max(0, parseFloat(convertibleLeaveDays) - alreadyConvertedDays);
                        
                        return (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <TrendingUp size={20} className="text-purple-600" />
                                <h4 className="font-semibold text-gray-800">Automatic Leave Conversion from Overtime</h4>
                              </div>
                              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                Rate: {conversionRate}:1 • Auto-Conversion: Enabled
                              </span>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Total Overtime Hours</p>
                                  <p className="text-2xl font-bold text-green-600">{totalOvertimeHours.toFixed(1)} hrs</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Will Auto-Convert to</p>
                                  <p className="text-2xl font-bold text-purple-600">{convertibleLeaveDays} days</p>
                                  <p className="text-xs text-gray-400">({convertibleLeaveHours.toFixed(1)} hours)</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Already Credited</p>
                                  <p className="text-2xl font-bold text-blue-600">{alreadyConvertedDays} days</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Pending Auto-Conversion</p>
                                  <p className="text-2xl font-bold text-orange-600">{pendingConversionDays} days</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Clock size={18} className="text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-800 text-sm">How Automatic Leave Conversion Works</h5>
                                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                                    <p>✓ <strong>Every month end</strong> - System automatically converts all accumulated overtime</p>
                                    <p>✓ <strong>Conversion Formula:</strong> Overtime Hours × {conversionRate} ÷ {workingHoursPerDay} = Leave Days</p>
                                    <p>✓ <strong>Added to:</strong> Compensatory Leave balance automatically</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Yearly Balance Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(leaveData.yearly_balance || {}).map(([type, data]) => {
                        const remaining = Number(data?.remaining) || 0;
                        const used = Number(data?.used) || 0;
                        const yearlyQuota = Number(data?.yearly_quota) || 0;
                        const percentage = yearlyQuota > 0 ? (used / yearlyQuota) * 100 : 0;
                        return (
                          <div key={type} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-700">{type}</p>
                              <Calendar size={18} className="text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{remaining.toFixed(1)}</p>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Used: {used.toFixed(1)}</span>
                                <span>Quota: {yearlyQuota}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Month-wise Detailed Breakdown Table (unchanged) */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                              <th className="border p-3 text-left text-white font-semibold text-sm">Month/Year</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Working Days</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Present</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Leave</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Absent</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Late</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Overtime (hrs)</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Leave Quota</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Rollover</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Unpaid Days</th>
                              <th className="border p-3 text-center text-white font-semibold text-sm">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const monthWiseData = {};
                              attendanceRecords.forEach(record => {
                                const recordDate = new Date(record.date);
                                if (isNaN(recordDate.getTime())) return;
                                const month = recordDate.getMonth() + 1;
                                const year = recordDate.getFullYear();
                                const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                                const monthName = getMonthName(month);
                                if (!monthWiseData[monthKey]) {
                                  monthWiseData[monthKey] = {
                                    year, month, monthName,
                                    present: 0, leave: 0, absent: 0, late: 0, halfDay: 0,
                                    overtime: 0, lateMinutes: 0, totalDays: 0, leaveRecords: []
                                  };
                                }
                                const status = record.status;
                                monthWiseData[monthKey].totalDays++;
                                if (record.late_minutes) {
                                  monthWiseData[monthKey].lateMinutes += parseFloat(record.late_minutes) || 0;
                                }
                                if (status === 'present' || status === 'Present') {
                                  monthWiseData[monthKey].present++;
                                } else if (status === 'late' || status === 'Late') {
                                  monthWiseData[monthKey].present++;
                                  monthWiseData[monthKey].late++;
                                } else if (status === 'half_day' || status === 'Half Day' || status === 'HD') {
                                  monthWiseData[monthKey].present += 0.5;
                                  monthWiseData[monthKey].halfDay++;
                                } else if (status === 'leave' || status === 'Leave' || status === 'L') {
                                  monthWiseData[monthKey].leave++;
                                  monthWiseData[monthKey].leaveRecords.push(record);
                                } else if (status === 'absent' || status === 'Absent' || status === 'A') {
                                  monthWiseData[monthKey].absent++;
                                }
                                if (record.overtime_hours) {
                                  monthWiseData[monthKey].overtime += typeof record.overtime_hours === 'number' ? record.overtime_hours : parseFloat(record.overtime_hours) || 0;
                                }
                              });
                              const sortedMonths = Object.keys(monthWiseData).sort().reverse();
                              const getMonthlyLeaveInfo = (type, year, month) => {
                                const monthlyBalance = leaveData?.monthly_balance?.[type];
                                if (!monthlyBalance) return { quota: 0, remaining: 0, rollover: 0 };
                                if (monthlyBalance.current && monthlyBalance.current.month === month) {
                                  return {
                                    quota: Number(monthlyBalance.current.monthly_quota) || 0,
                                    remaining: Number(monthlyBalance.current.remaining) || 0,
                                    rollover: Number(monthlyBalance.current.rollover) || 0
                                  };
                                }
                                const monthData = monthlyBalance[month];
                                if (monthData) {
                                  return {
                                    quota: Number(monthData.monthly_quota) || 0,
                                    remaining: Number(monthData.remaining) || 0,
                                    rollover: Number(monthData.rollover) || 0
                                  };
                                }
                                return { quota: 0, remaining: 0, rollover: 0 };
                              };
                              return sortedMonths.map(monthKey => {
                                const data = monthWiseData[monthKey];
                                const daysInMonth = new Date(data.year, data.month, 0).getDate();
                                const expectedWorkingDays = daysInMonth - 8;
                                const attendancePercent = expectedWorkingDays > 0 ? ((data.present / expectedWorkingDays) * 100).toFixed(1) : "0";
                                const leaveType = Object.keys(leaveData?.yearly_balance || {})[0] || 'Casual Leave';
                                const leaveInfo = getMonthlyLeaveInfo(leaveType, data.year, data.month);
                                const totalLeavesTaken = data.leave;
                                const availableQuota = leaveInfo.quota + leaveInfo.rollover;
                                const unpaidLeaves = Math.max(0, totalLeavesTaken - availableQuota);
                                let statusBadge = null;
                                if (unpaidLeaves > 0) {
                                  statusBadge = { text: 'Unpaid Deduction', bgColor: '#fee2e2', textColor: '#dc2626', icon: <XCircle size={12} /> };
                                } else if (data.late > 5) {
                                  statusBadge = { text: 'High Late', bgColor: '#ffedd5', textColor: '#ea580c', icon: <AlertCircle size={12} /> };
                                } else if (data.absent > 3) {
                                  statusBadge = { text: 'High Absent', bgColor: '#ffedd5', textColor: '#ea580c', icon: <AlertCircle size={12} /> };
                                } else if (data.overtime > 10) {
                                  statusBadge = { text: 'High Overtime', bgColor: '#f3e8ff', textColor: '#9333ea', icon: <TrendingUp size={12} /> };
                                } else if (data.late > 0) {
                                  statusBadge = { text: 'Has Late', bgColor: '#fef3c7', textColor: '#d97706', icon: <Clock size={12} /> };
                                } else if (data.leave > 0) {
                                  statusBadge = { text: 'Leave Taken', bgColor: '#fef9c3', textColor: '#ca8a04', icon: <Calendar size={12} /> };
                                } else {
                                  statusBadge = { text: 'Good', bgColor: '#dcfce7', textColor: '#16a34a', icon: <CheckCircle size={12} /> };
                                }
                                return (
                                  <tr key={monthKey} className="hover:bg-gray-50 border-b">
                                    <td className="border p-3 text-sm font-medium text-gray-800">
                                      <div>{data.monthName} {data.year}</div>
                                      <div className="text-xs text-gray-400">{daysInMonth} days in month</div>
                                    </td>
                                    <td className="border p-3 text-sm text-center">{expectedWorkingDays}</td>
                                    <td className="border p-3 text-sm text-center">
                                      <span className="font-medium text-green-600">{data.present.toFixed(1)}</span>
                                      <div className="text-xs text-gray-400">({attendancePercent}%)</div>
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <span className={data.leave > 0 ? "text-yellow-600 font-medium" : "text-gray-500"}>
                                        {data.leave}
                                      </span>
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <span className={data.absent > 0 ? "text-red-600 font-medium" : "text-gray-500"}>
                                        {data.absent}
                                      </span>
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <span className={data.late > 0 ? "text-orange-600 font-medium" : "text-gray-500"}>
                                        {data.late}
                                      </span>
                                      {data.late > 0 && data.lateMinutes > 0 && (
                                        <div className="text-xs text-gray-400">{data.lateMinutes} min</div>
                                      )}
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <span className={data.overtime > 0 ? "text-purple-600 font-medium" : "text-gray-500"}>
                                        {data.overtime.toFixed(1)} hrs
                                      </span>
                                      {leaveSettings?.overtimeConfig?.leaveConversion?.enabled && data.overtime > 0 && (
                                        <div className="text-xs text-green-500">
                                          → {((data.overtime * (leaveSettings?.overtimeConfig?.leaveConversion?.rate || 1)) / 8).toFixed(1)} days leave
                                        </div>
                                      )}
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <div>{leaveInfo.quota} / month</div>
                                      {leaveInfo.rollover > 0 && (
                                        <div className="text-xs text-blue-500">+{leaveInfo.rollover} rollover</div>
                                      )}
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <span className={leaveInfo.rollover > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                                        {leaveInfo.rollover.toFixed(1)}
                                      </span>
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      {unpaidLeaves > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                          <XCircle size={12} /> {unpaidLeaves}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">0</span>
                                      )}
                                    </td>
                                    <td className="border p-3 text-sm text-center">
                                      <span 
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                                        style={{ backgroundColor: statusBadge.bgColor, color: statusBadge.textColor }}
                                      >
                                        {statusBadge.icon} {statusBadge.text}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Overtime Summary */}
                    {(() => {
                      const totalOvertime = attendanceRecords?.reduce((sum, record) => {
                        const overtime = record?.overtime_hours || record?.overtime || 0;
                        return sum + (typeof overtime === 'number' ? overtime : parseFloat(overtime) || 0);
                      }, 0) || 0;
                      const monthlyOvertimeAvg = attendanceRecords?.length > 0 ? (totalOvertime / 12).toFixed(1) : 0;
                      const conversionRate = leaveSettings?.overtimeConfig?.leaveConversion?.rate || 1;
                      const convertibleDays = (totalOvertime * conversionRate / 8).toFixed(1);
                      return (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-purple-600" />
                            <h4 className="font-semibold text-gray-800">Overtime Summary</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Total Overtime Hours</p>
                              <p className="text-2xl font-bold text-purple-600">{totalOvertime.toFixed(1)} hrs</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Monthly Average</p>
                              <p className="text-2xl font-bold text-blue-600">{monthlyOvertimeAvg} hrs</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Overtime Rate</p>
                              <p className="text-2xl font-bold text-green-600">{leaveSettings?.overtimeConfig?.payment?.rate || 1.5}x</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Convertible to Leave</p>
                              <p className="text-2xl font-bold text-orange-600">{convertibleDays} days</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 text-center">
                            💡 {totalOvertime.toFixed(1)} overtime hours × {conversionRate} ÷ 8 = {convertibleDays} leave days
                          </div>
                        </div>
                      );
                    })()}

                    {/* Absent & Late Summary */}
                    {(() => {
                      const totalAbsent = attendanceRecords?.filter(r => r.status === 'absent' || r.status === 'Absent' || r.status === 'A').length || 0;
                      const totalLate = attendanceRecords?.filter(r => r.status === 'late' || r.status === 'Late').length || 0;
                      const totalHalfDay = attendanceRecords?.filter(r => r.status === 'half_day' || r.status === 'Half Day' || r.status === 'HD').length || 0;
                      return (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                          <div className="flex items-center gap-2 mb-4">
                            <AlertCircle size={20} className="text-red-600" />
                            <h4 className="font-semibold text-gray-800">Attendance Issues Summary</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Total Absent Days</p>
                              <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
                              <p className="text-xs text-gray-400">Days</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Total Late Arrivals</p>
                              <p className="text-2xl font-bold text-orange-600">{totalLate}</p>
                              <p className="text-xs text-gray-400">Times</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 mb-1">Total Half Days</p>
                              <p className="text-2xl font-bold text-yellow-600">{totalHalfDay}</p>
                              <p className="text-xs text-gray-400">Days</p>
                            </div>
                          </div>
                          {leaveSettings?.lateThresholdConfig?.deduction?.salaryDeduction?.enabled && (
                            <div className="mt-3 text-xs text-gray-500 bg-white rounded-lg p-2 text-center">
                              ⚠️ Late deduction rate: {leaveSettings?.lateThresholdConfig?.deduction?.perLateMinute || 0.5}% per minute
                              {leaveSettings?.lateThresholdConfig?.deduction?.maxDailyPercentage && 
                                ` (Max ${leaveSettings.lateThresholdConfig.deduction.maxDailyPercentage}% per day)`}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Rollover Calculation Explanation */}
                    <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={20} className="text-green-600" />
                        <h4 className="font-semibold text-gray-800">Rollover Calculation Logic</h4>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-medium mb-2">📋 How Rollover Works:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>If Leaves Taken &lt; Monthly Quota:</strong> Remaining quota + previous rollover gets carried forward</li>
                            <li><strong>If Leaves Taken = Monthly Quota:</strong> Only previous rollover (if any) gets carried forward</li>
                            <li><strong>If Leaves Taken &gt; Monthly Quota:</strong> No rollover (excess becomes unpaid leave)</li>
                            <li><strong>Overtime Conversion:</strong> Accumulated overtime converts to leave automatically at month end</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        <span>Joining Date: {formatDate(leaveData.joining_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        <span>Current Period: {getMonthName(Number(leaveData.current_month))} {leaveData.current_year}</span>
                      </div>
                      {leaveSettings?.overtimeConfig?.leaveConversion?.enabled && (
                        <div className="flex items-center gap-2">
                          <TrendingUp size={12} />
                          <span>Overtime Conversion: Enabled ({leaveSettings?.overtimeConfig?.leaveConversion?.rate || 1}:1)</span>
                        </div>
                      )}
                      {leaveSettings?.halfDayConversion?.enabled && (
                        <div className="flex items-center gap-2">
                          <Clock size={12} />
                          <span>Half-Day Overtime: {leaveSettings?.overtimeConfig?.halfDayConversion?.overtimeRequired || 4} hrs = 0.5 day</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                    <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
                    <p>No leave data available</p>
                  </div>
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><Home size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Home} label="House Number" value={employeeFormData?.house_number || employee?.house_number} />
                  <InfoCard icon={MapPin} label="Street Address" value={employeeFormData?.address || employee?.house_address} />
                  <InfoCard icon={MapPin} label="City" value={employeeFormData?.city} />
                  <InfoCard icon={MapPin} label="State" value={employeeFormData?.state} />
                  <InfoCard icon={MapPin} label="Pincode" value={employeeFormData?.pincode || "Not specified"} />
                  <InfoCard icon={Globe} label="Country" value="India" />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-blue-600" />
                    <h4 className="font-semibold text-gray-800">Complete Address</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{employee?.house_address || "No address provided"}</p>
                </div>
              </div>
            )}

            {/* Identity Tab */}
            {activeTab === "identity" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><IdCard size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">Identity Documents</h3>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg"><CreditCard size={20} className="text-yellow-700" /></div>
                    <div>
                      <h4 className="font-semibold text-gray-800">PAN Card</h4>
                      <p className="text-xs text-gray-500">Permanent Account Number</p>
                    </div>
                  </div>
                  <InfoCard icon={CreditCard} label="PAN Number" value={employee?.identity_id || employeeFormData?.pan_number} />
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg"><Key size={20} className="text-green-700" /></div>
                    <div>
                      <h4 className="font-semibold text-gray-800">UAN (Universal Account Number)</h4>
                      <p className="text-xs text-gray-500">EPFO Identification Number</p>
                    </div>
                  </div>
                  <InfoCard icon={Lock} label="UAN Number" value={employeeFormData?.uan_number || employee?.uan_number} />
                </div>
              </div>
            )}

            {/* Passport Tab */}
            {activeTab === "passport" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><Globe size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">Passport Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard icon={Globe} label="Passport Number" value={employeeFormData?.passport_number} />
                  <InfoCard icon={User} label="Surname" value={employeeFormData?.passport_surname} />
                  <InfoCard icon={User} label="Given Names" value={employeeFormData?.passport_given_names} />
                  <InfoCard icon={Calendar} label="Date of Birth (Passport)" value={formatDate(employeeFormData?.passport_dob)} />
                  <InfoCard icon={MapPin} label="Place of Birth" value={employeeFormData?.passport_place_of_birth} />
                  <InfoCard icon={Globe} label="Nationality" value={employeeFormData?.passport_nationality || "Indian"} />
                  <InfoCard icon={Calendar} label="Issue Date" value={formatDate(employeeFormData?.passport_issue_date)} />
                  <InfoCard icon={Calendar} label="Expiry Date" value={formatDate(employeeFormData?.passport_expire_date)} />
                  <InfoCard icon={MapPin} label="Place of Issue" value={employeeFormData?.passport_place_of_issue} />
                </div>
              </div>
            )}

            {/* Bank Tab */}
            {activeTab === "bank" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><CreditCard size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">Bank Account Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={User} label="Account Holder Name" value={employeeFormData?.bank_account_name || employee?.bank_account_name} />
                  <InfoCard icon={CreditCard} label="Bank Name" value={employeeFormData?.bank_name || employee?.bank_name} />
                  <InfoCard icon={CreditCard} label="Account Number" value={employeeFormData?.bank_account_number || employee?.bank_account_number} />
                  <InfoCard icon={CreditCard} label="IFSC Code" value={employeeFormData?.bank_ifsc || employee?.bank_ifsc} />
                  <InfoCard icon={MapPin} label="Branch" value={employeeFormData?.bank_branch || employee?.bank_branch} />
                </div>
              </div>
            )}

            {/* Emergency Tab */}
            {activeTab === "emergency" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><PhoneCall size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">Emergency Contacts</h3>
                </div>
                {employeeFormData?.emergencyContacts && employeeFormData.emergencyContacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeFormData.emergencyContacts.map((contact, index) => (
                      <div key={contact.id || index} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-red-100 rounded-full"><Users size={16} className="text-red-600" /></div>
                          <h4 className="font-semibold text-gray-800">Contact {index + 1}</h4>
                        </div>
                        <div className="space-y-2">
                          <InfoCard icon={User} label="Name" value={contact.name} />
                          <InfoCard icon={Users} label="Relation" value={contact.relation} />
                          <InfoCard icon={Phone} label="Phone Number" value={contact.phone} link={`tel:${contact.phone}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Users size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No emergency contacts found</p>
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><GraduationCap size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">Educational Qualifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={20} className="text-blue-600" />
                      <h4 className="font-semibold text-gray-800">10th Standard</h4>
                    </div>
                    {employeeFormData?.edu_10th_path ? (
                      <a href={employeeFormData.edu_10th_path} target="_blank" rel="noopener noreferrer" className="block text-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">View Certificate</a>
                    ) : <p className="text-gray-500 text-sm">Not uploaded</p>}
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={20} className="text-green-600" />
                      <h4 className="font-semibold text-gray-800">12th Standard</h4>
                    </div>
                    {employeeFormData?.edu_12th_path ? (
                      <a href={employeeFormData.edu_12th_path} target="_blank" rel="noopener noreferrer" className="block text-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">View Certificate</a>
                    ) : <p className="text-gray-500 text-sm">Not uploaded</p>}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <AwardIcon size={20} className="text-purple-600" />
                      <h4 className="font-semibold text-gray-800">Graduation</h4>
                    </div>
                    {employeeFormData?.graduation_path ? (
                      <a href={employeeFormData.graduation_path} target="_blank" rel="noopener noreferrer" className="block text-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition">View Certificate</a>
                    ) : <p className="text-gray-500 text-sm">Not uploaded</p>}
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={20} className="text-orange-600" />
                      <h4 className="font-semibold text-gray-800">Diploma</h4>
                    </div>
                    {employeeFormData?.diploma_path ? (
                      <a href={employeeFormData.diploma_path} target="_blank" rel="noopener noreferrer" className="block text-center px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition">View Certificate</a>
                    ) : <p className="text-gray-500 text-sm">Not uploaded</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && documents && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><FileText size={18} className="text-blue-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-800">All Documents</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {documentFiles.map((doc) => {
                    const fileUrl = documents[doc.key] || employeeFormData?.[doc.key];
                    if (!fileUrl) return null;
                    return <DocumentCard key={doc.key} label={doc.label} url={fileUrl} icon={doc.icon} />;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSend={handleSendEmail} employee={employee} emailType={emailType} />
    </div>
  );
};

export default EmployeeDetail;