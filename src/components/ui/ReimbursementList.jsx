import React, { useEffect, useState } from 'react';
import { Bell, Eye } from "lucide-react";
import { useSelector } from 'react-redux';

const ReimbursementList = () => {
  const user = useSelector((state) => state.auth.user);
  const Myid = user?.employee?.id;

  const [reimbursements, setReimbursements] = useState([]);
  const [allReimbursements, setAllReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyApprovals, setShowMyApprovals] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/reimbursements/rei/${Myid}`);
        const data = await res.json();

        if (res.ok) {
          setReimbursements(data);
          setAllReimbursements(data);

          const allRes = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/reimbursements`);
          const allData = await allRes.json();
          const pending = allData.filter(r => r.manager_id === Myid && r.status?.toLowerCase() === 'pending');
          setPendingApprovalCount(pending.length);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchData();
  }, [Myid, user]);

  const getStatusBadge = (status) => {
    const base = "px-2 py-[2px] rounded text-[10px] font-medium";
    switch (status?.toLowerCase()) {
      case 'approved': return `${base} bg-green-100 text-green-700`;
      case 'pending': return `${base} bg-yellow-100 text-yellow-700`;
      case 'rejected': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const toggleMyApprovals = async () => {
    setShowMyApprovals(!showMyApprovals);
  };

  const updateReimbursementStatus = async (id, status) => {
    try {
      await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/reimbursements/rei/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      setReimbursements(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalAmount = (invoices = []) =>
    invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

  return (
    <div className="p-4  min-h-screen">

      <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
        Reimbursement Requests

        {user?.employee?.designation === "Manager" && (
          <div className="relative">
            <Bell
              className="w-5 h-5 cursor-pointer text-gray-500"
              onClick={toggleMyApprovals}
            />
            {pendingApprovalCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        )}
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
          
          <table className="min-w-full text-[10px] text-gray-700 border-collapse">

            {/* HEADER */}
            <thead>
              <tr className="bg-[#f3f4f6] border-b border-gray-300">
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Invoices</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Approver</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {reimbursements.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-200 hover:bg-[#f9fafb] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfd]'
                  }`}
                >
                  <td className="px-3 py-2">{r.employee_name}</td>

                  <td className="px-3 py-2">
                    ₹{getTotalAmount(r.invoices)}
                  </td>

                  <td className="px-3 py-2">
                    {r.invoices?.length || 0}
                  </td>

                  <td className="px-3 py-2">
                    <span className={getStatusBadge(r.status)}>
                      {r.status}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    {r.approver_name || '-'}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {showMyApprovals && r.status === "pending" ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => updateReimbursementStatus(r.id, 'approved')}
                          className="px-2 py-1 text-[10px] bg-green-500 text-white rounded"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => updateReimbursementStatus(r.id, 'rejected')}
                          className="px-2 py-1 text-[10px] bg-red-500 text-white rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedReimbursement(r)}>
                        <Eye className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* MODAL */}
      {selectedReimbursement && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-xl relative">
            <button
              onClick={() => setSelectedReimbursement(null)}
              className="absolute top-2 right-2"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Details
            </h3>

            <p><strong>Employee:</strong> {selectedReimbursement.employee_name}</p>
            <p><strong>Status:</strong> {selectedReimbursement.status}</p>
            <p><strong>Total:</strong> ₹{getTotalAmount(selectedReimbursement.invoices)}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReimbursementList;