import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock, Gift, ArrowDown, Paperclip, UploadCloud, Send } from "lucide-react";
// import projectimg from "../../assets/projectimg.png";
import arrow from "../../assets/arrow.png";
// import priority from "../../assets/priority.png";
import { fetchProjects } from '../../redux/slices/projectSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';

// Main Dashboard Component
export default function Home() {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const employeeList = useSelector((state) => state.employee.list);
  const user = useSelector((state) => state.auth.user);
  const team_name = user?.employee?.team_name;
  const organizerId = user?.employee?.id;

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks?userId=${organizerId}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.log(err);
      }
    };
    if (organizerId) fetchTasks();
  }, [organizerId]);
  
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks/${taskId}/status?userId=${organizerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update task status");

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      alert("Failed to update task status: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <p className="text-[#7D8592] mb-3">Welcome back, {user?.employee?.name}!</p>
      <h2 className="text-2xl font-bold mb-8 text-[36px]">Dashboard</h2>

      <div className="flex gap-5 mb-5 mt-5">
        <div className="w-[70%]">
          <SectionCard title="Workload">
            <div className="grid grid-cols-4 gap-4">
              {employeeList
                ?.filter((elem) => elem?.team_name === team_name)
                .map((elem, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.04 }}
                    className="shadow rounded-xl p-3 bg-[#F4F9FD] h-[175px] text-center"
                  >
                    {/* <div className={`w-[10px] h-[10px] ${
                      elem.status === "present" ? "bg-sky-500" :
                      elem.status === "not_present" ? "bg-red-500" :
                      "bg-yellow-400"
                    } rounded-full`}></div> */}
                    <img
                      src={elem?.photo || "https://via.placeholder.com/100"}
                      className="mx-auto rounded-full w-12 h-12 mb-2"
                      alt="user"
                    />
                    <p className="font-medium text-sm">
                      {elem.name.length > 10 ? `${elem.name.slice(0, 10)}...` : elem.name}
                    </p>
                    <p className="text-xs mt-2 text-gray-500">
                      {elem.designation.length > 10
                        ? `${elem.designation.slice(0, 10)}...`
                        : elem.designation}
                    </p>
                    <p className="text-[#7D8592] text-[12px] font-semibold mt-2 inline-block py-1 px-3 border-[#7D8592] border-2 rounded-lg">
                      Junior
                    </p>
                  </motion.div>
                ))}
            </div>
          </SectionCard>
        </div>

        <div className="w-[30%]">
          <NearestEvents />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-[70%]">
          <div className="flex justify-between items-center mb-4">
            <button className="text-sm text-blue-500 flex gap-2 items-center hover:underline">
              View all <img src={arrow} alt="arrow" />
            </button>
          </div>
          <SectionCard title="Task">
            {tasks?.map((elem, index) =>
              index < 3 ? <ProjectCard task={elem} key={index} onUpdateStatus={updateTaskStatus} /> : null
            )}
          </SectionCard>
        </div>

        <div className="w-[30%] bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Stream</h2>
          <div className="flex items-center mb-2">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Oscar Holloway"
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Oscar Holloway</p>
              <p className="text-xs text-gray-500">UI/UX Designer</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-[#f4f8fe] text-sm text-gray-700 rounded-lg px-4 py-2 mb-2">
            <UploadCloud size={35} className="text-blue-500 mt-1" />
            <p>Updated the status of Mind Map task to In Progress</p>
          </div>
          <div className="flex items-start gap-2 bg-[#f4f8fe] text-sm text-gray-700 rounded-lg px-4 py-2 mb-4">
            <Paperclip size={15} className="text-purple-500 mt-1" />
            <p>Attached files to the task</p>
          </div>
          <div className="flex items-center mb-2">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Emily Tyler"
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Emily Tyler</p>
              <p className="text-xs text-gray-500">Copywriter</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-[#f4f8fe] text-sm text-gray-700 rounded-lg px-4 py-2 mb-4">
            <UploadCloud size={35} className="text-blue-500 mt-1" />
            <p>Updated the status of Mind Map task to In Progress</p>
          </div>
          <div className="text-blue-500 text-sm font-medium text-center cursor-pointer hover:underline">
            View more <ArrowDown size={14} className="inline ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Section Card Component
const SectionCard = ({ title, children }) => (
  <div className="bg-white shadow h-[310px] overflow-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100 rounded-lg p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button className="text-sm text-blue-500 flex gap-2 items-center hover:underline">
        View all <img src={arrow} alt="arrow" />
      </button>
    </div>
    {children}
  </div>
);

// Events Component
const NearestEvents = () => {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("meetings");
  const user = useSelector((state) => state.auth.user);
  const organizerId = user?.employee?.id;
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/calendar?month=${currentMonth}&year=${currentYear}`
        );
        if (!response.ok) throw new Error("Failed to fetch calendar events");
        const data = await response.json();
        setEvents(data.data);
      } catch (err) {
        console.error("Fetch calendar error:", err);
      }
    };

    const fetchMeetings = async () => {
      try {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/calendar/meetings/?organizer_id=${organizerId}&email=${user?.employee?.email}`
        );
        const result = await response.json();
        if (result.success) {
          setMeetings(result.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (currentDate) fetchCalendarEvents();
    if (organizerId) fetchMeetings();
  }, [currentDate, currentMonth, currentYear, organizerId]);

  const filteredEvents = activeTab === "meetings"
    ? meetings
    : events.filter((event) => event.event_type === activeTab.slice(0, -1));

  const getColor = (type) => {
    switch (type) {
      case "holiday": return "bg-green-500";
      case "birthday": return "bg-pink-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full h-[310px] overflow-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-sm text-gray-800">Nearest Events</h2>
        <a href="#" className="text-xs flex gap-2 items-center text-blue-500 font-medium">
          View all <img src={arrow} alt="arrow" />
        </a>
      </div>
      <div className="flex gap-2 mb-4">
        {["meetings", "holidays", "birthdays"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs capitalize px-3 py-1 rounded-full ${
              activeTab === tab
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-5">
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center">No {activeTab} found</p>
        ) : (
          filteredEvents.map((event, idx) => (
            <div className="flex items-start gap-2" key={idx}>
              <div className={`w-1 rounded-full h-[5rem] ${getColor(event.event_type)}`} />
              <div className="flex-1 mb-6">
                <div className="text-sm mb-2 font-medium flex justify-between text-gray-900">
                  <div className="flex flex-col">
                    {event.title || (event.event_type === "birthday" && `${event.name || "Employee"}'s Birthday 🎉`)}
                  </div>
                  <span className={`text-xs ${event.arrow === "up" ? "text-yellow-500" : "text-green-500"}`}>
                    {event.arrow === "up" ? "▲" : "▼"}
                  </span>
                </div>
                <p className="text-[11px] font-medium">{event?.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1 gap-2">
                  <span>{event.end_date?.split("T")[0] || event.start_date?.split("T")[0]}</span>
                  {activeTab === "meetings" && event.end_time && (
                    <span className="flex items-center gap-1 bg-[#F4F9FD] font-semibold rounded-[2px] p-2 px-3 text-[11px]">
                      <Clock size={12} /> {event.end_time} H
                    </span>
                  )}
                  {activeTab === "birthdays" && (
                    <span className="flex items-center gap-1 bg-[#F4F9FD] font-semibold rounded-[2px] p-2 px-3 text-[11px] text-pink-500">
                      <Gift size={12} /> Celebrate!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Task Notification Component
const SendTaskNotification = ({ task, onClose }) => {
  const [notificationData, setNotificationData] = useState({
    title: `Update: ${task.task_name}`,
    message: '',
    type: 'info'
  });
  const [loading, setLoading] = useState(false);

  const notificationTypes = [
    { value: 'info', label: 'Information' },
    { value: 'warning', label: 'Warning' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'update', label: 'Update' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, ...notificationData })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send notification');
      alert('Notification sent successfully!');
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Send Notification for Task</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={notificationData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={notificationData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={notificationData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !notificationData.message}
            className={`px-4 py-2 flex items-center ${
              loading || !notificationData.message
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-md transition-colors`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-1" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const ProjectCard = ({ task, onUpdateStatus }) => {

  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  const getBadgeColor = (label) => {
    const colors = {
      Calls: "bg-teal-600 text-white",
      Email: "bg-yellow-400 text-black",
      Pending: "bg-indigo-500 text-white",
      Inprogress: "bg-orange-400 text-white",
      Completed: "bg-green-500 text-white",
      Promotion: "bg-purple-200 text-purple-800",
      Rejected: "bg-red-200 text-red-700",
      Collab: "bg-green-200 text-green-700",
      Rated: "bg-yellow-200 text-yellow-700",
      Task: "bg-blue-500 text-white",
      High: "bg-red-500 text-white",
      Medium: "bg-yellow-500 text-black",
      Low: "bg-green-500 text-white",
    };
    return colors[label] || "bg-gray-200 text-gray-800";
  };

  return (
    <>
      <div
        className="flex items-center justify-between border-b px-4 py-2 hover:bg-gray-50 relative"

      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1 h-10 bg-blue-500 rounded-full" />
          <span className="font-medium truncate max-w-[220px]">{task.task_name}</span>
          {task.reminder_due && (
            <span className="text-red-500 text-xs font-semibold ml-2">⏰ Due Soon!</span>
          )}
          <span className={`text-xs px-3 py-1 rounded-md ${getBadgeColor(task.priority)}`}>
            📞 {task.priority}
          </span>
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value)}
            className={`text-xs px-2 py-1 rounded-md ${getBadgeColor(task.status)} bg-opacity-80 cursor-pointer`}
          >
            <option value="Pending">Pending</option>
            <option value="Inprogress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className={`text-xs px-3 py-1 rounded-md ${getBadgeColor(task.tag_label)}`}>
            {task.tag_label}
          </span>
          <span className="flex items-center text-sm text-gray-500 gap-1">
            📅 {new Date(task.end_datetime).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <div className="flex -space-x-2">
            {task.participants?.map((p, idx) => (
              <img
                key={idx}
                src={p.photo || `https://i.pravatar.cc/32?img=${idx + 5}`}
                alt={p.name}
                title={p.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <div className="relative">
            {/* <button 
              className="text-gray-500 hover:text-gray-800 p-1" 
              onClick={() => setShowMenu(prev => !prev)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button> */}

             <button
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          onClick={() => {
                    
                    setShowNotificationDialog(true);
                  }}
        >
          🔔 Notify
        </button>
            
          
          </div>
        </div>
      </div>

      {showNotificationDialog && (
        <SendTaskNotification 
          task={task} 
          onClose={() => setShowNotificationDialog(false)} 
        />
      )}
    </>
  );
};