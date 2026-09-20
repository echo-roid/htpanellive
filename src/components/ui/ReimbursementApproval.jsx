import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const ReimbursementApproval = ({ reimbursementId }) => {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const approverId = user?.employee?.id;

  const handleSubmit = async () => {
    if (!status || !approverId) {
      setMessage('Please select a status.');
      return;
    }

    const statusData = {
      status,
      approver_id: approverId,
    };

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/reimbursements/${reimbursementId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('✅ Status updated successfully.');
        console.log('Status updated:', result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Update status error:', error);
      setMessage('❌ Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white shadow-xl rounded-xl space-y-5 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">Reimbursement Approval</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select status --</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Approver ID</label>
        <input
          type="text"
          value={approverId || ''}
          disabled
          className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-md shadow-sm cursor-not-allowed"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !status}
        className={`w-full py-2 px-4 text-white font-semibold rounded-md transition-colors duration-200 ${
          loading || !status
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {message && (
        <p className="text-sm text-center mt-2 text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default ReimbursementApproval;
