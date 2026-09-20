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
    Search,
    Filter,
    Calendar,
    User,
    Mail,
    CreditCard,
    MapPin,
    Briefcase,
    Shield,
    CheckCircle,
    Clock,
    AlertCircle,
    Upload,
    FolderOpen,
    Trash2,
    Edit,
    MoreVertical,
    Users,
    FileText,
    Settings,
    DownloadCloud,
    GripVertical,
    Palette,
    Tag,
    Paperclip,
    Send,
    Info,
    BarChart // Added missing import
} from 'lucide-react';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, bgColor, loading }) => {
    return (
        <div className={`p-4 rounded-lg shadow-sm border ${bgColor} border-${color}-200`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-600">{title}</p>
                    {loading ? (
                        <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${bgColor.replace('bg-', 'bg-').replace('-100', '-50')}`}>
                    <Icon size={24} className={`text-${color}-600`} />
                </div>
            </div>
        </div>
    );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-gray-400 text-sm">—</span>;
    
    const statusMap = {
        'active': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
        'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
        'expired': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
        'approved': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
        'rejected': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
        'in progress': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    };
    
    const style = statusMap[status.toLowerCase()] || statusMap.pending;
    
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1`}></span>
            {status}
        </span>
    );
};

// Boolean Badge Component
const BooleanBadge = ({ value }) => {
    return value ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Yes
        </span>
    ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            No
        </span>
    );
};

export default function InsurancePageWithTabs() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('insurance');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
    
    const [insuranceList, setInsuranceList] = useState([]);
    const [forms, setForms] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [formsLoading, setFormsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [availableColumns, setAvailableColumns] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mappedInsuranceFields, setMappedInsuranceFields] = useState(new Set());

    // Pagination for submissions data
    const [currentSubmissionPage, setCurrentSubmissionPage] = useState(0);
    const [submissionsPerPage] = useState(10);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        expired: 0
    });

    // Column management
    const [columns, setColumns] = useState([]);
    const [isManagingColumns, setIsManagingColumns] = useState(false);
    const [dragItem, setDragItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [filteredInsurance, setFilteredInsurance] = useState([]);

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
        'first name': 'firstName',
        'firstname': 'firstName',
        'fname': 'firstName',
        'given name': 'firstName',
        'last name': 'lastName',
        'lastname': 'lastName',
        'lname': 'lastName',
        'surname': 'lastName',
        'family name': 'lastName',
        'email': 'email',
        'email address': 'email',
        'e-mail': 'email',
        'passport': 'passportNo',
        'passport no': 'passportNo',
        'passport number': 'passportNo',
        'passport#': 'passportNo',
        'gender': 'gender',
        'sex': 'gender',
        'date of birth': 'employeeDob',
        'dob': 'employeeDob',
        'birth date': 'employeeDob',
        'birthdate': 'employeeDob',
        'country': 'country',
        'nationality': 'country',
        'citizenship': 'country',
        'certificate': 'certificateNo',
        'certificate no': 'certificateNo',
        'certificate number': 'certificateNo',
        'certificate#': 'certificateNo',
        'policy number': 'certificateNo',
        'policy no': 'certificateNo',
        'guest id': 'guestId',
        'guestid': 'guestId',
        'guest': 'guestId',
        'customer id': 'guestId',
        'client id': 'guestId',
        'remark': 'remark',
        'comments': 'remark',
        'notes': 'remark',
        'description': 'remark',
        'status': 'insuranceStatus',
        'insurance status': 'insuranceStatus',
        'policy status': 'insuranceStatus',
        'qc status': 'insuranceQcStatus',
        'quality check': 'insuranceQcStatus',
        'quality status': 'insuranceQcStatus',
        'project': 'project',
        'program': 'project',
        'campaign': 'project',
        'journey start': 'journeyStartDate',
        'start date': 'journeyStartDate',
        'departure date': 'journeyStartDate',
        'travel start': 'journeyStartDate',
        'return date': 'returnDate',
        'end date': 'returnDate',
        'arrival date': 'returnDate',
        'travel end': 'returnDate',
        'card no': 'cardNo',
        'card number': 'cardNo',
        'id card': 'cardNo',
        'nominee': 'nominee',
        'beneficiary': 'nominee',
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

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [insuranceList, searchTerm, filters]);

    // Calculate stats
    useEffect(() => {
        calculateStats();
    }, [insuranceList]);

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

                // Add default insurance columns
                const defaultColumns = [
                    { id: 'guestId', label: 'Guest ID', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'certificateNo', label: 'Certificate No', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'firstName', label: 'First Name', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'lastName', label: 'Last Name', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'gender', label: 'Gender', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'email', label: 'Email', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'passportNo', label: 'Passport No', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'cardNo', label: 'Card No', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'project', label: 'Project', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'journeyStartDate', label: 'Journey Start', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'returnDate', label: 'Return Date', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'country', label: 'Country', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'employeeDob', label: 'DOB', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'nominee', label: 'Nominee', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'mothersMaidenName', label: "Mother's Maiden", type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'isOpenEnded', label: 'Open Ended', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'insuranceStatus', label: 'Status', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'insuranceCopy', label: 'Insurance Copy', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'insuranceQcStatus', label: 'QC Status', type: 'insurance', isMappedToInsurance: true, visible: true },
                    { id: 'remark', label: 'Remark', type: 'insurance', isMappedToInsurance: true, visible: true },
                ];

                allColumns.push(...defaultColumns);

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
                                isMappedToInsurance: false,
                                visible: true
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
                            isMappedToInsurance: false,
                            visible: true
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
                            mappedInsuranceField: isMapped ? fieldMappings[normalizedLabel] : null,
                            visible: true
                        });
                        
                        if (!isMapped) {
                            autoSelectedFields.push(columnId);
                        }
                    }
                });

                setAvailableColumns(allColumns);
                setSelectedFields(autoSelectedFields);
                setMappedInsuranceFields(mappedFields);
                setColumns(allColumns);
                
                processSubmissionsToInsurance(submissions, autoSelectedFields, allColumns);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    };

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
                submissionData: submission
            };

            submission.data.forEach(field => {
                if (field.value) {
                    const value = getFieldDisplayValue(field);
                    const normalizedLabel = (field.label || '').toLowerCase().trim();
                    
                    const insuranceField = fieldMappings[normalizedLabel];
                    if (insuranceField) {
                        baseData[insuranceField] = value;
                    }
                }
            });

            return baseData;
        });

        setInsuranceList(insuranceData);
        setFilteredInsurance(insuranceData);
        setCurrentSubmissionPage(0);
    };

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

    const renderFileUploadField = (fileValue) => {
        if (!fileValue || fileValue === 'N/A') {
            return <span className="text-gray-400 text-sm">No file</span>;
        }

        let fileUrl = fileValue;
        
        if (typeof fileValue === 'object') {
            if (fileValue.url) {
                fileUrl = fileValue.url;
            } else if (fileValue.value) {
                fileUrl = fileValue.value;
            } else {
                return <span className="text-gray-400">Invalid</span>;
            }
        }

        const fileName = fileUrl.split('/').pop() || 'Document';

        return (
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-blue-50 rounded-lg px-2 py-1">
                    <File size={14} className="text-blue-500" />
                    <span className="text-xs text-gray-600 truncate max-w-[80px]">{fileName}</span>
                </div>
                <button
                    onClick={() => handleFileView(fileValue)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors text-blue-600 hover:text-blue-800"
                    title="View Document"
                >
                    <Eye size={14} />
                </button>
                <a
                    href={fileUrl}
                    download={fileName}
                    className="p-1 rounded hover:bg-gray-100 transition-colors text-green-600 hover:text-green-800"
                    title="Download Document"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Download size={14} />
                </a>
            </div>
        );
    };

    const getCurrentPageData = () => {
        const startIndex = currentSubmissionPage * submissionsPerPage;
        const endIndex = startIndex + submissionsPerPage;
        return filteredInsurance.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        return Math.ceil(filteredInsurance.length / submissionsPerPage);
    };

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
        const newInsurance = {
            ...formData,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        setInsuranceList((prev) => [...prev, newInsurance]);
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

    const handleSelectAll = () => {
        if (selectedForms.length === forms.length) {
            setSelectedForms([]);
        } else {
            setSelectedForms(forms.map(form => form.id));
        }
    };

    const handleFormSelect = () => {
        setIsFormSelectorOpen(false);
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

    const currentPageData = getCurrentPageData();
    const totalPages = getTotalPages();
    const hasSubmissions = insuranceList.length > 0;

    const unmappedColumns = availableColumns.filter(col => 
        selectedFields.includes(col.id) && !col.isMappedToInsurance
    );

    // Calculate stats
    const calculateStats = () => {
        const total = insuranceList.length;
        const active = insuranceList.filter(item => 
            item.insuranceStatus?.toLowerCase() === 'active' || 
            item.insuranceStatus?.toLowerCase() === 'approved'
        ).length;
        const pending = insuranceList.filter(item => 
            item.insuranceStatus?.toLowerCase() === 'pending' || 
            !item.insuranceStatus
        ).length;
        const expired = insuranceList.filter(item => 
            item.insuranceStatus?.toLowerCase() === 'expired' || 
            item.insuranceStatus?.toLowerCase() === 'rejected'
        ).length;

        setStats({ total, active, pending, expired });
    };

    // Apply filters
    const applyFilters = () => {
        let filtered = [...insuranceList];

        // Search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(item => {
                const searchableFields = ['guestId', 'firstName', 'lastName', 'email', 'passportNo', 'certificateNo', 'project', 'country'];
                return searchableFields.some(field => {
                    const value = item[field] || '';
                    return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }

        // Column filters
        Object.keys(filters).forEach(columnId => {
            const filterValue = filters[columnId];
            if (filterValue && filterValue.trim()) {
                filtered = filtered.filter(item => {
                    const value = item[columnId] || '';
                    return value.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });

        setFilteredInsurance(filtered);
        setCurrentSubmissionPage(0);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (columnId, value) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    // Column management
    const toggleColumnVisibility = (columnId) => {
        setColumns(columns.map(col =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
        ));
    };

    const handleDragStart = (e, index) => {
        setDragItem(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverItem(index);
    };

    const handleDrop = () => {
        if (dragItem === null || dragOverItem === null) return;
        
        const newColumns = [...columns];
        const draggedItem = newColumns[dragItem];
        newColumns.splice(dragItem, 1);
        newColumns.splice(dragOverItem, 0, draggedItem);
        
        setColumns(newColumns);
        setDragItem(null);
        setDragOverItem(null);
    };

    // Reset columns
    const resetColumns = () => {
        const defaultColumns = [
            { id: 'guestId', label: 'Guest ID', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'certificateNo', label: 'Certificate No', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'firstName', label: 'First Name', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'lastName', label: 'Last Name', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'gender', label: 'Gender', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'email', label: 'Email', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'passportNo', label: 'Passport No', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'cardNo', label: 'Card No', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'project', label: 'Project', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'journeyStartDate', label: 'Journey Start', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'returnDate', label: 'Return Date', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'country', label: 'Country', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'employeeDob', label: 'DOB', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'nominee', label: 'Nominee', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'mothersMaidenName', label: "Mother's Maiden", type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'isOpenEnded', label: 'Open Ended', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'insuranceStatus', label: 'Status', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'insuranceCopy', label: 'Insurance Copy', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'insuranceQcStatus', label: 'QC Status', type: 'insurance', isMappedToInsurance: true, visible: true },
            { id: 'remark', label: 'Remark', type: 'insurance', isMappedToInsurance: true, visible: true },
        ];

        // Add unmapped columns
        unmappedColumns.forEach(col => {
            defaultColumns.push({ ...col, visible: true });
        });

        setColumns(defaultColumns);
    };

    // Export to Excel
    const exportToExcel = () => {
        if (filteredInsurance.length === 0) {
            alert('No data to export');
            return;
        }
        alert(`Exporting ${filteredInsurance.length} records to Excel...`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Shield className="w-8 h-8 text-blue-600 mr-3" />
                            Insurance Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage and track insurance information for guests
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                        <button
                            onClick={() => setIsFormSelectorOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Select Forms
                        </button>

                        <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Upload
                            <input
                                type="file"
                                accept="application/pdf,image/*"
                                multiple
                                className="hidden"
                                onChange={handleBulkUpload}
                            />
                        </label>

                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Insurance
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('insurance')}
                        className={`
                            py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'insurance' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        <Shield className="inline-block w-4 h-4 mr-2" />
                        Insurance Details
                    </button>
                    <button
                        onClick={() => setActiveTab('forms')}
                        className={`
                            py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'forms' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        <FileText className="inline-block w-4 h-4 mr-2" />
                        Form Data
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`
                            py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'analytics' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        <BarChart className="inline-block w-4 h-4 mr-2" />
                        Analytics
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'insurance' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatsCard
                            title="Total Records"
                            value={stats.total}
                            icon={Users}
                            color="blue"
                            bgColor="bg-blue-100"
                            loading={loading}
                        />
                        <StatsCard
                            title="Active"
                            value={stats.active}
                            icon={CheckCircle}
                            color="green"
                            bgColor="bg-green-100"
                            loading={loading}
                        />
                        <StatsCard
                            title="Pending"
                            value={stats.pending}
                            icon={Clock}
                            color="yellow"
                            bgColor="bg-yellow-100"
                            loading={loading}
                        />
                        <StatsCard
                            title="Expired"
                            value={stats.expired}
                            icon={AlertCircle}
                            color="red"
                            bgColor="bg-red-100"
                            loading={loading}
                        />
                    </div>

                    {/* Selected Forms Info */}
                    {selectedForms.length > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <FolderOpen className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-800">
                                        <strong>Selected Forms:</strong> {getFormNames(selectedForms)}
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        {unmappedColumns.length > 0 ? (
                                            <span>
                                                Form fields have been automatically matched to insurance columns. 
                                                <span className="font-medium"> {unmappedColumns.length} additional fields</span> shown as separate columns.
                                            </span>
                                        ) : (
                                            'All form fields have been mapped to existing insurance columns.'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by guest ID, name, email, passport..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsManagingColumns(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <GripVertical className="w-4 h-4 mr-2" />
                                Manage Columns
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                <DownloadCloud className="w-4 h-4 mr-2" />
                                Export
                            </button>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Submissions Navigation */}
                    {hasSubmissions && (
                        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-3">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{currentSubmissionPage * submissionsPerPage + 1}</span> -{' '}
                                    <span className="font-medium">{Math.min((currentSubmissionPage + 1) * submissionsPerPage, filteredInsurance.length)}</span> of{' '}
                                    <span className="font-medium">{filteredInsurance.length}</span> records
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={goToPrevSubmissionPage}
                                    disabled={currentSubmissionPage === 0}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                    Page {currentSubmissionPage + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={goToNextSubmissionPage}
                                    disabled={currentSubmissionPage >= totalPages - 1}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Table */}
                    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                        <div className="w-full overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0 z-10">
                                    <tr>
                                        {columns.filter(col => col.visible !== false).map((column) => (
                                            <th key={column.id} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-500">
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentPageData.length === 0 ? (
                                        <tr>
                                            <td 
                                                colSpan={columns.filter(col => col.visible !== false).length} 
                                                className="text-center py-12 text-gray-500"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <Shield className="w-12 h-12 text-gray-300 mb-3" />
                                                    <p className="text-lg font-medium">No insurance data available</p>
                                                    <p className="text-sm text-gray-400 mt-1">Click "Select Forms" to import data from forms</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentPageData.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                {columns.filter(col => col.visible !== false).map((column) => {
                                                    // Check if it's an insurance field
                                                    if (column.isMappedToInsurance) {
                                                        // Handle boolean fields
                                                        if (column.id === 'isOpenEnded') {
                                                            return (
                                                                <td key={column.id} className="px-4 py-3">
                                                                    <BooleanBadge value={item[column.id]} />
                                                                </td>
                                                            );
                                                        }
                                                        // Handle status fields
                                                        if (column.id === 'insuranceStatus' || column.id === 'insuranceQcStatus') {
                                                            return (
                                                                <td key={column.id} className="px-4 py-3">
                                                                    <StatusBadge status={item[column.id]} />
                                                                </td>
                                                            );
                                                        }
                                                        // Handle insurance copy
                                                        if (column.id === 'insuranceCopy') {
                                                            return (
                                                                <td key={column.id} className="px-4 py-3">
                                                                    {item[column.id] ? (
                                                                        <div className="flex items-center space-x-1">
                                                                            <File size={14} className="text-gray-400" />
                                                                            <span className="text-sm text-gray-600 truncate max-w-[100px]">
                                                                                {item[column.id].name || 'File'}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">—</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        }
                                                        return (
                                                            <td key={column.id} className="px-4 py-3 text-sm text-gray-900">
                                                                {item[column.id] || '—'}
                                                            </td>
                                                        );
                                                    }
                                                    
                                                    // Handle form fields
                                                    if (column.type === 'file-upload') {
                                                        return (
                                                            <td key={column.id} className="px-4 py-3">
                                                                {renderFileUploadField(getFieldValue(item, column))}
                                                            </td>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <td key={column.id} className="px-4 py-3 text-sm text-gray-700">
                                                            {getFieldValue(item, column)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'forms' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Form Data</h2>
                            <p className="text-sm text-gray-500">View and manage form submissions</p>
                        </div>
                        <button
                            onClick={() => setIsFormSelectorOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Import from Forms
                        </button>
                    </div>

                    {selectedForms.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700">No forms selected</p>
                            <p className="text-sm text-gray-400 mt-1">Click "Import from Forms" to select forms</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Selected Forms:</strong> {getFormNames(selectedForms)}
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapped Fields</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {forms.filter(f => selectedForms.includes(f.id)).map((form, index) => (
                                            <tr key={form.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{form.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {allSubmissions.filter(s => s.form_id === form.id).length}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {availableColumns.filter(col => col.isMappedToInsurance).length}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status="active" />
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Status Distribution</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Active</span>
                                    <span className="font-medium">{stats.active}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 rounded-full h-2" style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Pending</span>
                                    <span className="font-medium">{stats.pending}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 rounded-full h-2" style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Expired</span>
                                    <span className="font-medium">{stats.expired}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 rounded-full h-2" style={{ width: `${stats.total ? (stats.expired / stats.total) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                <p className="text-sm text-gray-600">Total Records</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">{mappedInsuranceFields.size}</p>
                                <p className="text-sm text-gray-600">Mapped Fields</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-purple-600">{selectedForms.length}</p>
                                <p className="text-sm text-gray-600">Selected Forms</p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-orange-600">{unmappedColumns.length}</p>
                                <p className="text-sm text-gray-600">Additional Columns</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Insurance Form Drawer */}
            {isFormOpen && (
                <>
                    <div className="fixed top-16 right-6 w-[480px] h-[calc(100vh-160px)] bg-white shadow-2xl rounded-xl p-6 z-50 overflow-y-auto border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Plus className="w-5 h-5 text-blue-600 mr-2" />
                                Add Insurance Details
                            </h2>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest ID</label>
                                    <input 
                                        name="guestId" 
                                        value={formData.guestId} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter guest ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate No</label>
                                    <input 
                                        name="certificateNo" 
                                        value={formData.certificateNo} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter certificate number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input 
                                        name="firstName" 
                                        value={formData.firstName} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input 
                                        name="lastName" 
                                        value={formData.lastName} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport No</label>
                                    <input 
                                        name="passportNo" 
                                        value={formData.passportNo} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter passport number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card No</label>
                                    <input 
                                        name="cardNo" 
                                        value={formData.cardNo} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter card number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <input 
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter gender"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <input 
                                        name="project" 
                                        value={formData.project} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter project"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input 
                                        name="country" 
                                        value={formData.country} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter country"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Journey Start</label>
                                    <input 
                                        type="date"
                                        name="journeyStartDate" 
                                        value={formData.journeyStartDate} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                                    <input 
                                        type="date"
                                        name="returnDate" 
                                        value={formData.returnDate} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nominee</label>
                                    <input 
                                        name="nominee" 
                                        value={formData.nominee} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter nominee"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Maiden</label>
                                    <input 
                                        name="mothersMaidenName" 
                                        value={formData.mothersMaidenName} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter mother's maiden name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Status</label>
                                    <input 
                                        name="insuranceStatus" 
                                        value={formData.insuranceStatus} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter status"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">QC Status</label>
                                    <input 
                                        name="insuranceQcStatus" 
                                        value={formData.insuranceQcStatus} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter QC status"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                <textarea 
                                    name="remark" 
                                    value={formData.remark} 
                                    onChange={handleChange} 
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter remark"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Copy</label>
                                <input 
                                    type="file" 
                                    name="insuranceCopy" 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isOpenEnded"
                                    checked={formData.isOpenEnded}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Open Ended Policy
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => setIsFormOpen(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Insurance
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Overlay */}
                    <div 
                        onClick={() => setIsFormOpen(false)} 
                        className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    ></div>
                </>
            )}

            {/* File Preview Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 max-h-[70vh] overflow-auto">
                            {selectedFile.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                                <img 
                                    src={selectedFile} 
                                    alt="Document Preview" 
                                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <File size={64} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-lg font-medium text-gray-800 mb-2">Document Preview</p>
                                    <p className="text-gray-600 mb-6">
                                        This document cannot be previewed in the browser.
                                    </p>
                                    <a
                                        href={selectedFile}
                                        download
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Select Forms</h2>
                                <button
                                    onClick={closeFormSelector}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Select forms to import insurance data
                            </p>
                        </div>
                        
                        <div className="p-4">
                            {formsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading forms...</p>
                                </div>
                            ) : (
                                <>
                                    {forms.length > 0 && (
                                        <div className="mb-3 pb-3 border-b">
                                            <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={forms.length > 0 && selectedForms.length === forms.length}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="font-medium text-gray-700">Select All Forms</span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="space-y-1 max-h-80 overflow-y-auto">
                                        {forms.map(form => (
                                            <label key={form.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedForms.includes(form.id)}
                                                    onChange={() => handleCheckboxChange(form.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{form.name}</p>
                                                    <p className="text-sm text-gray-500 truncate">ID: {form.share_id}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {forms.length === 0 && !formsLoading && (
                                        <div className="text-center py-8">
                                            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No forms found for this lead</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeFormSelector}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFormSelect}
                                    disabled={selectedForms.length === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Select ({selectedForms.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Management Modal */}
            {isManagingColumns && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Manage Columns</h2>
                                <button
                                    onClick={() => setIsManagingColumns(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Drag to reorder or toggle visibility
                            </p>
                        </div>
                        
                        <div className="p-4 max-h-80 overflow-y-auto">
                            {columns.map((column, index) => (
                                <div
                                    key={column.id}
                                    className={`flex items-center justify-between p-2 rounded-lg mb-2 ${
                                        dragOverItem === index ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex items-center flex-1">
                                        <GripVertical size={16} className="text-gray-400 mr-2 cursor-move" />
                                        <span className="text-sm text-gray-700">{column.label}</span>
                                        {column.isMappedToInsurance && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                Insurance
                                            </span>
                                        )}
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={column.visible !== false}
                                            onChange={() => toggleColumnVisibility(column.id)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between">
                                <button
                                    onClick={resetColumns}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Reset to Default
                                </button>
                                <button
                                    onClick={() => setIsManagingColumns(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}