
import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { 
    X,
    File,
    Eye,
    Download,
    Plus,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Settings
} from 'lucide-react';

export default function InsurancePageFixedTable() {
    const { id } = useParams();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
    const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
    
    const [insuranceList, setInsuranceList] = useState([]);
    const [forms, setForms] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [formsLoading, setFormsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [availableColumns, setAvailableColumns] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Track which insurance fields have been populated from form data
    const [mappedInsuranceFields, setMappedInsuranceFields] = useState(new Set());

    // Pagination for submissions data
    const [currentSubmissionPage, setCurrentSubmissionPage] = useState(0);
    const [submissionsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        guestId: "",
        certificateNo: "",
        firstName: "",
        lastName: "",
        gender: "",
        email: "",
        passportNo: "",
        cardNo: "",
        project: "",
        journeyStartDate: "",
        returnDate: "",
        country: "",
        employeeDob: "",
        nominee: "",
        mothersMaidenName: "",
        isOpenEnded: false,
        insuranceStatus: "",
        insuranceCopy: null,
        insuranceQcStatus: "",
        remark: "",
    });

    // Field mapping configuration
    const fieldMappings = {
        // First name mappings
        'first name': 'firstName',
        'firstname': 'firstName',
        'fname': 'firstName',
        'given name': 'firstName',
        
        // Last name mappings
        'last name': 'lastName',
        'lastname': 'lastName',
        'lname': 'lastName',
        'surname': 'lastName',
        'family name': 'lastName',
        
        // Email mappings
        'email': 'email',
        'email address': 'email',
        'e-mail': 'email',
        
        // Passport mappings
        'passport': 'passportNo',
        'passport no': 'passportNo',
        'passport number': 'passportNo',
        'passport#': 'passportNo',
        
        // Gender mappings
        'gender': 'gender',
        'sex': 'gender',
        
        // Date of birth mappings
        'date of birth': 'employeeDob',
        'dob': 'employeeDob',
        'birth date': 'employeeDob',
        'birthdate': 'employeeDob',
        
        // Country mappings
        'country': 'country',
        'nationality': 'country',
        'citizenship': 'country',
        
        // Certificate mappings
        'certificate': 'certificateNo',
        'certificate no': 'certificateNo',
        'certificate number': 'certificateNo',
        'certificate#': 'certificateNo',
        'policy number': 'certificateNo',
        'policy no': 'certificateNo',
        
        // Guest ID mappings
        'guest id': 'guestId',
        'guestid': 'guestId',
        'guest': 'guestId',
        'customer id': 'guestId',
        'client id': 'guestId',
        
        // Remark mappings
        'remark': 'remark',
        'comments': 'remark',
        'notes': 'remark',
        'description': 'remark',
        
        // Status mappings
        'status': 'insuranceStatus',
        'insurance status': 'insuranceStatus',
        'policy status': 'insuranceStatus',
        
        // QC Status mappings
        'qc status': 'insuranceQcStatus',
        'quality check': 'insuranceQcStatus',
        'quality status': 'insuranceQcStatus',
        
        // Project mappings
        'project': 'project',
        'program': 'project',
        'campaign': 'project',
        
        // Journey dates
        'journey start': 'journeyStartDate',
        'start date': 'journeyStartDate',
        'departure date': 'journeyStartDate',
        'travel start': 'journeyStartDate',
        
        // Return dates
        'return date': 'returnDate',
        'end date': 'returnDate',
        'arrival date': 'returnDate',
        'travel end': 'returnDate',
        
        // Card number
        'card no': 'cardNo',
        'card number': 'cardNo',
        'id card': 'cardNo',
        
        // Nominee
        'nominee': 'nominee',
        'beneficiary': 'nominee',
        
        // Mother's maiden name
        'mother maiden name': 'mothersMaidenName',
        'mothers maiden name': 'mothersMaidenName',
        'mother maiden': 'mothersMaidenName'
    };

    // Fetch forms when form selector opens
    useEffect(() => {
        if (isFormSelectorOpen && id) {
            fetchForms();
        }
    }, [isFormSelectorOpen, id]);

    // Fetch form submissions data when forms are selected
    useEffect(() => {
        if (selectedForms.length > 0) {
            fetchFormSubmissions();
        }
    }, [selectedForms]);

    const fetchForms = async () => {
        try {
            setFormsLoading(true);
            const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/lead/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch forms');
            }

            setForms(data.forms || []);
        } catch (error) {
            console.error('Error fetching forms:', error);
            alert('Failed to load forms');
        } finally {
            setFormsLoading(false);
        }
    };

    const fetchFormSubmissions = async () => {
        try {
            setLoading(true);
            const submissionPromises = selectedForms.map(formId => 
                fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${formId}/submissions`).then(res => res.json())
            );

            const submissionsData = await Promise.all(submissionPromises);
            const submissions = submissionsData.flatMap(data => 
                data.success ? data.submissions : []
            );

            setAllSubmissions(submissions);

            if (submissions.length > 0) {
                const firstSubmission = submissions[0];
                const allColumns = [];
                const autoSelectedFields = [];
                const mappedFields = new Set();

                firstSubmission.data.forEach(item => {
                    if (item.type === 'banner' || item.type === 'paragraph' || item.type === 'heading') {
                        return;
                    }

                    if (item.type === 'aadhar' || item.type === 'ocr-aadhar') {
                        const aadharFields = [
                            'Aadhar Number', 'First Name', 'Last Name', 'Date of Birth', 
                            'Gender', 'Address', 'Aadhar Front', 'Aadhar Back'
                        ];
                        
                        aadharFields.forEach(field => {
                            const columnId = `aadhar_${field.replace(/\s+/g, '_').toLowerCase()}`;
                            allColumns.push({ 
                                id: columnId, 
                                label: field, 
                                type: 'aadhar',
                                field_id: item.field_id,
                                subfield: field.toLowerCase().replace(/\s+/g, '_'),
                                isMappedToInsurance: false
                            });
                            autoSelectedFields.push(columnId);
                        });
                    } 
                    else if (item.type === 'file-upload') {
                        const label = item.label || 'File Upload';
                        const columnId = item.field_id || `field_${label.replace(/\s+/g, '_').toLowerCase()}`;
                        allColumns.push({ 
                            id: columnId,
                            label: label, 
                            type: 'file-upload',
                            field_id: item.field_id,
                            isMappedToInsurance: false
                        });
                        autoSelectedFields.push(columnId);
                    }
                    else {
                        const label = item.label || item.field_id || 'Field';
                        const columnId = item.field_id || `field_${label.replace(/\s+/g, '_').toLowerCase()}`;
                        const normalizedLabel = label.toLowerCase().trim();
                        const isMapped = !!fieldMappings[normalizedLabel];
                        
                        if (isMapped) {
                            mappedFields.add(fieldMappings[normalizedLabel]);
                        }

                        allColumns.push({ 
                            id: columnId,
                            label: label, 
                            type: item.type,
                            field_id: item.field_id,
                            isMappedToInsurance: isMapped,
                            mappedInsuranceField: isMapped ? fieldMappings[normalizedLabel] : null
                        });
                        
                        // Auto-select ALL fields initially
                        autoSelectedFields.push(columnId);
                    }
                });

                setAvailableColumns(allColumns);
                setSelectedFields(autoSelectedFields);
                setMappedInsuranceFields(mappedFields);
                
                // Automatically process the submissions and update insurance list
                processSubmissionsToInsurance(submissions, autoSelectedFields, allColumns);
                
                // Open field selector after loading data
                setIsFieldSelectorOpen(true);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Automatically process submissions and update insurance list
    const processSubmissionsToInsurance = (submissions, fieldsToInclude, columns) => {
        const insuranceData = submissions.map(submission => {
            const baseData = {
                guestId: "",
                certificateNo: "",
                firstName: "",
                lastName: "",
                gender: "",
                email: "",
                passportNo: "",
                cardNo: "",
                project: "",
                journeyStartDate: "",
                returnDate: "",
                country: "",
                employeeDob: "",
                nominee: "",
                mothersMaidenName: "",
                isOpenEnded: false,
                insuranceStatus: "",
                insuranceCopy: null,
                insuranceQcStatus: "",
                remark: "",
                submissionData: submission // Store original submission data
            };

            // Process all form fields
            submission.data.forEach(field => {
                if (field.value) {
                    const value = getFieldDisplayValue(field);
                    const normalizedLabel = (field.label || '').toLowerCase().trim();
                    
                    // Map to insurance fields based on field mappings
                    const insuranceField = fieldMappings[normalizedLabel];
                    if (insuranceField) {
                        baseData[insuranceField] = value;
                    }
                }
            });

            return baseData;
        });

        setInsuranceList(insuranceData);
        setCurrentSubmissionPage(0);
    };

    // Get field display value
    const getFieldDisplayValue = (field) => {
        if (!field || !field.value) return 'N/A';

        if (field.type === 'file-upload') {
            return field.value;
        }

        if (field.type === 'aadhar' || field.type === 'ocr-aadhar') {
            if (typeof field.value === 'object') {
                return field.value.aadharNumber || field.value.firstName || field.value.lastName || 
                       field.value.dob || field.value.gender || field.value.address || 'N/A';
            }
        }

        if (typeof field.value === 'object') {
            return field.value.value || field.value.selectedOption || 
                   (field.value.selectedOptions && field.value.selectedOptions.join(', ')) || 'N/A';
        }

        return field.value || 'N/A';
    };

    // Get field value for table display
    const getFieldValue = (insuranceItem, column) => {
        if (!insuranceItem.submissionData) return 'N/A';

        const field = insuranceItem.submissionData.data.find(f => f.field_id === column.field_id);
        
        if (!field || !field.value) return 'N/A';

        if (field.type === 'file-upload') {
            return field.value;
        }

        if (field.type === 'aadhar' || field.type === 'ocr-aadhar') {
            switch(column.label) {
                case 'Aadhar Number': return field.value.aadharNumber || 'N/A';
                case 'First Name': return field.value.firstName || 'N/A';
                case 'Last Name': return field.value.lastName || 'N/A';
                case 'Date of Birth': return field.value.dob || 'N/A';
                case 'Gender': return field.value.gender || 'N/A';
                case 'Address': return field.value.address || 'N/A';
                default: return 'N/A';
            }
        }

        if (typeof field.value === 'object') {
            return field.value.value || field.value.selectedOption || 
                   (field.value.selectedOptions && field.value.selectedOptions.join(', ')) || 'N/A';
        }

        return field.value || 'N/A';
    };

    // Handle file view
    const handleFileView = (fileValue) => {
        if (!fileValue) return;
        
        if (typeof fileValue === 'string') {
            setSelectedFile(fileValue);
        }
        else if (typeof fileValue === 'object' && fileValue.url) {
            setSelectedFile(fileValue.url);
        }
        else if (typeof fileValue === 'object' && fileValue.value) {
            setSelectedFile(fileValue.value);
        }
    };

    // Render file upload field with view icon
    const renderFileUploadField = (fileValue) => {
        if (!fileValue || fileValue === 'N/A') {
            return <span className="text-gray-400">N/A</span>;
        }

        let fileUrl = fileValue;
        
        if (typeof fileValue === 'object') {
            if (fileValue.url) {
                fileUrl = fileValue.url;
            } else if (fileValue.value) {
                fileUrl = fileValue.value;
            } else {
                return <span className="text-gray-400">Invalid file data</span>;
            }
        }

        const fileName = fileUrl.split('/').pop() || 'Document';

        return (
            <div className="flex flex-col items-center space-y-1">
                <File size={16} className="text-blue-500" />
                <div className="flex space-x-1">
                    <button
                        onClick={() => handleFileView(fileValue)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-xs p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Document"
                    >
                        <Eye size={12} className="mr-1" />
                        View
                    </button>
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="flex items-center text-green-600 hover:text-green-800 text-xs p-1 rounded hover:bg-green-50 transition-colors"
                        title="Download Document"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Download size={12} className="mr-1" />
                        Download
                    </a>
                </div>
            </div>
        );
    };

    // Get current page data
    const getCurrentPageData = () => {
        const startIndex = currentSubmissionPage * submissionsPerPage;
        const endIndex = startIndex + submissionsPerPage;
        return insuranceList.slice(startIndex, endIndex);
    };

    // Get total pages
    const getTotalPages = () => {
        return Math.ceil(insuranceList.length / submissionsPerPage);
    };

    // Navigation for submissions
    const goToNextSubmissionPage = () => {
        if (currentSubmissionPage < getTotalPages() - 1) {
            setCurrentSubmissionPage(prev => prev + 1);
        }
    };

    const goToPrevSubmissionPage = () => {
        if (currentSubmissionPage > 0) {
            setCurrentSubmissionPage(prev => prev - 1);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setInsuranceList((prev) => [...prev, formData]);
        setFormData({
            guestId: "",
            certificateNo: "",
            firstName: "",
            lastName: "",
            gender: "",
            email: "",
            passportNo: "",
            cardNo: "",
            project: "",
            journeyStartDate: "",
            returnDate: "",
            country: "",
            employeeDob: "",
            nominee: "",
            mothersMaidenName: "",
            isOpenEnded: false,
            insuranceStatus: "",
            insuranceCopy: null,
            insuranceQcStatus: "",
            remark: "",
        });
        setIsFormOpen(false);
    };

    const handleBulkUpload = (e) => {
        const files = e.target.files;
        alert(`${files.length} insurance copies uploaded (mock).`);
    };

    const handleCheckboxChange = (formId) => {
        setSelectedForms(prev => 
            prev.includes(formId) 
                ? prev.filter(id => id !== formId)
                : [...prev, formId]
        );
    };

    const handleFieldCheckboxChange = (fieldId) => {
        setSelectedFields(prev => 
            prev.includes(fieldId) 
                ? prev.filter(id => id !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleSelectAllForms = () => {
        if (selectedForms.length === forms.length) {
            setSelectedForms([]);
        } else {
            setSelectedForms(forms.map(form => form.id));
        }
    };

    const handleSelectAllFields = () => {
        if (selectedFields.length === availableColumns.length) {
            setSelectedFields([]);
        } else {
            setSelectedFields(availableColumns.map(col => col.id));
        }
    };

    const handleFormSelect = () => {
        setIsFormSelectorOpen(false);
    };

    const handleFieldSelect = () => {
        setIsFieldSelectorOpen(false);
        // Reprocess submissions with the selected fields
        if (allSubmissions.length > 0) {
            processSubmissionsToInsurance(allSubmissions, selectedFields, availableColumns);
        }
    };

    const getFormNames = (formIds) => {
        if (formIds.length === 0) return 'No forms selected';
        
        const selectedFormNames = forms
            .filter(form => formIds.includes(form.id))
            .map(form => form.name);
        
        return selectedFormNames.length > 2 
            ? `${selectedFormNames.length} forms selected`
            : `${selectedFormNames.length} form(s) selected: ${selectedFormNames.join(', ')}`;
    };

    const closeFormSelector = () => {
        setIsFormSelectorOpen(false);
        setSelectedForms([]);
    };

    const closeFieldSelector = () => {
        setIsFieldSelectorOpen(false);
    };

    const currentPageData = getCurrentPageData();
    const totalPages = getTotalPages();
    const hasSubmissions = insuranceList.length > 0;

    // Get only selected form fields for display
    const selectedFormColumns = availableColumns.filter(col => 
        selectedFields.includes(col.id)
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Form Support Data</h1>

                <div className="flex gap-3">
                    {/* Select Forms Button */}
                    <button
                        onClick={() => setIsFormSelectorOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <CheckSquare size={20} className="mr-2" />
                        Select Forms
                    </button>

                    {/* Field Selector Button */}
                    {availableColumns.length > 0 && (
                        <button
                            onClick={() => setIsFieldSelectorOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Settings size={20} className="mr-2" />
                            Select Fields ({selectedFields.length})
                        </button>
                    )}

                    {/* <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center">
                        <File size={20} className="mr-2" />
                        Bulk Upload
                        <input
                            type="file"
                            accept="application/pdf,image/*"
                            multiple
                            className="hidden"
                            onChange={handleBulkUpload}
                        />
                    </label> */}

                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Manual Entry
                    </button>
                </div>
            </div>

            {/* Selected Forms Info */}
            {selectedForms.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>Selected Forms:</strong> {getFormNames(selectedForms)}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                        {selectedFields.length} of {availableColumns.length} fields selected for display.
                    </p>
                </div>
            )}

            {/* Submissions Navigation */}
            {hasSubmissions && (
                <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                            Showing {currentSubmissionPage * submissionsPerPage + 1} -{' '}
                            {Math.min((currentSubmissionPage + 1) * submissionsPerPage, insuranceList.length)} of{' '}
                            {insuranceList.length} records
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={goToPrevSubmissionPage}
                            disabled={currentSubmissionPage === 0}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium">
                            Page {currentSubmissionPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={goToNextSubmissionPage}
                            disabled={currentSubmissionPage >= totalPages - 1}
                            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Table - Only showing selected form fields */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="w-full overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    <table className="min-w-full border-collapse">
                        <thead className="bg-blue-600 text-white text-sm sticky top-0 z-10">
                            <tr>
                                {/* Only show selected form fields as columns */}
                                {selectedFormColumns.length > 0 ? (
                                    selectedFormColumns.map((column) => (
                                        <th key={column.id} className="px-4 py-3 text-left">
                                            {column.label}
                                            {column.isMappedToInsurance && (
                                                <span className="ml-2 text-xs bg-blue-500 px-1 rounded" title={`Mapped to insurance field: ${column.mappedInsuranceField}`}>
                                                    M
                                                </span>
                                            )}
                                        </th>
                                    ))
                                ) : (
                                    <th className="px-4 py-3 text-left">No fields selected</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="text-sm">
                            {currentPageData.length === 0 ? (
                                <tr>
                                    <td 
                                        colSpan={selectedFormColumns.length || 1} 
                                        className="text-center py-8 text-gray-500 italic"
                                    >
                                        {insuranceList.length === 0 ? 'No form data available. Select forms to load data.' : 'No data on current page'}
                                    </td>
                                </tr>
                            ) : (
                                currentPageData.map((item, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        {/* Only show selected form fields */}
                                        {selectedFormColumns.length > 0 ? (
                                            selectedFormColumns.map((column) => (
                                                <td key={column.id} className="px-4 py-2">
                                                    <div className="text-sm">
                                                        {column.type === 'file-upload' ? (
                                                            renderFileUploadField(getFieldValue(item, column))
                                                        ) : (
                                                            <span className="text-gray-700">{getFieldValue(item, column)}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            ))
                                        ) : (
                                            <td className="px-4 py-2 text-center text-gray-500">
                                                No fields to display
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Field Selector Modal */}
            {isFieldSelectorOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Select Fields to Display</h2>
                        
                        {availableColumns.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">No fields available</div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto">
                                    <div className="mb-2">
                                        <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                                            <input
                                                type="checkbox"
                                                checked={availableColumns.length > 0 && selectedFields.length === availableColumns.length}
                                                onChange={handleSelectAllFields}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="font-medium">Select All Fields</span>
                                        </label>
                                    </div>

                                    {availableColumns.map(column => (
                                        <label key={column.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.includes(column.id)}
                                                onChange={() => handleFieldCheckboxChange(column.id)}
                                                className="rounded text-blue-600"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium block truncate">{column.label}</span>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span>Type: {column.type}</span>
                                                    {column.isMappedToInsurance && (
                                                        <span className="bg-blue-100 text-blue-700 px-1 rounded">
                                                            Mapped
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                                    <button
                                        onClick={closeFieldSelector}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFieldSelect}
                                        disabled={selectedFields.length === 0}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Apply ({selectedFields.length})
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Rest of the modals remain the same */}
            {/* Add Manual Entry Form Drawer */}
            {isFormOpen && (
                <>
                    <div className="fixed top-16 right-6 w-[450px] h-[calc(100vh-160px)] bg-white shadow-2xl p-6 z-50 overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Add Manual Entry</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Guest ID</label>
                                <input name="guestId" value={formData.guestId} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Passport No</label>
                                <input name="passportNo" value={formData.passportNo} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">First Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Insurance Copy</label>
                                <input type="file" name="insuranceCopy" onChange={handleChange} className="w-full mt-1" />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
                            </div>
                        </form>
                    </div>

                    {/* Overlay */}
                    <div onClick={() => setIsFormOpen(false)} className="fixed inset-0 bg-black opacity-40 z-40"></div>
                </>
            )}

            {/* File Preview Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl max-h-[90vh] w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Document Preview</h3>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="text-gray-700 hover:text-red-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="border rounded-lg p-4 bg-gray-50 max-h-[70vh] overflow-auto">
                            {selectedFile.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                                <img 
                                    src={selectedFile} 
                                    alt="Document Preview" 
                                    className="max-w-full h-auto mx-auto"
                                />
                            ) : (
                                <div className="text-center">
                                    <File size={64} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-lg font-medium mb-2">Document Preview</p>
                                    <p className="text-gray-600 mb-4">
                                        This document cannot be previewed in the browser.
                                    </p>
                                    <a
                                        href={selectedFile}
                                        download
                                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Form Selector Modal */}
            {isFormSelectorOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Select Forms for Data</h2>
                        
                        {formsLoading ? (
                            <div className="text-center text-gray-500 py-4">Loading forms...</div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto">
                                    {forms.length > 0 && (
                                        <div className="mb-2">
                                            <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={forms.length > 0 && selectedForms.length === forms.length}
                                                    onChange={handleSelectAllForms}
                                                    className="rounded text-blue-600"
                                                />
                                                <span className="font-medium">Select All</span>
                                            </label>
                                        </div>
                                    )}

                                    {forms.map(form => (
                                        <label key={form.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedForms.includes(form.id)}
                                                onChange={() => handleCheckboxChange(form.id)}
                                                className="rounded text-blue-600"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium block truncate">{form.name}</span>
                                                <p className="text-sm text-gray-500">ID: {form.share_id}</p>
                                            </div>
                                        </label>
                                    ))}

                                    {forms.length === 0 && !formsLoading && (
                                        <div className="text-center text-gray-500 py-4">
                                            No forms found for this lead
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                                    <button
                                        onClick={closeFormSelector}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFormSelect}
                                        disabled={selectedForms.length === 0}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Select ({selectedForms.length})
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Overlay */}
            {(isFormOpen || isFormSelectorOpen || isFieldSelectorOpen || selectedFile) && (
                <div
                    onClick={() => {
                        if (isFormOpen) setIsFormOpen(false);
                        if (isFormSelectorOpen) closeFormSelector();
                        if (isFieldSelectorOpen) closeFieldSelector();
                        if (selectedFile) setSelectedFile(null);
                    }}
                    className="fixed inset-0 bg-black opacity-40 z-40"
                ></div>
            )}
        </div>
    );
}