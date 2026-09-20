// src/components/Tabs.jsx
import React from "react";

const Tabs = ({ tabs }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab, idx) => (
        <div
          key={idx}
          className="bg-[#3f8cff] text-white px-4 py-2 rounded-xl shadow-md text-sm font-semibold hover:bg-blue-600 cursor-pointer transition-all"
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
