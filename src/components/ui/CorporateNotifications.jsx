import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare } from "lucide-react";

const CorporateNotifications = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state for comments
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [comments, setComments] = useState("");

  // Fetch pending events
  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/leave/corporate-events/pending/${user?.employee?.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch pending events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employee?.id) {
      fetchPendingEvents();
    }
  }, [user]);

  // Open modal with action type
  const openModal = (event, type) => {
    setSelectedEvent(event);
    setActionType(type);
    setComments("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setActionType("");
    setComments("");
  };

  // Handle approve / reject
  const handleActionSubmit = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const endpoint =
        actionType === "approve"
          ? `https://tableware-dweeb-estate.ngrok-free.dev/api/leave/corporate-events/${selectedEvent.event_id}/approve`
          : `https://tableware-dweeb-estate.ngrok-free.dev/api/leave/corporate-events/${selectedEvent.event_id}/reject`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: user?.employee?.id,
          comments: comments.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Action failed");
      }

      // Refresh list and close modal
      await fetchPendingEvents();
      closeModal();
    } catch (err) {
      console.error("Error performing action:", err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date display
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Guard: if not manager, redirect or show message
  if (user?.employee?.designation !== "Manager") {
    return (
      <div className="p-8 text-center text-gray-600">
        <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="text-lg">You are not a manager</p>
        <p className="text-sm">Only managers can view pending corporate events.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={fetchPendingEvents}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Corporate Event Approvals
        </h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {events.length} pending
        </span>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg">No pending corporate events</p>
          <p className="text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-400 hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {event.employee_photo ? (
                        <img
                          src={event.employee_photo}
                          alt={event.employee_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="text-gray-500" size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Requested by: {event.employee_name} ({event.employee_email})
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>
                        {formatDate(event.start_date)} → {formatDate(event.end_date)}
                      </span>
                    </div>
                    {event.description && (
                      <div className="flex items-start gap-2">
                        <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                        <span className="line-clamp-2">{event.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => openModal(event, "approve")}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => openModal(event, "reject")}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for comments */}
      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">
              {actionType === "approve" ? "Approve" : "Reject"} Event
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              <strong>{selectedEvent.title}</strong> by {selectedEvent.employee_name}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments (optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                rows="3"
                placeholder="Add any remarks..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {actionLoading ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateNotifications;