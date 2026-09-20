import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import html2canvas from 'html2canvas';

// ============ HELPER FUNCTIONS ============

// Check if a value is empty
const isEmpty = (value) => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
        return Object.values(value).every(val => isEmpty(val));
    }
    return false;
};

// ============ DATE CONVERSION HELPER FUNCTIONS ============

// Convert DD/MM/YYYY to YYYY-MM-DD (for date input)
const convertToDateInputFormat = (dateStr) => {
    if (!dateStr) return '';
    
    // Check if it's already in YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
    }
    
    // Try DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        if (year.length === 4) {
            return `${year}-${month}-${day}`;
        }
    }
    
    // Try DD-MM-YYYY format
    const parts2 = dateStr.split('-');
    if (parts2.length === 3 && parts2[2].length === 4) {
        const day = parts2[0].padStart(2, '0');
        const month = parts2[1].padStart(2, '0');
        const year = parts2[2];
        return `${year}-${month}-${day}`;
    }
    
    return dateStr;
};

// Convert YYYY-MM-DD to DD/MM/YYYY (for display)
const convertToDisplayFormat = (dateStr) => {
    if (!dateStr) return '';
    
    // Check if it's in YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    return dateStr;
};

// Evaluate condition for form rules
const evaluateCondition = (condition, formData) => {
    const fieldValue = formData[condition.field];

    switch (condition.operator) {
        case 'Is Filled':
            return !isEmpty(fieldValue);
        case 'Is Not Filled':
            return isEmpty(fieldValue);
        case 'Equals':
            return fieldValue == condition.value;
        case 'Not Equals':
            return fieldValue != condition.value;
        case 'Greater Than':
            return parseFloat(fieldValue) > parseFloat(condition.value);
        case 'Less Than':
            return parseFloat(fieldValue) < parseFloat(condition.value);
        case 'Contains':
            return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
        case 'Does Not Contain':
            return typeof fieldValue === 'string' && !fieldValue.includes(condition.value);
        default:
            console.warn(`Unknown operator: ${condition.operator}`);
            return false;
    }
};

// Signature Pad Component
const SignaturePad = ({ fieldId, onSave, currentSignature }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentSignature) {
            const img = new Image();
            img.src = currentSignature;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
        }
    }, [fieldId, currentSignature]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setPrevPos({ x, y });

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        setPrevPos({ x, y });
    };

    const endDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL();
        onSave(dataURL);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSave(null);
    };

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border-2 border-dashed border-gray-300 rounded-lg w-full cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
            />
            <button
                type="button"
                onClick={clearSignature}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
            >
                Clear Signature
            </button>
        </div>
    );
};

const SharedFormViewer = () => {
    const { shareId } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [elementVisibility, setElementVisibility] = useState({});
    const [showTargets, setShowTargets] = useState(new Set());
    const [ocrProcessing, setOcrProcessing] = useState({});
    const [previewUrls, setPreviewUrls] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [extractedText, setExtractedText] = useState({});
    const [leadId, setLeadID] = useState();
    const [validtionforemail, setValidtionForEmail] = useState();
    const [triggerFuc, setTriggerFuc] = useState({ phone: "", email: "" });
    const [nearestAirportData, setNearestAirportData] = useState({});
    const [searchingAirport, setSearchingAirport] = useState(false);
    const [airportError, setAirportError] = useState('');
    const fileInputRef = useRef(null);

    // Edit functionality states
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editComplexValue, setEditComplexValue] = useState({});
    const [editFile, setEditFile] = useState(null);
    const [editFilePreview, setEditFilePreview] = useState('');
    
    // Thank you modal state
    const [showThankYou, setShowThankYou] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    
    const formContainerRef = useRef(null);

    // Add review step to the steps array
    const stepsWithReview = form ? [
        ...form.steps,
        { id: 'review', name: 'Review & Submit', type: 'review' }
    ] : [];

    // ============ FILE HANDLING HELPER FUNCTIONS ============

    const getFileFromPreview = async (previewUrl, fieldId) => {
        try {
            if (previewUrl instanceof File) {
                return previewUrl;
            }
            
            if (previewUrl && previewUrl.startsWith('blob:')) {
                const response = await fetch(previewUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch blob: ${response.status}`);
                }
                const blob = await response.blob();
                const fileType = blob.type || 'image/jpeg';
                const extension = fileType.split('/')[1] || 'jpg';
                return new File([blob], `${fieldId}_${Date.now()}.${extension}`, { type: fileType });
            }
            
            if (previewUrl && previewUrl.startsWith('data:')) {
                const response = await fetch(previewUrl);
                const blob = await response.blob();
                const fileType = blob.type || 'image/jpeg';
                const extension = fileType.split('/')[1] || 'jpg';
                return new File([blob], `${fieldId}_${Date.now()}.${extension}`, { type: fileType });
            }
            
            return null;
        } catch (error) {
            console.error('Error converting preview to file:', error);
            return null;
        }
    };

    const getActualFile = async (fieldId) => {
        if (uploadedFiles[fieldId]) {
            return uploadedFiles[fieldId];
        }
        
        const previewUrl = previewUrls[fieldId] || formData[fieldId];
        if (previewUrl && typeof previewUrl === 'string') {
            return await getFileFromPreview(previewUrl, fieldId);
        }
        
        return null;
    };

    // ============ OCR TEXT EXTRACTION FUNCTIONS ============

    const extractTextFromImage = async (file, side = 'front') => {
        let worker = null;
        try {
            console.log(`🔍 Starting OCR for ${side} image...`);
            
            worker = await createWorker({
                logger: m => console.log(m),
                errorHandler: err => console.error('Tesseract error:', err)
            });

            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            const { data: { text } } = await worker.recognize(file);
            console.log(`📝 Extracted text from ${side} image:`, text);
            
            await worker.terminate();
            return text || '';
        } catch (error) {
            console.error(`❌ OCR failed for ${side} image:`, error);
            if (worker) {
                await worker.terminate();
            }
            return '';
        }
    };

    // ============ EXTRACT AADHAR DATA ============

    const extractAadharData = async (fieldId) => {
        try {
            setOcrProcessing(prev => ({ 
                ...prev, 
                [`${fieldId}_processing`]: true,
                [`${fieldId}_frontProcessing`]: true,
                [`${fieldId}_backProcessing`]: true
            }));

            const frontFile = await getActualFile(`${fieldId}.frontImage`);
            const backFile = await getActualFile(`${fieldId}.backImage`);

            console.log('Files retrieved for Aadhar:', { 
                hasFront: !!frontFile, 
                hasBack: !!backFile
            });

            if (!frontFile) {
                alert('Could not process front image. Please upload again.');
                setOcrProcessing(prev => ({ 
                    ...prev, 
                    [`${fieldId}_processing`]: false,
                    [`${fieldId}_frontProcessing`]: false,
                    [`${fieldId}_backProcessing`]: false
                }));
                return;
            }

            // Extract text from images
            setExtractedText(prev => ({ ...prev, [`${fieldId}_front`]: 'Extracting text...' }));
            setExtractedText(prev => ({ ...prev, [`${fieldId}_back`]: backFile ? 'Extracting text...' : 'No back image' }));

            const frontText = await extractTextFromImage(frontFile, 'front');
            const backText = backFile ? await extractTextFromImage(backFile, 'back') : '';

            setExtractedText(prev => ({ 
                ...prev, 
                [`${fieldId}_front`]: frontText,
                [`${fieldId}_back`]: backText || 'No text extracted'
            }));

            // Combine text for API
            const combinedText = `
                FRONT IMAGE TEXT:
                ${frontText}
                
                ${backText ? `BACK IMAGE TEXT:
                ${backText}` : ''}
            `;

            // Send to API
            console.log('📤 Sending extracted text to API for Aadhar...');

            const response = await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/scann-document', {
                documentType: 'aadhaar',
                rawText: combinedText
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            console.log('✅ Aadhar Extraction Response:', response.data);

            if (response.data.success) {
                const fields = response.data.data.fields || {};
                
                // Map Aadhar fields with date conversion
                const mapping = {
                    'aadhaar_number': 'aadharNumber',
                    'name': 'firstName',
                    'date_of_birth': { field: 'dob', isDate: true },
                    'gender': 'gender',
                    'address': 'address',
                    'pincode': 'pinCode',
                    'state': 'state',
                    'district': 'district',
                    'city': 'city',
                    'relative_name': 'relativeName'
                };

                let extractedCount = 0;
                let extractedFields = [];

                Object.entries(fields).forEach(([key, value]) => {
                    if (value && value !== 'null' && value !== '' && value !== null) {
                        const mappingValue = mapping[key];
                        
                        if (mappingValue) {
                            let mappedField;
                            let isDate = false;
                            
                            if (typeof mappingValue === 'object' && mappingValue.isDate) {
                                mappedField = mappingValue.field;
                                isDate = true;
                            } else {
                                mappedField = mappingValue;
                            }
                            
                            const fullFieldId = `${fieldId}.${mappedField}`;
                            
                            if (formData[fullFieldId] !== undefined) {
                                // Convert date if needed
                                let finalValue = value;
                                if (isDate) {
                                    finalValue = convertToDateInputFormat(value);
                                    console.log(`📅 Date conversion: "${value}" → "${finalValue}"`);
                                }
                                
                                handleElementChange(fullFieldId, finalValue);
                                extractedCount++;
                                extractedFields.push(`${mappedField}: ${finalValue}`);
                            }
                        }
                    }
                });

                if (extractedCount > 0) {
                    alert(`✅ Aadhar Data Extracted Successfully!\n\nExtracted ${extractedCount} fields:\n${extractedFields.join('\n')}`);
                } else {
                    alert('⚠️ No data extracted. Please check image quality and try again.');
                }

            } else {
                throw new Error(response.data.message || 'Extraction failed');
            }

        } catch (error) {
            console.error('❌ Aadhar extraction error:', error);
            let errorMsg = 'Extraction failed: ';
            if (error.response) {
                errorMsg += error.response.data?.message || error.response.statusText;
            } else if (error.request) {
                errorMsg += 'No response from server. Please check if the server is running.';
            } else {
                errorMsg += error.message;
            }
            alert(`❌ ${errorMsg}`);
        } finally {
            setOcrProcessing(prev => ({ 
                ...prev, 
                [`${fieldId}_processing`]: false,
                [`${fieldId}_frontProcessing`]: false,
                [`${fieldId}_backProcessing`]: false
            }));
        }
    };

    // ============ EXTRACT PASSPORT DATA ============

    const extractPassportData = async (fieldId) => {
        try {
            setOcrProcessing(prev => ({ 
                ...prev, 
                [`${fieldId}_processing`]: true,
                [`${fieldId}_frontProcessing`]: true,
                [`${fieldId}_backProcessing`]: true
            }));

            const frontFile = await getActualFile(`${fieldId}.frontImage`);
            const backFile = await getActualFile(`${fieldId}.backImage`);

            console.log('Files retrieved for Passport:', { 
                hasFront: !!frontFile, 
                hasBack: !!backFile
            });

            if (!frontFile) {
                alert('Could not process front image. Please upload again.');
                setOcrProcessing(prev => ({ 
                    ...prev, 
                    [`${fieldId}_processing`]: false,
                    [`${fieldId}_frontProcessing`]: false,
                    [`${fieldId}_backProcessing`]: false
                }));
                return;
            }

            // Extract text from images
            setExtractedText(prev => ({ ...prev, [`${fieldId}_front`]: 'Extracting text...' }));
            setExtractedText(prev => ({ ...prev, [`${fieldId}_back`]: backFile ? 'Extracting text...' : 'No back image' }));

            const frontText = await extractTextFromImage(frontFile, 'front');
            const backText = backFile ? await extractTextFromImage(backFile, 'back') : '';

            setExtractedText(prev => ({ 
                ...prev, 
                [`${fieldId}_front`]: frontText,
                [`${fieldId}_back`]: backText || 'No text extracted'
            }));

            // Combine text for API
            const combinedText = `
                FRONT IMAGE TEXT:
                ${frontText}
                
                ${backText ? `BACK IMAGE TEXT:
                ${backText}` : ''}
            `;

            // Send to API
            console.log('📤 Sending extracted text to API for Passport...');

            const response = await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/scann-document', {
                documentType: 'passport',
                rawText: combinedText
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            console.log('✅ Passport Extraction Response:', response.data);

            if (response.data.success) {
                const fields = response.data.data.fields || {};
                
                // Complete Passport Field Mapping with Date Conversion
                const mapping = {
                    // Personal Information
                    'Passport No': 'passportNumber',
                    'passport_number': 'passportNumber',
                    'Passport Number': 'passportNumber',
                    'passportNo': 'passportNumber',
                    'passportNo.': 'passportNumber',
                    
                    'Surname': 'lastName',
                    'surname': 'lastName',
                    'Last Name': 'lastName',
                    'lastName': 'lastName',
                    
                    'Given Name(s)': 'firstName',
                    'given_names': 'firstName',
                    'Given Name': 'firstName',
                    'First Name': 'firstName',
                    'firstName': 'firstName',
                    
                    'Full Name': 'fullName',
                    'fullName': 'fullName',
                    'name': 'fullName',
                    
                    'Nationality': 'nationality',
                    'nationality': 'nationality',
                    'Country': 'nationality',
                    
                    'Country Code': 'countryCode',
                    'country_code': 'countryCode',
                    
                    // Dates - These will be converted to YYYY-MM-DD format
                    'Date of Birth': { field: 'dob', isDate: true },
                    'date_of_birth': { field: 'dob', isDate: true },
                    'DOB': { field: 'dob', isDate: true },
                    'dob': { field: 'dob', isDate: true },
                    'Birth Date': { field: 'dob', isDate: true },
                    
                    'Date of Issue': { field: 'issueDate', isDate: true },
                    'date_of_issue': { field: 'issueDate', isDate: true },
                    'issueDate': { field: 'issueDate', isDate: true },
                    'Issue Date': { field: 'issueDate', isDate: true },
                    
                    'Date of Expiry': { field: 'expiryDate', isDate: true },
                    'date_of_expiry': { field: 'expiryDate', isDate: true },
                    'expiryDate': { field: 'expiryDate', isDate: true },
                    'Expiry Date': { field: 'expiryDate', isDate: true },
                    'Expiration Date': { field: 'expiryDate', isDate: true },
                    
                    // Gender
                    'Sex': 'gender',
                    'sex': 'gender',
                    'gender': 'gender',
                    'Gender': 'gender',
                    
                    // Places
                    'Place of Birth': 'placeOfBirth',
                    'place_of_birth': 'placeOfBirth',
                    'placeOfBirth': 'placeOfBirth',
                    'Birth Place': 'placeOfBirth',
                    
                    'Place of Issue': 'placeOfIssue',
                    'place_of_issue': 'placeOfIssue',
                    'placeOfIssue': 'placeOfIssue',
                    'Issuing Place': 'placeOfIssue',
                    
                    // Family Details (Back side)
                    'Name of Father / Legal Guardian': 'fatherName',
                    'Father Name': 'fatherName',
                    'father_name': 'fatherName',
                    'fatherName': 'fatherName',
                    "Father's Name": 'fatherName',
                    "father_or_guardian_name":'fatherName',
                    
                    'Name of Mother': 'motherName',
                    'Mother Name': 'motherName',
                    'mother_name': 'motherName',
                    'motherName': 'motherName',
                    "Mother's Name": 'motherName',
                    
                    'Name of Spouse': 'spouseName',
                    'Spouse Name': 'spouseName',
                    'spouse_name': 'spouseName',
                    'spouseName': 'spouseName',
                    "Spouse's Name": 'spouseName',
                    
                    // Address
                    'Address': 'address',
                    'address': 'address',
                    'Address Line': 'address',
                    
                    // Old Passport Details - Date conversion for old passport issue date
                    'Old Passport No': 'oldPassportNumber',
                    'old_passport_number': 'oldPassportNumber',
                    'oldPassportNumber': 'oldPassportNumber',
                    'Old Passport Number': 'oldPassportNumber',
                    
                    'Old Passport Date of Issue': { field: 'oldPassportIssueDate', isDate: true },
                    'old_passport_issue_date': { field: 'oldPassportIssueDate', isDate: true },
                    'oldPassportIssueDate': { field: 'oldPassportIssueDate', isDate: true },
                    
                    'Old Passport Place of Issue': 'oldPassportPlaceOfIssue',
                    'old_passport_place_of_issue': 'oldPassportPlaceOfIssue',
                    'oldPassportPlaceOfIssue': 'oldPassportPlaceOfIssue',
                    
                    // File Number
                    'File No': 'fileNumber',
                    'file_number': 'fileNumber',
                    'fileNumber': 'fileNumber',
                    'File Number': 'fileNumber',
                    'File No.': 'fileNumber',
                    
                    // PIN Code
                    'PIN': 'pinCode',
                    'pin_code': 'pinCode',
                    'pincode': 'pinCode',
                    'Postal Code': 'pinCode',
                    
                    // MRZ Lines
                    'MRZ Line 1': 'mrzLine1',
                    'mrz_line1': 'mrzLine1',
                    'mrzLine1': 'mrzLine1',
                    'MRZ1': 'mrzLine1',
                    "mrz_line_1":"mrzLine1",
                    
                    'MRZ Line 2': 'mrzLine2',
                    'mrz_line2': 'mrzLine2',
                    'mrzLine2': 'mrzLine2',
                    'MRZ2': 'mrzLine2',
                     "mrz_line_2":"mrzLine2",
                };

                let extractedCount = 0;
                let extractedFields = [];

                console.log('📋 Extracted fields from API:', Object.keys(fields));

                Object.entries(fields).forEach(([key, value]) => {
                    if (value && value !== 'null' && value !== '' && value !== null) {
                        const mappingValue = mapping[key];
                        
                        if (mappingValue) {
                            let mappedField;
                            let isDate = false;
                            
                            if (typeof mappingValue === 'object' && mappingValue.isDate) {
                                mappedField = mappingValue.field;
                                isDate = true;
                            } else {
                                mappedField = mappingValue;
                            }
                            
                            const fullFieldId = `${fieldId}.${mappedField}`;
                            
                            console.log(`🔄 Mapping: "${key}" → "${mappedField}" (${fullFieldId})`);
                            
                            if (formData[fullFieldId] !== undefined) {
                                // Convert date if needed
                                let finalValue = value;
                                if (isDate) {
                                    finalValue = convertToDateInputFormat(value);
                                    console.log(`📅 Date conversion: "${value}" → "${finalValue}"`);
                                }
                                
                                handleElementChange(fullFieldId, finalValue);
                                extractedCount++;
                                extractedFields.push(`${mappedField}: ${finalValue}`);
                            }
                        } else {
                            // Try direct mapping
                            const fullFieldId = `${fieldId}.${key}`;
                            if (formData[fullFieldId] !== undefined) {
                                // Check if this field might be a date
                                let finalValue = value;
                                if (key.toLowerCase().includes('date') || key.toLowerCase().includes('dob')) {
                                    finalValue = convertToDateInputFormat(value);
                                    console.log(`📅 Date conversion: "${key}" → "${finalValue}"`);
                                }
                                handleElementChange(fullFieldId, finalValue);
                                extractedCount++;
                                extractedFields.push(`${key}: ${finalValue}`);
                            }
                        }
                    }
                });

                // Try to extract PIN from address if not directly provided
                if (!fields['PIN'] && fields['Address']) {
                    const address = fields['Address'];
                    const pinMatch = address.match(/PIN[:\s]*(\d{6})/i);
                    if (pinMatch && pinMatch[1]) {
                        const fullFieldId = `${fieldId}.pinCode`;
                        if (formData[fullFieldId] !== undefined) {
                            handleElementChange(fullFieldId, pinMatch[1]);
                            extractedCount++;
                            extractedFields.push(`pinCode: ${pinMatch[1]} (extracted from address)`);
                        }
                    }
                }

                if (extractedCount > 0) {
                    alert(`✅ Passport Data Extracted Successfully!\n\nExtracted ${extractedCount} fields:\n${extractedFields.join('\n')}`);
                } else {
                    alert('⚠️ No data extracted. Please check image quality and try again.');
                }

            } else {
                throw new Error(response.data.message || 'Extraction failed');
            }

        } catch (error) {
            console.error('❌ Passport extraction error:', error);
            let errorMsg = 'Extraction failed: ';
            if (error.response) {
                errorMsg += error.response.data?.message || error.response.statusText;
            } else if (error.request) {
                errorMsg += 'No response from server. Please check if the server is running.';
            } else {
                errorMsg += error.message;
            }
            alert(`❌ ${errorMsg}`);
        } finally {
            setOcrProcessing(prev => ({ 
                ...prev, 
                [`${fieldId}_processing`]: false,
                [`${fieldId}_frontProcessing`]: false,
                [`${fieldId}_backProcessing`]: false
            }));
        }
    };

    // ============ FORM FUNCTIONS ============

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/shared/${shareId}`);
                const rawForm = response.data.form;
                setLeadID(rawForm?.lead_id);
                
                const normalizedForm = {
                    ...rawForm,
                    steps: rawForm.steps.map(step => ({
                        ...step,
                        elements: step.elements.map(element => ({
                            ...element,
                            ...(element.config?.config || {})
                        }))
                    }))
                };

                setForm(normalizedForm);

                // Initialize form data structure
                const initialData = {};
                normalizedForm.steps.forEach(step => {
                    step.elements.forEach(field => {
                        if (field.type === 'address') {
                            initialData[`${field.id}.street1`] = '';
                            initialData[`${field.id}.street2`] = '';
                            initialData[`${field.id}.city`] = '';
                            initialData[`${field.id}.state`] = '';
                            initialData[`${field.id}.postalCode`] = '';
                        } else if (field.type === 'aadhar') {
                            initialData[`${field.id}.aadharNumber`] = '';
                            initialData[`${field.id}.firstName`] = '';
                            initialData[`${field.id}.lastName`] = '';
                            initialData[`${field.id}.dob`] = '';
                            initialData[`${field.id}.gender`] = '';
                            initialData[`${field.id}.address`] = '';
                            initialData[`${field.id}.frontImage`] = null;
                            initialData[`${field.id}.backImage`] = null;
                        } else if (field.type === 'passport') {
                            initialData[`${field.id}.passportNumber`] = '';
                            initialData[`${field.id}.firstName`] = '';
                            initialData[`${field.id}.lastName`] = '';
                            initialData[`${field.id}.fullName`] = '';
                            initialData[`${field.id}.nationality`] = '';
                            initialData[`${field.id}.countryCode`] = '';
                            initialData[`${field.id}.dob`] = '';
                            initialData[`${field.id}.placeOfBirth`] = '';
                            initialData[`${field.id}.issueDate`] = '';
                            initialData[`${field.id}.expiryDate`] = '';
                            initialData[`${field.id}.gender`] = '';
                            initialData[`${field.id}.placeOfIssue`] = '';
                            initialData[`${field.id}.frontImage`] = null;
                            initialData[`${field.id}.backImage`] = null;
                            initialData[`${field.id}.fatherName`] = '';
                            initialData[`${field.id}.motherName`] = '';
                            initialData[`${field.id}.spouseName`] = '';
                            initialData[`${field.id}.address`] = '';
                            initialData[`${field.id}.oldPassportNumber`] = '';
                            initialData[`${field.id}.oldPassportIssueDate`] = '';
                            initialData[`${field.id}.oldPassportPlaceOfIssue`] = '';
                            initialData[`${field.id}.fileNumber`] = '';
                            initialData[`${field.id}.pinCode`] = '';
                            initialData[`${field.id}.mrzLine1`] = '';
                            initialData[`${field.id}.mrzLine2`] = '';
                        } else if (field.type === 'multiple-choice') {
                            initialData[field.id] = [];
                        } else if (field.type === 'star-rating') {
                            initialData[field.id] = { rating: field.rating ?? 0 };
                        } else if (field.type === 'scale-rating') {
                            initialData[field.id] = {
                                value: field.value ?? (field.min && field.max ? Math.floor((field.min + field.max) / 2) : 5)
                            };
                        } else if (field.type === 'banner') {
                            initialData[field.id] = field.bannerImage || null;
                        } else if (field.type === 'single-choice' || field.type === 'dropdown') {
                            initialData[field.id] = field.selectedOption || '';
                        } else if (field.type === 'ocr-aadhar') {
                            initialData[`${field.id}.frontImage`] = null;
                            initialData[`${field.id}.backImage`] = null;
                            initialData[`${field.id}.aadharNumber`] = '';
                            initialData[`${field.id}.name`] = '';
                            initialData[`${field.id}.dob`] = '';
                            initialData[`${field.id}.gender`] = '';
                            initialData[`${field.id}.address`] = '';
                            initialData[`${field.id}.relativeName`] = '';
                            initialData[`${field.id}.pinCode`] = '';
                        } else if (field.type === 'ocr-passport' || field.type === 'ocr-password') {
                            initialData[`${field.id}.frontImage`] = null;
                            initialData[`${field.id}.backImage`] = null;
                            initialData[`${field.id}.passportNumber`] = '';
                            initialData[`${field.id}.fullName`] = '';
                            initialData[`${field.id}.nationality`] = '';
                            initialData[`${field.id}.dob`] = '';
                            initialData[`${field.id}.placeOfBirth`] = '';
                            initialData[`${field.id}.issueDate`] = '';
                            initialData[`${field.id}.expiryDate`] = '';
                            initialData[`${field.id}.gender`] = '';
                            initialData[`${field.id}.placeOfIssue`] = '';
                            initialData[`${field.id}.fatherName`] = '';
                            initialData[`${field.id}.motherName`] = '';
                            initialData[`${field.id}.spouseName`] = '';
                            initialData[`${field.id}.address`] = '';
                            initialData[`${field.id}.pinCode`] = '';
                            initialData[`${field.id}.oldPassportNumber`] = '';
                            initialData[`${field.id}.mrzLine1`] = '';
                            initialData[`${field.id}.mrzLine2`] = '';
                            initialData[`${field.id}.fileNumber`] = '';
                            initialData[`${field.id}.countryCode`] = '';
                        } else if (field.type === 'nearest-airport') {
                            initialData[`${field.id}.address`] = '';
                            initialData[`${field.id}.selectedAirport`] = '';
                            initialData[`${field.id}.airportCode`] = '';
                            initialData[`${field.id}.distanceKm`] = '';
                        } else if (field.type === 'signature') {
                            initialData[field.id] = field.signatureData || null;
                        } else {
                            initialData[field.id] = field.defaultValue || '';
                        }
                    });
                });
                setFormData(initialData);

                // Identify fields that have show rules
                const showTargetsSet = new Set();
                if (normalizedForm.rules) {
                    normalizedForm.rules.forEach(rule => {
                        rule.actions.forEach(action => {
                            if (action.action === 'show') {
                                showTargetsSet.add(action.target);
                            }
                        });
                    });
                }
                setShowTargets(showTargetsSet);

                // Initialize visibility: hide fields with show rules by default
                const initialVisibility = {};
                normalizedForm.steps.forEach(step => {
                    step.elements.forEach(element => {
                        initialVisibility[element.id] = !showTargetsSet.has(element.id);
                    });
                });
                setElementVisibility(initialVisibility);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load form');
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [shareId]);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(previewUrls).forEach(url => {
                if (typeof url === 'string' && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previewUrls]);

    // Update element visibility when form data changes
    useEffect(() => {
        if (!form || !form.rules) return;

        const newVisibility = { ...elementVisibility };
        let visibilityChanged = false;

        form.rules.forEach(rule => {
            const conditionsMet = rule.conditions.every(condition =>
                evaluateCondition(condition, formData)
            );

            if (conditionsMet) {
                rule.actions.forEach(action => {
                    if (action.action === 'show') {
                        if (!newVisibility[action.target]) {
                            newVisibility[action.target] = true;
                            visibilityChanged = true;
                        }
                    } else if (action.action === 'hide') {
                        if (newVisibility[action.target]) {
                            newVisibility[action.target] = false;
                            visibilityChanged = true;
                        }
                    }
                });
            } else {
                rule.actions.forEach(action => {
                    if (action.action === 'show' && showTargets.has(action.target)) {
                        if (newVisibility[action.target]) {
                            newVisibility[action.target] = false;
                            visibilityChanged = true;
                        }
                    }
                });
            }
        });

        if (visibilityChanged) {
            setElementVisibility(newVisibility);
        }
    }, [formData, form, showTargets]);

    const handleElementChange = (fieldId, updates) => {
        setFormData(prev => {
            if (prev[fieldId] !== null && typeof prev[fieldId] === 'string' && prev[fieldId].startsWith('data:image')) {
                return {
                    ...prev,
                    [fieldId]: updates
                };
            }

            if (typeof prev[fieldId] === 'object' && !Array.isArray(prev[fieldId])) {
                return {
                    ...prev,
                    [fieldId]: {
                        ...prev[fieldId],
                        ...updates
                    }
                };
            }
            return {
                ...prev,
                [fieldId]: updates
            };
        });

        if (validationErrors[fieldId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const handleSearch = async (place, fieldId) => {
        try {
            setAirportError('');
            setSearchingAirport(true);
            
            const geoResponse = await axios.get(
                'https://api.opencagedata.com/geocode/v1/json',
                {
                    params: {
                        key: "d961ea3a73bc4618ba5955a6dcd8893f",
                        q: place,
                        pretty: 1,
                        language: 'en',
                    },
                }
            );

            if (!geoResponse.data.results.length) {
                throw new Error('Location not found');
            }

            const { lat, lng } = geoResponse.data.results[0].geometry;

            const airportResponse = await axios.get(
                'https://aerodatabox.p.rapidapi.com/airports/search/location',
                {
                    params: {
                        lat,
                        lon: lng,
                        radiusKm: 200,
                        limit: 5,
                    },
                    headers: {
                        'X-RapidAPI-Key': "ab97cbeb66msh472fd9ddf3c3acep193d81jsn71726d85047f",
                        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
                    },
                }
            );

            if (!airportResponse.data.items || !airportResponse.data.items.length) {
                throw new Error('No airports found nearby');
            }

            const nearestAirport = airportResponse.data.items[0];
            
            handleElementChange(`${fieldId}.selectedAirport`, nearestAirport.name || nearestAirport.shortName || 'Unknown Airport');
            handleElementChange(`${fieldId}.distanceKm`, Math.round(calculateDistance(lat, lng, nearestAirport.location.lat, nearestAirport.location.lon)));
            handleElementChange(`${fieldId}.airportCode`, nearestAirport.iata || nearestAirport.icao || 'N/A');
            
            setNearestAirportData(prev => ({
                ...prev,
                [fieldId]: nearestAirport
            }));

        } catch (err) {
            console.error('Airport search error:', err);
            setAirportError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
        } finally {
            setSearchingAirport(false);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const handleFileUpload = (e, fieldId, fieldType) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];

        // Store the actual file
        setUploadedFiles(prev => ({ ...prev, [fieldId]: file }));
        
        // Create and store preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [fieldId]: previewUrl }));
        handleElementChange(fieldId, previewUrl);
    };

    const handleUploadButtonClick = (fieldId, fieldType) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = fieldType === 'image' ? 'image/*' : '*';
        input.multiple = fieldType === 'multiple' || fieldType === 'image-gallery';
        input.onchange = (e) => handleFileUpload(e, fieldId, fieldType);
        input.click();
    };

    const validateField = (fieldId, value, rules) => {
        const errors = [];

        if (!rules) return errors;

        rules.forEach(rule => {
            if (rule.fieldId === fieldId) {
                switch (rule.condition) {
                    case 'required':
                        if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
                            errors.push(rule.message || 'This field is required');
                        }
                        break;
                    case 'minLength':
                        if (value && value.length < rule.value) {
                            errors.push(rule.message || `Minimum length is ${rule.value}`);
                        }
                        break;
                    case 'maxLength':
                        if (value && value.length > rule.value) {
                            errors.push(rule.message || `Maximum length is ${rule.value}`);
                        }
                        break;
                    case 'regex':
                        const regex = new RegExp(rule.value);
                        if (value && !regex.test(value)) {
                            errors.push(rule.message || 'Invalid format');
                        }
                        break;
                    case 'aadhar':
                        if (value && !/^\d{12}$/.test(value)) {
                            errors.push(rule.message || 'Aadhar number must be 12 digits');
                        }
                        break;
                }
            }
        });

        return errors;
    };

    const validateCurrentStep = () => {
        if (!form) return true;

        const currentStepFields = form.steps[currentStep].elements;
        let isValid = true;
        const newErrors = {};

        currentStepFields.forEach(field => {
            if (!elementVisibility[field.id]) return;

            const value = formData[field.id];
            const errors = validateField(field.id, value, form.rules);

            if (errors.length > 0) {
                isValid = false;
                newErrors[field.id] = errors[0];
            }
        });

        setValidationErrors(newErrors);
        return isValid;
    };

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, stepsWithReview.length - 1));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const validPhoneNumber = async (phone) => {
        const API_KEY = "bdc_c86aa934de754b72aebadb76ab65ad24"
        const countryCode = "IN";
        const phoneRes = await fetch(
            `https://api-bdc.net/data/phone-number-validate?number=${encodeURIComponent(phone)}&countryCode=${countryCode}&key=${API_KEY}`
        );

        const phoneData = await phoneRes.json();
        setTriggerFuc((prev) => ({
            ...prev,
            phone: true
        }))

        console.log(phoneData);
    }

    const valiemailcheck = async (email) => {
        setTriggerFuc((prev) => ({
            ...prev,
            email: true
        }))
        const API_KEY = "bdc_c86aa934de754b72aebadb76ab65ad24"
        try {
            const emailRes = await fetch(
                `https://api-bdc.net/data/email-verify?emailAddress=${encodeURIComponent(email)}&key=${API_KEY}`
            );
            const emailData = await emailRes.json();

            if (emailData.isValid) {
                setValidtionForEmail(true);
            } else {
                setValidtionForEmail(false);
            }

        } catch (error) {
            console.error('Error validating:', error);
        }
    };

    const sendHtmlEmailOnSubmit = async (email, formName, formData, formId) => {
        try {
            let tableRows = '';
            
            for (const [key, value] of Object.entries(formData)) {
                if (value && !isEmpty(value)) {
                    const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/\./g, ' ');
                    
                    let displayValue = '';
                    
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        if (value.rating !== undefined) {
                            displayValue = `${value.rating} star${value.rating !== 1 ? 's' : ''}`;
                        } else if (value.value !== undefined) {
                            displayValue = value.value.toString();
                        } else {
                            const subFields = [];
                            for (const [subKey, subValue] of Object.entries(value)) {
                                if (subValue && typeof subValue !== 'object') {
                                    const formattedSubKey = subKey
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase());
                                    subFields.push(`${formattedSubKey}: ${subValue}`);
                                }
                            }
                            displayValue = subFields.join('<br>');
                        }
                    } else if (Array.isArray(value)) {
                        displayValue = value.length > 0 ? value.join(', ') : 'Not provided';
                    } else if (typeof value === 'string' && (value.startsWith('blob:') || value.startsWith('data:image'))) {
                        displayValue = '✅ File uploaded';
                    } else if (value) {
                        displayValue = value;
                    }
                    
                    if (displayValue) {
                        tableRows += `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px 8px; font-weight: 600; background-color: #f9fafb; width: 35%;">${escapeHtml(formattedKey)}</td>
                                <td style="padding: 12px 8px; color: #374151;">${displayValue}</td>
                            </tr>
                        `;
                    }
                }
            }
            
            const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Submission Confirmation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
        }
        .header p {
            color: #dbeafe;
            font-size: 14px;
            margin: 0;
        }
        .content {
            padding: 32px 24px;
        }
        .greeting {
            margin-bottom: 24px;
        }
        .greeting p {
            color: #374151;
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 8px 0;
        }
        .form-title {
            background-color: #eff6ff;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            border-left: 4px solid #2563eb;
        }
        .form-title h2 {
            color: #1e40af;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }
        .submission-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .submission-table tr:last-child {
            border-bottom: none;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 12px;
            margin: 0 0 4px 0;
        }
        .footer .small {
            font-size: 11px;
            color: #9ca3af;
        }
        .badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(formName)}</h1>
            <p>Form Submission Confirmation</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <p>Dear <strong>${escapeHtml(formData['Name As per Govt. ID Card'] || formData['fullName'] || 'User')}</strong>,</p>
                <p>Thank you for submitting the form. We have successfully received your information.</p>
            </div>
            
            <div class="form-title">
                <h2>📋 Submission Summary</h2>
            </div>
            
            <table class="submission-table">
                <tbody>
                    ${tableRows || '<tr><td colspan="2" style="padding: 24px; text-align: center; color: #6b7280;">No data submitted</td></tr>'}
                </tbody>
            </table>
            
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 16px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>📌 Next Steps:</strong> Our team will review your submission and contact you within 2-3 business days.
                </p>
            </div>
            
            <div class="badge">
                ✓ Submission ID: ${formId.substring(0, 8).toUpperCase()}
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
            <p class="small">© ${new Date().getFullYear()} ${formName} • All rights reserved</p>
        </div>
    </div>
</body>
</html>`;
            
            const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/email/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    subject: `✅ Form Submission Confirmation - ${formName}`,
                    htmlContent: emailHtml,
                    message: `Thank you for submitting the form "${formName}". Please view this email in HTML format for better experience.`
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to send email');
            }
            
            return { success: true, message: 'HTML confirmation email sent successfully!' };
        } catch (error) {
            console.error('Error sending HTML email:', error);
            return { success: false, error: error.message };
        }
    };

    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const handleSubmit = async () => {
        try {
            const submissionData = [];
            let userEmail = null;

            Object.keys(formData).forEach(key => {
                const element = form.steps
                    .flatMap(step => step.elements)
                    .find(el => el.id === key);
                
                if (element?.type === 'email' && formData[key]) {
                    userEmail = formData[key];
                }

                if (key.includes('.')) {
                    const [parentId, fieldName] = key.split('.');
                    const parentElement = form.steps
                        .flatMap(step => step.elements)
                        .find(el => el.id === parentId);

                    let parentObj = submissionData.find(item => item.field_id === parentId);

                    if (!parentObj) {
                        parentObj = {
                            type: parentElement?.type || '',
                            value: {},
                            field_id: parentId,
                            label: parentElement?.label || ''
                        };
                        submissionData.push(parentObj);
                    }

                    if (typeof parentObj.value !== 'object' || parentObj.value === null) {
                        parentObj.value = {};
                    }
                    parentObj.value[fieldName] = formData[key];
                } else {
                    const fieldElement = form.steps
                        .flatMap(step => step.elements)
                        .find(el => el.id === key);

                    if (formData[key] == null || formData[key] === '') return;

                    submissionData.push({
                        type: fieldElement?.type || '',
                        value: formData[key],
                        field_id: key,
                        label: fieldElement?.label || ''
                    });
                }
            });

            await axios.post(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/submit`, {
                shareId: shareId,
                lead_id: leadId,
                responses: submissionData
            });
            
            const emailFormData = {};
            
            Object.keys(formData).forEach(key => {
                if (formData[key] && !isEmpty(formData[key])) {
                    const fieldElement = form.steps
                        .flatMap(step => step.elements)
                        .find(el => el.id === key);
                    
                    const label = fieldElement?.label || key;
                    
                    if (typeof formData[key] === 'object' && !Array.isArray(formData[key])) {
                        if (formData[key].rating !== undefined) {
                            emailFormData[label] = `${formData[key].rating} stars`;
                        } else if (formData[key].value !== undefined) {
                            emailFormData[label] = formData[key].value;
                        } else {
                            const formattedObj = {};
                            for (const [subKey, subValue] of Object.entries(formData[key])) {
                                if (subValue && typeof subValue !== 'object') {
                                    const formattedSubKey = subKey
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase());
                                    formattedObj[formattedSubKey] = subValue;
                                }
                            }
                            emailFormData[label] = formattedObj;
                        }
                    } else if (Array.isArray(formData[key])) {
                        emailFormData[label] = formData[key].join(', ');
                    } else if (typeof formData[key] === 'string' && (formData[key].startsWith('blob:') || formData[key].startsWith('data:image'))) {
                        emailFormData[label] = '✅ File uploaded';
                    } else {
                        emailFormData[label] = formData[key];
                    }
                }
            });
            
            if (userEmail && userEmail.trim() !== '') {
                const emailResult = await sendHtmlEmailOnSubmit(userEmail, form.name, emailFormData, shareId);
                
                if (emailResult.success) {
                    setSubmissionSuccess('email_sent');
                } else {
                    setSubmissionSuccess('email_failed');
                }
            } else {
                setSubmissionSuccess('no_email');
            }
            
            setShowThankYou(true);
            
        } catch (err) {
            console.error('Submission error:', err);
            alert(err.response?.data?.message || 'Submission failed. Please try again.');
        }
    };

    const formatFieldValue = (fieldId, value) => {
        if (value == null || value === '') return 'Not provided';
        
        if (typeof value === 'string' && value.startsWith('blob:')) {
            return '✅ File uploaded';
        }
        
        if (typeof value === 'string' && value.startsWith('data:image') && fieldId.includes('signature')) {
            return '✅ Signature provided';
        }
        
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : 'Not provided';
        }
        
        if (typeof value === 'object') {
            if (value.rating !== undefined) {
                return `${value.rating} star${value.rating !== 1 ? 's' : ''}`;
            }
            if (value.value !== undefined) {
                return value.value.toString();
            }
            
            const nonEmptyValues = Object.entries(value)
                .filter(([key, val]) => !isEmpty(val))
                .map(([key, val]) => {
                    const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/\./g, ' ');
                    
                    if (typeof val === 'string' && val.startsWith('blob:')) {
                        return `${formattedKey}: ✅ Uploaded`;
                    }
                    return `${formattedKey}: ${val}`;
                });
            
            return nonEmptyValues.length > 0 ? nonEmptyValues.join('\n') : 'Not provided';
        }
        
        return value.toString();
    };

    const getFieldLabel = (fieldId) => {
        if (fieldId.includes('.')) {
            const [parentId, fieldName] = fieldId.split('.');
            const parentElement = form.steps
                .flatMap(step => step.elements)
                .find(el => el.id === parentId);
            
            if (parentElement) {
                const formattedFieldName = fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .replace(/(front|back)Image/i, '$1 Image')
                    .replace(/AadharNumber/i, 'Aadhar Number')
                    .replace(/PassportNumber/i, 'Passport Number')
                    .replace(/PostalCode/i, 'Postal Code')
                    .replace(/Dob/i, 'Date of Birth');
                
                return `${parentElement.label} - ${formattedFieldName}`;
            }
        } else {
            const element = form.steps
                .flatMap(step => step.elements)
                .find(el => el.id === fieldId);
            return element?.label || fieldId;
        }
        return fieldId;
    };

    const isFileField = (fieldId, currentValue) => {
        const element = form.steps
            .flatMap(step => step.elements)
            .find(el => el.id === fieldId) || 
            form.steps
                .flatMap(step => step.elements)
                .find(el => fieldId.startsWith(el.id));

        if (!element) return false;

        const fileFieldTypes = [
            'signature', 
            'file-upload', 
            'banner',
            'image-gallery'
        ];

        const isImageUploadField = fieldId.includes('frontImage') || 
               fieldId.includes('backImage') ||
               fieldId.includes('.image');

        const isFileType = fileFieldTypes.includes(element.type) || isImageUploadField;
        const hasBlobValue = currentValue && typeof currentValue === 'string' && currentValue.startsWith('blob:');

        return isFileType || hasBlobValue;
    };

    const renderFilePreview = (fieldId, value) => {
        if (!value || typeof value !== 'string') {
            return null;
        }

        if (value.startsWith('data:image') && fieldId.includes('signature')) {
            return (
                <div className="flex items-center space-x-3">
                    <img
                        src={value}
                        alt="Signature"
                        className="w-16 h-16 object-contain border rounded"
                    />
                    <span className="text-green-600 text-sm">✅ Signature provided</span>
                </div>
            );
        }

        if (value.startsWith('blob:')) {
            return (
                <div className="flex items-center space-x-3">
                    <img
                        src={value}
                        alt="Uploaded file"
                        className="w-16 h-16 object-cover border rounded"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <div className="hidden">
                        <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                        </div>
                    </div>
                    <span className="text-green-600 text-sm">✅ File uploaded</span>
                </div>
            );
        }

        return null;
    };

    const startEditing = (fieldId, currentValue) => {
        setEditingField(fieldId);
        
        if (typeof currentValue === 'object' && !Array.isArray(currentValue)) {
            setEditComplexValue(currentValue);
            setEditValue('');
        } else if (Array.isArray(currentValue)) {
            setEditValue(currentValue.join(', '));
            setEditComplexValue({});
        } else {
            setEditValue(currentValue || '');
            setEditComplexValue({});
        }

        if (currentValue && typeof currentValue === 'string' && (currentValue.startsWith('blob:') || currentValue.startsWith('data:image'))) {
            setEditFilePreview(currentValue);
        }
    };

    const cancelEditing = () => {
        setEditingField(null);
        setEditValue('');
        setEditComplexValue({});
        setEditFile(null);
        setEditFilePreview('');
    };

    const saveEditing = () => {
        if (editingField) {
            let newValue;
            
            if (editFile) {
                const previewUrl = URL.createObjectURL(editFile);
                setPreviewUrls(prev => ({ ...prev, [editingField]: previewUrl }));
                newValue = previewUrl;
            } else if (Object.keys(editComplexValue).length > 0) {
                newValue = editComplexValue;
            } else if (editValue.includes(',') && editingField.includes('.')) {
                newValue = editValue.split(',').map(item => item.trim()).filter(item => item);
            } else {
                newValue = editValue;
            }
            
            handleElementChange(editingField, newValue);
            cancelEditing();
        }
    };

    const handleComplexFieldChange = (subField, value) => {
        setEditComplexValue(prev => ({
            ...prev,
            [subField]: value
        }));
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditFile(file);
            const previewUrl = URL.createObjectURL(file);
            setEditFilePreview(previewUrl);
        }
    };

    const handleRemoveEditFile = () => {
        setEditFile(null);
        setEditFilePreview('');
        handleElementChange(editingField, '');
    };

    const renderEditInput = (fieldId, currentValue) => {
        const element = form.steps
            .flatMap(step => step.elements)
            .find(el => el.id === fieldId) || 
            form.steps
                .flatMap(step => step.elements)
                .find(el => fieldId.startsWith(el.id));

        if (!element) {
            return (
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-2 border rounded"
                    autoFocus
                />
            );
        }

        if (element.type === 'signature') {
            return (
                <div className="space-y-4">
                    <SignaturePad 
                        fieldId={fieldId}
                        onSave={(signatureData) => {
                            handleElementChange(fieldId, signatureData);
                            setEditFilePreview(signatureData);
                        }}
                        currentSignature={currentValue}
                    />
                    {currentValue && (
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">
                                Current signature will be replaced when you draw a new one.
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        if (isFileField(fieldId, currentValue)) {
            return (
                <div className="space-y-4">
                    {(editFilePreview || (currentValue && typeof currentValue === 'string' && (currentValue.startsWith('blob:') || currentValue.startsWith('data:image')))) && (
                        <div>
                            <p className="text-sm font-medium mb-2">Current File:</p>
                            {editFilePreview || currentValue ? (
                                <img
                                    src={editFilePreview || currentValue}
                                    alt="Preview"
                                    className="w-full max-w-xs h-auto border rounded-lg"
                                />
                            ) : (
                                <p className="text-gray-500">No file uploaded</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="file"
                            onChange={handleEditFileChange}
                            className="w-full p-2 border rounded"
                            accept={element.type === 'image' ? 'image/*' : '*'}
                        />
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => document.querySelector('input[type="file"]').click()}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                                Choose New File
                            </button>
                            {(editFilePreview || (currentValue && typeof currentValue === 'string' && (currentValue.startsWith('blob:') || currentValue.startsWith('data:image')))) && (
                                <button
                                    type="button"
                                    onClick={handleRemoveEditFile}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                    Remove File
                                </button>
                            )}
                        </div>
                    </div>

                    {editFile && (
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-sm">
                                <strong>Selected File:</strong> {editFile.name}<br/>
                                <strong>Size:</strong> {(editFile.size / 1024 / 1024).toFixed(2)} MB<br/>
                                <strong>Type:</strong> {editFile.type}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        if (fieldId.includes('.')) {
            const [parentId, subField] = fieldId.split('.');
            const parentElement = form.steps
                .flatMap(step => step.elements)
                .find(el => el.id === parentId);

            if (!parentElement) {
                return (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoFocus
                    />
                );
            }

            switch (parentElement.type) {
                case 'address':
                case 'aadhar':
                case 'passport':
                case 'ocr-aadhar':
                case 'ocr-passport':
                case 'ocr-password':
                case 'nearest-airport':
                    return (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder={`Enter ${subField}`}
                            autoFocus
                        />
                    );
                
                default:
                    return (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                        />
                    );
            }
        }

        switch (element.type) {
            case 'star-rating':
                return (
                    <div className="flex items-center">
                        {[...Array(element.maxRating || 5)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleComplexFieldChange('rating', i + 1)}
                                className="text-2xl mr-1 cursor-pointer"
                            >
                                {i < (editComplexValue.rating || 0) ? "★" : "☆"}
                            </button>
                        ))}
                    </div>
                );

            case 'scale-rating':
                return (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span>{element.min || 1}</span>
                            <input
                                type="range"
                                min={element.min || 1}
                                max={element.max || 10}
                                value={editComplexValue.value || currentValue?.value || 5}
                                onChange={(e) => handleComplexFieldChange('value', parseInt(e.target.value))}
                                className="w-full mx-2"
                            />
                            <span>{element.max || 10}</span>
                        </div>
                        <div className="text-center">Value: {editComplexValue.value || currentValue?.value || 5}</div>
                    </div>
                );

            case 'multiple-choice':
                return (
                    <div>
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter options separated by commas"
                            rows={3}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple choices with commas</p>
                    </div>
                );

            case 'single-choice':
            case 'dropdown':
                return (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoFocus
                    >
                        <option value="">Select an option</option>
                        {element.options?.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoFocus
                    />
                );

            case 'time':
                return (
                    <input
                        type="time"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoFocus
                    />
                );

            case 'email':
                return (
                    <div>
                        <input
                            type="email"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                        />
                    </div>
                );

            case 'phone':
                return (
                    <div>
                        <input
                            type="tel"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                        />
                    </div>
                );

            default:
                return (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoFocus
                    />
                );
        }
    };

    const downloadFormAsImage = async () => {
        if (!formContainerRef.current) {
            console.error('Form container ref not found');
            alert('Cannot capture form. Please try again.');
            return;
        }

        try {
            const downloadBtn = document.querySelector('.download-btn');
            const originalBtnText = downloadBtn?.textContent;
            
            if (downloadBtn) {
                downloadBtn.textContent = "Downloading...";
                downloadBtn.disabled = true;
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(formContainerRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                removeContainer: true,
                onclone: (clonedDoc, element) => {
                    const downloadBtns = clonedDoc.querySelectorAll('.download-btn');
                    downloadBtns.forEach(btn => {
                        btn.style.display = 'none';
                    });
                }
            });

            const imageData = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `form-${form?.name || 'data'}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = imageData;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (downloadBtn) {
                downloadBtn.textContent = originalBtnText;
                downloadBtn.disabled = false;
            }

            console.log('Form downloaded successfully');

        } catch (error) {
            console.error('Error capturing form screenshot:', error);
            alert('Failed to download form as image. Please try again.');
            
            const downloadBtn = document.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.textContent = "📸 Download as Image";
                downloadBtn.disabled = false;
            }
        }
    };

    const downloadFormAsText = () => {
        try {
            let textContent = `FORM: ${form?.name || 'Untitled Form'}\n`;
            textContent += `Generated on: ${new Date().toLocaleString()}\n`;
            textContent += '='.repeat(60) + '\n\n';

            const fieldGroups = {};
            
            Object.entries(formData)
                .filter(([_, value]) => !isEmpty(value))
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .forEach(([fieldId, value]) => {
                    if (fieldId.includes('.')) {
                        const [parentId] = fieldId.split('.');
                        if (!fieldGroups[parentId]) {
                            fieldGroups[parentId] = [];
                        }
                        fieldGroups[parentId].push({ fieldId, value });
                    } else {
                        if (!fieldGroups[fieldId]) {
                            fieldGroups[fieldId] = [];
                        }
                        fieldGroups[fieldId].push({ fieldId, value });
                    }
                });

            if (Object.keys(fieldGroups).length === 0) {
                textContent += 'No form data filled yet.\n';
            } else {
                Object.entries(fieldGroups).forEach(([parentId, fields]) => {
                    const parentElement = form.steps
                        .flatMap(step => step.elements)
                        .find(el => el.id === parentId);
                    
                    const isComplexField = fields.length > 1 || 
                        (fields.length === 1 && typeof fields[0].value === 'object' && !fields[0].value.startsWith?.('blob:'));
                    
                    if (isComplexField) {
                        textContent += `📋 ${parentElement?.label || getFieldLabel(parentId)}\n`;
                        textContent += '-'.repeat(40) + '\n';
                        
                        fields.forEach(({ fieldId, value }) => {
                            const label = getFieldLabel(fieldId).replace(`${parentElement?.label || parentId} - `, '');
                            const formattedValue = formatFieldValue(fieldId, value);
                            textContent += `  • ${label}: ${formattedValue.replace(/\n/g, '\n    ')}\n`;
                        });
                        textContent += '\n';
                    } else {
                        fields.forEach(({ fieldId, value }) => {
                            const label = getFieldLabel(fieldId);
                            const formattedValue = formatFieldValue(fieldId, value);
                            textContent += `• ${label}:\n  ${formattedValue.replace(/\n/g, '\n  ')}\n\n`;
                        });
                    }
                });
            }

            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `form-data-${form?.name || 'form'}-${new Date().toISOString().split('T')[0]}.txt`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading text file:', error);
            alert('Failed to download text file. Please try again.');
        }
    };

    const ThankYouModal = () => {
        if (!showThankYou) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Thank You!
                    </h2>
                    
                    <p className="text-gray-600 mb-4">
                        Your form has been submitted successfully. We appreciate your time and will get back to you soon.
                    </p>
                    
                    {submissionSuccess && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                {submissionSuccess === 'email_sent' ? (
                                    '📧 A confirmation email has been sent to your email address.'
                                ) : submissionSuccess === 'email_failed' ? (
                                    '⚠️ Form submitted but confirmation email could not be sent.'
                                ) : (
                                    '✅ Form submitted successfully!'
                                )}
                            </p>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setShowThankYou(false);
                                setCurrentStep(0);
                                const resetData = {};
                                Object.keys(formData).forEach(key => {
                                    resetData[key] = '';
                                });
                                setFormData(resetData);
                            }}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Close
                        </button>
                        
                        <button
                            onClick={() => {
                                setShowThankYou(false);
                                setCurrentStep(0);
                                const resetData = {};
                                Object.keys(formData).forEach(key => {
                                    resetData[key] = '';
                                });
                                setFormData(resetData);
                            }}
                            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            Fill Another Form
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderReviewStep = () => {
        const fieldGroups = {};
        
        Object.entries(formData)
            .filter(([_, value]) => !isEmpty(value))
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .forEach(([fieldId, value]) => {
                if (fieldId.includes('.')) {
                    const [parentId] = fieldId.split('.');
                    if (!fieldGroups[parentId]) {
                        fieldGroups[parentId] = [];
                    }
                    fieldGroups[parentId].push({ fieldId, value });
                } else {
                    if (!fieldGroups[fieldId]) {
                        fieldGroups[fieldId] = [];
                    }
                    fieldGroups[fieldId].push({ fieldId, value });
                }
            });

        return (
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Review Your Information</h2>
                <div className="space-y-6">
                    {Object.keys(fieldGroups).length > 0 ? (
                        Object.entries(fieldGroups).map(([parentId, fields]) => {
                            const parentElement = form.steps
                                .flatMap(step => step.elements)
                                .find(el => el.id === parentId);
                            
                            const isComplexField = fields.length > 1 || 
                                (fields.length === 1 && typeof fields[0].value === 'object' && !fields[0].value.startsWith?.('blob:'));
                            
                            return (
                                <div key={parentId} className="border-b pb-4 last:border-b-0">
                                    {isComplexField ? (
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800">
                                                {parentElement?.label || getFieldLabel(parentId)}
                                            </h3>
                                            <div className="space-y-3 ml-4">
                                                {fields.map(({ fieldId, value }) => (
                                                    <div key={fieldId} className="flex flex-col sm:flex-row sm:items-start justify-between">
                                                        <div className="sm:w-1/3 mb-2 sm:mb-0">
                                                            <label className="font-medium text-gray-700 text-sm">
                                                                {getFieldLabel(fieldId).replace(`${parentElement?.label || parentId} - `, '')}
                                                            </label>
                                                        </div>
                                                        
                                                        <div className="sm:w-2/3">
                                                            {editingField === fieldId ? (
                                                                <div className="space-y-2">
                                                                    {renderEditInput(fieldId, value)}
                                                                    <div className="flex space-x-2 mt-2">
                                                                        <button
                                                                            onClick={saveEditing}
                                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelEditing}
                                                                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        {isFileField(fieldId, value) && value ? (
                                                                            renderFilePreview(fieldId, value)
                                                                        ) : (
                                                                            <pre className="text-gray-900 break-words whitespace-pre-wrap font-sans">
                                                                                {formatFieldValue(fieldId, value)}
                                                                            </pre>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => startEditing(fieldId, value)}
                                                                        className="flex-shrink-0 ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                        title="Edit this field"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        fields.map(({ fieldId, value }) => (
                                            <div key={fieldId} className="flex flex-col sm:flex-row sm:items-start justify-between">
                                                <div className="sm:w-1/3 mb-2 sm:mb-0">
                                                    <label className="font-medium text-gray-700 text-sm">
                                                        {getFieldLabel(fieldId)}
                                                    </label>
                                                </div>
                                                
                                                <div className="sm:w-2/3">
                                                    {editingField === fieldId ? (
                                                        <div className="space-y-2">
                                                            {renderEditInput(fieldId, value)}
                                                            <div className="flex space-x-2 mt-2">
                                                                <button
                                                                    onClick={saveEditing}
                                                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                {isFileField(fieldId, value) && value ? (
                                                                    renderFilePreview(fieldId, value)
                                                                ) : (
                                                                    <pre className="text-gray-900 break-words whitespace-pre-wrap font-sans">
                                                                        {formatFieldValue(fieldId, value)}
                                                                    </pre>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => startEditing(fieldId, value)}
                                                                className="flex-shrink-0 ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                title="Edit this field"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No information provided yet.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-8">
                    <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Back to Form
                    </button>
                    
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                const firstIncompleteStep = form.steps.findIndex((step, index) => {
                                    const hasVisibleFields = step.elements.some(el => elementVisibility[el.id]);
                                    return hasVisibleFields && index < currentStep;
                                });
                                
                                if (firstIncompleteStep !== -1) {
                                    setCurrentStep(firstIncompleteStep);
                                } else {
                                    handlePrevStep();
                                }
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Edit Form
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => {
                                handleSubmit();
                                downloadFormAsImage();
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Submit Form
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDescription = (element) => {
        if (element.description) {
            return <p className="mt-1 text-sm text-gray-500">{element.description}</p>;
        }
        return null;
    };

    const renderError = (fieldId) => {
        const error = validationErrors[fieldId];
        if (error) {
            return <p className="mt-1 text-sm text-red-600">{error}</p>;
        }
        return null;
    };

    const renderField = (element) => {
        if (!elementVisibility[element.id]) {
            return null;
        }

        const style = element.styles || {};
        const fieldId = element.id;

        switch (element.type) {
            case "heading":
                const HeadingTag = element.level || "h2";
                return (
                    <div style={style}>
                        <HeadingTag className="font-bold">{element.text}</HeadingTag>
                        {renderDescription(element)}
                    </div>
                );

            case "full-name":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder={element.placeholder}
                            value={formData[fieldId] || ""}
                            onChange={(e) => handleElementChange(fieldId, e.target.value)}
                        />
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "phone":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className='flex gap-3 items-baseline justify-center'>
                            <div className='w-full'>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder={element.placeholder}
                                    value={formData[fieldId] || ""}
                                    onChange={(e) => handleElementChange(fieldId, e.target.value)}
                                />

                                {
                                    triggerFuc?.phone && (validtionforemail ? <p className='text-[11px] text-[green]'>Valid Phone Number</p> : <p className='text-[11px] text-[red]'>InValid Phone Number</p>)
                                }
                            </div>

                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300" onClick={() => {
                                    validPhoneNumber(formData[fieldId])
                                }}
                            >
                                Verify
                            </button>
                        </div>

                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "email":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className='flex gap-3 items-baseline justify-center'>
                            <div className='w-full'>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder={element.placeholder}
                                    value={formData[fieldId] || ""}
                                    onChange={(e) => handleElementChange(fieldId, e.target.value)}
                                />

                                {
                                    triggerFuc?.email && (validtionforemail ? <p className='text-[11px] text-[green]'>Valid Email</p> : <p className='text-[11px] text-[red]'>InValid Email</p>)
                                }
                            </div>

                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300" onClick={() => {
                                    valiemailcheck(formData[fieldId])
                                }}
                            >
                                Verify
                            </button>
                        </div>

                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "address":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={formData[`${fieldId}.street1`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.street1`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Street Address"
                            />
                            <input
                                type="text"
                                value={formData[`${fieldId}.street2`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.street2`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Street Address Line 2"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.city`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.city`, e.target.value)}
                                    className="p-2 border rounded"
                                    placeholder="City"
                                />
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.state`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.state`, e.target.value)}
                                    className="p-2 border rounded"
                                    placeholder="State/Province"
                                />
                            </div>
                            <input
                                type="text"
                                value={formData[`${fieldId}.postalCode`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.postalCode`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Postal/Zip Code"
                            />
                        </div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "download-document":
                return (
                    <div style={style}>
                        {element.label && (
                            <label className="block mb-1 font-medium">
                                {element.label}
                            </label>
                        )}
                        {element.document ? (
                            <a
                                href={element.document.url}
                                download={element.document.name}
                                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                            >
                                {element.buttonText || "Download"}
                            </a>
                        ) : (
                            <div className="text-gray-500 italic">No document uploaded</div>
                        )}
                        {renderDescription(element)}
                    </div>
                );

            // ============ AADHAR CASE WITH EXTRACT BUTTON ============
            case "aadhar":
                return (
                    <div style={style} className="space-y-4">
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md">
                            <p className="text-sm text-blue-700">
                                <strong>📌 Instructions:</strong> Upload both front and back images of the Aadhar card, 
                                then click "Extract Data" to auto-fill the fields.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="text"
                                value={formData[`${fieldId}.aadharNumber`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.aadharNumber`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Aadhar Number (12 digits)"
                                maxLength="12"
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.firstName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.firstName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.lastName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.lastName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <input
                                type="date"
                                value={formData[`${fieldId}.dob`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.dob`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Date of Birth"
                            />
                            <select
                                value={formData[`${fieldId}.gender`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.gender`, e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <textarea
                                value={formData[`${fieldId}.address`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.address`, e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={3}
                                placeholder="Address as on Aadhar"
                            />

                            {/* Image Upload Section */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <div className="font-medium mb-2">Front Image</div>
                                    {previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`] ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]}
                                                alt="Aadhar Front"
                                                className="w-full h-40 object-contain border rounded-lg"
                                            />
                                            {ocrProcessing[`${fieldId}.frontProcessing`] && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                                                        <span className="text-sm">Processing...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploadedFiles(prev => ({ ...prev, [`${fieldId}.frontImage`]: file }));
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setPreviewUrls(prev => ({ ...prev, [`${fieldId}.frontImage`]: previewUrl }));
                                                            handleElementChange(`${fieldId}.frontImage`, previewUrl);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                                title="Change image"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            onClick={() => handleUploadButtonClick(`${fieldId}.frontImage`, 'image')}
                                        >
                                            <div className="text-2xl mb-2">📷</div>
                                            <div className="text-sm">Click to upload front image</div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="font-medium mb-2">Back Image</div>
                                    {previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`] ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`]}
                                                alt="Aadhar Back"
                                                className="w-full h-40 object-contain border rounded-lg"
                                            />
                                            {ocrProcessing[`${fieldId}.backProcessing`] && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                                                        <span className="text-sm">Processing...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploadedFiles(prev => ({ ...prev, [`${fieldId}.backImage`]: file }));
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setPreviewUrls(prev => ({ ...prev, [`${fieldId}.backImage`]: previewUrl }));
                                                            handleElementChange(`${fieldId}.backImage`, previewUrl);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                                title="Change image"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            onClick={() => handleUploadButtonClick(`${fieldId}.backImage`, 'image')}
                                        >
                                            <div className="text-2xl mb-2">📷</div>
                                            <div className="text-sm">Click to upload back image</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* EXTRACT DATA BUTTON */}
                            <div className="mt-4">
                                <button
                                    onClick={async () => {
                                        const hasFront = previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`];
                                        const hasBack = previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`];
                                        
                                        if (!hasFront) {
                                            alert('Please upload front image first');
                                            return;
                                        }
                                        
                                        if (!hasBack) {
                                            alert('Please upload back image first');
                                            return;
                                        }

                                        await extractAadharData(fieldId);
                                    }}
                                    disabled={
                                        ocrProcessing[`${fieldId}_processing`] || 
                                        !(previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]) ||
                                        !(previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`])
                                    }
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                                >
                                    {ocrProcessing[`${fieldId}_processing`] ? (
                                        <>
                                            <span className="inline-block animate-spin mr-2">⏳</span>
                                            Extracting Data...
                                        </>
                                    ) : (
                                        '🔍 Extract Data from Aadhar Card'
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    {!(previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]) 
                                        ? '⚠️ Please upload front image first' 
                                        : !(previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`])
                                        ? '⚠️ Please upload back image first'
                                        : '✅ Both images uploaded. Click to extract data.'}
                                </p>
                            </div>
                        </div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            // ============ PASSPORT CASE WITH EXTRACT BUTTON ============
            case "passport":
                return (
                    <div style={style} className="space-y-4">
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md">
                            <p className="text-sm text-blue-700">
                                <strong>📌 Instructions:</strong> Upload both front and back images of the Passport, 
                                then click "Extract Data" to auto-fill the fields.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {/* Personal Information */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Passport Number</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.passportNumber`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.passportNumber`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Passport Number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country Code</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.countryCode`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.countryCode`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Country Code"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.firstName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.firstName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.lastName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.lastName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.fullName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.fullName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nationality</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.nationality`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.nationality`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Nationality"
                                    />
                                </div>
                            </div>

                            {/* Dates and Places - Using type="date" */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData[`${fieldId}.dob`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.dob`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Date of Birth"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.gender`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.gender`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Gender (M/F)"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Place of Birth</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.placeOfBirth`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.placeOfBirth`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Place of Birth"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Place of Issue</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.placeOfIssue`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.placeOfIssue`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Place of Issue"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Issue</label>
                                    <input
                                        type="date"
                                        value={formData[`${fieldId}.issueDate`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.issueDate`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Date of Issue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Expiry</label>
                                    <input
                                        type="date"
                                        value={formData[`${fieldId}.expiryDate`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.expiryDate`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Date of Expiry"
                                    />
                                </div>
                            </div>

                            {/* Family Details */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Father's Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.fatherName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.fatherName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Father's Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mother's Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.motherName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.motherName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Mother's Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Spouse's Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.spouseName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.spouseName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Spouse's Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">File Number</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.fileNumber`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.fileNumber`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="File Number"
                                    />
                                </div>
                            </div>

                            {/* Old Passport Details */}
                            <div className="border-t pt-3 mt-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Old Passport Details</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Old Passport Number</label>
                                        <input
                                            type="text"
                                            value={formData[`${fieldId}.oldPassportNumber`] || ""}
                                            onChange={(e) => handleElementChange(`${fieldId}.oldPassportNumber`, e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="Old Passport Number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Old Passport Issue Date</label>
                                        <input
                                            type="date"
                                            value={formData[`${fieldId}.oldPassportIssueDate`] || ""}
                                            onChange={(e) => handleElementChange(`${fieldId}.oldPassportIssueDate`, e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="Old Passport Issue Date"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium mb-1">Old Passport Place of Issue</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.oldPassportPlaceOfIssue`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.oldPassportPlaceOfIssue`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Old Passport Place of Issue"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <textarea
                                    value={formData[`${fieldId}.address`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.address`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows={3}
                                    placeholder="Address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">PIN Code</label>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.pinCode`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.pinCode`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="PIN Code"
                                    maxLength="6"
                                />
                            </div>

                            {/* MRZ Lines */}
                            <div className="border-t pt-3 mt-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Machine Readable Zone (MRZ)</label>
                                <div>
                                    <label className="block text-sm font-medium mb-1">MRZ Line 1</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.mrzLine1`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.mrzLine1`, e.target.value)}
                                        className="w-full p-2 border rounded font-mono text-sm bg-gray-50"
                                        placeholder="MRZ Line 1"
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium mb-1">MRZ Line 2</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.mrzLine2`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.mrzLine2`, e.target.value)}
                                        className="w-full p-2 border rounded font-mono text-sm bg-gray-50"
                                        placeholder="MRZ Line 2"
                                    />
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <div className="font-medium mb-2">Front Image</div>
                                    {previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`] ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]}
                                                alt="Passport Front"
                                                className="w-full h-40 object-contain border rounded-lg"
                                            />
                                            {ocrProcessing[`${fieldId}.frontProcessing`] && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                                                        <span className="text-sm">Processing...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploadedFiles(prev => ({ ...prev, [`${fieldId}.frontImage`]: file }));
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setPreviewUrls(prev => ({ ...prev, [`${fieldId}.frontImage`]: previewUrl }));
                                                            handleElementChange(`${fieldId}.frontImage`, previewUrl);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                                title="Change image"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            onClick={() => handleUploadButtonClick(`${fieldId}.frontImage`, 'image')}
                                        >
                                            <div className="text-2xl mb-2">📷</div>
                                            <div className="text-sm">Click to upload front image</div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="font-medium mb-2">Back Image</div>
                                    {previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`] ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`]}
                                                alt="Passport Back"
                                                className="w-full h-40 object-contain border rounded-lg"
                                            />
                                            {ocrProcessing[`${fieldId}.backProcessing`] && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                                                        <span className="text-sm">Processing...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploadedFiles(prev => ({ ...prev, [`${fieldId}.backImage`]: file }));
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setPreviewUrls(prev => ({ ...prev, [`${fieldId}.backImage`]: previewUrl }));
                                                            handleElementChange(`${fieldId}.backImage`, previewUrl);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                                title="Change image"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            onClick={() => handleUploadButtonClick(`${fieldId}.backImage`, 'image')}
                                        >
                                            <div className="text-2xl mb-2">📷</div>
                                            <div className="text-sm">Click to upload back image</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* EXTRACT DATA BUTTON */}
                            <div className="mt-4">
                                <button
                                    onClick={async () => {
                                        const hasFront = previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`];
                                        const hasBack = previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`];
                                        
                                        if (!hasFront) {
                                            alert('Please upload front image first');
                                            return;
                                        }
                                        
                                        if (!hasBack) {
                                            alert('Please upload back image first');
                                            return;
                                        }

                                        await extractPassportData(fieldId);
                                    }}
                                    disabled={
                                        ocrProcessing[`${fieldId}_processing`] || 
                                        !(previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]) ||
                                        !(previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`])
                                    }
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                                >
                                    {ocrProcessing[`${fieldId}_processing`] ? (
                                        <>
                                            <span className="inline-block animate-spin mr-2">⏳</span>
                                            Extracting Data...
                                        </>
                                    ) : (
                                        '🔍 Extract Data from Passport'
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    {!(previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]) 
                                        ? '⚠️ Please upload front image first' 
                                        : !(previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`])
                                        ? '⚠️ Please upload back image first'
                                        : '✅ Both images uploaded. Click to extract data.'}
                                </p>
                            </div>
                        </div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "dropdown":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData[fieldId] || ""}
                            onChange={(e) => handleElementChange(fieldId, e.target.value)}
                        >
                            <option value="">Select an option</option>
                            {element.options?.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                            ))}
                        </select>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "single-choice":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="space-y-2">
                            {element.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`radio-${fieldId}`}
                                        className="mr-2"
                                        checked={formData[fieldId] === option}
                                        onChange={() => handleElementChange(fieldId, option)}
                                    />
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "multiple-choice":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="space-y-2">
                            {element.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={formData[fieldId]?.includes(option) || false}
                                        onChange={(e) => {
                                            const selected = formData[fieldId] || [];
                                            const newSelected = e.target.checked
                                                ? [...selected, option]
                                                : selected.filter(opt => opt !== option);
                                            handleElementChange(fieldId, newSelected);
                                        }}
                                    />
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "paragraph":
                return (
                    <div style={style}>
                        <p className="text-gray-700">{element.content}</p>
                        {renderDescription(element)}
                    </div>
                );

            case "date":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="date"
                            value={formData[fieldId] || ""}
                            onChange={(e) => handleElementChange(fieldId, e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "time":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="time"
                            value={formData[fieldId] || ""}
                            onChange={(e) => handleElementChange(fieldId, e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "signature":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <SignaturePad 
                            fieldId={fieldId}
                            onSave={(signatureData) => handleElementChange(fieldId, signatureData)}
                            currentSignature={formData[fieldId]}
                        />
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "file-upload":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e, fieldId, 'file')}
                            className="hidden"
                        />
                        {formData[fieldId] ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="truncate">
                                        {formData[fieldId].name || 'Uploaded file'}
                                    </span>
                                    <span className="text-green-500 ml-2">✓</span>
                                </div>
                                <button
                                    onClick={() => handleElementChange(fieldId, null)}
                                    className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                                >
                                    Remove File
                                </button>
                        </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <div className="text-gray-500 mb-2">No file chosen</div>
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
                                    onClick={() => handleUploadButtonClick(fieldId, 'file')}
                                >
                                    Choose File
                                </button>
                            </div>
                        )}
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "star-rating":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="flex items-center">
                            {[...Array(element.maxRating || 5)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleElementChange(fieldId, { rating: i + 1 })}
                                    className="text-2xl mr-1 cursor-pointer"
                                >
                                    {i < (formData[fieldId]?.rating || 0) ? "★" : "☆"}
                                </button>
                            ))}
                        </div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "scale-rating":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="flex items-center justify-between">
                            <span>{element.min || 1}</span>
                            <input
                                type="range"
                                min={element.min || 1}
                                max={element.max || 10}
                                value={formData[fieldId]?.value || 5}
                                onChange={(e) =>
                                    handleElementChange(fieldId, { value: parseInt(e.target.value) })
                                }
                                className="w-full mx-2"
                            />
                            <span>{element.max || 10}</span>
                        </div>
                        <div className="text-center mt-1">{formData[fieldId]?.value || 5}</div>
                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "banner":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">{element.label}</label>
                        {previewUrls[fieldId] || formData[fieldId] ? (
                            <div className="relative">
                                <img
                                    src={previewUrls[fieldId] || formData[fieldId]}
                                    alt="Banner"
                                    className="w-full object-cover rounded-lg"
                                    style={{ height: `${element.height}px` }}
                                />
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{ height: `${element.height}px` }}
                                onClick={() => handleUploadButtonClick(fieldId, 'image')}
                            >
                                <span className="text-gray-500">Upload banner</span>
                            </div>
                        )}
                        {renderDescription(element)}
                    </div>
                );

            case "hyperlink":
                return (
                    <div style={style}>
                        <a
                            href={element.url}
                            target={element.openInNewTab ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {element.text}
                        </a>
                        {renderDescription(element)}
                    </div>
                );

            case "image-gallery":
                return (
                    <div style={style}>
                        {element.label && (
                            <label className="block mb-1 font-medium">
                                {element.label}
                            </label>
                        )}

                        {element.layout === "grid" ? (
                            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${element.columns}, 1fr)` }}>
                                {element.images?.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.url}
                                        alt={img.name}
                                        className="w-full h-auto object-contain rounded"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="relative overflow-hidden">
                                <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide">
                                    {element.images?.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img.url}
                                            alt={img.name}
                                            className="h-48 w-auto object-contain rounded"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {renderDescription(element)}
                    </div>
                );

            case "divider":
                return (
                    <div className="relative my-6" style={style}>
                        <hr className="border-t-2 border-gray-300" />
                        {element.description && (
                            <div className="text-xs text-gray-500 mt-1 text-center">
                                {element.description}
                            </div>
                        )}
                    </div>
                );

            case "nearest-airport":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Enter Location</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.address`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.address`, e.target.value)}
                                    className="flex-1 p-2 border rounded"
                                    placeholder="Enter city, address, or landmark"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleSearch(formData[`${fieldId}.address`], fieldId)}
                                    disabled={searchingAirport || !formData[`${fieldId}.address`]}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {searchingAirport ? 'Searching...' : 'Find Airport'}
                                </button>
                            </div>
                            {airportError && (
                                <p className="mt-1 text-sm text-red-600">{airportError}</p>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Nearest Airport</label>
                            <input
                                type="text"
                                value={formData[`${fieldId}.selectedAirport`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.selectedAirport`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Airport will be auto-filled"
                                readOnly={!!formData[`${fieldId}.selectedAirport`]}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Airport Code</label>
                            <input
                                type="text"
                                value={formData[`${fieldId}.airportCode`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.airportCode`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Code will be auto-filled"
                                readOnly={!!formData[`${fieldId}.airportCode`]}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Distance (KM)</label>
                            <input
                                type="number"
                                value={formData[`${fieldId}.distanceKm`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.distanceKm`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Distance will be calculated"
                                readOnly={!!formData[`${fieldId}.distanceKm`]}
                            />
                        </div>

                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "ocr-aadhar":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <div className="font-medium mb-2">Front Image (OCR)</div>
                                {previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`] ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]}
                                            alt="Aadhar Front"
                                            className="w-full h-40 object-contain border rounded-lg"
                                        />
                                        {ocrProcessing[`${fieldId}.frontImage`] && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                                <span className="ml-3 text-white">Processing...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer"
                                        onClick={() => handleUploadButtonClick(`${fieldId}.frontImage`, 'image')}
                                    >
                                        Click to upload front image
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="font-medium mb-2">Back Image (OCR)</div>
                                {previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`] ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`]}
                                            alt="Aadhar Back"
                                            className="w-full h-40 object-contain border rounded-lg"
                                        />
                                        {ocrProcessing[`${fieldId}.backImage`] && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                                <span className="ml-3 text-white">Processing...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer"
                                        onClick={() => handleUploadButtonClick(`${fieldId}.backImage`, 'image')}
                                    >
                                        Click to upload back image
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <input
                                type="text"
                                value={formData[`${fieldId}.aadharNumber`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.aadharNumber`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Aadhar Number (auto-filled by OCR)"
                            />
                            <input
                                type="text"
                                value={formData[`${fieldId}.name`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.name`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Name (auto-filled by OCR)"
                            />
                            <input
                                type="date"
                                value={formData[`${fieldId}.dob`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.dob`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Date of Birth (auto-filled by OCR)"
                            />
                            <input
                                type="text"
                                value={formData[`${fieldId}.gender`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.gender`, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Gender (auto-filled by OCR)"
                            />
                            <textarea
                                value={formData[`${fieldId}.address`] || ""}
                                onChange={(e) => handleElementChange(`${fieldId}.address`, e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={3}
                                placeholder="Address (auto-filled by OCR)"
                            />

                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-medium text-gray-700 mb-3">Back Side Details (Optional)</h4>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.relativeName`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.relativeName`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Father's/Husband's Name (auto-filled by OCR)"
                                />
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.pinCode`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.pinCode`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="PIN Code (auto-filled by OCR)"
                                />
                            </div>
                        </div>

                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            case "ocr-passport":
            case "ocr-password":
                return (
                    <div style={style}>
                        <label className="block mb-1 font-medium">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>Tip:</strong> Upload clear images of both front and back pages
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <div className="font-medium mb-2">Front Page (Photo Page)</div>
                                {previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`] ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrls[`${fieldId}.frontImage`] || formData[`${fieldId}.frontImage`]}
                                            alt="Document Front"
                                            className="w-full h-40 object-contain border rounded-lg"
                                        />
                                        {ocrProcessing[`${fieldId}.frontImage`] && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                                <span className="ml-3 text-white">Processing...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                        onClick={() => handleUploadButtonClick(`${fieldId}.frontImage`, 'image')}
                                    >
                                        <div className="text-2xl mb-2">📷</div>
                                        <div className="text-sm">Click to upload front page</div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="font-medium mb-2">Back Page (Family Details)</div>
                                {previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`] ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrls[`${fieldId}.backImage`] || formData[`${fieldId}.backImage`]}
                                            alt="Document Back"
                                            className="w-full h-40 object-contain border rounded-lg"
                                        />
                                        {ocrProcessing[`${fieldId}.backImage`] && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                                <span className="ml-3 text-white">Processing...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                        onClick={() => handleUploadButtonClick(`${fieldId}.backImage`, 'image')}
                                    >
                                        <div className="text-2xl mb-2">📷</div>
                                        <div className="text-sm">Click to upload back page</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FRONT SIDE FIELDS */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Passport Number</label>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.passportNumber`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.passportNumber`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.fullName`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.fullName`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Nationality</label>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.nationality`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.nationality`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={formData[`${fieldId}.dob`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.dob`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Place of Birth</label>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.placeOfBirth`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.placeOfBirth`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                    value={formData[`${fieldId}.gender`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.gender`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Place of Issue</label>
                                <input
                                    type="text"
                                    value={formData[`${fieldId}.placeOfIssue`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.placeOfIssue`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Issue</label>
                                <input
                                    type="date"
                                    value={formData[`${fieldId}.issueDate`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.issueDate`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Expiry</label>
                                <input
                                    type="date"
                                    value={formData[`${fieldId}.expiryDate`] || ""}
                                    onChange={(e) => handleElementChange(`${fieldId}.expiryDate`, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Auto-filled from OCR"
                                />
                            </div>
                        </div>

                        {/* BACK SIDE FIELDS */}
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-lg font-medium mb-4">Family Details (Back Page)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Father's Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.fatherName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.fatherName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Auto-filled from OCR"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mother's Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.motherName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.motherName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Auto-filled from OCR"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Spouse Name</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.spouseName`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.spouseName`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Auto-filled from OCR"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">PIN Code</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.pinCode`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.pinCode`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Auto-filled from OCR"
                                        maxLength="6"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <textarea
                                        value={formData[`${fieldId}.address`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.address`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                        placeholder="Auto-filled from OCR"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Old Passport Number</label>
                                    <input
                                        type="text"
                                        value={formData[`${fieldId}.oldPassportNumber`] || ""}
                                        onChange={(e) => handleElementChange(`${fieldId}.oldPassportNumber`, e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Auto-filled from OCR"
                                    />
                                </div>
                            </div>
                        </div>

                        {renderDescription(element)}
                        {renderError(fieldId)}
                    </div>
                );

            default:
                return (
                    <div style={style}>
                        <div>{element.label}</div>
                        {renderDescription(element)}
                    </div>
                );
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-md mx-auto mt-10 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error</p>
            <p>{error}</p>
        </div>
    );

    if (!form) return (
        <div className="max-w-md mx-auto mt-10 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p>Form not found</p>
        </div>
    );

    return (
        <>
            <div 
                ref={formContainerRef}
                className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{form.name}</h1>
                </div>

                {/* Stepper */}
                <div className="relative mb-8">
                    <div className="flex items-center justify-between">
                        {stepsWithReview.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                                                ${index < currentStep ? 'bg-green-500 border-green-500 text-white' :
                                                index === currentStep ? 'border-blue-500 bg-white text-blue-500' :
                                                    'border-gray-300 bg-white text-gray-400'}`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div
                                        className={`mt-2 text-xs font-medium text-center max-w-20
                                                ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}
                                    >
                                        {step.type === 'review' ? 'Review' : step.name}
                                    </div>
                                </div>
                                {index < stepsWithReview.length - 1 && (
                                    <div className={`flex-auto border-t-2 ${index < currentStep ? 'border-green-500' : 'border-gray-300'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Current Step Content */}
                {currentStep === stepsWithReview.length - 1 ? (
                    renderReviewStep()
                ) : (
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="space-y-4">
                            {form.steps[currentStep].elements.map(renderField)}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Previous
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {currentStep === form.steps.length - 1 ? 'Review' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Thank You Modal */}
            <ThankYouModal />
        </>
    );
};

export default SharedFormViewer;