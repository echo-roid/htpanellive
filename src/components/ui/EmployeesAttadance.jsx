import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CheckInOutButton from './attendance/CheckInOutButton';
import { useSelector } from 'react-redux';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaMoneyBillWave,
  FaCalendarPlus,
  FaClock as FaClockIcon,
  FaUmbrellaBeach,
  FaPlane,
  FaSun,
  FaMoon,
  FaBriefcase,
  FaBusinessTime,
  FaExclamationTriangle
} from 'react-icons/fa';
import { FiActivity, FiUserCheck, FiUserX } from 'react-icons/fi';

// Simple Stats Card Component
const StatCard = ({ title, value, icon, color, change, trend, subInfo }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {change && (
          <div className="flex items-center mt-1">
            {trend === 'up' && <FaArrowUp className="text-green-500 text-xs mr-1" />}
            {trend === 'down' && <FaArrowDown className="text-red-500 text-xs mr-1" />}
            {trend === 'neutral' && <FaMinus className="text-gray-500 text-xs mr-1" />}
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>{change}</span>
          </div>
        )}
        {subInfo && (
          <div className="mt-1 text-xs text-gray-500">{subInfo}</div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ percentage, color = 'blue' }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className={`h-2 rounded-full bg-${color}-500 transition-all duration-500`}
      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
    />
  </div>
);

// Office Shift Display Component
const OfficeShiftDisplay = ({ leaveSettings }) => {
  if (!leaveSettings) return null;

  const officeStartTime = leaveSettings.lateThresholdRules?.officeStartTime || '09:00';
  const workingHours = leaveSettings.workingHours || 8;
  
  const calculateEndTime = (startTime, hours) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + hours * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  };

  const officeEndTime = calculateEndTime(officeStartTime, workingHours);

  const getShiftStatus = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (currentTime < officeStartTime) {
      return { text: 'Shift hasn\'t started yet', color: 'text-blue-600', icon: <FaSun className="text-yellow-500" /> };
    } else if (currentTime >= officeStartTime && currentTime < officeEndTime) {
      return { text: 'Shift in progress', color: 'text-green-600', icon: <FaClockIcon className="text-green-500" /> };
    } else {
      return { text: 'Shift ended', color: 'text-gray-600', icon: <FaMoon className="text-gray-500" /> };
    }
  };

  const shiftStatus = getShiftStatus();

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaClockIcon className="text-blue-600 text-xl" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Office Shift Hours</h4>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Start:</span>
                <span className="text-sm font-medium text-blue-600">{officeStartTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">End:</span>
                <span className="text-sm font-medium text-red-600">{officeEndTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Duration:</span>
                <span className="text-sm font-medium text-gray-700">{workingHours} hrs</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${shiftStatus.color} bg-opacity-10`}>
          {shiftStatus.icon}
          <span className="text-sm font-medium">{shiftStatus.text}</span>
        </div>
      </div>
    </div>
  );
};

// Today's Overview Component
const TodayOverview = ({ data, leaveBalanceData, leaveSettings, corporateEvents }) => {
  if (!data) return null;

  const totalEmployees = data.overall_summary?.total_employees || 0;
  const totalPresent = data.overall_summary?.total_present || 0;
  const totalOnLeave = data.overall_summary?.total_on_leave || 0;
  
  const presentPercentage = totalEmployees > 0 
    ? ((totalPresent / totalEmployees) * 100).toFixed(1) 
    : 0;

  const formattedDate = data.date 
    ? (typeof data.date === 'string' ? data.date : String(data.date))
    : new Date().toLocaleDateString();

  const today = new Date().toISOString().split('T')[0];
  const isOnLeave = leaveBalanceData?.leave_history?.some(leave => {
    const startDate = new Date(leave.start_date).toISOString().split('T')[0];
    const endDate = new Date(leave.end_date).toISOString().split('T')[0];
    return today >= startDate && today <= endDate && leave.status === 'approved';
  });

  const isCorporateEvent = corporateEvents?.some(event => {
    const startDate = new Date(event.start_date).toISOString().split('T')[0];
    const endDate = new Date(event.end_date).toISOString().split('T')[0];
    return today >= startDate && today <= endDate && event.event_type === 'corporate_event';
  });

  const officeStartTime = leaveSettings?.lateThresholdRules?.officeStartTime || '09:00';
  const workingHours = leaveSettings?.workingHours || 8;
  
  const calculateEndTime = (startTime, hours) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + hours * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  };

  const officeEndTime = calculateEndTime(officeStartTime, workingHours);

  return (
    <div className={`bg-gradient-to-r rounded-2xl p-6 text-white shadow-lg ${
      isCorporateEvent ? 'from-green-600 to-green-700' : 'from-blue-600 to-blue-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FaCalendarAlt className="mr-2" /> Today's Attendance
        </h2>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
          {formattedDate}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-blue-100 text-sm">Total Team</p>
          <p className="text-2xl font-bold">{totalEmployees}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Present</p>
          <p className="text-2xl font-bold text-green-300">{totalPresent}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">On Leave</p>
          <p className="text-2xl font-bold text-yellow-300">{totalOnLeave}</p>
          {isOnLeave && (
            <p className="text-xs text-yellow-200 mt-1">✨ You're on leave today!</p>
          )}
          {isCorporateEvent && (
            <p className="text-xs text-green-200 mt-1">🏢 Corporate Event today!</p>
          )}
        </div>
        <div>
          <p className="text-blue-100 text-sm">Attendance Rate</p>
          <p className="text-2xl font-bold">{presentPercentage}%</p>
        </div>
      </div>

      {isCorporateEvent && (
        <div className="mt-4 p-3 bg-green-500/30 rounded-lg border border-green-400/50">
          <div className="flex items-center gap-2">
            <FaBusinessTime className="text-xl" />
            <div>
              <p className="font-semibold">Corporate Event Today</p>
              <p className="text-sm text-green-100">
                You're on official work outside the office. Check-in/out not required.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-blue-500/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm">⏰ Office Hours:</span>
            <span className="text-sm bg-blue-500/30 px-3 py-1 rounded-full">
              {officeStartTime} - {officeEndTime}
            </span>
            <span className="text-xs text-blue-200">
              ({workingHours} hrs)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-200 text-xs">Late Threshold:</span>
            <span className="text-xs bg-yellow-500/30 px-2 py-0.5 rounded-full">
              {leaveSettings?.lateThresholdRules?.halfDayLateThresholdMinutes || 15} mins
            </span>
            {leaveSettings?.lateThresholdRules?.halfSalaryDeductionEnabled && (
              <span className="text-xs bg-orange-500/30 px-2 py-0.5 rounded-full">
                Half-day deduction
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Corporate Events Display Component
const CorporateEventsDisplay = ({ corporateEvents }) => {
  if (!corporateEvents || corporateEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-green-100">
      <h3 className="font-semibold text-gray-800 flex items-center mb-4">
        <FaBriefcase className="mr-2 text-green-600" /> Corporate Events
      </h3>
      <div className="space-y-3">
        {corporateEvents.map((event) => {
          const startDate = new Date(event.start_date);
          const endDate = new Date(event.end_date);
          
          return (
            <div key={event.event_id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      📅 {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                      {endDate > startDate && ` - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      {event.event_type?.replace('_', ' ').toUpperCase()}
                    </span>
                    {event.status && (
                      <span className={`px-2 py-0.5 rounded-full ${
                        event.status === 'approved' ? 'bg-green-100 text-green-700' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl">🏢</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Leave Balance Display Component
// const LeaveBalanceDisplay = ({ leaveBalanceData }) => {
//   if (!leaveBalanceData) return null;

//   const { yearly_balance } = leaveBalanceData;
  
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
//       <h3 className="font-semibold text-gray-800 flex items-center mb-4">
//         <FaUmbrellaBeach className="mr-2 text-purple-500" /> Leave Balance
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {Object.entries(yearly_balance || {}).map(([leaveType, balance]) => (
//           <div key={leaveType} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
//             <h4 className="font-medium text-gray-700 text-sm">{leaveType}</h4>
//             <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
//               <div>
//                 <span className="text-gray-500">Quota</span>
//                 <p className="font-semibold text-gray-800">{balance.yearly_quota}</p>
//               </div>
//               <div>
//                 <span className="text-gray-500">Used</span>
//                 <p className="font-semibold text-orange-600">{balance.used}</p>
//               </div>
//               <div>
//                 <span className="text-gray-500">Remaining</span>
//                 <p className={`font-semibold ${balance.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                   {balance.remaining}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// Attendance History Table Component
const AttendanceHistoryTable = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        No attendance records found
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-700',
      late: 'bg-yellow-100 text-yellow-700',
      absent: 'bg-red-100 text-red-700',
      leave: 'bg-blue-100 text-blue-700',
      left_early: 'bg-orange-100 text-orange-700',
      half_day: 'bg-purple-100 text-purple-700',
      overtime: 'bg-indigo-100 text-indigo-700',
      corporate_event: 'bg-emerald-100 text-emerald-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <FaCheckCircle className="text-green-500" />;
      case 'late': return <FaHourglassHalf className="text-yellow-500" />;
      case 'absent': return <FaTimesCircle className="text-red-500" />;
      case 'leave': return <FaCalendarAlt className="text-blue-500" />;
      case 'half_day': return <FaHourglassHalf className="text-purple-500" />;
      case 'overtime': return <FaClock className="text-indigo-500" />;
      case 'corporate_event': return <FaBriefcase className="text-emerald-500" />;
      case 'left_early': return <FaClock className="text-orange-500" />;
      default: return null;
    }
  };

  const getStatusDescription = (record) => {
    const status = record.calculated_status || record.status;
    const totalHours = parseFloat(record.total_hours) || 0;
    const workingHours = 8;
    const shortBy = workingHours - totalHours;
    
    switch(status) {
      case 'present':
        return totalHours >= workingHours 
          ? `✅ Completed full shift (${totalHours.toFixed(2)} hrs)` 
          : `✅ Present (${totalHours.toFixed(2)} hrs)`;
      case 'late':
        return `⚠️ Arrived ${record.late_minutes || 0} mins late (${totalHours.toFixed(2)} hrs)`;
      case 'absent':
        return '❌ No check-in recorded';
      case 'leave':
        return record.leave_type ? `📅 ${record.leave_type} leave` : '📅 On leave';
      case 'left_early':
        return `⏰ Left early - Short by ${shortBy.toFixed(2)} hrs (Worked ${totalHours.toFixed(2)}/${workingHours} hrs)`;
      case 'half_day':
        return `🌓 Half day - ${record.late_minutes || 0} mins late (${totalHours.toFixed(2)} hrs)`;
      case 'overtime':
        return `💪 Worked ${record.overtime_hours || 0} hrs overtime (${totalHours.toFixed(2)} hrs)`;
      case 'corporate_event':
        return '🏢 Official work outside office';
      default:
        return status || 'Unknown';
    }
  };

  const safeString = (value) => {
    if (!value) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value instanceof Date) return value.toLocaleTimeString();
    return '-';
  };

  const safeNumber = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  const getTimeDifference = (totalHours, workingHours) => {
    const diff = workingHours - totalHours;
    if (diff <= 0) return null;
    const hours = Math.floor(diff);
    const minutes = Math.round((diff - hours) * 60);
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return '0m';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <FaClock className="mr-2 text-blue-500" /> Recent Attendance History
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((record, idx) => {
              let dateObj = new Date();
              let dateStr = '';
              let dayName = '';
              
              try {
                if (record.date) {
                  dateObj = new Date(record.date);
                  dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                }
              } catch (e) {
                console.error('Error parsing date:', e);
                dateStr = String(record.date || '-');
                dayName = '-';
              }
              
              const status = record.calculated_status || record.status || 'unknown';
              const checkIn = safeString(record.check_in);
              const checkOut = safeString(record.check_out);
              const totalHours = safeNumber(record.total_hours);
              const overtimeHours = safeNumber(record.overtime_hours);
              const lateMinutes = record.late_minutes || 0;
              const workingHours = 8;
              const isCorporateEvent = status === 'corporate_event';
              const timeDiff = getTimeDifference(totalHours, workingHours);
              
              let statusExtra = '';
              if (status === 'half_day') statusExtra = `Half Day (${lateMinutes}min late)`;
              else if (status === 'late') statusExtra = `${lateMinutes}min late`;
              else if (status === 'overtime' && overtimeHours > 0) statusExtra = `+${overtimeHours}hrs OT`;
              else if (status === 'left_early' && timeDiff) statusExtra = `Short by ${timeDiff}`;
              
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dateStr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                      <span className="mr-1">{getStatusIcon(status)}</span>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      {record.leave_type && ` (${safeString(record.leave_type)})`}
                    </span>
                    {statusExtra && (
                      <span className="ml-1 text-xs text-gray-500">{statusExtra}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {isCorporateEvent ? 'N/A' : checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {isCorporateEvent ? 'N/A' : checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isCorporateEvent ? 'N/A' : `${workingHours} hrs`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      totalHours >= workingHours ? 'text-green-600' : 
                      totalHours > 0 ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {isCorporateEvent ? 'N/A' : totalHours > 0 ? `${totalHours} hrs` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${overtimeHours > 0 ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {isCorporateEvent ? 'N/A' : overtimeHours > 0 ? `${overtimeHours} hrs` : '-'}
                    </span>
                    {record.overtime_payment_allowed && overtimeHours > 0 && (
                      <span className="ml-1 text-xs text-green-600">💰</span>
                    )}
                    {record.compensatory_leave_allowed && overtimeHours > 0 && (
                      <span className="ml-1 text-xs text-blue-600">📅</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                    {getStatusDescription(record)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Monthly Summary with Overtime Rules Display
const MonthlySummaryTable = ({ summary, leaveSettings }) => {
  if (!summary) return null;

  const overtimeRules = leaveSettings?.overtimeRules || {};
  const lateThresholdRules = leaveSettings?.lateThresholdRules || {};

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <FaUsers className="mr-2 text-blue-500" /> Monthly Summary
        </h3>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Attendance Rate</p>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-bold text-blue-600">{summary.attendancePercentage}%</span>
                <span className="text-sm text-gray-500">{summary.presentDays} / {summary.totalWorkingDays} days</span>
              </div>
              <ProgressBar percentage={parseFloat(summary.attendancePercentage)} color="blue" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Present Days</p>
                <p className="text-2xl font-bold text-green-700">{summary.presentDays}</p>
                {summary.lateDays > 0 && (
                  <p className="text-xs text-yellow-600">({summary.lateDays} late)</p>
                )}
                {summary.leftEarlyDays > 0 && (
                  <p className="text-xs text-orange-600">({summary.leftEarlyDays} left early)</p>
                )}
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-600 mb-1">Leave Days</p>
                <p className="text-2xl font-bold text-yellow-700">{summary.leaveDays}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600 mb-1">Absent Days</p>
                <p className="text-2xl font-bold text-red-700">{summary.absentDays}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 mb-1">Overtime Hours</p>
                <p className="text-2xl font-bold text-orange-700">{summary.totalOvertimeHours}</p>
                {summary.halfDays > 0 && (
                  <p className="text-xs text-purple-600">({summary.halfDays} half days)</p>
                )}
              </div>
            </div>
          </div>
          
          {/* <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Detailed Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Working Days:</span>
                <span className="font-semibold">{summary.totalWorkingDays}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Hours Worked:</span>
                <span className="font-semibold">{summary.totalHours || '0'} hrs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Hours/Day:</span>
                <span className="font-semibold">{summary.averageHours || '0'} hrs</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Overtime Rules</h5>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Overtime Payment:</span>
                    <span className={`font-medium ${overtimeRules.allowOvertimePayment ? 'text-green-600' : 'text-gray-500'}`}>
                      {overtimeRules.allowOvertimePayment ? '✅ Allowed' : '❌ Not Allowed'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Minimum Overtime Hours:</span>
                    <span className="font-medium">{overtimeRules.minimumOvertimeHours || 1} hrs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Compensatory Leave:</span>
                    <span className={`font-medium ${overtimeRules.allowCompensatoryLeave ? 'text-green-600' : 'text-gray-500'}`}>
                      {overtimeRules.allowCompensatoryLeave ? '✅ Allowed' : '❌ Not Allowed'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Time Off Adjustment:</span>
                    <span className={`font-medium ${overtimeRules.allowTimeOffAdjustment ? 'text-green-600' : 'text-gray-500'}`}>
                      {overtimeRules.allowTimeOffAdjustment ? '✅ Allowed' : '❌ Not Allowed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Late Arrival Rules</h5>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Office Start Time:</span>
                    <span className="font-medium">{lateThresholdRules.officeStartTime || '09:00'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Half-Day Threshold:</span>
                    <span className="font-medium">{lateThresholdRules.halfDayLateThresholdMinutes || 15} mins</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Half Salary Deduction:</span>
                    <span className={`font-medium ${lateThresholdRules.halfSalaryDeductionEnabled ? 'text-orange-600' : 'text-gray-500'}`}>
                      {lateThresholdRules.halfSalaryDeductionEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Overtime Adjustment for Late:</span>
                    <span className={`font-medium ${lateThresholdRules.allowOvertimeAdjustmentForLateArrival ? 'text-green-600' : 'text-gray-500'}`}>
                      {lateThresholdRules.allowOvertimeAdjustmentForLateArrival ? '✅ Allowed' : '❌ Not Allowed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Performance Score:</span>
                <span className={`font-semibold ${
                  parseFloat(summary.attendancePercentage) >= 90 ? 'text-green-600' :
                  parseFloat(summary.attendancePercentage) >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {parseFloat(summary.attendancePercentage) >= 90 ? 'Excellent' :
                   parseFloat(summary.attendancePercentage) >= 75 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// Leave History Table Component
const LeaveHistoryTable = ({ leaveHistory }) => {
  if (!leaveHistory || leaveHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        No leave history found
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <FaPlane className="mr-2 text-purple-500" /> Leave History
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaveHistory.map((leave) => {
              const startDate = new Date(leave.start_date);
              const endDate = new Date(leave.end_date);
              
              return (
                <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.leave_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.days}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {leave.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
export default function EmployeesAttendance() {
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [error, setError] = useState(null);
  const [leaveSettings, setLeaveSettings] = useState(null);
  const [leaveBalanceData, setLeaveBalanceData] = useState(null);
  const [isOnLeaveToday, setIsOnLeaveToday] = useState(false);
  const [corporateEvents, setCorporateEvents] = useState([]);
  const [isCorporateEventToday, setIsCorporateEventToday] = useState(false);
  
  const user = useSelector((state) => state.auth.user);
  const employeeId = user?.employee?.id;
  const userEmail = user?.email;

  // Fetch leave settings
  useEffect(() => {
    async function fetchLeaveSettings() {
      try {
        const res = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/leave-settings/leave-settings');
        setLeaveSettings(res.data);
        console.log("✅ Leave settings loaded:", res.data);
      } catch (err) {
        console.error("❌ Error fetching leave settings:", err);
      }
    }
    fetchLeaveSettings();
  }, []);

  // Fetch calendar events (corporate events)
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      if (!userEmail || !employeeId) return;
      
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      try {
        const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/calendar?month=${month}&year=${year}&userEmail=${userEmail}&userId=${employeeId}`);
        if (!response.ok) throw new Error("Failed to fetch calendar events");
        const data = await response.json();
        const rawEvents = Array.isArray(data.data) ? data.data : [];
        
        const corporateEventsData = rawEvents.filter(event => event.event_type === 'corporate_event');
        setCorporateEvents(corporateEventsData);
        console.log("✅ Corporate events loaded:", corporateEventsData);
        
        const today = new Date().toISOString().split('T')[0];
        const hasCorporateEventToday = corporateEventsData.some(event => {
          const startDate = new Date(event.start_date).toISOString().split('T')[0];
          const endDate = new Date(event.end_date).toISOString().split('T')[0];
          return today >= startDate && today <= endDate;
        });
        setIsCorporateEventToday(hasCorporateEventToday);
        
        if (hasCorporateEventToday) {
          await saveCorporateEventToAttendance(corporateEventsData);
        }
      } catch (err) {
        console.error("Fetch calendar error:", err);
        setError(err.message);
      }
    };
    
    fetchCalendarEvents();
  }, [userEmail, employeeId]);

  // Save corporate event to attendance
  const saveCorporateEventToAttendance = async (events) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayEvent = events.find(event => {
        const startDate = new Date(event.start_date).toISOString().split('T')[0];
        const endDate = new Date(event.end_date).toISOString().split('T')[0];
        return today >= startDate && today <= endDate;
      });

      if (todayEvent) {
        const existingAttendance = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance?date=${today}`);
        const existingRecord = existingAttendance.data.find(r => r.employee_id === employeeId);
        
        if (!existingRecord) {
          await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/attendance', {
            employee_id: employeeId,
            date: today,
            status: 'corporate_event',
            event_id: todayEvent.event_id,
            event_title: todayEvent.title,
            is_corporate_event: 1
          });
          console.log("✅ Corporate event attendance saved for today");
        } else if (!existingRecord.is_corporate_event) {
          await axios.patch(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/${existingRecord.id}`, {
            status: 'corporate_event',
            event_id: todayEvent.event_id,
            event_title: todayEvent.title,
            is_corporate_event: 1
          });
          console.log("✅ Existing attendance updated to corporate event");
        }
      }
    } catch (err) {
      console.error("Error saving corporate event to attendance:", err);
    }
  };

  // Fetch leave balance data
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!employeeId) return;
      try {
        const leaveRes = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/employee/${employeeId}`);
        setLeaveBalanceData(leaveRes.data);
        console.log("✅ Leave data loaded:", leaveRes.data);
        
        const today = new Date().toISOString().split('T')[0];
        const onLeave = leaveRes.data?.leave_history?.some(leave => {
          const startDate = new Date(leave.start_date).toISOString().split('T')[0];
          const endDate = new Date(leave.end_date).toISOString().split('T')[0];
          return today >= startDate && today <= endDate && leave.status === 'approved';
        });
        setIsOnLeaveToday(onLeave || false);
        
        if (onLeave) {
          await saveLeaveToAttendance(leaveRes.data);
        }
      } catch (err) {
        console.error("Error fetching leave data:", err);
        setError("Failed to fetch leave data");
      }
    };
    fetchLeaveData();
  }, [employeeId]);

  // Save leave to attendance
  const saveLeaveToAttendance = async (leaveData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayLeave = leaveData?.leave_history?.find(leave => {
        const startDate = new Date(leave.start_date).toISOString().split('T')[0];
        const endDate = new Date(leave.end_date).toISOString().split('T')[0];
        return today >= startDate && today <= endDate && leave.status === 'approved';
      });

      if (todayLeave) {
        const existingAttendance = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance?date=${today}`);
        const existingRecord = existingAttendance.data.find(r => r.employee_id === employeeId);
        
        if (!existingRecord) {
          await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/attendance', {
            employee_id: employeeId,
            date: today,
            status: 'leave',
            leave_type: todayLeave.leave_type,
            is_leave_day: 1,
            leave_id: todayLeave.id
          });
          console.log("✅ Leave attendance saved for today");
        } else if (!existingRecord.is_leave_day) {
          await axios.patch(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/${existingRecord.id}`, {
            status: 'leave',
            leave_type: todayLeave.leave_type,
            is_leave_day: 1,
            leave_id: todayLeave.id
          });
          console.log("✅ Existing attendance updated to leave");
        }
      }
    } catch (err) {
      console.error("Error saving leave to attendance:", err);
    }
  };

  // Main fetchData function with CORRECTED overtime logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (employeeId) {
        const employeeRes = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/employee/${employeeId}`);
        
        if (employeeRes?.data) {
          const history = employeeRes.data.history || [];
          
          // Process each record with corrected overtime logic
          const processedHistory = history.map(record => {
            const officeStartTime = leaveSettings?.lateThresholdRules?.officeStartTime || '09:00';
            const workingHours = leaveSettings?.workingHours || 8;
            const lateThreshold = leaveSettings?.lateThresholdRules?.halfDayLateThresholdMinutes || 15;
            const halfSalaryDeduction = leaveSettings?.lateThresholdRules?.halfSalaryDeductionEnabled || false;
            const allowOvertimeAdjustment = leaveSettings?.lateThresholdRules?.allowOvertimeAdjustmentForLateArrival || false;
            const minimumOvertimeHours = leaveSettings?.overtimeRules?.minimumOvertimeHours || 1;
            
            let calculatedStatus = record.status || 'absent';
            let isLate = false;
            let lateMinutes = 0;
            let isHalfDay = false;
            let totalHours = 0;
            let overtimeHours = 0;
            
            // Check if it's a leave day
            if (record.is_leave_day === 1) {
              calculatedStatus = 'leave';
              return {
                ...record,
                calculated_status: calculatedStatus,
                total_hours: 0,
                overtime_hours: 0,
                late_minutes: 0,
                is_late: false,
                is_half_day: false
              };
            }
            
            // Check if it's a corporate event
            if (record.is_corporate_event === 1 || record.status === 'corporate_event') {
              calculatedStatus = 'corporate_event';
              return {
                ...record,
                calculated_status: calculatedStatus,
                total_hours: 0,
                overtime_hours: 0,
                late_minutes: 0,
                is_late: false,
                is_half_day: false
              };
            }
            
            // If no check-in, mark as absent
            if (!record.check_in) {
              calculatedStatus = 'absent';
              return {
                ...record,
                calculated_status: calculatedStatus,
                total_hours: 0,
                overtime_hours: 0,
                late_minutes: 0,
                is_late: false,
                is_half_day: false
              };
            }
            
            // Calculate late arrival
            const officeStart = new Date(`1970-01-01T${officeStartTime}`);
            const checkInTime = new Date(`1970-01-01T${record.check_in}`);
            const diffMinutes = (checkInTime - officeStart) / (1000 * 60);
            
            if (diffMinutes > 0) {
              isLate = true;
              lateMinutes = Math.round(diffMinutes);
            }
            
            // Calculate total hours if check-out exists
            if (record.check_in && record.check_out) {
              const checkIn = new Date(`1970-01-01T${record.check_in}`);
              const checkOut = new Date(`1970-01-01T${record.check_out}`);
              totalHours = (checkOut - checkIn) / (1000 * 60 * 60);
              totalHours = Math.round(totalHours * 100) / 100;
            } else {
              // Checked in but not checked out
              if (isLate && lateMinutes >= lateThreshold && halfSalaryDeduction) {
                calculatedStatus = 'half_day';
              } else if (isLate) {
                calculatedStatus = 'late';
              } else {
                calculatedStatus = 'present';
              }
              
              return {
                ...record,
                calculated_status: calculatedStatus,
                total_hours: 0,
                overtime_hours: 0,
                late_minutes: lateMinutes,
                is_late: isLate,
                is_half_day: false
              };
            }
            
            // ===== CRITICAL FIX: Overtime Calculation =====
            // Overtime is ONLY calculated when employee has completed required hours
            if (totalHours >= workingHours) {
                // Employee completed required hours, now check for overtime
                const rawOvertime = totalHours - workingHours;
                if (rawOvertime >= minimumOvertimeHours) {
                    overtimeHours = Math.floor(rawOvertime * 100) / 100; // Floor to nearest hour
                } else {
                    overtimeHours = 0;
                }
            } else {
                // Employee did NOT complete required hours - NO OVERTIME
                overtimeHours = 0;
            }
            
            // Determine final status
            // 1. Half Day (late >= threshold with salary deduction)
            if (isLate && lateMinutes >= lateThreshold && halfSalaryDeduction) {
                if (allowOvertimeAdjustment && totalHours >= workingHours) {
                    calculatedStatus = 'present';
                } else {
                    calculatedStatus = 'half_day';
                    isHalfDay = true;
                }
            }
            // 2. Late
            else if (isLate && !calculatedStatus) {
                if (allowOvertimeAdjustment && totalHours >= workingHours) {
                    calculatedStatus = 'present';
                } else {
                    calculatedStatus = 'late';
                }
            }
            // 3. Overtime - ONLY if completed required hours AND worked extra
            else if (overtimeHours > 0 && totalHours >= workingHours && !calculatedStatus) {
                calculatedStatus = 'overtime';
            }
            // 4. Left Early - Worked less than required hours
            else if (totalHours > 0 && totalHours < workingHours && !calculatedStatus) {
                calculatedStatus = 'left_early';
            }
            // 5. Present (default)
            else if (!calculatedStatus) {
                calculatedStatus = 'present';
            }
            
            return {
              ...record,
              calculated_status: calculatedStatus,
              total_hours: totalHours,
              overtime_hours: overtimeHours,
              late_minutes: lateMinutes,
              is_late: isLate,
              is_half_day: isHalfDay,
              status_info: {
                required_hours: workingHours,
                completed_required: totalHours >= workingHours,
                short_by: totalHours < workingHours ? (workingHours - totalHours).toFixed(2) : 0,
                overtime_earned: overtimeHours > 0 ? overtimeHours : 0
              }
            };
          });
          
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          const monthlyRecords = processedHistory.filter(record => {
            try {
              const date = new Date(record.date);
              return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            } catch (e) {
              return false;
            }
          });
          
          let presentDays = 0;
          let leaveDays = 0;
          let absentDays = 0;
          let totalOvertime = 0;
          let totalHours = 0;
          let halfDays = 0;
          let lateDays = 0;
          let corporateEventDays = 0;
          let leftEarlyDays = 0;
          
          monthlyRecords.forEach(record => {
            const overtime = parseFloat(record.overtime_hours) || 0;
            const hours = parseFloat(record.total_hours) || 0;
            const status = record.calculated_status || record.status || 'unknown';
            
            if (status === 'present' || status === 'late' || 
                status === 'left_early' || status === 'half_day' || status === 'overtime') {
              presentDays++;
              totalOvertime += overtime;
              totalHours += hours;
              
              if (status === 'half_day') halfDays++;
              if (status === 'late') lateDays++;
              if (status === 'left_early') leftEarlyDays++;
            } else if (status === 'leave' && record.is_leave_day === 1) {
              leaveDays++;
            } else if (status === 'absent') {
              absentDays++;
            } else if (status === 'corporate_event') {
              corporateEventDays++;
              presentDays++;
            }
          });
          
          const totalDays = monthlyRecords.length;
          const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0";
          
          setEmployeeData({
            name: employeeRes.data.employee?.name || user?.employee?.name || 'Employee',
            designation: employeeRes.data.employee?.designation || '',
            monthly: {
              presentDays,
              leaveDays,
              absentDays,
              totalWorkingDays: totalDays,
              attendancePercentage: attendanceRate,
              totalOvertimeHours: totalOvertime.toFixed(1),
              totalHours: totalHours.toFixed(1),
              averageHours: totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0',
              halfDays,
              lateDays,
              corporateEventDays,
              leftEarlyDays
            }
          });
          
          setAttendanceHistory(processedHistory.slice(0, 30));
        }
      }
      
      try {
        const todayRes = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/today-present-by-team');
        if (todayRes?.data) {
          setTodayData(todayRes.data);
        }
      } catch (err) {
        console.error('Error fetching today data:', err);
      }
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [employeeId, user, leaveSettings]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (leaveBalanceData) {
      fetchData();
    }
  }, [leaveBalanceData, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your attendance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const shouldShowCheckIn = !isOnLeaveToday && !isCorporateEventToday;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              👋 Welcome back, <span className="text-blue-600">{employeeData?.name || user?.employee?.name || 'Employee'}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {isOnLeaveToday && (
              <p className="text-sm text-blue-600 mt-1 font-medium flex items-center">
                <FaUmbrellaBeach className="mr-1" /> You're on leave today! 🌴
              </p>
            )}
            {isCorporateEventToday && (
              <p className="text-sm text-emerald-600 mt-1 font-medium flex items-center">
                <FaBriefcase className="mr-1" /> Corporate Event today! 🏢
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white rounded-lg p-1 flex shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'summary' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Summary View
              </button>
            </div>
            {shouldShowCheckIn ? (
              <CheckInOutButton onUpdate={fetchData} />
            ) : (
              <span className="px-6 py-2 rounded-lg font-medium bg-emerald-100 text-emerald-700 flex items-center gap-2">
                {isCorporateEventToday ? (
                  <>
                    <FaBriefcase /> Corporate Event - No Check-in Required
                  </>
                ) : (
                  <>
                    <FaUmbrellaBeach /> On Leave Today
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Office Shift Display */}
        <OfficeShiftDisplay leaveSettings={leaveSettings} />

        {/* Today's Overview Section */}
        {todayData && (
          <TodayOverview 
            data={todayData} 
            leaveBalanceData={leaveBalanceData} 
            leaveSettings={leaveSettings}
            corporateEvents={corporateEvents}
          />
        )}

        {/* Corporate Events Section */}
        {corporateEvents.length > 0 && (
          <CorporateEventsDisplay corporateEvents={corporateEvents} />
        )}

        {/* Leave Balance Section */}
        {/* {leaveBalanceData && <LeaveBalanceDisplay leaveBalanceData={leaveBalanceData} />} */}

        {/* Stats Cards */}
        {employeeData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Attendance Rate"
              value={`${employeeData.monthly.attendancePercentage}%`}
              icon={<FaUsers className="text-blue-500 text-xl" />}
              color="text-blue-600"
              change="+5% vs last month"
              trend="up"
            />
            <StatCard 
              title="Present Days"
              value={employeeData.monthly.presentDays}
              icon={<FiUserCheck className="text-green-500 text-xl" />}
              color="text-green-600"
              change={`${employeeData.monthly.presentDays}/${employeeData.monthly.totalWorkingDays}`}
              trend="neutral"
              subInfo={`${employeeData.monthly.lateDays || 0} late, ${employeeData.monthly.halfDays || 0} half days, ${employeeData.monthly.leftEarlyDays || 0} left early`}
            />
            <StatCard 
              title="Overtime Hours"
              value={`${employeeData.monthly.totalOvertimeHours} hrs`}
              icon={<FaClockIcon className="text-orange-500 text-xl" />}
              color="text-orange-600"
              change={leaveSettings?.overtimeRules?.allowOvertimePayment ? '💰 Payment eligible' : '📅 Compensatory leave'}
              trend="up"
              subInfo={leaveSettings?.overtimeRules?.allowCompensatoryLeave ? 'Compensatory leave earned' : 'No compensatory leave'}
            />
            <StatCard 
              title="Leave Taken"
              value={employeeData.monthly.leaveDays}
              icon={<FaCalendarAlt className="text-purple-500 text-xl" />}
              color="text-purple-600"
              change="Within limit"
              trend="neutral"
            />
          </div>
        )}

        {/* Main Content - Table or Summary View */}
        {viewMode === 'table' ? (
          <>
            <AttendanceHistoryTable history={attendanceHistory} />
            {leaveBalanceData?.leave_history && (
              <LeaveHistoryTable leaveHistory={leaveBalanceData.leave_history} />
            )}
          </>
        ) : (
          employeeData && <MonthlySummaryTable summary={employeeData.monthly} leaveSettings={leaveSettings} />
        )}

        {/* Rules Summary Section */}
        {/* {leaveSettings && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FaClockIcon className="mr-2 text-blue-600" /> Attendance Rules Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">⏰</span>
                <div>
                  <span className="font-medium">Office Start Time:</span>
                  <span className="ml-1 text-gray-600">{leaveSettings.lateThresholdRules?.officeStartTime || '09:00'}</span>
                  <br />
                  <span className="font-medium">Office End Time:</span>
                  <span className="ml-1 text-gray-600">
                    {(() => {
                      const start = leaveSettings.lateThresholdRules?.officeStartTime || '09:00';
                      const hours = leaveSettings.workingHours || 8;
                      const [startHour, startMinute] = start.split(':').map(Number);
                      const totalMinutes = startHour * 60 + startMinute + hours * 60;
                      const endHour = Math.floor(totalMinutes / 60) % 24;
                      const endMinute = totalMinutes % 60;
                      return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                    })()}
                  </span>
                  <br />
                  <span className="font-medium">Late Threshold:</span>
                  <span className="ml-1 text-gray-600">{leaveSettings.lateThresholdRules?.halfDayLateThresholdMinutes || 15} mins</span>
                  {leaveSettings.lateThresholdRules?.halfSalaryDeductionEnabled && (
                    <span className="ml-1 text-orange-600">(Half-day deduction)</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600">💼</span>
                <div>
                  <span className="font-medium">Overtime Rules:</span>
                  <br />
                  <span className="text-gray-600">
                    {leaveSettings.overtimeRules?.allowOvertimePayment ? '💰 Payment allowed' : '❌ No payment'}
                    {leaveSettings.overtimeRules?.allowCompensatoryLeave && ' | 📅 Compensatory leave'}
                    {leaveSettings.overtimeRules?.allowTimeOffAdjustment && ' | ⏰ Time-off adjustment'}
                  </span>
                  <br />
                  <span className="font-medium">Minimum Overtime:</span>
                  <span className="ml-1 text-gray-600">{leaveSettings.overtimeRules?.minimumOvertimeHours || 1} hrs</span>
                  <br />
                  <span className="font-medium">Working Hours:</span>
                  <span className="ml-1 text-gray-600">{leaveSettings.workingHours || 8} hrs/day</span>
                  <br />
                  <span className="font-medium text-green-600">✓ Overtime Only After Completing Required Hours</span>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Tips Section */}
        {/* {employeeData && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Attendance Insights</h4>
                <p className="text-sm text-gray-600">
                  {isCorporateEventToday 
                    ? "🏢 You have a corporate event today! No check-in required. Enjoy your official work outside the office! 🚀"
                    : isOnLeaveToday 
                    ? "🌴 You're on leave today! Enjoy your time off and relax! 🎉"
                    : employeeData?.monthly?.attendancePercentage >= 90 
                    ? "Excellent! You're maintaining great attendance. Keep up the consistency! 🎯"
                    : employeeData?.monthly?.attendancePercentage >= 75
                    ? "Good progress! Try to maintain regular attendance for better productivity. 📈"
                    : "Let's improve attendance. Every day counts towards your growth! 💪"}
                </p>
                {leaveSettings && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⏰ Office Hours: {leaveSettings.lateThresholdRules?.officeStartTime || '09:00'} - {
                      (() => {
                        const start = leaveSettings.lateThresholdRules?.officeStartTime || '09:00';
                        const hours = leaveSettings.workingHours || 8;
                        const [startHour, startMinute] = start.split(':').map(Number);
                        const totalMinutes = startHour * 60 + startMinute + hours * 60;
                        const endHour = Math.floor(totalMinutes / 60) % 24;
                        const endMinute = totalMinutes % 60;
                        return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                      })()
                    } 
                    | {leaveSettings.overtimeRules?.allowOvertimePayment 
                      ? '💰 Overtime payments enabled' 
                      : leaveSettings.overtimeRules?.allowCompensatoryLeave 
                      ? '📅 Compensatory leave enabled' 
                      : '⏰ No overtime benefits'}
                    {' | '}
                    <span className="text-green-600">✓ Overtime only after completing {leaveSettings.workingHours || 8} hrs</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )} */}

      </div>
    </div>
  );
}