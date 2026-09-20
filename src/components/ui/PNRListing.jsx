import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Edit3, 
  Trash2, 
  Users, 
  RefreshCw, 
  Shield, 
  ShieldOff, 
  History,
  X,
  Plus,
  Search,
  ChevronDown,
  Eye,
  Database,
  File,
  Download,
  Plane,
  CheckSquare,
  ArrowUpDown
} from 'lucide-react';
import axios from "axios";

// Theme configuration
const THEME = {
  primary: '#2562ea',
  secondary: '#ffffff',
  fontSize: '10px',
};

// Import PassengerSelectionModal from your existing code
// You'll need to extract it or create a simplified version

// Simplified PassengerSelectionModal for PNR attachment
const PassengerSelectionModal = ({ 
  isOpen, 
  onClose, 
  onPassengersSelected, 
  selectedPassengers = [],
  pnrPassengerLimit = 0,
  isExistingPnr = false,
  pnr = null,
  passengers = [],
  pnrFlightSegments = [],
  journeys = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedPassengers, setLocalSelectedPassengers] = useState(selectedPassengers);
  
  const filteredPassengers = passengers.filter(passenger => 
    passenger.pax_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (passenger.guest_Full_Name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (passenger.form_Full_Name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const togglePassengerSelection = (passenger) => {
    setLocalSelectedPassengers(prev => {
      const isSelected = prev.some(p => p.id === passenger.id);
      if (isSelected) {
        return prev.filter(p => p.id !== passenger.id);
      } else {
        if (pnrPassengerLimit > 0 && prev.length >= pnrPassengerLimit) {
          alert(`PNR passenger limit is ${pnrPassengerLimit}. Cannot select more passengers.`);
          return prev;
        }
        return [...prev, passenger];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto" style={{ fontSize: THEME.fontSize }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: THEME.secondary }}>
            {isExistingPnr ? `Attach Passengers to PNR ${pnr?.pnr_number}` : 'Select Passengers'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            style={{ color: THEME.secondary }}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Pax Code or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              style={{ 
                fontSize: THEME.fontSize,
                borderColor: '#2562ea33',
                color: THEME.secondary 
              }}
            />
          </div>

          {/* Selection Info */}
          <div className="rounded-lg p-4" style={{ backgroundColor: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20` }}>
            <div className="flex justify-between items-center">
              <div className="text-sm" style={{ color: `${THEME.primary}cc` }}>
                Selected: <strong>{localSelectedPassengers.length}</strong> passengers
                {pnrPassengerLimit > 0 && (
                  <span className="ml-2">
                    (Limit: {pnrPassengerLimit})
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const availableSlots = pnrPassengerLimit > 0 ? pnrPassengerLimit - localSelectedPassengers.length : filteredPassengers.length;
                    const passengersToAdd = filteredPassengers
                      .filter(passenger => !localSelectedPassengers.some(p => p.id === passenger.id))
                      .slice(0, availableSlots > 0 ? availableSlots : filteredPassengers.length);
                    
                    setLocalSelectedPassengers(prev => [...prev, ...passengersToAdd]);
                  }}
                  disabled={pnrPassengerLimit > 0 && localSelectedPassengers.length >= pnrPassengerLimit}
                  className={`px-3 py-1 rounded text-sm transition ${
                    (pnrPassengerLimit > 0 && localSelectedPassengers.length >= pnrPassengerLimit) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ 
                    backgroundColor: THEME.primary,
                    color: THEME.secondary 
                  }}
                >
                  Select All Filtered
                </button>
                <button 
                  onClick={() => setLocalSelectedPassengers([])}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                  style={{ color: THEME.secondary }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Passengers List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPassengers.map((passenger) => {
              const isSelected = localSelectedPassengers.some(p => p.id === passenger.id);
              return (
                <div
                  key={passenger.id}
                  onClick={() => togglePassengerSelection(passenger)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? 'border-blue-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? `${THEME.primary}20` : 'rgba(255,255,255,0.05)',
                    fontSize: THEME.fontSize 
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2"
                        style={{ color: THEME.primary }}
                      />
                      <div className="font-mono font-semibold" style={{ color: THEME.primary }}>
                        {passenger.pax_code || passenger.paxCode}
                      </div>
                      <div className="font-medium" style={{ color: THEME.secondary }}>
                        {passenger.guest_Full_Name || passenger.form_Full_Name || 'N/A'}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs`}
                        style={{ 
                          backgroundColor: passenger.pax_status === 'Boarded' ? '#10b98133' :
                          passenger.pax_status === 'Pending' ? '#f59e0b33' :
                          passenger.pax_status === 'Cancelled' ? '#ef444433' :
                          `${THEME.primary}33`,
                          color: passenger.pax_status === 'Boarded' ? '#10b981' :
                          passenger.pax_status === 'Pending' ? '#f59e0b' :
                          passenger.pax_status === 'Cancelled' ? '#ef4444' :
                          THEME.primary
                        }}
                      >
                        {passenger.pax_status || passenger.paxStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPassengers.length === 0 && (
              <div className="text-center py-8 text-gray-400" style={{ fontSize: THEME.fontSize }}>
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <div>No matching passengers found</div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={onClose}
              className="flex-1 hover:bg-white/20 py-3 rounded-lg transition"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: THEME.secondary 
              }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onPassengersSelected(localSelectedPassengers);
                onClose();
              }}
              className="flex-1 hover:bg-green-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: THEME.primary,
                color: THEME.secondary 
              }}
            >
              <Users size={16} />
              Confirm Selection ({localSelectedPassengers.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PNR Assignment Modal
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-md" style={{ fontSize: THEME.fontSize }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: THEME.secondary }}>Assign PNR to Passenger</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            style={{ color: THEME.secondary }}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Passenger Info */}
          <div className="rounded-lg p-4" style={{ backgroundColor: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20` }}>
            <h4 className="font-semibold mb-2" style={{ color: THEME.primary }}>Passenger Details</h4>
            <div className="text-sm">
              <div><strong style={{ color: THEME.secondary }}>Pax Code:</strong> {passenger?.paxCode || passenger?.pax_code}</div>
              <div><strong style={{ color: THEME.secondary }}>Name:</strong> {passenger?.guest_Full_Name || passenger?.form_Full_Name || 'N/A'}</div>
            </div>
          </div>

          {/* Assignment Type */}
          <div>
            <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>Assignment Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2" style={{ color: THEME.secondary }}>
                <input
                  type="radio"
                  value="single"
                  checked={assignmentType === 'single'}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  style={{ color: THEME.primary }}
                />
                <span>Single PNR</span>
              </label>
              <label className="flex items-center gap-2" style={{ color: THEME.secondary }}>
                <input
                  type="radio"
                  value="multiple"
                  checked={assignmentType === 'multiple'}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  style={{ color: THEME.primary }}
                />
                <span>Multiple PNRs</span>
              </label>
            </div>
          </div>

          {/* Single PNR Input */}
          {assignmentType === 'single' && (
            <div>
              <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>PNR Number *</label>
              <input
                type="text"
                placeholder="Enter PNR number"
                value={singlePnr}
                onChange={(e) => setSinglePnr(e.target.value)}
                className="w-full border border-white/10 rounded-lg px-3 py-2 focus:outline-none"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  fontSize: THEME.fontSize,
                  color: THEME.secondary,
                  borderColor: '#2562ea33'
                }}
              />
            </div>
          )}

          {/* Multiple PNRs Input */}
          {assignmentType === 'multiple' && (
            <div>
              <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>PNR Numbers</label>
              <div className="space-y-2">
                {multiplePnrs.map((pnr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`PNR ${index + 1}`}
                      value={pnr}
                      onChange={(e) => updatePnrField(index, e.target.value)}
                      className="flex-1 border border-white/10 rounded-lg px-3 py-2 focus:outline-none"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    />
                    {multiplePnrs.length > 1 && (
                      <button
                        onClick={() => removePnrField(index)}
                        className="px-2 rounded transition"
                        style={{ 
                          backgroundColor: '#ef444433',
                          color: '#ef4444'
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPnrField}
                  className="px-3 py-1 rounded text-sm transition"
                  style={{ 
                    backgroundColor: '#10b98133',
                    color: '#10b981'
                  }}
                >
                  + Add Another PNR
                </button>
              </div>
            </div>
          )}

          {/* Current Assignments */}
          {assignedPnrs.length > 0 && (
            <div className="rounded-lg p-3" style={{ backgroundColor: '#f59e0b10', border: '1px solid #f59e0b20' }}>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#f59e0b' }}>Current PNR Assignments</h4>
              <div className="space-y-1">
                {assignedPnrs.map((pnr, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="font-mono" style={{ color: THEME.secondary }}>{pnr}</span>
                    <span style={{ color: '#10b981' }}>Assigned</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={onClose}
              className="flex-1 hover:bg-white/20 py-3 rounded-lg transition"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: THEME.secondary 
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 hover:bg-green-600 py-3 rounded-lg transition flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: THEME.primary,
                color: THEME.secondary 
              }}
            >
              <Ticket size={16} />
              Assign PNR(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PNR Removal Modal
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

  const handleSubmit = () => {
    if (!selectedPnr) {
      alert('Please select a PNR to remove');
      return;
    }
    
    if (!passenger?.paxCode && !passenger?.pax_code) {
      alert('Passenger code not found');
      return;
    }
    
    onRemovePnr(passenger, selectedPnr, removalReason, extraPrice);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-md" style={{ fontSize: THEME.fontSize }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: THEME.secondary }}>Remove PNR from Passenger</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            style={{ color: THEME.secondary }}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Passenger Info */}
          <div className="rounded-lg p-4" style={{ backgroundColor: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20` }}>
            <h4 className="font-semibold mb-2" style={{ color: THEME.primary }}>Passenger Details</h4>
            <div className="text-sm">
              <div><strong style={{ color: THEME.secondary }}>Pax Code:</strong> {passenger?.paxCode || passenger?.pax_code}</div>
              <div><strong style={{ color: THEME.secondary }}>Name:</strong> {passenger?.guest_Full_Name || passenger?.form_Full_Name || 'N/A'}</div>
            </div>
          </div>

          {/* PNR Selection */}
          <div>
            <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>Select PNR to Remove *</label>
            <select
              value={selectedPnr}
              onChange={(e) => setSelectedPnr(e.target.value)}
              className="w-full border border-white/10 rounded-lg px-3 py-2 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                fontSize: THEME.fontSize,
                color: THEME.secondary,
                borderColor: '#2562ea33'
              }}
            >
              <option value="">Choose PNR...</option>
              {assignedPnrs.map((pnr, index) => (
                <option key={index} value={pnr}>
                  {pnr}
                </option>
              ))}
            </select>
          </div>

          {/* Removal Reason */}
          <div>
            <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>Removal Reason</label>
            <textarea
              placeholder="Reason for removing this PNR..."
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              className="w-full border border-white/10 rounded-lg px-3 py-2 resize-none"
              rows="3"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                fontSize: THEME.fontSize,
                color: THEME.secondary,
                borderColor: '#2562ea33'
              }}
            />
          </div>

          {/* Extra Price */}
          <div>
            <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>Extra Price (if any)</label>
            <input
              type="number"
              placeholder="0.00"
              value={extraPrice}
              onChange={(e) => setExtraPrice(parseFloat(e.target.value) || 0)}
              className="w-full border border-white/10 rounded-lg px-3 py-2 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                fontSize: THEME.fontSize,
                color: THEME.secondary,
                borderColor: '#2562ea33'
              }}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={onClose}
              className="flex-1 hover:bg-white/20 py-3 rounded-lg transition"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: THEME.secondary 
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!selectedPnr || !passenger?.paxCode}
              className={`flex-1 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                !selectedPnr || !passenger?.paxCode
                  ? 'cursor-not-allowed'
                  : 'hover:bg-red-600'
              }`}
              style={{ 
                backgroundColor: !selectedPnr || !passenger?.paxCode ? '#6b7280' : '#ef4444',
                color: THEME.secondary 
              }}
            >
              <Trash2 size={16} />
              Remove PNR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Deactivate PNR Modal
const DeactivatePnrModal = ({ 
  isOpen, 
  onClose, 
  pnr, 
  onDeactivate,
  deactivationForm,
  setDeactivationForm,
  deactivating
}) => {
  if (!isOpen || !pnr) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-md" style={{ fontSize: THEME.fontSize }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: '#f97316' }}>🚫 Deactivate PNR</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            style={{ color: THEME.secondary }}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#f9731610', border: '1px solid #f9731620' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#f97316' }}>PNR Details</h4>
            <div className="text-sm">
              <div><strong style={{ color: THEME.secondary }}>PNR Number:</strong> {pnr.pnr_number}</div>
              <div><strong style={{ color: THEME.secondary }}>Type:</strong> {pnr.pnr_type}</div>
              <div><strong style={{ color: THEME.secondary }}>Passengers:</strong> {pnr.pax_count}</div>
              <div><strong style={{ color: THEME.secondary }}>Status:</strong> <span style={{ color: '#10b981' }}>Active</span></div>
            </div>
          </div>

          <div>
            <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>Deactivation Reason *</label>
            <textarea 
              placeholder="Please provide reason for deactivation..."
              value={deactivationForm.deactivation_reason}
              onChange={(e) => setDeactivationForm(prev => ({ 
                ...prev, 
                deactivation_reason: e.target.value 
              }))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 h-24 resize-none"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                fontSize: THEME.fontSize,
                color: THEME.secondary,
                borderColor: '#2562ea33'
              }}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 mb-2 block" style={{ color: THEME.secondary }}>Deactivated By</label>
            <input 
              type="text" 
              placeholder="Admin"
              value={deactivationForm.deactivated_by}
              onChange={(e) => setDeactivationForm(prev => ({ 
                ...prev, 
                deactivated_by: e.target.value 
              }))}
              className="w-full border border-white/10 rounded-lg px-3 py-2"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                fontSize: THEME.fontSize,
                color: THEME.secondary,
                borderColor: '#2562ea33'
              }}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={onClose}
              className="flex-1 hover:bg-white/20 py-3 rounded-lg transition"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: THEME.secondary 
              }}
              disabled={deactivating}
            >
              Cancel
            </button>
            <button 
              onClick={onDeactivate}
              className="flex-1 hover:bg-orange-600 py-3 rounded-lg transition flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#f97316',
                color: THEME.secondary 
              }}
              disabled={deactivating}
            >
              {deactivating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deactivating...
                </>
              ) : (
                <>
                  <ShieldOff size={16} />
                  Deactivate PNR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main PNRListing Component
const PNRListing = ({ 
  leadId,
  passengers = [],
  journeys = [],
  fetchPassengers,
  fetchJourneys
}) => {
  const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
  
  // State management
  const [pnrList, setPnrList] = useState([]);
  const [loadingPnr, setLoadingPnr] = useState(false);
  const [pnrError, setPnrError] = useState(null);
  
  // PNR Modal States
  const [isPnrModalOpen, setIsPnrModalOpen] = useState(false);
  const [editingPnr, setEditingPnr] = useState(null);
  const [pnrForm, setPnrForm] = useState({
    pnrNumber: '',
    pnrType: 'Group',
    totalPassengers: 1,
    attachedPassengers: [],
    costPerPax: '',
    baseFare: '',
    taxValue: '',
    saleFare: '',
    chairType: 'Economy',
    flightSegments: [{
      flightNumber: '',
      fromAirport: '',
      toAirport: '',
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      duration: '',
      depTerminal: '',
      arvTerminal: ''
    }]
  });

  // Passenger Attachment States
  const [isPassengerSelectionModalOpen, setIsPassengerSelectionModalOpen] = useState(false);
  const [isAttachPassengersModalOpen, setIsAttachPassengersModalOpen] = useState(false);
  const [selectedPnrForAttachment, setSelectedPnrForAttachment] = useState(null);
  
  // PNR Assignment States
  const [isPnrAssignmentModalOpen, setIsPnrAssignmentModalOpen] = useState(false);
  const [selectedPassengerForPnr, setSelectedPassengerForPnr] = useState(null);
  const [assignedPnrs, setAssignedPnrs] = useState({});
  
  // PNR Removal States
  const [isPnrRemovalModalOpen, setIsPnrRemovalModalOpen] = useState(false);
  const [selectedPassengerForPnrRemoval, setSelectedPassengerForPnrRemoval] = useState(null);
  
  // PNR Deactivation States
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedPnrForDeactivation, setSelectedPnrForDeactivation] = useState(null);
  const [deactivationForm, setDeactivationForm] = useState({
    deactivation_reason: '',
    deactivated_by: 'Admin'
  });
  const [deactivatingPnr, setDeactivatingPnr] = useState(false);
  
  // Filter State
  const [pnrStatusFilter, setPnrStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
  };

  // API Functions
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

  const createPnr = async (pnrData) => {
    try {
      const transformedData = {
        pnr_number: pnrData.pnrNumber,
        pnr_type: pnrData.pnrType,
        pax_count: pnrData.totalPassengers,
        assign_pax_count: pnrData.attachedPassengers?.length || 0,
        cost_per_pax: parseFloat(pnrData.costPerPax) || 0,
        base_fare: parseFloat(pnrData.baseFare) || 0,
        tax_value: parseFloat(pnrData.taxValue) || 0,
        sale_fare: parseFloat(pnrData.saleFare) || 0,
        chair_type: pnrData.chairType,
        lead_id: parseInt(leadId),
        flight_segments: pnrData.flightSegments.map(segment => ({
          flight_number: segment.flightNumber,
          from_airport: segment.fromAirport,
          to_airport: segment.toAirport,
          departure_date: segment.departureDate,
          departure_time: segment.departureTime,
          arrival_date: segment.arrivalDate,
          arrival_time: segment.arrivalTime,
          duration: segment.duration,
          dep_terminal: segment.depTerminal,
          arv_terminal: segment.arvTerminal
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/pnrs`, transformedData);
      return response.data;
    } catch (error) {
      console.error('Error creating PNR:', error);
      throw error;
    }
  };

  const updatePnr = async (pnrId, pnrData) => {
    try {
      const transformedData = {
        pnr_number: pnrData.pnrNumber,
        pnr_type: pnrData.pnrType,
        pax_count: pnrData.totalPassengers,
        assign_pax_count: pnrData.attachedPassengers?.length || 0,
        cost_per_pax: parseFloat(pnrData.costPerPax) || 0,
        base_fare: parseFloat(pnrData.baseFare) || 0,
        tax_value: parseFloat(pnrData.taxValue) || 0,
        sale_fare: parseFloat(pnrData.saleFare) || 0,
        chair_type: pnrData.chairType,
        lead_id: parseInt(leadId),
        flight_segments: pnrData.flightSegments.map(segment => ({
          flight_number: segment.flightNumber,
          from_airport: segment.fromAirport,
          to_airport: segment.toAirport,
          departure_date: segment.departureDate,
          departure_time: segment.departureTime,
          arrival_date: segment.arrivalDate,
          arrival_time: segment.arrivalTime,
          duration: segment.duration,
          dep_terminal: segment.depTerminal,
          arv_terminal: segment.arvTerminal
        }))
      };

      const response = await axios.put(`${API_BASE_URL}/pnrs/${pnrId}`, transformedData);
      return response.data;
    } catch (error) {
      console.error('Error updating PNR:', error);
      throw error;
    }
  };

  const deletePnr = async (pnrId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/pnrs/${pnrId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting PNR:', error);
      throw error;
    }
  };

  const deactivatePnr = async (pnrId, deactivationData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/pnrs/${pnrId}/deactivate`, deactivationData);
      return response.data;
    } catch (error) {
      console.error('Error deactivating PNR:', error);
      throw error;
    }
  };

  const reactivatePnr = async (pnrId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/pnrs/${pnrId}/reactivate`, {
        reactivation_reason: 'Manual reactivation by admin',
        reactivated_by: 'Admin'
      });
      return response.data;
    } catch (error) {
      console.error('Error reactivating PNR:', error);
      throw error;
    }
  };

  const getPnrsByStatus = async (status) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pnrs/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching PNRs by status:', error);
      throw error;
    }
  };

  const getDeactivationHistory = async (pnrId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pnrs/${pnrId}/deactivation-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deactivation history:', error);
      throw error;
    }
  };

  const assignPnrToPassenger = async (paxCode, pnrData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assing-pnr/${leadId}/passengers/${paxCode}/assign-pnr`, 
        pnrData
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning PNR to passenger:', error);
      throw error;
    }
  };

  const removePnrFromPassenger = async (paxCode, pnrData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assing-pnr/${leadId}/passengers/${paxCode}/remove-pnr`, 
        pnrData
      );
      return response.data;
    } catch (error) {
      console.error('Error removing PNR from passenger:', error);
      throw error;
    }
  };

  const getPassengersByPnr = async (pnrNumber) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assing-pnr/passengers/by-pnr/${pnrNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching passengers by PNR:', error);
      throw error;
    }
  };

  // Helper Functions
  const getAttachedPassengers = (pnrNumber) => {
    return passengers.filter(passenger => 
      passenger.pnr_number === pnrNumber || 
      (passenger.assigned_pnrs && passenger.assigned_pnrs.includes(pnrNumber)) ||
      (passenger.attached_pnr && passenger.attached_pnr.includes(pnrNumber))
    );
  };

  const getAssignedPassengerCount = (pnrNumber) => {
    return passengers.filter(passenger => 
      passenger.pnr_number === pnrNumber || 
      (passenger.assigned_pnrs && passenger.assigned_pnrs.includes(pnrNumber)) ||
      (passenger.attached_pnr && passenger.attached_pnr.includes(pnrNumber))
    ).length;
  };

  const resetPnrForm = () => {
    setPnrForm({
      pnrNumber: '',
      pnrType: 'Group',
      totalPassengers: 1,
      attachedPassengers: [],
      costPerPax: '',
      baseFare: '',
      taxValue: '',
      saleFare: '',
      chairType: 'Economy',
      flightSegments: [{
        flightNumber: '',
        fromAirport: '',
        toAirport: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        duration: '',
        depTerminal: '',
        arvTerminal: ''
      }]
    });
    setEditingPnr(null);
  };

  // Event Handlers
  const savePnr = async () => {
    try {
      if (!pnrForm.pnrNumber.trim()) {
        alert('PNR Number is required');
        return;
      }

      if (!pnrForm.totalPassengers || pnrForm.totalPassengers < 1) {
        alert('Passenger count must be at least 1');
        return;
      }

      const validSegments = pnrForm.flightSegments.filter(segment => 
        segment.flightNumber && segment.fromAirport && segment.toAirport && segment.departureDate
      );

      if (validSegments.length === 0) {
        alert('At least one valid flight segment is required');
        return;
      }

      let response;
      if (editingPnr) {
        response = await updatePnr(editingPnr.id, pnrForm);
      } else {
        response = await createPnr(pnrForm);
      }

      if (response.success) {
        // Attach passengers if any
        if (pnrForm.attachedPassengers && pnrForm.attachedPassengers.length > 0) {
          try {
            const assignmentPromises = pnrForm.attachedPassengers.map(passenger =>
              assignPnrToPassenger(passenger.paxCode || passenger.pax_code, {
                pnr_number: pnrForm.pnrNumber,
                assigned_by: 'Admin',
                assignment_date: new Date().toISOString()
              })
            );
            
            await Promise.all(assignmentPromises);
          } catch (assignmentError) {
            console.error('Error assigning PNR to passengers:', assignmentError);
          }
        }

        alert(editingPnr ? 'PNR updated successfully!' : 'PNR created successfully!');
        await fetchPnrList();
        if (fetchPassengers) await fetchPassengers();
        setIsPnrModalOpen(false);
        resetPnrForm();
      } else {
        throw new Error(response.message || 'Failed to save PNR');
      }
    } catch (error) {
      console.error('Error saving PNR:', error);
      alert('Failed to save PNR. Please try again.');
    }
  };

  const editPnr = (pnr) => {
    setEditingPnr(pnr);
    
    const attachedPassengers = getAttachedPassengers(pnr.pnr_number);
    
    setPnrForm({
      pnrNumber: pnr.pnr_number || '',
      pnrType: pnr.pnr_type || 'Group',
      totalPassengers: pnr.pax_count || 1,
      attachedPassengers: attachedPassengers,
      costPerPax: pnr.cost_per_pax || '',
      baseFare: pnr.base_fare || '',
      taxValue: pnr.tax_value || '',
      saleFare: pnr.sale_fare || '',
      chairType: pnr.chair_type || 'Economy',
      flightSegments: pnr.flight_segments && pnr.flight_segments.length > 0 
        ? pnr.flight_segments.map(segment => ({
            flightNumber: segment.flight_number || '',
            fromAirport: segment.from_airport || '',
            toAirport: segment.to_airport || '',
            departureDate: segment.departure_date || '',
            departureTime: segment.departure_time || '',
            arrivalDate: segment.arrival_date || '',
            arrivalTime: segment.arrival_time || '',
            duration: segment.duration || '',
            depTerminal: segment.dep_terminal || '',
            arvTerminal: segment.arv_terminal || ''
          }))
        : [{
            flightNumber: '',
            fromAirport: '',
            toAirport: '',
            departureDate: '',
            departureTime: '',
            arrivalDate: '',
            arrivalTime: '',
            duration: '',
            depTerminal: '',
            arvTerminal: ''
          }]
    });
    setIsPnrModalOpen(true);
  };

  const deletePnrHandler = async (pnrId) => {
    const pnrToDelete = pnrList.find(pnr => pnr.id === pnrId);
    
    if (!pnrToDelete) return;
    
    if (window.confirm(`Are you sure you want to delete PNR ${pnrToDelete.pnr_number}?`)) {
      try {
        const response = await deletePnr(pnrId);
        if (response.success) {
          alert('PNR deleted successfully!');
          await fetchPnrList();
        } else {
          throw new Error(response.message || 'Failed to delete PNR');
        }
      } catch (error) {
        console.error('Error deleting PNR:', error);
        alert('Failed to delete PNR. Please try again.');
      }
    }
  };

  const handleDeactivatePnr = (pnr) => {
    setSelectedPnrForDeactivation(pnr);
    setDeactivationForm({
      deactivation_reason: '',
      deactivated_by: 'Admin'
    });
    setIsDeactivateModalOpen(true);
  };

  const handleReactivatePnr = async (pnr) => {
    if (!window.confirm(`Are you sure you want to reactivate PNR ${pnr.pnr_number}?`)) {
      return;
    }

    try {
      setDeactivatingPnr(true);
      const response = await reactivatePnr(pnr.id);
      
      if (response.success) {
        alert('PNR reactivated successfully!');
        await fetchPnrList();
      } else {
        throw new Error(response.message || 'Failed to reactivate PNR');
      }
    } catch (error) {
      console.error('Error reactivating PNR:', error);
      alert('Failed to reactivate PNR. Please try again.');
    } finally {
      setDeactivatingPnr(false);
    }
  };

  const confirmDeactivatePnr = async () => {
    if (!selectedPnrForDeactivation) return;

    if (!deactivationForm.deactivation_reason.trim()) {
      alert('Please provide a deactivation reason');
      return;
    }

    try {
      setDeactivatingPnr(true);
      const response = await deactivatePnr(selectedPnrForDeactivation.id, deactivationForm);
      
      if (response.success) {
        alert('PNR deactivated successfully!');
        setIsDeactivateModalOpen(false);
        setSelectedPnrForDeactivation(null);
        await fetchPnrList();
      } else {
        throw new Error(response.message || 'Failed to deactivate PNR');
      }
    } catch (error) {
      console.error('Error deactivating PNR:', error);
      alert('Failed to deactivate PNR. Please try again.');
    } finally {
      setDeactivatingPnr(false);
    }
  };

  const handlePnrStatusFilter = async (status) => {
    setPnrStatusFilter(status);
    
    if (status === 'All') {
      await fetchPnrList();
    } else {
      try {
        setLoadingPnr(true);
        const response = await getPnrsByStatus(status);
        if (response.success) {
          setPnrList(response.data || []);
        } else {
          throw new Error(response.message || 'Failed to fetch PNRs');
        }
      } catch (error) {
        console.error('Error filtering PNRs:', error);
        alert('Failed to filter PNRs. Please try again.');
      } finally {
        setLoadingPnr(false);
      }
    }
  };

  const handleViewDeactivationHistory = async (pnr) => {
    try {
      const response = await getDeactivationHistory(pnr.id);
      if (response.success) {
        const history = response.data || [];
        if (history.length === 0) {
          alert(`No deactivation history found for PNR ${pnr.pnr_number}`);
        } else {
          const historyText = history.map((log, index) => 
            `${index + 1}. ${formatDate(log.deactivated_at)} - ${log.deactivation_reason} (by ${log.deactivated_by})`
          ).join('\n');
          
          alert(`Deactivation History for PNR ${pnr.pnr_number}:\n\n${historyText}`);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch deactivation history');
      }
    } catch (error) {
      console.error('Error fetching deactivation history:', error);
      alert('Failed to fetch deactivation history. Please try again.');
    }
  };

  const openPassengerSelectionModal = () => {
    setIsPassengerSelectionModalOpen(true);
  };

  const closePassengerSelectionModal = () => {
    setIsPassengerSelectionModalOpen(false);
  };

  const handlePassengersSelected = (selectedPassengers) => {
    setPnrForm(prev => ({
      ...prev,
      attachedPassengers: selectedPassengers
    }));
  };

  const openAttachPassengersModal = (pnr) => {
    setSelectedPnrForAttachment(pnr);
    setIsAttachPassengersModalOpen(true);
  };

  const closeAttachPassengersModal = () => {
    setSelectedPnrForAttachment(null);
    setIsAttachPassengersModalOpen(false);
  };

  const handleExistingPnrPassengersSelected = async (selectedPassengers) => {
    if (!selectedPnrForAttachment) return;
    
    try {
      const assignmentPromises = selectedPassengers.map(passenger =>
        assignPnrToPassenger(passenger.paxCode || passenger.pax_code, {
          pnr_number: selectedPnrForAttachment.pnr_number,
          assigned_by: 'Admin',
          assignment_date: new Date().toISOString()
        })
      );
      
      await Promise.all(assignmentPromises);
      alert(`Successfully attached ${selectedPassengers.length} passengers to PNR ${selectedPnrForAttachment.pnr_number}`);
      closeAttachPassengersModal();
      await fetchPnrList();
      if (fetchPassengers) await fetchPassengers();
    } catch (error) {
      console.error('Error attaching passengers to PNR:', error);
      alert('Failed to attach passengers. Please try again.');
    }
  };

  const detachPassengerFromPnr = async (passengerId, pnrNumber) => {
    if (!window.confirm('Are you sure you want to detach this passenger from the PNR?')) {
      return;
    }

    try {
      const passenger = passengers.find(p => p.id === passengerId);
      if (passenger) {
        await handleRemovePnrFromPassenger(passenger, pnrNumber);
        alert('Passenger detached successfully!');
        await fetchPnrList();
        if (fetchPassengers) await fetchPassengers();
      }
    } catch (error) {
      console.error('Error detaching passenger:', error);
      alert('Failed to detach passenger. Please try again.');
    }
  };

  const handleAssignPnrToPassenger = async (passenger, pnrNumbers) => {
    try {
      const passengerCode = passenger.paxCode || passenger.pax_code;
      
      if (!passengerCode || !pnrNumbers.length) {
        alert('Passenger code and PNR number are required');
        return;
      }

      if (pnrNumbers.length === 1) {
        const pnrData = {
          pnr_number: pnrNumbers[0],
          assigned_by: 'Admin',
          assignment_date: new Date().toISOString()
        };

        const response = await assignPnrToPassenger(passengerCode, pnrData);
        
        if (response.success) {
          setAssignedPnrs(prev => ({
            ...prev,
            [passengerCode]: [...(prev[passengerCode] || []), pnrNumbers[0]]
          }));
          
          alert(`PNR ${pnrNumbers[0]} assigned to passenger ${passengerCode} successfully!`);
        } else {
          throw new Error(response.message || 'Failed to assign PNR');
        }
      } else {
        // Handle multiple PNRs
        alert('Multiple PNR assignment not implemented yet');
      }

      setIsPnrAssignmentModalOpen(false);
      setSelectedPassengerForPnr(null);
      if (fetchPassengers) await fetchPassengers();
    } catch (error) {
      console.error('Error assigning PNR:', error);
      alert('Failed to assign PNR. Please try again.');
    }
  };

  const handleRemovePnrFromPassenger = async (passenger, pnrNumber, removalReason = '', extraPrice = 0) => {
    try {
      const passengerCode = passenger.paxCode || passenger.pax_code;
      
      if (!passengerCode || !pnrNumber) {
        alert('Passenger code and PNR number are required');
        return;
      }

      const pnrData = {
        pnr_number: pnrNumber,
        removal_reason: removalReason || 'Manual removal by admin',
        extra_price: extraPrice,
        removed_by: 'Admin',
        removal_date: new Date().toISOString()
      };

      const response = await removePnrFromPassenger(passengerCode, pnrData);
      
      if (response.success) {
        setAssignedPnrs(prev => ({
          ...prev,
          [passengerCode]: (prev[passengerCode] || []).filter(pnr => pnr !== pnrNumber)
        }));
        
        alert(`PNR ${pnrNumber} removed from passenger ${passengerCode} successfully!`);
        
        setIsPnrRemovalModalOpen(false);
        setSelectedPassengerForPnrRemoval(null);
        if (fetchPassengers) await fetchPassengers();
      } else {
        throw new Error(response.message || 'Failed to remove PNR');
      }
    } catch (error) {
      console.error('Error removing PNR:', error);
      alert('Failed to remove PNR. Please try again.');
    }
  };

  const openPnrAssignmentModal = (passenger) => {
    const passengerWithCode = {
      ...passenger,
      paxCode: passenger.paxCode || passenger.pax_code,
      pax_code: passenger.pax_code || passenger.paxCode
    };
    
    setSelectedPassengerForPnr(passengerWithCode);
    setIsPnrAssignmentModalOpen(true);
  };

  const openPnrRemovalModal = (passenger) => {
    const passengerWithCode = {
      ...passenger,
      paxCode: passenger.paxCode || passenger.pax_code,
      pax_code: passenger.pax_code || passenger.paxCode
    };
    
    setSelectedPassengerForPnrRemoval(passengerWithCode);
    setIsPnrRemovalModalOpen(true);
  };

  const viewPassengersByPnr = async (pnrNumber) => {
    try {
      const response = await getPassengersByPnr(pnrNumber);
      if (response.success) {
        const passengersList = response.data || [];
        if (passengersList.length > 0) {
          const passengerNames = passengersList.map(p => 
            `${p.pax_code}: ${p.guest_Full_Name || p.form_Full_Name || 'N/A'}`
          ).join('\n');
          alert(`Passengers assigned to PNR ${pnrNumber}:\n\n${passengerNames}`);
        } else {
          alert(`No passengers assigned to PNR ${pnrNumber}`);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch passengers');
      }
    } catch (error) {
      console.error('Error fetching passengers by PNR:', error);
      alert('Failed to fetch passenger details. Please try again.');
    }
  };

  // Filter PNRs
  const filteredPnrList = pnrList.filter(pnr => {
    const matchesSearch = 
      pnr.pnr_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pnr.pnr_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pnr.flight_segments?.[0]?.from_airport?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pnr.flight_segments?.[0]?.to_airport?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (pnrStatusFilter === 'All') return matchesSearch;
    if (pnrStatusFilter === 'Active') return matchesSearch && pnr.status === 'Active';
    if (pnrStatusFilter === 'Deactivated') return matchesSearch && pnr.status === 'Deactivated';
    return matchesSearch;
  });

  // Calculate Statistics
  const totalValue = pnrList.reduce((sum, pnr) => 
    sum + (parseFloat(pnr.cost_per_pax) || 0) * (pnr.pax_count || 0), 0
  );

  const activePnrCount = pnrList.filter(pnr => pnr.status === 'Active').length;
  const deactivatedPnrCount = pnrList.filter(pnr => pnr.status === 'Deactivated').length;
  const totalAttachedPassengers = pnrList.reduce((sum, pnr) => 
    sum + getAssignedPassengerCount(pnr.pnr_number), 0
  );

  // Initialize data
  useEffect(() => {
    if (leadId) {
      fetchPnrList();
    }
  }, [leadId]);

  // Add flight segment
  const addFlightSegment = () => {
    setPnrForm(prev => ({
      ...prev,
      flightSegments: [...prev.flightSegments, {
        flightNumber: '',
        fromAirport: '',
        toAirport: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        duration: '',
        depTerminal: '',
        arvTerminal: ''
      }]
    }));
  };

  // Remove flight segment
  const removeFlightSegment = (index) => {
    if (pnrForm.flightSegments.length > 1) {
      setPnrForm(prev => ({
        ...prev,
        flightSegments: prev.flightSegments.filter((_, i) => i !== index)
      }));
    }
  };

  // Update flight segment
  const updateFlightSegment = (index, field, value) => {
    const updatedSegments = [...pnrForm.flightSegments];
    updatedSegments[index] = {
      ...updatedSegments[index],
      [field]: value
    };
    setPnrForm(prev => ({
      ...prev,
      flightSegments: updatedSegments
    }));
  };

  // Remove attached passenger
  const removeAttachedPassenger = (index) => {
    setPnrForm(prev => ({
      ...prev,
      attachedPassengers: prev.attachedPassengers.filter((_, i) => i !== index)
    }));
  };

  // Clear all attached passengers
  const clearAllAttachedPassengers = () => {
    setPnrForm(prev => ({
      ...prev,
      attachedPassengers: []
    }));
  };

  return (
  <div className="p-6 bg-gradient-to-br from-white to-sky-50 backdrop-blur-sm" style={{ fontSize: THEME.fontSize }}>
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-sky-900">🎫 PNR Management</h2>
    <div className="flex gap-3">
      <button 
        onClick={() => {
          resetPnrForm();
          setIsPnrModalOpen(true);
        }}
        className="hover:bg-sky-600 bg-sky-500 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
      >
        <Ticket size={20} className="mr-2" />
        Add PNR
      </button>
      <button 
        onClick={fetchPnrList}
        className="hover:bg-sky-100 bg-white text-sky-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md border border-sky-200"
      >
        <RefreshCw size={16} />
        Refresh
      </button>
    </div>
  </div>

  {/* PNR Statistics */}
  <div className="grid grid-cols-4 gap-4 mb-6">
    <div className="rounded-xl p-4 border border-sky-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="text-2xl font-bold text-sky-700">
        {pnrList.length}
      </div>
      <div className="text-sky-600">Total PNRs</div>
    </div>
    <div className="rounded-xl p-4 border border-emerald-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="text-2xl font-bold text-emerald-600">
        {activePnrCount}
      </div>
      <div className="text-emerald-600">Active PNRs</div>
    </div>
    <div className="rounded-xl p-4 border border-rose-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="text-2xl font-bold text-rose-600">
        {deactivatedPnrCount}
      </div>
      <div className="text-rose-600">Deactivated PNRs</div>
    </div>
    <div className="rounded-xl p-4 border border-violet-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="text-2xl font-bold text-violet-600">
        ₹{totalValue.toLocaleString()}
      </div>
      <div className="text-violet-600">Total Value</div>
    </div>
  </div>

  {/* Search and Filters */}
  <div className="flex gap-4 mb-6">
    <div className="flex-1">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-400" />
        <input
          type="text"
          placeholder="Search PNRs by number, type, or airport..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            fontSize: THEME.fontSize,
            color: '#0c4a6e',
          }}
        />
      </div>
    </div>
    <div className="flex gap-3">
      <button 
        onClick={() => handlePnrStatusFilter('All')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          pnrStatusFilter === 'All' 
            ? 'bg-sky-500 text-white shadow-sm' 
            : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200'
        }`}
        style={{ fontSize: THEME.fontSize }}
      >
        All PNRs
      </button>
      <button 
        onClick={() => handlePnrStatusFilter('Active')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          pnrStatusFilter === 'Active' 
            ? 'bg-emerald-500 text-white shadow-sm' 
            : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
        }`}
        style={{ fontSize: THEME.fontSize }}
      >
        Active
      </button>
      <button 
        onClick={() => handlePnrStatusFilter('Deactivated')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          pnrStatusFilter === 'Deactivated' 
            ? 'bg-rose-500 text-white shadow-sm' 
            : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
        }`}
        style={{ fontSize: THEME.fontSize }}
      >
        Deactivated
      </button>
    </div>
  </div>

  {/* Loading State */}
  {loadingPnr && (
    <div className="flex justify-center items-center py-8" style={{ fontSize: THEME.fontSize, color: '#0c4a6e' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      <span className="ml-2">Loading PNR data...</span>
    </div>
  )}

  {/* Error State */}
  {pnrError && (
    <div className="rounded-xl p-4 mb-6 border border-rose-300 bg-rose-50/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2 text-rose-700" style={{ fontSize: THEME.fontSize }}>
        <span>⚠️</span>
        <span>{pnrError}</span>
      </div>
      <button 
        onClick={fetchPnrList}
        className="mt-2 px-3 py-1 rounded transition-all duration-200 bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
        style={{ fontSize: THEME.fontSize }}
      >
        Retry
      </button>
    </div>
  )}

  {/* PNR List Table */}
  <div className="rounded-xl overflow-hidden border border-sky-200 bg-white/90 backdrop-blur-sm shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: '1400px', fontSize: THEME.fontSize }}>
        <thead>
          <tr className="bg-gradient-to-r from-sky-50 to-white border-b border-sky-100">
            <th className="text-left p-3 font-semibold text-sky-900">PNR Number</th>
            <th className="text-left p-3 font-semibold text-sky-900">Status</th>
            <th className="text-left p-3 font-semibold text-sky-900">PNR Type</th>
            <th className="text-left p-3 font-semibold text-sky-900">Chair Type</th>
            <th className="text-left p-3 font-semibold text-sky-900">Flight Segments</th>
            <th className="text-left p-3 font-semibold text-sky-900">Pax Count</th>
            <th className="text-left p-3 font-semibold text-sky-900">Attached Passengers</th>
            <th className="text-left p-3 font-semibold text-sky-900">Cost (Per Pax)</th>
            <th className="text-left p-3 font-semibold text-sky-900">Base Fare</th>
            <th className="text-left p-3 font-semibold text-sky-900">Tax Value</th>
            <th className="text-left p-3 font-semibold text-sky-900">Sale Fare</th>
            <th className="text-left p-3 font-semibold text-sky-900">Created Date</th>
            <th className="text-left p-3 font-semibold text-sky-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPnrList.length > 0 ? (
            filteredPnrList.map((pnr, index) => {
              const attachedPassengers = getAttachedPassengers(pnr.pnr_number);
              const assignedPassengersCount = getAssignedPassengerCount(pnr.pnr_number);
              
              return (
                <tr key={pnr.id || index} className="border-b border-sky-100 hover:bg-sky-50/50 transition-colors duration-200">
                  {/* PNR Number */}
                  <td className="p-3">
                    <div className="font-mono font-semibold px-3 py-1 rounded bg-sky-100 text-sky-700 border border-sky-200">
                      {pnr.pnr_number}
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-full font-medium border"
                      style={{ 
                        backgroundColor: pnr.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                        pnr.status === 'Deactivated' ? 'rgba(239, 68, 68, 0.1)' :
                        pnr.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' :
                        'rgba(107, 114, 128, 0.1)',
                        color: pnr.status === 'Active' ? '#065f46' :
                        pnr.status === 'Deactivated' ? '#991b1b' :
                        pnr.status === 'Pending' ? '#92400e' :
                        '#374151',
                        borderColor: pnr.status === 'Active' ? '#10b981' :
                        pnr.status === 'Deactivated' ? '#ef4444' :
                        pnr.status === 'Pending' ? '#f59e0b' :
                        '#9ca3af'
                      }}
                    >
                      {pnr.status}
                    </span>
                  </td>
                  
                  {/* PNR Type */}
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-full font-medium border border-sky-200 bg-sky-100 text-sky-700">
                      {pnr.pnr_type}
                    </span>
                  </td>
                  
                  {/* Chair Type */}
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-full font-medium border"
                      style={{ 
                        backgroundColor: pnr.chair_type === 'Economy' ? 'rgba(107, 114, 128, 0.1)' :
                        pnr.chair_type === 'Premium Economy' ? 'rgba(14, 165, 233, 0.1)' :
                        pnr.chair_type === 'Business' ? 'rgba(139, 92, 246, 0.1)' :
                        'rgba(245, 158, 11, 0.1)',
                        color: pnr.chair_type === 'Economy' ? '#374151' :
                        pnr.chair_type === 'Premium Economy' ? '#0369a1' :
                        pnr.chair_type === 'Business' ? '#5b21b6' :
                        '#92400e',
                        borderColor: pnr.chair_type === 'Economy' ? '#9ca3af' :
                        pnr.chair_type === 'Premium Economy' ? '#0ea5e9' :
                        pnr.chair_type === 'Business' ? '#8b5cf6' :
                        '#f59e0b'
                      }}
                    >
                      {pnr.chair_type}
                    </span>
                  </td>
                  
                  {/* Flight Segments */}
                  <td className="p-3">
                    <div className="space-y-2">
                      {(pnr.flight_segments || []).map((segment, segIndex) => (
                        <div key={segIndex}>
                          <div className="font-semibold text-sky-900">
                            {segment.from_airport} → {segment.to_airport}
                          </div>
                          <div className="text-sky-600">
                            {segment.flight_number} • {formatDate(segment.departure_date)}
                            {segment.departure_time && ` • ${formatTime(segment.departure_time)}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  {/* Pax Count */}
                  <td className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-sky-900">{pnr.pax_count}</div>
                      <div className="text-sky-600">passengers</div>
                    </div>
                  </td>
                  
                  {/* Attached Passengers */}
                  <td className="p-3">
                    <div className="space-y-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">
                          {assignedPassengersCount}
                        </div>
                      </div>
                      
                      {/* Passenger List Preview */}
                      {attachedPassengers.length > 0 && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer text-sky-600 hover:text-sky-700">
                              View Passengers ({attachedPassengers.length})
                            </summary>
                            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                              {attachedPassengers.map((passenger, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded bg-sky-50 border border-sky-100">
                                  <div>
                                    <div className="font-medium text-sky-900">
                                      {passenger.guest_Full_Name || 
                                       passenger.form_Full_Name || 
                                       passenger.pax_code}
                                    </div>
                                    <div className="text-sky-600">
                                      {passenger.pax_code}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => detachPassengerFromPnr(passenger.id, pnr.pnr_number)}
                                    className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-colors"
                                    title="Detach Passenger"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Cost Per Pax */}
                  <td className="p-3">
                    <div className="font-bold text-emerald-600">
                      ₹{parseFloat(pnr.cost_per_pax || 0).toLocaleString()}
                    </div>
                  </td>
                  
                  {/* Base Fare */}
                  <td className="p-3">
                    <div className="font-bold text-amber-600">
                      ₹{parseFloat(pnr.base_fare || 0).toLocaleString()}
                    </div>
                  </td>
                  
                  {/* Tax Value */}
                  <td className="p-3">
                    <div className="font-bold text-rose-600">
                      ₹{parseFloat(pnr.tax_value || 0).toLocaleString()}
                    </div>
                  </td>
                  
                  {/* Sale Fare */}
                  <td className="p-3">
                    <div className="font-bold text-sky-600">
                      ₹{parseFloat(pnr.sale_fare || 0).toLocaleString()}
                    </div>
                  </td>
                  
                  {/* Created Date */}
                  <td className="p-3 text-sky-700">
                    {formatDate(pnr.created_at)}
                  </td>
                  
                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => editPnr(pnr)}
                        className="p-2 hover:bg-sky-100 rounded transition-colors duration-200 border border-sky-200 bg-white" 
                        title="Edit PNR"
                      >
                        <Edit3 size={16} className="text-sky-600" />
                      </button>
                      
                      {/* Attach Passengers Button */}
                      <button 
                        onClick={() => openAttachPassengersModal(pnr)}
                        className="p-2 hover:bg-emerald-50 rounded transition-colors duration-200 border border-emerald-200 bg-white" 
                        title="Attach Passengers"
                      >
                        <Users size={16} className="text-emerald-600" />
                      </button>
                      
                      {/* Deactivate/Reactivate Button */}
                      {pnr.status === 'Active' ? (
                        <button 
                          onClick={() => handleDeactivatePnr(pnr)}
                          className="p-2 hover:bg-amber-50 rounded transition-colors duration-200 border border-amber-200 bg-white" 
                          title="Deactivate PNR"
                        >
                          <ShieldOff size={16} className="text-amber-600" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivatePnr(pnr)}
                          className="p-2 hover:bg-emerald-50 rounded transition-colors duration-200 border border-emerald-200 bg-white" 
                          title="Reactivate PNR"
                          disabled={deactivatingPnr}
                        >
                          <Shield size={16} className="text-emerald-600" />
                        </button>
                      )}

                      {/* Deactivation History */}
                      {pnr.status === 'Deactivated' && (
                        <button 
                          onClick={() => handleViewDeactivationHistory(pnr)}
                          className="p-2 hover:bg-violet-50 rounded transition-colors duration-200 border border-violet-200 bg-white" 
                          title="View Deactivation History"
                        >
                          <History size={16} className="text-violet-600" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => deletePnrHandler(pnr.id)}
                        className="p-2 hover:bg-rose-50 rounded transition-colors duration-200 border border-rose-200 bg-white" 
                        title="Delete PNR"
                      >
                        <Trash2 size={16} className="text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="14" className="py-8 px-4 text-center text-sky-600">
                {loadingPnr ? 'Loading...' : 'No PNR data available. Create your first PNR.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div> 
  </div>


      {/* PNR Creation/Edit Modal */}
      {isPnrModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto" style={{ fontSize: THEME.fontSize }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: THEME.secondary }}>
                {editingPnr ? '✏️ Edit PNR' : '➕ Create New PNR'}
              </h3>
              <button 
                onClick={() => {
                  setIsPnrModalOpen(false);
                  resetPnrForm();
                }}
                className="text-gray-400 hover:text-white text-2xl"
                style={{ color: THEME.secondary }}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic PNR Information */}
              <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <h4 className="font-semibold mb-4" style={{ color: THEME.secondary }}>Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>PNR Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., ABC123"
                      value={pnrForm.pnrNumber}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, pnrNumber: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>PNR Type</label>
                    <select 
                      value={pnrForm.pnrType}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, pnrType: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    >
                      <option value="Group">Group</option>
                      <option value="FIT">FIT</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Pax Count *</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Number of passengers"
                      value={pnrForm.totalPassengers}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, totalPassengers: parseInt(e.target.value) || 1 }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Attached Passengers</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={pnrForm.attachedPassengers?.length || 0}
                        className="flex-1 border border-white/10 rounded-lg px-3 py-2 bg-gray-600/30"
                        style={{ 
                          fontSize: THEME.fontSize,
                          color: THEME.secondary 
                        }}
                        disabled
                        readOnly
                      />
                      <button
                        onClick={openPassengerSelectionModal}
                        className="text-white px-3 py-2 rounded transition flex items-center gap-2"
                        style={{ 
                          backgroundColor: THEME.primary,
                          fontSize: THEME.fontSize 
                        }}
                      >
                        <Users size={14} />
                        Select
                      </button>
                      {pnrForm.attachedPassengers?.length > 0 && (
                        <button
                          onClick={clearAllAttachedPassengers}
                          className="text-white px-3 py-2 rounded transition flex items-center gap-2"
                          style={{ 
                            backgroundColor: '#ef4444',
                            fontSize: THEME.fontSize 
                          }}
                        >
                          <X size={14} />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="text-gray-400 mt-1">
                      {pnrForm.attachedPassengers?.length || 0} passengers attached
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Cost Per Pax *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={pnrForm.costPerPax}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, costPerPax: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Base Fare</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={pnrForm.baseFare}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, baseFare: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Tax Value</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={pnrForm.taxValue}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, taxValue: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Sale Fare</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={pnrForm.saleFare}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, saleFare: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Chair Type</label>
                    <select 
                      value={pnrForm.chairType}
                      onChange={(e) => setPnrForm(prev => ({ ...prev, chairType: e.target.value }))}
                      className="w-full border border-white/10 rounded-lg px-3 py-2"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        fontSize: THEME.fontSize,
                        color: THEME.secondary,
                        borderColor: '#2562ea33'
                      }}
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business</option>
                      <option value="First Class">First Class</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attached Passengers Display */}
              {pnrForm.attachedPassengers && pnrForm.attachedPassengers.length > 0 && (
                <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: THEME.secondary }}>Attached Passengers ({pnrForm.attachedPassengers.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pnrForm.attachedPassengers.map((passenger, index) => (
                      <div key={passenger.id || index} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: `${THEME.primary}20`, color: THEME.primary }}>
                              {passenger.pax_code || passenger.paxCode}
                            </div>
                            <div className="font-medium" style={{ color: THEME.secondary }}>
                              {passenger.guest_Full_Name || passenger.form_Full_Name || 'N/A'}
                            </div>
                            <div className="px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: passenger.pax_status === 'Boarded' ? '#10b98130' :
                                passenger.pax_status === 'Pending' ? '#f59e0b30' :
                                `${THEME.primary}30`,
                                color: passenger.pax_status === 'Boarded' ? '#10b981' :
                                passenger.pax_status === 'Pending' ? '#f59e0b' :
                                THEME.primary
                              }}
                            >
                              {passenger.pax_status || passenger.paxStatus || 'Pending'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachedPassenger(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Remove Passenger"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flight Details */}
              <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold" style={{ color: THEME.secondary }}>Flight Details</h4>
                  <button 
                    onClick={addFlightSegment}
                    className="text-white px-3 py-1 rounded transition"
                    style={{ 
                      backgroundColor: THEME.primary,
                      fontSize: THEME.fontSize 
                    }}
                  >
                    + Add Flight Segment
                  </button>
                </div>

                {pnrForm.flightSegments.map((segment, segmentIndex) => (
                  <div key={segmentIndex} className="rounded-lg p-4 mb-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium" style={{ color: THEME.secondary }}>Flight Segment {segmentIndex + 1}</h5>
                      {pnrForm.flightSegments.length > 1 && (
                        <button 
                          onClick={() => removeFlightSegment(segmentIndex)}
                          className="text-red-400 hover:text-red-300"
                          style={{ fontSize: THEME.fontSize }}
                        >
                          Remove Segment
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Flight Number *</label>
                        <input 
                          type="text" 
                          placeholder="e.g., AI-201"
                          value={segment.flightNumber}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'flightNumber', e.target.value)}
                          className="w-full border border-white/10 rounded-lg px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary,
                            borderColor: '#2562ea33'
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>Date *</label>
                        <input 
                          type="date" 
                          value={segment.departureDate}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'departureDate', e.target.value)}
                          className="w-full border border-white/10 rounded-lg px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary,
                            borderColor: '#2562ea33'
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>From Airport *</label>
                        <select 
                          value={segment.fromAirport}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'fromAirport', e.target.value)}
                          className="w-full border border-white/10 rounded-lg px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary,
                            borderColor: '#2562ea33'
                          }}
                          required
                        >
                          <option value="">Select Airport</option>
                          <option value="DEL">Delhi (DEL)</option>
                          <option value="BOM">Mumbai (BOM)</option>
                          <option value="CCU">Kolkata (CCU)</option>
                          <option value="MAA">Chennai (MAA)</option>
                          <option value="BLR">Bangalore (BLR)</option>
                          <option value="DXB">Dubai (DXB)</option>
                          <option value="LHR">London (LHR)</option>
                          <option value="SIN">Singapore (SIN)</option>
                          <option value="BKK">Bangkok (BKK)</option>
                          <option value="JFK">New York (JFK)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-300 mb-1 block" style={{ color: THEME.secondary }}>To Airport *</label>
                        <select 
                          value={segment.toAirport}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'toAirport', e.target.value)}
                          className="w-full border border-white/10 rounded-lg px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary,
                            borderColor: '#2562ea33'
                          }}
                          required
                        >
                          <option value="">Select Airport</option>
                          <option value="DEL">Delhi (DEL)</option>
                          <option value="BOM">Mumbai (BOM)</option>
                          <option value="CCU">Kolkata (CCU)</option>
                          <option value="MAA">Chennai (MAA)</option>
                          <option value="BLR">Bangalore (BLR)</option>
                          <option value="DXB">Dubai (DXB)</option>
                          <option value="LHR">London (LHR)</option>
                          <option value="SIN">Singapore (SIN)</option>
                          <option value="BKK">Bangkok (BKK)</option>
                          <option value="JFK">New York (JFK)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-gray-400">
                      <div>
                        <label className="text-gray-400 mb-1 block">DEP Time</label>
                        <input
                          type="time"
                          value={segment.departureTime}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'departureTime', e.target.value)}
                          className="w-full border border-gray-500/30 rounded px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.3)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary 
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 mb-1 block">ARV Date</label>
                        <input
                          type="date"
                          value={segment.arrivalDate}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'arrivalDate', e.target.value)}
                          className="w-full border border-gray-500/30 rounded px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.3)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary 
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 mb-1 block">ARV Time</label>
                        <input
                          type="time"
                          value={segment.arrivalTime}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'arrivalTime', e.target.value)}
                          className="w-full border border-gray-500/30 rounded px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.3)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary 
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 mb-1 block">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g., 2h 30m"
                          value={segment.duration}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'duration', e.target.value)}
                          className="w-full border border-gray-500/30 rounded px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.3)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary 
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 mb-1 block">DEP Terminal</label>
                        <input
                          type="text"
                          placeholder="e.g., T1"
                          value={segment.depTerminal}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'depTerminal', e.target.value)}
                          className="w-full border border-gray-500/30 rounded px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.3)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary 
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 mb-1 block">ARV Terminal</label>
                        <input
                          type="text"
                          placeholder="e.g., T2"
                          value={segment.arvTerminal}
                          onChange={(e) => updateFlightSegment(segmentIndex, 'arvTerminal', e.target.value)}
                          className="w-full border border-gray-500/30 rounded px-3 py-2"
                          style={{ 
                            backgroundColor: 'rgba(107, 114, 128, 0.3)',
                            fontSize: THEME.fontSize,
                            color: THEME.secondary 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button 
                  onClick={() => {
                    setIsPnrModalOpen(false);
                    resetPnrForm();
                  }}
                  className="flex-1 hover:bg-white/20 py-3 rounded-lg transition"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: THEME.secondary 
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={savePnr}
                  className="flex-1 hover:bg-green-600 py-3 rounded-lg transition flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: THEME.primary,
                    color: THEME.secondary 
                  }}
                >
                  <Ticket size={16} />
                  {editingPnr ? 'Update PNR' : 'Create PNR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passenger Selection Modal */}
      <PassengerSelectionModal 
        isOpen={isPassengerSelectionModalOpen}
        onClose={closePassengerSelectionModal}
        onPassengersSelected={handlePassengersSelected}
        selectedPassengers={pnrForm.attachedPassengers || []}
        pnrPassengerLimit={pnrForm.totalPassengers}
        passengers={passengers}
        pnrFlightSegments={pnrForm.flightSegments.filter(seg => seg.fromAirport && seg.toAirport)}
        journeys={journeys}
      />

      {/* Attach Passengers Modal for Existing PNR */}
      {isAttachPassengersModalOpen && selectedPnrForAttachment && (
        <PassengerSelectionModal 
          onClose={closeAttachPassengersModal}
          onPassengersSelected={handleExistingPnrPassengersSelected}
          selectedPassengers={getAttachedPassengers(selectedPnrForAttachment.pnr_number)}
          pnrPassengerLimit={selectedPnrForAttachment.pax_count}
          isExistingPnr={true}
          pnr={selectedPnrForAttachment}
          passengers={passengers}
          pnrFlightSegments={selectedPnrForAttachment.flight_segments?.map(seg => ({
            fromAirport: seg.from_airport,
            toAirport: seg.to_airport,
            flightNumber: seg.flight_number
          })) || []}
          journeys={journeys}
        />
      )}

      {/* Deactivate PNR Modal */}
      <DeactivatePnrModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setSelectedPnrForDeactivation(null);
        }}
        pnr={selectedPnrForDeactivation}
        onDeactivate={confirmDeactivatePnr}
        deactivationForm={deactivationForm}
        setDeactivationForm={setDeactivationForm}
        deactivating={deactivatingPnr}
      />

      {/* PNR Assignment Modal */}
      <PnrAssignmentModal
        isOpen={isPnrAssignmentModalOpen}
        onClose={() => {
          setIsPnrAssignmentModalOpen(false);
          setSelectedPassengerForPnr(null);
        }}
        passenger={selectedPassengerForPnr}
        onAssignPnr={handleAssignPnrToPassenger}
        assignedPnrs={selectedPassengerForPnr ? assignedPnrs[selectedPassengerForPnr.paxCode] || [] : []}
      />

      {/* PNR Removal Modal */}
      <PnrRemovalModal
        isOpen={isPnrRemovalModalOpen}
        onClose={() => {
          setIsPnrRemovalModalOpen(false);
          setSelectedPassengerForPnrRemoval(null);
        }}
        passenger={selectedPassengerForPnrRemoval}
        onRemovePnr={handleRemovePnrFromPassenger}
        assignedPnrs={selectedPassengerForPnrRemoval ? assignedPnrs[selectedPassengerForPnrRemoval.paxCode] || [] : []}
      />
    </div>
  );
};

export default PNRListing;