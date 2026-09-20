import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskLayout from "./TasksPage";
import Calendar from "./Calendar";

const TaskCalendarTabs = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  const tabs = [
    { id: "tasks", label: "Tasks", component: <TaskLayout /> },
    { id: "calendar", label: "Calendar", component: <Calendar /> }
  ];

  return (
    <div className="p-4 md:p-0 bg-gray-50 min-h-screen">
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative py-2 px-4 font-medium text-sm whitespace-nowrap ${
              activeTab === tab.id 
                ? "text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                layoutId="underline"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabs.find(tab => tab.id === activeTab).component}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TaskCalendarTabs;