import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Settings, 
  Plane, 
  Users, 
  Ticket, 
  MapPin, 
  TrendingUp, 
  Globe, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Shield,
  Activity,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
  Bell,
  HelpCircle,
  LogOut,
  User
} from "lucide-react";
import axios from "axios";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import PNRListing from '../ui/PNRListing';
import PassengerListsPage from "../ui/PassengerListsPage";


const WORLD_MAP = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map colors only - orange and gray palette
const colors = [
  "#ea580c", // dark orange
  "#f97316", // orange
  "#fb923c", // light orange
  "#fdba74", // very light orange
  "#9ca3af", // gray-400
  "#6b7280", // gray-500
  "#4b5563", // gray-600
  "#374151", // gray-700
  "#f59e0b", // amber
  "#d97706", // dark amber
];

const safeArray = (array) => Array.isArray(array) ? array : [];

export default function TravelMap() {
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapType, setMapType] = useState("domestic");
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [selectedformid, setSelectedFormId] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [journeyError, setJourneyError] = useState(null);

  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [connectionForms, setConnectionForms] = useState([
    {
      flightNumber: '',
      fromAirport: '',
      toAirport: '',
      depTime: '',
      depDate: '',
      arvTime: '',
      arvDate: '',
      depTerminal: '',
      arvTerminal: ''
    }
  ]);

  const [guestListHeaders, setGuestListHeaders] = useState([]);
  const [guestListData, setGuestListData] = useState([]);
  const [paxListData, setPaxListData] = useState([]);

  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [forms, setForms] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [passengers, setPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [passengerError, setPassengerError] = useState(null);
  const [passengerJourneys, setPassengerJourneys] = useState({});
  const [pnrList, setPnrList] = useState([]);
  const [loadingPnr, setLoadingPnr] = useState(false);
  const [pnrError, setPnrError] = useState(null);

  const [ticketCostingApiData, setTicketCostingApiData] = useState([]);
  const [loadingTicketCosting, setLoadingTicketCosting] = useState(false);
  const [ticketCostingError, setTicketCostingError] = useState(null);
  const [ticketCostingPagination, setTicketCostingPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [ticketCostingFilters, setTicketCostingFilters] = useState({
    search: '',
    status: '',
    payment_status: ''
  });
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

  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [isPnrSearchOpen, setIsPnrSearchOpen] = useState(null);
  const [pnrSearchTerm, setPnrSearchTerm] = useState('');
  const [assignedPnrs, setAssignedPnrs] = useState({});
  const [bulkPnrAssignmentData, setBulkPnrAssignmentData] = useState({
    pnrNumber: '',
    passengerCodes: []
  });

  const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
  const [wonLead, setWonLead] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalAirports: 0,
    activePassengers: 0,
    pendingReconciliation: 23,
    totalCost: 45678,
    completedJourneys: 12,
    activeFlights: 8,
    revenue: 125430,
    satisfaction: 94
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      activity: "Flight DEL-MUM booked for 15 passengers",
      time: "2 hours ago",
      type: "booking",
      status: "completed",
      user: "John Smith"
    },
    {
      id: 2,
      activity: "Passenger John Doe checked in for BOM-DXB",
      time: "3 hours ago",
      type: "checkin",
      status: "completed",
      user: "System"
    },
    {
      id: 3,
      activity: "Ticket reconciliation in progress",
      time: "5 hours ago",
      type: "reconciliation",
      status: "pending",
      user: "Sarah Johnson"
    },
    {
      id: 4,
      activity: "New connection added: BOM-DXB-LHR",
      time: "6 hours ago",
      type: "connection",
      status: "completed",
      user: "Michael Chen"
    },
    {
      id: 5,
      activity: "Payment processing failed for 3 bookings",
      time: "7 hours ago",
      type: "payment",
      status: "failed",
      user: "System"
    },
    {
      id: 6,
      activity: "System maintenance completed successfully",
      time: "8 hours ago",
      type: "system",
      status: "completed",
      user: "Admin"
    }
  ]);

  const fetchWonLeadById = async (id) => {
    if (!id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/leads/won-leads/${leadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Won lead not found');
        }
        throw new Error('Failed to fetch won lead');
      }
      
      const data = await response.json();
      setWonLead(data?.leadType);
      setMapType(data?.domesticInternational);
    } catch (err) {
      console.error('Error fetching won lead:', err);
      setWonLead(null);
    } 
  };

  useEffect(() => {
    if (leadId) {
      fetchWonLeadById(leadId);
    }
  }, [leadId]);

  useEffect(() => {
    if (selectedPassengers.length > 0) {
      setBulkPnrAssignmentData(prev => ({
        ...prev,
        passengerCodes: selectedPassengers.map(p => p.paxCode || p.pax_code).filter(Boolean)
      }));
    }
  }, [selectedPassengers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPnrSearchOpen && !event.target.closest('.pnr-search-dropdown')) {
        setIsPnrSearchOpen(null);
        setPnrSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPnrSearchOpen]);

  const fetchTicketCostingByLead = async (page = 1, filters = {}) => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      const params = new URLSearchParams({
        page: page.toString(),
        limit: ticketCostingPagination.limit.toString(),
        ...cleanFilters
      });

      const response = await axios.get(`${API_BASE_URL}/ticket-costing/lead/${leadId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket costing:', error);
      throw error;
    }
  };

  const fetchTicketCostingData = async (page = 1, filters = {}) => {
    if (!leadId) return;

    try {
      setLoadingTicketCosting(true);
      setTicketCostingError(null);
      
      const response = await fetchTicketCostingByLead(page, filters);
      
      if (response.success) {
        setTicketCostingApiData(response.data || []);
        setTicketCostingPagination(response.pagination || {
          page: page,
          limit: 10,
          total: response.data?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setTicketCostingApiData([]);
        setTicketCostingError(response.message || 'Failed to fetch ticket costing data');
      }
    } catch (error) {
      console.error('Error fetching ticket costing data:', error);
      setTicketCostingApiData([]);
      setTicketCostingError('Failed to load ticket costing data. Please try again.');
    } finally {
      setLoadingTicketCosting(false);
    }
  };

  useEffect(() => {
    if (leadId && selectedTab === 'ticketCosting') {
      fetchTicketCostingData(1, ticketCostingFilters);
    }
  }, [leadId, selectedTab]);

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
        setPassengerError(response.message || 'Failed to fetch passengers');
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

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${91}/submissions`);
      
      if (res.data?.success && safeArray(res.data.submissions).length > 0) {
        const apiSubmissions = res.data.submissions;
        
        const airportData = [];
        
        apiSubmissions.forEach((submission) => {
          safeArray(submission.data).forEach(item => {
            if (item.type === 'nearest-airport' && item.value) {
              try {
                const airportValue = item.value;
                
                if (airportValue && airportValue.airportCode) {
                  airportData.push({
                    name: airportValue.selectedAirport || `${airportValue.airportCode} Airport`,
                    airport: airportValue.selectedAirport || `${airportValue.airportCode} Airport`,
                    airportCode: airportValue.airportCode,
                    value: 1,
                    coordinates: getCoordinatesByAirportCode(airportValue.airportCode),
                    address: airportValue.address,
                    distance: airportValue.distanceKm,
                    submissionId: submission.id
                  });
                }
              } catch (parseError) {
                console.warn('Failed to parse airport data:', item.value);
              }
            }
          });
        });

        setApiData(airportData);
        setDashboardStats(prev => ({
          ...prev,
          totalAirports: airportData.length,
          activePassengers: airportData.reduce((sum, item) => sum + (item.value || 0), 0)
        }));
      } else {
        setApiData([]);
        setError("No submissions found for this form.");
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError("Failed to fetch submissions. Please try again.");
      setApiData([]);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchFormSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      
      const submissionPromises = selectedForms.map(formId => 
        fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${formId}/submissions`).then(res => res.json())
      );

      const submissionsData = await Promise.all(submissionPromises);
      
      const approvedSubmissions = submissionsData.flatMap(data => 
        data.success ? data.submissions.filter(submission => 
          submission.qc_status === 'approved'
        ) : []
      );

      const rejectedSubmissions = submissionsData.flatMap(data => 
        data.success ? data.submissions.filter(submission => 
          submission.qc_status !== 'approved'
        ) : []
      );

      if (rejectedSubmissions.length > 0) {
        alert(`Note: ${rejectedSubmissions.length} submissions were filtered out because they are not approved. Only showing ${approvedSubmissions.length} approved submissions.`);
      }

      setAllSubmissions(approvedSubmissions);

      if (approvedSubmissions.length > 0) {
        const firstSubmission = approvedSubmissions[0];
        const allColumns = [];

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

        setAvailableColumns(allColumns);
        setIsFieldSelectorOpen(true);
      } else {
        alert('No approved submissions found for the selected forms. Please check if submissions have been approved.');
        setIsFieldSelectorOpen(false);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      alert('Failed to fetch approved submissions. Please try again.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const getCoordinatesByAirportCode = (code) => {
    const airportCoordinates = {
      'DEL': [77.1025, 28.5562],
      'BOM': [72.8656, 19.0896],
      'MAA': [80.1699, 12.9941],
      'BLR': [77.7064, 12.9494],
      'HYD': [78.4294, 17.2403],
      'CCU': [88.4467, 22.6547],
      'AMD': [72.6344, 23.0667],
      'GOI': [73.8313, 15.3800],
      'JAI': [75.8011, 26.8242],
      'LKO': [80.8893, 26.7606],
      'PNQ': [73.8553, 18.5822],
      'COK': [76.2730, 10.1520],
      'TRV': [76.9209, 8.4821],
      'IXC': [76.7885, 30.6736],
      'GAU': [91.5856, 26.1064],
      'DXB': [55.3657, 25.2532],
      'LHR': [-0.4543, 51.4700],
      'JFK': [-73.7781, 40.6413],
      'SIN': [103.9915, 1.3644],
    };
    return airportCoordinates[code] || [78.0, 22.0];
  };

  useEffect(() => {
    if (isFormSelectorOpen && leadId) {
      fetchForms();
    }
  }, [isFormSelectorOpen, leadId]);

  useEffect(() => {
    if (selectedForms.length > 0) {
      fetchFormSubmissions();
    }
  }, [selectedForms]);

  useEffect(() => {
    if (leadId && selectedTab === 'flightConnections') {
      fetchJourneys();
    }
  }, [leadId, selectedTab]);

  useEffect(() => {
    if (leadId) {
      fetchPassengersData(1, filters);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId && selectedTab === 'paxLists') {
      fetchJourneys();
    }
  }, [leadId, selectedTab]);

  useEffect(() => {
    if (leadId && selectedTab === 'pnrManagement') {
      fetchPnrList();
    }
  }, [leadId, selectedTab]);

  useEffect(() => {
    if (leadId && selectedTab === 'ticketCosting') {
      fetchPnrList();
    }
  }, [leadId, selectedTab]);

  useEffect(() => {
    fetchSubmissions();
    if (leadId) fetchGuestListData();
  }, [leadId]);

  const data = mapType === "Domestic" ? safeArray(apiData) : [
    {
      name: "Delhi",
      airport: "Indira Gandhi International Airport",
      airportCode: "DEL",
      coordinates: [77.1025, 28.5562],
      value: 4,
    },
    {
      name: "Mumbai",
      airport: "Chhatrapati Shivaji Maharaj International Airport",
      airportCode: "BOM",
      coordinates: [72.8656, 19.0896],
      value: 2,
    },
    {
      name: "Kolkata",
      airport: "Netaji Subhash Chandra Bose International Airport",
      airportCode: "CCU",
      coordinates: [88.4467, 22.6547],
      value: 3,
    },
  ];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
    { id: "paxLists", label: "Passenger Lists", icon: <Users size={16} /> },
    { id: "pnrManagement", label: "PNR Management", icon: <Ticket size={16} /> }
  ];

  const StatCard = ({ title, value, icon, color, change, subtitle, loading }) => (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '10px'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 mb-1.5 font-medium" style={{ fontSize: '10px' }}>{title}</p>
          {loading ? (
            <div className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              <span className="text-gray-400" style={{ fontSize: '10px' }}>Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-gray-800 font-bold" style={{ fontSize: '20px' }}>{value}</p>
              {subtitle && <p className="text-gray-400 mt-1" style={{ fontSize: '10px' }}>{subtitle}</p>}
            </>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`} style={{ fontSize: '10px' }}>
          {icon}
        </div>
      </div>
      {change && !loading && (
        <div className={`mt-3 px-2 py-1 rounded-full inline-block ${change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} style={{ fontSize: '10px' }}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </div>
      )}
    </motion.div>
  );

  const AirportCard = ({ place, isSelected, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer border transition-all duration-300 ${
        isSelected
          ? "bg-blue-50 border-blue-300"
          : "bg-white border-gray-200 hover:bg-gray-50"
      }`}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '10px'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Plane size={12} className="text-blue-600" />
          </div>
          <div>
            <h4 className="text-gray-800 font-bold" style={{ fontSize: '10px' }}>{place.name}</h4>
            <p className="text-gray-500" style={{ fontSize: '10px' }}>{place.airportCode}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold" style={{ fontSize: '10px' }}>
          {place.value} pax
        </span>
      </div>
      <p className="text-gray-600 mb-2 truncate" style={{ fontSize: '10px' }}>{place.airport}</p>
      {place.address && (
        <div className="flex items-center gap-1.5 text-gray-500 mb-1.5" style={{ fontSize: '10px' }}>
          <MapPin size={10} />
          <span className="truncate">{place.address}</span>
        </div>
      )}
      {place.distance && (
        <div className="text-green-600 font-medium flex items-center gap-1" style={{ fontSize: '10px' }}>
          <span>📏</span>
          <span>{place.distance} km away</span>
        </div>
      )}
    </motion.div>
  );

  const ActivityItem = ({ activity, time, type, status, user }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'failed': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-blue-100 text-blue-700 border-blue-200';
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'booking': return <Ticket size={12} />;
        case 'checkin': return <CheckCircle size={12} />;
        case 'reconciliation': return <AlertCircle size={12} />;
        case 'connection': return <Plane size={12} />;
        case 'payment': return <DollarSign size={12} />;
        case 'system': return <Activity size={12} />;
        default: return <Calendar size={12} />;
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-gray-100"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px'
        }}
      >
        <div className={`p-1.5 rounded-md ${getStatusColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-medium truncate" style={{ fontSize: '10px' }}>{activity}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-gray-500" style={{ fontSize: '10px' }}>
              <Clock size={10} />
              <span>{time}</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded-full ${getStatusColor()}`} style={{ fontSize: '10px' }}>
              {status}
            </span>
            <span className="text-gray-400 truncate" style={{ fontSize: '10px' }}>by {user}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const QuickActionButton = ({ icon, label, color, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-3 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 border ${color}`}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '10px'
      }}
    >
      <div className="p-1.5 rounded-md">
        {icon}
      </div>
      <span className="font-medium" style={{ fontSize: '10px' }}>{label}</span>
    </motion.button>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case "paxLists":
        return <PassengerListsPage setSelectedFormId={setSelectedFormId} />;

      case "pnrManagement":
        return (
          <PNRListing
            leadId={leadId}
            passengers={passengers}
            journeys={journeys}
            fetchPassengers={() => fetchPassengersData(pagination.page, filters)}
            fetchJourneys={fetchJourneys}
          />
        );

      case "dashboard":
        return (
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h1 className="text-gray-800 font-bold" style={{ fontSize: '20px' }}>
                  ✈️ Airport Management Dashboard
                </h1>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: '10px' }}>
                  Monitor and manage all airport operations in real-time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                 onClick={() =>
  navigate(
    `/operations/${mapType === "Domestic" ? "TravelHubList" : "InternationalHubList"}/${leadId}`,
    {
      state: { selectedformid },
    }
  )
}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 flex items-center gap-1.5 shadow-sm text-white"
                  style={{ fontSize: '10px' }}
                >
                  {mapType === "Domestic" ? <Building2 size={14} /> : <Globe size={14} />}
                  {mapType === "Domestic" ? "Domestic Hub" : "International Hub"}
                </button>
                <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 text-gray-600">
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-500" style={{ fontSize: '10px' }}>Loading airport data from submissions...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle size={14} />
                    <span className="text-red-700" style={{ fontSize: '10px' }}>{error}</span>
                  </div>
                  <button 
                    onClick={fetchSubmissions}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white transition flex items-center gap-1 text-xs"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Airports"
                value={dashboardStats.totalAirports}
                icon={<Building2 size={18} className="text-white" />}
                color="bg-blue-500"
                subtitle="Active locations"
                change={12}
                loading={loading}
              />
              <StatCard
                title="Active Passengers"
                value={dashboardStats.activePassengers}
                icon={<Users size={18} className="text-white" />}
                color="bg-green-500"
                subtitle="Currently traveling"
                change={8}
                loading={loading}
              />
              <StatCard
                title="Pending Tasks"
                value={dashboardStats.pendingReconciliation}
                icon={<AlertCircle size={18} className="text-white" />}
                color="bg-yellow-500"
                subtitle="Requires attention"
                change={-5}
                loading={loading}
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${dashboardStats.totalCost.toLocaleString()}`}
                icon={<DollarSign size={18} className="text-white" />}
                color="bg-purple-500"
                subtitle="Total earnings"
                change={15}
                loading={loading}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-gray-800 font-bold flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                        <Globe className="text-blue-600" size={18} />
                        {mapType === "Domestic" ? "🏠 Domestic Airports Map" : "🌏 International Airports Map"}
                      </h3>
                      <p className="text-gray-500" style={{ fontSize: '10px' }}>Interactive visualization of all airport locations</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-medium text-gray-700" style={{ fontSize: '10px' }}>
                        {safeArray(data).length} active locations
                      </span>
                    </div>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-gray-200 h-[400px]">
                    <ComposableMap 
                      projection="geoMercator" 
                      style={{ width: "100%", height: "100%" }}
                    >
                      <ZoomableGroup
                        center={mapType === "Domestic" ? [80, 22] : [78, 20]}
                        zoom={mapType === "Domestic" ? 3.8 : 2.5}
                      >
                        <Geographies geography={WORLD_MAP}>
                          {({ geographies }) =>
                            safeArray(geographies).map((geo, i) => (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={colors[i % colors.length]}
                                stroke="#ffffff"
                                strokeWidth={0.5}
                                style={{
                                  default: { outline: "none" },
                                  hover: { fill: "#ea580c", transition: "0.2s ease", cursor: "pointer" },
                                }}
                              />
                            ))
                          }
                        </Geographies>

                        {safeArray(data).map(({ name, coordinates, value, airportCode }) => (
                          <Marker key={name} coordinates={coordinates}>
                            <motion.g
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <circle
                                r={selectedPlace?.name === name ? 6 : 4}
                                fill={selectedPlace?.name === name ? "#ea580c" : "#f97316"}
                                stroke="#ffffff"
                                strokeWidth={selectedPlace?.name === name ? 1.5 : 1}
                                className="cursor-pointer hover:fill-[#ea580c] transition-all duration-300"
                                onClick={() => setSelectedPlace({ name, coordinates, value, airportCode })}
                              />
                              <text
                                textAnchor="middle"
                                y={-8}
                                style={{
                                  fontSize: "8px",
                                  fill: "#ffffff",
                                  fontWeight: "600",
                                  pointerEvents: "none",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                              >
                                {name}
                              </text>
                              <text
                                textAnchor="middle"
                                y={4}
                                style={{
                                  fontSize: "7px",
                                  fill: "#fdba74",
                                  fontWeight: "500",
                                  pointerEvents: "none",
                                }}
                              >
                                {airportCode} • {value} pax
                              </text>
                            </motion.g>
                          </Marker>
                        ))}
                      </ZoomableGroup>
                    </ComposableMap>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Airport List */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-800 font-bold flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                      <Plane size={16} className="text-blue-600" />
                      {mapType === "Domestic" ? "Domestic Airports" : "International Airports"}
                    </h3>
                    <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {safeArray(data).length} total
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {safeArray(data).length > 0 ? (
                      safeArray(data).map((place, idx) => (
                        <AirportCard
                          key={idx}
                          place={place}
                          isSelected={selectedPlace?.name === place.name}
                          onClick={() => setSelectedPlace(place)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Plane size={24} className="mx-auto mb-2 opacity-50" />
                        <p style={{ fontSize: '10px' }}>No airport data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-gray-800 font-bold mb-3" style={{ fontSize: '12px' }}>Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <QuickActionButton
                      icon={<Calendar size={14} className="text-blue-600" />}
                      label="Add Schedule"
                      color="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      onClick={() => console.log('Add Schedule')}
                    />
                    <QuickActionButton
                      icon={<Users size={14} className="text-green-600" />}
                      label="Manage Passengers"
                      color="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={() => setSelectedTab('paxLists')}
                    />
                    <QuickActionButton
                      icon={<Ticket size={14} className="text-purple-600" />}
                      label="Check PNR"
                      color="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                      onClick={() => setSelectedTab('pnrManagement')}
                    />
                    <QuickActionButton
  icon={<AlertCircle size={14} className="text-amber-600" />}
  label="View Alerts"
  color="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
  onClick={() => console.log('View Alerts')}
/>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-gray-800 font-bold flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                    <Activity size={18} className="text-blue-600" />
                    Recent Activity
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: '10px' }}>Latest updates from your system</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    Last 24 hours
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 transition text-xs">
                    View all →
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity.activity}
                    time={activity.time}
                    type={activity.type}
                    status={activity.status}
                    user={activity.user}
                  />
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-gray-800 font-bold mb-4" style={{ fontSize: '12px' }}>Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-800 font-bold mb-0.5" style={{ fontSize: '18px' }}>{dashboardStats.completedJourneys}</div>
                  <div className="text-gray-500 text-xs">Completed Journeys</div>
                  <div className="text-green-600 mt-1.5 text-xs">↑ 12% this week</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-800 font-bold mb-0.5" style={{ fontSize: '18px' }}>{dashboardStats.activeFlights}</div>
                  <div className="text-gray-500 text-xs">Active Flights</div>
                  <div className="text-green-600 mt-1.5 text-xs">↑ 5% today</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-800 font-bold mb-0.5" style={{ fontSize: '18px' }}>${(dashboardStats.revenue / 1000).toFixed(1)}k</div>
                  <div className="text-gray-500 text-xs">Revenue</div>
                  <div className="text-green-600 mt-1.5 text-xs">↑ 8% this month</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-800 font-bold mb-0.5" style={{ fontSize: '18px' }}>{dashboardStats.satisfaction}%</div>
                  <div className="text-gray-500 text-xs">Satisfaction</div>
                  <div className="text-green-600 mt-1.5 text-xs">↑ 3% this quarter</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h2 className="text-gray-800 font-bold mb-4" style={{ fontSize: '12px' }}>{tabs.find(tab => tab.id === selectedTab)?.label}</h2>
            <p className="text-gray-500" style={{ fontSize: '10px' }}>Content for {selectedTab} tab</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/operations/FlightBuilder/${leadId}`}>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plane size={20} className="text-blue-600" />
                </div>
              </Link>
              <div>
                <h1 className="text-gray-800 font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent" style={{ fontSize: '14px' }}>
                  ✈️ SkyHub Manager
                </h1>
                <p className="text-gray-500" style={{ fontSize: '10px' }}>Comprehensive Airport Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedTab(tab.id);
                      setSelectedPlace(null);
                    }}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-lg transition-all duration-300 font-medium ${
                      selectedTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                    style={{ fontSize: '10px' }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 text-gray-600">
                  <Bell size={16} />
                </button>
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 text-gray-600">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Tabs */}
          <div className="flex md:hidden items-center gap-2 mt-3 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  setSelectedPlace(null);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
                  selectedTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
                style={{ fontSize: '10px' }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className=" rounded-xl overflow-hidden "
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-6 mt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-gray-500" style={{ fontSize: '10px' }}>
          <div className="flex items-center gap-6">
            <span>© 2024 SkyHub Manager. All rights reserved.</span>
            <div className="hidden md:flex items-center gap-4">
              <a href="#" className="hover:text-gray-800 transition">Privacy</a>
              <a href="#" className="hover:text-gray-800 transition">Terms</a>
              <a href="#" className="hover:text-gray-800 transition">Support</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              System: Operational
            </span>
            <span>v2.1.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}