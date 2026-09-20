// src/pages/ClientPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  LayoutDashboard,
  User,
  List,
  FolderKanban,
  Building2,
} from "lucide-react";

const InsideClientPage = () => {
  const uniqueId = uuidv4().split("-")[0];

  const location = useLocation();
  const { client_type, cin_number, client_name, parent_clinte_code } =
    location.state || {};

  const [activeTab, setActiveTab] = useState(
    client_type === "individual" ? "Dashboard" : "Division"
  );
  const [showForm, setShowForm] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const [formData, setFormData] = useState({
    companyName: client_name || "",
    cin: cin_number || "",
    gst: "",
    address: "",
    pin: "",
    state: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    subDivisionCode: cin_number ? cin_number.split(" ")[0] + uniqueId : uniqueId,
    parent_client_code: parent_clinte_code,
  });

  const [contactsList, setContactsList] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactError, setContactError] = useState(null);

  const tabs = [
    { value: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "Profile", label: "Profile", icon: User },
    { value: "Leads List", label: "Leads List", icon: List },
    { value: "Projects", label: "Projects", icon: FolderKanban },
    ...(client_type !== "individual"
      ? [{ value: "Division", label: "Division", icon: Building2 }]
      : []),
  ];

  const fetchClientLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/leads");
      const data = await response.json();

      const clientLeads = data.filter(
        (lead) =>
          lead.clientName === client_name || lead.clientCode === parent_clinte_code
      );

      setLeads(clientLeads);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchContactsList = async () => {
    setLoadingContacts(true);
    setContactError(null);
    try {
      const response = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/contacts");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const contacts = result?.data?.contacts || [];
      setContactsList(contacts);
      setFilteredContacts(contacts);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setContactError(err.message);
      setContactsList([]);
      setFilteredContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (contactSearch) {
      const filtered = contactsList.filter((contact) =>
        contact.name.toLowerCase().includes(contactSearch.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contactsList);
    }
  }, [contactSearch, contactsList]);

  const handleContactSelect = (contact) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: contact.name,
      contactNumber:
        contact.phone || contact.mobile || contact.contact_number || "",
      email: contact.email || prev.email,
    }));
    setShowContactDropdown(false);
  };

  const handleAddManualContact = () => {
    if (contactSearch.trim()) {
      setFormData((prev) => ({
        ...prev,
        contactPerson: contactSearch,
        contactNumber: "",
      }));
      setShowContactDropdown(false);
      setContactSearch("");
    }
  };

  useEffect(() => {
    if (client_type !== "individual") {
      fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/divisions/$${parent_clinte_code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setDivisions(data.data);
        })
        .catch((err) => console.error("Error fetching divisions:", err));
    }
  }, [client_type, parent_clinte_code]);

  useEffect(() => {
    if (activeTab === "Leads List") {
      fetchClientLeads();
    }
  }, [activeTab, client_name, parent_clinte_code]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDivision = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setDivisions([data, ...divisions]);
        setFormData({
          companyName: "",
          cin: cin_number || "",
          gst: "",
          address: "",
          pin: "",
          state: "",
          contactPerson: "",
          contactNumber: "",
          email: "",
          subDivisionCode: "",
        });
        setShowForm(false);
      } else {
        alert("Failed to add division: " + data.message);
      }
    } catch (err) {
      console.error("Error adding division:", err);
    }
  };

  const calculateProjectValue = (lead) => {
    const baseRate =
      lead.domesticInternational === "International" ? 50000 : 20000;
    const paxCount = lead.paxCount || 1;
    const dayCount = lead.dayCount || 1;

    return `₹${(baseRate * paxCount * dayCount).toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "won":
        return "bg-green-100 text-green-800 border border-green-200";
      case "lost":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "new":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getTabCount = (tabValue) => {
    if (tabValue === "Leads List") return leads.length || 0;
    if (tabValue === "Division" && client_type !== "individual")
      return divisions.length || 0;
    return 0;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold mb-6 text-[#3f8cff]">
        Client Page {client_type && `(${client_type})`}
      </h2>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b bg-[#f3f4f6] overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              const count = getTabCount(tab.value);

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? "text-[#2563eb] border-[#2563eb] bg-white"
                      : "text-gray-600 border-transparent hover:text-[#2563eb]"
                  }`}
                >
                  <Icon size={13} strokeWidth={1.8} />
                  <span>{tab.label}</span>

                  {(tab.value === "Leads List" || tab.value === "Division") && (
                    <span
                      className={`min-w-[18px] h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 text-sm text-gray-700">
          {activeTab === "Dashboard" && <div>Dashboard Content</div>}
          {activeTab === "Profile" && <div>Profile Content</div>}

          {activeTab === "Leads List" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Leads List</h3>
                <button
                  onClick={fetchClientLeads}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loadingLeads}
                >
                  {loadingLeads ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {loadingLeads ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading leads...</p>
                </div>
              ) : leads.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                          RFQ Code
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                          Division
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                          Location
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                          Duration
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                          Project Value
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700 border-b">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead, idx) => (
                        <tr key={lead.id || idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b font-mono text-xs">
                            {lead.clientCode || `RFQ-${lead.id}`}
                          </td>

                          <td className="px-4 py-3 border-b">
                            {lead.clientCoordinator || "N/A"}
                          </td>

                          <td className="px-4 py-3 border-b">
                            {lead.destination || "N/A"}
                          </td>

                          <td className="px-4 py-3 border-b">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600">
                                {lead.travelingDate || "N/A"}
                              </span>
                              {lead.dayCount && lead.nightCount && (
                                <span className="text-xs text-gray-500">
                                  {lead.dayCount}D/{lead.nightCount}N
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 border-b font-medium">
                            {calculateProjectValue(lead)}
                          </td>

                          <td className="px-4 py-3 border-b">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                lead.rfqStatus
                              )}`}
                            >
                              {lead.rfqStatus || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-3">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No leads found
                  </h3>
                  <p className="text-gray-500">
                    No leads available for {client_name} at the moment.
                  </p>
                </div>
              )}

              {leads.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {leads.length}
                    </div>
                    <div className="text-sm text-blue-800">Total Leads</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        leads.filter(
                          (lead) => lead.rfqStatus?.toLowerCase() === "won"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-green-800">Won Leads</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                      {
                        leads.filter(
                          (lead) => lead.rfqStatus?.toLowerCase() === "pending"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-yellow-800">Pending</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        leads.filter(
                          (lead) => lead.rfqStatus?.toLowerCase() === "lost"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-red-800">Lost</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Projects" && <div>Projects Content</div>}

          {activeTab === "Division" && client_type !== "individual" && (
            <div>
              {!showForm ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold">Division List</h3>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      + Add Division
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-xs">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-3 py-2 border">Company</th>
                          <th className="px-3 py-2 border">CIN</th>
                          <th className="px-3 py-2 border">GST</th>
                          <th className="px-3 py-2 border">Address</th>
                          <th className="px-3 py-2 border">Pin</th>
                          <th className="px-3 py-2 border">State</th>
                          <th className="px-3 py-2 border">Contact</th>
                          <th className="px-3 py-2 border">Number</th>
                          <th className="px-3 py-2 border">Email</th>
                          <th className="px-3 py-2 border">Sub Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {divisions.map((d, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">{d.companyName}</td>
                            <td className="px-3 py-2 border">{d.cin}</td>
                            <td className="px-3 py-2 border">{d.gst}</td>
                            <td className="px-3 py-2 border">{d.address}</td>
                            <td className="px-3 py-2 border">{d.pin}</td>
                            <td className="px-3 py-2 border">{d.state}</td>
                            <td className="px-3 py-2 border">{d.contactPerson}</td>
                            <td className="px-3 py-2 border">{d.contactNumber}</td>
                            <td className="px-3 py-2 border">{d.email}</td>
                            <td className="px-3 py-2 border">
                              {d.subDivisionCode}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-semibold mb-3">Add Division</h3>
                  <form
                    onSubmit={handleAddDivision}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
                  >
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Company Name"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      name="cin"
                      placeholder="CIN"
                      value={formData.cin}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      name="gst"
                      placeholder="GST No."
                      value={formData.gst}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      name="pin"
                      placeholder="Pin"
                      value={formData.pin}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />

                    <div className="relative">
                      <input
                        type="text"
                        name="contactPerson"
                        placeholder="Contact Person"
                        value={formData.contactPerson}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            contactPerson: e.target.value,
                          });
                          setContactSearch(e.target.value);
                        }}
                        onFocus={() => {
                          setShowContactDropdown(true);
                          if (contactsList.length === 0) {
                            fetchContactsList();
                          }
                        }}
                        className="border p-2 rounded focus:ring focus:ring-blue-200 w-full"
                      />

                      {showContactDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search contacts..."
                              className="w-full px-3 py-2 border rounded"
                              value={contactSearch}
                              onChange={(e) => setContactSearch(e.target.value)}
                              autoFocus
                            />
                          </div>

                          {loadingContacts && (
                            <div className="px-4 py-2 text-gray-500">
                              Loading contacts...
                            </div>
                          )}

                          {contactError && (
                            <div className="px-4 py-2 text-red-500">
                              {contactError}
                            </div>
                          )}

                          {!loadingContacts && !contactError && (
                            <>
                              {filteredContacts.length > 0 ? (
                                filteredContacts.map((contact, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleContactSelect(contact)}
                                  >
                                    <div className="font-medium">
                                      {contact.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {contact.phone && `${contact.phone} • `}
                                      {contact.email}
                                    </div>
                                  </div>
                                ))
                              ) : contactSearch ? (
                                <div className="px-4 py-2 text-gray-500">
                                  No contacts found
                                </div>
                              ) : (
                                <div className="px-4 py-2 text-gray-500">
                                  No contacts available
                                </div>
                              )}

                              {contactSearch && (
                                <div
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 bg-blue-50 border-t"
                                  onClick={handleAddManualContact}
                                >
                                  + Add "{contactSearch}" as new contact
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      name="contactNumber"
                      placeholder="Contact Number"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email ID"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      name="subDivisionCode"
                      placeholder="Sub Division Code"
                      value={formData.subDivisionCode}
                      onChange={handleInputChange}
                      className="border p-2 rounded focus:ring focus:ring-blue-200"
                    />

                    <div className="col-span-2 flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setShowContactDropdown(false);
                        }}
                        className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsideClientPage;