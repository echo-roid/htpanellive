import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  getInternationalHubByFormId, 
  saveInternationalHubData 
} from "../../api/internationalHubService";

export default function InternationalHubList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("merged"); // 'merged', 'submissions', 'saved'
  const [submissionsData, setSubmissionsData] = useState([]);
  const [savedHubData, setSavedHubData] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  const formId = 93;
  const travelOptions = ["END to END", "By Bus", "Domestic By Train", "By Own"];

  // Function to group and sum data by airport code
  const groupAndSumData = (airportData) => {
    if (!airportData || !Array.isArray(airportData)) {
      return [];
    }
    
    const groupedMap = new Map();
    
    airportData.forEach(item => {
      if (item && item.airportCode) {
        const key = item.airportCode;
        if (groupedMap.has(key)) {
          const existing = groupedMap.get(key);
          groupedMap.set(key, {
            ...existing,
            pax: existing.pax + (item.pax || 1),
            submissionIds: [...existing.submissionIds, item.submissionId]
          });
        } else {
          groupedMap.set(key, {
            ...item,
            pax: item.pax || 1,
            submissionIds: [item.submissionId],
            intHub: item.intHub || ""
          });
        }
      }
    });
    
    return Array.from(groupedMap.values());
  };

  // Check if item is a manual entry
  const isManualEntry = (item) => {
    if (!item.submissionIds || !Array.isArray(item.submissionIds) || item.submissionIds.length === 0) {
      return item.isManual || false;
    }
    
    const firstSubmissionId = item.submissionIds[0];
    return typeof firstSubmissionId === 'string' && firstSubmissionId.startsWith('manual-');
  };

  // Fetch submissions from form API
  const fetchSubmissionsData = async () => {
    try {
      setSubmissionsLoading(true);
      const res = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${formId}/submissions`);
      
      if (res.data && res.data.success && res.data.submissions && res.data.submissions.length > 0) {
        const apiSubmissions = res.data.submissions;
        const airportData = [];
        
        apiSubmissions.forEach((submission) => {
          if (submission && submission.data && Array.isArray(submission.data)) {
            submission.data.forEach(item => {
              if (item && item.type === 'nearest-airport' && item.value) {
                try {
                  const airportValue = item.value;
                  
                  if (airportValue && airportValue.airportCode) {
                    airportData.push({
                      hub: airportValue.selectedAirport || `${airportValue.airportCode} Airport`,
                      airportCode: airportValue.airportCode,
                      pax: 1,
                      travelType: "",
                      intHub: "",
                      address: airportValue.address,
                      distance: airportValue.distanceKm,
                      submissionId: submission.id || `sub-${Date.now()}-${Math.random()}`,
                      isManual: false,
                      source: 'submission',
                      originalData: airportValue // Store original data for reference
                    });
                  }
                } catch (parseError) {
                  console.warn('Failed to parse airport data:', item.value);
                }
              }
            });
          }
        });

        // Group data by airport code
        const groupedData = groupAndSumData(airportData);
        setSubmissionsData(groupedData);
      } else {
        setSubmissionsData([]);
      }
    } catch (err) {
      console.error('Error fetching submissions data:', err);
      setSubmissionsData([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Fetch saved international hub data
  const fetchSavedHubData = async () => {
    try {
      setSavedLoading(true);
      const savedResponse = await getInternationalHubByFormId(formId);
      
      if (savedResponse.success && savedResponse.data) {
        setSavedHubData(savedResponse.data);
      } else {
        setSavedHubData([]);
      }
    } catch (savedError) {
      console.log('No saved international hub data found');
      setSavedHubData([]);
    } finally {
      setSavedLoading(false);
    }
  };

  // Merge data from both sources
  const mergeData = () => {
    const mergedData = [];
    const seenAirportCodes = new Set();
    
    // First add all saved data
    savedHubData.forEach(item => {
      if (item.airportCode) {
        seenAirportCodes.add(item.airportCode);
        mergedData.push({
          ...item,
          source: item.isManual ? 'manual' : 'saved'
        });
      }
    });
    
    // Then add submissions data that's not already in saved data
    submissionsData.forEach(item => {
      if (item.airportCode && !seenAirportCodes.has(item.airportCode)) {
        seenAirportCodes.add(item.airportCode);
        
        // Check if this airport exists in saved data
        const savedItem = savedHubData.find(saved => saved.airportCode === item.airportCode);
        
        mergedData.push({
          ...item,
          travelType: savedItem ? savedItem.travelType : item.travelType,
          intHub: savedItem ? savedItem.intHub : item.intHub,
          source: 'submission'
        });
      }
    });
    
    setData(mergedData);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchSubmissionsData(),
        fetchSavedHubData()
      ]);
      
      mergeData();
      
      if (submissionsData.length === 0 && savedHubData.length === 0) {
        setError("No data found from any source.");
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save data to API
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage("");
      
      const response = await saveInternationalHubData(leadId, formId, data);
      
      if (response.success) {
        setSaveMessage("International hub data saved successfully!");
        setData(response.data);
        // Refresh saved data
        await fetchSavedHubData();
      } else {
        setSaveMessage("Failed to save data. Please try again.");
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveMessage("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (submissionsData.length > 0 || savedHubData.length > 0) {
      mergeData();
    }
  }, [submissionsData, savedHubData]);

  const addNewRow = () => {
    setData([...data, { 
      hub: "", 
      airportCode: "", 
      intHub: "", 
      pax: 1, 
      travelType: "",
      submissionIds: [`manual-${Date.now()}`],
      isManual: true,
      source: 'manual'
    }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...data];
    if (updated[index]) {
      updated[index][field] = value;
      
      if (field === "hub") {
        const airportCodeMatch = value.match(/\(([^)]+)\)/);
        if (airportCodeMatch) {
          updated[index].airportCode = airportCodeMatch[1];
        } else {
          updated[index].airportCode = "";
        }
      }
      
      setData(updated);
    }
  };

  const removeRow = (index) => {
    const updated = data.filter((_, i) => i !== index);
    setData(updated);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Render table based on active tab
  const renderTable = () => {
    const tableData = activeTab === "merged" ? data : 
                      activeTab === "submissions" ? submissionsData : 
                      savedHubData;

    const isLoading = activeTab === "merged" ? loading :
                     activeTab === "submissions" ? submissionsLoading :
                     savedLoading;

    if (isLoading) {
      return (
        <tr>
          <td colSpan={activeTab === "submissions" ? 7 : 5} className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading {activeTab} data...</p>
          </td>
        </tr>
      );
    }

    if (!Array.isArray(tableData) || tableData.length === 0) {
      return (
        <tr>
          <td colSpan={activeTab === "submissions" ? 7 : 5} className="text-center py-6 text-gray-500 italic">
            No data found for {activeTab}.
          </td>
        </tr>
      );
    }

    return tableData.map((item, index) => (
      <tr
        key={`${item.airportCode}-${index}-${activeTab}`}
        className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
      >
        {/* Source column for submissions tab */}
        {activeTab === "submissions" && (
          <td className="px-4 py-2 border border-gray-300">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
              Form Submission
            </span>
          </td>
        )}

        {/* Domestic Hub */}
        <td className="px-4 py-2 border border-gray-300">
          {isManualEntry(item) || item.source === 'manual' ? (
            <div>
              <input
                type="text"
                placeholder="Enter domestic hub (e.g., Mumbai Airport (BOM))"
                value={item.hub || ""}
                onChange={(e) => handleChange(index, "hub", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none mb-2"
                disabled={activeTab !== "merged"}
              />
              {item.airportCode && (
                <div className="text-xs text-blue-600 font-semibold">
                  Airport Code: {item.airportCode}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">Manual Entry</div>
            </div>
          ) : (
            <div>
              <div className="font-medium">{item.hub || 'Unknown Hub'}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">
                Airport Code: {item.airportCode}
              </div>
              {item.address && (
                <div className="text-xs text-gray-500 mt-1">Address: {item.address}</div>
              )}
              {item.distance && (
                <div className="text-xs text-green-600 mt-1">Distance: {item.distance} km</div>
              )}
              {item.submissionIds && (
                <div className="text-xs text-purple-600 mt-1">
                  From {item.submissionIds.length} submission(s)
                </div>
              )}
            </div>
          )}
        </td>

        {/* International Hub */}
        <td className="px-4 py-2 border border-gray-300">
          {activeTab === "submissions" ? (
            <div className="text-gray-500 italic">Not in submissions</div>
          ) : (
            <input
              type="text"
              placeholder="Enter international hub"
              value={item.intHub || ""}
              onChange={(e) => handleChange(index, "intHub", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
              disabled={activeTab !== "merged"}
            />
          )}
        </td>

        {/* Pax Count */}
        <td className="px-4 py-2 border border-gray-300 text-center">
          {activeTab === "submissions" ? (
            <div>{item.pax || 1}</div>
          ) : (
            <input
              type="number"
              placeholder="0"
              value={item.pax || 1}
              onChange={(e) => handleChange(index, "pax", parseInt(e.target.value) || 1)}
              className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center focus:ring-2 focus:ring-blue-400 outline-none"
              min="1"
              disabled={activeTab !== "merged"}
            />
          )}
        </td>

        {/* Travel Type */}
        <td className="px-4 py-2 border border-gray-300">
          {activeTab === "submissions" ? (
            <div className="text-gray-500 italic">Not in submissions</div>
          ) : (
            <select
              value={item.travelType || ""}
              onChange={(e) => handleChange(index, "travelType", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
              disabled={activeTab !== "merged"}
            >
              <option value="">Select Type</option>
              {travelOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </td>

        {/* Original Data for submissions tab */}
        {activeTab === "submissions" && (
          <td className="px-4 py-2 border border-gray-300">
            {item.originalData && (
              <div className="text-xs">
                <div><strong>Lat:</strong> {item.originalData.latitude}</div>
                <div><strong>Lng:</strong> {item.originalData.longitude}</div>
                <div><strong>ID:</strong> {item.originalData.id}</div>
              </div>
            )}
          </td>
        )}

        {/* Action */}
        <td className="px-4 py-2 border border-gray-300 text-center">
          {activeTab === "merged" ? (
            <button
              onClick={() => removeRow(index)}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              ✕ Remove
            </button>
          ) : (
            <span className="text-gray-400">View only</span>
          )}
        </td>
      </tr>
    ));
  };

  if (loading && activeTab === "merged") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading travel hub data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-xl shadow-lg p-6">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 text-center flex-1">
            Travelling Hub (DOM) / International Hub
          </h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            ↻ Refresh All
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("merged")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "merged"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Merged Data
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                {data.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "submissions"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Form Submissions
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                {submissionsData.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "saved"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Saved Hub Data
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded">
                {savedHubData.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Info Bar */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-800">
                Form ID: {formId} | 
                Merged: {data.length} | 
                Submissions: {submissionsData.length} | 
                Saved: {savedHubData.length}
              </p>
            </div>
            <div className="text-sm">
              <span className={`px-2 py-1 rounded ${activeTab === "merged" ? "bg-blue-100 text-blue-800" : 
                activeTab === "submissions" ? "bg-green-100 text-green-800" : 
                "bg-purple-100 text-purple-800"}`}>
                Viewing: {activeTab}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button and Message */}
        {activeTab === "merged" && (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={addNewRow}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              + Add Manual Location
            </button>
            
            <div className="flex items-center gap-4">
              {saveMessage && (
                <div className={`text-sm ${
                  saveMessage.includes("successfully") 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {saveMessage}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "💾 Save Data"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-gray-700 text-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                {/* Source header for submissions tab */}
                {activeTab === "submissions" && (
                  <th className="px-4 py-2 border border-gray-300 text-left">Source</th>
                )}
                <th className="px-4 py-2 border border-gray-300 text-left">Travelling Hub (DOM)</th>
                <th className="px-4 py-2 border border-gray-300 text-left">Travelling Hub (INT)</th>
                <th className="px-4 py-2 border border-gray-300 text-center">Count OF Pax</th>
                <th className="px-4 py-2 border border-gray-300 text-left">Travel Type</th>
                {/* Original Data header for submissions tab */}
                {activeTab === "submissions" && (
                  <th className="px-4 py-2 border border-gray-300 text-left">Original Data</th>
                )}
                <th className="px-4 py-2 border border-gray-300 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {renderTable()}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}