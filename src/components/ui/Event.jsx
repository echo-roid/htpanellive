import React from "react";
import {  Clock, Plus } from "lucide-react";
import upArrow from "../../assets/priority.png"
import building from "../../assets/active.png"
const events = [
    {
        title: "Presentation of the new department",
        time: "Today | 6:00 PM",
        duration: "4h",
        iconColor: "blue-500",
        icon: "🏢",
        trend: "up"
    },
    {
        title: "Anna's Birthday",
        time: "Today | 5:00 PM",
        duration: "2h",
        iconColor: "pink",
        icon: "🎂",
        trend: "down"
    },
    {
        title: "Meeting with Development Team",
        time: "Tomorrow | 5:00 PM",
        duration: "4h",
        iconColor: "yellow-400",
        icon: "👨‍💻",
        trend: "up"
    },
    {
        title: "Ray's Birthday",
        time: "Tomorrow | 2:00 PM",
        duration: "1h 30m",
        iconColor: "pink-500",
        icon: "🎂",
        trend: "down"
    },
    {
        title: "Meeting with CEO",
        time: "Sep 14 | 5:00 PM",
        duration: "1h",
        iconColor: "blue-500",
        icon: "🏢",
        trend: "up"
    },
    {
        title: "Movie night (Tenet)",
        time: "Sep 15 | 5:00 PM",
        duration: "3h",
        iconColor: "purple-600",
        icon: "📺",
        trend: "down"
    },
    {
        title: "Lucas’s Birthday",
        time: "Sep 29 | 5:30 PM",
        duration: "2h",
        iconColor: "pink-500",
        icon: "🎂",
        trend: "down"
    },
    {
        title: "Meeting with CTO",
        time: "Sep 30 | 12:00",
        duration: "1h",
        iconColor: "blue-500",
        icon: "🏢",
        trend: "up"
    }
];

const EventCard = ({ event, index }) => {
    return (
        <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-[30px]" key={index}>
            <div className={`w-1 rounded-full h-[5rem] bg-${event.iconColor}`} />
            <div className="flex-1 ">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-2 items-center">
                    <img src={building} alt="building" />
                <p className="text-sm  font-medium 
      text-gray-900">
                    {event.title} 
                </p>
                    </div>
                  

                <img src={upArrow} className="h-[15px] w-[10px]" alt="upArrow" />
                </div>
                
                <div className="flex items-center justify-between
      text-xs text-gray-500 mt-1 gap-2">
                    <span>{event.time}</span>
                    <span className="flex items-center gap-1 bg-[#F4F9FD] font-semibold rounded-[2px] p-2 px-3 text-[11px]">
                        <Clock size={12} className="text[#F4F9FD] font-semibold" /> 4h
                    </span>
                </div>
            </div>
        </div>
    );
};

const NearestEventsPage = () => {
    return (
        <div className="bg-[#f5faff] min-h-screen py-6">
            <div className="text-sm text-blue-500 mb-2 cursor-pointer">← Back to Dashboard</div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Nearest Events</h1>
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {events.map((event, index) => (
                    <EventCard event={event} key={index} />
                ))}
            </div>
        </div>
    );
};

export default NearestEventsPage;
