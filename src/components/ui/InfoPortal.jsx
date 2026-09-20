import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import illustration from "../../assets/illustration.png"
import folder from "../../assets/folder.png"
import folderGreen from "../../assets/foldergreen.png"
import folderBlue from "../../assets/folderblue.png"
import folderPurple from "../../assets/folderPurple.png"
import { Plus } from "lucide-react";

const InfoPortal = () => {
  const projects = [
    { name: "Medical App", pages: 5, color: "bg-yellow-100" ,icon:folder},
    { name: "Fortune website", pages: 8, color: "bg-green-100",icon:folderGreen },
    { name: "Planner App", pages: 2, color: "bg-cyan-100" ,icon:folderBlue},
    { name: "Time tracker - personal", pages: 5, color: "bg-purple-100" ,icon:folderPurple},
  ];

  return (
    <>
             <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold mb-5  text-[36px]">Info Portal</h2>
                    
                    <button className="bg-[#3F8CFF] text-white rounded-lg px-4 py-2 flex items-center gap-1 shadow-md">
                      <Plus size={16} /> Add Folder
                    </button>
                  </div>


                  <div className="min-h-screen bg-[#f6fafd] ">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Left banner */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm flex items-center justify-between rounded-lx">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Your project data warehouse</h2>
            <p className="text-sm text-gray-500">
              Add project data, create thematic pages, edit data, share information with team members
            </p>
          </div>
          <img src={illustration} alt="illustration" className="w-40 h-40 object-contain" />
        </div>

        {/* Right small box */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h4 className="text-sm text-gray-400 mb-2">Current Projects</h4>
          <p className="text-3xl font-bold text-gray-800">10</p>
          <p className="text-green-500 text-sm font-medium flex items-center gap-1">
            Growth +3 <FiArrowUpRight />
          </p>
          <p className="text-xs text-gray-400 mt-1">Ongoing projects last month - 7</p>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-4 gap-4">
        {projects.map((proj, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-start justify-between h-28"
          >
          
            <img className="w-10 h-10 mb-2" src={proj.icon} alt={proj.icon} />
            <p className="text-sm font-medium text-gray-800 truncate w-full">{proj.name}</p>
            <p className="text-xs text-gray-500">{proj.pages} pages</p>
          </div>
        ))}
      </div>
    </div>
    </>
 
  );
};

export default InfoPortal;
