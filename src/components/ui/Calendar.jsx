import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Video, Cake, CalendarHeart, Briefcase, Building2, Check, AlertTriangle, Clock, Mail, Phone, X, Flag } from "lucide-react";
import AddEventModal from "./modals/AddEventModal";
import { useSelector } from "react-redux";

const getMonthName = (month) =>
  new Date(2000, month).toLocaleString("default", { month: "long" });

const ErrorDisplay = ({ error, onRetry }) => {
  if (!error) return null;
  return (
    <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md z-50">
      <div className="flex justify-between">
        <div><p className="font-bold">Error</p><p>{error}</p></div>
        <button onClick={onRetry} className="ml-4 bg-red-500 text-white px-3 py-1 rounded">Retry</button>
      </div>
    </div>
  );
};

// Tooltip Component
const EventTooltip = ({ event, position, onClose, onMouseEnter, onMouseLeave }) => {
  if (!event) return null;

  const formatDateFull = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTimeFull = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed bg-white rounded-lg shadow-2xl p-4 max-w-sm w-80 z-50 border border-gray-200"
      style={{
        top: position.y,
        left: position.x,
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          {event.event_type === "leave" && <CalendarHeart size={18} className="text-blue-500" />}
          {event.event_type === "task" && <Briefcase size={18} className="text-green-500" />}
          {event.event_type === "meeting" && <Video size={18} className="text-blue-500" />}
          {event.event_type === "birthday" && <Cake size={18} className="text-pink-500" />}
          {event.event_type === "corporate_event" && <Building2 size={18} className="text-purple-500" />}
          {event.event_type === "holiday" && <CalendarHeart size={18} className="text-red-500" />}
          {event.title}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      <div className="space-y-2 text-sm">
        {/* Leave details */}
        {event.event_type === "leave" && (
          <>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarHeart size={14} className="text-blue-500" />
              <span>Type: <span className="font-medium">{event.leave_type}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} className="text-blue-500" />
              <span>Duration: <span className="font-medium">{event.days} day{event.days > 1 ? 's' : ''}</span></span>
            </div>
            {event.is_multi_day && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Day {event.day_number} of {event.total_days}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600 font-medium">✅ Approved</span>
              {event.approver_name && <span className="text-xs text-gray-500">by {event.approver_name}</span>}
            </div>
            {event.reason && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Reason:</p>
                <p className="text-sm text-gray-700">{event.reason}</p>
              </div>
            )}
            {event.manager_comments && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Manager Comments:</p>
                <p className="text-sm text-gray-700">{event.manager_comments}</p>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Start: {formatDateFull(event.original_start_date || event.start_date)}
              </p>
              <p className="text-xs text-gray-400">
                End: {formatDateFull(event.original_end_date || event.start_date)}
              </p>
            </div>
          </>
        )}

        {/* Task details */}
        {event.event_type === "task" && (
          <>
            <div className="flex items-center gap-2 text-gray-600">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                event.priority === 'high' ? 'bg-red-100 text-red-700' :
                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {event.priority?.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'Completed' ? 'bg-green-100 text-green-700' :
                event.status === 'Inprogress' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {event.status}
              </span>
            </div>
            {event.is_multi_day && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Day {event.day_number} of {event.total_days}
                </span>
              </div>
            )}
            {event.description && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Description:</p>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            )}
            {event.tag_label && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs text-gray-500">Tag:</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{event.tag_label}</span>
              </div>
            )}
            {event.participants && event.participants.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 font-medium">Participants:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.participants.map((participant, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded">
                      <img src={participant.photo} alt={participant.name} className="w-4 h-4 rounded-full" />
                      <span className="text-xs">{participant.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Start: {formatDateFull(event.original_start_date || event.start_date)} at {formatTimeFull(event.start_date)}
              </p>
              <p className="text-xs text-gray-400">
                End: {formatDateFull(event.original_end_date || event.end_date)} at {formatTimeFull(event.end_date)}
              </p>
            </div>
          </>
        )}

        {/* Corporate Event / Holiday details (✅ status added) */}
        {(event.event_type === "corporate_event" || event.event_type === "holiday") && (
          <>
            {event.is_multi_day && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Day {event.day_number} of {event.total_days}
                </span>
              </div>
            )}
            {event.status && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  event.status === 'approved' ? 'bg-green-100 text-green-700' :
                  event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  Status: {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            )}
            {event.description && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Description:</p>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            )}
            {event.attendees && event.attendees.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 font-medium">Attendees:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.attendees.map((attendee, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{attendee}</span>
                  ))}
                </div>
              </div>
            )}
            {event.is_recurring && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  Recurring: {event.recurrence_pattern}
                </span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Start: {formatDateFull(event.original_start_date || event.start_date)}
              </p>
              <p className="text-xs text-gray-400">
                End: {formatDateFull(event.original_end_date || event.end_date)}
              </p>
            </div>
          </>
        )}

        {/* Meeting details */}
        {event.event_type === "meeting" && (
          <>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} className="text-blue-500" />
              <span>{event.start_time} - {event.end_time}</span>
            </div>
            {(event.google_meet_link || event.manual_meet_link) && (
              <div className="mt-2">
                <a href={event.google_meet_link || event.manual_meet_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
                  <Video size={14} /> Join Meeting
                </a>
              </div>
            )}
          </>
        )}

        {event.event_type === "birthday" && (
          <div className="flex items-center gap-2 text-gray-600"><Cake size={14} className="text-pink-500" /><span>🎂 Birthday celebration</span></div>
        )}
      </div>
    </div>
  );
};

const Calendar = () => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [leaveEvents, setLeaveEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState({ show: false, event: null, position: { x: 0, y: 0 } });
  const tooltipTimeoutRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const userEmail = user?.employee?.email;
  const id = user?.employee?.id;

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDay = startOfMonth.getDay() || 7;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const buildCalendar = () => {
    const calendar = [];
    let dayCount = 1 - (startDay - 1);
    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCount));
        dayCount++;
      }
      calendar.push(days);
    }
    return calendar;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTimeFromDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ✅ Helper for corporate status
  const getCorporateStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-400', label: 'Approved' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-400', label: 'Rejected' };
      case 'pending':
      default:
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-400', label: 'Pending' };
    }
  };

  // Helper to expand a multi-day event into daily events (✅ preserves status)
  const expandEvent = (event) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    if (startDate.toDateString() === endDate.toDateString()) {
      return [{ ...event, is_multi_day: false, day_number: 1, total_days: 1, is_start_day: true, is_end_day: true, original_start_date: event.start_date, original_end_date: event.end_date, status: event.status }];
    }
    const events = [];
    let currentDate = new Date(startDate);
    let dayCounter = 0;
    const diffTime = Math.abs(endDate - startDate);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    while (currentDate <= endDate) {
      dayCounter++;
      events.push({
        ...event,
        event_id: `${event.event_id}_${formatDate(currentDate)}`,
        start_date: currentDate.toISOString(),
        end_date: currentDate.toISOString(),
        is_multi_day: true,
        day_number: dayCounter,
        total_days: totalDays,
        is_start_day: dayCounter === 1,
        is_end_day: dayCounter === totalDays,
        original_start_date: event.start_date,
        original_end_date: event.end_date,
        status: event.status // ✅ preserve status
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return events;
  };

  const fetchCalendarEvents = async () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/calendar?month=${month}&year=${year}&userEmail=${userEmail}&userId=${id}`);
      if (!response.ok) throw new Error("Failed to fetch calendar events");
      const data = await response.json();
      const rawEvents = Array.isArray(data.data) ? data.data : [];
      const expandedEvents = rawEvents.flatMap(event => expandEvent(event));
      setEvents(expandedEvents);
      setError("");
    } catch (err) {
      console.error("Fetch calendar error:", err);
      setError(err.message);
      setEvents([]);
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/history/${id}`);
      if (!response.ok) throw new Error("Failed to fetch leave history");
      const data = await response.json();
      const approvedLeaves = Array.isArray(data)
        ? data
            .filter(leave => leave.status === "approved")
            .flatMap(leave => {
              const startDate = new Date(leave.start_date);
              const endDate = new Date(leave.end_date);
              const events = [];
              let currentDate = new Date(startDate);
              let dayCounter = 0;
              while (currentDate <= endDate) {
                dayCounter++;
                events.push({
                  event_id: `leave_${leave.id}_${formatDate(currentDate)}`,
                  title: `Leave: ${leave.leave_type}`,
                  start_date: currentDate.toISOString(),
                  end_date: currentDate.toISOString(),
                  event_type: "leave",
                  leave_type: leave.leave_type,
                  days: leave.days,
                  is_multi_day: leave.days > 1,
                  day_number: dayCounter,
                  total_days: leave.days,
                  is_start_day: dayCounter === 1,
                  is_end_day: dayCounter === leave.days,
                  original_start_date: leave.start_date,
                  original_end_date: leave.end_date,
                  reason: leave.reason,
                  manager_comments: leave.manager_comments,
                  approver_name: leave.approver_name,
                  status: leave.status
                });
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return events;
            })
        : [];
      setLeaveEvents(approvedLeaves);
    } catch (err) {
      console.error("Fetch leave history error:", err);
      setLeaveEvents([]);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/tasks/tasks?userId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      const tasksArray = data.tasks || (data.data && data.data.tasks) || [];
      if (!Array.isArray(tasksArray)) {
        setTasks([]);
        return;
      }
      const taskEvents = tasksArray.flatMap(task => {
        const startDate = new Date(task.assign_datetime);
        const endDate = new Date(task.end_datetime);
        const events = [];
        let currentDate = new Date(startDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        let dayCounter = 0;
        while (currentDate <= endDate) {
          dayCounter++;
          events.push({
            event_id: `task_${task.id}_${formatDate(currentDate)}`,
            title: task.task_name,
            start_date: currentDate.toISOString(),
            end_date: currentDate.toISOString(),
            event_type: "task",
            priority: task.priority,
            status: task.status,
            description: task.description,
            tag_label: task.tag_label,
            participants: task.participants || [],
            is_multi_day: diffDays > 1,
            day_number: dayCounter,
            total_days: diffDays,
            is_start_day: dayCounter === 1,
            is_end_day: dayCounter === diffDays,
            original_start_date: task.assign_datetime,
            original_end_date: task.end_datetime
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return events;
      });
      setTasks(taskEvents);
      setError("");
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCalendarEvents(), fetchLeaveHistory(), fetchTasks()]);
    };
    fetchData();
  }, [currentDate]);

  const getEventsForDay = (day) => {
    const dayStr = formatDate(day);
    const allEvents = [...events, ...leaveEvents, ...tasks];
    return allEvents.filter((e) => {
      try {
        return formatDate(e.start_date) === dayStr;
      } catch (err) {
        return false;
      }
    });
  };

  const handleEventAdded = (newEvent) => setEvents(prev => [...prev, newEvent]);
  const isToday = (day) => day.toDateString() === new Date().toDateString();

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <Check size={14} className="text-green-500" />;
      case "Inprogress": return <Clock size={14} className="text-blue-500" />;
      case "pending": return <AlertTriangle size={14} className="text-yellow-500" />;
      default: return null;
    }
  };

  const getTagIcon = (tag) => {
    switch (tag) {
      case "Email": return <Mail size={14} className="text-gray-500" />;
      case "Calls": return <Phone size={14} className="text-blue-500" />;
      case "Task": return <Check size={14} className="text-green-500" />;
      default: return <Briefcase size={14} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-50 border-red-400";
      case "medium": return "bg-yellow-50 border-yellow-400";
      case "low": return "bg-green-50 border-green-400";
      default: return "bg-gray-50 border-gray-400";
    }
  };

  // Enhanced styles with end-day highlighting
  const getDayStyle = (event, baseColors) => {
    if (!event.is_multi_day) {
      return {
        bgColor: baseColors.single,
        borderColor: baseColors.border,
        borderStyle: 'border-l-4',
        textColor: baseColors.text,
        hoverBg: baseColors.hover,
        endBadge: false
      };
    }
    if (event.is_start_day && event.is_end_day) {
      return {
        bgColor: baseColors.single,
        borderColor: baseColors.border,
        borderStyle: 'border-l-4',
        textColor: baseColors.text,
        hoverBg: baseColors.hover,
        endBadge: false
      };
    }
    if (event.is_start_day) {
      return {
        bgColor: baseColors.start,
        borderColor: baseColors.border,
        borderStyle: 'border-l-4',
        textColor: baseColors.text,
        hoverBg: baseColors.hoverStart,
        endBadge: false
      };
    }
    if (event.is_end_day) {
      return {
        bgColor: baseColors.end,
        borderColor: baseColors.borderEnd || baseColors.border,
        borderStyle: 'border-l-4 border-r-2 border-r-double',
        textColor: baseColors.textEnd || baseColors.text,
        hoverBg: baseColors.hoverEnd,
        endBadge: true
      };
    }
    return {
      bgColor: baseColors.middle,
      borderColor: baseColors.border,
      borderStyle: 'border-l-4',
      textColor: baseColors.text,
      hoverBg: baseColors.hoverMiddle,
      endBadge: false
    };
  };

  // Color palettes
  const getLeaveColors = () => ({
    single: "bg-green-50", border: "border-green-400", text: "text-green-600", hover: "hover:bg-green-100",
    start: "bg-blue-50", hoverStart: "hover:bg-blue-100",
    middle: "bg-indigo-50", hoverMiddle: "hover:bg-indigo-100",
    end: "bg-orange-50", borderEnd: "border-orange-500", textEnd: "text-orange-700", hoverEnd: "hover:bg-orange-100"
  });

  const getTaskColors = () => ({
    single: "bg-green-50", border: "border-green-400", text: "text-green-600", hover: "hover:bg-green-100",
    start: "bg-blue-50", hoverStart: "hover:bg-blue-100",
    middle: "bg-indigo-50", hoverMiddle: "hover:bg-indigo-100",
    end: "bg-amber-50", borderEnd: "border-amber-500", textEnd: "text-amber-700", hoverEnd: "hover:bg-amber-100"
  });

  const getCorporateColors = () => ({
    single: "bg-purple-50", border: "border-purple-400", text: "text-purple-600", hover: "hover:bg-purple-100",
    start: "bg-purple-100", hoverStart: "hover:bg-purple-200",
    middle: "bg-purple-50", hoverMiddle: "hover:bg-purple-100",
    end: "bg-fuchsia-50", borderEnd: "border-fuchsia-500", textEnd: "text-fuchsia-700", hoverEnd: "hover:bg-fuchsia-100"
  });

  const getHolidayColors = () => ({
    single: "bg-red-50", border: "border-red-400", text: "text-red-600", hover: "hover:bg-red-100",
    start: "bg-red-100", hoverStart: "hover:bg-red-200",
    middle: "bg-red-50", hoverMiddle: "hover:bg-red-100",
    end: "bg-rose-50", borderEnd: "border-rose-500", textEnd: "text-rose-700", hoverEnd: "hover:bg-rose-100"
  });

  const getDayLabel = (event) => {
    if (!event.is_multi_day) return null;
    if (event.is_start_day && event.is_end_day) return "Single Day";
    if (event.is_start_day) return "Start";
    if (event.is_end_day) return "End";
    return `Day ${event.day_number}`;
  };

  // Tooltip handlers
  const handleMouseEnter = (event, e) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left;
    let y = rect.top + rect.height;

    const tooltipWidth = 320;
    const tooltipHeight = 400;
    if (x + tooltipWidth > window.innerWidth) {
      x = window.innerWidth - tooltipWidth - 10;
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = rect.top - tooltipHeight - 10;
    }
    x = Math.max(10, x);
    y = Math.max(10, y);

    setTooltip({
      show: true,
      event: event,
      position: { x, y }
    });
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip({ show: false, event: null, position: { x: 0, y: 0 } });
    }, 300);
  };

  const handleTooltipMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip({ show: false, event: null, position: { x: 0, y: 0 } });
    }, 300);
  };

  const handleTooltipClose = () => {
    setTooltip({ show: false, event: null, position: { x: 0, y: 0 } });
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f4f9fd] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[36px]">Calendar</h2>
        <button className="bg-[#3F8CFF] text-white rounded-lg px-4 py-2 flex items-center gap-1 shadow-md" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
          <h3 className="text-lg font-semibold">{getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}</h3>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 text-center text-sm text-gray-500">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <div key={day} className="py-2 font-medium">{day}</div>)}
        </div>

        {buildCalendar().map((week, i) => (
          <div key={i} className="grid grid-cols-7">
            {week.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isDayToday = isToday(day);
              const dayEvents = getEventsForDay(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border p-1 relative ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : ""} ${isDayToday ? "bg-blue-100 border-2 border-blue-500" : ""}`}
                >
                  <div className={`text-xs text-right pr-1 ${isDayToday ? "bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center ml-auto" : ""}`}>
                    {day.getDate()}
                  </div>

                  {dayEvents.map((event) => {
                    // --- TASK ---
                    if (event.event_type === "task") {
                      const colors = getTaskColors();
                      const style = getDayStyle(event, colors);
                      const label = getDayLabel(event);
                      return (
                        <div
                          key={event.event_id}
                          className={`mt-1 rounded-lg px-2 py-1 shadow-sm text-xs ${style.bgColor} ${style.hoverBg} ${style.borderStyle} ${style.borderColor} cursor-pointer transition-all duration-200 hover:shadow-md relative`}
                          onMouseEnter={(e) => handleMouseEnter(event, e)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="font-medium truncate flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {getTagIcon(event.tag_label)}
                              <span className={style.textColor}>
                                {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                              </span>
                              {event.is_multi_day && <span className="text-[8px] text-gray-500 font-normal">{label}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {event.is_multi_day && <span className="text-[8px] text-gray-500">{event.day_number}/{event.total_days}</span>}
                              {getStatusIcon(event.status)}
                            </div>
                          </div>
                          {event.start_date && (
                            <div className="text-gray-500 text-[10px]">
                              {getTimeFromDate(event.start_date)}
                              {event.end_date && ` - ${getTimeFromDate(event.end_date)}`}
                            </div>
                          )}
                          {event.participants && event.participants.length > 0 && (
                            <div className="flex mt-1">
                              {event.participants.slice(0, 3).map((participant, i) => (
                                <img key={i} src={participant.photo} alt={participant.name} className="w-4 h-4 rounded-full -mr-1 border border-white" title={participant.name} />
                              ))}
                              {event.participants.length > 3 && (
                                <div className="w-4 h-4 rounded-full bg-gray-200 text-[8px] flex items-center justify-center -mr-1 border border-white">
                                  +{event.participants.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          {style.endBadge && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] px-1 rounded-tr rounded-bl">
                              END
                            </div>
                          )}
                        </div>
                      );
                    }

                    // --- LEAVE ---
                    if (event.event_type === "leave") {
                      const colors = getLeaveColors();
                      const style = getDayStyle(event, colors);
                      const label = getDayLabel(event);
                      return (
                        <div
                          key={event.event_id}
                          className={`mt-1 rounded-lg px-2 py-1 shadow-sm text-xs ${style.bgColor} ${style.hoverBg} ${style.borderStyle} ${style.borderColor} cursor-pointer transition-all duration-200 hover:shadow-md relative`}
                          onMouseEnter={(e) => handleMouseEnter(event, e)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="font-medium truncate flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className={style.textColor}>
                                {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                              </span>
                              {event.is_multi_day && <span className="text-[8px] text-gray-500 font-normal">{label}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {event.is_multi_day && <span className="text-[8px] text-gray-500">{event.day_number}/{event.total_days}</span>}
                              <CalendarHeart size={14} className={style.textColor} />
                            </div>
                          </div>
                          <div className="text-gray-500 text-[10px] flex justify-between items-center">
                            <span>✅ Approved</span>
                            {event.is_multi_day && <span className="text-[8px] bg-white px-1 rounded">{event.days} day{event.days > 1 ? 's' : ''}</span>}
                          </div>
                          {style.endBadge && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] px-1 rounded-tr rounded-bl">
                              END
                            </div>
                          )}
                        </div>
                      );
                    }

                    // --- CORPORATE EVENT (✅ with status badge) ---
                    if (event.event_type === "corporate_event") {
                      const colors = getCorporateColors();
                      const style = getDayStyle(event, colors);
                      const label = getDayLabel(event);
                      const statusInfo = getCorporateStatusInfo(event.status);

                      return (
                        <div
                          key={event.event_id || event.id}
                          className={`mt-1 rounded-lg px-2 py-1 shadow-sm text-xs ${style.bgColor} ${style.hoverBg} ${style.borderStyle} ${style.borderColor} cursor-pointer transition-all duration-200 hover:shadow-md relative`}
                          onMouseEnter={(e) => handleMouseEnter(event, e)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="font-medium truncate flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className={style.textColor}>
                                {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                              </span>
                              {event.is_multi_day && <span className="text-[8px] text-gray-500 font-normal">{label}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {event.is_multi_day && <span className="text-[8px] text-gray-500">{event.day_number}/{event.total_days}</span>}
                              <Building2 size={14} className={style.textColor} />
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color} font-medium`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                          {event.start_date && (
                            <div className="text-gray-500 text-[10px]">
                              {getTimeFromDate(event.start_date)}
                              {event.end_date && ` - ${getTimeFromDate(event.end_date)}`}
                            </div>
                          )}
                          {style.endBadge && (
                            <div className="absolute top-0 right-0 bg-fuchsia-500 text-white text-[8px] px-1 rounded-tr rounded-bl">
                              END
                            </div>
                          )}
                        </div>
                      );
                    }

                    // --- HOLIDAY ---
                    if (event.event_type === "holiday") {
                      const colors = getHolidayColors();
                      const style = getDayStyle(event, colors);
                      const label = getDayLabel(event);
                      return (
                        <div
                          key={event.event_id || event.id}
                          className={`mt-1 rounded-lg px-2 py-1 shadow-sm text-xs ${style.bgColor} ${style.hoverBg} ${style.borderStyle} ${style.borderColor} cursor-pointer transition-all duration-200 hover:shadow-md relative`}
                          onMouseEnter={(e) => handleMouseEnter(event, e)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="font-medium truncate flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className={style.textColor}>
                                {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                              </span>
                              {event.is_multi_day && <span className="text-[8px] text-gray-500 font-normal">{label}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {event.is_multi_day && <span className="text-[8px] text-gray-500">{event.day_number}/{event.total_days}</span>}
                              <CalendarHeart size={14} className={style.textColor} />
                            </div>
                          </div>
                          {event.start_date && (
                            <div className="text-gray-500 text-[10px]">
                              {getTimeFromDate(event.start_date)}
                              {event.end_date && ` - ${getTimeFromDate(event.end_date)}`}
                            </div>
                          )}
                          {style.endBadge && (
                            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] px-1 rounded-tr rounded-bl">
                              END
                            </div>
                          )}
                        </div>
                      );
                    }

                    // --- MEETING, BIRTHDAY, OTHER ---
                    return (
                      <div
                        key={event.event_id || event.id}
                        className={`mt-1 rounded-lg px-2 py-1 shadow-sm text-xs ${
                          event.event_type === "meeting"
                            ? "bg-blue-50 border-l-4 border-blue-400 hover:bg-blue-100"
                            : event.event_type === "birthday"
                              ? "bg-pink-50 border-l-4 border-pink-400 hover:bg-pink-100"
                              : "bg-gray-50 border-l-4 border-gray-400 hover:bg-gray-100"
                        } cursor-pointer transition-all duration-200 hover:shadow-md`}
                        onMouseEnter={(e) => handleMouseEnter(event, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="font-medium truncate flex items-center justify-between">
                          <div className="flex flex-col">
                            {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                          </div>
                          {event.event_type === "meeting" ? (
                            <a href={event.google_meet_link || event.manual_meet_link} target="_blank" rel="noopener noreferrer" className="ml-auto" onClick={(e) => e.stopPropagation()}>
                              <Video size={14} className="text-blue-500" />
                            </a>
                          ) : event.event_type === "birthday" ? (
                            <Cake size={14} className="text-pink-500" />
                          ) : (
                            <Briefcase size={14} className="text-gray-500" />
                          )}
                        </div>
                        {event.event_type === "meeting" && (
                          <div className="text-gray-500 text-[10px]">{event.start_time} - {event.end_time}</div>
                        )}
                        {event.event_type !== "meeting" && event.start_date && (
                          <div className="text-gray-500 text-[10px]">
                            {getTimeFromDate(event.start_date)}
                            {event.end_date && ` - ${getTimeFromDate(event.end_date)}`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {open && <AddEventModal onClose={() => setOpen(false)} onEventAdded={handleEventAdded} currentDate={currentDate} />}

      <ErrorDisplay error={error} onRetry={() => { fetchCalendarEvents(); fetchLeaveHistory(); fetchTasks(); }} />

      {tooltip.show && tooltip.event && (
        <EventTooltip
          event={tooltip.event}
          position={tooltip.position}
          onClose={handleTooltipClose}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </div>
  );
};   

export default Calendar;