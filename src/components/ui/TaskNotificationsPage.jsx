import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const getTypeColor = (type) => {
  const map = {
    task_assignment: "bg-green-100 text-green-800",
    task_update: "bg-yellow-100 text-yellow-800",
    task_reminder: "bg-red-100 text-red-800",
  };
  return map[type] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TaskNotificationsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskNotifications = async () => {
      try {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks/notifyGet?userId=${user?.employee?.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch task notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching task notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.employee?.id) fetchTaskNotifications();
  }, [user?.employee?.id]);

  const groupedByDate = notifications.reduce((acc, noti) => {
    const dateKey = formatDate(noti.created_at);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(noti);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">🔔 Task Notifications</h2>

      {loading ? (
        <div className="text-gray-600">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-600">No notifications found.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{date}</h3>
              <div className="space-y-2">
                {items.map((noti) => (
                  <div
                    key={noti.id}
                    className={`p-4 rounded-md shadow-md flex justify-between items-start border-l-4 ${
                      noti.is_read ? "border-gray-300 bg-white" : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div>
                      <div className={`text-xs mb-1 inline-block px-2 py-1 rounded ${getTypeColor(noti.type)}`}>
                        {noti.type.replace(/_/g, " ")}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-800">{noti.title}</h4>
                      <p className="text-sm text-gray-600">{noti.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(noti.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskNotificationsPage;
