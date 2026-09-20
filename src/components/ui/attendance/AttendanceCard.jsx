export default function AttendanceCard({ record }) {
  const statusColors = {
    present: 'bg-green-100 text-green-800',
    late: 'bg-yellow-100 text-yellow-800',
    absent: 'bg-red-100 text-red-800',
    'on-leave': 'bg-purple-100 text-purple-800',
    'half-day': 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex gap-3 items-center">{record.employee_name} <img src={`https://tableware-dweeb-estate.ngrok-free.dev/uploads/${record?.employee_photo}`} className="w-8 h-8 rounded-full" alt="" /></h3>
            <p className="text-sm text-gray-500">{record.designation}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
            {record.status.replace('-', ' ')}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 justify-center  gap-4">
          <div>
            <p className="text-xs text-gray-500">Check In</p>
            <p className="font-medium text-xs">{record.check_in || '--:--'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Check Out</p>
            <p className="font-medium text-xs">{record.check_out || '--:--'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Hours</p>
            <p className="font-medium text-xs">{record.totalHours || '0.00'} hrs</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Overtime</p>
            <p className="font-medium text-xs">{record.overtimeHours || '0.00'} hrs</p>
          </div>
        </div>
      </div>
    </div>
  );
}