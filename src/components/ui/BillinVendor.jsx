import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, FileText, AlertCircle, CheckCircle, Download, Trash2, Eye,
  Camera, Loader, Search, Filter, Calendar, DollarSign, Hash, Tag,
  Building2, Receipt, Edit2, Save, X, File, RefreshCw, ChevronDown, ChevronRight,
  Plus, Minus, Copy, Check, MapPin, Phone
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://tableware-dweeb-estate.ngrok-free.dev/api';

const VendorBillingPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [billsList, setBillsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBill, setEditingBill] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTables, setExpandedTables] = useState({});
  const [expandedFields, setExpandedFields] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const fileInputRef = useRef(null);

  // New state for modal visibility
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const savedBills = localStorage.getItem('vendorBills');
    if (savedBills) {
      try {
        setBillsList(JSON.parse(savedBills));
      } catch (e) {
        console.error('Failed to load saved bills', e);
      }
    }
  }, []);

  useEffect(() => {
    if (billsList.length > 0) {
      localStorage.setItem('vendorBills', JSON.stringify(billsList));
    }
  }, [billsList]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    validateAndAddFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const validateAndAddFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Please upload JPG, PNG, or PDF files.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      preview: file.type === 'application/pdf' ? null : URL.createObjectURL(file)
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setError(null);
  };

  // Advanced PDF text extraction with position data
  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      let allItems = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageItems = textContent.items.map(item => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
          page: i
        }));
        
        allItems = [...allItems, ...pageItems];
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      await pdf.destroy();
      
      return { fullText, structuredItems: allItems };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw error;
    }
  };

  // Format field name for display
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get field icon based on field name
  const getFieldIcon = (fieldName) => {
    const name = fieldName.toLowerCase();
    if (name.includes('invoice') || name.includes('bill')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (name.includes('gst') || name.includes('gstin')) return <Tag className="h-4 w-4 text-purple-500" />;
    if (name.includes('date') || name.includes('time')) return <Calendar className="h-4 w-4 text-green-500" />;
    if (name.includes('amount') || name.includes('total') || name.includes('price')) return <DollarSign className="h-4 w-4 text-yellow-500" />;
    if (name.includes('name') || name.includes('supplier') || name.includes('vendor') || name.includes('customer')) return <Building2 className="h-4 w-4 text-indigo-500" />;
    if (name.includes('address') || name.includes('location')) return <MapPin className="h-4 w-4 text-red-500" />;
    if (name.includes('phone') || name.includes('mobile') || name.includes('email')) return <Phone className="h-4 w-4 text-green-500" />;
    if (name.includes('pan') || name.includes('tan')) return <Hash className="h-4 w-4 text-orange-500" />;
    if (name.includes('bank') || name.includes('account') || name.includes('ifsc')) return <Building2 className="h-4 w-4 text-blue-500" />;
    return <Tag className="h-4 w-4 text-gray-500" />;
  };

  // Get field value color based on field type
  const getFieldValueColor = (fieldName, value) => {
    const name = fieldName.toLowerCase();
    if (name.includes('amount') || name.includes('total') || name.includes('price')) {
      return 'text-green-700 font-semibold';
    }
    if (name.includes('gst') || name.includes('gstin') || name.includes('pan')) {
      return 'font-mono text-sm text-purple-700';
    }
    if (name.includes('date')) {
      return 'text-blue-700';
    }
    return 'text-gray-900';
  };

  // Copy field value to clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(String(value));
    setCopiedField(value);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper function to format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return JSON.stringify(value, null, 2);
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Helper function to get display value
  const getDisplayValue = (value) => {
    if (value === null || value === undefined) return 'No value provided';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return 'Empty array';
        return `Array (${value.length} items)`;
      }
      const keys = Object.keys(value);
      if (keys.length === 0) return 'Empty object';
      return `Object (${keys.length} properties)`;
    }
    return String(value);
  };

  // Render all fields as key-value pairs from the API response
  const renderAllFields = (fields) => {
    if (!fields || typeof fields !== 'object' || Object.keys(fields).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Tag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>No fields extracted from document</p>
        </div>
      );
    }

    // Sort fields alphabetically for better organization
    const sortedFields = Object.entries(fields).sort((a, b) => a[0].localeCompare(b[0]));

    // Group fields by category
    const groups = {
      'Document Info': ['invoice', 'bill', 'document', 'copy', 'original'],
      'Supplier/Vendor': ['supplier', 'vendor', 'seller', 'provider'],
      'Financial': ['amount', 'total', 'tax', 'gst', 'subtotal', 'price', 'rate', 'discount', 'base', 'cgst', 'sgst', 'igst'],
      'Date & Time': ['date', 'time', 'due', 'period'],
      'Identification': ['gstin', 'gst', 'pan', 'tan', 'uin', 'sac', 'hsn', 'account', 'ifsc'],
      'Other': []
    };

    const groupedFields = {};
    sortedFields.forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      let assigned = false;
      for (const [groupName, keywords] of Object.entries(groups)) {
        if (keywords.some(keyword => lowerKey.includes(keyword))) {
          if (!groupedFields[groupName]) groupedFields[groupName] = [];
          groupedFields[groupName].push([key, value]);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        if (!groupedFields['Other']) groupedFields['Other'] = [];
        groupedFields['Other'].push([key, value]);
      }
    });

    return (
      <div className="space-y-4">
        {Object.entries(groupedFields).map(([groupName, fieldsList]) => (
          <div key={groupName} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">{groupName}</h4>
              <span className="text-xs text-gray-500">{fieldsList.length} fields</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {fieldsList.map(([key, value], index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white group"
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-1">
                      {getFieldIcon(key)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700 uppercase tracking-wider truncate">
                          {formatFieldName(key)}
                        </label>
                        <button
                          onClick={() => copyToClipboard(formatValue(value))}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy value"
                        >
                          {copiedField === formatValue(value) ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2">
                        {typeof value === 'object' && value !== null ? (
                          <div className="w-full">
                            <textarea
                              value={formatValue(value)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  const updatedFields = { ...scanResults.fields, [key]: parsed };
                                  setScanResults({ ...scanResults, fields: updatedFields });
                                } catch {
                                  const updatedFields = { ...scanResults.fields, [key]: e.target.value };
                                  setScanResults({ ...scanResults, fields: updatedFields });
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                              rows={Math.min(5, String(formatValue(value)).split('\n').length + 2)}
                              placeholder={`Enter ${formatFieldName(key)} (JSON format)`}
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => {
                              const updatedFields = { ...scanResults.fields, [key]: e.target.value };
                              setScanResults({ ...scanResults, fields: updatedFields });
                            }}
                            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${getFieldValueColor(key, value)}`}
                            placeholder={`Enter ${formatFieldName(key)}`}
                          />
                        )}
                        <div className="mt-1 text-xs text-gray-400 truncate">
                          {value !== null && value !== undefined && value !== '' ? (
                            typeof value === 'object' ? (
                              <span>Current: {getDisplayValue(value)}</span>
                            ) : (
                              <span>Current: {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}</span>
                            )
                          ) : (
                            <span className="italic">No value provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const scanBill = async (file) => {
    setScanning(true);
    setScanProgress(0);
    setSelectedFile(file);
    setError(null);
    setDebugInfo(null);

    try {
      let extractedText = '';

      if (file.file.type === 'application/pdf') {
        const result = await extractTextFromPDF(file.file);
        extractedText = result.fullText;
        setScanProgress(50);
      } else {
        // For images, use the API to extract text
        extractedText = "Sample text for image";
        setScanProgress(50);
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }

      setScanProgress(70);
      
      const response = await axios.post(`${API_URL}/scan-document`, {
        rawText: extractedText
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      setScanProgress(90);

      if (response.data.success) {
        const apiData = response.data.data;
        
        // The API returns exactly these 9 fields
        const extractedFields = {
          vendor_name: apiData.vendor_name || '',
          invoice_number: apiData.invoice_number || '',
          date_of_invoice: apiData.date_of_invoice || '',
          gst_number: apiData.gst_number || '',
          base_amount: apiData.base_amount || '',
          cgst: apiData.cgst || null,
          sgst: apiData.sgst || null,
          igst: apiData.igst || null,
          total_amount: apiData.total_amount || ''
        };
        
        // Calculate derived values
        const baseAmount = parseFloat(String(extractedFields.base_amount).replace(/,/g, '')) || 0;
        const cgst = parseFloat(String(extractedFields.cgst).replace(/,/g, '')) || 0;
        const sgst = parseFloat(String(extractedFields.sgst).replace(/,/g, '')) || 0;
        const igst = parseFloat(String(extractedFields.igst).replace(/,/g, '')) || 0;
        const totalAmount = parseFloat(String(extractedFields.total_amount).replace(/,/g, '')) || 0;
        const taxAmount = cgst + sgst + igst;
        
        // Calculate GST rate if base amount and tax are available
        let gstRate = 0;
        if (baseAmount > 0 && taxAmount > 0) {
          gstRate = (taxAmount / baseAmount) * 100;
          gstRate = Math.round(gstRate * 10) / 10;
        }
        
        setScanResults({
          documentType: 'invoice',
          fields: extractedFields,
          tables: [],
          rawText: extractedText,
          // Store the 9 specific fields
          vendor_name: extractedFields.vendor_name,
          invoice_number: extractedFields.invoice_number,
          date_of_invoice: extractedFields.date_of_invoice,
          gst_number: extractedFields.gst_number,
          base_amount: extractedFields.base_amount,
          cgst: extractedFields.cgst,
          sgst: extractedFields.sgst,
          igst: extractedFields.igst,
          total_amount: extractedFields.total_amount,
          // Common fields for easy access (mapped from the 9 fields)
          billNumber: extractedFields.invoice_number,
          vendorName: extractedFields.vendor_name,
          vendorGST: extractedFields.gst_number,
          billDate: extractedFields.date_of_invoice,
          totalAmount: totalAmount,
          taxAmount: taxAmount,
          taxableValue: baseAmount,
          gstRate: gstRate,
          // File info
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          preview: file.preview,
          extractedText: extractedText
        });

        const hasData = extractedFields.invoice_number || extractedFields.vendor_name || extractedFields.total_amount;
        
        if (!hasData) {
          setError('Could not automatically extract data. Please review and edit manually.');
        }

        setScanProgress(100);
      } else {
        throw new Error(response.data.message || 'Failed to parse document');
      }

    } catch (error) {
      console.error('Scan error:', error);
      
      let errorMessage = 'Failed to scan bill. ';
      
      if (error.response) {
        errorMessage += error.response.data?.message || 'Server error occurred.';
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      setError(`${errorMessage} Please use manual entry.`);
      manualEntry();
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };

  const saveToListing = async () => {
    if (!scanResults) return;

    setIsSaving(true);

    try {
      const billData = {
        documentType: scanResults.documentType,
        fields: scanResults.fields,
        tables: scanResults.tables,
        // Store the 9 specific fields
        vendor_name: scanResults.vendor_name,
        invoice_number: scanResults.invoice_number,
        date_of_invoice: scanResults.date_of_invoice,
        gst_number: scanResults.gst_number,
        base_amount: scanResults.base_amount,
        cgst: scanResults.cgst,
        sgst: scanResults.sgst,
        igst: scanResults.igst,
        total_amount: scanResults.total_amount,
        // Common fields for compatibility
        billNumber: scanResults.invoice_number,
        vendorName: scanResults.vendor_name,
        vendorGST: scanResults.gst_number,
        billDate: scanResults.date_of_invoice,
        totalAmount: scanResults.totalAmount || 0,
        taxAmount: scanResults.taxAmount || 0,
        taxableValue: scanResults.taxableValue || 0,
        gstRate: scanResults.gstRate || 0,
        rawText: scanResults.rawText || ''
      };

      const newBill = {
        id: Date.now(),
        ...billData,
        status: 'processed',
        processedAt: new Date().toISOString()
      };

      setBillsList([newBill, ...billsList]);
      setUploadedFiles(uploadedFiles.filter(f => f.id !== selectedFile?.id));
      
      if (selectedFile?.preview && selectedFile.type !== 'application/pdf') {
        URL.revokeObjectURL(selectedFile.preview);
      }
      
      setScanResults(null);
      setSelectedFile(null);
      setShowUploadModal(false); // Close modal after save
      setError(null);
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save bill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const manualEntry = () => {
    setScanResults({
      documentType: 'invoice',
      fields: {
        vendor_name: '',
        invoice_number: '',
        date_of_invoice: '',
        gst_number: '',
        base_amount: '',
        cgst: null,
        sgst: null,
        igst: null,
        total_amount: ''
      },
      tables: [],
      // Initialize the 9 specific fields
      vendor_name: '',
      invoice_number: '',
      date_of_invoice: new Date().toISOString().split('T')[0],
      gst_number: '',
      base_amount: '',
      cgst: null,
      sgst: null,
      igst: null,
      total_amount: '',
      // Common fields
      billNumber: '',
      vendorName: '',
      vendorGST: '',
      billDate: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      taxAmount: 0,
      taxableValue: 0,
      gstRate: 0,
      fileId: selectedFile?.id,
      fileName: selectedFile?.name,
      fileType: selectedFile?.type,
      preview: selectedFile?.preview,
      rawText: ''
    });
  };

  const updateBill = (id, updatedData) => {
    setBillsList(billsList.map(bill => 
      bill.id === id ? { ...bill, ...updatedData } : bill
    ));
    setEditingBill(null);
  };

  const deleteBill = (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      const updatedBills = billsList.filter(bill => bill.id !== id);
      setBillsList(updatedBills);
      if (updatedBills.length === 0) {
        localStorage.removeItem('vendorBills');
      }
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(String(amount).replace(/,/g, '')) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };

  const filteredBills = billsList.filter(bill => {
    const matchesSearch = 
      bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.gst_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && bill.status === filterStatus;
  });

  // Cleanup function when modal closes
  const closeUploadModal = () => {
    // Revoke object URLs
    uploadedFiles.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setUploadedFiles([]);
    setScanResults(null);
    setSelectedFile(null);
    setError(null);
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Receipt className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Vendor Billing System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {billsList.length} Bills Processed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bills List View (always shown) */}
        <div className="space-y-6">
          {/* Header with Upload Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">All Bills</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Bill
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by invoice number, vendor, or GST..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bills Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.length > 0 ? (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Receipt className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bill.invoice_number || bill.billNumber || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{bill.vendor_name || bill.vendorName || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {bill.date_of_invoice || bill.billDate || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">{formatCurrency(bill.base_amount || bill.taxableValue || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(bill.total_amount || bill.totalAmount || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-mono text-gray-600">{bill.gst_number || bill.vendorGST || 'N/A'}</div>
                          {bill.gstRate > 0 && (
                            <div className="text-xs text-gray-400">@{bill.gstRate}% GST</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => setEditingBill(bill)}
                            className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by uploading and scanning a bill.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Upload & Scan Bill</h3>
              <button onClick={closeUploadModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Error Display */}
              {error && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-yellow-500 hover:text-yellow-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Scanning Progress */}
              {scanning && (
                <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Scanning document...</span>
                    <span className="text-sm text-gray-500">{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {scanProgress < 50 && 'Extracting text from document...'}
                    {scanProgress >= 50 && scanProgress < 70 && 'Parsing document data...'}
                    {scanProgress >= 70 && scanProgress < 100 && 'Analyzing with AI...'}
                    {scanProgress === 100 && 'Complete!'}
                  </p>
                </div>
              )}

              {/* Upload Area */}
              <div
                className={`bg-white rounded-lg shadow-sm border-2 border-dashed p-8 transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Choose Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      or drag and drop files here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: JPG, PNG, PDF (Max 10MB each)
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h2>
                    <button
                      onClick={() => {
                        uploadedFiles.forEach(file => {
                          if (file.preview) URL.revokeObjectURL(file.preview);
                        });
                        setUploadedFiles([]);
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {file.type === 'application/pdf' ? (
                            <File className="h-12 w-12 text-red-500" />
                          ) : (
                            file.preview && (
                              <img 
                                src={file.preview} 
                                alt={file.name}
                                className="h-12 w-12 object-cover rounded"
                              />
                            )
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB • {file.type.split('/')[1].toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => scanBill(file)}
                            disabled={scanning}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {scanning && selectedFile?.id === file.id ? (
                              <>
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                {file.type === 'application/pdf' ? (
                                  <FileText className="h-4 w-4 mr-2" />
                                ) : (
                                  <Camera className="h-4 w-4 mr-2" />
                                )}
                                Extract Data
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              if (file.preview) URL.revokeObjectURL(file.preview);
                              setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id));
                            }}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scanning Results */}
              {scanResults && (
                <div className="mt-6 bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-medium text-gray-900">
                        Extracted Data
                      </h2>
                      {scanResults.documentType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {scanResults.documentType.toUpperCase()}
                        </span>
                      )}
                      {scanResults.fields && Object.keys(scanResults.fields).length > 0 && (
                        <span className="text-xs text-gray-500">
                          ({Object.keys(scanResults.fields).length} fields extracted)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Please verify
                      </span>
                      <button
                        onClick={manualEntry}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        title="Manual Entry"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {scanResults.preview && scanResults.fileType !== 'application/pdf' && (
                      <div className="mb-6">
                        <img 
                          src={scanResults.preview} 
                          alt="Scanned bill"
                          className="max-h-64 rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    {/* Display the 9 specific fields prominently */}
                    <div className="mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-3">Extracted Invoice Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">Vendor Name</label>
                            <p className="text-sm font-semibold text-gray-900">{scanResults.vendor_name || 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">Invoice Number</label>
                            <p className="text-sm font-semibold text-gray-900">{scanResults.invoice_number || 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">Date of Invoice</label>
                            <p className="text-sm font-semibold text-gray-900">{scanResults.date_of_invoice || 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">GST Number</label>
                            <p className="text-sm font-semibold text-gray-900 font-mono">{scanResults.gst_number || 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">Base Amount</label>
                            <p className="text-sm font-semibold text-green-700">{scanResults.base_amount ? formatCurrency(scanResults.base_amount) : 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">CGST</label>
                            <p className="text-sm font-semibold text-gray-900">{scanResults.cgst ? formatCurrency(scanResults.cgst) : 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">SGST</label>
                            <p className="text-sm font-semibold text-gray-900">{scanResults.sgst ? formatCurrency(scanResults.sgst) : 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm">
                            <label className="text-xs font-medium text-gray-600">IGST</label>
                            <p className="text-sm font-semibold text-gray-900">{scanResults.igst ? formatCurrency(scanResults.igst) : 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded p-3 shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                            <label className="text-xs font-medium text-gray-600">Total Amount</label>
                            <p className="text-sm font-bold text-blue-700">{scanResults.total_amount ? formatCurrency(scanResults.total_amount) : 'N/A'}</p>
                          </div>
                        </div>
                        {/* Summary row */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-yellow-50 rounded p-2 text-center">
                            <span className="text-xs text-gray-600">Taxable Value</span>
                            <p className="text-sm font-semibold">{formatCurrency(scanResults.taxableValue)}</p>
                          </div>
                          <div className="bg-yellow-50 rounded p-2 text-center">
                            <span className="text-xs text-gray-600">Total Tax</span>
                            <p className="text-sm font-semibold">{formatCurrency(scanResults.taxAmount)}</p>
                          </div>
                          <div className="bg-yellow-50 rounded p-2 text-center">
                            <span className="text-xs text-gray-600">GST Rate</span>
                            <p className="text-sm font-semibold">{scanResults.gstRate || 'N/A'}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All Fields from API Response */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-medium text-gray-900">All Extracted Fields</h3>
                        <button
                          onClick={() => setExpandedFields(!expandedFields)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {expandedFields ? 'Collapse All' : 'Expand All'}
                        </button>
                      </div>
                      {renderAllFields(scanResults.fields)}
                    </div>

                    {/* Raw Text Preview */}
                    {scanResults.rawText && (
                      <details className="mb-6">
                        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600">
                          <FileText className="h-4 w-4 inline mr-1" />
                          Raw Extracted Text
                        </summary>
                        <div className="mt-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <pre className="p-3 bg-white rounded-lg text-xs overflow-auto max-h-60 whitespace-pre-wrap border border-gray-200 font-mono">
                              {scanResults.rawText.substring(0, 2000)}
                              {scanResults.rawText.length > 2000 && '... (truncated)'}
                            </pre>
                          </div>
                        </div>
                      </details>
                    )}

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          if (scanResults.preview) URL.revokeObjectURL(scanResults.preview);
                          setScanResults(null);
                          setSelectedFile(null);
                          setDebugInfo(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveToListing}
                        disabled={!scanResults.invoice_number && !scanResults.vendor_name || isSaving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                            Saving...
                          </>
                        ) : (
                          'Save to Listing'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {editingBill && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Edit Bill</h3>
              <button onClick={() => setEditingBill(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* The 9 Specific Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={editingBill.vendor_name || editingBill.vendorName || ''}
                    onChange={(e) => setEditingBill({...editingBill, vendor_name: e.target.value, vendorName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={editingBill.invoice_number || editingBill.billNumber || ''}
                    onChange={(e) => setEditingBill({...editingBill, invoice_number: e.target.value, billNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Invoice</label>
                  <input
                    type="text"
                    value={editingBill.date_of_invoice || editingBill.billDate || ''}
                    onChange={(e) => setEditingBill({...editingBill, date_of_invoice: e.target.value, billDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={editingBill.gst_number || editingBill.vendorGST || ''}
                    onChange={(e) => setEditingBill({...editingBill, gst_number: e.target.value, vendorGST: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.base_amount || editingBill.taxableValue || 0}
                    onChange={(e) => setEditingBill({...editingBill, base_amount: e.target.value, taxableValue: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGST</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.cgst || ''}
                    onChange={(e) => setEditingBill({...editingBill, cgst: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SGST</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.sgst || ''}
                    onChange={(e) => setEditingBill({...editingBill, sgst: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IGST</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.igst || ''}
                    onChange={(e) => setEditingBill({...editingBill, igst: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.total_amount || editingBill.totalAmount || 0}
                    onChange={(e) => setEditingBill({...editingBill, total_amount: e.target.value, totalAmount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* All Extracted Fields */}
              {editingBill.fields && Object.keys(editingBill.fields).length > 0 && (
                <details className="mt-4" open>
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600">
                    <Tag className="h-4 w-4 inline mr-1" />
                    All Extracted Fields ({Object.keys(editingBill.fields).length})
                  </summary>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    {Object.entries(editingBill.fields).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-1">
                            {getFieldIcon(key)}
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                              {formatFieldName(key)}
                            </label>
                            <input
                              type="text"
                              value={value || ''}
                              onChange={(e) => {
                                const updatedFields = { ...editingBill.fields, [key]: e.target.value };
                                setEditingBill({ ...editingBill, fields: updatedFields });
                              }}
                              className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Enter ${formatFieldName(key)}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingBill(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateBill(editingBill.id, editingBill)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBillingPage;