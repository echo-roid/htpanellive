import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// API base URL
const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

export default function VendorManagement() {
  const [showKYC, setShowKYC] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [step, setStep] = useState(1);
  const [isNewVendor, setIsNewVendor] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    // Step 1: Business Details
    vendorName: "",
    businessName: "",
    email: "",
    phone: "",
    contactPerson: "",
    website: "",
    relationshipCountry: "",
    vendorType: "",
    rating: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    country: "",
    zipPin: "",
    longitude: "",
    latitude: "",
    
    // Step 2: Bank Details
    bankAccountNumber: "",
    reEnterBankAccountNumber: "",
    ifscCode: "",
    swiftCode: "",
    
    // Step 3: GST/PAN Details
    gstNumber: "",
    panNumber: "",
    
    // Step 4: Documents & Category
    vendorCategory: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const vendorCategories = [
    "Hotel", "Flight", "Transport", "Production", "Electronics", 
    "Textiles", "Furniture", "Logistics", "IT Services", "Consulting", "Other"
  ];

  const vendorTypes = [
    "Hotel", "Event", "Transport", "Collateral", "Manpower", "Land", 
    "Services", "Remittance", "Artist", "Lounge", "Trophies", 
    "Gifting", "Courier", "Restaurant", "Airlines", "Ticketing Agency"
  ];

  const countries = [
    "India", "USA", "UK", "UAE", "Canada", "Australia", "Germany", "France", "Japan", "China", "Other"
  ];

  // Check if vendor type requires rating and coordinates
  const showRatingAndCoordinates = ["Hotel", "Restaurant"].includes(form.vendorType);

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // API function to fetch all vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/vendors?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setVendors(result.data);
      } else {
        console.error("Failed to fetch vendors:", result.message);
        alert("Failed to load vendors. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      alert("Failed to connect to server. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // API function to create vendor
  const createVendor = async (vendorData) => {
    try {
      setSubmitting(true);
      
      console.log('📤 Sending vendor data to API:', vendorData);

      const response = await fetch(`${API_BASE_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorData),
      });
      
      const result = await response.json();
      
      console.log('📥 API Response:', result);

      if (result.success) {
        alert("Vendor created successfully! ✅");
        return true;
      } else {
        alert(`Failed to create vendor: ${result.message}`);
        return false;
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      alert("Failed to create vendor. Please check if backend is running.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  function handleVendorSelect(vendor) {
    setSelectedVendor(vendor);
    setForm((prev) => ({
      ...prev,
      vendorName: vendor.vendor_name,
      businessName: vendor.business_name || "",
      contactPerson: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      country: vendor.country,
      relationshipCountry: vendor.relationship_country,
      vendorType: vendor.vendor_type,
      rating: vendor.rating,
      vendorCategory: vendor.vendor_category,
    }));
    setShowKYC(true);
    setIsNewVendor(false);
    setStep(1);
    setFormErrors({});
  }

  function handleAddNewVendor() {
    setSelectedVendor(null);
    setForm({
      vendorName: "",
      businessName: "",
      email: "",
      phone: "",
      contactPerson: "",
      website: "",
      relationshipCountry: "",
      vendorType: "",
      rating: "",
      addressLine1: "",
      addressLine2: "",
      state: "",
      country: "",
      zipPin: "",
      longitude: "",
      latitude: "",
      bankAccountNumber: "",
      reEnterBankAccountNumber: "",
      ifscCode: "",
      swiftCode: "",
      gstNumber: "",
      panNumber: "",
      vendorCategory: "",
    });
    setShowKYC(true);
    setIsNewVendor(true);
    setStep(1);
    setFormErrors({});
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  function validateStep(step) {
    const errors = {};

    if (step === 1) {
      if (!form.vendorName.trim()) errors.vendorName = "Vendor name is required";
      if (!form.contactPerson.trim()) errors.contactPerson = "Contact person is required";
      if (!form.email.trim()) errors.email = "Email is required";
      if (!form.relationshipCountry.trim()) errors.relationshipCountry = "Relationship country is required";
      if (!form.vendorType.trim()) errors.vendorType = "Vendor type is required";
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Email is invalid";
      
      // Validate rating if required
      if (showRatingAndCoordinates && !form.rating.trim()) {
        errors.rating = "Rating is required for Hotel/Restaurant vendors";
      }
    }

    if (step === 2) {
      if (!form.bankAccountNumber.trim()) errors.bankAccountNumber = "Bank account number is required";
      if (!form.reEnterBankAccountNumber.trim()) errors.reEnterBankAccountNumber = "Please re-enter bank account number";
      if (!form.ifscCode.trim()) errors.ifscCode = "IFSC code is required";
      if (form.bankAccountNumber !== form.reEnterBankAccountNumber) {
        errors.reEnterBankAccountNumber = "Bank account numbers do not match";
      }
      if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
        errors.ifscCode = "Invalid IFSC code format";
      }
    }

    if (step === 3) {
      if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber)) {
        errors.gstNumber = "Invalid GST number format";
      }
      if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
        errors.panNumber = "Invalid PAN number format";
      }
    }

    if (step === 4) {
      if (!form.vendorCategory) errors.vendorCategory = "Vendor category is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

async function handleNext(e) {
  e.preventDefault();
  
  if (!validateStep(step)) {
    return;
  }
  
  if (step < 4) {
    setStep(step + 1);
  } else {
    // Prepare data for API - REMOVED longitude and latitude
    const vendorData = {
      vendor_name: form.vendorName,
      business_name: form.businessName,
      email: form.email,
      phone: form.phone,
      contact_person: form.contactPerson,
      website: form.website,
      relationship_country: form.relationshipCountry,
      vendor_type: form.vendorType,
      rating: form.rating,
      address_line1: form.addressLine1,
      address_line2: form.addressLine2,
      state: form.state,
      country: form.country,
      zip_pin: form.zipPin,
      // REMOVED: longitude and latitude
      bank_account_number: form.bankAccountNumber,
      re_enter_bank_account_number: form.reEnterBankAccountNumber,
      ifsc_code: form.ifscCode,
      swift_code: form.swiftCode,
      gst_number: form.gstNumber,
      pan_number: form.panNumber,
      vendor_category: form.vendorCategory,
    };

    console.log('🔄 Submitting vendor data:', vendorData);

    // Call API to create vendor
    const success = await createVendor(vendorData);
    
    if (success) {
      // Refresh vendors list
      await fetchVendors();
      // Reset form and go back to vendor list
      setForm({
        vendorName: "",
        businessName: "",
        email: "",
        phone: "",
        contactPerson: "",
        website: "",
        relationshipCountry: "",
        vendorType: "",
        rating: "",
        addressLine1: "",
        addressLine2: "",
        state: "",
        country: "",
        zipPin: "",
        longitude: "",
        latitude: "",
        bankAccountNumber: "",
        reEnterBankAccountNumber: "",
        ifscCode: "",
        swiftCode: "",
        gstNumber: "",
        panNumber: "",
        vendorCategory: "",
      });
      setShowKYC(false);
      setIsNewVendor(false);
      setStep(1);
      setFormErrors({});
    }
  }
}

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  const StepIndicator = ({ number, label, desc, active, completed }) => (
    <li className={`flex items-start ${!active && !completed ? "opacity-60" : ""}`}>
      <div className="flex flex-col items-center mr-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          completed ? "bg-green-600 text-white" :
          active ? "border-2 border-green-600 text-green-600 font-semibold" :
          "border border-gray-300 text-gray-500"
        }`}>
          {completed ? "✓" : number}
        </div>
        {number < 4 && <div className="w-px h-12 bg-gray-200 mt-2" />}
      </div>
      <div>
        <div className={`font-medium ${active ? "text-green-700" : "text-gray-800"}`}>
          {label}
        </div>
        {desc && <div className="text-sm text-gray-500">{desc}</div>}
      </div>
    </li>
  );

  const getStatusBadge = (status) => {
    const statusColors = {
      Active: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-red-100 text-red-800",
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {!showKYC ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Vendor Management</h2>
            <div className="flex gap-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Search
                </button>
              </form>
              <button 
                onClick={handleAddNewVendor}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Add New Vendor"}
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading && (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading vendors...</span>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Vendor Code</th>
                    <th className="px-6 py-4 font-semibold">Vendor Name</th>
                    <th className="px-6 py-4 font-semibold">Country</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Contact Person</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No vendors found
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor, i) => (
                      <tr
                        key={vendor.id || i}
                        className="hover:bg-gray-50 transition duration-150 cursor-pointer"
                        onClick={() => handleVendorSelect(vendor)}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{vendor.id}</td>
                       <td className="px-6 py-4 font-medium text-gray-900">
  <Link
    to="/accounts/vendorDashboard"
    state={{
      vendorName: vendor.vendor_name,
      vendorCategory: vendor.vendor_category
    }}
    className="text-blue-600 hover:underline hover:text-blue-800"
    onClick={(e) => e.stopPropagation()}
  >
    {vendor.vendor_name}
  </Link>
</td>
                        <td className="px-6 py-4">{vendor.country}</td>
                        <td className="px-6 py-4">{vendor.vendor_category}</td>
                        <td className="px-6 py-4">{vendor.contact_person}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span>{vendor.phone}</span>
                            <span className="text-xs text-gray-500">{vendor.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(vendor.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing 1 to {vendors.length} of {vendors.length} results
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1 border border-gray-300 rounded bg-blue-600 text-white">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden flex min-h-[600px]">
          {/* LEFT SIDEBAR */}
          <aside className="w-1/4 border-r border-gray-200 p-8 bg-white">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-600 text-white flex items-center justify-center rounded-full font-bold text-lg">
                V
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-800">
                  {isNewVendor ? "New Vendor Registration" : "Vendor KYC"}
                </h3>
                {!isNewVendor && (
                  <p className="text-sm text-gray-500">{selectedVendor?.id}</p>
                )}
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-6 text-gray-800">
              {isNewVendor ? "Complete Vendor Registration" : "Complete your KYC"}
            </h2>
            <ol className="space-y-6">
              <StepIndicator
                number={1}
                label="Business Details"
                desc="Vendor information"
                active={step === 1}
                completed={step > 1}
              />
              <StepIndicator
                number={2}
                label="Bank Details"
                desc="Provide account details"
                active={step === 2}
                completed={step > 2}
              />
              <StepIndicator
                number={3}
                label="GST/PAN Details"
                desc="Tax information"
                active={step === 3}
                completed={step > 3}
              />
              <StepIndicator
                number={4}
                label="Vendor Category"
                desc="Final details"
                active={step === 4}
                completed={false}
              />
            </ol>
          </aside>

          {/* MAIN FORM */}
          <main className="w-3/4 p-10 bg-white">
            <div className="max-w-3xl">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {step} of 4</span>
                  <span>{step * 25}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${step * 25}%` }}
                  ></div>
                </div>
              </div>

              {/* Form Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                  {isNewVendor ? "New Vendor Registration" : "Vendor KYC Form"}
                </h3>
                <p className="text-gray-600">
                  {isNewVendor 
                    ? "Please provide all required information to register a new vendor" 
                    : "Please complete the KYC process for the selected vendor"
                  }
                </p>
              </div>

              {/* Form Steps */}
              <form onSubmit={handleNext}>
                {step === 1 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold mb-4 text-gray-700">Business Details</h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vendor Name *
                        </label>
                        <input
                          name="vendorName"
                          value={form.vendorName}
                          onChange={handleChange}
                          placeholder="Enter vendor name"
                          className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                            formErrors.vendorName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                        {formErrors.vendorName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.vendorName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          name="businessName"
                          value={form.businessName}
                          onChange={handleChange}
                          placeholder="Enter business name"
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Person *
                        </label>
                        <input
                          name="contactPerson"
                          value={form.contactPerson}
                          onChange={handleChange}
                          placeholder="Enter contact person name"
                          className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                            formErrors.contactPerson ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                        {formErrors.contactPerson && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.contactPerson}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                            formErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          placeholder="Enter website URL"
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship Country *
                        </label>
                        <select
                          name="relationshipCountry"
                          value={form.relationshipCountry}
                          onChange={handleChange}
                          className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                            formErrors.relationshipCountry ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country, index) => (
                            <option key={index} value={country}>{country}</option>
                          ))}
                        </select>
                        {formErrors.relationshipCountry && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.relationshipCountry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vendor Type *
                        </label>
                        <select
                          name="vendorType"
                          value={form.vendorType}
                          onChange={handleChange}
                          className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                            formErrors.vendorType ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        >
                          <option value="">Select Vendor Type</option>
                          {vendorTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </select>
                        {formErrors.vendorType && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.vendorType}</p>
                        )}
                      </div>
                    </div>

                    {/* Conditional Fields - Rating and Coordinates */}
                    {showRatingAndCoordinates && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating *
                          </label>
                          <select
                            name="rating"
                            value={form.rating}
                            onChange={handleChange}
                            className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                              formErrors.rating ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                          >
                            <option value="">Select Rating</option>
                            <option value="1 Star">1 Star</option>
                            <option value="2 Star">2 Star</option>
                            <option value="3 Star">3 Star</option>
                            <option value="4 Star">4 Star</option>
                            <option value="5 Star">5 Star</option>
                            <option value="Luxury">Luxury</option>
                            <option value="Budget">Budget</option>
                            <option value="Premium">Premium</option>
                          </select>
                          {formErrors.rating && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Coordinates
                          </label>
                          <div className="flex gap-3">
                            <input
                              name="longitude"
                              value={form.longitude}
                              onChange={handleChange}
                              placeholder="Longitude"
                              className="block w-1/2 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              name="latitude"
                              value={form.latitude}
                              onChange={handleChange}
                              placeholder="Latitude"
                              className="block w-1/2 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        name="addressLine1"
                        value={form.addressLine1}
                        onChange={handleChange}
                        placeholder="Enter address line 1"
                        className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        name="addressLine2"
                        value={form.addressLine2}
                        onChange={handleChange}
                        placeholder="Enter address line 2"
                        className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          placeholder="Enter state"
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Country</option>
                          {countries.map((country, index) => (
                            <option key={index} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP/PIN Code
                        </label>
                        <input
                          name="zipPin"
                          value={form.zipPin}
                          onChange={handleChange}
                          placeholder="Enter ZIP/PIN"
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold mb-4 text-gray-700">Bank Details</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number *
                      </label>
                      <input
                        name="bankAccountNumber"
                        value={form.bankAccountNumber}
                        onChange={handleChange}
                        placeholder="Enter bank account number"
                        className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                          formErrors.bankAccountNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {formErrors.bankAccountNumber && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.bankAccountNumber}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Re-enter Bank Account Number *
                      </label>
                      <input
                        name="reEnterBankAccountNumber"
                        value={form.reEnterBankAccountNumber}
                        onChange={handleChange}
                        placeholder="Re-enter bank account number"
                        className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                          formErrors.reEnterBankAccountNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {formErrors.reEnterBankAccountNumber && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.reEnterBankAccountNumber}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IFSC Code *
                        </label>
                        <input
                          name="ifscCode"
                          value={form.ifscCode}
                          onChange={handleChange}
                          placeholder="Enter IFSC code"
                          className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                            formErrors.ifscCode ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                        {formErrors.ifscCode && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.ifscCode}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SWIFT Code (International)
                        </label>
                        <input
                          name="swiftCode"
                          value={form.swiftCode}
                          onChange={handleChange}
                          placeholder="Enter SWIFT code"
                          className="block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold mb-4 text-gray-700">GST / PAN Details</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number
                      </label>
                      <input
                        name="gstNumber"
                        value={form.gstNumber}
                        onChange={handleChange}
                        placeholder="Enter GST number"
                        className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                          formErrors.gstNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {formErrors.gstNumber && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.gstNumber}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        name="panNumber"
                        value={form.panNumber}
                        onChange={handleChange}
                        placeholder="Enter PAN number"
                        className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                          formErrors.panNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {formErrors.panNumber && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.panNumber}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold mb-4 text-gray-700">Vendor Category</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor Category *
                      </label>
                      <select
                        name="vendorCategory"
                        value={form.vendorCategory}
                        onChange={handleChange}
                        className={`block w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                          formErrors.vendorCategory ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                      >
                        <option value="">Select Category</option>
                        {vendorCategories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {formErrors.vendorCategory && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.vendorCategory}</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 mt-8">
                      <h4 className="font-semibold text-lg mb-4">Registration Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Vendor:</span>
                          <span className="ml-2 font-medium">{form.vendorName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <span className="ml-2 font-medium">{form.contactPerson}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium">{form.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Vendor Type:</span>
                          <span className="ml-2 font-medium">{form.vendorType}</span>
                        </div>
                        {showRatingAndCoordinates && (
                          <>
                            <div>
                              <span className="text-gray-600">Rating:</span>
                              <span className="ml-2 font-medium">{form.rating}</span>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">{form.vendorCategory}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </main>
        </div>
      )}

      {/* Bottom buttons - Only show when in KYC mode */}
      {showKYC && (
        <div className="fixed right-10 bottom-10 flex gap-4">
          <button
            onClick={() => {
              setShowKYC(false);
              setIsNewVendor(false);
              setFormErrors({});
            }}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition duration-200"
          >
            Back to Vendor List
          </button>
          {step > 1 && (
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition duration-200"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : step === 4 ? "Submit Registration" : "Next Step"}
          </button>
        </div>
      )}
    </div>
  );
}