import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import addimg from "../../../assets/addimg.png";
import Select from "react-select";

export default function EditEmployeeModal({ onClose, employee }) {
  const [formData, setFormData] = useState({
    id: employee?.id || null,
    name: employee?.name || "",
    age: employee?.age || "",
    designation: employee?.designation || "",
    level: employee?.level || "",
    email: employee?.email || "",
    identity_id: employee?.identity_id || "",
    contact_number: employee?.contact_number || "",
    password: "", // don’t show hashed password
    house_address: employee?.house_address || "",
    date_of_birth: employee?.date_of_birth
      ? new Date(employee.date_of_birth).toISOString().split("T")[0]
      : "",
    team_name: employee?.team_name || "",
    reporting_manager_id: employee?.reporting_manager_id || "",
    reporting_manager: employee?.reporting_manager || "",
    father_name: employee?.father_name || "",
    mother_name: employee?.mother_name || "",
    joining_date: employee?.joining_date
      ? new Date(employee.joining_date).toISOString().split("T")[0]
      : "",
    current_project: employee?.current_project || "no",
    appraisal_points: employee?.appraisal_points || 0,
    photo: employee?.photo || null,
  });

  const [leaveQuotas, setLeaveQuotas] = useState(
    employee?.leaves ? JSON.parse(employee.leaves) : []
  );
  const [managers, setManagers] = useState([]);

  const experienceLevels = [
    { value: "Intern", label: "Intern" },
    { value: "Junior", label: "Junior" },
    { value: "Mid-Level", label: "Mid-Level" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Principal", label: "Principal" },
  ];

  useEffect(() => {
    fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/employees/allmanagers/")
      .then((res) => res.json())
      .then((data) => setManagers(data || []))
      .catch((err) => console.error("Error fetching managers:", err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    const submitData = new FormData();
    for (let key in formData) {
      if (formData[key] !== undefined && formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    }
    submitData.append("leaves", JSON.stringify(leaveQuotas));

    try {
      const response = await fetch(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/employees/employees/${formData.id}`,
        {
          method: "PUT", // 👈 update API
          body: submitData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("✅ Employee updated successfully!");
        onClose(false);
      } else {
        const err = await response.json();
        alert("❌ Failed to update employee: " + (err?.error || "Unknown error"));
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-[600px] p-6 rounded-2xl shadow-xl relative max-h-[90vh] overflow-auto scrollbar-thin">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Employee</h2>

        <div className="w-full flex justify-center mb-4">
          <img src={addimg} alt="Edit employee" className="rounded-xl w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Common fields */}
          {[
            { label: "Employee Name", name: "name" },
            { label: "Age", name: "age", type: "number" },
            { label: "Email", name: "email", type: "email" },
            { label: "Identity ID", name: "identity_id" },
            { label: "Contact Number", name: "contact_number" },
            { label: "House Address", name: "house_address" },
            { label: "Date of Birth", name: "date_of_birth", type: "date" },
            { label: "Team Name", name: "team_name" },
            { label: "Father's Name", name: "father_name" },
            { label: "Mother's Name", name: "mother_name" },
            { label: "Joining Date", name: "joining_date", type: "date" },
          ].map((field) => (
            <div className="mb-2 w-full" key={field.name}>
              <label className="text-[11px] font-medium text-[#7D8592] block mb-1">
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

          {/* Experience Level */}
          <div className="mb-2 w-full">
            <label className="text-[11px] font-medium text-[#7D8592] block mb-1">
              Experience Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[12px]"
            >
              <option value="">Select Experience Level</option>
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div className="mb-2 w-full">
            <label className="text-[11px] font-medium text-[#7D8592] block mb-1">
              Designation
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[12px]"
            >
              <option value="">Select Designation</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR</option>
              <option value="Developer">Developer</option>
              <option value="QA">QA</option>
              <option value="Designer">Designer</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          {/* Reporting Manager */}
          <div className="mb-2 w-full">
            <label className="text-[11px] font-medium text-[#7D8592] block mb-1">
              Reporting Manager
            </label>
            <Select
              name="reporting_manager_id"
              value={managers
                .map((manager) => ({
                  value: manager.id,
                  label: manager.name,
                  photo: manager.photo || addimg,
                }))
                .find(
                  (opt) =>
                    opt.value.toString() ===
                    formData.reporting_manager_id?.toString()
                )}
              onChange={(selected) => {
                setFormData((prev) => ({
                  ...prev,
                  reporting_manager_id: selected.value,
                  reporting_manager: selected.label,
                }));
              }}
              options={managers.map((manager) => ({
                value: manager.id,
                label: manager.name,
                photo: manager.photo || addimg,
              }))}
              getOptionLabel={(e) => (
                <div className="flex items-center gap-2">
                  <img
                    src={e.photo}
                    alt={e.label}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{e.label}</span>
                </div>
              )}
              className="text-[12px]"
            />
          </div>

          {/* Upload Photo */}
          <div className="mb-2">
            <label className="text-[11px] font-medium text-[#7D8592] block mb-1">
              Upload Photo
            </label>
            {formData.photo && typeof formData.photo === "string" && (
              <div className="mb-2">
                <img
                  src={formData.photo}
                  alt="Employee"
                  className="w-20 h-20 rounded-full border object-cover"
                />
              </div>
            )}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-[12px]"
            />
          </div>
        </div>

        <button
          className="mt-6 float-right text-sm py-3 shadow-[0_2px_8px_0_#3F8CFF] bg-blue-600 w-[40%] text-white rounded-xl hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Update Employee
        </button>
      </div>
    </div>
  );
}
