import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../redux/slices/employeeSlice";
import { Link } from "react-router-dom";
import EditEmployeeModal from "./modals/EditEmployeeModal";

export default function EmployeeList() {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employee.list);
  const status = useSelector((state) => state.employee.status);
  const error = useSelector((state) => state.employee.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchEmployees());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return (
      <div className="p-4 bg-[#eef0f4] min-h-screen">
        <p className="text-sm text-gray-500">Loading employees...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="p-4 bg-[#eef0f4] min-h-screen">
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4  min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-gray-800">
            Employees ({employees?.length || 0})
          </h1>
        </div>

        {employees?.length === 0 ? (
          <div className="text-sm text-gray-500 bg-white border border-gray-300 rounded-md p-4">
            No employees found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
            <table className="min-w-full text-[10px] text-gray-700 border-collapse">
              <thead>
                <tr className="bg-[#f3f4f6] border-b border-gray-300 text-gray-700">
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    Designation
                  </th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    Experience Level
                  </th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    Contact Number
                  </th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    Joining Date
                  </th>
                  <th className="px-3 py-2 text-center font-medium whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((elem, index) => (
                  <tr
                    key={elem.id || index}
                    className={`border-b border-gray-200 hover:bg-[#f9fafb] transition ${
                      index % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={elem?.photo}
                          alt="profile"
                          className="w-7 h-7 rounded-full object-cover border border-gray-200"
                        />
                        <Link
                          to={`/Employees/${elem.id}`}
                          className="font-medium text-gray-800 hover:text-blue-600"
                        >
                          {elem.name}
                        </Link>
                      </div>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {elem.designation}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {elem.level}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {elem.email}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {elem.contact_number}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {elem.joining_date}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <button
                          className="p-1 rounded hover:bg-blue-100 text-blue-600 transition"
                          onClick={() => {
                            setSelectedEmployee(elem);
                            setOpen(true);
                          }}
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 px-4 py-2 w-fit rounded-md bg-white border border-gray-300 mt-4 text-[11px] font-medium text-gray-700">
          <span>{`${1}-${employees?.length || 0} of ${employees?.length || 0}`}</span>
          <ChevronLeft className="h-4 w-4 text-gray-300 cursor-not-allowed" />
          <ChevronRight className="h-4 w-4 text-gray-300 cursor-not-allowed" />
        </div>
      </div>

      {open && (
        <EditEmployeeModal
          onClose={() => {
            setOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      )}
    </>
  );
}