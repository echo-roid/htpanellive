import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubmissionViewer = () => {
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/forms/submissions/7');
        
        if (!response.data.success || !response.data.submission) {
          throw new Error('Invalid submission data received');
        }

        setSubmission(response.data.submission);
        setFormData(response.data.submission.data);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError(err.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, []);

  const handleInputChange = (index, value, key = 'value') => {
    const newFormData = [...formData];
    newFormData[index].value = {
      ...newFormData[index].value,
      [key]: value
    };
    setFormData(newFormData);
  };

  const handleOptionChange = (index, option) => {
    const newFormData = [...formData];
    newFormData[index].value = {
      ...newFormData[index].value,
      selectedOption: option
    };
    setFormData(newFormData);
  };

  const handleCheckboxChange = (index, option, checked) => {
    const newFormData = [...formData];
    const selectedOptions = [...(newFormData[index].value.selectedOptions || [])];
    
    if (checked) {
      if (!selectedOptions.includes(option)) {
        selectedOptions.push(option);
      }
    } else {
      const optionIndex = selectedOptions.indexOf(option);
      if (optionIndex > -1) {
        selectedOptions.splice(optionIndex, 1);
      }
    }
    
    newFormData[index].value = {
      ...newFormData[index].value,
      selectedOptions
    };
    setFormData(newFormData);
  };

  const handleSave = async () => {
    if (!submission) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      // First update the entire submission data
      const updateResponse = await axios.put(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/forms/submissions/${submission.id}`,
        { data: formData }
      );
      
      if (updateResponse.data.success) {
        // Then update individual fields if needed
        const fieldUpdates = await Promise.all(
          formData.map(async (field, index) => {
            try {
              const response = await axios.put(
                `https://tableware-dweeb-estate.ngrok-free.dev/api/submissions/${submission.id}/edit-value`,
                {
                  fieldId: field.field_id,
                  newValue: field.value
                }
              );
              return response.data.success;
            } catch (err) {
              console.error(`Error updating field ${field.field_id}:`, err);
              return false;
            }
          })
        );

        const allSuccessful = fieldUpdates.every(success => success);
        
        if (allSuccessful) {
          setSaveMessage({ type: 'success', text: 'All changes saved successfully!' });
          setSubmission({ ...submission, data: formData });
        } else {
          setSaveMessage({ 
            type: 'warning', 
            text: 'Changes saved, but some fields may not have updated correctly',
            details: 'Try saving again or contact support if issues persist'
          });
        }
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: updateResponse.data.message || 'Failed to save changes',
          details: updateResponse.data.details
        });
      }
    } catch (err) {
      console.error('Error saving submission:', err);
      setSaveMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save changes',
        details: err.response?.data?.details || 'Please check your connection and try again'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const renderField = (field, index) => {
    if (!field || !field.value) return null;

    const { type, value } = field;
    const label = value.label || `Field (${type})`;

    // Non-editable fields (display only)
    if (type === 'banner') {
      return (
        <div className="field-container mb-6">
          {value.bannerImage && (
            <img 
              src={value.bannerImage} 
              alt="Banner" 
              className="w-full h-auto max-h-64 object-contain border rounded"
            />
          )}
          {value.label && <h3 className="text-lg font-medium mt-2">{value.label}</h3>}
          {value.description && <p className="text-gray-600 mt-1">{value.description}</p>}
        </div>
      );
    }

    if (type === 'paragraph') {
      return (
        <div className="field-container mb-6">
          <p className="text-gray-700">{value.content}</p>
        </div>
      );
    }

    if (type === 'divider') {
      return <hr className="my-6 border-gray-200" />;
    }

    // Editable fields
    return (
      <div className={`field-container mb-6 p-4 border rounded-lg bg-white`}>
        <h3 className="text-lg font-medium mb-3">{label}</h3>
        
        {type === 'aadhar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={value.name || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'name')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                <input
                  type="text"
                  value={value.aadharNumber || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'aadharNumber')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
                <input
                  type="date"
                  value={value.dob || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'dob')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={value.gender || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'gender')}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={value.address || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'address')}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Front Image</label>
                {value.frontImage ? (
                  <img src={value.frontImage} alt="Aadhar Front" className="max-h-40 border rounded" />
                ) : (
                  <p>No image uploaded</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Back Image</label>
                {value.backImage ? (
                  <img src={value.backImage} alt="Aadhar Back" className="max-h-40 border rounded" />
                ) : (
                  <p>No image uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {type === 'passport' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={value.fullName || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'fullName')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  value={value.passportNumber || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'passportNumber')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={value.nationality || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'nationality')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
                <input
                  type="date"
                  value={value.dob || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'dob')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={value.expiryDate || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'expiryDate')}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Front Image</label>
                {value.frontImage ? (
                  <img src={value.frontImage} alt="Passport Front" className="max-h-40 border rounded" />
                ) : (
                  <p>No image uploaded</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Back Image</label>
                {value.backImage ? (
                  <img src={value.backImage} alt="Passport Back" className="max-h-40 border rounded" />
                ) : (
                  <p>No image uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {type === 'multiple-choice' && (
          <div className="space-y-2">
            {value.options && value.options.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value.selectedOptions?.includes(option) || false}
                  onChange={(e) => handleCheckboxChange(index, option, e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {(type === 'dropdown') && (
          <div>
            <select
              value={value.selectedOption || ''}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select an option</option>
              {value.options && value.options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}

        {(type === 'single-choice') && (
          <div className="space-y-2">
            {value.options && value.options.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={`radio-${index}`}
                  checked={value.selectedOption === option}
                  onChange={() => handleOptionChange(index, option)}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {(type === 'full-name') && (
          <input
            type="text"
            value={value.value || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter full name"
          />
        )}

        {(type === 'email') && (
          <input
            type="email"
            value={value.value || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter email address"
          />
        )}

        {(type === 'phone') && (
          <input
            type="tel"
            value={value.value || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter phone number"
          />
        )}

        {(type === 'date') && (
          <input
            type="date"
            value={value.value || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        {(type === 'time') && (
          <input
            type="time"
            value={value.value || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        {type === 'address' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address 1</label>
              <input
                type="text"
                value={value.street1 || ''}
                onChange={(e) => handleInputChange(index, e.target.value, 'street1')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address 2</label>
              <input
                type="text"
                value={value.street2 || ''}
                onChange={(e) => handleInputChange(index, e.target.value, 'street2')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={value.city || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'city')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={value.state || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'state')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={value.postalCode || ''}
                  onChange={(e) => handleInputChange(index, e.target.value, 'postalCode')}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        )}

        {type === 'file-upload' && (
          <div>
            {value.file ? (
              <>
                <p className="mb-2">File: {value.fileName || 'Uploaded file'}</p>
                {value.file.startsWith('data:image/') && (
                  <img src={value.file} alt="Uploaded file" className="max-h-40 border rounded mt-2" />
                )}
              </>
            ) : (
              <p>No file uploaded</p>
            )}
          </div>
        )}

        {type === 'signature' && (
          <div>
            {value.signatureData ? (
              <img src={value.signatureData} alt="Signature" className="max-h-40 border rounded" />
            ) : (
              <p>No signature provided</p>
            )}
          </div>
        )}

        {![
          'aadhar', 'passport', 'multiple-choice', 'dropdown', 'single-choice',
          'full-name', 'email', 'phone', 'date', 'time', 'address',
          'file-upload', 'signature', 'banner', 'paragraph', 'divider'
        ].includes(type) && (
          <input
            type="text"
            value={value.value || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
      </div>
    );
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!submission) return <div className="text-center p-8">No submission found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-800 text-white p-6">
          <h1 className="text-2xl font-bold">Submission #{submission.id}</h1>
          <p className="text-gray-300 mt-1">
            Form ID: {submission.form_id} • Submitted on {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>

        <div className="p-6">
          {formData.map((field, index) => (
            <div key={`${field.field_id}-${index}`}>
              {renderField(field, index)}
            </div>
          ))}

          <div className="mt-8 flex justify-between items-center">
            {saveMessage && (
              <div className={`text-sm px-4 py-2 rounded ${
                saveMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : saveMessage.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {saveMessage.text}
                {saveMessage.details && <div className="mt-1 text-xs">{saveMessage.details}</div>}
              </div>
            )}
            <div className="flex-1"></div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionViewer;