import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { 
  getTravelHubByFormId, 
  saveTravelHubData 
} from "../../api/travelHubService";

export default function TravelHubList() {
  const navigate = useNavigate();
  const { id } = useParams(); // Form ID from URL
  const location = useLocation();
const selectedformid = location.state?.selectedformid;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

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
          // If airport code exists, increment pax count
          const existing = groupedMap.get(key);
          groupedMap.set(key, {
            ...existing,
            pax: existing.pax + (item.pax || 1),
            submissionIds: [...existing.submissionIds, item.submissionId]
          });
        } else {
          // If new airport code, add to map
          groupedMap.set(key, {
            ...item,
            pax: item.pax || 1,
            submissionIds: [item.submissionId]
          });
        }
      }
    });
    
    // Convert map back to array
    return Array.from(groupedMap.values());
  };

  // Fetch data from API and merge with saved travel hub data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch saved travel hub data first
      let savedHubData = [];
      try {
        const savedResponse = await getTravelHubByFormId(id);
        if (savedResponse.success && savedResponse.data) {
          savedHubData = savedResponse.data;
        }
      } catch (savedError) {
        console.log('No saved travel hub data found, will fetch from submissions');
      }

      // Fetch form submissions
      const res = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${selectedformid}/submissions`);
      
      if (res.data && res.data.success && res.data.submissions && res.data.submissions.length > 0) {
        const apiSubmissions = res.data.submissions;
        
        // Extract nearest-airport data from submissions
        const airportData = [];
        
        apiSubmissions.forEach((submission) => {
          if (submission && submission.data && Array.isArray(submission.data)) {
            submission.data.forEach(item => {
              if (item && item.type === 'nearest-airport' && item.value) {
                try {
                  const airportValue = item.value;
                  
                  if (airportValue && airportValue.airportCode) {
                    // Check if this airport already exists in saved data
                    const existingSaved = savedHubData.find(
                      saved => saved.airportCode === airportValue.airportCode
                    );

                    airportData.push({
                      hub: airportValue.selectedAirport || `${airportValue.airportCode} Airport`,
                      airportCode: airportValue.airportCode,
                      pax: 1, // Each submission counts as 1 passenger
                      travelType: existingSaved ? existingSaved.travelType : "", // Use saved travel type if exists
                      address: airportValue.address,
                      distance: airportValue.distanceKm,
                      submissionId: submission.id || `sub-${Date.now()}-${Math.random()}`
                    });
                  }
                } catch (parseError) {
                  console.warn('Failed to parse airport data:', item.value);
                }
              }
            });
          }
        });

        console.log('Extracted Airport Data:', airportData);
        
        // Group data by airport code and sum passenger counts
        const groupedData = groupAndSumData(airportData);
        console.log('Grouped Airport Data:', groupedData);
        
        setData(groupedData || []);
      } else {
        // If no submissions, use saved data
        setData(savedHubData);
        if (savedHubData.length === 0) {
          setError("No submissions found for this form.");
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError("Failed to fetch data. Please try again.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Save data to API
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage("");
      
      const response = await saveTravelHubData(id, data);
      
      if (response.success) {
        setSaveMessage("Travel hub data saved successfully!");
        setData(response.data); // Update with saved data (includes IDs)
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
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (index, value) => {
    const updated = [...data];
    if (updated[index]) {
      updated[index].travelType = value;
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

  // Safe data length check
  const dataLength = Array.isArray(data) ? data.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading travel hub data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-xl text-red-600 bg-white p-6 rounded-lg shadow-md">
          {error}
          <button 
            onClick={handleRefresh}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-5xl bg-white border border-gray-300 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
          >
            ← Back
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "💾 Save"}
            </button>
            
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Travelling Hub (Domestic)
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Form ID: {id} | Total Unique Airports: {dataLength}
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-gray-700 text-sm">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-4 py-2 border border-gray-300 text-left">
                  Travelling Hub (DOM)
                </th>
                <th className="px-4 py-2 border border-gray-300 text-center">
                  Count OF Pax
                </th>
                <th className="px-4 py-2 border border-gray-300 text-left">
                  Domestic Travel Type
                </th>
                <th className="px-4 py-2 border border-gray-300 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={`${item.airportCode}-${index}`}
                    className={`hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="font-medium">
                        {item.hub || 'Unknown Hub'}
                      </div>
                      <div className="text-xs text-blue-600 font-semibold mt-1">
                        Airport Code: {item.airportCode}
                      </div>
                      {item.submissionIds && item.submissionIds.length > 1 && (
                        <div className="text-xs text-purple-600 mt-1">
                          From {item.submissionIds.length} submission(s)
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center font-semibold text-lg">
                      {item.pax || 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <select
                        value={item.travelType || ""}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="">Select Type</option>
                        {travelOptions.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      <button
                        onClick={() => removeRow(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        ✕ Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500 border border-gray-300">
                    No airport data found in submissions. Make sure your form has "nearest-airport" fields with data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}