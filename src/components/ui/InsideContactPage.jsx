// src/pages/ContactPage.jsx
import React, { useState } from "react";
import Tabs from "./Tabs";

const InsideContactPage = () => {
    const [activeTab, setActiveTab] = useState("");

    const tabs = [
    { value: "Dashboard", label: "Dashboard" },
    { value: "Profile", label: "Profile" },
  
    { value: "Leads List", label: "Leads List" },
   
   
  ];


  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#3f8cff]">Contact Page</h2>
       <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="flex flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.value}
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === tab.value ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsideContactPage;
