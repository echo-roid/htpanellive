import React, { useEffect, useState } from 'react';

const MonthlyAttendanceTable = ({ month, year }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/attendance/monthly-attendance?month=${month}&year=${year}`);
        const data = await res.json();
        setAttendanceData(data.data || []);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [month, year]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="mt-5 bg-white rounded-xl shadow p-4 w-full h-[310px] overflow-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
      <h2 className="text-xl font-semibold mb-4">Monthly Attendance ({month}/{year})</h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-[#60a5fa] text-white">
            <tr>
              <th className="px-4 py-2 border">Employee</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Hours</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map(emp =>
              emp.attendance.map((record, idx) => (
                <tr key={`${emp.employee_id}-${idx}`} className="text-sm">
                  <td className="px-4 py-2 border flex items-center gap-3"><img src={emp.photo} className='w-10 h-10 rounded-full' alt="" /> <div>{emp.name} <p className='text-[11px]'>{emp.team_name}</p></div></td>
                  <td className="px-4 py-2 border">{record.date}</td>
                  <td className="px-4 py-2 border">{record.status}</td>
                  <td className="px-4 py-2 border">{record.total_hours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyAttendanceTable;
