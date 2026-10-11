import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { PhoneOutgoing, X } from "lucide-react";
import addimg from "../../../assets/projectadd.png"





export default function Addtask({ onClose }) {
  const selectedProjectId = useSelector((state) => state.projectSelection.selectedProjectId);
  
  const [formData, setFormData] = useState({
    project_id:selectedProjectId,
    title:"", 
    description:"", 
    start_date:"", 
    due_date:"", 
    priority_level:"",
  });

  
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    
  };

  const handleSubmit = async () => {
    const submitData = new FormData();
    for (let key in formData) {
      submitData.append(key, formData[key]);
    }
    try {
      const response = await fetch(`http://localhost:5000/api/tasks`, {
        method: "POST",
        body: submitData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Project created:", data);
        alert("Task created successfully!");
        onClose(false)
      } else {
        console.error("❌ Failed to create Task");
        alert("Failed to create Task");
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("Something went wrong while submitting the form");
    }
  };
  

  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-[500px] p-6 rounded-2xl shadow-xl relative h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">Add Task</h2>

        {/* Illustration */}
        <div className="w-full flex justify-center mb-4">
          <img
            src={addimg} // replace with actual image path
            alt="Employee Illustration"
            className="rounded-xl w-full"
          />
        </div>



       
      <div className="grid grid-cols-2 gap-4  ">
        {[
          { label: "Task name", name: "title" },
          { label: "Description", name: "description" },
          { label: "Start Date", name: "start_date",type: "date"},
          { label: "Due date", name: "due_date",type: "date" },
          { label: "Priority Level", name: "priority_level" },
         
         
        ].map((field) => (
          <div className="mb-4 w-[100%] " key={field.name}>
            <label className="text-[11px] font-medium text-[#7D8592] block mb-2">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.label}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[12px]"
              
            />
          </div>
        ))}

        {/* Upload Photo */}
        
      </div>
        {/* Add Another Member */}
        {/* <div className="text-blue-600 text-sm font-[400] cursor-pointer mb-4 flex items-center gap-1">
          <span className="text-lg">＋</span> Add another Member
        </div> */}

        {/* Approve Button */}
        <button className="float-right text-sm py-3 shadow-[0_2px_8px_0_#3F8CFF]
 bg-blue-600 w-[30%] text-white rounded-xl hover:bg-blue-700 transition" onClick={handleSubmit} >
          Approve
        </button>
      </div>
    </div>
  );
}
