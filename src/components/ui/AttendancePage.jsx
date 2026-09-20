import React, { useMemo, useState, useEffect } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  Search,
  CalendarDays,
  Loader,
} from "lucide-react";
import axios from "axios";
import SalarySlip from "./SalarySlip";

const AttendanceReport = () => {
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const years = [2024, 2025, 2026, 2027];

  // Get previous month
  const getPreviousMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (currentMonth === 0) {
      return { month: 11, year: currentYear - 1 };
    } else {
      return { month: currentMonth - 1, year: currentYear };
    }
  };

  const previousMonth = getPreviousMonth();
  
  const [selectedMonth, setSelectedMonth] = useState(previousMonth.month);
  const [selectedYear, setSelectedYear] = useState(previousMonth.year);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch attendance data from API
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      const endDateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      const response = await axios.get(`${API_BASE_URL}/api/attendance/all`, {
        params: {
          startDate: startDate,
          endDate: endDateStr
        }
      });
      
      if (response.data.success && response.data.data.employees) {
        setAttendanceData(response.data.data.employees);
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Transform API data to match component structure
  const employees = useMemo(() => {
    if (attendanceData.length === 0) {
      return [];
    }

    return attendanceData.map((emp, index) => {
      const attendance = {};
      
      // Process attendance records
      if (emp.attendance_records && Array.isArray(emp.attendance_records)) {
        emp.attendance_records.forEach(record => {
          const day = new Date(record.date).getDate();
          let status = '';
          let remarks = '';
          
          switch(record.status) {
            case 'present':
              status = 'P';
              remarks = 'Present';
              break;
            case 'late':
              status = 'P';
              remarks = 'Late Arrival';
              break;
            case 'absent':
              status = 'A';
              remarks = 'Absent';
              break;
            case 'leave':
              status = 'L';
              remarks = 'Leave';
              break;
            case 'half_day':
              status = 'HD';
              remarks = 'Half Day';
              break;
            default:
              status = 'MIS';
              remarks = 'Missing data';
          }
          
          attendance[day] = {
            date: record.date,
            status: status,
            inTime: record.in_time ? new Date(record.in_time).toLocaleTimeString() : '-',
            outTime: record.out_time ? new Date(record.out_time).toLocaleTimeString() : '-',
            workHours: record.total_hours || '-',
            late: record.late_minutes > 0,
            lateMinutes: record.late_minutes || 0,
            remarks: remarks,
          };
        });
      }
      
      // Fill missing days
      for (let day = 1; day <= daysInMonth; day++) {
        if (!attendance[day]) {
          const date = new Date(selectedYear, selectedMonth, day);
          const isSunday = date.getDay() === 0;
          
          attendance[day] = {
            date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            status: isSunday ? 'WO' : 'A',
            inTime: '-',
            outTime: '-',
            workHours: '00:00',
            late: false,
            lateMinutes: 0,
            remarks: isSunday ? 'Weekly Off' : 'Absent',
          };
        }
      }
      
      return {
        empCode: emp.employee_id || emp.employeeId,
        empName: emp.employee_name || emp.name,
        department: emp.team_name || emp.department || 'N/A',
        attendance,
      };
    });
  }, [attendanceData, daysInMonth, selectedMonth, selectedYear]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.empName?.toLowerCase().includes(search.toLowerCase()) ||
        String(emp.empCode).includes(search)
    );
  }, [employees, search]);

  const getMonthSummary = (attendance) => {
    const values = Object.values(attendance);
    return {
      present: values.filter((d) => d.status === "P").length,
      absent: values.filter((d) => d.status === "A").length,
      leave: values.filter((d) => d.status === "L").length,
      halfDay: values.filter((d) => d.status === "HD").length,
      weeklyOff: values.filter((d) => d.status === "WO").length,
      missing: values.filter((d) => d.status === "MIS").length,
      lateMarks: values.filter((d) => d.late).length,
    };
  };

  const getStatusClass = (status) => {
    if (status === "P") return "text-green-700 font-semibold";
    if (status === "A") return "text-red-700 font-semibold";
    if (status === "L") return "text-blue-700 font-semibold";
    if (status === "HD") return "text-orange-700 font-semibold";
    if (status === "WO") return "text-violet-700 font-semibold";
    if (status === "MIS") return "text-gray-700 font-semibold";
    return "";
  };

  const totals = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalHalfDay = 0;
    let totalMissing = 0;
    let totalLate = 0;

    filteredEmployees.forEach((emp) => {
      const s = getMonthSummary(emp.attendance);
      totalPresent += s.present;
      totalAbsent += s.absent;
      totalLeave += s.leave;
      totalHalfDay += s.halfDay;
      totalMissing += s.missing;
      totalLate += s.lateMarks;
    });

    return {
      totalPresent,
      totalAbsent,
      totalLeave,
      totalHalfDay,
      totalMissing,
      totalLate,
    };
  }, [filteredEmployees]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Prevent going to current or future months
    if (selectedYear === currentYear && selectedMonth >= currentMonth - 1) {
      return; // Can't go to current month or future
    }
    
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const SummaryCard = ({ title, value }) => (
    <div className="border border-gray-300 bg-white rounded-md px-3 py-2 shadow-sm">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );

  // Check if selected month is current or future
  const isCurrentOrFutureMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (selectedYear > currentYear) return true;
    if (selectedYear === currentYear && selectedMonth >= currentMonth) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#eef1f5] p-4 md:p-5">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
        {/* Top Toolbar */}
        <div className="border-b border-gray-200 px-4 py-3 bg-[#f8f9fb] rounded-t-lg">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="h-8 w-8 border border-gray-300 bg-white rounded flex items-center justify-center hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 h-8">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-[12px] outline-none bg-transparent"
                >
                  {months.map((m) => {
                    // Disable current and future months
                    const now = new Date();
                    const isDisabled = selectedYear === now.getFullYear() && m.value >= now.getMonth();
                    return (
                      <option key={m.value} value={m.value} disabled={isDisabled}>
                        {m.label} {isDisabled && "(Not Available)"}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-[12px] outline-none bg-transparent"
                >
                  {years.map((year) => {
                    // Disable current year if month is current or future
                    const now = new Date();
                    const isDisabled = year === now.getFullYear() && selectedMonth >= now.getMonth();
                    return (
                      <option key={year} value={year} disabled={isDisabled}>
                        {year} {isDisabled && "(Not Available)"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                className={`h-8 w-8 border border-gray-300 bg-white rounded flex items-center justify-center ${
                  isCurrentOrFutureMonth() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
                disabled={isCurrentOrFutureMonth()}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={fetchAttendanceData}
                className="h-8 px-3 border border-gray-300 bg-white rounded text-[12px] font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                Refresh
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full sm:w-[220px] border border-gray-300 rounded pl-8 pr-3 text-[12px] outline-none"
                />
              </div>

              <button
                onClick={() => window.print()}
                className="h-8 px-3 border border-gray-300 bg-white rounded text-[12px] font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner - Show only previous month */}
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <p className="text-[12px] text-blue-700 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Showing salary for completed month: <strong>{months[selectedMonth].label} {selectedYear}</strong>
            {isCurrentOrFutureMonth() && (
              <span className="text-red-600 ml-2">⚠️ Current/Future month - Salary not available yet</span>
            )}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Report Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">
                Hi Walk Travels PVT LTD
              </h2>
              <p className="text-[12px] text-gray-600 mt-1">Location: Noida</p>
            </div>

            <div className="lg:text-right">
              <h3 className="text-[16px] font-bold text-gray-900">
                Monthly Attendance Report (Summary)
              </h3>
              <p className="text-[12px] text-gray-600 mt-1">
                Period: 01/{String(selectedMonth + 1).padStart(2, "0")}/{selectedYear} to{" "}
                {String(daysInMonth).padStart(2, "0")}/
                {String(selectedMonth + 1).padStart(2, "0")}/{selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <SummaryCard title="Present" value={totals.totalPresent} />
            <SummaryCard title="Absent" value={totals.totalAbsent} />
            <SummaryCard title="Leave" value={totals.totalLeave} />
            <SummaryCard title="Half Day" value={totals.totalHalfDay} />
            <SummaryCard title="Missing" value={totals.totalMissing} />
            <SummaryCard title="Late Marks" value={totals.totalLate} />
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-auto rounded-md border border-gray-300 max-h-[68vh]">
              <table className="w-full min-w-[1800px] border-collapse text-[10px] text-gray-800">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f3f4f6]">
                    <th className="border border-gray-300 px-2 py-2 text-left whitespace-nowrap">
                      Emp Code
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left whitespace-nowrap min-w-[160px]">
                      Emp Name
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left whitespace-nowrap min-w-[110px]">
                      Dept
                    </th>

                    {days.map((d) => (
                      <th
                        key={d}
                        className="border border-gray-300 px-1 py-2 text-center min-w-[34px]"
                      >
                        {d}
                      </th>
                    ))}

                    <th className="border border-gray-300 px-2 py-2 text-center">P</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">A</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">L</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">HD</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">MIS</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">Late</th>
                    <th className="border border-gray-300 px-2 py-2 text-center">View</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((emp, index) => {
                    const summary = getMonthSummary(emp.attendance);

                    return (
                      <tr
                        key={emp.empCode}
                        className={index % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"}
                      >
                        <td className="border border-gray-300 px-2 py-[6px] text-center">
                          {emp.empCode}
                        </td>
                        <td 
                          className="border border-gray-300 px-2 py-[6px] cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setSelectedEmployeeForSalary(emp)}
                          title="Click to view salary slip"
                        >
                          {emp.empName}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px]">
                          {emp.department}
                        </td>

                        {days.map((d) => (
                          <td
                            key={d}
                            className={`border border-gray-300 px-1 py-[6px] text-center ${getStatusClass(
                              emp.attendance[d]?.status
                            )}`}
                            title={`${emp.attendance[d]?.status} | In: ${emp.attendance[d]?.inTime} | Out: ${emp.attendance[d]?.outTime}`}
                          >
                            {emp.attendance[d]?.status || '-'}
                          </td>
                        ))}

                        <td className="border border-gray-300 px-2 py-[6px] text-center font-semibold">
                          {summary.present}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px] text-center font-semibold">
                          {summary.absent}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px] text-center font-semibold">
                          {summary.leave}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px] text-center font-semibold">
                          {summary.halfDay}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px] text-center font-semibold">
                          {summary.missing}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px] text-center font-semibold">
                          {summary.lateMarks}
                        </td>
                        <td className="border border-gray-300 px-2 py-[6px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-gray-100"
                              title="View Attendance Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedEmployeeForSalary(emp)}
                              className="inline-flex items-center justify-center h-6 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[10px] font-medium border border-blue-200 transition-colors"
                              title="View Salary Slip"
                            >
                              Salary
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEmployees.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={days.length + 11}
                        className="border border-gray-300 px-2 py-6 text-center text-[12px] text-gray-500"
                      >
                        No employee found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600">
            <span><strong>P</strong> = Present</span>
            <span><strong>A</strong> = Absent</span>
            <span><strong>L</strong> = Leave</span>
            <span><strong>HD</strong> = Half Day</span>
            <span><strong>WO</strong> = Weekly Off</span>
            <span><strong>MIS</strong> = Missing Punch</span>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[92vh] overflow-auto bg-white rounded-lg shadow-xl border border-gray-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-start justify-between z-10">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">
                  Employee In/Out Time Summary
                </h3>
                <p className="text-[12px] text-gray-600 mt-1">
                  <strong>Emp Code:</strong> {selectedEmployee.empCode}{" "}
                  <span className="mx-1">|</span>
                  <strong>Name:</strong> {selectedEmployee.empName}{" "}
                  <span className="mx-1">|</span>
                  <strong>Department:</strong> {selectedEmployee.department}
                </p>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
                {(() => {
                  const s = getMonthSummary(selectedEmployee.attendance);
                  return (
                    <>
                      <SummaryCard title="Present" value={s.present} />
                      <SummaryCard title="Absent" value={s.absent} />
                      <SummaryCard title="Leave" value={s.leave} />
                      <SummaryCard title="Half Day" value={s.halfDay} />
                      <SummaryCard title="Missing" value={s.missing} />
                      <SummaryCard title="Late Marks" value={s.lateMarks} />
                    </>
                  );
                })()}
              </div>

              <div className="overflow-auto rounded-md border border-gray-300 max-h-[60vh]">
                <table className="w-full border-collapse text-[11px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#f3f4f6]">
                      <th className="border border-gray-300 px-2 py-2">Day</th>
                      <th className="border border-gray-300 px-2 py-2">Date</th>
                      <th className="border border-gray-300 px-2 py-2">Status</th>
                      <th className="border border-gray-300 px-2 py-2">In Time</th>
                      <th className="border border-gray-300 px-2 py-2">Out Time</th>
                      <th className="border border-gray-300 px-2 py-2">Work Hours</th>
                      <th className="border border-gray-300 px-2 py-2">Late</th>
                      <th className="border border-gray-300 px-2 py-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, idx) => {
                      const row = selectedEmployee.attendance[day];
                      return (
                        <tr key={day} className={idx % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"}>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {day}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {row?.date || '-'}
                          </td>
                          <td className={`border border-gray-300 px-2 py-2 text-center ${getStatusClass(row?.status)}`}>
                            {row?.status || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {row?.inTime || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {row?.outTime || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {row?.workHours || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {row?.late ? "Yes" : "No"}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            {row?.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {selectedEmployeeForSalary && (
        <SalarySlip
          employee={selectedEmployeeForSalary}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setSelectedEmployeeForSalary(null)}
        />
      )}
    </div>
  );
};

export default AttendanceReport;