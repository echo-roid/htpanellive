import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Set this to your app root element

const ApproveLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getCurrentMonthRange();
        const params = new URLSearchParams({ startDate, endDate });
        const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/all?${params}`);
        const data = await response.json();
        
        // Handle both array and paginated responses
        const leavesData = Array.isArray(data) ? data : (data.data || []);
        setLeaves(leavesData);
      } catch (error) {
        console.error('Fetch error:', error);
        setLeaves([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const openLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLeave(null);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-[#3F8CFF] mb-4">Leave Records</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-[#3F8CFF] rounded-lg overflow-hidden">
            <thead className="bg-[#3F8CFF] text-white">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Manager</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center px-4 py-6 text-gray-500">
                    No leave records found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-[#f0f7ff] transition-colors border-b cursor-pointer"
                    onClick={() => openLeaveDetails(leave)}
                  >
                    <td className="px-4 py-3 flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                        {leave.employee_photo ? (
                          <img 
                            src={leave.employee_photo} 
                            alt={leave.employee_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {leave.employee_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span>{leave.employee_name}</span>
                    </td>
                    <td className="px-4 py-3">{leave.leave_type}</td>
                    <td className="px-4 py-3">
                      {new Date(leave.start_date).toLocaleDateString()} - {' '}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{leave.days}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          leave.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : leave.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center">
                      {leave.manager_photo ? (
                        <img 
                          src={leave.manager_photo} 
                          alt={leave.manager_name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                          <span className="text-xs text-gray-600">
                            {leave.manager_name?.charAt(0) || 'N'}
                          </span>
                        </div>
                      )}
                      <span>{leave.manager_name || 'N/A'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Leave Details"
        className="modal"
        overlayClassName="modal-overlay"
      >
        {selectedLeave && (
          <div className="p-6 max-w-md mx-auto bg-white rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#3F8CFF]">
                Leave Details
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  {selectedLeave.employee_photo ? (
                    <img 
                      src={selectedLeave.employee_photo} 
                      alt={selectedLeave.employee_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xl text-gray-600">
                        {selectedLeave.employee_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold">{selectedLeave.employee_name}</h4>
                  <p className="text-gray-600 text-sm">{selectedLeave.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Leave Type</p>
                  <p className="font-medium">{selectedLeave.leave_type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedLeave.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : selectedLeave.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedLeave.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Start Date</p>
                  <p className="font-medium">
                    {new Date(selectedLeave.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">End Date</p>
                  <p className="font-medium">
                    {new Date(selectedLeave.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Days</p>
                  <p className="font-medium">{selectedLeave.days}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Requested On</p>
                  <p className="font-medium">
                    {new Date(selectedLeave.requested_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedLeave.reason && (
                <div>
                  <p className="text-gray-500 text-sm">Reason</p>
                  <p className="font-medium mt-1 p-3 bg-gray-50 rounded">
                    {selectedLeave.reason}
                  </p>
                </div>
              )}

              {selectedLeave.manager_comments && (
                <div>
                  <p className="text-gray-500 text-sm">Manager Comments</p>
                  <p className="font-medium mt-1 p-3 bg-blue-50 rounded">
                    {selectedLeave.manager_comments}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0;
          border-radius: 8px;
          outline: none;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default ApproveLeaveTable;