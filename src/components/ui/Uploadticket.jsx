import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- API Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://tableware-dweeb-estate.ngrok-free.dev/api';

// --- fetchPassengerData with Lead ID ---
const fetchPassengerData = async (leadID, page = 1, limit = 10, sortBy = 'pax_code', sortOrder = 'ASC') => {
  if (!leadID) {
    throw new Error('No lead ID provided');
  }

  // Build query params
  const queryParams = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  // Remove undefined values
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined || queryParams[key] === '') {
      delete queryParams[key];
    }
  });

  const queryString = new URLSearchParams(queryParams).toString();
  
  try {
    const response = await axios.get(`${API_BASE_URL}/paxlist/lead/${leadID}?${queryString}`);
    
    if (response.data.success) {
      const passengers = response.data.passengers || [];
      const pagination = {
        total: response.data.total || 0,
        page: response.data.page || page,
        limit: limit,
        totalPages: response.data.totalPages || 0
      };
      
      return { 
        passengers, 
        pagination,
        groupStatistics: response.data.group_statistics || []
      };
    } else {
      throw new Error(response.data.message || 'Failed to load passengers');
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- Upload Single Ticket Function ---
const uploadTicket = async (leadID, paxCode, file) => {
  const formData = new FormData();
  formData.append('ticket', file);
  formData.append('pax_code', paxCode);
  formData.append('lead_id', leadID);

  try {
    const response = await axios.post(`${API_BASE_URL}/paxlist/upload-ticket`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return { success: true, message: 'Ticket uploaded successfully', data: response.data.data };
    } else {
      throw new Error(response.data.message || 'Failed to upload ticket');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// --- Upload Multiple Tickets Function ---
const uploadMultipleTickets = async (leadID, files) => {
  const formData = new FormData();
  
  files.forEach(({ paxCode, file }) => {
    formData.append('tickets', file);
    formData.append('pax_codes[]', paxCode);
  });
  formData.append('lead_id', leadID);

  try {
    const response = await axios.post(`${API_BASE_URL}/paxlist/upload-multiple-tickets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return { success: true, message: 'Tickets uploaded successfully', data: response.data.data };
    } else {
      throw new Error(response.data.message || 'Failed to upload tickets');
    }
  } catch (error) {
    console.error('Multi upload error:', error);
    throw error;
  }
};

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
  const styles = {
    'Confirmed': 'bg-green-100 text-green-800 ring-green-600/20',
    'Pending': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    'Cancelled': 'bg-red-100 text-red-800 ring-red-600/20',
    'Boarded': 'bg-blue-100 text-blue-800 ring-blue-600/20',
    'pending': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    'confirmed': 'bg-green-100 text-green-800 ring-green-600/20',
    'cancelled': 'bg-red-100 text-red-800 ring-red-600/20',
    'boarded': 'bg-blue-100 text-blue-800 ring-blue-600/20'
  };
  
  const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';
  
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {displayStatus}
    </span>
  );
};

// --- Single Upload Modal Component ---
const SingleUploadModal = ({ isOpen, onClose, passenger, onUpload, leadID }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setUploadStatus({ type: 'error', message: 'Please upload a PDF, JPEG, or PNG file' });
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({ type: 'error', message: 'File size must be less than 5MB' });
        setSelectedFile(null);
        return;
      }
      
      setUploadStatus({ type: '', message: '' });
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a file to upload' });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: '', message: '' });

    try {
      await onUpload(leadID, passenger.pax_code, selectedFile);
      setUploadStatus({ type: 'success', message: 'Ticket uploaded successfully!' });
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setUploadStatus({ type: '', message: '' });
      }, 1500);
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message || 'Failed to upload ticket' });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Upload Ticket for {passenger?.form_data?.email || passenger?.pax_code}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Passenger Code: <span className="font-mono font-medium">{passenger?.pax_code}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Group: <span className="font-medium">{passenger?.group_n}</span>
                  </p>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Ticket File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m-4-4l-4 4m6-20v.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                  {uploadStatus.message && (
                    <div className={`mt-2 text-sm ${uploadStatus.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                      {uploadStatus.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Ticket'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Multi Upload Modal Component ---
const MultiUploadModal = ({ isOpen, onClose, selectedPassengers, passengers, onUpload, leadID }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '', details: [] });
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectedPassengerDetails = passengers.filter(p => selectedPassengers.includes(p.pax_code));

  const handleFileChange = (paxCode, file) => {
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setUploadStatus({ type: 'error', message: `Invalid file type for ${paxCode}. Please upload PDF, JPEG, or PNG`, details: [] });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({ type: 'error', message: `File size exceeds 5MB for ${paxCode}`, details: [] });
        return;
      }
      
      setSelectedFiles(prev => ({ ...prev, [paxCode]: file }));
      setUploadStatus({ type: '', message: '', details: [] });
    }
  };

  const handleUpload = async () => {
    const filesToUpload = [];
    const missingFiles = [];

    selectedPassengerDetails.forEach(passenger => {
      if (selectedFiles[passenger.pax_code]) {
        filesToUpload.push({
          paxCode: passenger.pax_code,
          file: selectedFiles[passenger.pax_code]
        });
      } else {
        missingFiles.push(passenger.pax_code);
      }
    });

    if (missingFiles.length > 0) {
      setUploadStatus({ 
        type: 'error', 
        message: `Please select files for: ${missingFiles.join(', ')}`, 
        details: [] 
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus({ type: '', message: '', details: [] });

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onUpload(leadID, filesToUpload);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully uploaded ${filesToUpload.length} tickets!`, 
        details: result.data || [] 
      });
      
      setTimeout(() => {
        onClose();
        setSelectedFiles({});
        setUploadStatus({ type: '', message: '', details: [] });
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Failed to upload tickets', 
        details: [] 
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileInputKey = (paxCode) => `file-${paxCode}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Bulk Upload Tickets
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Upload tickets for {selectedPassengers.length} selected passenger(s)
                  </p>
                </div>
                
                <div className="mt-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedPassengerDetails.map((passenger) => (
                      <div key={passenger.pax_code} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {passenger.form_data?.email || passenger.pax_code}
                            </h4>
                            <p className="text-sm text-gray-500 font-mono">{passenger.pax_code}</p>
                            <p className="text-xs text-gray-400">Group: {passenger.group_n}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedFiles[passenger.pax_code] && (
                              <span className="text-xs text-green-600 flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                File selected
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m-4-4l-4 4m6-20v.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor={getFileInputKey(passenger.pax_code)} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Choose file</span>
                                <input 
                                  id={getFileInputKey(passenger.pax_code)} 
                                  name={getFileInputKey(passenger.pax_code)} 
                                  type="file" 
                                  className="sr-only" 
                                  onChange={(e) => handleFileChange(passenger.pax_code, e.target.files[0])} 
                                  accept=".pdf,.jpg,.jpeg,.png" 
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, PNG, JPG up to 5MB
                            </p>
                            {selectedFiles[passenger.pax_code] && (
                              <p className="text-xs text-gray-600 mt-1">
                                Selected: {selectedFiles[passenger.pax_code].name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {uploadStatus.message && (
                  <div className={`mt-4 p-3 rounded-md ${uploadStatus.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-sm ${uploadStatus.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
                      {uploadStatus.message}
                    </p>
                    {uploadStatus.details.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600">
                        {uploadStatus.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading {Object.keys(selectedFiles).length} files...
                </>
              ) : (
                `Upload ${selectedPassengers.length} Ticket(s)`
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Passenger Listing Component ---
const PassengerListing = () => {
  const { id: leadID } = useParams();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupStatistics, setGroupStatistics] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  
  // Sort State
  const [sortBy, setSortBy] = useState('pax_code');
  const [sortOrder, setSortOrder] = useState('ASC');
  
  // UI State
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [singleUploadModalOpen, setSingleUploadModalOpen] = useState(false);
  const [multiUploadModalOpen, setMultiUploadModalOpen] = useState(false);
  const [selectedPassengerForUpload, setSelectedPassengerForUpload] = useState(null);
  
  // Load passengers function
  const loadPassengers = useCallback(async () => {
    if (!leadID) {
      setError('No lead ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchPassengerData(
        leadID,
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder
      );
      setPassengers(result.passengers);
      setGroupStatistics(result.groupStatistics);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || 'Failed to load passengers');
      setPassengers([]);
    } finally {
      setLoading(false);
    }
  }, [leadID, pagination.page, pagination.limit, sortBy, sortOrder]);
  
  // Initial load and when dependencies change
  useEffect(() => {
    if (leadID) {
      loadPassengers();
    }
  }, [loadPassengers, leadID]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  
  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPassengers(passengers.map(p => p.pax_code));
    } else {
      setSelectedPassengers([]);
    }
  };
  
  // Handle single passenger selection
  const handleSelectPassenger = (paxCode, checked) => {
    if (checked) {
      setSelectedPassengers(prev => [...prev, paxCode]);
    } else {
      setSelectedPassengers(prev => prev.filter(code => code !== paxCode));
    }
  };
  
  // Handle single upload ticket
  const handleSingleUploadTicket = async (leadID, paxCode, file) => {
    try {
      const result = await uploadTicket(leadID, paxCode, file);
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  // Handle multi upload tickets
  const handleMultiUploadTickets = async (leadID, files) => {
    try {
      const result = await uploadMultipleTickets(leadID, files);
      setSelectedPassengers([]);
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  // Open single upload modal for a passenger
  const openSingleUploadModal = (passenger) => {
    setSelectedPassengerForUpload(passenger);
    setSingleUploadModalOpen(true);
  };
  
  // Open multi upload modal
  const openMultiUploadModal = () => {
    if (selectedPassengers.length === 0) {
      alert('Please select at least one passenger to upload tickets');
      return;
    }
    setMultiUploadModalOpen(true);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  // If no lead ID is available
  if (!leadID) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">No Lead ID Provided</h3>
              <div className="mt-2 text-sm text-red-700">
                Unable to load passengers. Please ensure you're accessing this page with a valid lead ID.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render loading state
  if (loading && passengers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading passengers...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Single Upload Modal */}
      <SingleUploadModal
        isOpen={singleUploadModalOpen}
        onClose={() => {
          setSingleUploadModalOpen(false);
          setSelectedPassengerForUpload(null);
        }}
        passenger={selectedPassengerForUpload}
        onUpload={handleSingleUploadTicket}
        leadID={leadID}
      />
      
      {/* Multi Upload Modal */}
      <MultiUploadModal
        isOpen={multiUploadModalOpen}
        onClose={() => {
          setMultiUploadModalOpen(false);
        }}
        selectedPassengers={selectedPassengers}
        passengers={passengers}
        onUpload={handleMultiUploadTickets}
        leadID={leadID}
      />
      
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
      
        <button
          onClick={handleBack}
          className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      
      {/* Group Statistics Summary */}
     
      
      {/* Bulk Upload Button - Shows when passengers are selected */}
      {selectedPassengers.length > 0 && (
        <div className="mt-4">
          <button
            onClick={openMultiUploadModal}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Bulk Upload Tickets ({selectedPassengers.length})
          </button>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading passengers</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Passenger Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        checked={selectedPassengers.length === passengers.length && passengers.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('pax_code')}
                    >
                      <div className="flex items-center gap-1">
                        Passenger Code
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('group_n')}
                    >
                      <div className="flex items-center gap-1">
                        Group
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('pax_status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      FC Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      PNR
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ticket
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {passengers.map((passenger) => (
                    <tr key={passenger.id} className="hover:bg-gray-50">
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          checked={selectedPassengers.includes(passenger.pax_code)}
                          onChange={(e) => handleSelectPassenger(passenger.pax_code, e.target.checked)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-600">
                        {passenger.pax_code}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        Group {passenger.group_n}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <StatusBadge status={passenger.pax_status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {passenger.form_data?.email || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {passenger.form_data?.fc_code || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {passenger.attached_pnr && passenger.attached_pnr.length > 0 ? (
                          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                            {passenger.attached_pnr.length} PNR(s)
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => openSingleUploadModal(passenger)}
                          className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 hover:bg-blue-100"
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Upload Ticket
                        </button>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {passengers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No passengers found for this lead</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pagination.page === pageNum
                          ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Actions Bar */}
      {selectedPassengers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gray-900 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
            <span className="text-sm">{selectedPassengers.length} selected</span>
            <button 
              onClick={openMultiUploadModal}
              className="text-sm text-green-400 hover:text-green-300"
            >
              Upload Tickets
            </button>
            <button className="text-sm text-gray-300 hover:text-white">Bulk Edit</button>
            <button className="text-sm text-red-400 hover:text-red-300">Delete</button>
            <button 
              onClick={() => setSelectedPassengers([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerListing;