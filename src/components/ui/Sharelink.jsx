import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Sharelink = () => {
  const { shareId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/shared/${shareId}`);
        
        // Parse config and styles if they're strings
        const fields = response.data.form.fields.map(field => ({
          ...field,
          config: typeof field.config === 'string' ? JSON.parse(field.config) : field.config,
          styles: typeof field.styles === 'string' ? JSON.parse(field.styles) : field.styles
        }));

        setForm({
          ...response.data.form,
          fields
        });

        // Initialize form data
        const initialData = {};
        fields.forEach(field => {
          initialData[field.field_id] = {
            ...field.config,
            field_id: field.field_id,
            type: field.type
          };
        });
        setFormData(initialData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [shareId]);

  const handleFieldChange = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        ...updates
      }
    }));
  };

  const handleFileUpload = async (e, fieldId, property) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleFieldChange(fieldId, { [property]: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    form.fields.forEach(field => {
      const fieldConfig = formData[field.field_id];
      const styles = field.styles || {};

      if (fieldConfig.required) {
        switch (field.type) {
          case 'full-name':
          case 'email':
          case 'phone':
          case 'date':
          case 'time':
            if (!fieldConfig.value) {
              errors[field.field_id] = 'This field is required';
              isValid = false;
            }
            break;
          
          case 'address':
            if (!fieldConfig.street1 || !fieldConfig.city || !fieldConfig.state || !fieldConfig.postalCode) {
              errors[field.field_id] = 'All address fields are required';
              isValid = false;
            }
            break;
          
          case 'aadhar':
            if (!fieldConfig.aadharNumber || fieldConfig.aadharNumber.length !== 12 || 
                !fieldConfig.name || !fieldConfig.dob || !fieldConfig.gender || !fieldConfig.address ||
                !fieldConfig.frontImage || !fieldConfig.backImage) {
              errors[field.field_id] = 'All Aadhar fields are required';
              isValid = false;
            }
            break;
          
          case 'passport':
            if (!fieldConfig.passportNumber || !fieldConfig.fullName || !fieldConfig.nationality || 
                !fieldConfig.dob || !fieldConfig.placeOfBirth || !fieldConfig.issueDate || 
                !fieldConfig.expiryDate || !fieldConfig.frontImage || !fieldConfig.backImage) {
              errors[field.field_id] = 'All Passport fields are required';
              isValid = false;
            }
            break;
          
          case 'dropdown':
            if (!fieldConfig.selectedOption) {
              errors[field.field_id] = 'Please select an option';
              isValid = false;
            }
            break;
          
          case 'single-choice':
            if (!fieldConfig.selectedOption) {
              errors[field.field_id] = 'Please select an option';
              isValid = false;
            }
            break;
          
          case 'multiple-choice':
            if (!fieldConfig.selectedOptions || fieldConfig.selectedOptions.length === 0) {
              errors[field.field_id] = 'Please select at least one option';
              isValid = false;
            }
            break;
          
          case 'file-upload':
            if (!fieldConfig.file) {
              errors[field.field_id] = 'Please upload a file';
              isValid = false;
            }
            break;
          
          case 'signature':
            if (!fieldConfig.signatureData) {
              errors[field.field_id] = 'Signature is required';
              isValid = false;
            }
            break;
          
          default:
            break;
        }
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        // Prepare form data for submission
        const submissionData = {
          shareId: shareId,
          lead_id: form.lead.id,
          responses: Object.values(formData).map(field => ({
            field_id: field.field_id,
            type: field.type,
            value: field
          }))
        };

        // Send to API endpoint
        const response = await axios.post(
          'https://tableware-dweeb-estate.ngrok-free.dev/api/forms/submit-response', 
          submissionData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setIsSubmitted(true);
        } else {
          setError(response.data.message || 'Failed to submit form');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit form');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldConfig = formData[field.field_id] || {};
    const styles = field.styles || {};
    const error = formErrors[field.field_id];

    const renderDescription = () => {
      if (!fieldConfig.description) return null;
      return (
        <div className="text-xs text-gray-500 mt-1">
          {fieldConfig.description}
        </div>
      );
    };

    const renderError = () => {
      if (!error) return null;
      return (
        <div className="text-xs text-red-500 mt-1">
          {error}
        </div>
      );
    };

    const fieldStyle = {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      borderWidth: styles.borderWidth,
      borderStyle: styles.borderStyle,
      borderColor: styles.borderColor,
      padding: styles.padding,
      borderRadius: styles.borderRadius,
      marginBottom: '1rem'
    };

    switch (field.type) {
      case 'heading':
        const HeadingTag = fieldConfig.level || 'h2';
        return (
          <div style={fieldStyle}>
            <HeadingTag>{fieldConfig.text}</HeadingTag>
            {renderDescription()}
          </div>
        );

      case 'full-name':
      case 'email':
      case 'phone':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder={fieldConfig.placeholder}
              value={fieldConfig.value || ''}
              onChange={(e) => handleFieldChange(field.field_id, { value: e.target.value })}
            />
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'address':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={fieldConfig.street1 || ''}
                onChange={(e) => handleFieldChange(field.field_id, { street1: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Street Address"
              />
              <input
                type="text"
                value={fieldConfig.street2 || ''}
                onChange={(e) => handleFieldChange(field.field_id, { street2: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Street Address Line 2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={fieldConfig.city || ''}
                  onChange={(e) => handleFieldChange(field.field_id, { city: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={fieldConfig.state || ''}
                  onChange={(e) => handleFieldChange(field.field_id, { state: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="State/Province"
                />
              </div>
              <input
                type="text"
                value={fieldConfig.postalCode || ''}
                onChange={(e) => handleFieldChange(field.field_id, { postalCode: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Postal/Zip Code"
              />
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'aadhar':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={fieldConfig.aadharNumber || ''}
                onChange={(e) => handleFieldChange(field.field_id, { aadharNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Aadhar Number (12 digits)"
                maxLength="12"
              />
              <input
                type="text"
                value={fieldConfig.name || ''}
                onChange={(e) => handleFieldChange(field.field_id, { name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name as on Aadhar"
              />
              <input
                type="date"
                value={fieldConfig.dob || ''}
                onChange={(e) => handleFieldChange(field.field_id, { dob: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Date of Birth"
              />
              <select
                value={fieldConfig.gender || ''}
                onChange={(e) => handleFieldChange(field.field_id, { gender: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={fieldConfig.address || ''}
                onChange={(e) => handleFieldChange(field.field_id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Address as on Aadhar"
              />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="font-medium mb-2">Front Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, field.field_id, 'frontImage')}
                    className="hidden"
                    id={`aadhar-front-${field.field_id}`}
                  />
                  {fieldConfig.frontImage ? (
                    <div className="relative">
                      <img 
                        src={fieldConfig.frontImage} 
                        alt="Aadhar Front" 
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleFieldChange(field.field_id, { frontImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`aadhar-front-${field.field_id}`}
                      className="block w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed cursor-pointer text-center"
                    >
                      Upload Front
                    </label>
                  )}
                </div>
                
                <div>
                  <div className="font-medium mb-2">Back Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, field.field_id, 'backImage')}
                    className="hidden"
                    id={`aadhar-back-${field.field_id}`}
                  />
                  {fieldConfig.backImage ? (
                    <div className="relative">
                      <img 
                        src={fieldConfig.backImage} 
                        alt="Aadhar Back" 
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleFieldChange(field.field_id, { backImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`aadhar-back-${field.field_id}`}
                      className="block w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed cursor-pointer text-center"
                    >
                      Upload Back
                    </label>
                  )}
                </div>
              </div>
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'passport':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={fieldConfig.passportNumber || ''}
                onChange={(e) => handleFieldChange(field.field_id, { passportNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Passport Number"
              />
              <input
                type="text"
                value={fieldConfig.fullName || ''}
                onChange={(e) => handleFieldChange(field.field_id, { fullName: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name as on Passport"
              />
              <input
                type="text"
                value={fieldConfig.nationality || ''}
                onChange={(e) => handleFieldChange(field.field_id, { nationality: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nationality"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={fieldConfig.dob || ''}
                  onChange={(e) => handleFieldChange(field.field_id, { dob: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Date of Birth"
                />
                <input
                  type="text"
                  value={fieldConfig.placeOfBirth || ''}
                  onChange={(e) => handleFieldChange(field.field_id, { placeOfBirth: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Place of Birth"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={fieldConfig.issueDate || ''}
                  onChange={(e) => handleFieldChange(field.field_id, { issueDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Issue Date"
                />
                <input
                  type="date"
                  value={fieldConfig.expiryDate || ''}
                  onChange={(e) => handleFieldChange(field.field_id, { expiryDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Expiry Date"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="font-medium mb-2">Front Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, field.field_id, 'frontImage')}
                    className="hidden"
                    id={`passport-front-${field.field_id}`}
                  />
                  {fieldConfig.frontImage ? (
                    <div className="relative">
                      <img 
                        src={fieldConfig.frontImage} 
                        alt="Passport Front" 
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleFieldChange(field.field_id, { frontImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`passport-front-${field.field_id}`}
                      className="block w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed cursor-pointer text-center"
                    >
                      Upload Front
                    </label>
                  )}
                </div>
                
                <div>
                  <div className="font-medium mb-2">Back Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, field.field_id, 'backImage')}
                    className="hidden"
                    id={`passport-back-${field.field_id}`}
                  />
                  {fieldConfig.backImage ? (
                    <div className="relative">
                      <img 
                        src={fieldConfig.backImage} 
                        alt="Passport Back" 
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleFieldChange(field.field_id, { backImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`passport-back-${field.field_id}`}
                      className="block w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed cursor-pointer text-center"
                    >
                      Upload Back
                    </label>
                  )}
                </div>
              </div>
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'dropdown':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select 
              className="w-full p-2 border rounded" 
              value={fieldConfig.selectedOption || ''}
              onChange={(e) => handleFieldChange(field.field_id, { selectedOption: e.target.value })}
            >
              <option value="">Select an option</option>
              {fieldConfig.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'single-choice':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {fieldConfig.options?.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input 
                    type="radio" 
                    name={`radio-${field.field_id}`} 
                    className="mr-2"
                    checked={fieldConfig.selectedOption === option}
                    onChange={() => handleFieldChange(field.field_id, { selectedOption: option })}
                  />
                  <span>{option}</span>
                </div>
              ))}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'multiple-choice':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {fieldConfig.options?.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={fieldConfig.selectedOptions?.includes(option) || false}
                    onChange={(e) => {
                      const selected = fieldConfig.selectedOptions || [];
                      const newSelected = e.target.checked
                        ? [...selected, option]
                        : selected.filter(opt => opt !== option);
                      handleFieldChange(field.field_id, { selectedOptions: newSelected });
                    }}
                  />
                  <span>{option}</span>
                </div>
              ))}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'paragraph':
        return (
          <div style={fieldStyle}>
            <p className="text-gray-700">{fieldConfig.content}</p>
            {renderDescription()}
          </div>
        );

      case 'date':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={fieldConfig.selectedDate || ''}
              onChange={(e) =>
                handleFieldChange(field.field_id, { selectedDate: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'time':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={fieldConfig.selectedTime || ''}
              onChange={(e) =>
                handleFieldChange(field.field_id, { selectedTime: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'signature':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {fieldConfig.signatureData ? (
              <img 
                src={fieldConfig.signatureData} 
                alt="Signature" 
                className="border-2 border-dashed border-gray-300 rounded-lg w-full h-32 object-contain"
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg w-full h-32 flex items-center justify-center text-gray-500">
                Sign here
              </div>
            )}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  // You would implement signature capture here
                  // For now, we'll just simulate it with a file upload
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = (e) => handleFileUpload(e, field.field_id, 'signatureData');
                  fileInput.click();
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {fieldConfig.signatureData ? 'Change Signature' : 'Add Signature'}
              </button>
              {fieldConfig.signatureData && (
                <button
                  type="button"
                  onClick={() => handleFieldChange(field.field_id, { signatureData: null })}
                  className="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Clear
                </button>
              )}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'file-upload':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, field.field_id, 'file')}
              className="hidden"
              id={`file-upload-${field.field_id}`}
            />
            {fieldConfig.file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="truncate">{fieldConfig.file.name}</span>
                  <span className="text-green-500 ml-2">✓</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFieldChange(field.field_id, { file: null })}
                  className="mt-2 text-red-500 hover:text-red-700 text-sm"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <label
                htmlFor={`file-upload-${field.field_id}`}
                className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              >
                <div className="text-gray-500 mb-2">Click to upload file</div>
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Choose File
                </button>
              </label>
            )}
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'star-rating':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center">
              {[...Array(fieldConfig.maxRating || 5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleFieldChange(field.field_id, { rating: i + 1 })}
                  className="text-2xl mr-1 cursor-pointer"
                >
                  {i < fieldConfig.rating ? "★" : "☆"}
                </button>
              ))}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'scale-rating':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center justify-between">
              <span>{fieldConfig.min || 1}</span>
              <input
                type="range"
                min={fieldConfig.min || 1}
                max={fieldConfig.max || 10}
                value={fieldConfig.value || 5}
                onChange={(e) =>
                  handleFieldChange(field.field_id, { value: parseInt(e.target.value) })
                }
                className="w-full mx-2"
              />
              <span>{fieldConfig.max || 10}</span>
            </div>
            <div className="text-center mt-1">{fieldConfig.value || 5}</div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case 'banner':
        return (
          <div style={fieldStyle}>
            <label className="block mb-1 font-medium">{fieldConfig.label}</label>
            {fieldConfig.bannerImage ? (
              <img 
                src={fieldConfig.bannerImage} 
                alt="Banner" 
                className="w-full object-cover rounded-lg"
                style={{ height: `${fieldConfig.height || 200}px` }}
              />
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                style={{ 
                  height: `${fieldConfig.height || 200}px`,
                  background: "repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px)"
                }}
              >
                <span className="text-gray-500">No banner image</span>
              </div>
            )}
            {renderDescription()}
          </div>
        );

      case 'divider':
        return (
          <div className="relative my-6" style={fieldStyle}>
            <hr className="border-t-2 border-gray-300" />
            {fieldConfig.description && (
              <div className="text-xs text-gray-500 mt-1 text-center">
                {fieldConfig.description}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div style={fieldStyle}>
            <div>Unsupported field type: {field.type}</div>
            {renderDescription()}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Form not found</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Thank You!</div>
          <div className="text-lg">Your form has been submitted successfully.</div>
          <div className="mt-4 text-gray-600">Submitted to: {form.lead.client}</div>
          <div className="text-gray-600">Sales Person: {form.lead.sales_person}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">{form.name}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {form.fields
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((field) => (
                <div key={field.field_id}>
                  {renderField(field)}
                </div>
              ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sharelink;