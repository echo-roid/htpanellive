import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Save,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit3,
  Plane,
  Copy,
  Users,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  File,
  Eye,
  Download,
  Database,
  Plus,
  MoreVertical
} from 'lucide-react';

const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';

// Safe array access helper
const safeArray = (array) => Array.isArray(array) ? array : [];

export default function PassengerListPage() {
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  
  // Passenger API States
  const [passengers, setPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [passengerError, setPassengerError] = useState(null);
  
  // Flight Connection API States
  const [journeys, setJourneys] = useState([]);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [journeyError, setJourneyError] = useState(null);

  // Guest List Headers Modal State
  const [isGuestHeadersModalOpen, setIsGuestHeadersModalOpen] = useState(false);
  const [guestListHeaders, setGuestListHeaders] = useState([]);
  const [selectedGuestHeaders, setSelectedGuestHeaders] = useState([]);
  const [guestListData, setGuestListData] = useState([]);
  const [paxListData, setPaxListData] = useState([]);

  // Form Selection States
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [forms, setForms] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Save Passengers Modal
  const [isSavePassengersModalOpen, setIsSavePassengersModalOpen] = useState(false);
  const [savingPassengers, setSavingPassengers] = useState(false);

  // New state for passenger journey assignments
  const [passengerJourneys, setPassengerJourneys] = useState({});
  const [isAssigningJourney, setIsAssigningJourney] = useState(false);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);

  // API states for passenger management
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
    sortOrder: 'ASC'
  });

  // Safe value rendering helper
  const renderTableCell = (value) => {
    if (value === undefined || value === null || value === 'N/A') {
      return <span className="text-gray-500">-</span>;
    }
    
    if (typeof value === 'object' && value !== null) {
      try {
        const stringValue = JSON.stringify(value);
        return (
          <span className="text-sm text-gray-600" title={stringValue}>
            {stringValue.length > 30 ? stringValue.substring(0, 30) + '...' : stringValue}
          </span>
        );
      } catch (error) {
        return <span className="text-sm text-red-500">Invalid data</span>;
      }
    }
    
    if (Array.isArray(value)) {
      const stringValue = value.join(', ');
      return (
        <span className="text-sm text-gray-600" title={stringValue}>
          {stringValue.length > 30 ? stringValue.substring(0, 30) + '...' : stringValue}
        </span>
      );
    }
    
    const stringValue = String(value);
    return (
      <span className="text-sm text-gray-600" title={stringValue}>
        {stringValue.length > 30 ? stringValue.substring(0, 30) + '...' : stringValue}
      </span>
    );
  };

  // Get passenger display value
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

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPassengersData(newPage, filters);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchPassengersData(1, updatedFilters);
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    handleFilterChange({ search: searchTerm });
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    handleFilterChange({ status: status || '' });
  };

  // Handle sort
  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    handleFilterChange({ sortBy, sortOrder: newSortOrder });
  };

  // Handle journey assignment to passenger
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

      const response = await updatePassenger(passengerId, passengerData);
      
      if (response.success) {
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
      } else {
        throw new Error(response.message || 'Failed to assign journey');
      }
    } catch (error) {
      console.error('Error assigning journey:', error);
      alert('Failed to assign journey. Please try again.');
      await fetchPassengersData(pagination.page, filters);
    } finally {
      setIsAssigningJourney(false);
    }
  };

  // Get journey display name
  const getJourneyDisplayName = (journey) => {
    if (!journey || !safeArray(journey.connections).length) return 'Unknown Journey';
    
    const connections = safeArray(journey.connections);
    const firstLeg = connections[0];
    const lastLeg = connections[connections.length - 1];
    
    return `${firstLeg.from_airport} → ${lastLeg.to_airport}`;
  };

  // Classic Table Row Component
  const ClassicTableRow = ({ passenger, selectedGuestHeadersList, selectedFormFieldsList }) => {
    const passengerJourneyId = passengerJourneys[passenger.id] || passenger.journey_id;

    const handleJourneyChange = async (event) => {
      const newJourneyId = event.target.value || null;
      
      if (passenger.id) {
        await assignJourneyToPassenger(passenger.id, newJourneyId);
      } else {
        setPassengerJourneys(prev => ({
          ...prev,
          [passenger.paxCode]: newJourneyId
        }));
        
        setPaxListData(prev => 
          prev.map(p => 
            p.paxCode === passenger.paxCode 
              ? { ...p, journey_id: newJourneyId }
              : p
          )
        );
      }
    };

    const assignedJourney = journeys.find(j => j.journey_id === passengerJourneyId);

    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        {/* Pax Code */}
        <td className="px-4 py-3">
          <div className="font-medium text-gray-900 text-sm">
            {passenger.paxCode || '-'}
          </div>
        </td>
        
        {/* Journey Assignment */}
        <td className="px-4 py-3">
          <div className="relative">
            <select
              value={passengerJourneyId || ''}
              onChange={handleJourneyChange}
              disabled={isAssigningJourney || journeys.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Journey</option>
              {journeys.map(journey => (
                <option key={journey.journey_id} value={journey.journey_id}>
                  {getJourneyDisplayName(journey)}
                </option>
              ))}
            </select>
            
            {assignedJourney && !isAssigningJourney && (
              <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Plane size={10} />
                <span>Assigned</span>
              </div>
            )}
          </div>
        </td>
        
        {/* Dynamic Guest List Data */}
        {selectedGuestHeadersList.map(header => {
          const value = getPassengerDisplayValue(passenger, header.originalKey);
          return (
            <td key={header.id} className="px-4 py-3">
              {renderTableCell(value)}
            </td>
          );
        })}
        
        {/* Dynamic Form Data */}
        {selectedFormFieldsList.map(field => {
          const value = getPassengerDisplayValue(passenger, field.originalKey);
          return (
            <td key={field.id} className="px-4 py-3">
              {renderTableCell(value)}
            </td>
          );
        })}
        
        {/* Status */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            passenger.paxStatus === 'Boarded' ? 'bg-green-100 text-green-800' :
            passenger.paxStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            passenger.paxStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {passenger.paxStatus || 'Pending'}
          </span>
        </td>
        
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button 
              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
              title="Edit"
              onClick={() => {
                console.log('Edit passenger:', passenger);
              }}
            >
              <Edit3 size={16} />
            </button>
            <button 
              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
              title="Save to Database"
              onClick={async () => {
                try {
                  await saveIndividualPassenger(passenger);
                } catch (error) {
                  // Error handled in the function
                }
              }}
            >
              <Save size={16} />
            </button>
            <button 
              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
              title="Delete"
              onClick={() => deletePassengerHandler(passenger.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Passenger API functions
  const createPassenger = async (passengerData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paxlist`, passengerData);
      return response.data;
    } catch (error) {
      console.error('Error creating passenger:', error);
      throw error;
    }
  };

  const createMultiplePassengers = async (passengersData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paxlist/bulk`, passengersData);
      return response.data;
    } catch (error) {
      console.error('Error creating multiple passengers:', error);
      throw error;
    }
  };

  const fetchPassengers = async (leadId, page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await axios.get(`${API_BASE_URL}/paxlist/lead/${leadId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching passengers:', error);
      throw error;
    }
  };

  const updatePassenger = async (passengerId, passengerData) => {
    try {
      if (!passengerId || !leadId) {
        throw new Error('Passenger ID and Lead ID are required');
      }

      const response = await axios.put(
        `${API_BASE_URL}/paxlist/${passengerId}/lead/${leadId}`, 
        passengerData
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating passenger:', error);
      throw error;
    }
  };

  const deletePassenger = async (passengerId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/paxlist/${passengerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting passenger:', error);
      throw error;
    }
  };

  // Fetch passengers data
  const fetchPassengersData = async (page = 1, filters = {}) => {
    if (!leadId) return;

    try {
      setLoadingPassengers(true);
      setPassengerError(null);
      
      const response = await fetchPassengers(leadId, page, pagination.limit, filters);
      
      if (response.success) {
        setPassengers(response.passengers || []);
        setPagination({
          page: response.page || page,
          limit: response.limit || pagination.limit,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNext || false,
          hasPrev: response.hasPrev || false
        });

        if (response.passengers && response.passengers.length > 0) {
          const transformedPassengers = response.passengers.map(passenger => {
            try {
              const guestData = typeof passenger.guest_data === 'string' 
                ? JSON.parse(passenger.guest_data || '{}')
                : passenger.guest_data || {};
              
              const formData = typeof passenger.form_data === 'string'
                ? JSON.parse(passenger.form_data || '{}')
                : passenger.form_data || {};

              const transformedPassenger = {
                id: passenger.id,
                paxCode: passenger.pax_code,
                paxStatus: passenger.pax_status,
                journey_id: passenger.journey_id,
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
              console.error('Error transforming passenger:', error);
              return {
                id: passenger.id,
                paxCode: passenger.pax_code,
                paxStatus: passenger.pax_status,
                journey_id: passenger.journey_id,
                createdAt: passenger.created_at,
                updatedAt: passenger.updated_at,
                guest_data: {},
                form_data: {}
              };
            }
          });
          
          setPaxListData(transformedPassengers);
          
          const initialJourneys = {};
          transformedPassengers.forEach(passenger => {
            if (passenger.journey_id) {
              initialJourneys[passenger.id] = passenger.journey_id;
            }
          });
          setPassengerJourneys(initialJourneys);
        } else {
          setPaxListData([]);
          setPassengerJourneys({});
        }
      } else {
        setPassengers([]);
        setPaxListData([]);
        setPassengerJourneys({});
        setPassengerError(response.message || 'Failed to fetch passengers');
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
      setPassengers([]);
      setPaxListData([]);
      setPassengerJourneys({});
      setPassengerError('Failed to load passengers. Please try again.');
    } finally {
      setLoadingPassengers(false);
    }
  };

  // Save individual passenger
  const saveIndividualPassenger = async (passenger) => {
    try {
      const guest_data = {};
      const form_data = {};
      
      Object.keys(passenger).forEach(key => {
        if (key.startsWith('guest_')) {
          const guestKey = key.replace('guest_', '');
          guest_data[guestKey] = passenger[key];
        } else if (key.startsWith('form_')) {
          const formKey = key.replace('form_', '');
          form_data[formKey] = passenger[key];
        } else if (!['paxCode', 'paxStatus', 'id', 'createdAt', 'updatedAt', 'guest_data', 'form_data', 'journey_id'].includes(key)) {
          form_data[key] = passenger[key];
        }
      });

      const passengerData = {
        lead_id: parseInt(leadId),
        pax_code: passenger.paxCode,
        guest_data: guest_data,
        form_data: form_data,
        pax_status: passenger.paxStatus || 'Pending',
        journey_id: passenger.journey_id || null
      };

      let response;
      if (passenger.id) {
        response = await updatePassenger(passenger.id, passengerData);
      } else {
        response = await createPassenger(passengerData);
      }

      if (response.success) {
        alert('Passenger saved successfully!');
        await fetchPassengersData(pagination.page, filters);
        return response;
      } else {
        throw new Error(response.message || 'Failed to save passenger');
      }
    } catch (error) {
      console.error('Error saving passenger:', error);
      alert('Failed to save passenger. Please try again.');
      throw error;
    }
  };

  // Delete passenger
  const deletePassengerHandler = async (passengerId) => {
    if (!passengerId || !window.confirm('Are you sure you want to delete this passenger?')) {
      return;
    }

    try {
      const response = await deletePassenger(passengerId);
      if (response.success) {
        alert('Passenger deleted successfully!');
        await fetchPassengersData(pagination.page, filters);
      } else {
        throw new Error(response.message || 'Failed to delete passenger');
      }
    } catch (error) {
      console.error('Error deleting passenger:', error);
      alert('Failed to delete passenger. Please try again.');
    }
  };

  // Save passengers to database
  const savePassengersToDatabase = async () => {
    try {
      setSavingPassengers(true);
      
      if (paxListData.length === 0) {
        alert('No passenger data to save');
        return;
      }

      const passengersData = {
        lead_id: parseInt(leadId),
        passengers: paxListData.map(passenger => {
          const guest_data = {};
          const form_data = {};
          
          Object.keys(passenger).forEach(key => {
            if (key.startsWith('guest_')) {
              const guestKey = key.replace('guest_', '');
              guest_data[guestKey] = passenger[key];
            } else if (key.startsWith('form_')) {
              const formKey = key.replace('form_', '');
              form_data[formKey] = passenger[key];
            } else if (!['paxCode', 'paxStatus', 'id', 'createdAt', 'updatedAt', 'guest_data', 'form_data', 'journey_id'].includes(key)) {
              form_data[key] = passenger[key];
            }
          });

          return {
            pax_code: passenger.paxCode,
            guest_data: guest_data,
            form_data: form_data,
            pax_status: passenger.paxStatus || 'Pending',
            journey_id: passenger.journey_id || null
          };
        })
      };

      const response = await createMultiplePassengers(passengersData);
      
      if (response.success) {
        alert(`Successfully saved ${response.passengers?.length || paxListData.length} passengers to database!`);
        setIsSavePassengersModalOpen(false);
        await fetchPassengersData(pagination.page, filters);
      } else {
        throw new Error(response.message || 'Failed to save passengers');
      }
    } catch (error) {
      console.error('Error saving passengers:', error);
      alert('Failed to save passengers. Please try again.');
    } finally {
      setSavingPassengers(false);
    }
  };

  // Fetch journeys
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

  // Fetch guest list data
  const fetchGuestListData = async () => {
    try {
      const { data: res } = await axios.get(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${leadId}/guestlist`
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

  // Fetch forms
  const fetchForms = async () => {
    try {
      setFormsLoading(true);
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/lead/${leadId}`);
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

  // Get all selected fields
  const getAllSelectedFields = () => {
    if (paxListData.length === 0) return [];
    
    const allFormKeys = new Set();
    paxListData.forEach(passenger => {
      Object.keys(passenger).forEach(key => {
        if (key.startsWith('form_')) {
          allFormKeys.add(key);
        }
      });
    });
    
    return Array.from(allFormKeys).map(key => ({
      id: key,
      label: key.replace('form_', '').replace(/_/g, ' ').toUpperCase(),
      originalKey: key
    }));
  };

  // Get all selected guest headers
  const getAllSelectedGuestHeaders = () => {
    if (paxListData.length === 0) return [];
    
    const allGuestKeys = new Set();
    paxListData.forEach(passenger => {
      Object.keys(passenger).forEach(key => {
        if (key.startsWith('guest_')) {
          allGuestKeys.add(key);
        }
      });
    });
    
    return Array.from(allGuestKeys).map(key => ({
      id: key,
      label: key.replace('guest_', ''),
      originalKey: key
    }));
  };

  // Clear data functions
  const clearGuestData = () => {
    const cleanedData = paxListData.map(passenger => {
      const cleanedPassenger = { ...passenger };
      Object.keys(cleanedPassenger).forEach(key => {
        if (key.startsWith('guest_')) {
          delete cleanedPassenger[key];
        }
      });
      return cleanedPassenger;
    });
    setPaxListData(cleanedData);
  };

  const clearFormData = () => {
    const cleanedData = paxListData.map(passenger => {
      const cleanedPassenger = { ...passenger };
      Object.keys(cleanedPassenger).forEach(key => {
        if (key.startsWith('form_')) {
          delete cleanedPassenger[key];
        }
      });
      return cleanedPassenger;
    });
    setPaxListData(cleanedData);
  };

  const clearAllData = () => {
    setPaxListData([]);
  };

  // Use effects
  useEffect(() => {
    if (isFormSelectorOpen && leadId) {
      fetchForms();
    }
  }, [isFormSelectorOpen, leadId]);

  useEffect(() => {
    if (leadId) {
      fetchJourneys();
      fetchPassengersData(1, filters);
      fetchGuestListData();
    }
  }, [leadId]);

  const selectedGuestHeadersList = getAllSelectedGuestHeaders();
  const selectedFormFieldsList = getAllSelectedFields();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        

        {/* Controls Card */}
        
        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
          
              <div className="text-sm text-gray-600">
                {pagination.total > 0 ? (
                  `Showing ${((pagination.page - 1) * pagination.limit) + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} entries`
                ) : (
                  'No passengers found'
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('pax_code')}>
                      Pax Code
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Plane size={14} />
                      Flight Journey
                    </div>
                  </th>
                  
                  {selectedGuestHeadersList.map(header => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header.label}
                    </th>
                  ))}
                  
                  {selectedFormFieldsList.map(field => (
                    <th key={field.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                  
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('pax_status')}>
                      Status
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingPassengers ? (
                  <tr>
                    <td colSpan={3 + selectedGuestHeadersList.length + selectedFormFieldsList.length + 1} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading passengers...</span>
                      </div>
                    </td>
                  </tr>
                ) : paxListData.length > 0 ? (
                  paxListData.map((passenger, index) => (
                    <ClassicTableRow 
                      key={passenger.id || index}
                      passenger={passenger}
                      selectedGuestHeadersList={selectedGuestHeadersList}
                      selectedFormFieldsList={selectedFormFieldsList}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={3 + selectedGuestHeadersList.length + selectedFormFieldsList.length + 1} className="px-4 py-8 text-center text-gray-500">
                      No passenger data available. Select guest list or form data to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 border text-sm rounded ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error States */}
        {passengerError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-800">{passengerError}</div>
              <button 
                onClick={() => fetchPassengersData(1, filters)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {journeyError && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Plane size={16} className="text-yellow-600" />
              <div className="text-yellow-800">{journeyError}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}