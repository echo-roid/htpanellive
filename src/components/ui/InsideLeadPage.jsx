// src/pages/LeadPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import TasksPage from "./TasksPage";
import GuestData from "./Gestlist";

import {
  File,
  Download,
  Eye,
  X,
  LayoutDashboard,
  Receipt,
  User,
  Map,
  MessageSquare,
  CheckSquare,
  Activity,
  Users,
  Database,
} from "lucide-react";

const InsideLeadPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [uploadDocuments, setUploadDocuments] = useState([]);
  const [leadData, setLeadData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (location.state?.uploadDocuments) {
      const docs = location.state.uploadDocuments;
      let processedDocs = [];

      if (Array.isArray(docs)) {
        docs.forEach((item) => {
          if (Array.isArray(item)) {
            item.forEach((subItem) => {
              if (typeof subItem === "string") processedDocs.push(subItem);
            });
          } else if (typeof item === "string") {
            processedDocs.push(item);
          }
        });
      }

      setUploadDocuments(processedDocs);
    }

    if (location.state?.leadData) {
      setLeadData(location.state.leadData);
    }
  }, [location.state]);

  const tabs = [
    { value: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "Cost Sheet", label: "Cost Sheet", icon: Receipt },
    { value: "Profile", label: "Profile", icon: User },
    { value: "Itinerary", label: "Itinerary", icon: Map },
    { value: "Conversation", label: "Conversation", icon: MessageSquare },
    { value: "Task", label: "Task", icon: CheckSquare },
    { value: "Activity", label: "Activity", icon: Activity },
    { value: "Documents", label: "Documents", icon: File },
    { value: "Guest List", label: "Guest List", icon: Users },
    { value: "Master Data", label: "Master Data", icon: Database },
  ];

  const getFileIcon = () => {
    return <File className="text-gray-500" size={18} />;
  };

  const getFileName = (path) => {
    if (!path) return "Unknown file";
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  const handlePreviewDocument = (doc) => {
    setSelectedFile(doc);
    const fileUrl = doc.startsWith("http") ? doc : `http://localhost:5000${doc}`;
    setPreviewUrl(fileUrl);
    setShowPreview(true);
  };

  const handleDownloadDocument = (doc) => {
    const fileUrl = doc.startsWith("http") ? doc : `http://localhost:5000${doc}`;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = getFileName(doc);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDocumentsTab = () => {
    if (!uploadDocuments.length) {
      return (
        <div className="p-6 text-gray-400 text-center">
          No documents uploaded
        </div>
      );
    }

    return (
      <div className="p-6 space-y-3">
        {uploadDocuments.map((doc, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(doc)}
              <span>{getFileName(doc)}</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handlePreviewDocument(doc)}>
                <Eye size={16} />
              </button>
              <button onClick={() => handleDownloadDocument(doc)}>
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDashboardDocuments = () => {
    if (!uploadDocuments.length)
      return <p className="text-gray-400">No documents</p>;

    return (
      <div className="space-y-1">
        {uploadDocuments.slice(0, 3).map((doc, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {getFileIcon(doc)}
            {getFileName(doc)}
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Task":
        return <TasksPage />;

      case "Dashboard":
        return (
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <p className="text-xs text-gray-500">Lead ID</p>
              <p>{id}</p>
            </div>

            <div className="border p-4 rounded">
              <p className="text-xs text-gray-500">Client Name</p>
              <p>{leadData?.clientName || "N/A"}</p>
            </div>

            <div className="border p-4 rounded">
              <p className="text-xs text-gray-500">Status</p>
              <p>{leadData?.rfqStatus || "N/A"}</p>
            </div>

            <div className="border p-4 rounded col-span-2">
              <p className="text-xs text-gray-500 mb-2">Documents</p>
              {renderDashboardDocuments()}
            </div>
          </div>
        );

      case "Documents":
        return renderDocumentsTab();

      case "Guest List":
        return <GuestData leaD={id} />;

      default:
        return <div className="p-6">Content</div>;
    }
  };

  const validDocumentsCount = uploadDocuments.length;

  return (
    <>
     <h2 className="text-xl font-bold mb-6 text-[#3f8cff]">
        Lead
        {leadData && ` - ${leadData.clientName}`}
      </h2>

      <div className="bg-white border rounded-md">

        {/* TAB HEADER */}
        <div className="border-b bg-gray-100 overflow-x-auto">
          <div className="flex min-w-max">

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              const count =
                tab.value === "Documents" ? validDocumentsCount : 0;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
                    isActive
                      ? "text-blue-600 border-blue-600 bg-white"
                      : "text-gray-600 border-transparent hover:text-blue-600"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}

                  {tab.value === "Documents" && (
                    <span
                      className={`ml-1 min-w-[18px] h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-300"
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

        {/* CONTENT */}
        <div>{renderTabContent()}</div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white w-3/4 max-w-4xl rounded">

            <div className="flex justify-between items-center p-4 border-b">
              <span>{getFileName(selectedFile)}</span>

              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedFile(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              {selectedFile?.match(/\.(jpg|png|jpeg)/i) ? (
                <img src={previewUrl} alt="" className="max-w-full" />
              ) : selectedFile?.match(/\.pdf$/i) ? (
                <iframe
                  src={previewUrl}
                  title="preview"
                  className="w-full h-[70vh]"
                />
              ) : (
                <button
                  onClick={() => handleDownloadDocument(selectedFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsideLeadPage;