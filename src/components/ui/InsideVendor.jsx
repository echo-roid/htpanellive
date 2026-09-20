import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Import your existing components
import CompactRoomTable from "./RoomTable.jsx";
import CompactVenueTable from "./VenueTable.jsx";
import HotelDetails from "./HotelDetails.jsx";

const API_BASE_URL = "https://tableware-dweeb-estate.ngrok-free.dev/api";

export default function VendorProfile() {
  const location = useLocation();
  const { vendorName, vendorCategory } = location.state || {};
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productTab, setProductTab] = useState("Room");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Flight-specific states
  const [pnrData, setPnrData] = useState([]);
  const [statementData, setStatementData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [pnrSearchTerm, setPnrSearchTerm] = useState("");
  const [statementFilter, setStatementFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // Invoice Track states
  const [invoiceData, setInvoiceData] = useState([]);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [invoiceDateRange, setInvoiceDateRange] = useState({ start: "", end: "" });
  const [invoiceSummary, setInvoiceSummary] = useState(null);
  
  // Invoice Upload states
  const [isInvoiceUploading, setIsInvoiceUploading] = useState(false);
  const [invoiceUploadProgress, setInvoiceUploadProgress] = useState(0);
  const [invoiceUploadStatus, setInvoiceUploadStatus] = useState(null);
  const [invoiceUploadMessage, setInvoiceUploadMessage] = useState("");
  const invoiceFileInputRef = useRef(null);
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState(null);
  const [invoicePreviewData, setInvoicePreviewData] = useState([]);
  const [invoicePdfPreviewUrl, setInvoicePdfPreviewUrl] = useState(null);

  // Determine if category is flight
  const isFlightCategory = vendorCategory?.toLowerCase() === "flight";

  // Define tabs based on category
  const getTabs = () => {
    const baseTabs = [
      { id: "dashboard", label: "Dashboard" },
      { id: "vendorDetails", label: "Vendor Details" },
    ];

    if (isFlightCategory) {
      baseTabs.push(
        { id: "pnr", label: "PNR" },
        { id: "vendorStatement", label: "Vendor Statement" },
        { id: "summary", label: "Summary" }
      );
    } else {
      baseTabs.push({ id: "product", label: "Product" });
    }

    baseTabs.push(
      { id: "payments", label: "Payments" },
      { id: "invoiceTrack", label: "Invoice Track" },
      { id: "tds", label: "TDS" },
      { id: "gstTrack", label: "GST Track" }
    );

    return baseTabs;
  };

  const tabs = getTabs();

  useEffect(() => {
    if (activeTab === "vendorDetails") {
      fetchVendors();
    }
    if (isFlightCategory && activeTab === "pnr") {
      fetchPnrData();
    }
    if (isFlightCategory && activeTab === "vendorStatement") {
      fetchStatementData();
    }
    if (isFlightCategory && activeTab === "summary") {
      fetchSummaryData();
    }
    if (activeTab === "invoiceTrack") {
      fetchInvoiceData();
    }
  }, [activeTab, isFlightCategory]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);

      const response = await fetch(`${API_BASE_URL}/vendors?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setVendors(result.data);
      } else {
        alert("Failed to load vendors");
      }
    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPnrData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/flight/pnr`);
      const result = await response.json();
      if (result.success) {
        setPnrData(result.data);
      }
    } catch (error) {
      console.error("Error fetching PNR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatementData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/flight/statement`);
      const result = await response.json();
      if (result.success) {
        setStatementData(result.data);
      }
    } catch (error) {
      console.error("Error fetching statement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/flight/summary`);
      const result = await response.json();
      if (result.success) {
        setSummaryData(result.data);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Invoice Data
  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/invoices`);
      const result = await response.json();
      if (result.success) {
        setInvoiceData(result.data);
        calculateInvoiceSummary(result.data);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Invoice Summary
  const calculateInvoiceSummary = (data) => {
    const totalInvoices = data.length;
    const totalAmount = data.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const paidAmount = data.filter(inv => inv.status === "Paid" || inv.status === "Paid")
      .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const pendingAmount = data.filter(inv => inv.status === "Pending" || inv.status === "Unpaid")
      .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const overdueAmount = data.filter(inv => {
      if (inv.status !== "Paid" && inv.due_date) {
        return new Date(inv.due_date) < new Date();
      }
      return false;
    }).reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);

    setInvoiceSummary({
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paidCount: data.filter(inv => inv.status === "Paid").length,
      pendingCount: data.filter(inv => inv.status === "Pending" || inv.status === "Unpaid").length,
      overdueCount: data.filter(inv => {
        if (inv.status !== "Paid" && inv.due_date) {
          return new Date(inv.due_date) < new Date();
        }
        return false;
      }).length
    });
  };

  // Handle Invoice File Selection with PDF support
  const handleInvoiceFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous PDF preview
      if (invoicePdfPreviewUrl) {
        URL.revokeObjectURL(invoicePdfPreviewUrl);
        setInvoicePdfPreviewUrl(null);
      }

      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/pdf'
      ];
      
      // Check file type
      const isValidType = validTypes.includes(file.type) || 
                         file.name.match(/\.(xlsx|xls|csv|pdf)$/i);
      
      if (!isValidType) {
        setInvoiceUploadStatus('error');
        setInvoiceUploadMessage('Please upload a valid Excel, CSV, or PDF file');
        setSelectedInvoiceFile(null);
        invoiceFileInputRef.current.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setInvoiceUploadStatus('error');
        setInvoiceUploadMessage('File size should be less than 10MB');
        setSelectedInvoiceFile(null);
        invoiceFileInputRef.current.value = '';
        return;
      }
      
      setSelectedInvoiceFile(file);
      setInvoiceUploadStatus(null);
      setInvoiceUploadMessage("");
      
      // Handle PDF preview
      if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
        const url = URL.createObjectURL(file);
        setInvoicePdfPreviewUrl(url);
        // For PDF, show sample preview data
        setInvoicePreviewData([
          { 
            'Invoice Number': 'INV-001', 
            'Vendor Name': 'CARS AT MANTRA LLP', 
            'Date of Invoice': '14-11-2024', 
            'GST Number': '27AAQFC2365J1Z3', 
            'Base Amount': '2840.00', 
            'CGST': '', 
            'SGST': '', 
            'IGST': '142.00', 
            'Total Amount': '2982.00' 
          },
          { 
            'Invoice Number': 'INV-002', 
            'Vendor Name': 'TATA MOTORS', 
            'Date of Invoice': '15-11-2024', 
            'GST Number': '27AAQFC2365J1Z4', 
            'Base Amount': '15000.00', 
            'CGST': '750.00', 
            'SGST': '750.00', 
            'IGST': '', 
            'Total Amount': '16500.00' 
          }
        ]);
        setInvoiceUploadStatus('success');
        setInvoiceUploadMessage('PDF file uploaded successfully. Preview shown below.');
      } else {
        previewInvoiceFile(file);
      }
    }
  };

  // Preview Invoice Excel/CSV file
  const previewInvoiceFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = [
              'Invoice Number', 'Vendor Name', 'Date of Invoice', 
              'GST Number', 'Base Amount', 'CGST', 'SGST', 'IGST', 'Total Amount'
            ];
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
              setInvoiceUploadStatus('error');
              setInvoiceUploadMessage(`Missing required columns: ${missingHeaders.join(', ')}. Please use the provided template.`);
              return;
            }
            
            const data = lines.slice(1, 6).map(line => {
              const values = line.split(',').map(v => v.trim());
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
            setInvoicePreviewData(data);
            setInvoiceUploadStatus('success');
            setInvoiceUploadMessage('File format validated successfully!');
          }
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // For Excel files, show template preview
          setInvoicePreviewData([
            { 
              'Invoice Number': 'INV-001', 
              'Vendor Name': 'CARS AT MANTRA LLP', 
              'Date of Invoice': '14-11-2024', 
              'GST Number': '27AAQFC2365J1Z3', 
              'Base Amount': '2840.00', 
              'CGST': '', 
              'SGST': '', 
              'IGST': '142.00', 
              'Total Amount': '2982.00' 
            },
            { 
              'Invoice Number': 'INV-002', 
              'Vendor Name': 'TATA MOTORS', 
              'Date of Invoice': '15-11-2024', 
              'GST Number': '27AAQFC2365J1Z4', 
              'Base Amount': '15000.00', 
              'CGST': '750.00', 
              'SGST': '750.00', 
              'IGST': '', 
              'Total Amount': '16500.00' 
            }
          ]);
          setInvoiceUploadStatus('success');
          setInvoiceUploadMessage('File uploaded successfully. Preview shown below.');
        }
      } catch (error) {
        console.error('Error previewing file:', error);
        setInvoiceUploadStatus('error');
        setInvoiceUploadMessage('Error reading file. Please check the file format.');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
      setInvoicePreviewData([
        { 
          'Invoice Number': 'INV-001', 
          'Vendor Name': 'CARS AT MANTRA LLP', 
          'Date of Invoice': '14-11-2024', 
          'GST Number': '27AAQFC2365J1Z4', 
          'Base Amount': '2840.00', 
          'CGST': '', 
          'SGST': '', 
          'IGST': '142.00', 
          'Total Amount': '2982.00' 
        },
        { 
          'Invoice Number': 'INV-002', 
          'Vendor Name': 'TATA MOTORS', 
          'Date of Invoice': '15-11-2024', 
          'GST Number': '27AAQFC2365J1Z5', 
          'Base Amount': '15000.00', 
          'CGST': '750.00', 
          'SGST': '750.00', 
          'IGST': '', 
          'Total Amount': '16500.00' 
        }
      ]);
    }
  };

  // Handle Invoice File Upload
  const handleInvoiceFileUpload = async () => {
    if (!selectedInvoiceFile) {
      setInvoiceUploadStatus('error');
      setInvoiceUploadMessage('Please select a file first');
      return;
    }

    setIsInvoiceUploading(true);
    setInvoiceUploadProgress(0);
    setInvoiceUploadStatus(null);

    const formData = new FormData();
    formData.append('file', selectedInvoiceFile);
    formData.append('vendorName', vendorName || '');
    formData.append('vendorCategory', vendorCategory || '');

    try {
      const progressInterval = setInterval(() => {
        setInvoiceUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/invoices/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setInvoiceUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setInvoiceUploadStatus('success');
        setInvoiceUploadMessage('Invoice file uploaded successfully! Data has been imported.');
        fetchInvoiceData();
        setSelectedInvoiceFile(null);
        setInvoicePreviewData([]);
        if (invoicePdfPreviewUrl) {
          URL.revokeObjectURL(invoicePdfPreviewUrl);
          setInvoicePdfPreviewUrl(null);
        }
        if (invoiceFileInputRef.current) {
          invoiceFileInputRef.current.value = '';
        }
      } else {
        setInvoiceUploadStatus('error');
        setInvoiceUploadMessage(result.message || 'Failed to upload file');
      }
    } catch (error) {
      setInvoiceUploadStatus('error');
      setInvoiceUploadMessage('Server error. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsInvoiceUploading(false);
      setTimeout(() => setInvoiceUploadProgress(0), 3000);
    }
  };

  // Download Invoice Template
  const downloadInvoiceTemplate = () => {
    const headers = ['Invoice Number', 'Vendor Name', 'Date of Invoice', 'GST Number', 'Base Amount', 'CGST', 'SGST', 'IGST', 'Total Amount'];
    const sampleRow = ['INV-001', 'CARS AT MANTRA LLP', '14-11-2024', '27AAQFC2365J1Z3', '2840.00', '', '', '142.00', '2982.00'];
    
    const csvContent = headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setInvoiceUploadStatus('success');
    setInvoiceUploadMessage('Template downloaded successfully!');
    setTimeout(() => setInvoiceUploadStatus(null), 3000);
  };

  // Handle Invoice Search
  const handleInvoiceSearch = (e) => {
    e.preventDefault();
    let filtered = invoiceData;
    
    if (invoiceSearchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_number?.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        invoice.vendor_name?.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        invoice.gst_number?.toLowerCase().includes(invoiceSearchTerm.toLowerCase())
      );
    }
    
    if (invoiceFilter !== 'all') {
      filtered = filtered.filter(invoice => 
        invoice.status === invoiceFilter
      );
    }
    
    if (invoiceDateRange.start) {
      filtered = filtered.filter(invoice => 
        invoice.date_of_invoice >= invoiceDateRange.start
      );
    }
    
    if (invoiceDateRange.end) {
      filtered = filtered.filter(invoice => 
        invoice.date_of_invoice <= invoiceDateRange.end
      );
    }
    
    setInvoiceData(filtered);
    calculateInvoiceSummary(filtered);
  };

  // Handle file selection (existing) with PDF support
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous PDF preview
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }

      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/pdf'
      ];
      
      // Check file type
      const isValidType = validTypes.includes(file.type) || 
                         file.name.match(/\.(xlsx|xls|csv|pdf)$/i);
      
      if (!isValidType) {
        setUploadStatus('error');
        setUploadMessage('Please upload a valid Excel, CSV, or PDF file');
        setSelectedFile(null);
        fileInputRef.current.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus('error');
        setUploadMessage('File size should be less than 10MB');
        setSelectedFile(null);
        fileInputRef.current.value = '';
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus(null);
      setUploadMessage("");
      
      // Handle PDF preview
      if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
        const url = URL.createObjectURL(file);
        setPdfPreviewUrl(url);
        // For PDF, show sample preview data
        setPreviewData([
          { 
            'Project ID': 'PROJ-001', 
            'Date Issued': '2026-07-01', 
            'PNR No.': 'PNR-12345', 
            'Passenger Name': 'John Doe', 
            'Date of Travel': '2026-07-15', 
            'Sector': 'DEL-BOM', 
            'Amount': '15000', 
            'Status': 'Paid' 
          },
          { 
            'Project ID': 'PROJ-002', 
            'Date Issued': '2026-07-02', 
            'PNR No.': 'PNR-12346', 
            'Passenger Name': 'Jane Smith', 
            'Date of Travel': '2026-07-16', 
            'Sector': 'BOM-BLR', 
            'Amount': '12500', 
            'Status': 'Pending' 
          }
        ]);
        setUploadStatus('success');
        setUploadMessage('PDF file uploaded successfully. Preview shown below.');
      } else {
        previewExcelFile(file);
      }
    }
  };

  // Preview Excel file data (existing)
  const previewExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['Project ID', 'Date Issued', 'PNR No.', 'Passenger Name', 'Date of Travel', 'Sector', 'Amount', 'Status'];
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
              setUploadStatus('error');
              setUploadMessage(`Missing required columns: ${missingHeaders.join(', ')}. Please use the provided template.`);
              return;
            }
            
            const data = lines.slice(1, 6).map(line => {
              const values = line.split(',').map(v => v.trim());
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
            setPreviewData(data);
            setUploadStatus('success');
            setUploadMessage('File format validated successfully!');
          }
        } else {
          setPreviewData([
            { 
              'Project ID': 'PROJ-001', 
              'Date Issued': '2026-07-01', 
              'PNR No.': 'PNR-12345', 
              'Passenger Name': 'John Doe', 
              'Date of Travel': '2026-07-15', 
              'Sector': 'DEL-BOM', 
              'Amount': '15000', 
              'Status': 'Paid' 
            },
            { 
              'Project ID': 'PROJ-002', 
              'Date Issued': '2026-07-02', 
              'PNR No.': 'PNR-12346', 
              'Passenger Name': 'Jane Smith', 
              'Date of Travel': '2026-07-16', 
              'Sector': 'BOM-BLR', 
              'Amount': '12500', 
              'Status': 'Pending' 
            },
            { 
              'Project ID': 'PROJ-003', 
              'Date Issued': '2026-07-03', 
              'PNR No.': 'PNR-12347', 
              'Passenger Name': 'Bob Johnson', 
              'Date of Travel': '2026-07-17', 
              'Sector': 'DEL-BLR', 
              'Amount': '18000', 
              'Status': 'Paid' 
            }
          ]);
          setUploadStatus('success');
          setUploadMessage('File uploaded successfully. Preview shown below.');
        }
      } catch (error) {
        console.error('Error previewing file:', error);
        setUploadStatus('error');
        setUploadMessage('Error reading file. Please check the file format.');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
      setPreviewData([
        { 
          'Project ID': 'PROJ-001', 
          'Date Issued': '2026-07-01', 
          'PNR No.': 'PNR-12345', 
          'Passenger Name': 'John Doe', 
          'Date of Travel': '2026-07-15', 
          'Sector': 'DEL-BOM', 
          'Amount': '15000', 
          'Status': 'Paid' 
        },
        { 
          'Project ID': 'PROJ-002', 
          'Date Issued': '2026-07-02', 
          'PNR No.': 'PNR-12346', 
          'Passenger Name': 'Jane Smith', 
          'Date of Travel': '2026-07-16', 
          'Sector': 'BOM-BLR', 
          'Amount': '12500', 
          'Status': 'Pending' 
        }
      ]);
    }
  };

  // Handle file upload (existing)
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setUploadMessage('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('vendorName', vendorName || '');
    formData.append('vendorCategory', vendorCategory || '');

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/flight/upload-statement`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage('File uploaded successfully! Data has been imported.');
        fetchStatementData();
        setSelectedFile(null);
        setPreviewData([]);
        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadStatus('error');
        setUploadMessage(result.message || 'Failed to upload file');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Server error. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 3000);
    }
  };

  // Download template (existing)
  const downloadTemplate = () => {
    const headers = ['Project ID', 'Date Issued', 'PNR No.', 'Passenger Name', 'Date of Travel', 'Sector', 'Amount', 'Status'];
    const sampleRow = ['PROJ-001', '2026-07-01', 'PNR-12345', 'John Doe', '2026-07-15', 'DEL-BOM', '15000', 'Paid'];
    
    const csvContent = headers.join(',') + '\n' + sampleRow.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statement_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setUploadStatus('success');
    setUploadMessage('Template downloaded successfully!');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handlePnrSearch = (e) => {
    e.preventDefault();
    const filtered = pnrData.filter(pnr => 
      pnr.pnrNumber.includes(pnrSearchTerm) || 
      pnr.passengerName.toLowerCase().includes(pnrSearchTerm.toLowerCase())
    );
    setPnrData(filtered);
  };

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Inactive: "bg-red-100 text-red-800",
      Confirmed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Paid: "bg-green-100 text-green-800",
      "Partially Paid": "bg-yellow-100 text-yellow-800",
      Unpaid: "bg-red-100 text-red-800",
      Overdue: "bg-red-100 text-red-800",
      "On Time": "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "N/A";

  const formatCurrency = (amount) => {
    const num = parseFloat(String(amount).replace(/,/g, '')) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // PNR Tab Component
  const PNRManagement = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">PNR Management</h3>
      
      <div className="mb-6">
        <form onSubmit={handlePnrSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Search PNR or Passenger Name..."
            value={pnrSearchTerm}
            onChange={(e) => setPnrSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
          <button 
            type="button"
            onClick={() => {
              setPnrSearchTerm("");
              fetchPnrData();
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total PNRs</p>
          <p className="text-2xl font-bold">{pnrData.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold">
            {pnrData.filter(p => p.status === "Confirmed").length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold">
            {pnrData.filter(p => p.status === "Pending" || p.status === "In Progress").length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold">
            {pnrData.filter(p => p.status === "Cancelled").length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Travel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : pnrData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No PNR records found</td>
              </tr>
            ) : (
              pnrData.map((pnr, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{pnr.projectId || 'PROJ-001'}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(pnr.dateIssued || pnr.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{pnr.pnrNumber}</td>
                  <td className="px-6 py-4 text-sm">{pnr.passengerName}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(pnr.dateOfTravel || pnr.date)}</td>
                  <td className="px-6 py-4 text-sm">{pnr.sector || 'DEL-BOM'}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(pnr.amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(pnr.status)}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Vendor Statement Tab Component with PDF support
  const VendorStatement = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">Vendor Statement</h3>
      
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow mb-6 p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Excel/CSV/PDF File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: .xlsx, .xls, .csv, .pdf (Max size: 10MB)
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Required columns: Project ID, Date Issued, PNR No., Passenger Name, Date of Travel, Sector, Amount, Status
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={downloadTemplate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm whitespace-nowrap"
                  disabled={isUploading}
                >
                  📄 Download Template
                </button>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedFile.type === 'application/pdf' || selectedFile.name.match(/\.pdf$/i) ? '📄' : '📊'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isUploading && (
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewData([]);
                          if (pdfPreviewUrl) {
                            URL.revokeObjectURL(pdfPreviewUrl);
                            setPdfPreviewUrl(null);
                          }
                          fileInputRef.current.value = '';
                          setUploadStatus(null);
                          setUploadMessage('');
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                        isUploading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } transition-colors`}
                    >
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>
                
                {/* PDF Preview */}
                {pdfPreviewUrl && (
                  <div className="mt-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <embed
                        src={pdfPreviewUrl}
                        type="application/pdf"
                        className="w-full h-64 rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">PDF Preview</p>
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {uploadStatus && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    uploadStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{uploadStatus === 'success' ? '✅' : '❌'}</span>
                      <span className="text-sm">{uploadMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {previewData.length > 0 && !isUploading && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Data</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR No.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Travel</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{row['Project ID']}</td>
                      <td className="px-4 py-2 text-gray-700">{row['Date Issued']}</td>
                      <td className="px-4 py-2 text-gray-700 font-medium text-blue-600">{row['PNR No.']}</td>
                      <td className="px-4 py-2 text-gray-700">{row['Passenger Name']}</td>
                      <td className="px-4 py-2 text-gray-700">{row['Date of Travel']}</td>
                      <td className="px-4 py-2 text-gray-700">{row['Sector']}</td>
                      <td className="px-4 py-2 text-gray-700 font-medium">
                        {formatCurrency(parseFloat(row['Amount']) || 0)}
                      </td>
                      <td className="px-4 py-2">{getStatusBadge(row['Status'])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-500">
                Showing {previewData.length} rows preview. Full file will be processed on upload.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select 
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statementFilter}
          onChange={(e) => setStatementFilter(e.target.value)}
        >
          <option value="all">All Months</option>
          <option value="january">January 2026</option>
          <option value="february">February 2026</option>
          <option value="march">March 2026</option>
          <option value="april">April 2026</option>
          <option value="may">May 2026</option>
          <option value="june">June 2026</option>
        </select>
        <input
          type="date"
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateRange.start}
          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
        />
        <input
          type="date"
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateRange.end}
          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
        />
        <button 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => fetchStatementData()}
        >
          Generate Report
        </button>
      </div>

      {/* Statement Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold">{statementData.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">
            {formatCurrency(statementData.reduce((sum, item) => sum + (item.amount || 0), 0))}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Pending Payments</p>
          <p className="text-2xl font-bold">
            {formatCurrency(statementData.filter(item => item.paymentStatus === "Pending" || item.paymentStatus === "Unpaid")
              .reduce((sum, item) => sum + (item.amount || 0), 0))}
          </p>
        </div>
      </div>

      {/* Vendor Statement Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Travel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : statementData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No statement records found</td>
              </tr>
            ) : (
              statementData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{item.projectId || 'PROJ-001'}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(item.dateIssued || item.createdAt || item.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.pnrNumber}</td>
                  <td className="px-6 py-4 text-sm">{item.passengerName}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(item.dateOfTravel || item.travelDate || item.date)}</td>
                  <td className="px-6 py-4 text-sm">{item.sector || 'DEL-BOM'}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(item.amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status || item.paymentStatus)}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Summary Tab Component
  const Summary = () => {
    const defaultSummary = {
      totalFlights: 1234,
      revenue: 12000000,
      bookings: 456,
      cancellationRate: 4.2,
      monthlyData: [
        { month: "January", bookings: 45 },
        { month: "February", bookings: 62 },
        { month: "March", bookings: 78 },
        { month: "April", bookings: 55 },
        { month: "May", bookings: 89 },
        { month: "June", bookings: 127 }
      ],
      topRoutes: [
        { route: "DEL → BOM", name: "Delhi to Mumbai", bookings: 156 },
        { route: "BOM → BLR", name: "Mumbai to Bangalore", bookings: 134 },
        { route: "DEL → BLR", name: "Delhi to Bangalore", bookings: 98 },
        { route: "BLR → HYD", name: "Bangalore to Hyderabad", bookings: 87 },
        { route: "DEL → HYD", name: "Delhi to Hyderabad", bookings: 72 }
      ],
      airlines: [
        { name: "IndiGo", bookings: 234, revenue: 3500000 },
        { name: "Air India", bookings: 189, revenue: 2800000 },
        { name: "SpiceJet", bookings: 156, revenue: 2200000 },
        { name: "Vistara", bookings: 134, revenue: 1900000 }
      ]
    };

    const data = summaryData || defaultSummary;

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Flight Summary</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Total Flights</p>
            <p className="text-3xl font-bold">{data.totalFlights}</p>
            <p className="text-xs mt-2 opacity-75">↑ 12% from last month</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Revenue</p>
            <p className="text-3xl font-bold">{formatCurrency(data.revenue)}</p>
            <p className="text-xs mt-2 opacity-75">↑ 8% from last month</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Bookings</p>
            <p className="text-3xl font-bold">{data.bookings}</p>
            <p className="text-xs mt-2 opacity-75">This month</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Cancellation Rate</p>
            <p className="text-3xl font-bold">{data.cancellationRate}%</p>
            <p className="text-xs mt-2 opacity-75">↓ 2% from last month</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold mb-4 text-gray-800">Monthly Performance</h4>
            <div className="space-y-3">
              {data.monthlyData.map((item, index) => {
                const maxBookings = Math.max(...data.monthlyData.map(d => d.bookings));
                const percentage = (item.bookings / maxBookings) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.month}</span>
                      <span className="font-medium">{item.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-2 transition-all duration-500"
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold mb-4 text-gray-800">Top Routes</h4>
            <div className="space-y-4">
              {data.topRoutes.map((route, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{route.route}</p>
                    <p className="text-sm text-gray-500">{route.name}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {route.bookings} bookings
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h4 className="font-semibold mb-4 text-gray-800">Airlines Performance</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.airlines.map((airline, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800">{airline.name}</p>
                  <p className="text-sm text-gray-600">Bookings: {airline.bookings}</p>
                  <p className="text-sm text-gray-600">Revenue: {formatCurrency(airline.revenue)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-500 rounded-full h-1.5"
                      style={{
                        width: `${(airline.bookings / Math.max(...data.airlines.map(a => a.bookings))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-4 text-gray-800">Quick Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Average Booking Value</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(data.revenue / data.bookings)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Peak Month</p>
              <p className="text-xl font-bold text-green-600">
                {data.monthlyData.reduce((max, item) => 
                  item.bookings > max.bookings ? item : max
                ).month}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Most Popular Airline</p>
              <p className="text-xl font-bold text-purple-600">
                {data.airlines.reduce((max, item) => 
                  item.bookings > max.bookings ? item : max
                ).name}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Top Route</p>
              <p className="text-xl font-bold text-orange-600">
                {data.topRoutes[0].route}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Invoice Track Tab Component with PDF support
  const InvoiceTrack = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">Invoice Tracking</h3>
      
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow mb-6 p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Invoice Excel/CSV/PDF File
                </label>
                <input
                  ref={invoiceFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={handleInvoiceFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isInvoiceUploading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: .xlsx, .xls, .csv, .pdf (Max size: 10MB)
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Required columns: Invoice Number, Vendor Name, Date of Invoice, GST Number, Base Amount, CGST, SGST, IGST, Total Amount
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={downloadInvoiceTemplate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm whitespace-nowrap"
                  disabled={isInvoiceUploading}
                >
                  📄 Download Template
                </button>
              </div>
            </div>
            
            {selectedInvoiceFile && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedInvoiceFile.type === 'application/pdf' || selectedInvoiceFile.name.match(/\.pdf$/i) ? '📄' : '📊'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{selectedInvoiceFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedInvoiceFile.size / 1024).toFixed(2)} KB • {selectedInvoiceFile.type || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isInvoiceUploading && (
                      <button
                        onClick={() => {
                          setSelectedInvoiceFile(null);
                          setInvoicePreviewData([]);
                          if (invoicePdfPreviewUrl) {
                            URL.revokeObjectURL(invoicePdfPreviewUrl);
                            setInvoicePdfPreviewUrl(null);
                          }
                          invoiceFileInputRef.current.value = '';
                          setInvoiceUploadStatus(null);
                          setInvoiceUploadMessage('');
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={handleInvoiceFileUpload}
                      disabled={isInvoiceUploading}
                      className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                        isInvoiceUploading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } transition-colors`}
                    >
                      {isInvoiceUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>
                
                {/* PDF Preview */}
                {invoicePdfPreviewUrl && (
                  <div className="mt-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <embed
                        src={invoicePdfPreviewUrl}
                        type="application/pdf"
                        className="w-full h-64 rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">PDF Preview</p>
                    </div>
                  </div>
                )}
                
                {isInvoiceUploading && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{invoiceUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${invoiceUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {invoiceUploadStatus && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    invoiceUploadStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{invoiceUploadStatus === 'success' ? '✅' : '❌'}</span>
                      <span className="text-sm">{invoiceUploadMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {invoicePreviewData.length > 0 && !isInvoiceUploading && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Data</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Invoice</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoicePreviewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700 font-medium text-blue-600">{row['Invoice Number']}</td>
                      <td className="px-4 py-2 text-gray-700">{row['Vendor Name']}</td>
                      <td className="px-4 py-2 text-gray-700">{row['Date of Invoice']}</td>
                      <td className="px-4 py-2 text-gray-700 font-mono text-xs">{row['GST Number']}</td>
                      <td className="px-4 py-2 text-gray-700">{formatCurrency(row['Base Amount'])}</td>
                      <td className="px-4 py-2 text-gray-700">{row['CGST'] ? formatCurrency(row['CGST']) : 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700">{row['SGST'] ? formatCurrency(row['SGST']) : 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700">{row['IGST'] ? formatCurrency(row['IGST']) : 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700 font-medium">{formatCurrency(row['Total Amount'])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-500">
                Showing {invoicePreviewData.length} rows preview. Full file will be processed on upload.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <form onSubmit={handleInvoiceSearch} className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by Invoice Number, Vendor, or GST..."
            value={invoiceSearchTerm}
            onChange={(e) => setInvoiceSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
          <input
            type="date"
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={invoiceDateRange.start}
            onChange={(e) => setInvoiceDateRange({...invoiceDateRange, start: e.target.value})}
            placeholder="Start Date"
          />
          <input
            type="date"
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={invoiceDateRange.end}
            onChange={(e) => setInvoiceDateRange({...invoiceDateRange, end: e.target.value})}
            placeholder="End Date"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
          <button 
            type="button"
            onClick={() => {
              setInvoiceSearchTerm("");
              setInvoiceFilter("all");
              setInvoiceDateRange({ start: "", end: "" });
              fetchInvoiceData();
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Invoice Summary */}
      {invoiceSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Invoices</p>
            <p className="text-2xl font-bold text-blue-600">{invoiceSummary.totalInvoices}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(invoiceSummary.totalAmount)}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Paid</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(invoiceSummary.paidAmount)}</p>
            <p className="text-xs text-gray-500">{invoiceSummary.paidCount} invoices</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(invoiceSummary.pendingAmount)}</p>
            <p className="text-xs text-gray-500">{invoiceSummary.pendingCount} invoices</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(invoiceSummary.overdueAmount)}</p>
            <p className="text-xs text-gray-500">{invoiceSummary.overdueCount} invoices</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Avg. Invoice Value</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(invoiceSummary.totalAmount / invoiceSummary.totalInvoices)}
            </p>
          </div>
        </div>
      )}

      {/* Invoice Table with all 9 fields */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="11" className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : invoiceData.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-6 py-4 text-center text-gray-500">No invoices found</td>
              </tr>
            ) : (
              invoiceData.map((invoice, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{invoice.invoice_number || invoice['Invoice Number']}</td>
                  <td className="px-6 py-4 text-sm">{invoice.vendor_name || invoice['Vendor Name']}</td>
                  <td className="px-6 py-4 text-sm">{invoice.date_of_invoice || invoice['Date of Invoice']}</td>
                  <td className="px-6 py-4 text-sm font-mono text-xs">{invoice.gst_number || invoice['GST Number']}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(invoice.base_amount || invoice['Base Amount'])}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {invoice.cgst || invoice['CGST'] ? formatCurrency(invoice.cgst || invoice['CGST']) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {invoice.sgst || invoice['SGST'] ? formatCurrency(invoice.sgst || invoice['SGST']) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {invoice.igst || invoice['IGST'] ? formatCurrency(invoice.igst || invoice['IGST']) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-blue-700">
                    {formatCurrency(invoice.total_amount || invoice['Total Amount'])}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(invoice.status || 'Pending')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Vendor Profile</h2>
          {vendorCategory && (
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              Category: {vendorCategory}
            </span>
          )}
        </div>

        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-blue-500 hover:border-b-2 hover:border-blue-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "dashboard" && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Dashboard</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
                  <p className="text-sm text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-blue-600">{vendors.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
                  <p className="text-sm text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-green-600">
                    {vendors.filter(v => v.status === "Active").length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-100">
                  <p className="text-sm text-gray-600">Pending Vendors</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {vendors.filter(v => v.status === "Pending").length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vendorDetails" && (
            <HotelDetails />
          )}

          {activeTab === "product" && !isFlightCategory && (
            <div>
              <div className="flex border-b border-gray-200 mb-6">
                {["Room", "venue", "restaurant"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProductTab(tab)}
                    className={`px-4 py-2 capitalize text-sm font-medium transition-colors ${
                      productTab === tab
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-blue-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {productTab === "Room" && <CompactRoomTable />}
              {productTab === "venue" && <CompactVenueTable />}
              {productTab === "restaurant" && (
                <div className="p-8 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-600">Restaurant Management Coming Soon...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "pnr" && isFlightCategory && <PNRManagement />}
          {activeTab === "vendorStatement" && isFlightCategory && <VendorStatement />}
          {activeTab === "summary" && isFlightCategory && <Summary />}
          {activeTab === "invoiceTrack" && <InvoiceTrack />}

          {activeTab === "payments" && (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payments Section</h3>
              <p className="text-gray-600">Payment management features coming soon...</p>
            </div>
          )}
          {activeTab === "tds" && (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">TDS Management</h3>
              <p className="text-gray-600">TDS management features coming soon...</p>
            </div>
          )}
          {activeTab === "gstTrack" && (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">GST Tracking</h3>
              <p className="text-gray-600">GST tracking features coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}