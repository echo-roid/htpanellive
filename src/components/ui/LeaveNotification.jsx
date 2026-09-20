import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function LeaveNotification() {
  const navigate = useNavigate();
  const [notificationLeaveData, setNotificationLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/leave/notifications/${user.employee.id}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch leave notifications');
        }
        const data = await response.json();
        setNotificationLeaveData(data?.pending_leaves || []);
      } catch (error) {
        console.error('Error fetching leave notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user.employee.id]);

  const handleApprove = async (managerId, requestId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/approve/${requestId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId,
          comments: 'Approved by manager',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // Optionally refresh notifications
        setNotificationLeaveData(prev =>
          prev.filter(leave => leave.id !== requestId)
        );
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (managerId, leaveId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/rejectleave/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId,
          comments: 'Rejected by manager',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // Optionally refresh notifications
        setNotificationLeaveData(prev =>
          prev.filter(leave => leave.id !== leaveId)
        );
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {notificationLeaveData.length !== 0 ? notificationLeaveData.map((emp, idx) => {
     const today = new Date();
     const leaveStartDate = new Date(emp?.start_date);
     
     // Check if the leave has already started or is in the past
     const hasLeaveStarted = today >= leaveStartDate;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl px-6 py-4 shadow-sm flex flex-col gap-4 mb-4"
          >
            {/* Header Row: Image and Info */}
            <div className="flex items-center gap-4">
              <img
                src={emp?.photo || '/default-avatar.png'}
                alt={emp?.employee_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">{emp?.employee_name}</div>
                <div className="text-sm text-gray-500">{emp?.designation}</div>
              </div>
            </div>

            {/* Message and Buttons */}
            <div className="text-sm text-gray-700">
              <div className="mb-5">
                <div className="text-xs text-gray-400">Leave Details</div>
                <div className="text-[12px] font-semibold">
                  Requested leave from <b>{new Date(emp?.start_date).toLocaleDateString()}</b> to <b>{new Date(emp?.end_date).toLocaleDateString()}</b><br />
                  Reason: {emp?.reason}
                </div>
              </div>

              {/* {!hasLeaveStarted ? ( */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                  {
  !hasLeaveStarted ? (
    <button
      className="bg-[#3F8CFF] text-white rounded-lg px-4 py-2 text-sm shadow-md w-full"
      onClick={() => handleApprove(emp?.manager_id, emp?.id)}
    >
      Approve
    </button>
  ) : (
    "Date due"
  )
}
                   
                  </div>
                  <div>
                    <button
                      className="bg-[#FF4D4F] text-white rounded-lg px-4 py-2 text-sm shadow-md w-full"
                      onClick={() => handleReject(emp?.manager_id, emp?.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              {/* ): "Date due"} */}
            </div>
          </div>
        );
      }) : (
        <div className='flex justify-between w-[60%] items-center'>
          <ArrowLeft size={20} onClick={() => navigate(-1)} />
          <h1 className='text-lg font-medium'>Zero Leave Request</h1>
        </div>
      )}
    </div>
  );
}
