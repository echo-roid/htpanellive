import React, { useState } from "react";
// import {
//   // Bell,
//   Calendar,
//   Menu,
//   Search,
//   Users,
//   Clock,
//   CalendarDays
// } from "lucide-react";

// import { motion } from "framer-motion";
// import arrow from "./assets/arrow.png"
import Side from "./components/ui/Sidebar"

import "./App.css"
import Header from "./components/ui/Header";
import { Outlet } from "react-router-dom";
const App = () => {
const [profileselector, setProfileselector] = useState()
const [toggleMenuBar,SetToggleMenuBar] = useState(true)

return (
  <>
  <Header setProfileselector={setProfileselector} profileselector={profileselector} SetToggleMenuBar={SetToggleMenuBar}/>
 
    <div className="min-h-screen bg-[#f4f7fe] text-gray-800 flex font-sans mt-[50px]">
      {/* Sidebar */}
      <Side profileselector={profileselector}  SetToggleMenuBar={SetToggleMenuBar} toggleMenuBar={toggleMenuBar}/>
      {/* Main Content */}
      <main className={`flex-1 ${toggleMenuBar ? "max-h-[600px] ml-[16%]  w-[81%]":"w-[100%]" } p-6 overflow-auto  scrollbar-none`}>
        
        <Outlet />
      </main>
    </div>
    
  </> );
};
export default App;