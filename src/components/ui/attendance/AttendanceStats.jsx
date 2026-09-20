export default function AttendanceStats({ data }) {
  const stats = {
    present: data.filter(item => item.status === 'present').length,
    late: data.filter(item => item.status === 'late').length,
    absent: data.filter(item => item.status === 'absent').length,
    onLeave: data.filter(item => item.status === 'on-leave').length,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-500">Present</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
        <h3 className="text-sm font-medium text-gray-500">Late Arrivals</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
        <h3 className="text-sm font-medium text-gray-500">Absent</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-sm font-medium text-gray-500">On Leave</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.onLeave}</p>
      </div>
    </div>
  );
}