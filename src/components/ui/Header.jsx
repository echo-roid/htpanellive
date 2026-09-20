import React, { useEffect, useState, useRef } from "react";
import { Search, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import notificationImg from "../../assets/notifications.png";
import logo from "../../assets/Company'slogo.png";
import { Link } from "react-router-dom";

/* ✅ Single source of truth for API base + headers */
const API_BASE = "https://tableware-dweeb-estate.ngrok-free.dev/api";
const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
  "Content-Type": "application/json",
};

export default function Header({
  setProfileselector,
  profileselector,
  SetToggleMenuBar,
}) {
  const user = useSelector((state) => state.auth.user);
  const role =
    user?.employee?.designation === "Manager" ? "manager" : "employee";
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(null);
  const [leaveNotifications, setLeaveNotifications] = useState([]);
  const [taskNotifications, setTaskNotifications] = useState([]);
  const [corporateNotifications, setCorporateNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenforside, setDropdownOpenForSide] = useState(false);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  /* =========================
     Fetch Reimbursement Notifications
  ========================== */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/reimbursements/notifications/${role}/${user?.employee?.id}`,
          {
            headers: NGROK_HEADERS, // ✅ FIX
            credentials: "include", // ✅ FIX (if backend uses cookies)
          }
        );
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.log(err.message);
      }
    };

    if (user?.employee?.id) fetchNotifications();
  }, [user?.employee?.id, role]);

  /* =========================
     Fetch Leave Notifications
  ========================== */
  useEffect(() => {
    const fetchLeaveNotifications = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/leave/notifications/${user.employee.id}`,
          {
            headers: NGROK_HEADERS, // ✅ FIX
            credentials: "include", // ✅ FIX
          }
        );
        if (!response.ok) throw new Error("Failed to fetch leave notifications");
        const data = await response.json();
        setLeaveNotifications(data?.pending_leaves || []);
      } catch (error) {
        console.error("Error fetching leave notifications:", error);
      }
    };

    if (user?.employee?.id) fetchLeaveNotifications();
  }, [user?.employee?.id]);

  /* =========================
     Fetch Task Notifications
  ========================== */
  useEffect(() => {
    const fetchTaskNotifications = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/tasks/tasks/notifyGet?userId=${user?.employee?.id}`,
          {
            headers: NGROK_HEADERS, // ✅ FIX
            credentials: "include", // ✅ FIX
          }
        );
        if (!response.ok) throw new Error("Failed to fetch task notifications");
        const data = await response.json();
        setTaskNotifications(data);
      } catch (error) {
        console.error("Error fetching task notifications:", error);
      }
    };

    if (user?.employee?.id) fetchTaskNotifications();
  }, [user?.employee?.id]);

  /* =========================
     Fetch Corporate Event Notifications
  ========================== */
  useEffect(() => {
    const fetchCorporateNotifications = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/leave/notifications/corporate?userId=${user?.employee?.id}`,
          {
            headers: NGROK_HEADERS, // ✅ FIX
            credentials: "include", // ✅ FIX
          }
        );
        if (!response.ok) throw new Error("Failed to fetch corporate notifications");
        const data = await response.json();
        setCorporateNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error fetching corporate notifications:", error);
      }
    };

    if (user?.employee?.id) fetchCorporateNotifications();
  }, [user?.employee?.id]);

  /* =========================
     Close dropdown on outside click
  ========================== */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setDropdownOpenForSide(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     Check if notifications exist
  ========================== */
  const hasNotifications = () => {
    const reimbursementsExist =
      (role === "manager" &&
        notifications?.pendingReimbursements?.length > 0) ||
      (role === "employee" &&
        notifications?.reimbursementUpdates?.length > 0);

    return (
      reimbursementsExist ||
      leaveNotifications.length > 0 ||
      taskNotifications.length > 0 ||
      corporateNotifications.length > 0
    );
  };

  /* =========================
     Render Notifications
  ========================== */
  const renderNotificationsList = () => {
    const list = [];

    if (role === "manager" && notifications?.pendingReimbursements?.length) {
      notifications.pendingReimbursements.forEach((item) => {
        list.push({
          id: item.id,
          type: "reimbursement",
          title: `${item.employee_name} submitted ₹${parseFloat(
            item.amount || 0
          ).toFixed(2)}`,
          date: item.submission_date,
        });
      });
    }

    if (role === "employee" && notifications?.reimbursementUpdates?.length) {
      notifications.reimbursementUpdates.forEach((item) => {
        list.push({
          id: item.id,
          type: "reimbursement",
          title: `Reimbursement ${item.status} by ${item.manager_name}`,
          date: item.approval_date,
        });
      });
    }

    leaveNotifications.forEach((item) => {
      list.push({
        id: item.id,
        type: "leave",
        title: `Leave request from ${item.employee_name}`,
        date: item.start_date,
      });
    });

    taskNotifications.forEach((item) => {
      list.push({
        id: item.id,
        type: "task",
        title: `${item.title}: ${item.message}`,
        date: item.created_at,
      });
    });

    // Corporate notifications
    corporateNotifications.forEach((item) => {
      list.push({
        id: item.id,
        type: "corporate",
        title: item.title || "Corporate Event",
        subtitle: item.message,
        date: item.created_at,
      });
    });

    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!list.length) {
      return (
        <div className="p-4 text-sm text-gray-500 text-center">
          No notifications
        </div>
      );
    }

    return list.map((n, idx) => (
      <div
        key={`${n.type}-${n.id}-${idx}`}
        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
        onClick={() => {
          setDropdownOpen(false);
          if (n.type === "leave") navigate("/LeaveNotification");
          else if (n.type === "task") navigate("/TaskNotificationsPage");
          else if (n.type === "corporate") navigate("/CorporateNotifications");
          else navigate("/ReimbursementList");
        }}
      >
        <p className="text-sm font-medium text-gray-800">{n.title}</p>
        {n.subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{n.subtitle}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(n.date).toLocaleString()}
        </p>
      </div>
    ));
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-30 bg-gradient-to-r from-[#484644] to-[#2f2e2d] shadow-md">
        <div className="flex items-center justify-between px-4 py-1 mx-auto">
          {/* LEFT - Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <img
              src={logo}
              alt="logo"
              className="h-10 w-10 object-contain"
            />
            <span
              className="text-white font-semibold text-lg tracking-wide"
              onClick={() => SetToggleMenuBar(false)}
            >
              Company
            </span>
          </div>

          {/* CENTER - Search */}
          <div className="flex items-center gap-3 bg-white rounded-full px-5 py-2 w-[420px] shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
            <Search
              size={18}
              className="text-gray-500 cursor-pointer hover:text-black"
              onClick={() => SetToggleMenuBar(true)}
            />
            <input
              type="text"
              placeholder="Search..."
              className="outline-none w-full text-sm bg-transparent"
            />
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-6">
            {/* Info Icon */}
            <div
              className="cursor-pointer text-gray-600 hover:text-blue-600 hover:scale-110 transition"
              title="Info"
              onClick={() => navigate("/infoportal")}
            >
              <Info size={20} color="white" />
            </div>

            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="relative cursor-pointer hover:scale-105 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={notificationImg}
                  width={36}
                  height={36}
                  alt="Notifications"
                />
                {hasNotifications() && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
                )}
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-96 max-h-[420px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
                  <div className="px-4 py-3 font-semibold border-b bg-gray-50 rounded-t-xl">
                    Notifications
                  </div>
                  <div className="divide-y">{renderNotificationsList()}</div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() =>
                  setDropdownOpenForSide(!dropdownOpenforside)
                }
              >
                <img
                  src={user?.employee?.photo}
                  className="w-8 h-8 rounded-full object-cover border"
                  alt="user"
                />
              </div>

              {dropdownOpenforside && (
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-xl border z-50 animate-fadeIn">
                  <ul className="text-sm text-gray-600">
                    <li
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setProfileselector(true);
                        setDropdownOpenForSide(false);
                      }}
                    >
                      Profile
                    </li>
                    <li
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setProfileselector(false);
                        setDropdownOpenForSide(false);
                      }}
                    >
                      My Work
                    </li>
                    <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                      <Link to="/EmployeesAttadance">Attendance</Link>
                    </li>
                    <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                      Settings
                    </li>
                    <li
                      className="px-4 py-3 hover:bg-red-50 text-red-500 cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}