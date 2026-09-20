import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Upload,
  PlusCircle,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  Settings,
  X,
  GripVertical,
  MessageSquare,
  Filter,
  ArrowUpDown,
  Copy,
  Search,
  Save,
  AlertCircle,
  CheckCircle,
  UserMinus,
  Hash,
  Users,
  UserCheck,
  UserX,
  FileText,
  SquareMousePointer,
  Download,
  FileUp
} from "lucide-react";

const inputClass =
  "min-w-[19px] h-7 px-2 py-1 text-xs leading-tight border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500";

const Gestlist = ({leaD}) => {
  
  const { id: mainLeadId } = useParams();
  const leadId = leaD ?? mainLeadId;
  const [allColumns, setAllColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingHeader, setEditingHeader] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [headerOptions, setHeaderOptions] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [verifyKeys, setVerifyKeys] = useState([]);
  const [duplicateAllowed, setDuplicateAllowed] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Column reordering states
  const [isReordering, setIsReordering] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Select checkbox state
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Serial number field
  const [showSerialNumber, setShowSerialNumber] = useState(true);
  const [serialNumberField] = useState("Sr.No.");

  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [CallPop, setCallPop] = useState(false);
  const [ActiveFilter, setActiveFilter] = useState(false);
  const [ActiveSelectBox, setActiveSelectBox] = useState(false);
  
  // Remark modal state
  const [remarkModal, setRemarkModal] = useState({
    isOpen: false,
    rowIndex: null,
    remark: ""
  });

  // Column filter popup state
  const [columnFilterPopup, setColumnFilterPopup] = useState({
    isOpen: false,
    column: null,
    position: { x: 0, y: 0 },
    sortDirection: null,
    filterText: "",
    showDuplicates: false
  });

  // Add Row Modal state
  const [addRowModal, setAddRowModal] = useState({
    isOpen: false,
    rowData: {},
    editingIndex: null
  });

  // Save loading state
  const [isSaving, setIsSaving] = useState(false);

  // Remove Row Modal states
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    rowIndex: null,
    identifierField: "Emp ID",
    identifierValue: "",
    method: "index"
  });

  // Bulk Remove Modal state
  const [bulkRemoveModal, setBulkRemoveModal] = useState({
    isOpen: false,
    selectedIndices: new Set(),
    identifierField: "Emp ID",
    identifierValues: [],
    method: "indices"
  });

  // Bulk Status Modal state
  const [bulkStatusModal, setBulkStatusModal] = useState({
    isOpen: false,
    newStatus: "Active"
  });

  // Clear All Modal state
  const [clearAllModal, setClearAllModal] = useState({
    isOpen: false,
    confirmText: ""
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
    details: null
  });

  // Drag and Drop states
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize with serial number
  useEffect(() => {
    const fetchGuestList = async () => {
      try {
        const { data: res } = await axios.get(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/guestlist`
        );

        const { data: dyn } = await axios.get(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/dynamic-values/${leadId}`
        );

        if (res && res.guestData && Array.isArray(res.guestData)) {
          let processed = processData(res.guestData);

          if (dyn.status === "success" && dyn.data.length > 0) {
            const dynamic = dyn.data[0].SelectedField;
            
            if (dynamic?.numberofPax && Array.isArray(dynamic.numberofPax)) {
              const formfillMap = {};
              
              dynamic.numberofPax.forEach((paxGroup) => {
                paxGroup.selectField.forEach((fieldObj) => {
                  const fcCode = fieldObj["Fc Code"];
                  if (fcCode !== undefined && fcCode !== null) {
                    formfillMap[String(fcCode)] = fieldObj.formfill || 0;
                  }
                });
              });
              
              processed.data = processed.data.map((row) => {
                const rowFcCode = row["Fc Code"];
                const formfillValue = rowFcCode ? formfillMap[String(rowFcCode)] : 0;
                
                return { 
                  ...row, 
                  formfill: formfillValue !== undefined ? formfillValue : (row.formfill || 0)
                };
              });
            }
          }

          processed.data = processed.data.map(row => ({
            ...row,
            remark: row.remark || ""
          }));

          if (!processed.columns.includes("remark")) {
            processed.columns.push("remark");
          }

          if (!processed.columns.includes(serialNumberField)) {
            processed.columns.unshift(serialNumberField);
          }

          if (!processed.columns.includes("select")) {
            processed.columns.unshift("select");
          }

          processed.data = processed.data.map((row, index) => ({
            ...row,
            [serialNumberField]: index + 1,
            select: false
          }));

          setData(processed.data);
          setFilteredData(processed.data);
          setAllColumns(processed.columns);
          setVisibleColumns(processed.columns);
        }
      } catch (err) {
        console.error("Error fetching guest list:", err);
        showNotification("error", "Failed to load guest list", err.message);
      }
    };

    if (leadId) fetchGuestList();
  }, [leadId]);

  // Apply sorting and filtering
  useEffect(() => {
    applyColumnFilter();
  }, [columnFilterPopup, data]);

  // Update serial numbers
  useEffect(() => {
    if (data.length > 0) {
      const updatedData = data.map((row, index) => ({
        ...row,
        [serialNumberField]: index + 1
      }));
      setData(updatedData);
    }
  }, [data.length]);

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalGuests = data.length;
    const activeGuests = data.filter(row => row.Status === "Active").length;
    const inactiveGuests = data.filter(row => row.Status === "Inactive").length;
    const totalFormfill = data.reduce((sum, row) => sum + (parseFloat(row.formfill) || 0), 0);
    const remarksCount = data.filter(row => row.remark && row.remark.trim() !== "").length;
    
    return {
      totalGuests,
      activeGuests,
      inactiveGuests,
      totalFormfill: totalFormfill.toFixed(2),
      remarksCount,
      selectedCount: selectedRows.size
    };
  };

  const summary = calculateSummary();

  // Helper function to show notifications
  const showNotification = (type, message, details = null) => {
    setNotification({
      show: true,
      type,
      message,
      details
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Find Pax column function
  const findPaxColumn = () => {
    if (allColumns.includes("Number OF Pax Allowed")) {
      return "Number OF Pax Allowed";
    }
    
    const lowerColumns = allColumns.map(col => col.toLowerCase());
    const searchTerms = [
      "number of pax allowed",
      "no of pax allowed",
      "pax allowed",
      "number of pax",
      "pax"
    ];
    
    for (const term of searchTerms) {
      const index = lowerColumns.findIndex(col => col.includes(term));
      if (index !== -1) {
        return allColumns[index];
      }
    }
    
    const nonSystemColumns = allColumns.filter(col => 
      !['select', 'Sr.No.', 'Sr.No', 'Sr No', 'Sr No.', 'Status', 'formfill', 'remark'].includes(col)
    );
    
    return nonSystemColumns[0] || null;
  };

  // Debug columns function
  const debugColumns = () => {
    if (data.length > 0) {
      const firstRow = data[0];
      console.log("All available columns:", allColumns);
      console.log("First row keys:", Object.keys(firstRow));
      console.log("First row values:", firstRow);
      console.log("Found Pax column:", findPaxColumn());
      showNotification("info", "Column debug", `Found ${allColumns.length} columns. Check console for details.`);
    }
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      await processExcelFile(file);
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processExcelFile = async (file) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      showNotification("error", "Invalid file type", "Please upload Excel files (.xlsx, .xls) or CSV files.");
      return;
    }

    setIsProcessingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          
          if (json.length > 0) {
            let processed = processData(json);
            processed.data = processed.data.map(row => ({
              ...row,
              remark: row.remark || ""
            }));
            setData(processed.data);
            setFilteredData(processed.data);
            setAllColumns(processed.columns);
            setVisibleColumns(processed.columns);
            showNotification("success", "File imported successfully", `${json.length} records loaded`);
            setShowSubmitButton(true);
            setCallPop(false);
          } else {
            showNotification("warning", "Empty file", "The uploaded file contains no data.");
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          showNotification("error", "Failed to parse file", "Please ensure the file is a valid Excel file.");
        } finally {
          setIsProcessingFile(false);
        }
      };
      
      reader.onerror = () => {
        showNotification("error", "File read error", "Could not read the file. Please try again.");
        setIsProcessingFile(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error processing file:", error);
      showNotification("error", "File processing failed", error.message);
      setIsProcessingFile(false);
    }
  };

  const processData = (dataArray) => {
    if (dataArray.length === 0)
      return { 
        data: [], 
        columns: ["select", "Sr. No.", "Status", "formfill", "remark"] 
      };
    
    const hasStatus = dataArray[0].hasOwnProperty("Status");
    let newData = dataArray;
    if (!hasStatus) {
      newData = dataArray.map((row) => ({ ...row, Status: "Active" }));
    }
    
    newData = newData.map((row) => ({ 
      ...row, 
      formfill: row.formfill !== undefined ? row.formfill : 0,
      remark: row.remark || "",
      select: false
    }));
    
    const columns = ["select", serialNumberField, ...Object.keys(newData[0]).filter(key => key !== "select")];
    return { data: newData, columns };
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processExcelFile(file);
  };

  // Column filter functions
  const openColumnFilter = (column, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setColumnFilterPopup({
      isOpen: true,
      column,
      position: { x: rect.left, y: rect.bottom + window.scrollY },
      sortDirection: null,
      filterText: "",
      showDuplicates: false
    });
  };

  const closeColumnFilter = () => {
    setColumnFilterPopup({
      isOpen: false,
      column: null,
      position: { x: 0, y: 0 },
      sortDirection: null,
      filterText: "",
      showDuplicates: false
    });
  };

  const applyColumnFilter = () => {
    if (!columnFilterPopup.column) {
      setFilteredData([...data]);
      return;
    }

    let filtered = [...data];
    const { column, sortDirection, filterText, showDuplicates } = columnFilterPopup;

    if (filterText.trim()) {
      filtered = filtered.filter(row => {
        const value = row[column];
        return value?.toString().toLowerCase().includes(filterText.toLowerCase());
      });
    }

    if (showDuplicates) {
      const valueCounts = {};
      filtered.forEach(row => {
        const value = row[column];
        const key = value?.toString().toLowerCase();
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });

      filtered = filtered.filter(row => {
        const value = row[column];
        const key = value?.toString().toLowerCase();
        return valueCounts[key] > 1;
      });
    }

    if (sortDirection) {
      filtered.sort((a, b) => {
        const valA = a[column]?.toString().toLowerCase() || "";
        const valB = b[column]?.toString().toLowerCase() || "";
        
        if (sortDirection === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const toggleSort = (direction) => {
    setColumnFilterPopup(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === direction ? null : direction
    }));
  };

  const clearColumnFilter = () => {
    setColumnFilterPopup(prev => ({
      ...prev,
      sortDirection: null,
      filterText: "",
      showDuplicates: false
    }));
  };

  const getDuplicateCount = () => {
    const { column } = columnFilterPopup;
    if (!column || !columnFilterPopup.showDuplicates) return 0;

    const valueCounts = {};
    data.forEach(row => {
      const value = row[column];
      const key = value?.toString().toLowerCase();
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    });

    return Object.values(valueCounts).filter(count => count > 1).length;
  };

  // Column reordering functions
  const handleColumnDragStart = (e, index) => {
    setDragItem(index);
  };

  const handleColumnDragOver = (e, index) => {
    e.preventDefault();
    setDragOverItem(index);
  };

  const handleColumnDrop = () => {
    if (dragItem === null || dragOverItem === null) return;
    
    const newVisibleColumns = [...visibleColumns];
    const draggedItem = newVisibleColumns[dragItem];
    newVisibleColumns.splice(dragItem, 1);
    newVisibleColumns.splice(dragOverItem, 0, draggedItem);
    
    setVisibleColumns(newVisibleColumns);
    setDragItem(null);
    setDragOverItem(null);
  };

  const resetColumnOrder = () => {
    setVisibleColumns([...allColumns]);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter((col) => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Select checkbox functions
  const toggleRowSelect = (rowIndex) => {
    const actualRowIndex = data.findIndex(item => item === filteredData[rowIndex]);
    const newSelectedRows = new Set(selectedRows);
    
    if (newSelectedRows.has(actualRowIndex)) {
      newSelectedRows.delete(actualRowIndex);
    } else {
      newSelectedRows.add(actualRowIndex);
    }
    
    setSelectedRows(newSelectedRows);
    
    const updatedData = [...data];
    updatedData[actualRowIndex].select = !updatedData[actualRowIndex].select;
    setData(updatedData);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedRows = new Set();
    const updatedData = [...data];
    
    if (newSelectAll) {
      filteredData.forEach((row, index) => {
        const actualRowIndex = data.findIndex(item => item === row);
        newSelectedRows.add(actualRowIndex);
        updatedData[actualRowIndex].select = true;
      });
    } else {
      filteredData.forEach((row, index) => {
        const actualRowIndex = data.findIndex(item => item === row);
        updatedData[actualRowIndex].select = false;
      });
    }
    
    setSelectedRows(newSelectedRows);
    setData(updatedData);
  };

  const getSelectedCount = () => {
    return selectedRows.size;
  };

  const getSelectedRowsData = () => {
    return Array.from(selectedRows).map(index => data[index]);
  };

  // Remark functions
  const openRemarkModal = (rowIndex) => {
    const actualRowIndex = data.findIndex(item => item === filteredData[rowIndex]);
    setRemarkModal({
      isOpen: true,
      rowIndex: actualRowIndex,
      remark: data[actualRowIndex].remark || ""
    });
  };

  const closeRemarkModal = () => {
    setRemarkModal({
      isOpen: false,
      rowIndex: null,
      remark: ""
    });
  };

  const saveRemark = () => {
    if (remarkModal.rowIndex !== null) {
      const updatedData = [...data];
      updatedData[remarkModal.rowIndex].remark = remarkModal.remark;
      setData(updatedData);
      showNotification("success", "Remark saved successfully");
    }
    closeRemarkModal();
  };

  const getRemarkPreview = (remark) => {
    if (!remark) return "";
    return remark.length > 30 ? `${remark.substring(0, 30)}...` : remark;
  };

  // Update row API call
  const updateGuestRow = async (rowIndex, updatedRowData) => {
    try {
      const response = await axios.put(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/update-row`,
        {
          rowIndex: rowIndex,
          updatedData: updatedRowData
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating row:", error);
      throw error;
    }
  };

  // Add Row Modal functions
  const openAddRowModal = (rowIndex = null) => {
    if (allColumns.length === 0) {
      showNotification("error", "No columns available", "Please import data first.");
      return;
    }

    if (rowIndex !== null) {
      const actualRowIndex = data.findIndex(item => item === filteredData[rowIndex]);
      setAddRowModal({
        isOpen: true,
        rowData: { ...data[actualRowIndex] },
        editingIndex: actualRowIndex
      });
    } else {
      const emptyRow = {};
      allColumns.forEach(col => {
        if (col === "select" || col === serialNumberField) return;
        emptyRow[col] = col === "Status" ? "Active" : 
                       col === "formfill" ? 0 : "";
      });
      setAddRowModal({
        isOpen: true,
        rowData: emptyRow,
        editingIndex: null
      });
    }
  };

  const closeAddRowModal = () => {
    setAddRowModal({
      isOpen: false,
      rowData: {},
      editingIndex: null
    });
  };

  const handleAddRowModalChange = (column, value) => {
    setAddRowModal(prev => ({
      ...prev,
      rowData: {
        ...prev.rowData,
        [column]: value
      }
    }));
  };

  const saveAddRowModal = async () => {
    const { editingIndex, rowData } = addRowModal;
    setIsSaving(true);

    try {
      if (editingIndex !== null) {
        const { select, [serialNumberField]: srNo, ...cleanRowData } = rowData;
        const result = await updateGuestRow(editingIndex, cleanRowData);
        if (result.success) {
          const updatedData = [...data];
          updatedData[editingIndex] = {
            ...rowData,
            select: updatedData[editingIndex].select,
            [serialNumberField]: updatedData[editingIndex][serialNumberField]
          };
          setData(updatedData);
          setFilteredData(updatedData);
          showNotification("success", "Row updated successfully");
          closeAddRowModal();
        }
      } else {
        const newRow = { 
          ...rowData,
          [serialNumberField]: data.length + 1,
          select: false
        };
        const { select, [serialNumberField]: srNo, ...cleanNewRow } = newRow;

        const response = await axios.post(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/guestlist?action=append`,
          { guestData: [cleanNewRow] }
        );

        if (response.data.success) {
          const updatedData = [...data, newRow];
          setData(updatedData);
          setFilteredData(updatedData);
          showNotification("success", "New row added successfully");
          closeAddRowModal();
        }
      }
    } catch (error) {
      showNotification("error", "Operation failed", error.response?.data?.message || error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── UPDATED HEADER RENAME FUNCTION WITH API INTEGRATION ───
  const handleHeaderChange = async (oldColumn, newHeader) => {
    if (!newHeader || newHeader.trim() === "") return;
    if (oldColumn === newHeader) {
      setEditingHeader(null);
      return;
    }

    // Save previous state for rollback
    const prevAllColumns = [...allColumns];
    const prevVisibleColumns = [...visibleColumns];
    const prevData = [...data];

    // Optimistically update UI
    const newAllColumns = allColumns.map(col => col === oldColumn ? newHeader : col);
    setAllColumns(newAllColumns);
    const newVisibleColumns = visibleColumns.map(col => col === oldColumn ? newHeader : col);
    setVisibleColumns(newVisibleColumns);
    const updatedData = data.map(row => {
      const newRow = { ...row, [newHeader]: row[oldColumn] };
      delete newRow[oldColumn];
      return newRow;
    });
    setData(updatedData);
    setEditingHeader(null);

    try {
      // Call API to rename header
      await axios.put(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/rename-header`,
        {
          oldColumnName: oldColumn,
          newColumnName: newHeader
        }
      );
      showNotification("success", `Header renamed to "${newHeader}" successfully.`);
    } catch (error) {
      console.error("Error renaming header:", error);
      // Rollback on error
      setAllColumns(prevAllColumns);
      setVisibleColumns(prevVisibleColumns);
      setData(prevData);
      showNotification("error", "Failed to rename header", error.response?.data?.message || error.message);
    }
  };
  // ─────────────────────────────────────────────────────────────

  // Remove Row Functions
  const openRemoveModal = (rowIndex = null) => {
    if (rowIndex !== null) {
      const actualRowIndex = data.findIndex(item => item === filteredData[rowIndex]);
      const rowData = data[actualRowIndex];
      
      setRemoveModal({
        isOpen: true,
        rowIndex: actualRowIndex,
        identifierField: "Emp ID",
        identifierValue: rowData["Emp ID"] || "",
        method: "index"
      });
    } else {
      setRemoveModal({
        isOpen: true,
        rowIndex: null,
        identifierField: "Emp ID",
        identifierValue: "",
        method: "identifier"
      });
    }
  };

  const closeRemoveModal = () => {
    setRemoveModal({
      isOpen: false,
      rowIndex: null,
      identifierField: "Emp ID",
      identifierValue: "",
      method: "index"
    });
  };

  const handleRemoveRow = async () => {
    try {
      let payload = {};
      
      if (removeModal.method === "index" && removeModal.rowIndex !== null) {
        payload = { rowIndex: removeModal.rowIndex };
      } else if (removeModal.method === "identifier") {
        payload = { 
          identifier: {
            field: removeModal.identifierField,
            value: removeModal.identifierValue
          }
        };
      } else if (removeModal.method === "rowId") {
        payload = { rowId: removeModal.identifierValue };
      }

      const response = await axios.delete(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/remove-row`,
        { data: payload }
      );

      if (response.data.success) {
        const updatedData = [...data];
        if (removeModal.method === "index" && removeModal.rowIndex !== null) {
          updatedData.splice(removeModal.rowIndex, 1);
        } else {
          const index = updatedData.findIndex(row => 
            row[removeModal.identifierField] == removeModal.identifierValue
          );
          if (index !== -1) {
            updatedData.splice(index, 1);
          }
        }
        
        setData(updatedData);
        showNotification("success", "Record removed successfully", response.data.message);
        closeRemoveModal();
      }
    } catch (error) {
      console.error("Error removing row:", error);
      showNotification("error", "Failed to remove record", error.response?.data?.message || error.message);
    }
  };

  const handleDeleteRow = (rowIndex) => {
    const newData = [...data];
    newData.splice(rowIndex, 1);
    setData(newData);
    showNotification("success", "Record deleted locally");
  };

  // Bulk Remove Functions
  const openBulkRemoveModal = () => {
    if (selectedRows.size === 0) {
      showNotification("info", "No rows selected", "Please select rows to remove.");
      return;
    }
    
    setBulkRemoveModal({
      isOpen: true,
      selectedIndices: selectedRows,
      identifierField: "Emp ID",
      identifierValues: [],
      method: "indices"
    });
  };

  const closeBulkRemoveModal = () => {
    setBulkRemoveModal({
      isOpen: false,
      selectedIndices: new Set(),
      identifierField: "Emp ID",
      identifierValues: [],
      method: "indices"
    });
  };

  const toggleBulkSelection = (rowIndex) => {
    const newSelectedIndices = new Set(bulkRemoveModal.selectedIndices);
    if (newSelectedIndices.has(rowIndex)) {
      newSelectedIndices.delete(rowIndex);
    } else {
      newSelectedIndices.add(rowIndex);
    }
    setBulkRemoveModal(prev => ({ ...prev, selectedIndices: newSelectedIndices }));
  };

  const handleBulkRemove = async () => {
    try {
      const indices = Array.from(bulkRemoveModal.selectedIndices);
      
      const response = await axios.delete(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/bulk-remove`,
        { data: { rowIndices: indices } }
      );

      if (response.data.success) {
        const sortedIndices = [...indices].sort((a, b) => b - a);
        const updatedData = [...data];
        sortedIndices.forEach(index => {
          updatedData.splice(index, 1);
        });
        
        setData(updatedData);
        setSelectedRows(new Set());
        setSelectAll(false);
        showNotification("success", "Records removed successfully", `${indices.length} record(s) removed`);
        closeBulkRemoveModal();
      }
    } catch (error) {
      console.error("Error in bulk remove:", error);
      showNotification("error", "Failed to remove records", error.response?.data?.message || error.message);
    }
  };

  // Bulk Status Update Functions
  const openBulkStatusModal = () => {
    if (selectedRows.size === 0) {
      showNotification("info", "No rows selected", "Please select rows to update status.");
      return;
    }
    setBulkStatusModal({
      isOpen: true,
      newStatus: "Active"
    });
  };

  const closeBulkStatusModal = () => {
    setBulkStatusModal({
      isOpen: false,
      newStatus: "Active"
    });
  };

  const handleBulkStatusUpdate = () => {
    if (selectedRows.size === 0) {
      showNotification("info", "No rows selected", "Please select rows to update status.");
      closeBulkStatusModal();
      return;
    }

    const updatedData = [...data];
    const selectedIndices = Array.from(selectedRows);
    
    selectedIndices.forEach(index => {
      if (updatedData[index]) {
        updatedData[index].Status = bulkStatusModal.newStatus;
      }
    });
    
    setData(updatedData);
    showNotification(
      "success", 
      `Status updated to ${bulkStatusModal.newStatus}`, 
      `${selectedRows.size} selected row(s) updated`
    );
    closeBulkStatusModal();
  };

  // Clear All Functions
  const openClearAllModal = () => {
    setClearAllModal({
      isOpen: true,
      confirmText: ""
    });
  };

  const closeClearAllModal = () => {
    setClearAllModal({
      isOpen: false,
      confirmText: ""
    });
  };

  const handleClearAll = async () => {
    if (clearAllModal.confirmText.toLowerCase() !== "confirm") {
      showNotification("error", "Please type 'confirm' to proceed");
      return;
    }

    try {
      const response = await axios.delete(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/clear`,
        { data: { confirm: true } }
      );

      if (response.data.success) {
        setData([]);
        setFilteredData([]);
        setSelectedRows(new Set());
        setSelectAll(false);
        showNotification("success", "Guest list cleared", `${response.data.clearedCount} records removed`);
        closeClearAllModal();
      }
    } catch (error) {
      console.error("Error clearing list:", error);
      showNotification("error", "Failed to clear list", error.response?.data?.message || error.message);
    }
  };

  const handleSubmit = async (chooseSubmit) => {
    if (!leadId.trim()) {
      showNotification("error", "Invalid Lead ID");
      return;
    }

    if (data.length === 0) {
      showNotification("error", "No data to submit");
      return;
    }

    try {
      const dataToSubmit = data.map(({ select, [serialNumberField]: srNo, ...rest }) => rest);
      
      const response = await axios.post(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/guestlist?action=${chooseSubmit}`,
        { guestData: dataToSubmit }
      );
      showNotification("success", "Guest list submitted", response.data.message);
    } catch (error) {
      console.error("Error uploading guest list:", error);
      showNotification("error", "Failed to upload guest list", error.response?.data?.message || error.message);
    }
  };

  const openSettingsModal = async () => {
    setShowSettingsModal(true);
    try {
      const { data: res } = await axios.get(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/guest-list/headers`
      );
      if (res.success) {
        setHeaderOptions(res.headers);
        setSelectedKeys(["Number OF Pax Allowed"]);
        setVerifyKeys([]);
      }
    } catch (err) {
      console.error("Failed to fetch headers:", err);
      showNotification("error", "Failed to load settings", err.message);
    }
  };

  const toggleKeySelection = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleVerifySelection = (key) => {
    setVerifyKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Export selected rows
  const exportSelectedRows = () => {
    if (selectedRows.size === 0) {
      showNotification("info", "No rows selected", "Please select rows to export.");
      return;
    }

    const selectedData = getSelectedRowsData();
    const exportData = selectedData.map(({ select, [serialNumberField]: srNo, ...rest }) => rest);
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Rows");
    XLSX.writeFile(workbook, `selected_rows_${new Date().getTime()}.xlsx`);
    
    showNotification("success", "Export successful", `${selectedRows.size} rows exported.`);
  };

  // Export all data
  const exportAllData = () => {
    if (data.length === 0) {
      showNotification("info", "No data to export", "Please import data first.");
      return;
    }

    const exportData = data.map(({ select, [serialNumberField]: srNo, ...rest }) => rest);
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Guests");
    XLSX.writeFile(workbook, `guest_list_${new Date().getTime()}.xlsx`);
    
    showNotification("success", "Export successful", `${data.length} rows exported.`);
  };

  return (
    <div className="py-6 px-0 rounded-lg ">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md animate-slide-in ${
          notification.type === "success" ? "bg-green-100 border-green-400 text-green-800" : "bg-red-100 border-red-400 text-red-800"
        }`}>
          <div className="flex items-start gap-3">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
              {notification.details && (
                <p className="text-sm opacity-80 mt-1">{notification.details}</p>
              )}
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Total Guests Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Total Guests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalGuests}</p>
              <p className="text-xs text-blue-600 mt-1">All records in the list</p>
            </div>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Active Guests Card */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Active Guests</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{summary.activeGuests}</p>
              <p className="text-xs text-green-600 mt-1">
                {summary.totalGuests > 0 ? `${Math.round((summary.activeGuests / summary.totalGuests) * 100)}% of total` : 'No data'}
              </p>
            </div>
            <div className="p-2 bg-green-500 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Inactive Guests Card */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700 uppercase tracking-wider">Inactive Guests</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{summary.inactiveGuests}</p>
              <p className="text-xs text-red-600 mt-1">
                {summary.totalGuests > 0 ? `${Math.round((summary.inactiveGuests / summary.totalGuests) * 100)}% of total` : 'No data'}
              </p>
            </div>
            <div className="p-2 bg-red-500 rounded-lg">
              <UserX className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Formfill Card */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">Total Formfill</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{summary.totalFormfill}</p>
              <p className="text-xs text-purple-600 mt-1">
                {summary.remarksCount} with remarks
              </p>
            </div>
            <div className="p-2 bg-purple-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-[10px]">
        <h2 className="font-semibold flex items-center gap-1">
          {selectedRows.size > 0 && (
            <span className="ml-2 text-blue-600">
              ({selectedRows.size} selected)
            </span>
          )}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={()=>{setActiveSelectBox(!ActiveSelectBox)}}
            className="inline-flex items-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
            disabled={data.length === 0}
          >
            <SquareMousePointer size={10}/> Select Show
          </button>

          <button
            onClick={()=>{setActiveFilter(!ActiveFilter)}}
            className="inline-flex items-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
            disabled={data.length === 0}
          >
            <Filter size={12} />
            Filter
          </button>

          <button
            onClick={exportAllData}
            className="inline-flex items-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
            disabled={data.length === 0}
          >
            <Download size={12} />
            Export All
          </button>

          {allColumns.length > 0 ? (
            <>
              <button
                className="inline-flex items-center gap-1 border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1 rounded"
                onClick={() => {
                  setCallPop(true)
                }}
              >
                <PlusCircle size={12} />
                Add Guests
              </button>

              {CallPop && (
                <div className="relative inline-block">
                  <div className="absolute right-0 top-[-20px] mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-200 z-50">
                    <ul className="py-2 text-sm text-gray-700">
                      <li
                        className="px-4 py-2 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                        onClick={() => {
                          openAddRowModal();
                          setCallPop(false);
                        }}
                      >
                        Add Row
                      </li>
                      <li className="px-0 py-0">
                        <label
                          htmlFor="excelUpload"
                          className="block px-4 py-2 text-[10px] hover:bg-gray-100 cursor-pointer transition"
                        >
                          Add Multifile
                        </label>
                        <input
                          id="excelUpload"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedRows.size > 0 && (
                <button
                  onClick={exportSelectedRows}
                  className="inline-flex items-center gap-1 border border-purple-600 text-purple-600 hover:bg-purple-50 px-3 py-1 rounded"
                >
                  <Save size={12} />
                  Export Selected ({selectedRows.size})
                </button>
              )}

              {selectedRows.size > 0 && (
                <button
                  onClick={openBulkStatusModal}
                  className="inline-flex items-center gap-1 border border-yellow-600 text-yellow-600 hover:bg-yellow-50 px-3 py-1 rounded"
                >
                  <Users size={12} />
                  Update Status ({selectedRows.size})
                </button>
              )}

              {(selectedRows.size > 0 || selectAll) && (
                <button
                  onClick={openBulkRemoveModal}
                  className="inline-flex items-center gap-1 border border-red-600 text-red-600 hover:bg-red-50 px-3 py-1 rounded"
                >
                  <Trash2 size={12} />
                  Bulk Remove {selectedRows.size > 0 && `(${selectedRows.size})`}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                >
                  Columns <ChevronDown size={12} />
                </button>

                {showColumnSelector && (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg p-2 z-20 w-56 max-h-60 overflow-y-auto text-[10px]">
                    <div className="flex justify-between items-center font-semibold mb-2">
                      <span>Show Columns</span>
                      <button
                        onClick={() => setIsReordering(!isReordering)}
                        className="bg-blue-500 text-white px-2 py-[2px] rounded"
                      >
                        {isReordering ? "Done" : "Reorder"}
                      </button>
                    </div>

                    {isReordering ? (
                      <div className="space-y-1">
                        {visibleColumns.map((column, index) => (
                          <div
                            key={column}
                            draggable
                            onDragStart={(e) => handleColumnDragStart(e, index)}
                            onDragOver={(e) => handleColumnDragOver(e, index)}
                            onDrop={handleColumnDrop}
                            className={`flex items-center gap-1 p-1 border rounded cursor-move ${
                              dragOverItem === index
                                ? "bg-blue-50 border-blue-300"
                                : ""
                            }`}
                          >
                            <GripVertical size={12} className="text-gray-400" />
                            {column}
                          </div>
                        ))}
                        <button
                          onClick={resetColumnOrder}
                          className="w-full mt-1 bg-gray-500 text-white py-[2px] rounded"
                        >
                          Reset Order
                        </button>
                      </div>
                    ) : (
                      allColumns.map((column) => (
                        <label key={column} className="flex items-center gap-1 mb-[2px]">
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(column)}
                            onChange={() => toggleColumnVisibility(column)}
                            disabled={column === "select" || column === serialNumberField}
                          />
                          <span className={column === "select" || column === serialNumberField ? "text-gray-400" : ""}>
                            {column}
                            {(column === "select" || column === serialNumberField) && " (required)"}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {showSubmitButton && (
                <>
                  <button
                    onClick={() => (
                      handleSubmit("append"),
                      setShowSubmitButton(false)
                    )}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Submit (Append)
                  </button>

                  <button
                    onClick={() => (
                      handleSubmit("replace"),
                      setShowSubmitButton(false)
                    )}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Submit (Replace)
                  </button>
                </>
              )}

              <button
                onClick={openSettingsModal}
                className="inline-flex items-center gap-1 bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded"
              >
                <Settings size={12} />
                Settings
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleFileInputClick}
                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                <Upload size={12} />
                Import Excel File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={`relative mb-6 border-2 border-dashed rounded-lg transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-25'
        } ${data.length > 0 ? 'hidden' : 'block'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          {isProcessingFile ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-700 font-medium">Processing your file...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait while we import your data</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center mb-4">
                <FileUp size={48} className={`mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  {isDragOver ? 'Drop your file here' : 'Drag & drop Excel file here'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Upload .xlsx, .xls, or .csv files to import guest data
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleFileInputClick}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Upload size={16} />
                  Browse Files
                </button>
                <span className="text-gray-500 text-sm">or drag and drop</span>
              </div>
              
              <p className="text-gray-400 text-xs mt-4">
                Supported formats: .xlsx, .xls, .csv • Max file size: 10MB
              </p>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Drag and Drop Overlay for Existing Table */}
      {data.length > 0 && isDragOver && (
        <div
          className="fixed inset-0 bg-blue-500 bg-opacity-20 z-40 flex items-center justify-center border-4 border-dashed border-blue-500 rounded-lg m-4"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md">
            <FileUp size={64} className="mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Drop to Import More Data</h3>
            <p className="text-gray-600 mb-4">Add more records to your existing guest list</p>
            <div className="text-sm text-gray-500">
              ⚠️ Note: This will append to existing data
            </div>
          </div>
        </div>
      )}

      {visibleColumns.length > 0 ? (
        <>
          <div 
            className="overflow-x-auto rounded border" 
            style={{ maxHeight: '500px' }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <table className="min-w-full text-left table-auto border-collapse text-[10px]">
              <thead className="bg-gray-100">
                <tr>
                  {ActiveSelectBox && (
                    <th className="px-3 py-1 font-semibold border-b bg-gray-100 sticky top-0 z-10">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="w-3 h-3"
                      />
                    </th>
                  )}
                  
                  {showSerialNumber && (
                    <th
                      className="px-3 py-1 font-semibold border-b bg-gray-100 sticky top-0 z-10"
                    >
                      <div className="flex items-center gap-1">
                        {serialNumberField}
                      </div>
                    </th>
                  )}
                  
                  {visibleColumns
                    .filter(col => col !== "select" && col !== serialNumberField)
                    .map((col) => (
                      <th
                        key={col}
                        className="px-3 py-1 font-semibold border-b bg-gray-100 sticky top-0 z-10 cursor-pointer group relative"
                        onDoubleClick={() =>
                          col !== "formfill" && col !== "remark" && setEditingHeader(col)
                        }
                      >
                        <div className="flex items-center justify-between min-h-[24px]">
                          <div className="flex items-center gap-1 flex-1">
                            {isReordering && (
                              <GripVertical size={12} className="text-gray-400 cursor-move" />
                            )}
                            {editingHeader === col ? (
                              <input
                                type="text"
                                value={col}
                                autoFocus
                                onChange={(e) => handleHeaderChange(col, e.target.value)}
                                onBlur={() => setEditingHeader(null)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && setEditingHeader(null)
                                }
                                className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            ) : (
                              <>
                                <span className="truncate max-w-[120px]">{col}</span>
                                <Edit size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            )}
                          </div>
                          
                          {ActiveFilter && (
                            <button
                              onClick={(e) => openColumnFilter(col, e)}
                              className={`ml-1 p-0.5 rounded transition-colors ${
                                columnFilterPopup.column === col 
                                  ? 'bg-blue-500 text-white' 
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Filter column"
                            >
                              <Filter size={10} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  <th className="px-3 py-1 font-semibold border-b bg-gray-100 sticky top-0 z-10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rIdx) => (
                  <tr key={rIdx} className={`hover:bg-gray-50 ${row.select ? 'bg-blue-50' : ''} text-[10px]`}>
                    {ActiveSelectBox && (
                      <td className="px-3 py-0 border-b">
                        <input
                          type="checkbox"
                          checked={row.select || false}
                          onChange={() => toggleRowSelect(rIdx)}
                          className="w-3 h-3"
                        />
                      </td>
                    )}
                    
                    {showSerialNumber && (
                      <td className="px-3 py-0 border-b text-center font-semibold text-gray-700">
                        {row[serialNumberField]}
                      </td>
                    )}
                    
                    {visibleColumns
                      .filter(col => col !== "select" && col !== serialNumberField)
                      .map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3 py-0 border-b min-w-[120px]"
                          onDoubleClick={() =>
                            col !== "Status" &&
                            col !== "formfill" &&
                            col !== "remark" &&
                            openAddRowModal(rIdx)
                          }
                        >
                          {col === "Status" ? (
                            <select
                              value={row[col] || "Active"}
                              onChange={(e) => {
                                const updatedData = [...data];
                                const actualRowIndex = data.findIndex(item => item === row);
                                updatedData[actualRowIndex][col] = e.target.value;
                                setData(updatedData);
                              }}
                              className="w-full p-1 bg-transparent text-xs h-6"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : col === "formfill" ? (
                            <span className="font-bold text-blue-600 text-xs">
                              {row[col]}
                            </span>
                          ) : col === "remark" ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openRemarkModal(rIdx)}
                                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                                title={row.remark ? `View/Edit Remark: ${row.remark}` : "Add Remark"}
                              >
                                <MessageSquare size={12} />
                                {row.remark && (
                                  <span className="text-[9px] text-gray-600 truncate max-w-[80px]">
                                    {getRemarkPreview(row.remark)}
                                  </span>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="w-full min-h-[20px] flex items-center cursor-text text-[10px] truncate">
                              {row[col] || ""}
                            </div>
                          )}
                        </td>
                      ))}
                    <td className="px-3 py-0 border-b">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openAddRowModal(rIdx)}
                          className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                          title="Edit row"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-xs"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-600">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                {columnFilterPopup.column && ` (filtered by ${columnFilterPopup.column})`}
                {selectedRows.size > 0 && ` | ${selectedRows.size} selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded text-xs disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : data.length === 0 && !isProcessingFile ? null : null}

      {/* Column Filter Popup */}
      {columnFilterPopup.isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeColumnFilter}
          />
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-64"
            style={{
              left: `${columnFilterPopup.position.x}px`,
              top: `${columnFilterPopup.position.y}px`
            }}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h4 className="font-semibold text-gray-800 text-sm">
                Filter: {columnFilterPopup.column}
              </h4>
              <button
                onClick={closeColumnFilter}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-3">
              <div className="relative">
                <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in column..."
                  value={columnFilterPopup.filterText}
                  onChange={(e) => setColumnFilterPopup(prev => ({ 
                    ...prev, 
                    filterText: e.target.value 
                  }))}
                  className="w-full pl-8 pr-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {columnFilterPopup.filterText && (
                  <button
                    onClick={() => setColumnFilterPopup(prev => ({ ...prev, filterText: "" }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-600 mb-2">Sort</h5>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleSort('asc')}
                  className={`flex-1 py-1.5 px-2 rounded text-sm flex items-center justify-center gap-1 ${
                    columnFilterPopup.sortDirection === 'asc'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUpDown size={12} />
                  A → Z
                </button>
                <button
                  onClick={() => toggleSort('desc')}
                  className={`flex-1 py-1.5 px-2 rounded text-sm flex items-center justify-center gap-1 ${
                    columnFilterPopup.sortDirection === 'desc'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUpDown size={12} />
                  Z → A
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Copy size={14} className="text-gray-600" />
                  <span className="text-sm">Show duplicates only</span>
                </div>
                <input
                  type="checkbox"
                  checked={columnFilterPopup.showDuplicates}
                  onChange={(e) => setColumnFilterPopup(prev => ({ 
                    ...prev, 
                    showDuplicates: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>
              {columnFilterPopup.showDuplicates && (
                <div className="mt-1 text-xs text-gray-500 pl-6">
                  {getDuplicateCount()} duplicate groups found
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={clearColumnFilter}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                Clear Filter
              </button>
              <button
                onClick={closeColumnFilter}
                className="flex-1 py-1.5 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                Apply
              </button>
            </div>

            {(columnFilterPopup.sortDirection || columnFilterPopup.filterText || columnFilterPopup.showDuplicates) && (
              <div className="mt-2 text-xs text-gray-500">
                Active: 
                {columnFilterPopup.sortDirection && ` Sorted ${columnFilterPopup.sortDirection === 'asc' ? 'A-Z' : 'Z-A'}`}
                {columnFilterPopup.filterText && ` Search: "${columnFilterPopup.filterText}"`}
                {columnFilterPopup.showDuplicates && ` Duplicates only`}
              </div>
            )}
          </div>
        </>
      )}

      {/* Remark Modal */}
      {remarkModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <MessageSquare size={24} />
              Add/Edit Remark
            </h3>
            
            <textarea
              value={remarkModal.remark}
              onChange={(e) => setRemarkModal(prev => ({ ...prev, remark: e.target.value }))}
              placeholder="Enter your remark here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeRemarkModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRemark}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Remark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {addRowModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 rounded-2xl shadow-2xl border">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-1 text-sm">
              {addRowModal.editingIndex !== null ? "✏️ Edit Row" : "➕ Add New Row"}
            </h3>

            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full table-auto border-collapse text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {visibleColumns
                      .filter(col => col !== "select" && col !== serialNumberField)
                      .map((col, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-2 font-semibold text-gray-700 border-b whitespace-nowrap text-xs"
                        >
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody>
                  <tr className="hover:bg-gray-50">
                    {visibleColumns
                      .filter(col => col !== "select" && col !== serialNumberField)
                      .map((col, idx) => (
                        <td key={idx} className="px-2 py-2 border-b">
                          {col === "Status" ? (
                            <select
                              value={addRowModal.rowData[col] || "Active"}
                              onChange={(e) =>
                                handleAddRowModalChange(col, e.target.value)
                              }
                              className="min-w-[90px] h-6 px-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : col === "formfill" ? (
                            <input
                              type="number"
                              value={addRowModal.rowData[col] || ""}
                              onChange={(e) =>
                                handleAddRowModalChange(col, e.target.value)
                              }
                              className={inputClass}
                            />
                          ) : col === "remark" ? (
                            <textarea
                              value={addRowModal.rowData[col] || ""}
                              onChange={(e) =>
                                handleAddRowModalChange(col, e.target.value)
                              }
                              rows={2}
                              placeholder="Remark"
                              className="min-w-[90px] px-2 py-1 text-xs leading-tight border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={addRowModal.rowData[col] || ""}
                              onChange={(e) =>
                                handleAddRowModalChange(col, e.target.value)
                              }
                              placeholder={`Enter ${col}`}
                              className={inputClass}
                            />
                          )}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
              <button
                onClick={closeAddRowModal}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center gap-1 text-xs"
                disabled={isSaving}
              >
                <X size={12} />
                Cancel
              </button>
              <button
                onClick={saveAddRowModal}
                disabled={isSaving}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-1 text-xs"
              >
                {isSaving ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Save size={12} />
                )}
                {addRowModal.editingIndex !== null ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {bulkStatusModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Update Status for {selectedRows.size} Selected Row(s)
                </h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Status
                </label>
                <select
                  value={bulkStatusModal.newStatus}
                  onChange={(e) => setBulkStatusModal(prev => ({ 
                    ...prev, 
                    newStatus: e.target.value 
                  }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  This will update the status for all {selectedRows.size} selected row(s) only.
                  Other rows will remain unchanged.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeBulkStatusModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStatusUpdate}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Row Modal */}
      {removeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Remove Record
                </h3>
              </div>

              {removeModal.method === "index" && removeModal.rowIndex !== null ? (
                <p className="text-gray-600 mb-4">
                  Are you sure you want to remove this record? This action cannot be undone.
                </p>
              ) : (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identifier Field
                    </label>
                    <select
                      value={removeModal.identifierField}
                      onChange={(e) => setRemoveModal(prev => ({ 
                        ...prev, 
                        identifierField: e.target.value 
                      }))}
                      className="w-full border rounded px-3 py-2"
                    >
                      {visibleColumns
                        .filter(col => col !== "select" && col !== serialNumberField)
                        .map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value to Remove
                    </label>
                    <input
                      type="text"
                      value={removeModal.identifierValue}
                      onChange={(e) => setRemoveModal(prev => ({ 
                        ...prev, 
                        identifierValue: e.target.value 
                      }))}
                      placeholder={`Enter ${removeModal.identifierField}`}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeRemoveModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveRow}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Remove Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Remove Modal */}
      {bulkRemoveModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Bulk Remove Records
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                {bulkRemoveModal.selectedIndices.size === 0
                  ? "Select records to remove by checking the checkboxes in the table."
                  : `Are you sure you want to remove ${bulkRemoveModal.selectedIndices.size} selected record(s)? This action cannot be undone.`
                }
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeBulkRemoveModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={bulkRemoveModal.selectedIndices.size === 0}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    bulkRemoveModal.selectedIndices.size === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  Remove Selected ({bulkRemoveModal.selectedIndices.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">⚙️ Settings</h3>
                  <p className="text-sm text-gray-500">Configure guest list columns and verification</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-700">🧾 Select Items</h4>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {selectedKeys.length} selected
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    {headerOptions.map((header) => (
                      <label
                        key={header.key}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedKeys.includes(header.key)}
                          onChange={() => toggleKeySelection(header.key)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="text-gray-700">{header.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-700">✅ Verify Items</h4>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      {verifyKeys.length} selected
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    {headerOptions.map((header) => (
                      <label
                        key={header.key}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={verifyKeys.includes(header.key)}
                          onChange={() => toggleVerifySelection(header.key)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-400"
                        />
                        <span className="text-gray-700">{header.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <input
                  type="checkbox"
                  checked={duplicateAllowed}
                  onChange={() => setDuplicateAllowed(!duplicateAllowed)}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-400"
                />
                <div>
                  <span className="font-medium text-gray-800">Allow Duplicates</span>
                  <p className="text-xs text-gray-500">Permit duplicate entries in the guest list</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={debugColumns}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <span>🔍</span> Debug Columns
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all font-medium"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  setShowSettingsModal(false);
                  if (selectedKeys.length === 0) {
                    showNotification("error", "Please select at least one field.");
                    return;
                  }
                  const paxColumn = findPaxColumn();
                  if (!paxColumn) {
                    showNotification("error", "Could not find Pax column in data", "Please ensure your data has a column for Pax/Number of Pax Allowed.");
                    return;
                  }
                  const paxMap = {};
                  data.forEach((row) => {
                    const paxValue = row[paxColumn];
                    if (paxValue === undefined || paxValue === null || paxValue === '') return;
                    const selectedData = {};
                    selectedKeys.forEach((key) => {
                      selectedData[key] = row[key] !== undefined ? row[key] : "";
                    });
                    const paxKey = String(paxValue);
                    if (!paxMap[paxKey]) {
                      paxMap[paxKey] = {
                        PaxAllowed: paxValue,
                        countPax: 0,
                        selectField: [],
                      };
                    }
                    paxMap[paxKey].countPax += 1;
                    paxMap[paxKey].selectField.push({
                      ...selectedData,
                      formfill: row.formfill ?? 0,
                      remark: row.remark || "",
                    });
                  });
                  const verifyData = {};
                  verifyKeys.forEach(key => {
                    verifyData[key] = data.map(row => row[key] || '');
                  });
                  const payload = {
                    SelectedField: {
                      selectone: selectedKeys,
                      numberofPax: Object.values(paxMap),
                    },
                    SelectedVerify: verifyKeys,
                    Duplicate: duplicateAllowed,
                  };
                  try {
                    const response = await axios.post(
                      `https://tableware-dweeb-estate.ngrok-free.dev/api/dynamic-values/${leadId}`,
                      payload
                    );
                    showNotification("success", "Settings saved successfully", `${Object.keys(paxMap).length} pax groups processed`);
                  } catch (err) {
                    console.error("❌ Error submitting:", err);
                    showNotification("error", "Failed to save settings", err.response?.data?.message || err.message);
                  }
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow"
              >
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestlist;