import React, { useEffect, useState } from 'react';
import { Eye, Plus, X, Mail, Phone, MapPin, Calendar, User, Briefcase, 
  DollarSign, FileText, BookOpen, CreditCard, Users, Globe, 
  Shield, Home, Award, Clock, CheckCircle, XCircle, Download, Eye as EyeIcon,
  Building2, GraduationCap, Heart, PhoneCall, IdCard, Key, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import AddEmployeeModal from './modals/AddEmployeeModal';
import { Link } from "react-router-dom";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/forms/list');
        const data = await res.json();

        if (res.ok) {
          setEmployees(data.employees || []);
        } else {
          throw new Error(data.error || 'Failed to fetch');
        }
      } catch (error) {
        console.error('Error fetching employee list:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  const openDrawer = (employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedEmployee(null);
    setActiveTab("personal");
  };

  const handleAddToCompany = (employee) => {
    setSelectedToAdd(employee);
    setOpen(true);
  };

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
  };

  const tabs = [
    { value: "personal", label: "Personal", icon: User },
    { value: "address", label: "Address", icon: Home },
    { value: "identity", label: "Identity", icon: IdCard },
    { value: "passport", label: "Passport", icon: Globe },
    { value: "bank", label: "Bank", icon: CreditCard },
    { value: "emergency", label: "Emergency", icon: Users },
    { value: "education", label: "Education", icon: BookOpen },
  ];

  const InfoRow = ({ icon: Icon, label, value, link }) => (
    <div className="flex items-start gap-2 p-1.5 border-b border-gray-100">
      <div className="p-0.5 bg-blue-50 rounded">
        <Icon size={10} className="text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-[8px] uppercase tracking-wider">{label}</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 text-[10px] hover:text-blue-600 transition">
            {value || "-"}
          </a>
        ) : (
          <p className="font-medium text-gray-800 text-[10px]">{value || "-"}</p>
        )}
      </div>
    </div>
  );

  const DocumentLink = ({ label, url }) => {
    if (!url) return null;
    return (
      <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded mb-1">
        <span className="text-[9px] text-gray-600">{label}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-[9px] flex items-center gap-1">
          <EyeIcon size={9} />
          View
        </a>
      </div>
    );
  };

  const Section = ({ title, icon: Icon, color, children }) => (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`p-0.5 bg-${color}-100 rounded`}>
          <Icon size={10} className={`text-${color}-600`} />
        </div>
        <h3 className="text-[10px] font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="pl-5">
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-full mx-auto min-h-screen bg-gray-50">
      <div className='flex align-center justify-between mb-4'>
        <h2 className="text-lg font-semibold text-gray-800">
          Employee Directory
        </h2>

        <Link
          to="/EMPForm"
          className="text-[10px] px-3 py-1 pb-0 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
        >
          EMP FORM
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 text-sm py-10">
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-10">
          No employee records found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
          <table className="min-w-full text-[10px] text-gray-700 border-collapse">
            <thead>
              <tr className="bg-[#f3f4f6] border-b border-gray-300 text-gray-700">
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Name</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Email</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Contact</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">PAN</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Aadhar</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Blood Group</th>
                <th className="px-3 py-2 text-center font-medium whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className={`border-b border-gray-200 hover:bg-[#f9fafb] transition ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfd]'
                  }`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    {emp.first_name} {emp.last_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{emp.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{emp.contact_number}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{emp.pan_number}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{emp.aadhar_number}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{emp.blood_group}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDrawer(emp)}
                        title="View Details"
                        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleAddToCompany(emp)}
                        title="Add to Company"
                        className="p-1 rounded hover:bg-green-100 text-green-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Right Side Drawer */}
      {drawerOpen && selectedEmployee && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={closeDrawer}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-100 to-gray-200 p-3 z-10 border-b">
              <button
                onClick={closeDrawer}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-2">
                <img
                  src={selectedEmployee?.photo_path || `https://ui-avatars.com/api/?name=${selectedEmployee?.first_name}+${selectedEmployee?.last_name}&background=random`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${selectedEmployee?.first_name}+${selectedEmployee?.last_name}&background=random` }}
                />
                <div>
                  <h2 className="text-sm font-bold text-gray-800">{selectedEmployee?.first_name} {selectedEmployee?.last_name}</h2>
                  <p className="text-gray-500 text-[9px]">ID: {selectedEmployee?.id}</p>
                </div>
              </div>
            </div>

            {/* Tabs - Wrap instead of scroll */}
            <div className="border-b bg-gray-50 sticky top-[60px] z-10">
              <div className="flex flex-wrap px-2 py-1 gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex items-center gap-1 px-2 py-1 text-[9px] font-medium transition-all rounded-md ${
                      activeTab === tab.value
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <tab.icon size={10} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-3 pb-6">
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div>
                  <Section title="Basic Information" icon={User} color="blue">
                    <InfoRow icon={User} label="Full Name" value={`${selectedEmployee?.title || ''} ${selectedEmployee?.first_name || ''} ${selectedEmployee?.last_name || ''}`} />
                    <InfoRow icon={Mail} label="Email" value={selectedEmployee?.email} link={`mailto:${selectedEmployee?.email}`} />
                    <InfoRow icon={Phone} label="Phone" value={selectedEmployee?.contact_number} link={`tel:${selectedEmployee?.contact_number}`} />
                    <InfoRow icon={Calendar} label="DOB" value={formatDate(selectedEmployee?.birth_date)} />
                    <InfoRow icon={Shield} label="Blood Group" value={selectedEmployee?.blood_group} />
                  </Section>

                  <Section title="Family Information" icon={Heart} color="red">
                    <InfoRow icon={User} label="Father's Name" value={selectedEmployee?.father_name} />
                    <InfoRow icon={User} label="Mother's Name" value={selectedEmployee?.mother_name} />
                  </Section>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === "address" && (
                <div>
                  <Section title="Address Information" icon={Home} color="orange">
                    <InfoRow icon={Home} label="House No" value={selectedEmployee?.house_number} />
                    <InfoRow icon={MapPin} label="Street" value={selectedEmployee?.address} />
                    <InfoRow icon={MapPin} label="City" value={selectedEmployee?.city} />
                    <InfoRow icon={MapPin} label="State" value={selectedEmployee?.state} />
                  </Section>
                  
                  <div className="bg-blue-50 rounded p-2 mt-2">
                    <p className="text-[8px] text-gray-600 mb-0.5">Complete Address</p>
                    <p className="text-[9px] text-gray-800">
                      {selectedEmployee?.house_number && `${selectedEmployee.house_number}, `}
                      {selectedEmployee?.address && `${selectedEmployee.address}, `}
                      {selectedEmployee?.city && `${selectedEmployee.city}, `}
                      {selectedEmployee?.state && selectedEmployee.state}
                    </p>
                  </div>
                </div>
              )}

              {/* Identity Tab */}
              {activeTab === "identity" && (
                <div>
                  <div className="bg-yellow-50 rounded p-2 mb-2 border border-yellow-100">
                    <h3 className="text-[10px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <CreditCard size={10} className="text-yellow-600" />
                      PAN Card
                    </h3>
                    <InfoRow icon={CreditCard} label="PAN Number" value={selectedEmployee?.pan_number} />
                    <DocumentLink label="PAN Document" url={selectedEmployee?.pan_document_path} />
                  </div>

                  <div className="bg-blue-50 rounded p-2 mb-2 border border-blue-100">
                    <h3 className="text-[10px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <IdCard size={10} className="text-blue-600" />
                      Aadhar Card
                    </h3>
                    <InfoRow icon={IdCard} label="Aadhar Number" value={selectedEmployee?.aadhar_number} />
                    <DocumentLink label="Aadhar Front" url={selectedEmployee?.aadhar_front_path} />
                    <DocumentLink label="Aadhar Back" url={selectedEmployee?.aadhar_back_path} />
                  </div>

                  <div className="bg-green-50 rounded p-2 border border-green-100">
                    <h3 className="text-[10px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Key size={10} className="text-green-600" />
                      UAN Information
                    </h3>
                    <InfoRow icon={Lock} label="UAN Number" value={selectedEmployee?.uan_number} />
                    <DocumentLink label="UAN Document" url={selectedEmployee?.uan_document_path} />
                  </div>
                </div>
              )}

              {/* Passport Tab - 2 Column Layout */}
              {activeTab === "passport" && (
                <div>
                  <Section title="Passport Details" icon={Globe} color="indigo">
                    <div className="grid grid-cols-2 gap-1">
                      <InfoRow icon={Globe} label="Passport Number" value={selectedEmployee?.passport_number} />
                      <InfoRow icon={User} label="Surname" value={selectedEmployee?.passport_surname} />
                      <InfoRow icon={User} label="Given Names" value={selectedEmployee?.passport_given_names} />
                      <InfoRow icon={Calendar} label="DOB" value={formatDate(selectedEmployee?.passport_dob)} />
                      <InfoRow icon={MapPin} label="Place of Birth" value={selectedEmployee?.passport_place_of_birth} />
                      <InfoRow icon={Globe} label="Nationality" value={selectedEmployee?.passport_nationality || "Indian"} />
                      <InfoRow icon={Calendar} label="Issue Date" value={formatDate(selectedEmployee?.passport_issue_date)} />
                      <InfoRow icon={Calendar} label="Expiry Date" value={formatDate(selectedEmployee?.passport_expire_date)} />
                      <InfoRow icon={MapPin} label="Place of Issue" value={selectedEmployee?.passport_place_of_issue} />
                      <InfoRow icon={User} label="Father's Name" value={selectedEmployee?.passport_father_name} />
                      <InfoRow icon={User} label="Mother's Name" value={selectedEmployee?.passport_mother_name} />
                      <InfoRow icon={User} label="Sex" value={selectedEmployee?.passport_sex} />
                    </div>
                  </Section>
                  <div className="mt-2">
                    <DocumentLink label="Passport Front" url={selectedEmployee?.passport_front_path} />
                    <DocumentLink label="Passport Back" url={selectedEmployee?.passport_back_path} />
                  </div>
                </div>
              )}

              {/* Bank Tab */}
              {activeTab === "bank" && (
                <div>
                  <Section title="Bank Account Details" icon={CreditCard} color="green">
                    <InfoRow icon={User} label="Account Holder" value={selectedEmployee?.bank_account_name} />
                    <InfoRow icon={CreditCard} label="Bank Name" value={selectedEmployee?.bank_name} />
                    <InfoRow icon={CreditCard} label="Account Number" value={selectedEmployee?.bank_account_number} />
                    <InfoRow icon={CreditCard} label="IFSC Code" value={selectedEmployee?.bank_ifsc} />
                    <InfoRow icon={MapPin} label="Branch" value={selectedEmployee?.bank_branch} />
                  </Section>
                  <DocumentLink label="Cancelled Cheque" url={selectedEmployee?.cancel_cheque_path} />
                </div>
              )}

              {/* Emergency Tab */}
              {activeTab === "emergency" && (
                <div>
                  <Section title="Emergency Contacts" icon={PhoneCall} color="red">
                    {selectedEmployee?.emergencyContacts && selectedEmployee.emergencyContacts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedEmployee.emergencyContacts.map((contact, idx) => (
                          <div key={contact.id || idx} className="bg-red-50 rounded p-2 border border-red-100">
                            <h4 className="font-semibold text-gray-800 text-[9px] mb-1">Contact {idx + 1}</h4>
                            <InfoRow icon={User} label="Name" value={contact.name} />
                            <InfoRow icon={Users} label="Relation" value={contact.relation} />
                            <InfoRow icon={Phone} label="Phone" value={contact.phone} link={`tel:${contact.phone}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500 text-[9px]">No emergency contacts found</div>
                    )}
                  </Section>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === "education" && (
                <div>
                  <Section title="Educational Documents" icon={GraduationCap} color="indigo">
                    <DocumentLink label="10th Certificate" url={selectedEmployee?.edu_10th_path} />
                    <DocumentLink label="12th Certificate" url={selectedEmployee?.edu_12th_path} />
                    <DocumentLink label="Graduation" url={selectedEmployee?.graduation_path} />
                    <DocumentLink label="Diploma" url={selectedEmployee?.diploma_path} />
                  </Section>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Employee Modal */}
      {open && (
        <AddEmployeeModal
          employee={selectedToAdd}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmployeeList;