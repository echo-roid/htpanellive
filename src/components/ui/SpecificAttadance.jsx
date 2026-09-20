import React, { useEffect, useState } from "react";
import axios from "axios";

const AttendanceSummary = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("month");
  const [employeeId, setEmployeeId] = useState("");

  const fetchSummary = async () => {
    try {
      const res = await axios.get("https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/summary_all", {
        params: {
          period,
          ...(employeeId && { employeeId }),
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [period, employeeId]);

  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-400 mb-6">Employee Attendance Summary</h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-gray-700 font-medium">Select Period:</label>
            <select
              className="border border-blue-400 text-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-gray-700 font-medium">Employee ID:</label>
            <input
              type="text"
              className="border border-blue-400 rounded px-3 py-2 w-full md:w-52 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. 101"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto text-sm text-left">
            <thead>
              <tr className="bg-blue-400 text-white uppercase text-xs tracking-wider">
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Present</th>
                <th className="py-3 px-4">Working Days</th>
                <th className="py-3 px-4">% Present</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((emp) => (
                  <tr key={emp.employee_id} className="border-b hover:bg-blue-50 transition">
                    <td className="py-3 px-4">
                      <img
                        src={`https://tableware-dweeb-estate.ngrok-free.dev/uploads/${emp.photo}` || "/default-avatar.png"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{emp.name}</td>
                    <td className="py-3 px-4 text-gray-600">{emp.team_name}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{emp.days_present}</td>
                    <td className="py-3 px-4 text-gray-700">{emp.total_working_days}</td>
                    <td className="py-3 px-4 font-bold text-green-600">
                      {emp.present_percentage}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No attendance data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;
