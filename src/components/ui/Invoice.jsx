import React, { useState } from "react";

export default function InvoiceUploadForm() {
  const [form, setForm] = useState({
    date: "",
    projectCode: "",
    vendorName: "",
    division: "",
    invoiceNo: "",
    invoiceDate: "",
    igst: "",
    cgst: "",
    sgst: "",
    taxableAmount: "",
    invoiceValue: "",
    document: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("FORM DATA:", form);
    alert("Form Submitted!");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-5">Invoice Upload Form</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">

        {/* First Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input type="date" name="date" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">Project Code</label>
            <input type="text" name="projectCode" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">Vendor Name</label>
            <input type="text" name="vendorName" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Division</label>
            <input type="text" name="division" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">Invoice No</label>
            <input type="text" name="invoiceNo" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">Date of Invoice</label>
            <input type="date" name="invoiceDate" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>
        </div>

        {/* Tax Values Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">IGST</label>
            <input type="number" name="igst" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">CGST</label>
            <input type="number" name="cgst" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">SGST</label>
            <input type="number" name="sgst" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>
        </div>

        {/* Amounts Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Taxable Amount</label>
            <input type="number" name="taxableAmount" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>

          <div>
            <label className="block font-semibold mb-1">Invoice Value</label>
            <input type="number" name="invoiceValue" className="w-full border px-3 py-2 rounded" onChange={handleChange} />
          </div>
        </div>

        {/* Upload */}
        <div>
          <label className="block font-semibold mb-1">Upload Document</label>
          <input
            type="file"
            name="document"
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full border px-3 py-2 rounded"
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Submit
        </button>

      </form>
    </div>
  );
}
