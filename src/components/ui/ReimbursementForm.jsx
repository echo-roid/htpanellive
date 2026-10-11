import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import addimg from "../../assets/addimg.png";

const ReimbursementForm = () => {
  const user = useSelector((state) => state.auth.user);
  const organizerId = user?.employee?.id;

  const [formData, setFormData] = useState({
    employee_id: organizerId,
    invoices: [
      {
        amount: "",
        category: "",
        description: "",
        receipt_url: "",
        travelType: "",
        location: "",
        kilometers: "",
      },
    ],
    submission_date: new Date().toISOString().split("T")[0],
    manager_id: "",
    team_name: user?.employee?.team_name,
  });

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/employees/allmanagers");
        if (!response.ok) throw new Error("Failed to fetch managers");
        const data = await response.json();
        setManagers(data);
      } catch (error) {
        console.error("Error fetching managers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const managerOptions = managers.map((manager) => ({
    value: manager.id,
    label: manager.name,
    photo: manager.photo || "https://via.placeholder.com/40",
  }));

  const CustomOption = ({ data, innerRef, innerProps }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
    >
      <img src={data.photo} alt={data.label} className="w-8 h-8 rounded-full object-cover" />
      <span>{data.label}</span>
    </div>
  );

  const CustomSingleValue = ({ data }) => (
    <div className="flex items-center gap-2">
      <img src={data.photo} alt={data.label} className="w-6 h-6 rounded-full object-cover" />
      <span>{data.label}</span>
    </div>
  );

  const handleInvoiceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInvoices = [...formData.invoices];
    updatedInvoices[index][name] = value;
    setFormData((prev) => ({ ...prev, invoices: updatedInvoices }));
  };

  const addInvoice = () => {
    setFormData((prev) => ({
      ...prev,
      invoices: [
        ...prev.invoices,
        {
          amount: "",
          category: "",
          description: "",
          receipt_url: "",
          travelType: "",
          location: "",
          kilometers: "",
        },
      ],
    }));
  };

  const removeInvoice = (index) => {
    setFormData((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();
      const fileUrl = data.url;

      const updatedInvoices = [...formData.invoices];
      updatedInvoices[index].receipt_url = fileUrl;

      setFormData((prev) => ({
        ...prev,
        invoices: updatedInvoices,
      }));
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to upload receipt. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/reimbursements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Reimbursement created:", result);
        setFormData({
          employee_id: organizerId,
          invoices: [
            {
              amount: "",
              category: "",
              description: "",
              receipt_url: "",
              travelType: "",
              location: "",
              kilometers: "",
            },
          ],
          submission_date: new Date().toISOString().split("T")[0],
          manager_id: "",
          team_name: user?.employee?.team_name,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Create reimbursement error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-5"
    >
      <div className="w-full flex justify-center mb-4">
        <img src={addimg} alt="Add Event" className="rounded-xl w-full" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Reimbursement Request
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employee ID
        </label>
        <input
          name="employee_id"
          type="text"
          value={formData.employee_id}
          readOnly
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {formData.invoices.map((invoice, index) => (
        <div key={index} className="border p-4 rounded-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Invoice {index + 1}</h3>
            {formData.invoices.length > 1 && (
              <button
                type="button"
                onClick={() => removeInvoice(index)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              name="amount"
              type="number"
              value={invoice.amount}
              onChange={(e) => handleInvoiceChange(index, e)}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={invoice.category}
              onChange={(e) => handleInvoiceChange(index, e)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Category</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Stationary">Stationary</option>
            </select>
          </div>

          {invoice.category === "Travel" && (
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Travel Type
              </label>
              <select
                name="travelType"
                value={invoice.travelType}
                onChange={(e) => handleInvoiceChange(index, e)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Type</option>
                <option value="own">Own</option>
                <option value="cab">Cab</option>
              </select>
            </div>
          )}

          {invoice.category === "Travel" && invoice.travelType === "own" && (
            <>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  value={invoice.location}
                  onChange={(e) => handleInvoiceChange(index, e)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometers
                </label>
                <input
                  name="kilometers"
                  type="number"
                  value={invoice.kilometers}
                  onChange={(e) => handleInvoiceChange(index, e)}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </>
          )}

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={invoice.description}
              onChange={(e) => handleInvoiceChange(index, e)}
              rows={2}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Conditional file upload: show only when not 'own' travel */}
          {(!invoice.category ||
            invoice.category !== "Travel" ||
            invoice.travelType === "cab") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Receipt
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(index, e)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              {invoice.receipt_url && (
                <a
                  href={invoice.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-1 block"
                >
                  View Uploaded Receipt
                </a>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addInvoice}
        className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md"
      >
        + Add More Invoice
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Submission Date
        </label>
        <input
          name="submission_date"
          type="date"
          value={formData.submission_date}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Manager
        </label>
        <Select
          options={managerOptions}
          placeholder="Select a Manager"
          isDisabled={loading}
          value={
            managerOptions.find((opt) => opt.value === formData.manager_id) || null
          }
          onChange={(selectedOption) =>
            setFormData((prev) => ({
              ...prev,
              manager_id: selectedOption.value,
            }))
          }
          components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
          className="mt-1"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
      >
        Submit Reimbursement
      </button>
    </form>
  );
};

export default ReimbursementForm;
