import React, { useState, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, GripVertical, Calendar, CheckCircle, Clock, AlertCircle, Plus, TrendingUp, Users, Briefcase, Award, BarChart3, Activity } from "lucide-react";
import axios from "axios";
import * as api from "../../api/services";
import * as apiCo from "../../api/Companie";
import { Link } from "react-router-dom";
import bookImage from "../../assets/book.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const API_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api/leads";
const EMPLOYEE_API_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api/employees";
const COMPANY_API_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api/contacts";
const CLIENT_API_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api/companies";

// Utility function to capitalize first letter of each word
const capitalizeName = (name) => {
  if (!name) return "";
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// LeadFormDrawer component (unchanged - keeping it compact)
const LeadFormDrawer = ({
  isOpen,
  onClose,
  addNewLead,
  updateLead,
  leadToEdit
}) => {
  const isEditMode = Boolean(leadToEdit);

  const [formData, setFormData] = useState({
    dateOfRfqReceive: "",
    clientName: "",
    clientCode: "",
    salesPerson: "",
    clientCoordinator: "",
    destination: "",
    paxCount: "",
    travelingStartDate: "",
    travelingEndDate: "",
    modeOfBidding: "",
    leadType: "",
    domesticInternational: "",
    rfqStatus: "New",
    uploadDocuments: [],
  });

  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactError, setContactError] = useState(null);

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [clientCodeSearch, setClientCodeSearch] = useState("");

  const leadTypeOptions = ["Corporate", "Individual", "Group", "Other"];
  const modeOfBiddingOptions = ["Email", "Portal", "Direct", "Other"];
  const domesticInternationalOptions = ["Domestic", "International"];
  const rfqStatusOptions = ["New", "Under Process", "Lose", "Won"];

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(EMPLOYEE_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        const capitalizedData = data.map(emp => ({
          ...emp,
          name: capitalizeName(emp.name)
        }));
        setEmployees(capitalizedData);
        setFilteredEmployees(capitalizedData);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    
    fetchEmployees();
  }, []);

  // Fetch contacts (client coordinators)
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      setContactError(null);
      try {
        const response = await fetch(COMPANY_API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Contacts API Response:", result);
        
        let contactNames = [];
        
        if (result?.data?.contacts && Array.isArray(result.data.contacts)) {
          contactNames = result.data.contacts
            .map(contact => contact?.name)
            .filter(name => name && name.trim() !== "")
            .map(name => capitalizeName(name));
        }
        
        const uniqueContacts = [...new Set(contactNames)];
        
        console.log("Extracted contact names:", uniqueContacts);
        setContacts(uniqueContacts);
        setFilteredContacts(uniqueContacts);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setContactError(err.message);
        setContacts([]);
        setFilteredContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };
    
    fetchContacts();
  }, []);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(CLIENT_API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const clientNames = result?.data?.companies?.map(client => ({
          name: capitalizeName(client.name),
          code: client.client_code || ""
        }));

        setClients(clientNames);
        setFilteredClients(clientNames);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setClients([]);
        setFilteredClients([]);
      }
    };

    fetchClients();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && leadToEdit) {
      let travelingStartDate = "";
      let travelingEndDate = "";
      
      if (leadToEdit.travelingDate && leadToEdit.travelingDate.includes("/")) {
        const dates = leadToEdit.travelingDate.split("/");
        
        if (dates[0]) {
          const [day, month, year] = dates[0].split("-");
          travelingStartDate = `${year}-${month}-${day}`;
        }
        
        if (dates[1]) {
          const [day, month, year] = dates[1].split("-");
          travelingEndDate = `${year}-${month}-${day}`;
        }
      } else if (leadToEdit.travelingDate) {
        const [day, month, year] = leadToEdit.travelingDate.split("-");
        travelingStartDate = `${year}-${month}-${day}`;
      }
      
      setFormData({
        dateOfRfqReceive: leadToEdit.dateOfRfqReceive || "",
        clientName: capitalizeName(leadToEdit.clientName || ""),
        clientCode: leadToEdit.clientCode || "",
        salesPerson: capitalizeName(leadToEdit.salesPerson || ""),
        clientCoordinator: capitalizeName(leadToEdit.clientCoordinator || ""),
        destination: leadToEdit.destination || "",
        paxCount: leadToEdit.paxCount || "",
        travelingStartDate: travelingStartDate,
        travelingEndDate: travelingEndDate,
        modeOfBidding: leadToEdit.modeOfBidding || "",
        leadType: leadToEdit.leadType || "",
        domesticInternational: leadToEdit.domesticInternational || "",
        rfqStatus: leadToEdit.rfqStatus || "New",
      });
      
      setEmployeeSearch(capitalizeName(leadToEdit.salesPerson || ""));
      setContactSearch(capitalizeName(leadToEdit.clientCoordinator || ""));
      setClientSearch(capitalizeName(leadToEdit.clientName || ""));
      setClientCodeSearch(leadToEdit.clientCode || "");
      
      if (leadToEdit.uploadDocuments) {
        setExistingFiles(leadToEdit.uploadDocuments);
      }
      
      if (leadToEdit.clientCode) {
        fetchDivisions(leadToEdit.clientCode);
      }
    } else {
      setFormData({
        dateOfRfqReceive: "",
        clientName: "",
        clientCode: "",
        salesPerson: "",
        clientCoordinator: "",
        destination: "",
        paxCount: "",
        travelingStartDate: "",
        travelingEndDate: "",
        modeOfBidding: "",
        leadType: "",
        domesticInternational: "",
        rfqStatus: "New",
      });
      setEmployeeSearch("");
      setContactSearch("");
      setClientSearch("");
      setClientCodeSearch("");
      setExistingFiles([]);
      setFiles([]);
      setFilesToRemove([]);
      setDivisions([]);
      setFilteredDivisions([]);
    }
  }, [leadToEdit, isEditMode]);

  // Filter employees based on search
  useEffect(() => {
    if (employeeSearch) {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(employeeSearch.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [employeeSearch, employees]);

  // Filter contacts based on search
  useEffect(() => {
    if (contactSearch) {
      const filtered = contacts.filter(contact =>
        contact.toLowerCase().includes(contactSearch.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [contactSearch, contacts]);

  // Filter clients based on search
  useEffect(() => {
    if (clientSearch) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(clientSearch.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [clientSearch, clients]);

  // Filter divisions based on search
  useEffect(() => {
    if (clientCodeSearch) {
      const filtered = divisions.filter(division =>
        division.subDivisionCode.toLowerCase().includes(clientCodeSearch.toLowerCase())
      );
      setFilteredDivisions(filtered);
    } else {
      setFilteredDivisions(divisions);
    }
  }, [clientCodeSearch, divisions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = existingFiles[index];
    setFilesToRemove(prev => [...prev, fileToRemove]);
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Employee handlers
  const handleEmployeeSelect = (employee) => {
    const capitalizedName = capitalizeName(employee.name);
    setFormData(prev => ({ ...prev, salesPerson: capitalizedName }));
    setEmployeeSearch(capitalizedName);
    setShowEmployeeDropdown(false);
  };

  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value;
    setEmployeeSearch(value);
    setFormData(prev => ({ ...prev, salesPerson: value }));
    setShowEmployeeDropdown(true);
  };

  // Contact (Client Coordinator) handlers
  const handleContactSelect = (contact) => {
    const capitalizedContact = capitalizeName(contact);
    setFormData(prev => ({ ...prev, clientCoordinator: capitalizedContact }));
    setContactSearch(capitalizedContact);
    setShowContactDropdown(false);
  };

  const handleContactSearchChange = (e) => {
    const value = e.target.value;
    setContactSearch(value);
    setFormData(prev => ({ ...prev, clientCoordinator: value }));
    setShowContactDropdown(true);
  };

  // Client handlers
  const handleClientSelect = async (client) => {
    const capitalizedClient = capitalizeName(client.name);
    setFormData(prev => ({ 
      ...prev, 
      clientName: capitalizedClient,
      clientCode: client.code || ""
    }));
    setClientSearch(capitalizedClient);
    setClientCodeSearch(client.code || "");
    setShowClientDropdown(false);
    
    if (client.code) {
      await fetchDivisions(client.code);
    } else {
      setDivisions([]);
      setFilteredDivisions([]);
    }
  };

  const handleClientSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    setFormData(prev => ({ ...prev, clientName: value }));
    setShowClientDropdown(true);
  };

  // Division handlers
  const handleDivisionSelect = (division) => {
    setFormData(prev => ({ ...prev, clientCode: division.subDivisionCode }));
    setClientCodeSearch(division.subDivisionCode);
    setShowDivisionDropdown(false);
  };

  const handleClientCodeSearchChange = (e) => {
    setClientCodeSearch(e.target.value);
    setFormData(prev => ({ ...prev, clientCode: e.target.value }));
    setShowDivisionDropdown(true);
  };

  // Create new contact
  const createEmptyContact = async (val) => {
    const capitalizedVal = capitalizeName(val);
    console.log("Creating new contact:", capitalizedVal);
    const obj = {
      name: capitalizedVal,
      phone: "NA",
      email: "NA",
      additional_number: "NA",
      companies: "NA",
      status: "Active"
    };

    try {
      await api.createContact(obj);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  };

  // Create new company
  const createEmptyCompanies = async (val) => {
    const capitalizedVal = capitalizeName(val);
    const obj = {
      clientName: capitalizedVal,
      email: "-",
      panNumber: "-",
      address: "-",
      pinCode: "-",
      state: "",
      clientType: "Individual",
      contactPerson: "-",
      contactNumber: "-",
      cinNumber: "-",
      website: "-",
      industryType: "-",
      businessType: "-",
      contracts: "-",
      relationManager: "-",
      client_code: "-",
      status: "Active"
    };

    try {
      await apiCo.createCompany(obj);
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  // Fetch divisions
  const fetchDivisions = async (parentClientCode) => {
    try {
      const res = await axios.get(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/divisions/${parentClientCode}`
      );

      if (res.data.success) {
        setDivisions(res.data.data);
        setFilteredDivisions(res.data.data);
      } else {
        setDivisions([]);
        setFilteredDivisions([]);
      }
    } catch (err) {
      console.error("Error fetching divisions:", err);
      setDivisions([]);
      setFilteredDivisions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.travelingEndDate && formData.travelingStartDate && 
        new Date(formData.travelingEndDate) < new Date(formData.travelingStartDate)) {
      alert("End date cannot be before start date");
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      const submissionData = {
        ...formData,
        clientName: capitalizeName(formData.clientName),
        salesPerson: capitalizeName(formData.salesPerson),
        clientCoordinator: capitalizeName(formData.clientCoordinator)
      };
      
      Object.entries(submissionData).forEach(([key, value]) => {
        if (key !== "travelingStartDate" && key !== "travelingEndDate") {
          formDataToSend.append(key, value);
        }
      });
      
      const travelingDate = formData.travelingEndDate 
        ? `${formatDateForDisplay(formData.travelingStartDate)}/${formatDateForDisplay(formData.travelingEndDate)}`
        : formatDateForDisplay(formData.travelingStartDate);
      
      formDataToSend.append('travelingDate', travelingDate);
      
      if (formData.travelingStartDate && formData.travelingEndDate) {
        const startDate = new Date(formData.travelingStartDate);
        const endDate = new Date(formData.travelingEndDate);
        const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
        const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        const nightCount = dayCount - 1;
        
        formDataToSend.append('dayCount', dayCount);
        formDataToSend.append('nightCount', nightCount);
      }
      
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      if (isEditMode) {
        filesToRemove.forEach(file => {
          formDataToSend.append('filesToRemove', file);
        });
      }

      let response;
      
      if (isEditMode) {
        response = await axios.put(
          `${API_URL}/${leadToEdit.id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
        const capitalizedResponse = {
          ...response.data,
          clientName: capitalizeName(response.data.clientName),
          salesPerson: capitalizeName(response.data.salesPerson),
          clientCoordinator: capitalizeName(response.data.clientCoordinator)
        };
        updateLead(capitalizedResponse);
      } else {
        response = await axios.post(API_URL, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        const capitalizedResponse = {
          ...response.data,
          clientName: capitalizeName(response.data.clientName),
          salesPerson: capitalizeName(response.data.salesPerson),
          clientCoordinator: capitalizeName(response.data.clientCoordinator)
        };
        addNewLead(capitalizedResponse);
      }
      
      onClose();
      
      setFormData({
        dateOfRfqReceive: "",
        clientName: "",
        clientCode: "",
        salesPerson: "",
        clientCoordinator: "",
        destination: "",
        paxCount: "",
        travelingStartDate: "",
        travelingEndDate: "",
        modeOfBidding: "",
        leadType: "",
        domesticInternational: "",
        rfqStatus: "New",
      });
      setEmployeeSearch("");
      setContactSearch("");
      setClientSearch("");
      setClientCodeSearch("");
      setFiles([]);
      setExistingFiles([]);
      setFilesToRemove([]);
      setDivisions([]);
      setFilteredDivisions([]);
    } catch (error) {
      console.error("Error saving lead:", error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} lead. Please try again.`);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white p-6 overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-2xl">
            &times;
          </button>
        </div>

        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Date Of RFQ Receive</label>
              <input
                type="date"
                name="dateOfRfqReceive"
                value={formData.dateOfRfqReceive}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Client Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={handleClientSearchChange}
                  onFocus={() => setShowClientDropdown(true)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                  placeholder="Search or select client"
                />
                {showClientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleClientSelect(client)}
                        >
                          {client.name}
                        </div>
                      ))
                    ) : clientSearch ? (
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 bg-blue-50"
                        onClick={() => {
                          handleClientSelect({name: clientSearch, code: ""});
                          createEmptyCompanies(clientSearch);
                        }}
                      >
                        + Add "{capitalizeName(clientSearch)}" as new client
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No clients found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Client Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientCodeSearch}
                  onChange={handleClientCodeSearchChange}
                  onFocus={() => setShowDivisionDropdown(true)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="Enter or select client code"
                />
                {showDivisionDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredDivisions.length > 0 ? (
                      filteredDivisions.map((division, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleDivisionSelect(division)}
                        >
                          {division.subDivisionCode}
                        </div>
                      ))
                    ) : (
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, clientCode: formData.clientCode }));
                          setClientCodeSearch(formData.clientCode);
                          setShowDivisionDropdown(false);
                        }}
                      >
                        {formData.clientCode || "No division codes available"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block font-medium">Sales Person</label>
              <div className="relative">
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={handleEmployeeSearchChange}
                  onFocus={() => setShowEmployeeDropdown(true)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                  placeholder="Search or select sales person"
                />
                {showEmployeeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(employee => (
                        <div
                          key={employee.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          {employee.photo && (
                            <img
                              src={employee.photo}
                              alt={employee.name}
                              className="w-8 h-8 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            {employee.position && (
                              <div className="text-xs text-gray-500">{employee.position}</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : employeeSearch ? (
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 bg-blue-50"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, salesPerson: capitalizeName(employeeSearch) }));
                          setEmployeeSearch(capitalizeName(employeeSearch));
                          setShowEmployeeDropdown(false);
                        }}
                      >
                        + Add "{capitalizeName(employeeSearch)}" as new employee
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No employees found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Client Coordinator</label>
              <div className="relative">
                <input
                  type="text"
                  value={contactSearch}
                  onChange={handleContactSearchChange}
                  onFocus={() => setShowContactDropdown(true)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                  placeholder="Search or select client coordinator"
                />
                {showContactDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {loadingContacts ? (
                      <div className="px-4 py-2 text-gray-500">Loading...</div>
                    ) : filteredContacts.length > 0 ? (
                      filteredContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleContactSelect(contact)}
                        >
                          {contact}
                        </div>
                      ))
                    ) : contactSearch ? (
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 bg-blue-50"
                        onClick={() => {
                          handleContactSelect(contactSearch);
                          createEmptyContact(contactSearch);
                        }}
                      >
                        + Add "{capitalizeName(contactSearch)}" as new contact
                      </div>
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No contacts found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block font-medium">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Project Size</label>
              <input
                type="number"
                name="paxCount"
                value={formData.paxCount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium">Project Duration</label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="travelingStartDate"
                    value={formData.travelingStartDate}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    name="travelingEndDate"
                    value={formData.travelingEndDate}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      formData.travelingEndDate && formData.travelingStartDate && 
                      new Date(formData.travelingEndDate) < new Date(formData.travelingStartDate) 
                        ? 'border-red-500' 
                        : ''
                    }`}
                    min={formData.travelingStartDate || ''}
                  />
                </div>
              </div>
              {formData.travelingEndDate && formData.travelingStartDate && 
              new Date(formData.travelingEndDate) < new Date(formData.travelingStartDate) && (
                <div className="mt-2 text-sm text-red-600">
                  End date cannot be before start date
                </div>
              )}
              {formData.travelingStartDate && formData.travelingEndDate && 
              new Date(formData.travelingEndDate) >= new Date(formData.travelingStartDate) && (
                <div className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const startDate = new Date(formData.travelingStartDate);
                    const endDate = new Date(formData.travelingEndDate);
                    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
                    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                    const nightCount = dayCount - 1;
                    
                    return `${nightCount} Nights / ${dayCount} Days`;
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Mode of Bidding</label>
              <select
                name="modeOfBidding"
                value={formData.modeOfBidding}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
                required
              >
                <option value="">Select</option>
                {modeOfBiddingOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Lead Type</label>
              <select
                name="leadType"
                value={formData.leadType}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
                required
              >
                <option value="">Select</option>
                {leadTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Domestic/International</label>
              <select
                name="domesticInternational"
                value={formData.domesticInternational}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
                required
              >
                <option value="">Select</option>
                {domesticInternationalOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">RFQ Status</label>
              <select
                name="rfqStatus"
                value={formData.rfqStatus}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                {rfqStatusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium">Documents Upload</label>
            <input
              type="file"
              className="w-full border rounded px-3 py-2 mt-1"
              multiple
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <div className="mt-2 text-sm">
                {files.length} new file(s) selected
              </div>
            )}
          </div>

          {isEditMode && existingFiles.length > 0 && (
            <div>
              <label className="block font-medium">Existing Documents</label>
              <div className="border rounded p-2 mt-1">
                {existingFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Document {index + 1}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {isEditMode ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Management Component (unchanged)
const TaskManagementDrawer = ({
  isOpen,
  onClose,
  selectedLead,
  tasks,
  setTasks,
  taskFormData,
  setTaskFormData,
  editingTaskId,
  setEditingTaskId
}) => {
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...taskFormData,
      leadId: selectedLead.id,
      leadName: selectedLead.clientName
    };

    if (editingTaskId) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { ...task, ...taskData, id: editingTaskId, updatedAt: new Date().toISOString() }
          : task
      ));
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
    }

    resetTaskForm();
  };

  const handleEditTask = (task) => {
    setTaskFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo
    });
    setEditingTaskId(task.id);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: ""
    });
    setEditingTaskId(null);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border border-green-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle size={16} className="text-green-500" />;
      case "In Progress": return <Clock size={16} className="text-blue-500" />;
      case "Pending": return <AlertCircle size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-50 text-green-700 border border-green-200";
      case "In Progress": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Pending": return "bg-orange-50 text-orange-700 border border-orange-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (!isOpen || !selectedLead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
      <div className="bg-white h-full w-full max-w-4xl p-6 overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-xl font-semibold">Task Management</h2>
            <p className="text-gray-600">Lead: {selectedLead.clientName}</p>
          </div>
          <button 
            onClick={() => {
              onClose();
              resetTaskForm();
            }} 
            className="text-gray-600 hover:text-black text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">
            {editingTaskId ? "Edit Task" : "Add New Task"}
          </h3>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={taskFormData.title}
                  onChange={handleTaskInputChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={taskFormData.dueDate}
                  onChange={handleTaskInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2 mt-1"
                rows="3"
                value={taskFormData.description}
                onChange={handleTaskInputChange}
                placeholder="Enter task description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium">Priority</label>
                <select
                  name="priority"
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={taskFormData.priority}
                  onChange={handleTaskInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Status</label>
                <select
                  name="status"
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={taskFormData.status}
                  onChange={handleTaskInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Assigned To</label>
                <input
                  type="text"
                  name="assignedTo"
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={taskFormData.assignedTo}
                  onChange={handleTaskInputChange}
                  placeholder="Assign to..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              {editingTaskId && (
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                {editingTaskId ? "Update Task" : "Add Task"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Tasks ({tasks.length})</h3>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">
                {tasks.filter(t => t.status === 'Completed').length} completed
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {tasks.filter(t => t.status === 'Pending').length} pending
              </span>
            </div>
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{task.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)} flex items-center gap-1`}>
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.assignedTo && (
                          <div>Assigned to: <span className="font-medium">{task.assignedTo}</span></div>
                        )}
                        <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleEditTask(task)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                        title="Edit Task"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm">Add a task to get started with task management</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Statistics Component - Compact Version
const DashboardStats = ({ leads }) => {
  const totalLeads = leads.length;
  const wonLeads = leads.filter(lead => lead.rfqStatus === "Won").length;
  const lostLeads = leads.filter(lead => lead.rfqStatus === "Lose").length;
  const underProcess = leads.filter(lead => lead.rfqStatus === "Under Process").length;
  const newLeads = leads.filter(lead => lead.rfqStatus === "New").length;
  
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalPax = leads.reduce((sum, lead) => sum + (parseInt(lead.paxCount) || 0), 0);

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50 border-blue-200"
    },
    {
      label: "Won Leads",
      value: wonLeads,
      icon: <Award className="w-5 h-5 text-green-500" />,
      color: "bg-green-50 border-green-200"
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-50 border-purple-200"
    },
    {
      label: "Total Pax",
      value: totalPax,
      icon: <Briefcase className="w-5 h-5 text-orange-500" />,
      color: "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((stat, index) => (
        <div key={index} className={`border rounded-lg p-3 ${stat.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">{stat.value}</p>
            </div>
            <div className="p-1.5 bg-white rounded-full shadow-sm">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Chart Components - Smaller Versions
const StatusDistributionChart = ({ leads }) => {
  const statusCounts = {
    New: leads.filter(lead => lead.rfqStatus === "New").length,
    "Under Process": leads.filter(lead => lead.rfqStatus === "Under Process").length,
    Lose: leads.filter(lead => lead.rfqStatus === "Lose").length,
    Won: leads.filter(lead => lead.rfqStatus === "Won").length
  };

  const data = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Leads by Status',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Status Distribution',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

const MonthlyLeadsChart = ({ leads }) => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: month.getMonth(),
      year: month.getFullYear(),
      label: `${monthNames[month.getMonth()]} ${month.getFullYear()}`
    });
  }

  const monthlyData = months.map(({ month, year }) => {
    const count = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === month && leadDate.getFullYear() === year;
    }).length;
    return count;
  });

  const data = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'New Leads',
        data: monthlyData,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 10
          },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Monthly Leads Trend',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 9
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 9
          }
        }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Line data={data} options={options} />
    </div>
  );
};

const LeadTypeChart = ({ leads }) => {
  const leadTypeCount = {};
  leads.forEach(lead => {
    if (lead.leadType) {
      leadTypeCount[lead.leadType] = (leadTypeCount[lead.leadType] || 0) + 1;
    }
  });

  const colors = [
    'rgba(147, 51, 234, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(234, 179, 8, 0.8)'
  ];

  const data = {
    labels: Object.keys(leadTypeCount),
    datasets: [
      {
        label: 'Leads by Type',
        data: Object.values(leadTypeCount),
        backgroundColor: colors.slice(0, Object.keys(leadTypeCount).length),
        borderColor: colors.slice(0, Object.keys(leadTypeCount).length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Lead Types',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[200px]">
      <Pie data={data} options={options} />
    </div>
  );
};

const BiddingMethodChart = ({ leads }) => {
  const methodCount = {};
  leads.forEach(lead => {
    if (lead.modeOfBidding) {
      methodCount[lead.modeOfBidding] = (methodCount[lead.modeOfBidding] || 0) + 1;
    }
  });

  const colors = [
    'rgba(236, 72, 153, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(251, 146, 60, 0.8)',
    'rgba(52, 211, 153, 0.8)'
  ];

  const data = {
    labels: Object.keys(methodCount),
    datasets: [
      {
        label: 'Leads by Bidding Method',
        data: Object.values(methodCount),
        backgroundColor: colors.slice(0, Object.keys(methodCount).length),
        borderColor: colors.slice(0, Object.keys(methodCount).length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Bidding Methods',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[200px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

const DomesticInternationalChart = ({ leads }) => {
  const typeCount = {
    Domestic: leads.filter(lead => lead.domesticInternational === "Domestic").length,
    International: leads.filter(lead => lead.domesticInternational === "International").length
  };

  const data = {
    labels: Object.keys(typeCount),
    datasets: [
      {
        label: 'Leads by Type',
        data: Object.values(typeCount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 10
          },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Domestic vs International',
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: {
          bottom: 5
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 9
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[200px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default function LeadsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  
  // Task Management States
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    assignedTo: ""
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Column management state
  const [columns, setColumns] = useState([
    { id: 'dateOfRfqReceive', label: 'Date Of RFQ Receive', visible: true, order: 0 },
    { id: 'clientName', label: 'Client Name', visible: true, order: 1 },
    { id: 'clientCode', label: 'Client Code', visible: true, order: 2 },
    { id: 'salesPerson', label: 'Sales Person', visible: true, order: 3 },
    { id: 'clientCoordinator', label: 'Client Coordinator', visible: true, order: 4 },
    { id: 'destination', label: 'Destination', visible: true, order: 5 },
    { id: 'paxCount', label: 'Project Size', visible: true, order: 6 },
    { id: 'travelingDate', label: 'Project Duration', visible: true, order: 7 },
    { id: 'modeOfBidding', label: 'Mode of Bidding', visible: true, order: 8 },
    { id: 'leadType', label: 'Lead Type', visible: true, order: 9 },
    { id: 'domesticInternational', label: 'Domestic/International', visible: true, order: 10 },
    { id: 'rfqStatus', label: 'RFQ Status', visible: true, order: 11 },
    { id: 'actions', label: 'Action', visible: true, order: 12 }
  ]);
  
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);
  
  // State for action dropdown
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  // State for showing/hiding dashboard
  const [showDashboard, setShowDashboard] = useState(true);

  const rfqStatusOptions = ["New", "Under Process", "Lose", "Won"];

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(API_URL);
        const capitalizedLeads = response.data.map(lead => ({
          ...lead,
          clientName: capitalizeName(lead.clientName),
          salesPerson: capitalizeName(lead.salesPerson),
          clientCoordinator: capitalizeName(lead.clientCoordinator)
        }));
        setLeads(capitalizedLeads);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch leads");
        setLoading(false);
        console.error(err);
      }
    };

    fetchLeads();
    
    const savedColumns = localStorage.getItem('leadsTableColumns');
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        if (Array.isArray(parsedColumns) && parsedColumns.length > 0) {
          setColumns(parsedColumns);
        }
      } catch (e) {
        console.error("Error parsing saved columns:", e);
      }
    }
    
    const handleClickOutside = () => {
      setActiveActionMenu(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem('leadsTableColumns', JSON.stringify(columns));
    }
  }, [columns]);

  const addNewLead = (newLead) => {
    setLeads(prevLeads => [newLead, ...prevLeads]);
  };

  const updateLead = (updatedLead) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
  };

  const deleteLead = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      setActiveActionMenu(null);
    } catch (err) {
      console.error("Failed to delete lead:", err);
      alert("Failed to delete lead. Please try again.");
    }
  };

  const handleEditClick = (lead) => {
    setLeadToEdit(lead);
    setIsDrawerOpen(true);
    setActiveActionMenu(null);
  };

  const handleAddClick = () => {
    setLeadToEdit(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setLeadToEdit(null);
  };

  const handleOpenTasks = (lead) => {
    setSelectedLead(lead);
    const mockTasks = [
      {
        id: 1,
        title: "Follow up on RFQ",
        description: "Contact client to discuss RFQ requirements and timeline",
        dueDate: "2024-01-18",
        priority: "High",
        status: "Pending",
        assignedTo: lead.salesPerson,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Prepare proposal document",
        description: "Create detailed proposal based on RFQ requirements",
        dueDate: "2024-01-25",
        priority: "Medium",
        status: "In Progress",
        assignedTo: "Proposal Team",
        createdAt: new Date().toISOString()
      }
    ];
    setTasks(mockTasks);
    setIsTaskDrawerOpen(true);
    setActiveActionMenu(null);
  };

  const closeTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setSelectedLead(null);
    setTaskFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: ""
    });
    setEditingTaskId(null);
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      setUpdatingStatusId(leadId);
      
      const response = await axios.patch(
        `${API_URL}/${leadId}/status`,
        { rfqStatus: newStatus }
      );

      setLeads(prevLeads =>
        prevLeads.map(lead => lead.id === leadId ? response.data : lead)
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const toggleActionMenu = (e, leadId) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === leadId ? null : leadId);
  };

  const toggleColumnVisibility = (columnId) => {
    setColumns(prevColumns => 
      prevColumns.map(column =>
        column.id === columnId ? { ...column, visible: !column.visible } : column
      )
    );
  };

  const handleDragStart = (e, column) => {
    setDraggedColumn(column);
    e.dataTransfer.setData('text/plain', column.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn.id === targetColumn.id) {
      setDraggedColumn(null);
      return;
    }

    setColumns(prevColumns => {
      const draggedIndex = prevColumns.findIndex(col => col.id === draggedColumn.id);
      const targetIndex = prevColumns.findIndex(col => col.id === targetColumn.id);
      
      const newColumns = [...prevColumns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      
      return newColumns;
    });
    
    setDraggedColumn(null);
  };

  const resetColumns = () => {
    setColumns([
      { id: 'dateOfRfqReceive', label: 'Date Of RFQ Receive', visible: true, order: 0 },
      { id: 'clientName', label: 'Client Name', visible: true, order: 1 },
      { id: 'clientCode', label: 'Client Code', visible: true, order: 2 },
      { id: 'salesPerson', label: 'Sales Person', visible: true, order: 3 },
      { id: 'clientCoordinator', label: 'Client Coordinator', visible: true, order: 4 },
      { id: 'destination', label: 'Destination', visible: true, order: 5 },
      { id: 'paxCount', label: 'Project Size', visible: true, order: 6 },
      { id: 'travelingDate', label: 'Project Duration', visible: true, order: 7 },
      { id: 'modeOfBidding', label: 'Mode of Bidding', visible: true, order: 8 },
      { id: 'leadType', label: 'Lead Type', visible: true, order: 9 },
      { id: 'domesticInternational', label: 'Domestic/International', visible: true, order: 10 },
      { id: 'rfqStatus', label: 'RFQ Status', visible: true, order: 11 },
      { id: 'actions', label: 'Action', visible: true, order: 12 }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Won":
        return "bg-green-500";
      case "Lose":
        return "bg-red-500";
      case "Under Process":
        return "bg-yellow-500";
      case "New":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="p-4">Loading leads...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const visibleColumns = columns.filter(column => column.visible);

  return (
    <>
      <div className="p-4 rounded-md">
        <div className='flex justify-between align-center'>
          <h6 className='!font-bold text-[22px] mb-5'>Leads Dashboard</h6>
          <p className='mb-0 text-[10px] flex gap-1'>
            <img src={bookImage} className='mt-0 w-[15px] h-[15px]' alt="book" />
            Learn More About The Sale
          </p>
        </div>

        {/* Toggle Dashboard/Table View */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {showDashboard ? (
              <>
                <BarChart3 size={14} />
                Hide Dashboard
              </>
            ) : (
              <>
                <Activity size={14} />
                Show Dashboard
              </>
            )}
          </button>
        </div>

        {/* Dashboard Section */}
        {showDashboard && (
          <>
            <DashboardStats leads={leads} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              <MonthlyLeadsChart leads={leads} />
              <StatusDistributionChart leads={leads} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <LeadTypeChart leads={leads} />
              <BiddingMethodChart leads={leads} />
              <DomesticInternationalChart leads={leads} />
            </div>
          </>
        )}
        
        <div className="flex justify-between items-center mb-1 h-7">
          <input
            type="text"
            placeholder="Search Leads"
            className="border rounded px-2 text-[10px] h-6 w-1/3 leading-none"
          />

          <div className="flex items-center gap-1">
            <button className="border px-2 text-[10px] h-6 rounded leading-none">
              Sort
            </button>

            <input
              type="text"
              value="06/11/2025 - 06/17/2025"
              className="border px-2 text-[10px] h-6 rounded leading-none"
              readOnly
            />

            <button
              className="bg-purple-100 text-purple-700 px-2 text-[10px] h-6 rounded font-medium leading-none"
              onClick={() => setIsManagingColumns(true)}
            >
              Manage Columns
            </button>

            <button
              className="bg-red-500 text-white px-2 text-[10px] h-6 rounded leading-none"
              onClick={handleAddClick}
            >
              Add Leads
            </button>
          </div>
        </div>

        {/* Column Management Modal */}
        {isManagingColumns && (
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
            onClick={() => setIsManagingColumns(false)}
          >
            <div 
              className="bg-white p-6 rounded-md shadow-xl w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Manage Columns</h3>
              <p className="text-sm text-gray-500 mb-4">Drag to reorder columns or toggle visibility</p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {columns.map((column, index) => (
                  <div
                    key={column.id}
                    className={`flex items-center justify-between p-3 border rounded cursor-move ${
                      draggedColumn?.id === column.id ? 'opacity-50 bg-blue-50' : 'bg-white'
                    } hover:bg-gray-50 transition-colors`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column)}
                  >
                    <div className="flex items-center">
                      <GripVertical size={18} className="text-gray-400 mr-3" />
                      <span className="text-sm">{column.label}</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => toggleColumnVisibility(column.id)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full ${column.visible ? 'bg-blue-500' : 'bg-gray-300'} transition-colors duration-200`} />
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${column.visible ? 'transform translate-x-4' : ''}`} />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={resetColumns}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => setIsManagingColumns(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-[9px] text-left leading-none border-collapse border">
            <thead className="bg-gray-100">
              <tr className="h-6">
                <th className="px-2 py-0.5 whitespace-nowrap font-semibold h-6 align-middle">
                  SR.NO
                </th>
                {visibleColumns.map(column => (
                  <th
                    key={column.id}
                    className="px-2 py-0.5 whitespace-nowrap font-semibold h-6 align-middle"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {leads.map((lead, i) => (
                <tr
                  key={lead.id}
                  className="border-b hover:bg-gray-50 h-6"
                >
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                    {i+1}
                  </td>
                  
                  {visibleColumns.map(column => {
                    switch(column.id) {
                      case 'dateOfRfqReceive':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            <Link 
                              to={`/InsideLeadPage/${lead.id}`} 
                              state={{ 
                                uploadDocuments: lead.uploadDocuments,
                                leadData: lead
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              {lead.dateOfRfqReceive}
                            </Link>
                          </td>
                        );
                      case 'clientName':
                        return (
                          <td key={column.id} className="px-2 py-0.5 font-semibold whitespace-nowrap align-middle">
                            {lead.clientName}
                          </td>
                        );
                      case 'clientCode':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.clientCode}
                          </td>
                        );
                      case 'salesPerson':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.salesPerson}
                          </td>
                        );
                      case 'clientCoordinator':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.clientCoordinator}
                          </td>
                        );
                      case 'destination':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.destination}
                          </td>
                        );
                      case 'paxCount':
                        return (
                          <td key={column.id} className="px-2 py-0.5 text-center whitespace-nowrap align-middle">
                            {lead.paxCount}
                          </td>
                        );
                      case 'travelingDate':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.travelingDate}
                          </td>
                        );
                      case 'modeOfBidding':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.modeOfBidding}
                          </td>
                        );
                      case 'leadType':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.leadType}
                          </td>
                        );
                      case 'domesticInternational':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            {lead.domesticInternational}
                          </td>
                        );
                      case 'rfqStatus':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle">
                            <select
                              value={lead.rfqStatus}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              disabled={updatingStatusId === lead.id}
                              className={`text-[8px] px-1 py-0.5 rounded text-white border-0 font-semibold ${getStatusColor(lead.rfqStatus)}`}
                              style={{ fontSize: '8px', padding: '2px 4px' }}
                            >
                              {rfqStatusOptions.map(status => (
                                <option key={status} value={status} className="text-black">
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      case 'actions':
                        return (
                          <td key={column.id} className="px-2 py-0.5 whitespace-nowrap align-middle relative">
                            <button 
                              onClick={(e) => toggleActionMenu(e, lead.id)}
                              className="text-gray-600 p-[2px] hover:bg-gray-100 rounded"
                            >
                              <MoreVertical size={10} />
                            </button>
                            
                            {activeActionMenu === lead.id && (
                              <div className="absolute right-0 mt-1 w-24 bg-white border rounded-md shadow-lg z-10 py-1">
                                <button
                                  onClick={() => handleEditClick(lead)}
                                  className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Pencil size={8} className="text-blue-600" />
                                  Edit
                                </button>
                                
                                <button
                                  onClick={() => handleOpenTasks(lead)}
                                  className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Calendar size={8} className="text-green-600" />
                                  Tasks
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this lead?')) {
                                      deleteLead(lead.id);
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 size={8} className="text-red-600" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      default:
                        return null;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LeadFormDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        addNewLead={addNewLead}
        updateLead={updateLead}
        leadToEdit={leadToEdit}
      />

      <TaskManagementDrawer
        isOpen={isTaskDrawerOpen}
        onClose={closeTaskDrawer}
        selectedLead={selectedLead}
        tasks={tasks}
        setTasks={setTasks}
        taskFormData={taskFormData}
        setTaskFormData={setTaskFormData}
        editingTaskId={editingTaskId}
        setEditingTaskId={setEditingTaskId}
      />
    </>
  );
}