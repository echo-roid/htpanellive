import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plane,
  Ticket,
  Trash2,
  Edit3,
  Save,
  Database,
  Users,
  DollarSign,
  CheckSquare,
  X,
  Eye,
  EyeOff,
  History,
  ChevronDown,
  Shield,
  File,
  Download,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  Clock,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Copy,
  ExternalLink,
  List,
  Grid,
  BarChart3,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Building2,
  Tag,
  Star,
  Award,
  Target,
  PieChart,
  ShieldAlert,
  Bell,
  DownloadCloud,
  UploadCloud,
  Layers,
  Briefcase,
  Phone,
  Mail,
  CreditCard,
  Home,
  Navigation,
  Map,
  Compass,
  Anchor,
  Ship,
  Truck,
  Package,
  Box,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Bookmark,
  Flag,
  Hash,
  Percent,
  DollarSign as Dollar,
  Euro,
  Pound,
  Bitcoin,
  CreditCard as Card
} from 'lucide-react';
import { useParams } from 'react-router-dom';

// API Base URL
const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';

// Helper functions
const safeArray = (array) => Array.isArray(array) ? array : [];

const formatDate = (dateString) => {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

const formatTime = (timeString) => {
  if (!timeString) return '--:--';
  return timeString.substring(0, 5);
};

// Helper function to clean field names (removes trailing underscores)
const cleanFieldName = (fieldName) => {
  if (!fieldName) return fieldName;
  // Remove trailing underscores and clean up the name
  return fieldName.replace(/_+$/, '');
};

// Enhanced PNR Assignment Modal Component (Complete)
const PnrAssignmentModal = ({ 
  isOpen, 
  onClose, 
  passenger, 
  onAssignPnr,
  assignedPnrs = []
}) => {
  const [assignmentType, setAssignmentType] = useState('single');
  const [singlePnr, setSinglePnr] = useState('');
  const [multiplePnrs, setMultiplePnrs] = useState(['']);

  const addPnrField = () => {
    setMultiplePnrs([...multiplePnrs, '']);
  };

  const removePnrField = (index) => {
    if (multiplePnrs.length > 1) {
      setMultiplePnrs(multiplePnrs.filter((_, i) => i !== index));
    }
  };

  const updatePnrField = (index, value) => {
    const newPnrs = [...multiplePnrs];
    newPnrs[index] = value;
    setMultiplePnrs(newPnrs);
  };

  const handleSubmit = () => {
    if (assignmentType === 'single') {
      if (!singlePnr.trim()) {
        alert('Please enter a PNR number');
        return;
      }
      onAssignPnr([singlePnr.trim()]);
    } else {
      const validPnrs = multiplePnrs.filter(pnr => pnr.trim() !== '');
      if (validPnrs.length === 0) {
        alert('Please enter at least one PNR number');
        return;
      }
      onAssignPnr(validPnrs);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Assign PNR to Passenger</h3>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Manage passenger PNR assignments</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
            style={{ fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Passenger Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500 rounded-md">
                <User size={12} className="text-white" />
              </div>
              <h4 className="font-semibold text-blue-700" style={{ fontSize: '11px' }}>Passenger Details</h4>
            </div>
            <div style={{ fontSize: '10px' }} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Pax Code:</span>
                <span className="text-blue-600 font-bold">{passenger?.paxCode || passenger?.pax_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Name:</span>
                <span className="text-gray-900">{passenger?.guest_Full_Name || passenger?.form_Full_Name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Assignment Type */}
          <div>
            <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Assignment Type</label>
            <div className="flex gap-3 bg-gray-50 p-2 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="radio"
                  value="single"
                  checked={assignmentType === 'single'}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className={`px-3 py-2 rounded-md transition ${assignmentType === 'single' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}>
                  <span style={{ fontSize: '10px' }} className="font-medium">Single PNR</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="radio"
                  value="multiple"
                  checked={assignmentType === 'multiple'}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className={`px-3 py-2 rounded-md transition ${assignmentType === 'multiple' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}>
                  <span style={{ fontSize: '10px' }} className="font-medium">Multiple PNRs</span>
                </div>
              </label>
            </div>
          </div>

          {/* Single PNR Input */}
          {assignmentType === 'single' && (
            <div>
              <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>PNR Number *</label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={14} />
                <input
                  type="text"
                  placeholder="Enter PNR number"
                  value={singlePnr}
                  onChange={(e) => setSinglePnr(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>
          )}

          {/* Multiple PNRs Input */}
          {assignmentType === 'multiple' && (
            <div>
              <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>PNR Numbers</label>
              <div className="space-y-1.5">
                {multiplePnrs.map((pnr, index) => (
                  <div key={index} className="flex gap-1.5 items-center">
                    <div className="flex-1 relative">
                      <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={14} />
                      <input
                        type="text"
                        placeholder={`PNR ${index + 1}`}
                        value={pnr}
                        onChange={(e) => updatePnrField(index, e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        style={{ fontSize: '10px' }}
                      />
                    </div>
                    {multiplePnrs.length > 1 && (
                      <button
                        onClick={() => removePnrField(index)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        style={{ fontSize: '10px' }}
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPnrField}
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-gray-600 transition flex items-center justify-center gap-1.5 border border-green-200"
                  style={{ fontSize: '10px' }}
                >
                  <Plus size={12} />
                  Add Another PNR
                </button>
              </div>
            </div>
          )}

          {/* Current Assignments */}
          {assignedPnrs.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-amber-500 rounded-md">
                  <Ticket size={12} className="text-white" />
                </div>
                <h4 className="font-semibold text-amber-700" style={{ fontSize: '11px' }}>Current PNR Assignments</h4>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {assignedPnrs.map((pnr, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/50 p-2 rounded border border-amber-100" style={{ fontSize: '9px' }}>
                    <span className="font-mono text-gray-800 font-medium">{pnr}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Assigned
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg transition font-semibold border border-gray-300"
              style={{ fontSize: '10px' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg transition font-semibold shadow-md shadow-blue-500/30 flex items-center justify-center gap-1.5"
              style={{ fontSize: '10px' }}
            >
              <Ticket size={12} />
              Assign PNR(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced PNR Removal Modal Component (Complete)
const PnrRemovalModal = ({ 
  isOpen, 
  onClose, 
  passenger, 
  onRemovePnr,
  assignedPnrs = []
}) => {
  const [selectedPnr, setSelectedPnr] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [extraPrice, setExtraPrice] = useState(0);

  const passengerCode = passenger?.paxCode || passenger?.pax_code;
  const passengerName = passenger?.guest_Full_Name || passenger?.form_Full_Name || 'N/A';

  const handleSubmit = () => {
    if (!selectedPnr) {
      alert('Please select a PNR to remove');
      return;
    }
    
    if (!passengerCode) {
      alert('Passenger code not found');
      return;
    }
    
    // Call onRemovePnr with all the parameters
    onRemovePnr(passenger, selectedPnr, removalReason, extraPrice);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Remove PNR from Passenger</h3>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Remove PNR assignment with details</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
            style={{ fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Passenger Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500 rounded-md">
                <User size={12} className="text-white" />
              </div>
              <h4 className="font-semibold text-blue-700" style={{ fontSize: '11px' }}>Passenger Details</h4>
            </div>
            <div style={{ fontSize: '10px' }} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Pax Code:</span>
                <span className="text-blue-600 font-bold">{passengerCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Name:</span>
                <span className="text-gray-900">{passengerName}</span>
              </div>
            </div>
          </div>

          {/* PNR Selection */}
          <div>
            <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Select PNR to Remove *</label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={14} />
              <select
                value={selectedPnr}
                onChange={(e) => setSelectedPnr(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                style={{ fontSize: '10px' }}
              >
                <option value="">Choose PNR...</option>
                {assignedPnrs.map((pnr, index) => (
                  <option key={index} value={pnr}>
                    {pnr}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Removal Reason */}
          <div>
            <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Removal Reason</label>
            <textarea
              placeholder="Reason for removing this PNR..."
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              rows="2"
              style={{ fontSize: '10px' }}
            />
          </div>

          {/* Extra Price */}
          <div>
            <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Extra Price (if any)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium" style={{ fontSize: '10px' }}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={extraPrice}
                onChange={(e) => setExtraPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                style={{ fontSize: '10px' }}
              />
            </div>
          </div>

          {/* Current PNRs */}
          {assignedPnrs.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-amber-500 rounded-md">
                  <List size={12} className="text-white" />
                </div>
                <h4 className="font-semibold text-amber-700" style={{ fontSize: '11px' }}>Current PNR Assignments</h4>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {assignedPnrs.map((pnr, index) => (
                  <div key={index} className={`flex justify-between items-center bg-white/50 p-2 rounded border ${selectedPnr === pnr ? 'border-red-200 bg-red-50' : 'border-amber-100'}`} style={{ fontSize: '9px' }}>
                    <span className="font-mono text-gray-800 font-medium">{pnr}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${selectedPnr === pnr ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedPnr === pnr ? '⚠️ To be removed' : '✓ Assigned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg transition font-semibold border border-gray-300"
              style={{ fontSize: '10px' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!selectedPnr || !passengerCode}
              className={`flex-1 py-2.5 rounded-lg transition font-semibold shadow-md flex items-center justify-center gap-1.5 ${
                !selectedPnr || !passengerCode
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30'
              }`}
              style={{ fontSize: '10px' }}
            >
              <Trash2 size={12} />
              Remove PNR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Guest Headers Modal
const GuestHeadersModal = ({ 
  isOpen, 
  onClose, 
  guestListHeaders = [], 
  selectedGuestHeaders = [], 
  onHeaderSelection, 
  onApply,
  guestListData = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const filteredHeaders = guestListHeaders.filter(header =>
    header.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      onHeaderSelection('all');
    } else {
      onHeaderSelection('none');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Select Guest Fields to Display</h3>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Choose multiple fields as separate columns</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
            style={{ fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              style={{ fontSize: '10px' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="mb-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={selectAll || (selectedGuestHeaders.length === guestListHeaders.length && guestListHeaders.length > 0)}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900" style={{ fontSize: '11px' }}>Select All Fields</span>
                  <p className="text-gray-500" style={{ fontSize: '9px' }}>Toggle selection for all available fields</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium" style={{ fontSize: '9px' }}>
                  {selectedGuestHeaders.length} selected
                </span>
              </label>
            </div>

            <div className="space-y-2">
              {filteredHeaders.length > 0 ? (
                filteredHeaders.map((header, index) => {
                  const sampleValue = guestListData[0]?.[header];
                  return (
                    <label
                      key={header}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGuestHeaders.includes(header)}
                        onChange={() => onHeaderSelection(header)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate" style={{ fontSize: '10px' }}>{header}</span>
                          <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-white font-medium" style={{ fontSize: '8px' }}>
                            {typeof sampleValue === "string" ? "TEXT" : "VALUE"}
                          </span>
                        </div>
                        <p className="text-gray-500 truncate" style={{ fontSize: '9px' }}>
                          Sample: {sampleValue ? String(sampleValue).substring(0, 50) + (String(sampleValue).length > 50 ? '...' : '') : 'No data'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400" style={{ fontSize: '9px' }}>
                          Index: {index + 1}
                        </span>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500" style={{ fontSize: '10px' }}>
                  <Search size={32} className="mx-auto mb-2 text-gray-300" />
                  No fields match your search
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-gray-700" style={{ fontSize: '10px' }}>
            <span className="font-semibold">{selectedGuestHeaders.length}</span> fields selected
            {searchTerm && (
              <span className="ml-2">
                • <span className="font-semibold">{filteredHeaders.length}</span> matching
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition font-semibold border border-gray-300"
              style={{ fontSize: '10px' }}
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              disabled={selectedGuestHeaders.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold transition ${
                selectedGuestHeaders.length > 0
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400"
              }`}
              style={{ fontSize: '10px' }}
            >
              Apply {selectedGuestHeaders.length} Fields
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Data Modal Component
const FormDataModal = ({ 
  isOpen, 
  onClose, 
  forms = [], 
  selectedForms = [], 
  onFormSelection,
  onSelectAllForms,
  formsLoading,
  onGetApprovedData,
  groups = [],
  selectedGroup = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [targetGroup, setTargetGroup] = useState(selectedGroup || '');

  const filteredForms = forms.filter(form =>
    form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.share_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Select Forms for Passengers</h3>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Choose forms to extract approved submission data</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
            style={{ fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" />
            <div className="flex-1">
              <p className="text-blue-800 font-semibold" style={{ fontSize: '10px' }}>
                Only approved submissions will be displayed
              </p>
              <p className="text-blue-600" style={{ fontSize: '9px' }}>
                Rejected or pending submissions are automatically filtered out
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            {/* Group Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Target Group</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={14} />
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    style={{ fontSize: '10px' }}
                  >
                    <option value="">-- Select Existing Group --</option>
                    {groups.map(group => (
                      <option key={group.group_n} value={group.group_n}>
                        {group.name} ({group.passenger_count} passengers)
                      </option>
                    ))}
                    <option value="new">+ Create New Group</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Search Forms</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    style={{ fontSize: '10px' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={onSelectAllForms}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg transition font-semibold border border-gray-300 whitespace-nowrap"
                style={{ fontSize: '10px' }}
              >
                {selectedForms.length === forms.length && forms.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
              
              <div className="flex items-center gap-2">
                {targetGroup === 'new' && (
                  <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1.5 rounded-lg font-semibold" style={{ fontSize: '9px' }}>
                    New Group: Group {Array.isArray(groups) && groups.length > 0 ? 
                      Math.max(...groups.map(g => parseInt(g.group_n)), 0) + 1 
                      : '1'}
                  </span>
                )}
                {targetGroup && targetGroup !== 'new' && (
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-semibold" style={{ fontSize: '9px' }}>
                    Adding to: Group {targetGroup}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {formsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600" style={{ fontSize: '10px' }}>Loading forms...</p>
              </div>
            ) : (
              <>
                {filteredForms.length > 0 ? (
                  <div className="space-y-2">
                    {filteredForms.map(form => (
                      <label
                        key={form.id}
                        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedForms.includes(form.id)}
                          onChange={() => onFormSelection(form.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 truncate" style={{ fontSize: '11px' }}>{form.name}</h4>
                              <p className="text-gray-500" style={{ fontSize: '9px' }}>ID: {form.share_id}</p>
                            </div>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold" style={{ fontSize: '9px' }}>
                              Approved Only
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2" style={{ fontSize: '9px' }}>
                            <div className="flex items-center gap-1">
                              <Calendar size={10} className="text-gray-400" />
                              <span className="text-gray-600">Created: {formatDate(form.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RefreshCw size={10} className="text-gray-400" />
                              <span className="text-gray-600">Updated: {formatDate(form.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-12 text-gray-500" style={{ fontSize: '10px' }}>
                    <File size={32} className="mx-auto mb-2 text-gray-300" />
                    No forms found for this lead
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500" style={{ fontSize: '10px' }}>
                    <Search size={32} className="mx-auto mb-2 text-gray-300" />
                    No forms match your search
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-gray-700" style={{ fontSize: '10px' }}>
            <span className="font-semibold">{selectedForms.length}</span> forms selected
            {searchTerm && (
              <span className="ml-2">
                • <span className="font-semibold">{filteredForms.length}</span> matching
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition font-semibold border border-gray-300"
              style={{ fontSize: '10px' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onGetApprovedData(targetGroup)}
              disabled={selectedForms.length === 0 || formsLoading || !targetGroup}
              className={`px-4 py-2.5 rounded-lg font-semibold transition ${
                selectedForms.length > 0 && !formsLoading && targetGroup
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400"
              }`}
              style={{ fontSize: '10px' }}
            >
              {targetGroup === 'new' ? 'Create New Group' : 'Add to Group'} ({selectedForms.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Field Selection Modal Component
const FieldSelectionModal = ({
  isOpen,
  onClose,
  availableColumns = [],
  selectedFields = [],
  onFieldSelection,
  onSelectAllFields,
  allSubmissions = [],
  onApplyFields,
  loadingSubmissions,
  targetGroup,
  groups = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);

  const filteredColumns = availableColumns.filter(column => {
    const matchesSearch = column.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         column.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(column.type);
    return matchesSearch && matchesType;
  });

  const uniqueTypes = [...new Set(availableColumns.map(col => col.type))];

  const handleSelectAll = (checked) => {
    onSelectAllFields(checked ? 'all' : 'none');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Select Fields to Display</h3>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>
              Choose fields from {allSubmissions.length} approved submissions
              {targetGroup && (
                <span className="ml-2 text-blue-600 font-semibold">
                  • Target: Group {targetGroup === 'new' ? Math.max(...groups.map(g => parseInt(g.group_n)), 0) + 1 : targetGroup}
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
            style={{ fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-semibold" style={{ fontSize: '11px' }}>
                  Showing {allSubmissions.length} approved submissions
                </p>
                <p className="text-green-600" style={{ fontSize: '9px' }}>
                  All data is quality-checked and approved
                </p>
              </div>
            </div>
            <div className="bg-white border border-green-200 rounded-lg px-3 py-1.5">
              <span className="text-green-700 font-bold" style={{ fontSize: '11px' }}>
                {selectedFields.length} selected
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {uniqueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTypes(prev =>
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                    selectedTypes.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  style={{ fontSize: '10px' }}
                >
                  {type}
                </button>
              ))}
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium"
                  style={{ fontSize: '10px' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {loadingSubmissions ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600" style={{ fontSize: '10px' }}>Loading submission data...</p>
              </div>
            ) : (
              <>
                {availableColumns.length > 0 && (
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={selectedFields.length === availableColumns.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-gray-900" style={{ fontSize: '11px' }}>Select All Fields</span>
                        <p className="text-gray-500" style={{ fontSize: '9px' }}>Toggle selection for all available fields</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium" style={{ fontSize: '9px' }}>
                        {availableColumns.length} total
                      </span>
                    </label>
                  </div>
                )}

                {filteredColumns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredColumns.map(column => {
                      const typeColors = {
                        'aadhar': 'bg-purple-100 text-purple-800',
                        'passport': 'bg-blue-100 text-blue-800',
                        'address': 'bg-green-100 text-green-800',
                        'nearest-airport': 'bg-amber-100 text-amber-800',
                        'file-upload': 'bg-red-100 text-red-800',
                        'international-hub': 'bg-indigo-100 text-indigo-800',
                        'default': 'bg-gray-100 text-gray-800'
                      };
                      
                      const colorClass = typeColors[column.type] || typeColors.default;

                      return (
                        <label
                          key={column.id}
                          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(column.id)}
                            onChange={() => onFieldSelection(column.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900 truncate" style={{ fontSize: '11px' }}>{column.label}</h4>
                              <span className={`px-2 py-0.5 rounded-full font-medium ${colorClass}`} style={{ fontSize: '8px' }}>
                                {column.type?.toUpperCase()}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-gray-500 truncate" style={{ fontSize: '9px' }}>
                                Field ID: {column.field_id}
                              </p>
                              {column.subfield && (
                                <p className="text-gray-500 truncate" style={{ fontSize: '9px' }}>
                                  Subfield: {column.subfield}
                                </p>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500" style={{ fontSize: '10px' }}>
                    <Search size={32} className="mx-auto mb-2 text-gray-300" />
                    No fields match your search criteria
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-gray-700" style={{ fontSize: '10px' }}>
            <span className="font-semibold">{selectedFields.length}</span> fields selected
            {searchTerm && (
              <span className="ml-2">
                • <span className="font-semibold">{filteredColumns.length}</span> matching
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition font-semibold border border-gray-300"
              style={{ fontSize: '10px' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onApplyFields(targetGroup)}
              disabled={selectedFields.length === 0 || loadingSubmissions}
              className={`px-4 py-2.5 rounded-lg font-semibold transition ${
                selectedFields.length > 0 && !loadingSubmissions
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400"
              }`}
              style={{ fontSize: '10px' }}
            >
              {targetGroup === 'new' ? 'Create New Group' : 'Apply to Group'} ({selectedFields.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Tabs Component
const GroupTabs = ({ 
  groups, 
  activeGroup, 
  onGroupChange, 
  groupStatistics = [],
  onImportData,
  onRefresh 
}) => {
  if (groups.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900" style={{ fontSize: '12px' }}>Passenger Groups</h3>
              <p className="text-gray-600" style={{ fontSize: '10px' }}>Switch between different passenger groups</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2"
              style={{ fontSize: '10px' }}
            >
              <RefreshCw size={12} />
              Refresh
            </button>
            <button
              onClick={() => {
                const newGroupNumber = Math.max(...groups.map(g => parseInt(g.group_n)), 0) + 1;
                onGroupChange(newGroupNumber.toString());
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 shadow-md shadow-green-500/30"
              style={{ fontSize: '10px' }}
            >
              <Plus size={12} />
              New Group
            </button>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => {
            const isActive = activeGroup === group.group_n;
            const groupStats = groupStatistics.find(g => g.group_n === group.group_n);
            
            return (
              <button
                key={group.group_n}
                onClick={() => onGroupChange(group.group_n)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/30'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                style={{ fontSize: '10px' }}
              >
                <div className={`flex items-center gap-2`}>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-blue-50'}`}>
                    <Users size={12} className={isActive ? 'text-white' : 'text-blue-600'} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{group.name || `Group ${group.group_n}`}</div>
                    <div className={`${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {groupStats?.passenger_count || group.passenger_count || 0} passengers
                    </div>
                  </div>
                </div>
                
                {/* Group Stats Badges */}
                <div className="flex gap-1">
                  {groupStats?.with_journey > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-white font-medium ${
                      isActive ? 'bg-white/30' : 'bg-green-100 text-green-700'
                    }`} style={{ fontSize: '8px' }}>
                      {groupStats.with_journey} flights
                    </span>
                  )}
                  {groupStats?.with_pnr > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-white font-medium ${
                      isActive ? 'bg-white/30' : 'bg-orange-100 text-orange-700'
                    }`} style={{ fontSize: '8px' }}>
                      {groupStats.with_pnr} PNRs
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          
          {/* Import Data Tab */}
          <button
            onClick={onImportData}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-dashed border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-400"
            style={{ fontSize: '10px' }}
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <UploadCloud size={12} className="text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Import New Data</div>
              <div className="text-purple-600">Add passengers to new group</div>
            </div>
          </button>
        </div>

        {/* Active Group Summary */}
        {activeGroup && groupStatistics.find(g => g.group_n === activeGroup) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Passengers', value: groupStatistics.find(g => g.group_n === activeGroup)?.passenger_count, color: 'text-blue-700' },
                { label: 'With Journeys', value: groupStatistics.find(g => g.group_n === activeGroup)?.with_journey, color: 'text-green-700' },
                { label: 'With PNRs', value: groupStatistics.find(g => g.group_n === activeGroup)?.with_pnr, color: 'text-orange-700' },
                { label: 'Pending', value: groupStatistics.find(g => g.group_n === activeGroup)?.pending, color: 'text-yellow-700' },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-gray-600 font-medium capitalize" style={{ fontSize: '9px' }}>
                    {stat.label}
                  </span>
                  <span className={`font-bold ${stat.color}`} style={{ fontSize: '11px' }}>
                    {stat.value || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Passenger Edit Modal Component
const PassengerEditModal = ({ 
  isOpen, 
  onClose, 
  passenger, 
  passengerData,
  onSave 
}) => {
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    if (passengerData) {
      setLocalData(passengerData);
    }
  }, [passengerData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Edit Passenger Details</h3>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Passenger Code: {passenger?.paxCode}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
            style={{ fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-700 font-bold mb-3" style={{ fontSize: '12px' }}>Basic Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Passenger Code</label>
                  <input
                    type="text"
                    value={localData.paxCode || ''}
                    onChange={(e) => setLocalData({...localData, paxCode: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    style={{ fontSize: '10px' }}
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>Status</label>
                  <select
                    value={localData.paxStatus || 'Pending'}
                    onChange={(e) => setLocalData({...localData, paxStatus: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    style={{ fontSize: '10px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Boarded">Boarded</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guest Data Fields */}
            {Object.keys(localData.guestFields || {}).length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <h4 className="text-green-700 font-bold mb-3" style={{ fontSize: '12px' }}>Guest Data</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(localData.guestFields || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-gray-700 mb-1 block font-medium capitalize" style={{ fontSize: '10px' }}>
                        {key.replace('guest_', '').replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => setLocalData({
                          ...localData,
                          guestFields: {
                            ...localData.guestFields,
                            [key]: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        style={{ fontSize: '10px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Data Fields */}
            {Object.keys(localData.formFields || {}).length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <h4 className="text-purple-700 font-bold mb-3" style={{ fontSize: '12px' }}>Form Data</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(localData.formFields || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-gray-700 mb-1 block font-medium capitalize" style={{ fontSize: '10px' }}>
                        {key.replace('form_', '').replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => setLocalData({
                          ...localData,
                          formFields: {
                            ...localData.formFields,
                            [key]: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        style={{ fontSize: '10px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg transition font-semibold border border-gray-300"
            style={{ fontSize: '10px' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(passenger, localData);
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg transition font-semibold shadow-md shadow-blue-500/30"
            style={{ fontSize: '10px' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Main PassengerLists Component
const PassengerLists = ({setSelectedFormId}) => {
  // State for data
  const { id: leadId } = useParams();
  
  // Group States
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState('1');
  const [groupStatistics, setGroupStatistics] = useState([]);
  
  // Modal States
  const [isGuestHeadersModalOpen, setIsGuestHeadersModalOpen] = useState(false);
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [isPnrAssignmentModalOpen, setIsPnrAssignmentModalOpen] = useState(false);
  const [isPnrRemovalModalOpen, setIsPnrRemovalModalOpen] = useState(false);
  const [editPassengerModalOpen, setEditPassengerModalOpen] = useState(false);
  
  // Data States
  const [guestListHeaders, setGuestListHeaders] = useState([]);
  const [selectedGuestHeaders, setSelectedGuestHeaders] = useState([]);
  const [guestListData, setGuestListData] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [paxListData, setPaxListData] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [pnrList, setPnrList] = useState([]);
  const [internationalHubs, setInternationalHubs] = useState([]);
  const [loadingInternationalHubs, setLoadingInternationalHubs] = useState(false);
  
  // Selection States
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [assignedPnrs, setAssignedPnrs] = useState({});
  const [passengerJourneys, setPassengerJourneys] = useState({});
  const [selectedGuestHeadersList, setSelectedGuestHeadersList] = useState([]);
  const [selectedFormFieldsList, setSelectedFormFieldsList] = useState([]);
  
  // Edit States
  const [intHubEditId, setIntHubEditId] = useState(null);
  const [intHubValue, setIntHubValue] = useState('');
  const [passengerToEdit, setPassengerToEdit] = useState(null);
  const [editedPassengerData, setEditedPassengerData] = useState({});
  
  // Loading States
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [loadingPnr, setLoadingPnr] = useState(false);
  const [passengerError, setPassengerError] = useState(null);
  const [journeyError, setJourneyError] = useState(null);
  const [pnrError, setPnrError] = useState(null);
  
  // Operation States
  const [isAssigningJourney, setIsAssigningJourney] = useState(false);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);
  const [savingSelectedPassengers, setSavingSelectedPassengers] = useState(false);
  const [processingSelected, setProcessingSelected] = useState(false);
  const [showSelectedPanel, setShowSelectedPanel] = useState(false);
  
  // Modal Selection States
  const [selectedPassengerForPnr, setSelectedPassengerForPnr] = useState(null);
  const [selectedPassengerForPnrRemoval, setSelectedPassengerForPnrRemoval] = useState(null);
  const [targetGroupForImport, setTargetGroupForImport] = useState('');
  
  // Pagination and Filter States
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'pax_code',
    sortOrder: 'ASC',
    group_n: '1'
  });

  const [bulkPnrAssignmentData, setBulkPnrAssignmentData] = useState({
    pnrNumber: '',
    passengerCodes: []
  });

  const [stats, setStats] = useState({
    totalPassengers: 0,
    withJourneys: 0,
    withPnrs: 0,
    pending: 0,
    boarded: 0,
    cancelled: 0,
    confirmed: 0
  });

  // Helper function to check if passenger is selected
  const isPassengerSelected = (passenger) => {
    return selectedPassengers.some(p => {
      if (p.id && passenger.id && p.id === passenger.id) return true;
      if (p.paxCode && passenger.paxCode && p.paxCode === passenger.paxCode) return true;
      if (p.pax_code && passenger.pax_code && p.pax_code === passenger.pax_code) return true;
      if (p.paxCode && passenger.pax_code && p.paxCode === passenger.pax_code) return true;
      if (p.pax_code && passenger.paxCode && p.pax_code === passenger.paxCode) return true;
      return p === passenger;
    });
  };

  // Fixed handlePassengerSelectionChange function
  const handlePassengerSelectionChange = (passenger, selectAll = false) => {
    if (selectAll) {
      if (paxListData.length > 0 && selectedPassengers.length === paxListData.length) {
        setSelectedPassengers([]);
      } else {
        setSelectedPassengers([...paxListData]);
      }
      return;
    }

    if (!passenger) return;

    const isSelected = isPassengerSelected(passenger);

    if (isSelected) {
      const newSelection = selectedPassengers.filter(p => {
        if (p.id && passenger.id && p.id === passenger.id) return false;
        if (p.paxCode && passenger.paxCode && p.paxCode === passenger.paxCode) return false;
        if (p.pax_code && passenger.pax_code && p.pax_code === passenger.pax_code) return false;
        if (p.paxCode && passenger.pax_code && p.paxCode === passenger.pax_code) return false;
        if (p.pax_code && passenger.paxCode && p.pax_code === passenger.paxCode) return false;
        return true;
      });
      setSelectedPassengers(newSelection);
      setShowSelectedPanel(newSelection.length > 0);
    } else {
      setSelectedPassengers(prev => [...prev, passenger]);
      setShowSelectedPanel(true);
    }
  };

  const getPassengerDisplayValue = (passenger, fieldKey) => {
    try {
      if (passenger[fieldKey] !== undefined && passenger[fieldKey] !== null && passenger[fieldKey] !== 'N/A') {
        return passenger[fieldKey];
      }
      
      if (fieldKey.startsWith('guest_')) {
        const guestField = fieldKey.replace('guest_', '');
        const guestData = typeof passenger.guest_data === 'string' 
          ? JSON.parse(passenger.guest_data || '{}')
          : passenger.guest_data || {};
        const value = guestData[guestField];
        if (value !== undefined && value !== null && value !== 'N/A') {
          return value;
        }
      }
      
      if (fieldKey.startsWith('form_')) {
        const formField = fieldKey.replace('form_', '');
        const formData = typeof passenger.form_data === 'string'
          ? JSON.parse(passenger.form_data || '{}')
          : passenger.form_data || {};
        const value = formData[formField];
        if (value !== undefined && value !== null && value !== 'N/A') {
          return value;
        }
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error getting display value:', error);
      return 'Error';
    }
  };

  const renderTableCell = (value) => {
    if (value === undefined || value === null || value === 'N/A') {
      return <span className="text-gray-400" style={{ fontSize: '10px' }}>N/A</span>;
    }
    
    if (typeof value === 'object' && value !== null) {
      try {
        const stringValue = JSON.stringify(value);
        return (
          <span className="text-gray-700 truncate" title={stringValue} style={{ fontSize: '10px' }}>
            {stringValue.length > 30 ? stringValue.substring(0, 30) + '...' : stringValue}
          </span>
        );
      } catch (error) {
        return <span className="text-red-500" style={{ fontSize: '10px' }}>Invalid data</span>;
      }
    }
    
    if (Array.isArray(value)) {
      const stringValue = value.join(', ');
      return (
        <span className="text-gray-700 truncate" title={stringValue} style={{ fontSize: '10px' }}>
          {stringValue.length > 30 ? stringValue.substring(0, 30) + '...' : stringValue}
        </span>
      );
    }
    
    const stringValue = String(value);
    return (
      <span className="text-gray-700 truncate" title={stringValue} style={{ fontSize: '10px' }}>
        {stringValue.length > 30 ? stringValue.substring(0, 30) + '...' : stringValue}
      </span>
    );
  };

  const getJourneyDisplayName = (journey) => {
    if (!journey || !journey.connections?.length) return 'Unknown Journey';
    
    const connections = journey.connections;
    const firstLeg = connections[0];
    const lastLeg = connections[connections.length - 1];
    
    return `${firstLeg.from_airport} → ${lastLeg.to_airport} (${connections.length} leg${connections.length > 1 ? 's' : ''})`;
  };

  const getCompactJourneyDisplay = (journey) => {
    if (!journey || !journey.connections?.length) return 'No Journey';
    
    const connections = journey.connections;
    const firstLeg = connections[0];
    const lastLeg = connections[connections.length - 1];
    
    if (connections.length === 1) {
      return `${firstLeg.from_airport}→${lastLeg.to_airport}`;
    } else {
      return `${firstLeg.from_airport}→...→${lastLeg.to_airport} (${connections.length})`;
    }
  };

  const getAllSelectedGuestHeaders = () => {
    if (paxListData.length === 0) return [];
    
    const allGuestKeys = new Set();
    const excludedFields = [
      'guest_data',
      'guest_id',
      'guest_created_at',
      'guest_updated_at'
    ];
    
    paxListData.forEach(passenger => {
      Object.keys(passenger).forEach(key => {
        if (key.startsWith('guest_')) {
          if (excludedFields.includes(key)) return;
          
          const value = passenger[key];
          if (value && value !== 'N/A' && value !== '' && value !== null && value !== undefined) {
            allGuestKeys.add(key);
          }
        }
      });
    });
    
    return Array.from(allGuestKeys).map(key => ({
      id: key,
      label: key.replace('guest_', '').replace(/_/g, ' '),
      originalKey: key
    }));
  };

  const getAllSelectedFields = () => {
    if (paxListData.length === 0) return [];
    
    const allFormKeys = new Set();
    const excludedFields = [
      'form_data',
      'form_guest_data',
      'form_id',
      'form_created_at',
      'form_updated_at'
    ];
    
    paxListData.forEach(passenger => {
      Object.keys(passenger).forEach(key => {
        if (key.startsWith('form_') || key === 'int_hub') {
          if (excludedFields.includes(key)) return;
          
          const value = passenger[key];
          if (value && value !== 'N/A' && value !== '' && value !== null && value !== undefined) {
            allFormKeys.add(key);
          }
        }
      });
    });
    
    return Array.from(allFormKeys).map(key => ({
      id: key,
      label: key === 'int_hub' ? 'International Hub' : key.replace('form_', '').replace(/_/g, ' '),
      originalKey: key
    }));
  };

  // Function to remove a passenger from selection
  const removePassengerFromSelection = (passengerToRemove) => {
    setSelectedPassengers(prev => 
      prev.filter(p => {
        if (p.id && passengerToRemove.id && p.id === passengerToRemove.id) return false;
        if (p.paxCode && passengerToRemove.paxCode && p.paxCode === passengerToRemove.paxCode) return false;
        if (p.pax_code && passengerToRemove.pax_code && p.pax_code === passengerToRemove.pax_code) return false;
        return true;
      })
    );
  };

  // Function to fetch international hubs data
  const fetchInternationalHubs = async () => {
    try {
      setLoadingInternationalHubs(true);
      console.log('🌐 Fetching international hubs for lead:', leadId);
      
      const response = await axios.get(
        `${API_BASE_URL}/international-hubs/leads/${leadId}/international-hubs`
      );
      
      console.log('📡 International hubs API response:', response.data);
      
      if (response.data.success) {
        setInternationalHubs(response.data.data || []);
        // console.log('✅ International hubs fetched:', response.data.data?.length || 0, 'hubs');
        return response.data.data;
      } else {
        console.warn('⚠️ Failed to fetch international hubs:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching international hubs:', error);
      return [];
    } finally {
      setLoadingInternationalHubs(false);
    }
  };

  // Function to apply international hubs to passengers
  const applyInternationalHubsToPassengers = () => {
    if (internationalHubs.length === 0) {
      alert('No international hubs data available. Please fetch hubs first.');
      return;
    }

    const updatedPaxListData = paxListData.map(passenger => {
      const updatedPassenger = { ...passenger };
      
      const matchingHub = internationalHubs.find(hub => {
        if (hub.submissionIds && passenger.id) {
          const submissionIds = Array.isArray(hub.submissionIds) ? hub.submissionIds : [hub.submissionIds];
          return submissionIds.some(id => 
            passenger.form_data && 
            (passenger.form_data.submission_id === id || 
             passenger.form_data.id === id)
          );
        }
        return false;
      });

      if (matchingHub && matchingHub.intHub) {
        updatedPassenger.int_hub = matchingHub.intHub;
        updatedPassenger.form_int_hub = matchingHub.intHub;
      }

      return updatedPassenger;
    });

    setPaxListData(updatedPaxListData);
    
    const matchedCount = updatedPaxListData.filter(p => p.int_hub).length;
    alert(`Applied international hubs to ${matchedCount} out of ${updatedPaxListData.length} passengers`);
  };

  // Function to handle INT HUB save with API
  const handleIntHubSave = async (passengerId, paxCode) => {
    try {
      const apiUrl = `${API_BASE_URL}/international-hubs/update-value`;
      const requestData = {
        lead_id: parseInt(leadId),
        previous_int_hub: '',
        updated_int_hub: intHubValue,
        pax_code: paxCode
      };
      
      const response = await axios.post(apiUrl, requestData);
      alert('INT HUB updated successfully!');
      setIntHubEditId(null);
      
      setPaxListData(prev =>
        prev.map(p =>
          p.id === passengerId
            ? { ...p, int_hub: intHubValue, form_int_hub: intHubValue }
            : p
        )
      );
    } catch (error) {
      console.error('Error updating INT HUB:', error);
      alert('Failed to update INT HUB. Please try again.');
    }
  };

  // Function to handle passenger edit
  const handleEditPassenger = (passenger) => {
    setPassengerToEdit(passenger);
    setEditedPassengerData({
      paxCode: passenger.paxCode,
      paxStatus: passenger.paxStatus || 'Pending',
      guestFields: selectedGuestHeadersList.reduce((acc, header) => {
        acc[header.originalKey] = getPassengerDisplayValue(passenger, header.originalKey);
        return acc;
      }, {}),
      formFields: selectedFormFieldsList.reduce((acc, field) => {
        acc[field.originalKey] = getPassengerDisplayValue(passenger, field.originalKey);
        return acc;
      }, {})
    });
    setEditPassengerModalOpen(true);
  };

  // API Functions
  const fetchPassengersData = async (page = 1, filters = {}, groupFilter = activeGroup) => {
    if (!leadId) return;

    try {
      setLoadingPassengers(true);
      setPassengerError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        group_n: groupFilter || 'all',
        ...filters
      });

      console.log('📊 Fetching passengers data:', {
        leadId,
        page,
        params: Object.fromEntries(params)
      });

      const response = await axios.get(`${API_BASE_URL}/paxlist/lead/${leadId}?${params}`);
      
      console.log('📡 Passengers API response:', {
        success: response.data.success,
        passengersCount: response.data.passengers?.length || 0,
        total: response.data.total || 0
      });
      
      if (response.data.success) {
        const passengersData = response.data.passengers || [];
        setPassengers(passengersData);
        
        // Store group statistics
        if (response.data.group_statistics) {
          setGroupStatistics(response.data.group_statistics);
          
          // Extract unique groups
          const uniqueGroups = response.data.group_statistics.map(stat => ({
            group_n: stat.group_n,
            name: stat.name || `Group ${stat.group_n}`,
            passenger_count: stat.passenger_count
          }));
          setGroups(uniqueGroups);
        }
        
        setPagination({
          page: response.data.page || page,
          limit: response.data.limit || pagination.limit,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          hasNext: response.data.hasNext || false,
          hasPrev: response.data.hasPrev || false
        });

        // Calculate stats
        const withJourneys = passengersData.filter(p => p.journey_id).length;
        const withPnrs = passengersData.filter(p => (p.attached_pnr?.length || 0) > 0).length;
        const pending = passengersData.filter(p => p.pax_status === 'Pending').length;
        const boarded = passengersData.filter(p => p.pax_status === 'Boarded').length;
        const cancelled = passengersData.filter(p => p.pax_status === 'Cancelled').length;
        const confirmed = passengersData.filter(p => p.pax_status === 'Confirmed').length;
        
        setStats({
          totalPassengers: passengersData.length,
          withJourneys,
          withPnrs,
          pending,
          boarded,
          cancelled,
          confirmed
        });

        if (passengersData.length > 0) {
          const transformedPassengers = passengersData.map(passenger => {
            try {
              const guestData = typeof passenger.guest_data === 'string' 
                ? JSON.parse(passenger.guest_data || '{}')
                : passenger.guest_data || {};
              
              const formData = typeof passenger.form_data === 'string'
                ? JSON.parse(passenger.form_data || '{}')
                : passenger.form_data || {};

              const transformedPassenger = {
                id: passenger.id,
                group_n: passenger.group_n || '1',
                paxCode: passenger.pax_code,
                paxStatus: passenger.pax_status,
                journey_id: passenger.journey_id,
                pnr_number: passenger.pnr_number,
                assigned_pnrs: passenger.attached_pnr || passenger.assigned_pnrs || [],
                createdAt: passenger.created_at,
                updatedAt: passenger.updated_at,
                guest_data: guestData,
                form_data: formData
              };

              Object.keys(guestData).forEach(key => {
                const value = guestData[key];
                if (value !== undefined && value !== null && value !== 'N/A') {
                  if (typeof value !== 'object' || value === null) {
                    transformedPassenger[`guest_${key}`] = value;
                  }
                }
              });

              Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== undefined && value !== null && value !== 'N/A') {
                  if (typeof value !== 'object' || value === null) {
                    transformedPassenger[`form_${key}`] = value;
                  }
                }
              });

              return transformedPassenger;
            } catch (error) {
              console.error('Error transforming passenger:', error, passenger);
              return {
                id: passenger.id,
                group_n: passenger.group_n || '1',
                paxCode: passenger.pax_code,
                paxStatus: passenger.pax_status,
                journey_id: passenger.journey_id,
                pnr_number: passenger.pnr_number,
                assigned_pnrs: passenger.assigned_pnrs || [],
                createdAt: passenger.created_at,
                updatedAt: passenger.updated_at,
                guest_data: {},
                form_data: {}
              };
            }
          });
          
          setPaxListData(transformedPassengers);
          
          const initialJourneys = {};
          const initialAssignedPnrs = {};
          transformedPassengers.forEach(passenger => {
            if (passenger.journey_id) {
              initialJourneys[passenger.id] = passenger.journey_id;
            }
            if ((passenger.assigned_pnrs && passenger.assigned_pnrs.length > 0) || 
                (passenger.attached_pnr && passenger.attached_pnr.length > 0)) {
              initialAssignedPnrs[passenger.paxCode] = passenger.assigned_pnrs || passenger.attached_pnr;
            }
          });
          setPassengerJourneys(initialJourneys);
          setAssignedPnrs(initialAssignedPnrs);
        } else {
          setPaxListData([]);
          setPassengerJourneys({});
          setAssignedPnrs({});
        }
      } else {
        setPassengers([]);
        setPaxListData([]);
        setPassengerJourneys({});
        setAssignedPnrs({});
        setPassengerError(response.data.message || 'Failed to fetch passengers');
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
      setPassengers([]);
      setPaxListData([]);
      setPassengerJourneys({});
      setAssignedPnrs({});
      setPassengerError('Failed to load passengers. Please try again.');
    } finally {
      setLoadingPassengers(false);
    }
  };

  const fetchJourneys = async () => {
    try {
      setLoadingJourneys(true);
      setJourneyError(null);
      
      const response = await axios.get(`${API_BASE_URL}/flight-connections/journeys/lead/${leadId}`);
      
      if (response.data?.success) {
        const journeysData = safeArray(response.data.journeys);
        
        const transformedJourneys = journeysData.map((journeyArray, index) => {
          const sortedConnections = safeArray(journeyArray).sort((a, b) => 
            (a.leg_order || 0) - (b.leg_order || 0)
          );
          
          return {
            journey_id: sortedConnections[0]?.journey_id || `journey-${index}`,
            connections: sortedConnections
          };
        });
        
        setJourneys(transformedJourneys);
      } else {
        setJourneys([]);
        setJourneyError('Failed to fetch journeys');
      }
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneys([]);
      setJourneyError('Failed to load journeys. Please try again.');
    } finally {
      setLoadingJourneys(false);
    }
  };

  const fetchPnrList = async () => {
    try {
      setLoadingPnr(true);
      setPnrError(null);
      
      const response = await axios.get(`${API_BASE_URL}/pnrs/lead/${leadId}`);
      
      if (response.data?.success) {
        setPnrList(response.data.data || []);
      } else {
        setPnrList([]);
        setPnrError('Failed to fetch PNR data');
      }
    } catch (error) {
      console.error('Error fetching PNR list:', error);
      setPnrList([]);
      setPnrError('Failed to load PNR data. Please try again.');
    } finally {
      setLoadingPnr(false);
    }
  };

  const fetchGuestListData = async () => {
    try {
      const { data: res } = await axios.get(
        `${API_BASE_URL}/guestlist/leads/${leadId}/guestlist`
      );

      if (res?.guestData && Array.isArray(res.guestData)) {
        setGuestListData(res.guestData);
        
        if (res.guestData.length > 0) {
          const headers = Object.keys(res.guestData[0]);
          setGuestListHeaders(headers);
        } else {
          setGuestListHeaders([]);
        }
      } else {
        setGuestListData([]);
        setGuestListHeaders([]);
      }
    } catch (err) {
      console.error("Error fetching guest list:", err);
      setGuestListData([]);
      setGuestListHeaders([]);
    }
  };

  const handleGuestHeaderSelection = (header) => {
    if (header === 'all') {
      setSelectedGuestHeaders([...guestListHeaders]);
    } else if (header === 'none') {
      setSelectedGuestHeaders([]);
    } else {
      setSelectedGuestHeaders(prev => {
        if (prev.includes(header)) {
          return prev.filter(h => h !== header);
        } else {
          return [...prev, header];
        }
      });
    }
  };

  const applyGuestHeadersToPaxList = () => {
    if (!Array.isArray(selectedGuestHeaders) || selectedGuestHeaders.length === 0) {
      alert("Please select at least one header");
      return;
    }

    let fcCodeFieldName = null;
    
    const possibleFcCodeFields = [
      '[fc code]', 'fc code', 'fc_code', 'fc',`Fc Code`,`fc_code_`, 
      'FC Code', 'FC_CODE', 'FcCode', 'Fc_Code',
      'employee code', 'emp_code', 'emp code', 'Employee Code'
    ];

  
    for (const field of possibleFcCodeFields) {
      if (guestListHeaders.includes(field)) {
        fcCodeFieldName = field;
        break;
      }
    }
    
    if (!fcCodeFieldName) {
      for (const header of guestListHeaders) {
        if (header.toLowerCase().includes('fc') || header.toLowerCase().includes('code')) {
          fcCodeFieldName = header;
          break;
        }
      }
    }

    if (!fcCodeFieldName) {
      let headerList = guestListHeaders.slice(0, 10).join(', ');
      if (guestListHeaders.length > 10) {
        headerList += `, ... (${guestListHeaders.length - 10} more)`;
      }
      
      alert(
        `Cannot find [fc code] field in guest list.\n\n` +
        `Available headers (first 10):\n${headerList}\n\n` +
        `Please check if your guest list has a field named:\n` +
        `• [fc code]\n• fc code\n• fc_code\n• FC Code\n\n` +
        `Or any field containing "fc" or "code"`
      );
      return;
    }

    const updatedPaxListData = paxListData.map((pax) => {
      const possiblePassengerFcFields = [
        'form_[fc code]', 'form_fc_code', 'form_fc', 'form_FC_Code',`Fc Code`,`fc_code_`,
        'guest_[fc code]', 'guest_fc_code', 'guest_fc', 'guest_FC_Code',
        '[fc code]', 'fc_code', 'fc code', 'fc', 'FC_Code', 'FC Code',
        'form_employee_code', 'form_emp_code', 'form_emp_code',
        'guest_employee_code', 'guest_emp_code', 'guest_emp_code'
      ];
      
      let paxFcCode = null;
      
      for (const field of possiblePassengerFcFields) {
        if (pax[field] && pax[field] !== 'N/A' && pax[field] !== '' && pax[field] !== null) {
          paxFcCode = pax[field];
          break;
        }
      }
      
      if (!paxFcCode && pax.guest_data) {
        try {
          const guestData = typeof pax.guest_data === 'string' 
            ? JSON.parse(pax.guest_data || '{}')
            : pax.guest_data;
          
          for (const field of possibleFcCodeFields) {
            if (guestData[field] && guestData[field] !== 'N/A' && guestData[field] !== '') {
              paxFcCode = guestData[field];
              break;
            }
          }
        } catch (e) {
          console.error(`Error parsing guest_data for ${pax.paxCode}:`, e);
        }
      }
      
      if (!paxFcCode && pax.form_data) {
        try {
          const formData = typeof pax.form_data === 'string' 
            ? JSON.parse(pax.form_data || '{}')
            : pax.form_data;
          
          for (const field of possibleFcCodeFields) {
            if (formData[field] && formData[field] !== 'N/A' && formData[field] !== '') {
              paxFcCode = formData[field];
              break;
            }
          }
        } catch (e) {
          console.error(`Error parsing form_data for ${pax.paxCode}:`, e);
        }
      }

      if (!paxFcCode) {
        return { ...pax };
      }

      const cleanPaxFcCode = String(paxFcCode).trim();
      
      let matchedGuest = null;
      
      for (const guest of guestListData) {
        const guestFcCode = guest[fcCodeFieldName];
        if (!guestFcCode) continue;
        
        const cleanGuestFcCode = String(guestFcCode).trim();
        
        if (cleanGuestFcCode === cleanPaxFcCode) {
          matchedGuest = guest;
          break;
        }
        
        if (cleanGuestFcCode.toLowerCase() === cleanPaxFcCode.toLowerCase()) {
          matchedGuest = guest;
          break;
        }
        
        if (!isNaN(cleanGuestFcCode) && !isNaN(cleanPaxFcCode)) {
          if (parseInt(cleanGuestFcCode) === parseInt(cleanPaxFcCode)) {
            matchedGuest = guest;
            break;
          }
        }
      }

      if (matchedGuest) {
        const updatedPax = { ...pax };
        
        selectedGuestHeaders.forEach(header => {
          if (matchedGuest[header] !== undefined && matchedGuest[header] !== null) {
            updatedPax[`guest_${header}`] = matchedGuest[header];
          } else {
            updatedPax[`guest_${header}`] = "";
          }
        });
        
        return updatedPax;
      } else {
        return { ...pax };
      }
    });

    setPaxListData(updatedPaxListData);
    setIsGuestHeadersModalOpen(false);
    setSelectedGuestHeaders([]);
    
    const matchedPassengers = updatedPaxListData.filter(pax => {
      return selectedGuestHeaders.some(header => 
        pax[`guest_${header}`] && pax[`guest_${header}`] !== ""
      );
    });
    
    const matchCount = matchedPassengers.length;
    
    if (matchCount === 0) {
      alert(
        `❌ No matches found!\n\n` +
        `Debugging info:\n` +
        `• Using field: "${fcCodeFieldName}" for matching\n` +
        `• Total passengers: ${paxListData.length}\n` +
        `• Guest list records: ${guestListData.length}\n\n` +
        `Possible issues:\n` +
        `1. FC codes don't match between passenger and guest list\n` +
        `2. Field names are different\n` +
        `3. Data format issues`
      );
    } else {
      alert(
        `✅ Successfully matched ${matchCount} out of ${paxListData.length} passengers!\n\n` +
        `Matching field used: "${fcCodeFieldName}"\n` +
        `Applied ${selectedGuestHeaders.length} headers`
      );
    }
  };

  // Enhanced fetchForms function with console logging
  const fetchForms = async () => {
    try {
      setFormsLoading(true);
      console.log('🔍 Fetching forms for lead ID:', leadId);
      
      const response = await fetch(`${API_BASE_URL}/forms/lead/${leadId}`);
      const data = await response.json();

      console.log('📡 API Response Status:', response.status);
      console.log('📦 Raw API Response:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || 'Failed to fetch forms');
      }

      console.log('✅ Forms fetched successfully:', data.forms);
      console.log('📊 Number of forms found:', data.forms?.length || 0);
      
      if (data.forms && data.forms.length > 0) {
        data.forms.forEach((form, index) => {
          console.log(`📝 Form ${index + 1}:`, {
            id: form.id,
            name: form.name,
            share_id: form.share_id,
            created_at: form.created_at,
            updated_at: form.updated_at
          });
        });
      } else {
        console.warn('⚠️ No forms found for this lead');
      }

      setForms(data.forms || []);
    } catch (error) {
      console.error('❌ Error fetching forms:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        leadId: leadId
      });
      alert('Failed to load forms');
    } finally {
      setFormsLoading(false);
      console.log('🏁 Forms loading complete');
    }
  };

  // Enhanced handleFormSelection function with console logging
  const handleFormSelection = (formId) => {
    console.log('🎯 Form selection toggled:', {
      formId: formId,
      currentSelected: selectedForms,
      action: selectedForms.includes(formId) ? 'Removing' : 'Adding'
    });
    
    setSelectedForms(prev => {
      const newSelection = prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId];
      
      console.log('📋 Updated selection:', {
        previous: prev,
        new: newSelection,
        count: newSelection.length
      });
      
      return newSelection;
    });
  };

  // Enhanced handleSelectAllForms function with console logging
  const handleSelectAllForms = () => {
    console.log('🎯 Select All Forms toggled:', {
      currentSelected: selectedForms,
      totalForms: forms.length,
      isAllSelected: selectedForms.length === forms.length
    });
    
    if (selectedForms.length === forms.length) {
      console.log('🔽 Deselecting all forms');
      setSelectedForms([]);
    } else {
      const allFormIds = forms.map(form => form.id);
      console.log('🔼 Selecting all forms:', allFormIds);
      setSelectedForms(allFormIds);
    }
  };

  const getFieldValueFromSubmission = (submission, column) => {
    if (column.label.toLowerCase().includes('int hub') || column.id.toLowerCase().includes('int_hub')) {
      const hubForSubmission = internationalHubs.find(hub => 
        hub.submissionIds && 
        (Array.isArray(hub.submissionIds) ? hub.submissionIds.includes(submission.id) : hub.submissionIds === submission.id)
      );
      
      if (hubForSubmission && hubForSubmission.intHub) {
        return hubForSubmission.intHub;
      }
    }
    
    const field = submission.data.find(f => f.field_id === column.field_id);
    
    if (!field || !field.value) return 'N/A';

    if (field.type === 'aadhar' || field.type === 'ocr-aadhar') {
      switch(column.label) {
        case 'Aadhar Number': return field.value.aadharNumber || 'N/A';
        case 'First Name': return field.value.firstName || 'N/A';
        case 'Last Name': return field.value.lastName || 'N/A';
        case 'Date of Birth': return field.value.dob || 'N/A';
        case 'Gender': return field.value.gender || 'N/A';
        case 'Address': return field.value.address || 'N/A';
        case 'Aadhar Front': 
        case 'Aadhar Back': 
          return field.value[column.label === 'Aadhar Front' ? 'frontImage' : 'backImage'] || 'N/A';
        default: return 'N/A';
      }
    } 
    else if (field.type === 'passport' || field.type === 'ocr-password') {
      switch(column.label) {
        case 'Passport Number': return field.value.passportNumber || 'N/A';
        case 'First Name': return field.value.firstName || 'N/A';
        case 'Last Name': return field.value.lastName || 'N/A';
        case 'Nationality': return field.value.nationality || 'N/A';
        case 'Date of Birth': return field.value.dob || 'N/A';
        case 'Place of Birth': return field.value.placeOfBirth || 'N/A';
        case 'Date of Issue': return field.value.dateOfIssue || 'N/A';
        case 'Date of Expiry': return field.value.dateOfExpiry || 'N/A';
        case 'Passport Front': 
        case 'Passport Back': 
          return field.value[column.label === 'Passport Front' ? 'frontImage' : 'backImage'] || 'N/A';
        default: return 'N/A';
      }
    }
    else if (field.type === 'nearest-airport') {
      switch(column.label) {
        case 'Airport Name': return field.value.selectedAirport || field.value.airportName || 'N/A';
        case 'Airport Code': return field.value.airportCode || 'N/A';
        case 'Address': return field.value.address || 'N/A';
        case 'Distance (km)': return field.value.distanceKm || field.value.distance || 'N/A';
        default: return 'N/A';
      }
    }
    else if (field.type === 'address') {
      switch(column.label) {
        case 'Street 1': return field.value.street1 || 'N/A';
        case 'Street 2': return field.value.street2 || 'N/A';
        case 'City': return field.value.city || 'N/A';
        case 'State': return field.value.state || 'N/A';
        case 'Postal Code': return field.value.postalCode || 'N/A';
        default: return 'N/A';
      }
    }
    else if (field.type === 'file-upload') {
      return field.value || 'N/A';
    }

    if (typeof field.value === 'object' && field.value !== null) {
      return field.value.value || field.value.selectedOption || 
             (field.value.selectedOptions && field.value.selectedOptions.join(', ')) || 'N/A';
    }

    return field.value || 'N/A';
  };

  // Enhanced fetchFormSubmissions function with console logging
  const fetchFormSubmissions = async (targetGroup) => {
    try {
      setLoadingSubmissions(true);
      // console.log('🚀 Starting form submissions fetch...');
      setSelectedFormId(selectedForms[0]);
      // console.log('🎯 Target group:', targetGroup);
      
      await fetchInternationalHubs();
      
      const submissionPromises = selectedForms.map(formId => {
        console.log(`📤 Fetching submissions for form ${formId}`);
        return fetch(`${API_BASE_URL}/forms/${formId}/submissions`)
          .then(res => res.json())
          .then(data => {
            console.log(`📥 Response for form ${formId}:`, {
              success: data.success,
              submissionsCount: data.submissions?.length || 0
            });
            return data;
          });
      });

      const submissionsData = await Promise.all(submissionPromises);
      console.log('📦 All submissions data:', submissionsData);
      
      const approvedSubmissions = submissionsData.flatMap(data => {
        if (!data.success) {
          console.warn('⚠️ Failed response:', data);
          return [];
        }
        const approved = data.submissions.filter(submission => {
          const isApproved = submission.qc_status === 'approved';
          console.log(`🔍 Submission ${submission.id} QC Status: ${submission.qc_status} (${isApproved ? '✅ Approved' : '❌ Not approved'})`);
          return isApproved;
        });
        console.log(`📊 Found ${approved.length} approved submissions in this batch`);
        return approved;
      });

      const rejectedSubmissions = submissionsData.flatMap(data => 
        data.success ? data.submissions.filter(submission => 
          submission.qc_status !== 'approved'
        ) : []
      );

      console.log('📊 Submission Statistics:', {
        totalFetched: submissionsData.reduce((acc, data) => acc + (data.submissions?.length || 0), 0),
        approved: approvedSubmissions.length,
        rejected: rejectedSubmissions.length,
        selectedForms: selectedForms.length
      });

      if (rejectedSubmissions.length > 0) {
        console.warn(`⚠️ ${rejectedSubmissions.length} submissions filtered out (not approved)`);
        alert(`Note: ${rejectedSubmissions.length} submissions were filtered out because they are not approved. Only showing ${approvedSubmissions.length} approved submissions.`);
      }

      setAllSubmissions(approvedSubmissions);

      if (approvedSubmissions.length > 0) {
        console.log('✅ Processing approved submissions:', approvedSubmissions.length);
        const firstSubmission = approvedSubmissions[0];
        console.log('📋 First submission sample:', firstSubmission);
        
        const allColumns = [];

        allColumns.push({ 
          id: 'int_hub', 
          label: 'International Hub', 
          type: 'international-hub',
          field_id: 'int_hub_auto',
          subfield: 'international_hub'
        });

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
              allColumns.push({ 
                id: `aadhar_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                label: field, 
                type: 'aadhar',
                field_id: item.field_id,
                subfield: field.toLowerCase().replace(/\s+/g, '_')
              });
            });
          } 
          else if (item.type === 'passport' || item.type === 'ocr-password') {
            const passportFields = [
              'Passport Number', 'First Name', 'Last Name', 'Nationality', 
              'Date of Birth', 'Place of Birth', 'Date of Issue', 'Date of Expiry',
              'Passport Front', 'Passport Back'
            ];
            
            passportFields.forEach(field => {
              allColumns.push({ 
                id: `passport_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                label: field, 
                type: 'passport',
                field_id: item.field_id,
                subfield: field.toLowerCase().replace(/\s+/g, '_')
              });
            });
          }
          else if (item.type === 'nearest-airport') {
            const airportFields = [
              'Airport Name', 'Airport Code', 'Address', 'Distance (km)'
            ];
            
            airportFields.forEach(field => {
              allColumns.push({ 
                id: `airport_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                label: field, 
                type: 'nearest-airport',
                field_id: item.field_id,
                subfield: field.toLowerCase().replace(/\s+/g, '_')
              });
            });
          }
          else if (item.type === 'address') {
            const addressFields = [
              'Street 1', 'Street 2', 'City', 'State', 'Postal Code'
            ];
            
            addressFields.forEach(field => {
              allColumns.push({ 
                id: `address_${field.replace(/\s+/g, '_').toLowerCase()}`, 
                label: field, 
                type: 'address',
                field_id: item.field_id,
                subfield: field.toLowerCase().replace(/\s+/g, '_')
              });
            });
          }
          else if (item.type === 'file-upload') {
            allColumns.push({ 
              id: item.field_id || `field_${item.label.replace(/\s+/g, '_').toLowerCase()}`,
              label: item.label || 'File Upload', 
              type: 'file-upload',
              field_id: item.field_id
            });
          }
          else {
            const label = item.label || item.field_id || 'Field';
            allColumns.push({ 
              id: item.field_id || `field_${label.replace(/\s+/g, '_').toLowerCase()}`,
              label: label, 
              type: item.type,
              field_id: item.field_id
            });
          }
        });

        console.log('📊 Processed columns:', allColumns);
        console.log('📊 Column types summary:', allColumns.reduce((acc, col) => {
          acc[col.type] = (acc[col.type] || 0) + 1;
          return acc;
        }, {}));

        setAvailableColumns(allColumns);
        setTargetGroupForImport(targetGroup);
        setIsFieldSelectorOpen(true);
      } else {
        console.warn('⚠️ No approved submissions found for the selected forms');
        alert('No approved submissions found for the selected forms. Please check if submissions have been approved.');
        setIsFieldSelectorOpen(false);
      }
    } catch (err) {
      console.error('❌ Error fetching submissions:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        selectedForms: selectedForms
      });
      alert('Failed to fetch approved submissions. Please try again.');
    } finally {
      setLoadingSubmissions(false);
      console.log('🏁 Submissions fetch complete');
    }
  };

  const handleFieldSelection = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAllFields = (type) => {
    if (type === 'all') {
      setSelectedFields(availableColumns.map(col => col.id));
    } else {
      setSelectedFields([]);
    }
  };

  const applyFieldsToPassengers = (targetGroup) => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field');
      return;
    }

    // Determine group number
    let groupNumber = targetGroup;
    if (targetGroup === 'new') {
      if (Array.isArray(groups) && groups.length > 0) {
        groupNumber = (Math.max(...groups.map(g => parseInt(g.group_n)), 0) + 1).toString();
      } else {
        groupNumber = '1';
      }
      
      const newGroup = {
        group_n: groupNumber,
        name: `Group ${groupNumber}`,
        passenger_count: allSubmissions.length
      };
      setGroups(prev => [...prev, newGroup]);
      setActiveGroup(groupNumber);
    }
    
    const transformedData = allSubmissions.map((submission, index) => {
      const existingPassenger = paxListData[index] || {};
      
      const paxItem = {
        ...existingPassenger,
        group_n: groupNumber,
        paxCode: existingPassenger.paxCode || `PAX${String(index + 1).padStart(3, '0')}`,
      };

      selectedFields.forEach(fieldId => {
        const column = availableColumns.find(col => col.id === fieldId);
        if (column) {
          if (column.id === 'int_hub' || column.type === 'international-hub') {
            const hubForSubmission = internationalHubs.find(hub => 
              hub.submissionIds && 
              (Array.isArray(hub.submissionIds) ? hub.submissionIds.includes(submission.id) : hub.submissionIds === submission.id)
            );
            
            if (hubForSubmission && hubForSubmission.intHub) {
              paxItem['form_int_hub'] = hubForSubmission.intHub;
              paxItem['int_hub'] = hubForSubmission.intHub;
            }
          } else {
            const fieldValue = getFieldValueFromSubmission(submission, column);
            paxItem[`form_${column.label.replace(/\s+/g, '_').toLowerCase()}`] = fieldValue;
          }
        }
      });

      return paxItem;
    });

    const existingGroupPassengers = paxListData.filter(p => p.group_n === groupNumber);
    const mergedData = [...existingGroupPassengers, ...transformedData];

    setPaxListData(mergedData);
    setIsFieldSelectorOpen(false);
    setSelectedFields([]);
    
    alert(`Successfully imported ${transformedData.length} passengers to Group ${groupNumber}`);
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

  const assignJourneyToPassenger = async (passengerId, journeyId) => {
    try {
      setIsAssigningJourney(true);
      
      const currentPassenger = passengers.find(p => p.id === passengerId);
      if (!currentPassenger) {
        throw new Error('Passenger not found');
      }

      const passengerData = {
        guest_data: currentPassenger.guest_data || {},
        form_data: currentPassenger.form_data || {},
        pax_status: currentPassenger.pax_status || 'Pending',
        pax_code: currentPassenger.pax_code,
        journey_id: journeyId || null
      };

      const response = await axios.put(`${API_BASE_URL}/paxlist/${passengerId}/lead/${leadId}`, passengerData);
      
      if (response.data.success) {
        setPassengerJourneys(prev => ({
          ...prev,
          [passengerId]: journeyId
        }));
        
        setPaxListData(prev => 
          prev.map(passenger => 
            passenger.id === passengerId 
              ? { ...passenger, journey_id: journeyId }
              : passenger
          )
        );

        setPassengers(prev =>
          prev.map(passenger =>
            passenger.id === passengerId
              ? { ...passenger, journey_id: journeyId }
              : passenger
          )
        );
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to assign journey');
      }
    } catch (error) {
      console.error('Error assigning journey:', error);
      alert('Failed to assign journey. Please try again.');
      throw error;
    } finally {
      setIsAssigningJourney(false);
    }
  };

  const bulkAssignJourney = async (selectedPassengers) => {
    try {
      setBulkAssignLoading(true);
      
      if (journeys.length === 0) {
        alert('No journeys available');
        return;
      }

      const journeyId = journeys[0].journey_id;
      const passengerIds = selectedPassengers.map(p => p.id).filter(Boolean);
      
      const results = await Promise.allSettled(
        passengerIds.map(passengerId => assignJourneyToPassenger(passengerId, journeyId))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (failed > 0) {
        alert(`Successfully assigned journey to ${successful} passengers. Failed for ${failed} passengers.`);
      } else {
        alert(`Successfully assigned journey to all ${successful} passengers!`);
      }
      
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      alert('Failed to assign journey to passengers. Please try again.');
    } finally {
      setBulkAssignLoading(false);
    }
  };

  const assignPnrToPassenger = async (passenger, pnrNumbers) => {
    try {
      const passengerCode = passenger.paxCode || passenger.pax_code;
      
      if (pnrNumbers.length === 1) {
        const pnrData = {
          pnr_number: pnrNumbers[0],
          assigned_by: 'Admin',
          assignment_date: new Date().toISOString()
        };

        const response = await axios.post(
          `${API_BASE_URL}/assing-pnr/${leadId}/passengers/${passengerCode}/assign-pnr`, 
          pnrData
        );
        
        if (response.data.success) {
          setAssignedPnrs(prev => ({
            ...prev,
            [passengerCode]: [...(prev[passengerCode] || []), pnrNumbers[0]]
          }));
          
          alert(`PNR ${pnrNumbers[0]} assigned to passenger ${passengerCode} successfully!`);
        } else {
          throw new Error(response.data.message || 'Failed to assign PNR');
        }
      } else {
        const pnrsData = {
          pnr_numbers: pnrNumbers,
          assigned_by: 'Admin',
          assignment_date: new Date().toISOString()
        };

        const response = await axios.post(
          `${API_BASE_URL}/assing-pnr/${leadId}/passengers/${passengerCode}/assign-multiple-pnrs`, 
          pnrsData
        );
        
        if (response.data.success) {
          setAssignedPnrs(prev => ({
            ...prev,
            [passengerCode]: [...(prev[passengerCode] || []), ...pnrNumbers]
          }));
          
          alert(`${pnrNumbers.length} PNRs assigned to passenger ${passengerCode} successfully!`);
        } else {
          throw new Error(response.data.message || 'Failed to assign PNRs');
        }
      }
    } catch (error) {
      console.error('Error assigning PNR:', error);
      alert('Failed to assign PNR. Please try again.');
    }
  };

  // Updated removePnrFromPassenger function
  const removePnrFromPassenger = async (passenger, selectedPnr, removalReason = '', extraPrice = 0) => {
    try {
      const passengerCode = passenger.paxCode || passenger.pax_code;
      
      if (!passengerCode) {
        alert('Passenger code is missing');
        return;
      }
      
      if (!selectedPnr) {
        alert('Please select a PNR to remove');
        return;
      }
      
      const pnrData = {
        pnr_number: selectedPnr,
        removal_reason: removalReason || 'Manual removal by admin',
        extra_price: extraPrice,
        removed_by: 'Admin',
        removal_date: new Date().toISOString()
      };

      console.log('Removing PNR with data:', pnrData);

      const response = await axios.post(
        `${API_BASE_URL}/assing-pnr/${leadId}/passengers/${passengerCode}/remove-pnr`, 
        pnrData
      );
      
      if (response.data.success) {
        setAssignedPnrs(prev => {
          const currentPnrs = prev[passengerCode] || [];
          return {
            ...prev,
            [passengerCode]: currentPnrs.filter(pnr => pnr !== selectedPnr)
          };
        });
        
        setPassengers(prev =>
          prev.map(p =>
            (p.pax_code === passengerCode || p.paxCode === passengerCode)
              ? {
                  ...p,
                  attached_pnr: (p.attached_pnr || []).filter(pnr => pnr !== selectedPnr),
                  assigned_pnrs: (p.assigned_pnrs || []).filter(pnr => pnr !== selectedPnr)
                }
              : p
          )
        );
        
        setPaxListData(prev =>
          prev.map(p =>
            (p.paxCode === passengerCode || p.pax_code === passengerCode)
              ? {
                  ...p,
                  attached_pnr: (p.attached_pnr || []).filter(pnr => pnr !== selectedPnr),
                  assigned_pnrs: (p.assigned_pnrs || []).filter(pnr => pnr !== selectedPnr)
                }
              : p
          )
        );
        
        alert(`PNR ${selectedPnr} removed from passenger ${passengerCode} successfully!`);
      } else {
        throw new Error(response.data.message || 'Failed to remove PNR');
      }
    } catch (error) {
      console.error('Error removing PNR:', error);
      alert('Failed to remove PNR. Please try again.');
    }
  };

  const bulkPnrAssignment = async (bulkData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assing-pnr/${leadId}/passengers/bulk-assign-pnr`, 
        bulkData
      );
      
      if (response.data.success) {
        const updatedAssignedPnrs = { ...assignedPnrs };
        bulkData.passenger_codes.forEach(paxCode => {
          updatedAssignedPnrs[paxCode] = [...(updatedAssignedPnrs[paxCode] || []), bulkData.pnr_number];
        });
        setAssignedPnrs(updatedAssignedPnrs);
        
        alert(`PNR ${bulkData.pnr_number} assigned to ${bulkData.passenger_codes.length} passengers successfully!`);
      } else {
        throw new Error(response.data.message || 'Failed to bulk assign PNR');
      }
    } catch (error) {
      console.error('Error in bulk PNR assignment:', error);
      alert('Failed to assign PNR to passengers. Please try again.');
    }
  };

  // saveSelectedPassengers function with proper field name cleaning
  const saveSelectedPassengers = async (passengersToSave = selectedPassengers) => {
    if (passengersToSave.length === 0) {
      alert('Please select at least one passenger to save.');
      return;
    }

    try {
      setSavingSelectedPassengers(true);
      
      console.log('First passenger to save:', passengersToSave[0]);
      
      const passengersData = {
        lead_id: parseInt(leadId),
        passengers: passengersToSave.map(passenger => {
          const guest_data = {};
          const form_data = {};
          
          console.log('Processing passenger keys for', passenger.paxCode || passenger.pax_code, ':', Object.keys(passenger));
          
          Object.keys(passenger).forEach(key => {
            const internalFields = ['paxCode', 'paxStatus', 'id', 'createdAt', 'updatedAt', 'guest_data', 'form_data', 'journey_id', 'group_n', 'pax_code', 'pax_status'];
            if (internalFields.includes(key)) {
              return;
            }
            
            const value = passenger[key];
            
            if (value === 'N/A' || value === '' || value === null || value === undefined) {
              return;
            }
            
            if (key.startsWith('guest_')) {
              let guestKey = key.replace('guest_', '');
              guestKey = cleanFieldName(guestKey);
              console.log(`Mapping ${key} → guest_data.${guestKey}:`, value);
              guest_data[guestKey] = value;
              
            } else if (key.startsWith('form_')) {
              let formKey = key.replace('form_', '');
              formKey = cleanFieldName(formKey);
              console.log(`Mapping ${key} → form_data.${formKey}:`, value);
              form_data[formKey] = value;
              
            } else if (key === 'int_hub') {
              console.log(`Mapping int_hub → form_data.int_hub:`, value);
              form_data['int_hub'] = value;
            }
          });

          console.log('Final guest_data for', passenger.paxCode || passenger.pax_code, ':', guest_data);
          console.log('Final form_data for', passenger.paxCode || passenger.pax_code, ':', form_data);

          const payload = {
            pax_code: passenger.paxCode || passenger.pax_code,
            group_n: passenger.group_n || activeGroup,
            guest_data: guest_data,
            form_data: form_data,
            pax_status: passenger.paxStatus || passenger.pax_status || 'Pending',
            journey_id: passenger.journey_id || null,
            int_hub: passenger.int_hub || null
          };
          
          return payload;
        })
      };

      console.log('Sending payload to API:', JSON.stringify(passengersData, null, 2));

      const response = await axios.post(`${API_BASE_URL}/paxlist/pax/${leadId}/multiple`, passengersData);
      
      if (response.data.success) {
        alert(`Successfully saved ${response.data.passengers?.length || passengersToSave.length} selected passengers to database!`);
        
        await fetchPassengersData(pagination.page, { ...filters, group_n: activeGroup });
        
        setSelectedPassengers([]);
      } else {
        throw new Error(response.data.message || 'Failed to save selected passengers');
      }
    } catch (error) {
      console.error('Error saving selected passengers:', error);
      alert('Failed to save selected passengers. Please try again.');
    } finally {
      setSavingSelectedPassengers(false);
    }
  };

  const deletePassengerHandler = async (passengerId) => {
    if (!passengerId || !window.confirm('Are you sure you want to delete this passenger?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/paxlist/${passengerId}`);
      if (response.data.success) {
        alert('Passenger deleted successfully!');
        await fetchPassengersData(pagination.page, { ...filters, group_n: activeGroup });
      } else {
        throw new Error(response.data.message || 'Failed to delete passenger');
      }
    } catch (error) {
      console.error('Error deleting passenger:', error);
      alert('Failed to delete passenger. Please try again.');
    }
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1, group_n: activeGroup };
    setFilters(updatedFilters);
    fetchPassengersData(1, updatedFilters);
  };

  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    handleFilterChange({ sortBy, sortOrder: newSortOrder });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPassengersData(newPage, { ...filters, group_n: activeGroup });
    }
  };

  const handleSearch = (searchTerm) => {
    handleFilterChange({ search: searchTerm });
  };

  const handleStatusFilter = (status) => {
    handleFilterChange({ status: status || '' });
  };

  const handleGroupChange = (groupNumber) => {
    setActiveGroup(groupNumber);
    setSelectedPassengers([]);
    fetchPassengersData(1, { ...filters, group_n: groupNumber });
  };

  const handleImportData = () => {
    console.log('📥 Opening form selector for import...');
    setIsFormSelectorOpen(true);
    fetchForms();
    setTargetGroupForImport('new');
  };

  const handleRefreshAll = () => {
    console.log('🔄 Refreshing all data...');
    fetchPassengersData(1, { ...filters, group_n: activeGroup });
    fetchJourneys();
    fetchPnrList();
    fetchInternationalHubs();
  };

  // Initialize on component mount
  useEffect(() => {
    if (leadId) {
      console.log('🚀 Component mounted, initializing data for lead:', leadId);
      fetchPassengersData(1, filters);
      fetchJourneys();
      fetchPnrList();
      fetchInternationalHubs();
    }
  }, [leadId]);

  // Update selected headers when paxListData changes
  useEffect(() => {
    if (paxListData.length > 0) {
      setSelectedGuestHeadersList(getAllSelectedGuestHeaders());
      setSelectedFormFieldsList(getAllSelectedFields());
    }
  }, [paxListData]);

  // Update bulk assignment data when selected passengers change
  useEffect(() => {
    if (selectedPassengers.length > 0) {
      setBulkPnrAssignmentData(prev => ({
        ...prev,
        passengerCodes: selectedPassengers.map(p => p.paxCode || p.pax_code).filter(Boolean)
      }));
    }
  }, [selectedPassengers]);

  // File Preview Modal
  const FilePreviewModal = ({ isOpen, fileUrl, onClose }) => {
    if (!isOpen) return null;

    const fileName = fileUrl.split('/').pop() || 'Document';
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" style={{ fontSize: '10px' }}>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div>
              <h3 className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>Document Preview</h3>
              <p className="text-gray-600 truncate" style={{ fontSize: '10px' }}>{fileName}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition"
              style={{ fontSize: '18px' }}
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {fileUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
              <img 
                src={fileUrl} 
                alt="Document Preview" 
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
                  <File size={48} className="text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold mb-2" style={{ fontSize: '12px' }}>Document Preview</p>
                <p className="text-gray-600 mb-6" style={{ fontSize: '10px' }}>
                  This document cannot be previewed in the browser.
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={fileUrl}
                    download={fileName}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/30"
                    style={{ fontSize: '10px' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download size={12} />
                    Download Document
                  </a>
                  <button
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition font-semibold border border-gray-300"
                    style={{ fontSize: '10px' }}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-white min-h-screen" style={{ fontSize: '10px' }}>
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <Users size={20} className="text-white" />
              </div>
              <h1 className="text-gray-900 font-bold" style={{ fontSize: '12px' }}>Passenger Management Dashboard</h1>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full font-semibold" style={{ fontSize: '10px' }}>
                Group {activeGroup}
              </span>
              {selectedPassengers.length > 0 && (
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 rounded-full font-semibold animate-pulse" style={{ fontSize: '10px' }}>
                  {selectedPassengers.length} Selected
                </span>
              )}
            </div>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Manage all passenger data, assignments, and flight connections</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                setIsGuestHeadersModalOpen(true);
                fetchGuestListData();
              }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-lg transition font-semibold flex items-center gap-2"
              style={{ fontSize: '10px' }}
            >
              <User size={14} />
              Guest Data 
            </button>
            
            <button 
              onClick={() => {
                console.log('📋 Form Data button clicked');
                setIsFormSelectorOpen(true);
                fetchForms();
              }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 border border-purple-200 px-4 py-2.5 rounded-lg transition font-semibold flex items-center gap-2"
              style={{ fontSize: '10px' }}
            >
              <File size={14} />
              Form Data 
            </button>

            <button 
              onClick={() => applyInternationalHubsToPassengers()}
              className="bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg transition font-semibold flex items-center gap-2"
              style={{ fontSize: '10px' }}
            >
              <Globe size={14} />
              Apply INT Hubs
            </button>

            <button 
              onClick={handleRefreshAll}
              className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border border-green-200 px-4 py-2.5 rounded-lg transition font-semibold flex items-center gap-2"
              style={{ fontSize: '10px' }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Group Tabs */}
        <GroupTabs 
          groups={groups}
          activeGroup={activeGroup}
          onGroupChange={handleGroupChange}
          groupStatistics={groupStatistics}
          onImportData={handleImportData}
          onRefresh={handleRefreshAll}
        />

        {/* Bulk PNR Actions */}
        {selectedPassengers.length > 0 && !showSelectedPanel && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Ticket size={16} className="text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-700" style={{ fontSize: '12px' }}>Bulk PNR Actions - Group {activeGroup}</h4>
                  <p className="text-orange-600" style={{ fontSize: '10px' }}>
                    {selectedPassengers.length} passengers selected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold" style={{ fontSize: '9px' }}>
                  Selection Active
                </span>
                <button
                  onClick={() => setSelectedPassengers([])}
                  className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-1 rounded-lg transition"
                  style={{ fontSize: '10px' }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-gray-700 mb-1 block font-medium" style={{ fontSize: '10px' }}>PNR Number *</label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" size={14} />
                  <input
                    type="text"
                    placeholder="Enter PNR number for bulk assignment"
                    value={bulkPnrAssignmentData.pnrNumber}
                    onChange={(e) => setBulkPnrAssignmentData(prev => ({ ...prev, pnrNumber: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    style={{ fontSize: '10px' }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!bulkPnrAssignmentData.pnrNumber) {
                    alert('Please enter a PNR number');
                    return;
                  }
                  
                  const bulkData = {
                    pnr_number: bulkPnrAssignmentData.pnrNumber,
                    passenger_codes: bulkPnrAssignmentData.passengerCodes,
                    assigned_by: 'Admin',
                    assignment_date: new Date().toISOString()
                  };
                  
                  bulkPnrAssignment(bulkData);
                }}
                disabled={!bulkPnrAssignmentData.pnrNumber}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2.5 rounded-lg transition font-semibold flex items-center gap-2 shadow-md shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '10px' }}
              >
                <Ticket size={14} />
                Assign PNR to All Selected
              </button>
            </div>
          </div>
        )}

        {/* Selection Controls */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paxListData.length > 0 && selectedPassengers.length === paxListData.length}
                  onChange={(e) => handlePassengerSelectionChange(null, true)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700 font-semibold" style={{ fontSize: '10px' }}>
                  {paxListData.length > 0 && selectedPassengers.length === paxListData.length 
                    ? 'Deselect All' 
                    : `Select All (${selectedPassengers.length} selected)`}
                </span>
              </label>
              
              {selectedPassengers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-green-600 font-medium" style={{ fontSize: '10px' }}>
                    ✓ {selectedPassengers.length} passengers ready for action
                  </span>
                </div>
              )}
            </div>

            {selectedPassengers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => saveSelectedPassengers()}
                  disabled={savingSelectedPassengers}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '10px' }}
                >
                  {savingSelectedPassengers ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Database size={12} />
                      Submit ({selectedPassengers.length})
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedPassengers([]);
                    setShowSelectedPanel(false);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition font-semibold border border-gray-300"
                  style={{ fontSize: '10px' }}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search passengers by name, code, or details..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  style={{ fontSize: '10px' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="w-full">
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                  style={{ fontSize: '10px' }}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Boarded">Boarded</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>
              
              <div className="w-full">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                  style={{ fontSize: '10px' }}
                >
                  <option value="pax_code">Sort by Code</option>
                  <option value="pax_status">Sort by Status</option>
                  <option value="created_at">Sort by Date</option>
                </select>
              </div>
              
              <div className="w-full">
                <button
                  onClick={handleRefreshAll}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2.5 rounded-lg transition font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/30"
                  style={{ fontSize: '10px' }}
                >
                  <Filter size={12} />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-gray-600" style={{ fontSize: '10px' }}>Total:</span>
              <span className="text-gray-900 font-semibold" style={{ fontSize: '10px' }}>{stats.totalPassengers}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600" style={{ fontSize: '10px' }}>Guest Columns:</span>
              <span className="text-blue-700 font-semibold" style={{ fontSize: '10px' }}>{selectedGuestHeadersList.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600" style={{ fontSize: '10px' }}>Form Columns:</span>
              <span className="text-purple-700 font-semibold" style={{ fontSize: '10px' }}>{selectedFormFieldsList.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600" style={{ fontSize: '10px' }}>INT Hubs:</span>
              <span className="text-indigo-700 font-semibold" style={{ fontSize: '10px' }}>
                {paxListData.filter(p => p.int_hub).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600" style={{ fontSize: '10px' }}>Journeys Assigned:</span>
              <span className="text-green-700 font-semibold" style={{ fontSize: '10px' }}>
                {stats.withJourneys}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600" style={{ fontSize: '10px' }}>PNR Assigned:</span>
              <span className="text-orange-700 font-semibold" style={{ fontSize: '10px' }}>
                {stats.withPnrs}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingPassengers && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600" style={{ fontSize: '10px' }}>Loading passenger data from database...</p>
            <p className="text-gray-500" style={{ fontSize: '9px' }}>Fetching latest passenger information and statistics</p>
          </div>
        )}

        {/* Error State */}
        {passengerError && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-red-700 font-semibold" style={{ fontSize: '11px' }}>Error Loading Passengers</p>
                  <p className="text-red-600" style={{ fontSize: '10px' }}>{passengerError}</p>
                </div>
              </div>
              <button 
                onClick={() => fetchPassengersData(1, filters)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2"
                style={{ fontSize: '10px' }}
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* No Journeys Warning */}
        {!loadingJourneys && journeys.length === 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Plane size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-yellow-700 font-semibold" style={{ fontSize: '11px' }}>No Flight Journeys Available</p>
                <p className="text-yellow-600" style={{ fontSize: '10px' }}>
                  Please create journeys first in the Flight Connections tab to assign flights to passengers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Passenger Table */}
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1600px', fontSize: '10px' }}>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left p-3 font-semibold w-8">
                    <input
                      type="checkbox"
                      checked={paxListData.length > 0 && selectedPassengers.length === paxListData.length}
                      onChange={(e) => handlePassengerSelectionChange(null, true)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  
                  <th className="text-left p-3 font-semibold w-32">
                    <div className="flex items-center gap-2 text-gray-700">
                      Pax Code
                      <button onClick={() => handleSort('pax_code')}>
                        <ArrowUpDown size={12} className="text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  </th>
                  
                  <th className="text-left p-3 font-semibold w-48">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Plane size={12} className="text-green-600" />
                      Flight Journey
                    </div>
                  </th>

                  <th className="text-left p-3 font-semibold w-48">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Ticket size={12} className="text-blue-600" />
                      Assigned PNRs
                    </div>
                  </th>
                  
                  {selectedGuestHeadersList.map(header => (
                    <th key={header.id} className="text-left p-3 font-semibold w-40 text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-50 rounded">
                          <User size={10} className="text-blue-600" />
                        </div>
                        <span className="truncate">{header.label}</span>
                      </div>
                    </th>
                  ))}
                  
                  {selectedFormFieldsList.map(field => (
                    <th key={field.id} className="text-left p-3 font-semibold w-40 text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-purple-50 rounded">
                          <File size={10} className="text-purple-600" />
                        </div>
                        <span className="truncate">{field.label}</span>
                      </div>
                    </th>
                  ))}
                  
                  <th className="text-left p-3 font-semibold w-32 text-gray-700">
                    <div className="flex items-center gap-2">
                      Status
                      <button onClick={() => handleSort('pax_status')}>
                        <ArrowUpDown size={12} className="text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  </th>
                  
                  <th className="text-left p-3 font-semibold w-24 text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paxListData.length > 0 ? (
                  paxListData.map((passenger, index) => {
                    if (passenger.group_n !== activeGroup) return null;
                    
                    const isSelected = isPassengerSelected(passenger);
                    const passengerAssignedPnrs = assignedPnrs[passenger.paxCode] || passenger.attached_pnr || passenger.assigned_pnrs || [];
                    const journeyName = journeys.find(j => j.journey_id === passenger.journey_id) 
                      ? getCompactJourneyDisplay(journeys.find(j => j.journey_id === passenger.journey_id))
                      : 'Not assigned';

                    return (
                      <tr key={passenger.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePassengerSelectionChange(passenger, false)}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                              <Hash size={10} className="text-blue-600" />
                            </div>
                            <span className="font-mono text-blue-700 font-semibold">
                              {passenger.paxCode || 'N/A'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${passenger.journey_id ? 'bg-green-50' : 'bg-gray-100'}`}>
                              <Plane size={10} className={passenger.journey_id ? 'text-green-600' : 'text-gray-400'} />
                            </div>
                            <span className={`font-medium ${passenger.journey_id ? 'text-green-700' : 'text-gray-500'}`}>
                              {journeyName}
                            </span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="space-y-1">
                            {passengerAssignedPnrs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {passengerAssignedPnrs.slice(0, 2).map((pnr, idx) => (
                                  <span key={idx} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-gray-700 font-medium" style={{ fontSize: '9px' }}>
                                    {pnr}
                                  </span>
                                ))}
                                {passengerAssignedPnrs.length > 2 && (
                                  <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-gray-700 font-medium" style={{ fontSize: '9px' }}>
                                    +{passengerAssignedPnrs.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400" style={{ fontSize: '10px' }}>No PNRs</span>
                            )}
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setSelectedPassengerForPnr(passenger);
                                  setIsPnrAssignmentModalOpen(true);
                                }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded text-white transition flex items-center gap-1"
                                style={{ fontSize: '9px' }}
                              >
                                <Plus size={10} />
                                Assign
                              </button>
                              {passengerAssignedPnrs.length > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedPassengerForPnrRemoval(passenger);
                                    setIsPnrRemovalModalOpen(true);
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-white transition flex items-center gap-1"
                                  style={{ fontSize: '9px' }}
                                >
                                  <Trash2 size={10} />
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {selectedGuestHeadersList.map(header => (
                          <td key={header.id} className="p-3">
                            <div className="text-blue-700 font-medium">
                              {renderTableCell(getPassengerDisplayValue(passenger, header.originalKey))}
                            </div>
                          </td>
                        ))}
                        
                        {selectedFormFieldsList.map(field => {
                          const isIntHub = field.originalKey === 'int_hub' || field.originalKey === 'form_int_hub';
                          const value = getPassengerDisplayValue(passenger, field.originalKey);
                          
                          if (isIntHub && intHubEditId === passenger.id) {
                            return (
                              <td key={field.id} className="p-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={intHubValue}
                                    onChange={(e) => setIntHubValue(e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    style={{ fontSize: '10px' }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleIntHubSave(passenger.id, passenger.paxCode);
                                      } else if (e.key === 'Escape') {
                                        setIntHubEditId(null);
                                        setIntHubValue('');
                                      }
                                    }}
                                  />
                                  <div className="flex gap-0.5">
                                    <button
                                      onClick={() => handleIntHubSave(passenger.id, passenger.paxCode)}
                                      className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
                                      title="Save"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <CheckSquare size={10} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIntHubEditId(null);
                                        setIntHubValue('');
                                      }}
                                      className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                                      title="Cancel"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          }
                          
                          return (
                            <td 
                              key={field.id} 
                              className="p-3"
                              onClick={(e) => {
                                if (isIntHub) {
                                  e.stopPropagation();
                                  setIntHubEditId(passenger.id);
                                  setIntHubValue(value || '');
                                }
                              }}
                            >
                              <div className={`relative ${isIntHub ? 'cursor-pointer group' : ''}`}>
                                {isIntHub ? (
                                  <>
                                    <div className="text-indigo-700 font-medium">
                                      {value || 'N/A'}
                                    </div>
                                    <Edit3 
                                      size={10} 
                                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-indigo-400 group-hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100" 
                                    />
                                    <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-50 rounded transition-colors pointer-events-none"></div>
                                  </>
                                ) : (
                                  <div className="text-purple-700 font-medium">
                                    {renderTableCell(value)}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        
                        <td className="p-3">
                          <span className={`px-3 py-1.5 rounded-full font-semibold ${
                            passenger.paxStatus === 'Boarded' ? 'bg-green-100 text-green-800' :
                            passenger.paxStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            passenger.paxStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`} style={{ fontSize: '9px' }}>
                            {passenger.paxStatus || 'Pending'}
                          </span>
                        </td>
                        
                        <td className="p-3">
                          <div className="flex gap-1">
                            <button 
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition text-blue-600" 
                              title="Edit Passenger"
                              onClick={() => handleEditPassenger(passenger)}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-600" 
                              title="Delete Passenger"
                              onClick={() => deletePassengerHandler(passenger.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="100" className="py-8 text-center text-gray-500" style={{ fontSize: '10px' }}>
                      {loadingPassengers ? 'Loading passenger data...' : 'No passenger data available for this group.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="flex flex-col lg:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-gray-600 mb-3 lg:mb-0" style={{ fontSize: '10px' }}>
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} passengers
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  style={{ fontSize: '10px' }}
                >
                  <ChevronLeft size={12} />
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-lg transition font-medium ${
                        pagination.page === pageNum
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {pagination.totalPages > 5 && (
                  <span className="px-3 py-1.5 text-gray-500">...</span>
                )}
                
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  style={{ fontSize: '10px' }}
                >
                  Next
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500" style={{ fontSize: '10px' }}>
          <p>Passenger Management System • Group {activeGroup} • Data last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Total columns displayed: {selectedGuestHeadersList.length + selectedFormFieldsList.length + 5} • System Version: 3.0.0 (Group Tabs)</p>
        </div>
      </div>

      {/* Modals */}
      <GuestHeadersModal
        isOpen={isGuestHeadersModalOpen}
        onClose={() => setIsGuestHeadersModalOpen(false)}
        guestListHeaders={guestListHeaders}
        selectedGuestHeaders={selectedGuestHeaders}
        onHeaderSelection={handleGuestHeaderSelection}
        onApply={applyGuestHeadersToPaxList}
        guestListData={guestListData}
      />

      <FormDataModal
        isOpen={isFormSelectorOpen}
        onClose={() => setIsFormSelectorOpen(false)}
        forms={forms}
        selectedForms={selectedForms}
        onFormSelection={handleFormSelection}
        onSelectAllForms={handleSelectAllForms}
        formsLoading={formsLoading}
        onGetApprovedData={fetchFormSubmissions}
        groups={groups}
        selectedGroup={targetGroupForImport}
      />

      <FieldSelectionModal
        isOpen={isFieldSelectorOpen}
        onClose={() => setIsFieldSelectorOpen(false)}
        availableColumns={availableColumns}
        selectedFields={selectedFields}
        onFieldSelection={handleFieldSelection}
        onSelectAllFields={handleSelectAllFields}
        allSubmissions={allSubmissions}
        onApplyFields={applyFieldsToPassengers}
        loadingSubmissions={loadingSubmissions}
        targetGroup={targetGroupForImport}
        groups={groups}
      />

      <PnrAssignmentModal
        isOpen={isPnrAssignmentModalOpen}
        onClose={() => {
          setIsPnrAssignmentModalOpen(false);
          setSelectedPassengerForPnr(null);
        }}
        passenger={selectedPassengerForPnr}
        onAssignPnr={(pnrNumbers) => {
          if (selectedPassengerForPnr) {
            assignPnrToPassenger(selectedPassengerForPnr, pnrNumbers);
          }
          setIsPnrAssignmentModalOpen(false);
          setSelectedPassengerForPnr(null);
        }}
        assignedPnrs={selectedPassengerForPnr ? assignedPnrs[selectedPassengerForPnr.paxCode] || [] : []}
      />

      <PnrRemovalModal
        isOpen={isPnrRemovalModalOpen}
        onClose={() => {
          setIsPnrRemovalModalOpen(false);
          setSelectedPassengerForPnrRemoval(null);
        }}
        passenger={selectedPassengerForPnrRemoval}
        onRemovePnr={(passenger, selectedPnr, removalReason, extraPrice) => {
          if (selectedPassengerForPnrRemoval) {
            removePnrFromPassenger(passenger, selectedPnr, removalReason, extraPrice);
          }
          setIsPnrRemovalModalOpen(false);
          setSelectedPassengerForPnrRemoval(null);
        }}
        assignedPnrs={selectedPassengerForPnrRemoval ? 
          (assignedPnrs[selectedPassengerForPnrRemoval.paxCode] || 
           selectedPassengerForPnrRemoval.attached_pnr || 
           selectedPassengerForPnrRemoval.assigned_pnrs || []) 
          : []}
      />

      <PassengerEditModal
        isOpen={editPassengerModalOpen}
        onClose={() => {
          setEditPassengerModalOpen(false);
          setPassengerToEdit(null);
          setEditedPassengerData({});
        }}
        passenger={passengerToEdit}
        passengerData={editedPassengerData}
        onSave={(passenger, updatedData) => {
          const updatedPassengers = paxListData.map(p => 
            p.id === passenger.id ? {
              ...p,
              paxCode: updatedData.paxCode,
              paxStatus: updatedData.paxStatus,
              ...Object.keys(updatedData.guestFields || {}).reduce((acc, key) => {
                acc[key] = updatedData.guestFields[key];
                return acc;
              }, {}),
              ...Object.keys(updatedData.formFields || {}).reduce((acc, key) => {
                acc[key] = updatedData.formFields[key];
                return acc;
              }, {})
            } : p
          );
          setPaxListData(updatedPassengers);
          
          if (selectedPassengers.some(p => p.id === passenger.id)) {
            const updatedSelectedPassengers = selectedPassengers.map(p =>
              p.id === passenger.id ? updatedPassengers.find(p2 => p2.id === passenger.id) : p
            );
            setSelectedPassengers(updatedSelectedPassengers);
          }
          
          alert(`Passenger ${passenger.paxCode} updated successfully!`);
        }}
      />

      <FilePreviewModal
        isOpen={!!selectedFile}
        fileUrl={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};

export default PassengerLists;