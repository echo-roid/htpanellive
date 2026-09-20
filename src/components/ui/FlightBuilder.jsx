import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Plane, 
  Clock, 
  DollarSign,
  MapPin,
  Users,
  Calendar,
  RefreshCw,
  Sliders,
  Check,
  Star,
  Shield,
  Navigation,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  Ticket,
  Plus,
  Trash2,
  Layers,
  Edit,
  Map,
  Briefcase,
  Globe,
  Info,
  Sparkles,
  Zap,
  TrendingUp,
  Crown,
  Brain,
  Columns,
  Grid,
  List,
  Eye,
  EyeOff,
  History,
  Package,
  Archive,
  CalendarDays,
  FileText,
  ExternalLink,
  ChevronRight,
  Download,
  Share2,
  Copy,
  MoreVertical,
  BarChart3,
  PieChart,
  FilterX,
  CalendarClock,
  Route,
  Navigation as NavigationIcon,
  Building,
  Home,
  MapPinned,
  Target,
  Compass,
  User,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Hash,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Shield as ShieldIcon,
  CheckSquare,
  Square,
  Users as UsersIcon,
  CreditCard,
  Tag,
  Globe as GlobeIcon,
  Database,
  Server,
  Activity,
  UserPlus,
  ClipboardList,
  FileBarChart,
  Target as TargetIcon,
  Navigation2,
  Layers as LayersIcon,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart
} from 'lucide-react';
import { useParams,Link } from 'react-router-dom';



// Helper function to get airport names
const getAirportName = (code) => {
  const airportNames = {
    "DXB": "Dubai International Airport",
    "AUH": "Abu Dhabi International Airport",
    "DOH": "Hamad International Airport",
    "SIN": "Singapore Changi Airport",
    "BKK": "Suvarnabhumi Airport",
    "HKG": "Hong Kong International Airport",
    "FRA": "Frankfurt Airport",
    "LHR": "London Heathrow Airport",
    "CDG": "Charles de Gaulle Airport",
    "AMS": "Amsterdam Airport Schiphol",
    "IST": "Istanbul Airport",
    "JFK": "John F. Kennedy International Airport",
    "DEL": "Indira Gandhi International Airport",
    "BOM": "Chhatrapati Shivaji Maharaj International Airport",
    "BLR": "Kempegowda International Airport",
    "MAA": "Chennai International Airport",
    "HYD": "Rajiv Gandhi International Airport",
    "CCU": "Netaji Subhas Chandra Bose International Airport",
    "AMD": "Sardar Vallabhbhai Patel International Airport",
    "GOI": "Dabolim Airport",
    "VNS": "Lal Bahadur Shastri International Airport",
    "NRT": "Narita International Airport",
    "SYD": "Sydney Kingsford Smith Airport",
    "YYZ": "Toronto Pearson International Airport",
    "LAX": "Los Angeles International Airport",
    "ORD": "O'Hare International Airport",
    "RUH": "King Khalid International Airport"
  };
  return airportNames[code] || code;
};

// Helper function to calculate journey stats
const calculateJourneyStats = (journeys) => {
  const stats = {
    totalJourneys: journeys.length,
    totalFlights: 0,
    totalPrice: 0,
    averageLegs: 0,
    recentJourneys: 0
  };

  journeys.forEach(journey => {
    stats.totalFlights += journey.length;
    stats.averageLegs += journey.length;
    
    // Count recent journeys (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    journey.forEach(flight => {
      const flightDate = new Date(flight.created_at);
      if (flightDate > lastWeek) {
        stats.recentJourneys++;
      }
    });
  });

  stats.averageLegs = journeys.length > 0 ? (stats.averageLegs / journeys.length).toFixed(1) : 0;

  return stats;
};

const FlightListingPage = () => {
  // Flight Data States
  const { id: leadID } = useParams();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  // Add this with your other state declarations
const [showJourneySummaryPopup, setShowJourneySummaryPopup] = useState(false);
  // Submitted Journeys State
  const [submittedJourneys, setSubmittedJourneys] = useState([]);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [journeysError, setJourneysError] = useState(null);
  const [journeyStats, setJourneyStats] = useState({
    totalJourneys: 0,
    totalFlights: 0,
    averageLegs: 0,
    recentJourneys: 0
  });
  // Add this with your other state declarations (around line 150-200)
const [activeGroupTab, setActiveGroupTab] = useState('all');
  // Travel Hubs State
  const [travelHubs, setTravelHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [hubsError, setHubsError] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);
  const [showHubsList, setShowHubsList] = useState(false);
  
  
  // Multi-Leg Journey States
  const [journeyLegs, setJourneyLegs] = useState([
    {
      id: 1,
      name: 'Leg 1',
      flights: [],
      searchParams: {
        from: 'BOM',
        to: 'LHR',
        date: new Date().toISOString().split('T')[0],
        return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        trip_type: 'one-way'
      },
      isEditing: true,
      isComplete: false,
      flightsData: [],
      filteredFlights: [],
      suggestedFlights: [],
      filters: {
        airlines: [],
        stops: [],
        departureTimeSlots: [],
        arrivalTimeSlots: [],
        priceRange: [0, 50000],
        durationRange: [0, 1440],
        layoverAirports: [],
        minLayoverDuration: 0,
        maxLayoverDuration: 480,
        aircraft: [],
        nearbyAirports: false
      },
      expandedSections: {
        airlines: true,
        stops: true,
        departureTime: true,
        arrivalTime: true,
        price: true,
        duration: true,
        aircraft: true,
        layoverAirports: true,
        layoverDuration: true
      },
      filterOptions: {
        airlines: [],
        stops: [0, 1, 2, 3],
        departureSlots: [],
        arrivalSlots: [],
        layoverAirports: [],
        aircraft: []
      },
      sortBy: 'price',
      loading: false,
      error: null,
      activeFiltersCount: 0
    },
    {
      id: 2,
      name: 'Leg 2',
      flights: [],
      searchParams: {
        from: 'LHR',
        to: 'CDG',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        return_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        trip_type: 'one-way'
      },
      isEditing: false,
      isComplete: false,
      flightsData: [],
      filteredFlights: [],
      suggestedFlights: [],
      filters: {
        airlines: [],
        stops: [],
        departureTimeSlots: [],
        arrivalTimeSlots: [],
        priceRange: [0, 50000],
        durationRange: [0, 1440],
        layoverAirports: [],
        minLayoverDuration: 0,
        maxLayoverDuration: 480,
        aircraft: [],
        nearbyAirports: false
      },
      expandedSections: {
        airlines: true,
        stops: true,
        departureTime: true,
        arrivalTime: true,
        price: true,
        duration: true,
        aircraft: true,
        layoverAirports: true,
        layoverDuration: true
      },
      filterOptions: {
        airlines: [],
        stops: [0, 1, 2, 3],
        departureSlots: [],
        arrivalSlots: [],
        layoverAirports: [],
        aircraft: []
      },
      sortBy: 'price',
      loading: false,
      error: null,
      activeFiltersCount: 0
    }
  ]);
  
  const [currentLeg, setCurrentLeg] = useState(0);
  const [searchMode, setSearchMode] = useState('new');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [error, setError] = useState(null);
  const [showJourneyMap, setShowJourneyMap] = useState(false);
  const [viewMode, setViewMode] = useState('compare'); // 'compare', 'single', 'stacked'
  const [visibleLegs, setVisibleLegs] = useState([0, 1]); // Which legs are visible in compare view
  
  // Submitted Journeys View State
  const [showSubmittedJourneys, setShowSubmittedJourneys] = useState(false);
  const [expandedJourneyId, setExpandedJourneyId] = useState(null);
  const [journeysFilter, setJourneysFilter] = useState('all'); // 'all', 'recent', 'multi-leg', 'hub'
  
  // Passenger Data States
  const [passengerData, setPassengerData] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [passengersError, setPassengersError] = useState(null);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [expandedPassengerId, setExpandedPassengerId] = useState(null);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  
  // PNR Creation States
  const [showPnrCreation, setShowPnrCreation] = useState(false);
  const [selectedConnectionForPnr, setSelectedConnectionForPnr] = useState(null);
  const [pnrCreationData, setPnrCreationData] = useState({
    pnr_number: '',
    pnr_type: 'individual', // 'individual', 'group'
    pax_count: 1,
    assign_pax_count: 1,
    cost_per_pax: 0,
    base_fare: 0,
    tax_value: 0,
    sale_fare: 0,
    chair_type: 'Economy', // 'Economy', 'Business', 'First'
    lead_id: leadID,
    flight_segments: [],
    selected_passengers: [],
    selected_flight_ids: []
  });
  const [creatingPnr, setCreatingPnr] = useState(false);
  const [pnrCreationStatus, setPnrCreationStatus] = useState({ type: '', message: '' });
  
  // =================== VENDOR SELECTION STATES ===================
  const [availableFlightVendors, setAvailableFlightVendors] = useState([]);
  const [selectedVendorForPnr, setSelectedVendorForPnr] = useState(null);
  const [showVendorSelection, setShowVendorSelection] = useState(false);
  
  // Search Params (for single view)
  const [searchParams, setSearchParams] = useState({
    from: 'BOM',
    to: 'LHR',
    date: new Date().toISOString().split('T')[0],
    return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    trip_type: 'one-way'
  });
  
  // Filter States (for single view)


  const timeSlots = [
    { id: 'morning', label: 'Morning', range: [0, 11], color: 'bg-orange-50 border-orange-100 text-orange-800' },
    { id: 'afternoon', label: 'Afternoon', range: [11, 16], color: 'bg-yellow-50 border-yellow-100 text-yellow-800' },
    { id: 'evening', label: 'Evening', range: [16, 20], color: 'bg-purple-50 border-purple-100 text-purple-800' },
    { id: 'night', label: 'Night', range: [20, 24], color: 'bg-blue-50 border-blue-100 text-blue-800' }
  ];

  // =================== SUGGESTION REASONS ===================

  const suggestionReasons = [
    {
      title: "Best Overall Value",
      description: "Perfect balance of price, duration, and convenience",
      icon: <Crown className="w-4 h-4" />,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Fastest Journey",
      description: "Shortest total travel time with optimal schedule",
      icon: <Zap className="w-4 h-4" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Most Economical",
      description: "Lowest price with good travel experience",
      icon: <DollarSign className="w-4 h-4" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Premium Experience",
      description: "Best airline reputation and comfort",
      icon: <Star className="w-4 h-4" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Smart Choice",
      description: "Great balance of all factors",
      icon: <Brain className="w-4 h-4" />,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  // =================== API BASE URL ===================

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://tableware-dweeb-estate.ngrok-free.dev/api';

  // =================== FORMATTING FUNCTIONS ===================



  // =================== FLIGHT CONTINUITY VALIDATION ===================

const validateFlightContinuity = (selectedFlights) => {
  if (!selectedFlights || selectedFlights.length < 2) {
    return { isValid: true, message: '' };
  }
  
  // Sort flights by departure date/time
  const sortedFlights = [...selectedFlights].sort((a, b) => {
    const dateA = new Date(`${a.dep_date || a.departure_date}T${a.dep_time || a.departure_time}`);
    const dateB = new Date(`${b.dep_date || b.departure_date}T${b.dep_time || b.departure_time}`);
    return dateA - dateB;
  });
  
  const issues = [];
  
  for (let i = 0; i < sortedFlights.length - 1; i++) {
    const currentFlight = sortedFlights[i];
    const nextFlight = sortedFlights[i + 1];
    
    const currentArrival = currentFlight.to_airport || currentFlight.arrival_airport;
    const nextDeparture = nextFlight.from_airport || nextFlight.departure_airport;
    
    if (currentArrival !== nextDeparture) {
      issues.push({
        position: i + 1,
        currentFlight: {
          number: currentFlight.flight_number,
          from: currentFlight.from_airport || currentFlight.departure_airport,
          to: currentArrival
        },
        nextFlight: {
          number: nextFlight.flight_number,
          from: nextDeparture,
          to: nextFlight.to_airport || nextFlight.arrival_airport
        },
        message: `❌ Flight ${i + 1} arrives at ${currentArrival}, but Flight ${i + 2} departs from ${nextDeparture}`
      });
    }
  }
  
  if (issues.length > 0) {
    return {
      isValid: false,
      message: `Journey has ${issues.length} gap${issues.length > 1 ? 's' : ''} in continuity`,
      issues: issues,
      validPattern: 'A→B, B→C, C→D, D→E...',
      suggestedFix: 'Ensure each flight arrives at the airport where the next flight departs from'
    };
  }
  
  return {
    isValid: true,
    message: '✓ All flights are properly connected',
    route: sortedFlights.map(f => f.from_airport || f.departure_airport).join(' → ') + 
           ' → ' + sortedFlights[sortedFlights.length - 1].to_airport
  };
};
  
  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatDisplayTime = (timeString) => {
    if (!timeString) return 'N/A';
    // If time string is in HH:MM:SS format, extract HH:MM
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
    }
    return timeString;
  };


  const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return '0h 0m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};




  // Format duration - SIMPLIFIED VERSION
  const calculateFlightDuration = (depTimeStr, arrTimeStr, depDateStr, arrDateStr) => {
    try {
      // Simple calculation - just show mock duration for demo
      const parseTime = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 };
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
        }
        return { hours: 0, minutes: 0 };
      };

      const dep = parseTime(depTimeStr);
      const arr = parseTime(arrTimeStr);
      
      let hours = arr.hours - dep.hours;
      let minutes = arr.minutes - dep.minutes;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24;
      }
      
      // Ensure minimum duration
      hours = Math.max(1, hours);
      minutes = Math.max(0, minutes);
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '3h 0m';
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Format time
  const formatDateTime = (dateTimeStr) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      // If parsing fails, try to extract time from string
      if (typeof dateTimeStr === 'string' && dateTimeStr.includes(':')) {
        const parts = dateTimeStr.split(':');
        if (parts.length >= 2) {
          const hour = parseInt(parts[0]);
          const minute = parts[1];
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minute} ${ampm}`;
        }
      }
      return '00:00';
    }
  };

  // =================== PASSENGER DATA FUNCTIONS ===================

  // Fetch passenger data
const fetchPassengerData = async (page = 1, limit = 10, filters = {}) => {
  if (!leadID) {
    console.error('No lead ID provided');
    setPassengersError('No lead ID provided');
    return;
  }
  
  try {
    setLoadingPassengers(true);
    setPassengersError(null);
    
    console.log('Fetching passenger data for lead:', leadID);
    
    // Merge default params with provided filters
    const queryParams = {
      page,
      limit,
      status: filters.status || '',
      search: filters.search || '',
      sortBy: filters.sortBy || 'pax_code',
      sortOrder: filters.sortOrder || 'ASC',
      // Add any other filter parameters as needed
    };
    
    // Remove empty values if desired
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '') {
        delete queryParams[key];
      }
    });
    
    // Build the query string
    const queryString = new URLSearchParams(queryParams).toString();
    
    const response = await axios.get(
      `${API_BASE_URL}/paxlist/lead/${leadID}?${queryString}`
    );
    
    console.log('Passenger data API response:', response.data);
    
    if (response.data.success) {
      const passengers = response.data.data?.passengers || 
                        response.data.passengers || 
                        response.data.data || 
                        [];
      
      setPassengerData(passengers);
      
      // Return pagination info if needed
      if (response.data.data?.pagination) {
        return {
          passengers,
          pagination: response.data.data.pagination
        };
      }
      
      if (passengers.length === 0) {
        setPassengersError('No passengers found for this lead');
      }
    } else {
      throw new Error(response.data.message || 'Failed to load passengers');
    }
  } catch (error) {
    console.error('Error fetching passengers:', error);
    setPassengersError(error.response?.data?.message || error.message || 'Failed to load passenger data');
    
    // Fallback to mock data for demo
    const mockPassengers = generateMockPassengers(5);
    setPassengerData(mockPassengers);
  } finally {
    setLoadingPassengers(false);
  }
};

  // Generate mock passengers for demo
  const generateMockPassengers = (count) => {
    const passengers = [];
    const airports = ["DEL", "BOM", "BLR", "MAA", "CCU"];
    const airportsNames = [
      "New Delhi Indira Gandhi",
      "Mumbai Chhatrapati Shivaji",
      "Bangalore Kempegowda",
      "Chennai International",
      "Kolkata Netaji Subhas"
    ];
    const hubs = ["delhi", "mumbai", "bangalore", "chennai", "kolkata"];
    
    for (let i = 0; i < count; i++) {
      const airportIndex = i % 5;
      const hub = hubs[airportIndex];
      const airportCode = airports[airportIndex];
      const airportName = airportsNames[airportIndex];
      
      passengers.push({
        id: i + 1,
        lead_id: leadID,
        pax_code: `PAX00${i + 1}`,
        original_passenger_id: i + 1,
        guest_data: { data: {} },
        form_data: {
          data: {
            data: { int_hub: hub },
            email: `passenger${i + 1}@example.com`,
            phone: `123456789${i}`,
            emp_id: `EMP00${i + 1}`,
            address: `${hub.charAt(0).toUpperCase() + hub.slice(1)} address`,
            int_hub: hub,
            airport_code: airportCode,
            airport_name: airportName,
            "distance_(km)": Math.floor(Math.random() * 20) + 5
          },
          email: `passenger${i + 1}@example.com`,
          phone: `123456789${i}`,
          emp_id: `EMP00${i + 1}`,
          address: `${hub.charAt(0).toUpperCase() + hub.slice(1)} address`,
          int_hub: hub,
          airport_code: airportCode,
          airport_name: airportName,
          "distance_(km)": Math.floor(Math.random() * 20) + 5
        },
        pax_status: i === 0 ? "Pending" : i < 3 ? "In Progress" : "Completed",
        journey_id: i === 0 ? "d7e84ef0-fe98-43f8-a8c3-53cd375a39b9" : null,
        pnr_number: i > 2 ? `PNR${Math.floor(Math.random() * 999999)}` : null,
        attached_pnr: i > 2 ? [`PNR${Math.floor(Math.random() * 999999)}`] : [],
        selected_fields: ["email", "phone", "emp_id", "address"],
        processing_metadata: {
          source: "passenger_tab_selection",
          action_type: "bulk_upsert",
          received_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
        },
        processed_at: i > 2 ? new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString() : null,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return passengers;
  };

  // Toggle passenger expansion
  const togglePassengerExpansion = (passengerId) => {
    setExpandedPassengerId(expandedPassengerId === passengerId ? null : passengerId);
  };

  // Toggle passenger selection
  const togglePassengerSelection = (passengerId) => {
    setSelectedPassengers(prev => {
      if (prev.includes(passengerId)) {
        return prev.filter(id => id !== passengerId);
      } else {
        return [...prev, passengerId];
      }
    });
  };

  // Select all passengers
  const selectAllPassengers = () => {
    if (selectedPassengers.length === passengerData.length) {
      setSelectedPassengers([]);
    } else {
      setSelectedPassengers(passengerData.map(p => p.id));
    }
  };

  // Get passenger status badge
  const getPassengerStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format passenger form data
  const formatPassengerFormData = (formData) => {
    if (!formData) return {};
    
    // Extract data from nested structure if exists
    if (formData.data && typeof formData.data === 'object') {
      return { ...formData, ...formData.data };
    }
    
    return formData;
  };

  // Get time slot
  const getTimeSlot = (hour) => {
    if (hour >= 0 && hour < 11) return { label: 'Morning', color: 'bg-orange-50 text-orange-600 border-orange-200' };
    if (hour >= 11 && hour < 16) return { label: 'Afternoon', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
    if (hour >= 16 && hour < 20) return { label: 'Evening', color: 'bg-purple-50 text-purple-600 border-purple-200' };
    return { label: 'Night', color: 'bg-blue-50 text-blue-600 border-blue-200' };
  };

  // =================== PNR CREATION FUNCTIONS ===================

  // Create PNR function
// Add this helper function to better extract passenger form and guest data
// Helper function to extract passenger data for PNR
const createPnr = async (selectedFlights) => {
  try {
    setCreatingPnr(true);
    setPnrCreationStatus({ type: '', message: '' });

    console.log('Creating PNR with data:', {
      selectedPassengers: pnrCreationData.selected_passengers,
      flightSegments: pnrCreationData.flight_segments,
      passengerDataLength: passengerData.length,
      selectedFlights,
    });

    // Validate data
    if (!pnrCreationData.pnr_number.trim()) {
      throw new Error('PNR number is required');
    }

    if (pnrCreationData.selected_passengers.length === 0) {
      throw new Error('Please select at least one passenger');
    }

    // ✅ Extract journey_id from selectedFlights
    const journeyId = selectedFlights && selectedFlights.length > 0 
      ? selectedFlights[0].journey_id 
      : null;
    
    console.log('✅ Extracted journey_id from selectedFlights:', journeyId);

    // Get detailed passenger data including form data and guest data
    const passengersWithDetails = pnrCreationData.selected_passengers
      .map(passengerId => {
        const passenger = passengerData.find(p => p.id === passengerId);
        if (!passenger) {
          console.warn(`Passenger ${passengerId} not found in passengerData`);
          return null;
        }
        
        // Extract form data and guest data using helper function
        const formData = formatPassengerFormData(passenger.form_data);
        const guestData = passenger.guest_data?.data || passenger.form_data?.data?.guest_data || {};
        
        return {
          passenger_id: passenger.id,
          original_passenger_id: passenger.original_passenger_id,
          pax_code: passenger.pax_code,
          pax_status: passenger.pax_status,
          journey_id: journeyId || passenger.journey_id,
          pnr_number: passenger.pnr_number,
          attached_pnr: passenger.attached_pnr || [],
          
          // Form Data - include all fields
          form_data: {
            // Common fields
            email: formData.email || '',
            phone: formData.phone || '',
            emp_id: formData.emp_id || '',
            address: formData.address || '',
            int_hub: formData.int_hub || '',
            airport_code: formData.airport_code || '',
            airport_name: formData.airport_name || '',
            distance_km: formData['distance_(km)'] || formData.distance_km || 0,
            
            // Include all other form fields
            ...Object.entries(formData)
              .filter(([key, value]) => ![
                'email', 'phone', 'emp_id', 'address', 'int_hub', 
                'airport_code', 'airport_name', 'distance_(km)', 'distance_km',
                'data', 'guest_data'
              ].includes(key) && value !== undefined && value !== null)
              .reduce((obj, [key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  try {
                    obj[key] = JSON.stringify(value);
                  } catch (e) {
                    obj[key] = String(value);
                  }
                } else {
                  obj[key] = value;
                }
                return obj;
              }, {})
          },
          
          // Guest Data
          guest_data: {
            ...guestData,
            data: guestData.data || {},
            metadata: guestData.metadata || {
              extraction_date: new Date().toISOString(),
              extraction_source: 'pnr_creation'
            }
          },
          
          // Processing Metadata
          processing_metadata: passenger.processing_metadata || {
            source: "pnr_creation",
            action_type: "assign_pnr_to_passenger",
            received_at: new Date().toISOString(),
            pnr_assignment_date: new Date().toISOString(),
            journey_id: journeyId
          },
          
          selected_fields: passenger.selected_fields || [],
          processed_at: passenger.processed_at,
          created_at: passenger.created_at,
          updated_at: new Date().toISOString()
        };
      })
      .filter(p => p !== null);

    if (passengersWithDetails.length === 0) {
      throw new Error('No valid passenger data found');
    }

    console.log(selectedFlights, "nmnmn");

    // ✅ ENHANCE FLIGHT SEGMENTS WITH FLIGHT DIRECTION FROM SELECTED FLIGHTS
    const enhancedFlightSegments = pnrCreationData.flight_segments.map(segment => {
      // Find matching flight in selectedFlights to get flight_direction
      const matchingFlight = selectedFlights?.find(flight => 
        flight.flight_number === segment.flight_number &&
        flight.from_airport === segment.from_airport &&
        flight.to_airport === segment.to_airport &&
        flight.dep_date === segment.departure_date
      );
      
      return {
        ...segment,
        flight_direction: matchingFlight?.flight_direction || 'onward' // Default to onward if not found
      };
    });

    console.log('Enhanced flight segments with flight_direction:', enhancedFlightSegments);

    // Prepare PNR data with complete passenger details
    const pnrData = {
      pnr_number: pnrCreationData.pnr_number.toUpperCase(),
      pnr_type: pnrCreationData.pnr_type,
      pax_count: pnrCreationData.pax_count,
      assign_pax_count: passengersWithDetails.length,
      cost_per_pax: pnrCreationData.cost_per_pax,
      base_fare: pnrCreationData.base_fare,
      tax_value: pnrCreationData.tax_value,
      sale_fare: pnrCreationData.sale_fare,
      chair_type: pnrCreationData.chair_type,
      lead_id: leadID,
      journey_id: journeyId,
      
      // Vendor Information
      vendor_id: pnrCreationData.vendor_id || null,
      vendor_name: pnrCreationData.vendor_name || null,
      vendor_business: pnrCreationData.vendor_business || null,
      vendor_email: pnrCreationData.vendor_email || null,
      vendor_phone: pnrCreationData.vendor_phone || null,
      vendor_type: pnrCreationData.vendor_type || null,
      
      // Flight information with flight_direction
      flight_segments: enhancedFlightSegments.length > 0 
        ? enhancedFlightSegments 
        : [],
      
      // Passenger information - separate rows for each passenger
      passengers: passengersWithDetails,
      
      // Backward compatibility - also include pax_code as array
      pax_code: passengersWithDetails.map(p => p.pax_code),
      
      // Additional metadata
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Final PNR data for submission:', {
      pnr_number: pnrData.pnr_number,
      journey_id: pnrData.journey_id,
      vendor: pnrData.vendor_name,
      passenger_count: pnrData.passengers.length,
      flight_segment_count: pnrData.flight_segments.length,
      flight_segments_with_direction: pnrData.flight_segments.map(s => ({
        flight: s.flight_number,
        from: s.from_airport,
        to: s.to_airport,
        direction: s.flight_direction
      }))
    });

    // Send the complete PNR data to API
    const response = await axios.post(`${API_BASE_URL}/pnrs`, pnrData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Complete-Payload': 'true'
      }
    });

    if (response.data.success) {
      // Update passengers with PNR information in the original passengerData table
      const pnrId = response.data.data.id;
      const pnrNumber = pnrData.pnr_number;
      
      try {
        // Update selected passengers with PNR info in the paxlist table
        const updatePromises = pnrCreationData.selected_passengers.map(passengerId => {
          const passenger = passengerData.find(p => p.id === passengerId);
          if (!passenger) {
            console.warn(`Passenger ${passengerId} not found, skipping update`);
            return Promise.resolve();
          }
          
          const passengerCode = passenger.pax_code || `PAX00${passengerId}`;
          
          const updatePayload = {
            pnr_number: [pnrNumber],
            journey_id: journeyId
          };
          
          console.log(`Updating passenger ${passengerCode} with PNR ${pnrNumber} and journey_id ${journeyId}`);
          
          return axios.post(
            `${API_BASE_URL}/assing-pnr/${leadID}/passengers/${passengerCode}/assign-multiple-pnrs`, 
            updatePayload
          ).then(updateResponse => {
            console.log(`Successfully updated passenger ${passengerCode}:`, updateResponse.data);
            return updateResponse;
          }).catch(error => {
            console.error(`Failed to update passenger ${passengerCode}:`, error.response?.data || error.message);
            throw error;
          });
        });

        const updateResults = await Promise.allSettled(updatePromises);
        
        const successfulUpdates = updateResults.filter(result => 
          result.status === 'fulfilled' && result.value?.data?.success
        ).length;
        const failedUpdates = updateResults.filter(result => 
          result.status === 'rejected' || 
          (result.status === 'fulfilled' && !result.value?.data?.success)
        ).length;
        
        console.log(`PNR assignment summary: ${successfulUpdates} successful, ${failedUpdates} failed`);
        
        if (failedUpdates > 0) {
          console.warn('Some passenger PNR assignments failed:');
          updateResults.forEach((result, index) => {
            if (result.status === 'rejected') {
              const passengerId = pnrCreationData.selected_passengers[index];
              console.error(`- Passenger ${passengerId}:`, result.reason?.message || 'Unknown error');
            } else if (result.status === 'fulfilled' && !result.value?.data?.success) {
              const passengerId = pnrCreationData.selected_passengers[index];
              console.error(`- Passenger ${passengerId}:`, result.value?.data?.message || 'Update failed');
            }
          });
        }
        
      } catch (updateError) {
        console.warn('Could not update passengers in paxlist table, but PNR was created:', updateError);
      }

      setPnrCreationStatus({
        type: 'success',
        message: `✅ PNR ${pnrData.pnr_number} created successfully! 
                  Journey ID: ${journeyId}
                  Vendor: ${pnrData.vendor_name || 'Not assigned'}
                  Created separate records for ${pnrData.passengers.length} passenger(s)
                  with ${pnrData.flight_segments.length} flight segment(s)
                  ${pnrCreationData.selected_passengers.length > 0 ? `\nAssigned PNR to ${pnrCreationData.selected_passengers.length} passenger(s)` : ''}`
      });

      fetchPassengerData();
      fetchSubmittedJourneys();

      setTimeout(() => {
        setShowPnrCreation(false);
        setSelectedConnectionForPnr(null);
        setPnrCreationData({
          pnr_number: '',
          pnr_type: 'individual',
          pax_count: 1,
          assign_pax_count: 1,
          cost_per_pax: 0,
          base_fare: 0,
          tax_value: 0,
          sale_fare: 0,
          chair_type: 'Economy',
          lead_id: leadID,
          flight_segments: [],
          selected_passengers: [],
          selected_flight_ids: []
        });
        setPnrCreationStatus({ type: '', message: '' });
      }, 3000);
    } else {
      throw new Error(response.data.message || 'Failed to create PNR');
    }
  } catch (error) {
    console.error('Error creating PNR:', error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create PNR';
    const errorDetails = error.response?.data?.error || '';
    
    setPnrCreationStatus({
      type: 'error',
      message: `❌ ${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`
    });
    
    if (error.response?.data) {
      console.error('API Error Details:', error.response.data);
    }
  } finally {
    setCreatingPnr(false);
  }
};


  
const extractFlightSegments = (selectedFlights) => {
  console.log('=== EXTRACT FLIGHT SEGMENTS DEBUG ===');
  console.log('Input selectedFlights:', selectedFlights);
  console.log('Number of flights:', selectedFlights?.length);
  
  if (!selectedFlights || selectedFlights.length === 0) {
    console.log('No flights provided to extract segments');
    return [];
  }

  const segments = [];
  
  selectedFlights.forEach((flight, index) => {
    console.log(`Processing flight ${index}:`, {
      id: flight.id,
      flight_number: flight.flight_number,
      from_airport: flight.from_airport,
      to_airport: flight.to_airport,
      dep_time: flight.dep_time,
      dep_date: flight.dep_date
    });
    
    // Helper function to extract only date part (YYYY-MM-DD)
    const extractDateOnly = (dateString) => {
      if (!dateString) {
        console.warn(`Flight ${index} has no date, using current date`);
        return new Date().toISOString().split('T')[0];
      }
      
      try {
        // If it's already a Date object
        if (dateString instanceof Date) {
          return dateString.toISOString().split('T')[0];
        }
        
        // If it's a string
        if (typeof dateString === 'string') {
          // Remove time part if present
          const datePart = dateString.split('T')[0] || dateString.split(' ')[0];
          if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return datePart;
          }
          
          // Try to parse it
          const parsed = new Date(dateString);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
          }
        }
      } catch (error) {
        console.error(`Error parsing date for flight ${index}:`, error);
      }
      
      // Default fallback
      return new Date().toISOString().split('T')[0];
    };

    // Helper function to extract time only (HH:MM)
    const extractTimeOnly = (dateTimeString) => {
      if (!dateTimeString) {
        console.warn(`Flight ${index} has no time, using default time`);
        return '12:00';
      }
      
      try {
        // If it's a Date object
        if (dateTimeString instanceof Date) {
          const hours = String(dateTimeString.getHours()).padStart(2, '0');
          const minutes = String(dateTimeString.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        }
        
        // If it's a string
        if (typeof dateTimeString === 'string') {
          // Try to extract HH:MM format
          const timeMatch = dateTimeString.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2];
            return `${hours}:${minutes}`;
          }
        }
      } catch (error) {
        console.error(`Error parsing time for flight ${index}:`, error);
      }
      
      return '12:00';
    };

    // Ensure we have minimum required data
    const segment = {
      flight_number: flight.flight_number || `FL${index + 1}`,
      from_airport: flight.from_airport || 'Unknown',
      to_airport: flight.to_airport || 'Unknown',
      departure_date: extractDateOnly(flight.dep_date),
      departure_time: extractTimeOnly(flight.dep_time),
      arrival_date: extractDateOnly(flight.arv_date),
      arrival_time: extractTimeOnly(flight.arv_time),
      duration: calculateFlightDuration(
        extractTimeOnly(flight.dep_time),
        extractTimeOnly(flight.arv_time),
        extractDateOnly(flight.dep_date),
        extractDateOnly(flight.arv_date)
      ),
      dep_terminal: flight.dep_terminal?.toString().replace('T', '') || '1',
      arv_terminal: flight.arv_terminal?.toString().replace('T', '') || '1',
      leg_id: flight.leg_id || Math.floor((flight.originalIndex || 0) / 2) + 1,
      segment_order: index + 1
    };
    
    console.log(`Created segment for flight ${index}:`, segment);
    
    // Validate the segment has basic required data
    if (segment.from_airport && segment.to_airport) {
      segments.push(segment);
      console.log(`Segment ${index} added to segments array`);
    } else {
      console.warn(`Skipping invalid segment ${index}: missing from_airport or to_airport`);
    }
  });
  
  console.log('Total segments extracted:', segments.length);
  console.log('Segments array:', segments);
  console.log('=== END EXTRACT DEBUG ===');
  
  return segments;
};

  // Initialize PNR creation from connection with flight-level selection
// Initialize PNR creation from connection with flight-level selection
const initPnrCreation = async (journey) => {
  if (!journey || journey.length === 0) {
    setPnrCreationStatus({
      type: 'error',
      message: 'No flight segments in this journey'
    });
    return;
  }

  // Load passenger data if not already loaded
  if (passengerData.length === 0) {
    await fetchPassengerData();
  }

  // Generate a random PNR number
  const randomPnr = `PNR${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Group flights into logical legs (connected flights)
  const legs = [];
  let currentLeg = [];
  let currentLegIndex = 1;
  
 journey.forEach((flight, index) => {
  // Create a flight object with all required properties
  const flightId = `flight-${index}-${Date.now()}`;
  
  const flightWithDefaults = {
    id: flightId,
    flight_number: flight.flight_number || `FL${index + 1}`,
    from_airport: flight.from_airport || 'Unknown',
    to_airport: flight.to_airport || 'Unknown',
    dep_time: flight.dep_time || '12:00',
    dep_date: flight.dep_date || new Date().toISOString().split('T')[0],
    arv_time: flight.arv_time || '14:00',
    arv_date: flight.arv_date || new Date().toISOString().split('T')[0],
    dep_terminal: flight.dep_terminal || '1',
    arv_terminal: flight.arv_terminal || '1',
    originalIndex: index,
    leg_id: Math.floor(index / 2) + 1, // Add leg_id for grouping
    isSelected: true,
    flightPrice: 10000 + Math.random() * 40000
  };
  
  console.log(`Created flight ${index}:`, flightWithDefaults);
  currentLeg.push(flightWithDefaults);
    
    // Create a new leg if this is the last flight or if next flight has different origin
    if (index === journey.length - 1 || 
        (index < journey.length - 1 && journey[index + 1].from_airport !== flight.to_airport)) {
      legs.push({
        id: currentLegIndex,
        name: `Leg ${currentLegIndex}`,
        flights: [...currentLeg],
        isSelected: true,
        isCollapsed: false
      });
      currentLeg = [];
      currentLegIndex++;
    }
  });

  // Calculate initial total price from all flights
  let totalPrice = 0;
  legs.forEach(leg => {
    leg.flights.forEach(flight => {
      totalPrice += flight.flightPrice;
    });
  });

  // Get all flights initially (all selected)
  const allFlights = legs.flatMap(leg => leg.flights);
  
  // IMPORTANT: Ensure we properly extract flight segments
  const initialFlightSegments = extractFlightSegments(allFlights);

  // Validate that segments were extracted
  if (initialFlightSegments.length === 0) {
    console.error('No flight segments could be extracted:', allFlights);
    setPnrCreationStatus({
      type: 'error',
      message: 'Could not extract flight segments. Please check flight data.'
    });
    return;
  }

  // Track flight selection state
  const flightSelectionState = {};
  allFlights.forEach(flight => {
    flightSelectionState[flight.id] = true;
  });

  // Set state in a single batch to avoid async issues
  setSelectedConnectionForPnr({
    journey,
    legs,
    allFlights,
    flightSelectionState,
    selectedFlightIds: allFlights.map(f => f.id)
  });

  setPnrCreationData({
    pnr_number: randomPnr,
    pnr_type: 'individual',
    pax_count: Math.max(1, selectedPassengers.length > 0 ? selectedPassengers.length : 1),
    assign_pax_count: selectedPassengers.length > 0 ? selectedPassengers.length : 1,
    cost_per_pax: totalPrice / Math.max(1, selectedPassengers.length > 0 ? selectedPassengers.length : 1),
    base_fare: totalPrice * 0.8,
    tax_value: totalPrice * 0.2,
    sale_fare: totalPrice,
    chair_type: 'Economy',
    lead_id: leadID,
    flight_segments: initialFlightSegments,
    selected_passengers: selectedPassengers.length > 0 ? selectedPassengers : [],
    selected_flight_ids: allFlights.map(f => f.id)
  });

  setShowPnrCreation(true);
  setPnrCreationStatus({ type: '', message: '' }); // Clear any previous status
};

  // =================== TRAVEL HUBS FUNCTIONS ===================

  // Fetch travel hubs
  const fetchTravelHubs = async () => {
    try {
      setLoadingHubs(true);
      setHubsError(null);
      
      console.log('Fetching travel hubs for lead ID:', leadID);
      
      // API call to get travel hubs
      const response = await axios.get(`${API_BASE_URL}/travel-hubs/form/${leadID}`);
      
      console.log('Travel hubs API response:', response.data);
      
      if (response.data.success) {
        const hubs = response.data.data || [];
        setTravelHubs(hubs);
        
        if (hubs.length === 0) {
          setHubsError('No travel hubs found for this lead');
        }
      } else {
        throw new Error(response.data.message || 'Failed to load travel hubs');
      }
    } catch (error) {
      console.error('Error fetching travel hubs:', error);
      setHubsError(error.response?.data?.message || error.message || 'Failed to load travel hubs');
      
      // Fallback to mock data for demo
      const mockHubs = generateMockTravelHubs(3);
      setTravelHubs(mockHubs);
    } finally {
      setLoadingHubs(false);
    }
  };

  // Generate mock travel hubs for demo
  const generateMockTravelHubs = (count) => {
    const hubs = [];
    const hubNames = [
      "New Delhi Indira Gandhi",
      "Mumbai Chhatrapati Shivaji",
      "Bangalore Kempegowda",
      "Chennai International",
      "Kolkata Netaji Subhas"
    ];
    
    const airportCodes = ["DEL", "BOM", "BLR", "MAA", "CCU"];
    const addresses = [
      "Patel Nagar, New Delhi",
      "Andheri East, Mumbai",
      "Devanahalli, Bangalore",
      "Meenambakkam, Chennai",
      "Dum Dum, Kolkata"
    ];
    
    for (let i = 0; i < count; i++) {
      const pax = Math.floor(Math.random() * 5) + 1;
      const submissionIds = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, 
        (_, idx) => String(Math.floor(Math.random() * 50) + 1));
      
      hubs.push({
        id: i + 1,
        formId: leadID,
        hub: hubNames[i] || hubNames[0],
        airportCode: airportCodes[i] || airportCodes[0],
        pax: pax,
        travelType: i % 2 === 0 ? "Business" : "Leisure",
        address: addresses[i] || addresses[0],
        distance: (Math.random() * 20 + 5).toFixed(1),
        submissionIds: submissionIds,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return hubs;
  };

  // Fetch connections for a specific hub
  const fetchConnectionsForHub = async (hub) => {
    try {
      setLoadingJourneys(true);
      setJourneysError(null);
      
      console.log('Fetching connections for hub:', hub);
      
      // First, get submission IDs for this hub
      const submissionIds = hub.submissionIds || [];
      
      if (submissionIds.length === 0) {
        setSubmittedJourneys([]);
        setJourneyStats({
          totalJourneys: 0,
          totalFlights: 0,
          averageLegs: 0,
          recentJourneys: 0
        });
        
        setSubmitStatus({
          type: 'info',
          message: `ℹ️ No submissions found for ${hub.hub}`
        });
        
        setTimeout(() => {
          setSubmitStatus({ type: '', message: '' });
        }, 3000);
        return;
      }
      
      // Fetch journeys for all submission IDs
      const journeysPromises = submissionIds.map(submissionId => 
        axios.get(`${API_BASE_URL}/flight-connections/journeys/submission/${submissionId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching submission ${submissionId}:`, error);
            return { success: false, error: error.message };
          })
      );
      
      const responses = await Promise.all(journeysPromises);
      const allJourneys = [];
      
      responses.forEach((response, index) => {
        if (response.success) {
          const journeys = response.journeys || [];
          allJourneys.push(...journeys);
        } else {
          console.warn(`Failed to load submission ${submissionIds[index]}:`, response.error);
        }
      });
      
      if (allJourneys.length > 0) {
        setSubmittedJourneys(allJourneys);
        
        // Calculate stats
        const stats = calculateJourneyStats(allJourneys);
        setJourneyStats(stats);
        
        setSubmitStatus({
          type: 'success',
          message: `✅ Loaded ${allJourneys.length} journey${allJourneys.length > 1 ? 's' : ''} for ${hub.hub}`
        });
        
        setTimeout(() => {
          setSubmitStatus({ type: '', message: '' });
        }, 3000);
      } else {
        throw new Error('No journeys found for this hub');
      }
    } catch (error) {
      console.error('Error fetching hub connections:', error);
      setJourneysError(error.response?.data?.message || error.message || 'Failed to load hub connections');
      
      // Fallback to mock data for demo
      const mockJourneys = generateMockJourneys(3, hub);
      setSubmittedJourneys(mockJourneys);
      const stats = calculateJourneyStats(mockJourneys);
      setJourneyStats(stats);
      
      setSubmitStatus({
        type: 'info',
        message: `⚠️ Using demo data for ${hub.hub} - ${mockJourneys.length} journey${mockJourneys.length > 1 ? 's' : ''} shown`
      });
      
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 3000);
    } finally {
      setLoadingJourneys(false);
    }
  };

  // Handle hub selection
  const handleHubSelect = (hub) => {
    console.log('Hub selected:', hub);
    setSelectedHub(hub);
    setShowHubsList(false);
    setJourneysFilter('hub');
    fetchConnectionsForHub(hub);
  };

  // Clear hub selection
  const clearHubSelection = () => {
    setSelectedHub(null);
    setJourneysFilter('all');
    fetchSubmittedJourneys();
  };

  // =================== SUBMITTED JOURNEYS FUNCTIONS ===================

  // Fetch submitted journeys
  const fetchSubmittedJourneys = async () => {
    if (!leadID) {
      console.error('No lead ID provided');
      setJourneysError('No lead ID provided');
      return;
    }
    
    try {
      setLoadingJourneys(true);
      setJourneysError(null);
      
      console.log('Fetching submitted journeys for lead:', leadID);
      
      const response = await axios.get(`${API_BASE_URL}/flight-connections/journeys/lead/${leadID}`);
      
      console.log('Submitted journeys API response:', response.data);
      
      if (response.data.success) {
        const journeys = response.data.journeys || [];
        setSubmittedJourneys(journeys);
        
        // Calculate stats
        const stats = calculateJourneyStats(journeys);
        setJourneyStats(stats);
        
        if (journeys.length === 0) {
          setJourneysError('No journeys found for this lead');
        }
      } else {
        throw new Error(response.data.message || 'Failed to load journeys');
      }
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneysError(error.response?.data?.message || error.message || 'Failed to load submitted journeys');
      
      // Fallback to mock data for demo
      const mockJourneys = generateMockJourneys(5);
      setSubmittedJourneys(mockJourneys);
      const stats = calculateJourneyStats(mockJourneys);
      setJourneyStats(stats);
    } finally {
      setLoadingJourneys(false);
    }
  };

  // Generate mock journeys for demo
  const generateMockJourneys = (count, hub = null) => {
    const journeys = [];
    const airlines = ["Air India", "IndiGo", "British Airways", "Lufthansa", "Emirates", "Qatar Airways"];
    const airports = hub ? [hub.airportCode, "LHR", "CDG", "JFK", "DXB", "SIN"] : ["BOM", "DEL", "LHR", "CDG", "JFK", "DXB", "SIN"];
    
    for (let i = 0; i < count; i++) {
      const legCount = Math.floor(Math.random() * 3) + 1;
      const journey = [];
      
      for (let j = 0; j < legCount; j++) {
        const fromAirport = airports[Math.floor(Math.random() * airports.length)];
        const toAirport = airports.filter(a => a !== fromAirport)[Math.floor(Math.random() * (airports.length - 1))];
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        
        journey.push({
          id: Date.now() + i * 100 + j,
          lead_id: leadID,
          journey_id: `mock-${i}-${j}`,
          flight_number: `${airline.substring(0, 2)} ${Math.floor(Math.random() * 9999) + 1000}`,
          from_airport: fromAirport,
          to_airport: toAirport,
          dep_time: `${Math.floor(Math.random() * 12) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
          dep_date: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          arv_time: `${Math.floor(Math.random() * 12) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
          arv_date: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          dep_terminal: Math.floor(Math.random() * 3) + 1,
          arv_terminal: Math.floor(Math.random() * 3) + 1,
          leg_order: j + 1,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      journeys.push(journey);
    }
    
    return journeys;
  };

  // Get journey duration
  const getJourneyDuration = (journey) => {
    if (journey.length === 0) return 'N/A';
    
    const firstFlight = journey[0];
    const lastFlight = journey[journey.length - 1];
    
    try {
      const depDate = new Date(`${firstFlight.dep_date.split('T')[0]}T${firstFlight.dep_time}`);
      const arvDate = new Date(`${lastFlight.arv_date.split('T')[0]}T${lastFlight.arv_time}`);
      
      const durationMs = arvDate - depDate;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Toggle journey expansion
  const toggleJourneyExpansion = (journeyId) => {
    setExpandedJourneyId(expandedJourneyId === journeyId ? null : journeyId);
  };

  // Filter journeys based on selected filter
  const getFilteredJourneys = () => {
    let filtered = submittedJourneys;
    
    if (journeysFilter === 'recent') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      filtered = filtered.filter(journey => {
        return journey.some(flight => {
          const flightDate = new Date(flight.created_at);
          return flightDate > lastWeek;
        });
      });
    } else if (journeysFilter === 'multi-leg') {
      filtered = filtered.filter(journey => journey.length > 1);
    } else if (journeysFilter === 'hub' && selectedHub) {
      // Filter journeys that originate from the selected hub's airport
      filtered = filtered.filter(journey => {
        return journey.some(flight => 
          flight.from_airport === selectedHub.airportCode
        );
      });
    }
    
    return filtered;
  };

  // Copy journey to clipboard
  const copyJourneyDetails = async (journey) => {
    try {
      const journeyText = journey.map(flight => 
        `${flight.leg_order}. ${flight.from_airport} → ${flight.to_airport} | ${flight.flight_number} | ${formatDisplayTime(flight.dep_time)} - ${formatDisplayTime(flight.arv_time)}`
      ).join('\n');
      
      await navigator.clipboard.writeText(journeyText);
      setSubmitStatus({
        type: 'success',
        message: 'Journey details copied to clipboard!'
      });
      
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // =================== JOURNEY LEG MANAGEMENT ===================

  // Add a new leg to the journey
  const addNewLeg = () => {
    const newLegId = journeyLegs.length + 1;
    const lastLeg = journeyLegs[journeyLegs.length - 1];
    
    // Determine default departure airport
    let defaultFrom = 'BOM';
    if (lastLeg && lastLeg.flights.length > 0) {
      defaultFrom = lastLeg.flights[0].arrival_airport;
    }
    
    // Determine default date
    let defaultDate = new Date();
    if (lastLeg && lastLeg.flights.length > 0) {
      const lastArrival = new Date(lastLeg.flights[0].arrival_time);
      defaultDate = new Date(lastArrival.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const newLeg = {
      id: newLegId,
      name: `Leg ${newLegId}`,
      flights: [],
      searchParams: {
        from: defaultFrom,
        to: 'LHR',
        date: defaultDate.toISOString().split('T')[0],
        trip_type: 'one-way',
        return_date: new Date(defaultDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      isEditing: false,
      isComplete: false,
      flightsData: [],
      filteredFlights: [],
      suggestedFlights: [],
      filters: {
        airlines: [],
        stops: [],
        departureTimeSlots: [],
        arrivalTimeSlots: [],
        priceRange: [0, 50000],
        durationRange: [0, 1440],
        layoverAirports: [],
        minLayoverDuration: 0,
        maxLayoverDuration: 480,
        aircraft: [],
        nearbyAirports: false
      },
      expandedSections: {
        airlines: true,
        stops: true,
        departureTime: true,
        arrivalTime: true,
        price: true,
        duration: true,
        aircraft: true,
        layoverAirports: true,
        layoverDuration: true
      },
      filterOptions: {
        airlines: [],
        stops: [0, 1, 2, 3],
        departureSlots: [],
        arrivalSlots: [],
        layoverAirports: [],
        aircraft: []
      },
      sortBy: 'price',
      loading: false,
      error: null,
      activeFiltersCount: 0
    };
    
    setJourneyLegs(prev => 
      prev.map(leg => ({ ...leg, isEditing: false }))
        .concat(newLeg)
    );
    
    // Add to visible legs if we're in compare mode
    if (viewMode === 'compare' && visibleLegs.length < 4) {
      setVisibleLegs(prev => [...prev, journeyLegs.length]);
    }
    
    setCurrentLeg(newLegId - 1);
    setSearchMode('new');
    setSearchParams(newLeg.searchParams);
  };

  // Edit an existing leg
  const editLeg = (legIndex) => {
    const legToEdit = journeyLegs[legIndex];
    
    setJourneyLegs(prev => 
      prev.map((leg, idx) => ({
        ...leg,
        isEditing: idx === legIndex
      }))
    );
    
    setCurrentLeg(legIndex);
    setSearchMode('edit');
    setSearchParams(legToEdit.searchParams);
    setViewMode('single');
  };

  // Delete a leg
  const deleteLeg = (legIndex) => {
    if (journeyLegs.length <= 1) {
      setError('At least one leg is required');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setJourneyLegs(prev => {
      const newLegs = prev.filter((_, idx) => idx !== legIndex);
      return newLegs.map((leg, idx) => ({
        ...leg,
        id: idx + 1,
        name: `Leg ${idx + 1}`,
        isEditing: idx === 0
      }));
    });
    
    // Update visible legs
    setVisibleLegs(prev => 
      prev
        .filter(idx => idx !== legIndex)
        .map(idx => idx > legIndex ? idx - 1 : idx)
    );
    
    if (currentLeg >= legIndex) {
      const newCurrentLeg = currentLeg > 0 ? currentLeg - 1 : 0;
      setCurrentLeg(newCurrentLeg);
      if (viewMode === 'single') {
        editLeg(newCurrentLeg);
      }
    }
  };

  // Clear all legs
  const clearAllJourney = () => {
    setJourneyLegs([
      {
        id: 1,
        name: 'Leg 1',
        flights: [],
        searchParams: {
          from: 'BOM',
          to: 'LHR',
          date: new Date().toISOString().split('T')[0],
          trip_type: 'one-way',
          return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        isEditing: true,
        isComplete: false,
        flightsData: [],
        filteredFlights: [],
        suggestedFlights: [],
        filters: {
          airlines: [],
          stops: [],
          departureTimeSlots: [],
          arrivalTimeSlots: [],
          priceRange: [0, 50000],
          durationRange: [0, 1440],
          layoverAirports: [],
          minLayoverDuration: 0,
          maxLayoverDuration: 480,
          aircraft: [],
          nearbyAirports: false
        },
        expandedSections: {
          airlines: true,
          stops: true,
          departureTime: true,
          arrivalTime: true,
          price: true,
          duration: true,
          aircraft: true,
          layoverAirports: true,
          layoverDuration: true
        },
        filterOptions: {
          airlines: [],
          stops: [0, 1, 2, 3],
          departureSlots: [],
          arrivalSlots: [],
          layoverAirports: [],
          aircraft: []
        },
        sortBy: 'price',
        loading: false,
        error: null,
        activeFiltersCount: 0
      },
      {
        id: 2,
        name: 'Leg 2',
        flights: [],
        searchParams: {
          from: 'LHR',
          to: 'CDG',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          return_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          trip_type: 'one-way'
        },
        isEditing: false,
        isComplete: false,
        flightsData: [],
        filteredFlights: [],
        suggestedFlights: [],
        filters: {
          airlines: [],
          stops: [],
          departureTimeSlots: [],
          arrivalTimeSlots: [],
          priceRange: [0, 50000],
          durationRange: [0, 1440],
          layoverAirports: [],
          minLayoverDuration: 0,
          maxLayoverDuration: 480,
          aircraft: [],
          nearbyAirports: false
        },
        expandedSections: {
          airlines: true,
          stops: true,
          departureTime: true,
          arrivalTime: true,
          price: true,
          duration: true,
          aircraft: true,
          layoverAirports: true,
          layoverDuration: true
        },
        filterOptions: {
          airlines: [],
          stops: [0, 1, 2, 3],
          departureSlots: [],
          arrivalSlots: [],
          layoverAirports: [],
          aircraft: []
        },
        sortBy: 'price',
        loading: false,
        error: null,
        activeFiltersCount: 0
      }
    ]);
    
    setCurrentLeg(0);
    setSearchMode('new');
    setSubmitStatus({ type: '', message: '' });
    setVisibleLegs([0, 1]);
  };

  // =================== FLIGHT SELECTION ===================

  // Toggle flight selection for a specific leg
  const toggleFlightSelection = (flight, legIndex) => {
    setJourneyLegs(prev => 
      prev.map((leg, idx) => {
        if (idx === legIndex) {
          const isSelected = leg.flights.some(f => f.id === flight.id);
          if (!isSelected) {
            // If flight has no direction, set a default
            if (!flight.flight_direction) {
              flight = { ...flight, flight_direction: 'onward' };
            }
          }
          return {
            ...leg,
            flights: isSelected ? [] : [flight],
            isComplete: !isSelected
          };
        }
        return leg;
      })
    );
  };

  // Auto-select best flight for a specific leg
  const autoSelectBestFlight = (legIndex) => {
    const leg = journeyLegs[legIndex];
    const legFilteredFlights = leg.filteredFlights;
    
    if (legFilteredFlights.length === 0) {
      setJourneyLegs(prev => prev.map((l, idx) => 
        idx === legIndex ? { ...l, error: 'No flights available to select' } : l
      ));
      setTimeout(() => {
        setJourneyLegs(prev => prev.map((l, idx) => 
          idx === legIndex ? { ...l, error: null } : l
        ));
      }, 3000);
      return;
    }
    
    // Get top suggested flight or cheapest flight
    const bestFlight = leg.suggestedFlights.length > 0 
      ? leg.suggestedFlights[0] 
      : [...legFilteredFlights].sort((a, b) => a.price - b.price)[0];
    
    if (bestFlight) {
      toggleFlightSelection(bestFlight, legIndex);
      setSubmitStatus({
        type: 'success',
        message: `✓ Auto-selected best flight for ${leg.name}: ${bestFlight.airline} ${bestFlight.flight_number}`
      });
    }
  };

  // Check if flight is selected in a specific leg
  const isFlightSelected = (flight, legIndex) => {
    return journeyLegs[legIndex]?.flights?.some(f => f.id === flight.id) || false;
  };

  // Clear selection for a specific leg
  const clearLegSelection = (legIndex) => {
    setJourneyLegs(prev => 
      prev.map((leg, idx) => 
        idx === legIndex 
          ? { ...leg, flights: [], isComplete: false } 
          : leg
      )
    );
    setSubmitStatus({ type: '', message: '' });
  };

  // =================== FLIGHT DATA & API ===================

  // Search flights function
  const searchFlights = async (fromCode, toCode, date = null, returnDate = null, tripType = 'one-way') => {
    try {
      const searchDate = date || new Date().toISOString().split('T')[0];
      
      let endpoint = '/flights/search';
      let params = {
        from: fromCode,
        to: toCode,
        date: searchDate,
        trip_type: tripType
      };
      
      if (tripType === 'roundtrip' && returnDate) {
        params.return_date = returnDate;
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        params: params,
        timeout: 30000
      });
      
      if (response.data.success) {
        return {
          success: true,
          flights: response.data.flights || [],
          search_params: response.data.search_params || {
            from: fromCode,
            to: toCode,
            date: searchDate,
            return_date: returnDate,
            trip_type: tripType
          },
          total_flights: response.data.total_flights || 0,
          api_source: response.data.api_source || "serpapi",
          trip_type: tripType
        };
      } else {
        throw new Error(response.data.message || 'API request failed');
      }
      
    } catch (error) {
      console.error("Flight search API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "API connection failed",
        flights: [],
        total_flights: 0,
        is_fallback: false
      };
    }
  };

  // Enhance flights with layover information
const enhanceFlightsWithLayover = (flightsData) => {
  return flightsData.map(flight => {
    // Check if this is a roundtrip flight from API
    if (flight.trip_type === 'roundtrip' && flight.outbound && flight.return) {
      // API roundtrip structure
      return {
        ...flight,
        departure_time: flight.outbound.departure_time,
        arrival_time: flight.outbound.arrival_time,
        departure_airport: flight.outbound.departure_airport,
        arrival_airport: flight.outbound.arrival_airport,
        duration: flight.outbound.duration,
        stops: flight.outbound.stops || 0,
        aircraft: flight.outbound.aircraft,
        departure_terminal: flight.outbound.departure_terminal,
        arrival_terminal: flight.outbound.arrival_terminal,
        return_flight: {
          id: flight.id + '-return',
          airline: flight.return.airline,
          flight_number: flight.return.flight_number,
          departure_time: flight.return.departure_time,
          arrival_time: flight.return.arrival_time,
          duration: flight.return.duration,
          stops: flight.return.stops || 0,
          aircraft: flight.return.aircraft,
          departure_terminal: flight.return.departure_terminal,
          arrival_terminal: flight.return.arrival_terminal,
          departure_airport: flight.return.departure_airport,
          arrival_airport: flight.return.arrival_airport,
          flight_direction: 'return'  // ← ADD THIS for return flight
        },
        layover_details: flight.outbound.layover_details || [],
        total_duration: flight.total_duration,
        airline: flight.outbound.airline,
        flight_number: flight.outbound.flight_number,
        flight_direction: 'onward'  // ← ADD THIS for outbound flight
      };
    }
    
    // Handle one-way flights or flights without outbound/return structure
    if (!flight.layover_details && flight.stops > 0) {
      const layoverAirports = ["DXB", "AUH", "DOH", "SIN", "BKK", "HKG", "FRA", "LHR", "CDG", "AMS", "IST"];
      const layoverAirport = layoverAirports[Math.floor(Math.random() * layoverAirports.length)];
      const layoverDuration = 60 + Math.floor(Math.random() * 180);
      
      const airlineCode = flight.airline?.substring(0, 2).toUpperCase() || 'XX';
      const flightNumber = Math.floor(Math.random() * 9000) + 1000;
      
      return {
        ...flight,
        layover_details: [
          {
            airport_code: layoverAirport,
            airport_name: getAirportName(layoverAirport),
            duration: layoverDuration,
            airline: flight.airline,
            flight_number: `${airlineCode}${flightNumber}`
          }
        ],
        flight_direction: 'onward'  // ← ADD THIS - default for one-way
      };
    }
    
    return {
      ...flight,
      layover_details: flight.layover_details || [],
      flight_direction: 'onward'  // ← ADD THIS - default for one-way
    };
  });
};

  // Calculate suggested flights for a leg
  const calculateSuggestedFlights = (flightsData) => {
    if (flightsData.length < 5) return [];
    
    // Calculate flight score
    const calculateFlightScore = (flight) => {
      if (flightsData.length === 0) return 0;
      
      let score = 0;
      
      const maxPrice = Math.max(...flightsData.map(f => f.price));
      const minPrice = Math.min(...flightsData.map(f => f.price));
      const priceScore = 1 - ((flight.price - minPrice) / (maxPrice - minPrice || 1));
      score += priceScore * 40;
      
      const maxDuration = Math.max(...flightsData.map(f => f.duration));
      const minDuration = Math.min(...flightsData.map(f => f.duration));
      const durationScore = 1 - ((flight.duration - minDuration) / (maxDuration - minDuration || 1));
      score += durationScore * 30;
      
      const stopsScore = flight.stops === 0 ? 1 : flight.stops === 1 ? 0.6 : 0.3;
      score += stopsScore * 15;
      
      const departureTime = new Date(flight.departure_time);
      const departureHour = departureTime.getHours();
      let timeScore = 0.5;
      
      if (departureHour >= 6 && departureHour < 11) timeScore = 1;
      else if (departureHour >= 11 && departureHour < 16) timeScore = 0.8;
      else if (departureHour >= 16 && departureHour < 21) timeScore = 0.6;
      else timeScore = 0.4;
      
      score += timeScore * 15;
      
      return Math.round(score);
    };
    
    const flightsWithScores = flightsData.map(flight => ({
      ...flight,
      score: calculateFlightScore(flight),
      suggestionReason: suggestionReasons[0] // Default reason
    }));
    
    const sortedByScore = [...flightsWithScores].sort((a, b) => b.score - a.score).slice(0, 7);
    
    const topFlights = [];
    const usedAirlines = new Set();
    
    for (const flight of sortedByScore) {
      if (topFlights.length >= 5) break;
      
      if (!usedAirlines.has(flight.airline) || usedAirlines.size >= 3) {
        // Assign different suggestion reasons based on position
        const flightWithReason = {
          ...flight,
          suggestionReason: suggestionReasons[topFlights.length % suggestionReasons.length]
        };
        topFlights.push(flightWithReason);
        usedAirlines.add(flight.airline);
      }
    }
    
    return topFlights;
  };

  // Extract filter options for a leg
const extractFilterOptionsForLeg = (flightsData) => {
  if (!flightsData || flightsData.length === 0) {
    return {
      airlines: [],
      stops: [0, 1, 2, 3],
      aircraft: [],
      layoverAirports: [],
      departureSlots: timeSlots,
      arrivalSlots: timeSlots
    };
  }
  
  const airlines = [...new Set(flightsData.map(f => f.airline))];
  const stops = [...new Set(flightsData.map(f => f.stops))].sort((a, b) => a - b);
  const aircraft = [...new Set(flightsData.map(f => f.aircraft || 'Unknown'))];
  
  const layoverAirports = [...new Set(
    flightsData
      .filter(f => f.layover_details && f.layover_details.length > 0)
      .flatMap(f => f.layover_details.map(l => l.airport_code))
  )].map(code => ({
    code,
    name: getAirportName(code)
  }));
  
  return {
    airlines,
    stops,
    aircraft,
    layoverAirports,
    departureSlots: timeSlots,
    arrivalSlots: timeSlots
  };
};

  // Apply filters for a specific leg
// Replace your current applyFiltersForLeg function with this:

const applyFiltersForLeg = useCallback((legIndex) => {
  const leg = journeyLegs[legIndex];
  if (!leg || !leg.flightsData || leg.flightsData.length === 0) return [];

  let result = [...leg.flightsData];

  // Filter by airlines
  if (leg.filters.airlines && leg.filters.airlines.length > 0) {
    result = result.filter(flight => 
      leg.filters.airlines.includes(flight.airline)
    );
  }

  // Filter by stops
  if (leg.filters.stops && leg.filters.stops.length > 0) {
    result = result.filter(flight => 
      leg.filters.stops.includes(flight.stops)
    );
  }

  // Filter by departure time slots
  if (leg.filters.departureTimeSlots && leg.filters.departureTimeSlots.length > 0) {
    result = result.filter(flight => {
      try {
        const departureTime = new Date(flight.departure_time);
        const departureHour = departureTime.getHours();
        return leg.filters.departureTimeSlots.some(slotId => {
          const slot = timeSlots.find(s => s.id === slotId);
          if (!slot) return false;
          return departureHour >= slot.range[0] && departureHour <= slot.range[1];
        });
      } catch (error) {
        return true;
      }
    });
  }

  // Filter by arrival time slots
  if (leg.filters.arrivalTimeSlots && leg.filters.arrivalTimeSlots.length > 0) {
    result = result.filter(flight => {
      try {
        const arrivalTime = new Date(flight.arrival_time);
        const arrivalHour = arrivalTime.getHours();
        return leg.filters.arrivalTimeSlots.some(slotId => {
          const slot = timeSlots.find(s => s.id === slotId);
          if (!slot) return false;
          return arrivalHour >= slot.range[0] && arrivalHour <= slot.range[1];
        });
      } catch (error) {
        return true;
      }
    });
  }

  // Filter by price range
  if (leg.filters.priceRange) {
    result = result.filter(flight => 
      flight.price >= leg.filters.priceRange[0] && 
      flight.price <= leg.filters.priceRange[1]
    );
  }

  // Filter by duration range
  if (leg.filters.durationRange) {
    result = result.filter(flight => 
      flight.duration >= leg.filters.durationRange[0] && 
      flight.duration <= leg.filters.durationRange[1]
    );
  }

  // Filter by aircraft
  if (leg.filters.aircraft && leg.filters.aircraft.length > 0) {
    result = result.filter(flight => 
      leg.filters.aircraft.includes(flight.aircraft || 'Unknown')
    );
  }

  // Filter by layover airports
  if (leg.filters.layoverAirports && leg.filters.layoverAirports.length > 0) {
    result = result.filter(flight => {
      if (flight.layover_details && flight.layover_details.length > 0) {
        return flight.layover_details.some(layover => 
          leg.filters.layoverAirports.includes(layover.airport_code)
        );
      }
      return false;
    });
  }

  // Filter by layover duration
  if (leg.filters.minLayoverDuration !== undefined && leg.filters.maxLayoverDuration !== undefined) {
    result = result.filter(flight => {
      if (flight.layover_details && flight.layover_details.length > 0) {
        return flight.layover_details.every(layover => 
          layover.duration >= leg.filters.minLayoverDuration && 
          layover.duration <= leg.filters.maxLayoverDuration
        );
      }
      return true;
    });
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (leg.sortBy) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        return a.duration - b.duration;
      case 'departure':
        return new Date(a.departure_time) - new Date(b.departure_time);
      case 'arrival':
        return new Date(a.arrival_time) - new Date(b.arrival_time);
      default:
        return 0;
    }
  });

  return result;
}, [journeyLegs, timeSlots]);

  // =================== FILTER MANAGEMENT ===================

  // Update filter for a specific leg
// Update the updateLegFilter function:
// Update the updateLegFilter function specifically for price range handling:
const updateLegFilter = (legIndex, filterType, value) => {
  setJourneyLegs(prev => {
    const newLegs = [...prev];
    const leg = newLegs[legIndex];
    
    // Update the filter
    const newFilters = {
      ...leg.filters,
      [filterType]: value
    };
    
    // Apply price range validation
    if (filterType === 'priceRange') {
      // Ensure min < max
      let [min, max] = value;
      if (min > max) [min, max] = [max, min];
      // Clamp values
      min = Math.max(0, Math.min(min, 50000));
      max = Math.max(0, Math.min(max, 50000));
      // Ensure minimum difference
      if (max - min < 1000) {
        if (min > 0) min = Math.max(0, max - 1000);
        else max = Math.min(50000, min + 1000);
      }
      newFilters.priceRange = [min, max];
    }
    
    newLegs[legIndex] = {
      ...leg,
      filters: newFilters
    };
    
    // Immediately apply filters to this leg
    const filteredFlights = applyFiltersForLeg(legIndex);
    const suggestedFlights = calculateSuggestedFlights(filteredFlights);
    
    newLegs[legIndex] = {
      ...newLegs[legIndex],
      filteredFlights: filteredFlights,
      suggestedFlights: suggestedFlights,
      activeFiltersCount: calculateActiveFiltersCount(newFilters)
    };
    
    return newLegs;
  });
};

// Helper function to calculate active filters count
const calculateActiveFiltersCount = (filters) => {
  let count = 0;
  
  // Check airlines
  if (filters.airlines && filters.airlines.length > 0) count++;
  
  // Check stops
  if (filters.stops && filters.stops.length > 0) count++;
  
  // Check departure time slots
  if (filters.departureTimeSlots && filters.departureTimeSlots.length > 0) count++;
  
  // Check arrival time slots
  if (filters.arrivalTimeSlots && filters.arrivalTimeSlots.length > 0) count++;
  
  // Check price range (not default)
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    const defaultMin = 0;
    const defaultMax = 50000;
    if (min !== defaultMin || max !== defaultMax) count++;
  }
  
  // Check duration range (not default)
  if (filters.durationRange) {
    const [min, max] = filters.durationRange;
    const defaultMin = 0;
    const defaultMax = 1440;
    if (min !== defaultMin || max !== defaultMax) count++;
  }
  
  // Check aircraft
  if (filters.aircraft && filters.aircraft.length > 0) count++;
  
  // Check layover airports
  if (filters.layoverAirports && filters.layoverAirports.length > 0) count++;
  
  // Check layover duration (not default)
  if (filters.minLayoverDuration !== 0 || filters.maxLayoverDuration !== 480) count++;
  
  // Check nearby airports
  if (filters.nearbyAirports) count++;
  
  return count;
};

  // Handle checkbox change for a leg
// Update the handleLegCheckboxChange function:
const handleLegCheckboxChange = (legIndex, filterType, item, event) => {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  setJourneyLegs(prev => {
    const newLegs = [...prev];
    const leg = newLegs[legIndex];
    const currentItems = [...(leg.filters[filterType] || [])];
    const index = currentItems.indexOf(item);
    
    if (index > -1) {
      currentItems.splice(index, 1);
    } else {
      currentItems.push(item);
    }
    
    const newFilters = {
      ...leg.filters,
      [filterType]: currentItems
    };
    
    // Calculate active filters count
    const activeFiltersCount = Object.entries(newFilters).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      } else if (typeof value === 'boolean') {
        return value;
      } else if (key === 'priceRange' || key === 'durationRange') {
        return value[0] !== 0 || value[1] !== 50000;
      } else if (key === 'minLayoverDuration' || key === 'maxLayoverDuration') {
        return key === 'minLayoverDuration' ? value !== 0 : value !== 480;
      }
      return false;
    }).length;
    
    newLegs[legIndex] = {
      ...leg,
      filters: newFilters,
      activeFiltersCount
    };
    
    return newLegs;
  });
};

  // Toggle section for a leg
  const toggleLegSection = (legIndex, section) => {
    setJourneyLegs(prev => {
      const newLegs = [...prev];
      newLegs[legIndex] = {
        ...newLegs[legIndex],
        expandedSections: {
          ...newLegs[legIndex].expandedSections,
          [section]: !newLegs[legIndex].expandedSections[section]
        }
      };
      return newLegs;
    });
  };

  // Reset filters for a leg
// Update the resetLegFilters function:
const resetLegFilters = (legIndex) => {
  setJourneyLegs(prev => {
    const newLegs = [...prev];
    const leg = newLegs[legIndex];
    
    const prices = leg.flightsData.map(f => f.price);
    const durations = leg.flightsData.map(f => f.duration);
    
    const layoverDurations = leg.flightsData
      .filter(f => f.layover_details && f.layover_details.length > 0)
      .flatMap(f => f.layover_details.map(l => l.duration));
    
    const minLayoverDuration = layoverDurations.length > 0 ? Math.min(...layoverDurations) : 0;
    const maxLayoverDuration = layoverDurations.length > 0 ? Math.max(...layoverDurations) : 480;
    
    newLegs[legIndex] = {
      ...leg,
      filters: {
        airlines: [],
        stops: [],
        departureTimeSlots: [],
        arrivalTimeSlots: [],
        priceRange: [Math.min(...prices), Math.max(...prices)],
        durationRange: [Math.min(...durations), Math.max(...durations)],
        layoverAirports: [],
        minLayoverDuration,
        maxLayoverDuration: Math.max(maxLayoverDuration, 480),
        aircraft: [],
        nearbyAirports: false
      },
      activeFiltersCount: 0,
      filteredFlights: leg.flightsData, // Reset to all flights
      suggestedFlights: calculateSuggestedFlights(leg.flightsData) // Recalculate suggestions
    };
    
    return newLegs;
  });
};

  // Update sort for a leg
  const updateLegSort = (legIndex, sortBy) => {
    setJourneyLegs(prev => {
      const newLegs = [...prev];
      newLegs[legIndex] = {
        ...newLegs[legIndex],
        sortBy
      };
      return newLegs;
    });
  };

  // =================== FLIGHT DIRECTION FUNCTIONS ===================

  // Update a single flight's direction
  const updateFlightDirection = (legIndex, flightId, direction) => {
    setJourneyLegs(prev => {
      const newLegs = [...prev];
      const leg = newLegs[legIndex];
      
      const updateDirection = (flights) => flights.map(f =>
        f.id === flightId ? { ...f, flight_direction: direction } : f
      );
      
      leg.flightsData = updateDirection(leg.flightsData);
      leg.filteredFlights = updateDirection(leg.filteredFlights);
      leg.suggestedFlights = updateDirection(leg.suggestedFlights);
      leg.flights = updateDirection(leg.flights); // selected flights
      
      return newLegs;
    });
  };

  // Set all flights in a leg to a specific direction
  const setAllFlightsDirection = (legIndex, direction) => {
    setJourneyLegs(prev => {
      const newLegs = [...prev];
      const leg = newLegs[legIndex];
      
      const setDirection = (flights) => flights.map(f => ({ ...f, flight_direction: direction }));
      
      leg.flightsData = setDirection(leg.flightsData);
      leg.filteredFlights = setDirection(leg.filteredFlights);
      leg.suggestedFlights = setDirection(leg.suggestedFlights);
      leg.flights = setDirection(leg.flights);
      
      return newLegs;
    });
  };

  // Set all flights across all legs to a specific direction
  const setAllFlightsDirectionGlobal = (direction) => {
    setJourneyLegs(prev => prev.map(leg => ({
      ...leg,
      flightsData: leg.flightsData.map(f => ({ ...f, flight_direction: direction })),
      filteredFlights: leg.filteredFlights.map(f => ({ ...f, flight_direction: direction })),
      suggestedFlights: leg.suggestedFlights.map(f => ({ ...f, flight_direction: direction })),
      flights: leg.flights.map(f => ({ ...f, flight_direction: direction }))
    })));
  };

  // =================== UTILITY FUNCTIONS ===================

  // Toggle trip type for a leg
  const toggleLegTripType = (legIndex) => {
    setJourneyLegs(prev => {
      const newLegs = [...prev];
      const leg = newLegs[legIndex];
      const newTripType = leg.searchParams.trip_type === 'one-way' ? 'roundtrip' : 'one-way';
      
      // Get current date for return date calculation
      const currentDate = new Date(leg.searchParams.date);
      const returnDate = new Date(currentDate);
      returnDate.setDate(returnDate.getDate() + 7); // Default return 7 days later
      
      newLegs[legIndex] = {
        ...leg,
        searchParams: {
          ...leg.searchParams,
          trip_type: newTripType,
          return_date: returnDate.toISOString().split('T')[0]
        }
      };
      
      return newLegs;
    });
  };

  // Handle search for a leg
  const handleLegSearch = (legIndex) => {
    fetchFlightsForLeg(legIndex);
  };

  // Get total selected flights count
  const getTotalSelectedFlights = () => {
    return journeyLegs.reduce((total, leg) => total + leg.flights.length, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return journeyLegs.reduce((total, leg) => 
      total + leg.flights.reduce((legTotal, flight) => legTotal + flight.price, 0), 0
    );
  };

  // Get journey summary for display
  const getJourneySummary = () => {
    if (journeyLegs.length === 0) return '';
    
    const legs = journeyLegs.map(leg => {
      if (leg.flights.length > 0) {
        return `${leg.flights[0].departure_airport} → ${leg.flights[0].arrival_airport}`;
      }
      return `${leg.searchParams.from} → ${leg.searchParams.to}`;
    });
    
    return legs.join(' → ');
  };

  // Toggle leg visibility in compare view
  const toggleLegVisibility = (legIndex) => {
    setVisibleLegs(prev => {
      if (prev.includes(legIndex)) {
        return prev.filter(idx => idx !== legIndex);
      } else {
        return [...prev, legIndex].sort((a, b) => a - b);
      }
    });
  };

  // =================== SUBMISSION ===================

  // Extract flight connection details for API submission
const extractConnectionDetails = (flight) => {
  // Helper function to extract only date part (YYYY-MM-DD)
  const formatDateOnly = (dateTimeStr) => {
    if (!dateTimeStr) return new Date().toISOString().split('T')[0];
    // If it's already a Date object
    if (dateTimeStr instanceof Date) {
      return dateTimeStr.toISOString().split('T')[0];
    }
    // If it contains T (ISO format), split and take date part
    if (dateTimeStr.includes('T')) {
      return dateTimeStr.split('T')[0];
    }
    // If it's just a date string
    if (dateTimeStr.includes('-') && dateTimeStr.length === 10) {
      return dateTimeStr;
    }
    // Default fallback
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to extract time part (HH:MM)
  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return '00:00';
    try {
      let date;
      if (dateTimeStr instanceof Date) {
        date = dateTimeStr;
      } else if (dateTimeStr.includes('T')) {
        date = new Date(dateTimeStr);
      } else {
        // Try to parse as time string
        const timeMatch = dateTimeStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        }
        return '00:00';
      }
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '00:00';
    }
  };

  // Handle API roundtrip structure
  if (flight.trip_type === 'roundtrip' && flight.outbound && flight.return) {
    const outboundDetails = {
      flight_number: flight.outbound.flight_number || '',
      from_airport: flight.outbound.departure_airport || '',
      to_airport: flight.outbound.arrival_airport || '',
      dep_time: formatTimeOnly(flight.outbound.departure_time),
      dep_date: formatDateOnly(flight.outbound.departure_time),
      arv_time: formatTimeOnly(flight.outbound.arrival_time),
      arv_date: formatDateOnly(flight.outbound.arrival_time),
      dep_terminal: flight.outbound.departure_terminal?.replace('T', '') || null,
      arv_terminal: flight.outbound.arrival_terminal?.replace('T', '') || null,
      flight_direction: 'onward'  // ← ADD THIS
    };
    
    const returnDetails = {
      flight_number: flight.return.flight_number || '',
      from_airport: flight.return.departure_airport || '',
      to_airport: flight.return.arrival_airport || '',
      dep_time: formatTimeOnly(flight.return.departure_time),
      dep_date: formatDateOnly(flight.return.departure_time),
      arv_time: formatTimeOnly(flight.return.arrival_time),
      arv_date: formatDateOnly(flight.return.arrival_time),
      dep_terminal: flight.return.departure_terminal?.replace('T', '') || null,
      arv_terminal: flight.return.arrival_terminal?.replace('T', '') || null,
      flight_direction: 'return'  // ← ADD THIS
    };
    
    return {
      trip_type: 'roundtrip',
      outbound: outboundDetails,
      return: returnDetails
    };
  }
  
  // Handle one-way or old structure
  let departureDateTime, arrivalDateTime;
  
  try {
    departureDateTime = new Date(flight.departure_time);
    arrivalDateTime = new Date(flight.arrival_time);
  } catch (error) {
    console.error('Error parsing flight dates:', error);
    departureDateTime = new Date();
    arrivalDateTime = new Date();
  }
  
  const outboundDetails = {
    flight_number: flight.flight_number || '',
    from_airport: flight.departure_airport || '',
    to_airport: flight.arrival_airport || '',
    dep_time: formatTimeOnly(flight.departure_time),
    dep_date: formatDateOnly(flight.departure_time),
    arv_time: formatTimeOnly(flight.arrival_time),
    arv_date: formatDateOnly(flight.arrival_time),
    dep_terminal: flight.departure_terminal?.replace('T', '') || null,
    arv_terminal: flight.arrival_terminal?.replace('T', '') || null,
    flight_direction: flight.flight_direction || 'onward'  // ← ADD THIS
  };
  
  if (flight.trip_type === 'roundtrip' && flight.return_flight) {
    const returnDetails = {
      flight_number: flight.return_flight.flight_number || '',
      from_airport: flight.return_flight.departure_airport || '',
      to_airport: flight.return_flight.arrival_airport || '',
      dep_time: formatTimeOnly(flight.return_flight.departure_time),
      dep_date: formatDateOnly(flight.return_flight.departure_time),
      arv_time: formatTimeOnly(flight.return_flight.arrival_time),
      arv_date: formatDateOnly(flight.return_flight.arrival_time),
      dep_terminal: flight.return_flight.departure_terminal?.replace('T', '') || null,
      arv_terminal: flight.return_flight.arrival_terminal?.replace('T', '') || null,
      flight_direction: 'return'  // ← ADD THIS
    };
    
    return {
      trip_type: 'roundtrip',
      outbound: outboundDetails,
      return: returnDetails
    };
  }
  
  return {
    trip_type: 'one-way',
    ...outboundDetails
  };
};

  // Submit complete multi-leg journey
  const submitSelectedFlights = async () => {
    const incompleteLegs = journeyLegs.filter(leg => leg.flights.length === 0);
    if (incompleteLegs.length > 0) {
      setSubmitStatus({
        type: 'error',
        message: `Please select flights for: ${incompleteLegs.map(l => l.name).join(', ')}`
      });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitStatus({ type: '', message: '' });

      const leadId = leadID
      
      const connections = journeyLegs.flatMap(leg => 
        leg.flights.map(flight => extractConnectionDetails(flight))
      );
      
      console.log('Submitting multi-leg journey:', {
        lead_id: leadId,
        connections: connections,
        legs_count: journeyLegs.length
      });
      
      const response = await axios.post(`${API_BASE_URL}/flight-connections/journeys`, {
        lead_id: leadId,
        connections: connections,
        journey_type: 'multi-leg',
        leg_count: journeyLegs.length,
        total_price: getTotalPrice()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const totalFlights = journeyLegs.reduce((sum, leg) => sum + leg.flights.length, 0);
        setSubmitStatus({
          type: 'success',
          message: `✅ Successfully submitted ${totalFlights} flight${totalFlights > 1 ? 's' : ''} across ${journeyLegs.length} leg${journeyLegs.length > 1 ? 's' : ''}`
        });
        
        // Refresh the submitted journeys list
        fetchSubmittedJourneys();
        
        setTimeout(() => {
          clearAllJourney();
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to submit flights'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =================== FLIGHT API FUNCTIONS ===================

  // Fetch flights for a specific leg
  const fetchFlightsForLeg = async (legIndex) => {
    try {
      const leg = journeyLegs[legIndex];
      setJourneyLegs(prev => prev.map((l, idx) => 
        idx === legIndex ? { ...l, loading: true, error: null } : l
      ));
      
      const response = await searchFlights(
        leg.searchParams.from.toUpperCase(), 
        leg.searchParams.to.toUpperCase(), 
        leg.searchParams.date, 
        leg.searchParams.return_date, 
        leg.searchParams.trip_type
      );
      
      if (response.success) {
        let processedFlights = response.flights;
        const enhancedFlights = enhanceFlightsWithLayover(processedFlights);
        
        // Extract filter options
        const filterOptions = extractFilterOptionsForLeg(enhancedFlights);
        const filters = { ...leg.filters };
        
        // Update price range based on new flights
      // In fetchFlightsForLeg function, update the price range setup:
const prices = enhancedFlights.map(f => f.price);
const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
const maxPrice = prices.length > 0 ? Math.max(...prices) : 50000;

// Ensure min and max are valid numbers
const safeMinPrice = isNaN(minPrice) ? 0 : minPrice;
const safeMaxPrice = isNaN(maxPrice) ? 50000 : maxPrice;

filters.priceRange = [safeMinPrice, safeMaxPrice];
        
        // Update duration range
        const durations = enhancedFlights.map(f => f.duration);
        const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
        const maxDuration = durations.length > 0 ? Math.max(...durations) : 1440;
        filters.durationRange = [minDuration, maxDuration];
        
        // Calculate suggested flights
        const suggestedFlights = calculateSuggestedFlights(enhancedFlights);
        
        setJourneyLegs(prev => prev.map((l, idx) => 
          idx === legIndex ? {
            ...l,
            flightsData: enhancedFlights,
            filteredFlights: enhancedFlights,
            suggestedFlights,
            filterOptions,
            filters,
            loading: false,
            error: null,
            activeFiltersCount: 0
          } : l
        ));
        
      } else {
        setJourneyLegs(prev => prev.map((l, idx) => 
          idx === legIndex ? {
            ...l,
            loading: false,
            error: response.message || 'Failed to load flights'
          } : l
        ));
      }
    } catch (err) {
      console.error('Error in fetchFlightsForLeg:', err);
      setJourneyLegs(prev => prev.map((l, idx) => 
        idx === legIndex ? {
          ...l,
          loading: false,
          error: 'Failed to load flights. Please try again.'
        } : l
      ));
    }
  };

  // Add this function with your other helper functions (around line 200-300)
const initPnrCreationFromPassenger = (passenger) => {
  // Generate a random PNR number
  const randomPnr = `PNR${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Get passenger form data
  const formData = formatPassengerFormData(passenger.form_data);
  
  // Create a default flight segment based on passenger's hub
  const defaultFlightSegment = {
    flight_number: 'AI101',
    from_airport: formData.airport_code || 'DEL',
    to_airport: 'LHR',
    departure_date: new Date().toISOString().split('T')[0],
    departure_time: '10:00',
    arrival_date: new Date().toISOString().split('T')[0],
    arrival_time: '15:00',
    duration: '5h 0m',
    dep_terminal: '3',
    arv_terminal: '5',
    leg_id: 1,
    segment_order: 1
  };
  
  // Set PNR creation data
  setPnrCreationData({
    pnr_number: randomPnr,
    pnr_type: 'individual',
    pax_count: 1,
    assign_pax_count: 1,
    cost_per_pax: 25000,
    base_fare: 20000,
    tax_value: 5000,
    sale_fare: 25000,
    chair_type: 'Economy',
    lead_id: leadID,
    flight_segments: [defaultFlightSegment],
    selected_passengers: [passenger.id],
    selected_flight_ids: []
  });
  
  // Set a simple connection for PNR
  setSelectedConnectionForPnr({
    journey: [],
    legs: [{
      id: 1,
      name: 'Leg 1',
      flights: [{
        id: 'flight-1',
        flight_number: 'AI101',
        from_airport: formData.airport_code || 'DEL',
        to_airport: 'LHR',
        dep_time: '10:00',
        dep_date: new Date().toISOString().split('T')[0],
        arv_time: '15:00',
        arv_date: new Date().toISOString().split('T')[0],
        dep_terminal: '3',
        arv_terminal: '5',
        originalIndex: 0,
        leg_id: 1,
        isSelected: true,
        flightPrice: 25000
      }],
      isSelected: true,
      isCollapsed: false
    }],
    allFlights: [{
      id: 'flight-1',
      flight_number: 'AI101',
      from_airport: formData.airport_code || 'DEL',
      to_airport: 'LHR',
      dep_time: '10:00',
      dep_date: new Date().toISOString().split('T')[0],
      arv_time: '15:00',
      arv_date: new Date().toISOString().split('T')[0],
      dep_terminal: '3',
      arv_terminal: '5',
      originalIndex: 0,
      leg_id: 1,
      isSelected: true,
      flightPrice: 25000
    }],
    flightSelectionState: {
      'flight-1': true
    },
    selectedFlightIds: ['flight-1']
  });
  
  setShowPnrCreation(true);
  
  // Show success message
  setPnrCreationStatus({
    type: 'success',
    message: `PNR creation initialized for ${passenger.pax_code}. Please review and create.`
  });
};

// =================== HANDLE VENDOR SELECTION ===================
// Handle vendor selection
const handleVendorSelect = (vendor) => {
  setSelectedVendorForPnr(vendor);
  setShowVendorSelection(false);
  
  // Update PNR data with selected vendor
  setPnrCreationData(prev => ({
    ...prev,
    vendor_id: vendor.id,
    vendor_name: vendor.vendor_name,
    vendor_business: vendor.business_name,
    vendor_email: vendor.email,
    vendor_phone: vendor.phone,
    vendor_type: vendor.vendor_type
  }));

  setShowPnrCreation(true);
  
  setPnrCreationStatus({
    type: 'success',
    message: `PNR creation initialized with vendor: ${vendor.vendor_name} (${vendor.business_name})`
  });
};

// Create PNR from selected passengers with vendor selection
const createPnrFromPassengers = () => {
  if (selectedPassengers.length === 0) {
    setPnrCreationStatus({
      type: 'error',
      message: 'Please select at least one passenger'
    });
    return;
  }

  // Load passenger data if not already loaded
  if (passengerData.length === 0) {
    fetchPassengerData();
    return;
  }

  // Filter selected passengers
  const selectedPassengersData = passengerData.filter(p => 
    selectedPassengers.includes(p.id)
  );

  // Group passengers by hub/airport code
  const passengersByHub = {};
  selectedPassengersData.forEach(passenger => {
    const formData = formatPassengerFormData(passenger.form_data);
    const hubCode = formData.airport_code || formData.airportCode || 'UNKNOWN';
    
    if (!passengersByHub[hubCode]) {
      passengersByHub[hubCode] = [];
    }
    passengersByHub[hubCode].push(passenger);
  });

  // Get hub with most passengers
  let maxHub = null;
  let maxCount = 0;
  Object.entries(passengersByHub).forEach(([hubCode, passengers]) => {
    if (passengers.length > maxCount) {
      maxCount = passengers.length;
      maxHub = hubCode;
    }
  });

  // Generate a random PNR number
  const randomPnr = `PNR${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Create default flight segments based on passenger hubs
  const flightSegments = Object.entries(passengersByHub).map(([hubCode, hubPassengers], index) => {
    // Get a sample passenger from this hub
    const samplePassenger = hubPassengers[0];
    const formData = formatPassengerFormData(samplePassenger.form_data);
    
    return {
      flight_number: `AI${100 + index}`,
      from_airport: hubCode,
      to_airport: maxHub === hubCode ? 'LHR' : maxHub, // Connect to hub with most passengers
      departure_date: new Date().toISOString().split('T')[0],
      departure_time: `${9 + index}:00`,
      arrival_date: new Date().toISOString().split('T')[0],
      arrival_time: `${12 + index}:00`,
      duration: `${3 + index}h 0m`,
      dep_terminal: `${index + 1}`,
      arv_terminal: `${index + 2}`,
      leg_id: index + 1,
      segment_order: index + 1
    };
  });

  // Calculate total price based on number of passengers and segments
  const basePricePerSegment = 25000;
  const totalPrice = flightSegments.length * basePricePerSegment * selectedPassengers.length;

  // Create mock flight data for selection
  const mockFlights = flightSegments.map((segment, index) => ({
    id: `flight-${index}-${Date.now()}`,
    flight_number: segment.flight_number,
    from_airport: segment.from_airport,
    to_airport: segment.to_airport,
    dep_time: segment.departure_time,
    dep_date: segment.departure_date,
    arv_time: segment.arrival_time,
    arv_date: segment.arrival_date,
    dep_terminal: segment.dep_terminal,
    arv_terminal: segment.arv_terminal,
    originalIndex: index,
    leg_id: segment.leg_id,
    isSelected: true,
    flightPrice: basePricePerSegment
  }));

  // Group flights into legs
  const legs = flightSegments.map((segment, index) => ({
    id: index + 1,
    name: `Leg ${index + 1}: ${segment.from_airport} → ${segment.to_airport}`,
    flights: [mockFlights[index]],
    isSelected: true,
    isCollapsed: false
  }));

  // Create flight selection state
  const flightSelectionState = {};
  mockFlights.forEach(flight => {
    flightSelectionState[flight.id] = true;
  });

  // Store selected passengers data for display
  const passengerConnections = selectedPassengersData.map(passenger => ({
    id: passenger.id,
    pax_code: passenger.pax_code,
    hub: formatPassengerFormData(passenger.form_data).airport_code || 'UNKNOWN'
  }));

  // Set up the PNR creation modal
  setSelectedConnectionForPnr({
    journey: mockFlights,
    legs: legs,
    allFlights: mockFlights,
    flightSelectionState: flightSelectionState,
    selectedFlightIds: mockFlights.map(f => f.id),
    passengerConnections: passengerConnections
  });

  setPnrCreationData({
    pnr_number: randomPnr,
    pnr_type: selectedPassengers.length > 1 ? 'group' : 'individual',
    pax_count: selectedPassengers.length,
    assign_pax_count: selectedPassengers.length,
    cost_per_pax: totalPrice / selectedPassengers.length,
    base_fare: totalPrice * 0.8,
    tax_value: totalPrice * 0.2,
    sale_fare: totalPrice,
    chair_type: 'Economy',
    lead_id: leadID,
    flight_segments: flightSegments,
    selected_passengers: selectedPassengers,
    selected_flight_ids: mockFlights.map(f => f.id)
  });

  // ✅ Fetch and show flight vendors
  const fetchAndShowVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/vendors`);
      const result = await response.json();
      
      if (result.success) {
        // Filter vendors with vendor_category === "Flight"
        const flightVendors = result.data.filter(
          vendor => vendor.vendor_category === "Flight"
        );
        
        if (flightVendors.length === 0) {
          // No flight vendors found - show warning but still allow PNR creation
          setPnrCreationStatus({
            type: 'warning',
            message: 'No flight vendors found. Please add flight vendors first.'
          });
          setShowPnrCreation(true);
          return;
        }

        // If only one flight vendor, auto-select it
        if (flightVendors.length === 1) {
          const vendor = flightVendors[0];
          setSelectedVendorForPnr(vendor);
          setAvailableFlightVendors(flightVendors);
          
          // Update PNR data with vendor info
          setPnrCreationData(prev => ({
            ...prev,
            vendor_id: vendor.id,
            vendor_name: vendor.vendor_name,
            vendor_business: vendor.business_name,
            vendor_email: vendor.email,
            vendor_phone: vendor.phone,
            vendor_type: vendor.vendor_type
          }));

          setShowPnrCreation(true);
          setPnrCreationStatus({
            type: 'success',
            message: `PNR creation initialized for ${selectedPassengers.length} passenger(s) with vendor: ${vendor.vendor_name}`
          });
        } else {
          // Multiple vendors - show selection modal
          setAvailableFlightVendors(flightVendors);
          setShowVendorSelection(true);
          
          // Don't open PNR modal yet - wait for vendor selection
          setPnrCreationStatus({
            type: 'info',
            message: `Please select a flight vendor from the ${flightVendors.length} available options`
          });
        }
      } else {
        setPnrCreationStatus({
          type: 'error',
          message: 'Failed to fetch vendors. Please try again.'
        });
        setShowPnrCreation(true);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setPnrCreationStatus({
        type: 'error',
        message: 'Failed to connect to server. Please check if backend is running.'
      });
      setShowPnrCreation(true);
    } finally {
      setLoading(false);
    }
  };

  // Call the vendor fetch function
  fetchAndShowVendors();
};

  // =================== RENDER FUNCTIONS ===================

  // Render PNR Creation Modal with All Submitted Journeys
  const renderPnrCreationModal = () => {
    if (!showPnrCreation) return null;

    // Use submittedJourneys as the data source
    const allJourneys = submittedJourneys;

    // Get selected flights
    const selectedFlights = allJourneys
      .flatMap(j => j)
      .filter(f => pnrCreationData.selected_flight_ids?.includes(f.id));

    // Validate flight continuity
    const validationResult = validateFlightContinuity(selectedFlights);
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '11px' }}>
                    Create PNR - Select from Submitted Journeys
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5" style={{ fontSize: '9.5px' }}>
                    {allJourneys.length} journeys available • Select flights to include in PNR
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPnrCreation(false);
                  setPnrCreationStatus({ type: '', message: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Show All Submitted Journeys */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-1.5" style={{ fontSize: '10px' }}>
                <History className="w-3.5 h-3.5 text-blue-600" />
                Select Flights from Submitted Journeys
                <span className="text-blue-600 font-normal">
                  ({pnrCreationData.selected_flight_ids?.length || 0} flights selected)
                </span>
              </h4>
              
              {/* Journeys List - Similar to submitted journeys view */}
              {allJourneys.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Plane className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2" style={{ fontSize: '9.5px' }}>
                    No submitted journeys found
                  </p>
                  <p className="text-xs text-gray-500" style={{ fontSize: '8.5px' }}>
                    Submit journeys first to create PNRs
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allJourneys.map((journey, journeyIndex) => {
                    const journeyId = journey[0]?.journey_id || `journey-${journeyIndex}`;
                    const isExpanded = expandedJourneyId === journeyId;
                    
                    // Count selected flights in this journey
                    const selectedFlightsInJourney = journey.filter(flight => 
                      pnrCreationData.selected_flight_ids?.includes(flight.id)
                    ).length;
                    
                    return (
                      <div key={journeyId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Journey Header */}
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                journey.length > 1 
                                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                <Package className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>
                                    Journey #{journeyIndex + 1} • {journey.length} flight{journey.length > 1 ? 's' : ''}
                                  </h3>
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                    journey.length > 1 
                                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                                  }`} style={{ fontSize: '9px' }}>
                                    {journey.length > 1 ? 'Multi-Flight' : 'Single Flight'}
                                  </span>
                                  {selectedFlightsInJourney > 0 && (
                                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full" style={{ fontSize: '8px' }}>
                                      {selectedFlightsInJourney} selected
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5" style={{ fontSize: '9px' }}>
                                  <CalendarDays className="w-3 h-3" />
                                  Submitted {formatDisplayDate(journey[0]?.created_at || new Date())}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (isExpanded) {
                                    setExpandedJourneyId(null);
                                  } else {
                                    setExpandedJourneyId(journeyId);
                                  }
                                }}
                                className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                                style={{ fontSize: '9.5px' }}
                                type="button"
                              >
                                {isExpanded ? 'Collapse' : 'Expand'}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          
                          {/* Journey Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '9px' }}>Route</div>
                              <div className="text-sm font-semibold text-gray-900 flex items-center gap-1" style={{ fontSize: '10px' }}>
                                <Route className="w-3.5 h-3.5 text-blue-600" />
                                {journey[0]?.from_airport} → {journey[journey.length - 1]?.to_airport}
                              </div>
                              <div className="text-xs text-gray-600 mt-1" style={{ fontSize: '8px' }}>
                                {journey.length} flight{journey.length > 1 ? 's' : ''}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '9px' }}>Travel Dates</div>
                              <div className="text-sm font-semibold text-gray-900 flex items-center gap-1" style={{ fontSize: '10px' }}>
                                <Calendar className="w-3.5 h-3.5 text-green-600" />
                                {formatDisplayDate(journey[0]?.dep_date)}
                              </div>
                              <div className="text-xs text-gray-600 mt-1" style={{ fontSize: '8px' }}>
                                Duration: {getJourneyDuration(journey)}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '9px' }}>Select All</div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    // Select all flights in this journey
                                    const flightIds = journey.map(flight => flight.id);
                                    const newSelectedIds = [...new Set([
                                      ...(pnrCreationData.selected_flight_ids || []),
                                      ...flightIds
                                    ])];
                                    
                                    setPnrCreationData(prev => ({
                                      ...prev,
                                      selected_flight_ids: newSelectedIds,
                                      flight_segments: extractFlightSegments(
                                        allJourneys.flatMap(j => j)
                                          .filter(f => newSelectedIds.includes(f.id))
                                      )
                                    }));
                                  }}
                                  className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1.5 rounded-md transition-colors"
                                  style={{ fontSize: '9px' }}
                                  type="button"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={() => {
                                    // Deselect all flights in this journey
                                    const flightIds = journey.map(flight => flight.id);
                                    const newSelectedIds = (pnrCreationData.selected_flight_ids || []).filter(
                                      id => !flightIds.includes(id)
                                    );
                                    
                                    setPnrCreationData(prev => ({
                                      ...prev,
                                      selected_flight_ids: newSelectedIds,
                                      flight_segments: extractFlightSegments(
                                        allJourneys.flatMap(j => j)
                                          .filter(f => newSelectedIds.includes(f.id))
                                      )
                                    }));
                                  }}
                                  className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-2 py-1.5 rounded-md transition-colors"
                                  style={{ fontSize: '9px' }}
                                  type="button"
                                >
                                  Deselect All
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Flight Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="space-y-3">
                              {journey.map((flight, flightIndex) => {
                                const isSelected = pnrCreationData.selected_flight_ids?.includes(flight.id) || false;
                                
                                return (
                                  <div key={flight.id} className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const flightId = flight.id;
                                            const isChecked = e.target.checked;
                                            
                                            let newSelectedIds;
                                            if (isChecked) {
                                              newSelectedIds = [...(pnrCreationData.selected_flight_ids || []), flightId];
                                            } else {
                                              newSelectedIds = (pnrCreationData.selected_flight_ids || []).filter(
                                                id => id !== flightId
                                              );
                                            }
                                            
                                            // Update selected flights
                                            const selectedFlights = allJourneys.flatMap(j => j)
                                              .filter(f => newSelectedIds.includes(f.id));
                                            
                                            // Validate continuity
                                            const validation = validateFlightContinuity(selectedFlights);
                                            
                                            setPnrCreationData(prev => ({
                                              ...prev,
                                              selected_flight_ids: newSelectedIds,
                                              flight_segments: extractFlightSegments(selectedFlights)
                                            }));
                                            
                                            // Show warning if invalid (but allow selection)
                                            if (!validation.isValid && selectedFlights.length > 1) {
                                              setPnrCreationStatus({
                                                type: 'warning',
                                                message: `Journey has continuity gaps. Please ensure flights connect properly.`
                                              });
                                            } else if (validation.isValid && selectedFlights.length > 1) {
                                              setPnrCreationStatus({
                                                type: 'success',
                                                message: `✓ Journey continuity validated: ${validation.route}`
                                              });
                                            } else {
                                              setPnrCreationStatus({ type: '', message: '' });
                                            }
                                          }}
                                          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          id={`flight-${flight.id}`}
                                        />
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold" style={{ fontSize: '9px' }}>
                                          {flightIndex + 1}
                                        </div>
                                        <div>
                                          <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>
                                            Flight {flight.flight_number}
                                          </div>
                                          <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                                            {flight.from_airport} → {flight.to_airport}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right">
                                        <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Terminal</div>
                                        <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>
                                          {flight.dep_terminal} → {flight.arv_terminal}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Flight Timeline */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="text-center">
                                        <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                          {formatDisplayTime(flight.dep_time)}
                                        </div>
                                        <div className="text-xs text-gray-700" style={{ fontSize: '9.5px' }}>
                                          {flight.from_airport}
                                        </div>
                                        <div className="text-xs text-gray-500" style={{ fontSize: '8px' }}>
                                          {formatDisplayDate(flight.dep_date)}
                                        </div>
                                      </div>
                                      
                                      <div className="flex-1 px-4">
                                        <div className="relative">
                                          <div className="h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                                          <div className="h-px bg-gradient-to-r from-transparent to-blue-500"></div>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-xs">
                                              <div className="flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5 text-gray-500" />
                                                <span className="text-xs font-medium text-gray-700" style={{ fontSize: '9px' }}>
                                                  Direct
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-center">
                                        <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                          {formatDisplayTime(flight.arv_time)}
                                        </div>
                                        <div className="text-xs text-gray-700" style={{ fontSize: '9.5px' }}>
                                          {flight.to_airport}
                                        </div>
                                        <div className="text-xs text-gray-500" style={{ fontSize: '8px' }}>
                                          {formatDisplayDate(flight.arv_date)}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-2" style={{ fontSize: '9px' }}>
                                      <div>
                                        <span className="font-medium">Airport:</span> {getAirportName(flight.from_airport)} → {getAirportName(flight.to_airport)}
                                      </div>
                                      <div className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {isSelected ? 'Selected ✓' : 'Not selected'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Passenger Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
              <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-1.5" style={{ fontSize: '10px' }}>
                <UsersIcon className="w-3.5 h-3.5 text-blue-600" />
                Select Passengers ({pnrCreationData.selected_passengers.length} selected)
              </h4>
              
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                {loadingPassengers ? (
                  <div className="text-center py-4">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2" style={{ fontSize: '9px' }}>Loading passengers...</p>
                  </div>
                ) : passengerData.length === 0 ? (
                  <div className="text-center py-4 text-gray-500" style={{ fontSize: '9.5px' }}>
                    No passengers available
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {passengerData.map((passenger) => {
                      const isSelected = pnrCreationData.selected_passengers.includes(passenger.id);
                      const hasExistingPnr = passenger.pnr_number;
                      const formData = formatPassengerFormData(passenger.form_data);
                      
                      return (
                        <div key={passenger.id} className={`flex items-center justify-between p-2 rounded-md border ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        } ${hasExistingPnr ? 'opacity-75' : ''}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setPnrCreationData(prev => ({
                                  ...prev,
                                  selected_passengers: checked
                                    ? [...prev.selected_passengers, passenger.id]
                                    : prev.selected_passengers.filter(id => id !== passenger.id),
                                  assign_pax_count: checked
                                    ? prev.assign_pax_count + 1
                                    : Math.max(prev.assign_pax_count - 1, 1)
                                }));
                              }}
                              disabled={hasExistingPnr}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>
                                  {passenger.pax_code}
                                </span>
                                {hasExistingPnr && (
                                  <span className="px-1 py-0.5 bg-amber-100 text-amber-700 text-xs rounded" style={{ fontSize: '8px' }}>
                                    Has PNR
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600" style={{ fontSize: '8.5px' }}>
                                {formData.email || 'No email'} • {formData.emp_id || 'No ID'}
                              </div>
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            passenger.pax_status === 'Completed' 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : passenger.pax_status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`} style={{ fontSize: '8.5px' }}>
                            {passenger.pax_status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                  {pnrCreationData.selected_passengers.length} passenger(s) selected
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      // Select all available passengers
                      const availablePassengers = passengerData.filter(p => !p.pnr_number).map(p => p.id);
                      setPnrCreationData(prev => ({
                        ...prev,
                        selected_passengers: availablePassengers,
                        assign_pax_count: availablePassengers.length
                      }));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                    style={{ fontSize: '9px' }}
                    type="button"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      setPnrCreationData(prev => ({
                        ...prev,
                        selected_passengers: [],
                        assign_pax_count: 1
                      }));
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                    style={{ fontSize: '9px' }}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Flight Continuity Validation */}
            {selectedFlights.length > 0 && (
              <div className="mb-4">
                <div className={`p-3 rounded-lg border ${
                  validationResult.isValid 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-xs font-medium mb-1" style={{ fontSize: '10px' }}>
                        {validationResult.isValid ? '✓ Journey Continuity Valid' : '⚠️ Journey Continuity Issue'}
                      </div>
                      
                      {validationResult.isValid ? (
                        <div className="text-xs text-emerald-700" style={{ fontSize: '9px' }}>
                          {validationResult.route}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-amber-800" style={{ fontSize: '9px' }}>
                            {validationResult.message}
                          </div>
                          
                          {validationResult.issues.map((issue, idx) => (
                            <div key={idx} className="ml-2 pl-2 border-l-2 border-amber-300">
                              <div className="text-xs text-amber-700 font-medium" style={{ fontSize: '9px' }}>
                                Gap {idx + 1}: {issue.message}
                              </div>
                              <div className="text-xs text-amber-600 mt-0.5" style={{ fontSize: '8px' }}>
                                Flight {issue.currentFlight.number}: {issue.currentFlight.from} → {issue.currentFlight.to}
                              </div>
                              <div className="text-xs text-amber-600" style={{ fontSize: '8px' }}>
                                Flight {issue.nextFlight.number}: {issue.nextFlight.from} → {issue.nextFlight.to}
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-2 pt-2 border-t border-amber-200">
                            <div className="text-xs font-medium text-amber-800" style={{ fontSize: '9px' }}>
                              Expected Pattern:
                            </div>
                            <div className="text-xs text-amber-700" style={{ fontSize: '9px' }}>
                              {validationResult.validPattern}
                            </div>
                            <div className="text-xs text-amber-600 mt-0.5" style={{ fontSize: '8px' }}>
                              {validationResult.suggestedFix}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Journey Visualization */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1" style={{ fontSize: '10px' }}>
                    <Route className="w-3.5 h-3.5" />
                    Journey Path:
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-center space-x-1 overflow-x-auto py-2">
                      {selectedFlights.map((flight, index) => {
                        const departure = flight.from_airport || flight.departure_airport;
                        const arrival = flight.to_airport || flight.arrival_airport;
                        
                        return (
                          <div key={flight.id} className="flex items-center">
                            <div className={`px-2 py-1 rounded-md border text-xs font-medium ${
                              index === 0 
                                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`} style={{ fontSize: '9px' }}>
                              {departure}
                            </div>
                            
                            {index < selectedFlights.length - 1 && (
                              <div className="px-1">
                                <div className={`w-8 h-6 flex items-center justify-center ${
                                  arrival === (selectedFlights[index + 1].from_airport || selectedFlights[index + 1].departure_airport)
                                    ? 'text-emerald-500'
                                    : 'text-amber-500'
                                }`}>
                                  {arrival === (selectedFlights[index + 1].from_airport || selectedFlights[index + 1].departure_airport) ? (
                                    <ChevronRight className="w-4 h-4" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3" />
                                  )}
                                </div>
                                <div className="text-center text-2xs text-gray-500" style={{ fontSize: '7px' }}>
                                  {arrival === (selectedFlights[index + 1].from_airport || selectedFlights[index + 1].departure_airport) 
                                    ? '✓' 
                                    : '✗'}
                                </div>
                              </div>
                            )}
                            
                            {index === selectedFlights.length - 1 && (
                              <div className="ml-1 px-2 py-1 rounded-md border text-xs font-medium bg-emerald-100 text-emerald-700 border-emerald-300" style={{ fontSize: '9px' }}>
                                {arrival}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-2xs text-gray-600" style={{ fontSize: '7px' }}>Start</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-2xs text-gray-600" style={{ fontSize: '7px' }}>Connected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        <span className="text-2xs text-gray-600" style={{ fontSize: '7px' }}>Gap</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-2xs text-gray-600" style={{ fontSize: '7px' }}>End</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* PNR Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-1.5" style={{ fontSize: '10px' }}>
                <Info className="w-3.5 h-3.5 text-blue-600" />
                PNR Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* PNR Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                    PNR Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pnrCreationData.pnr_number}
                      onChange={(e) => setPnrCreationData(prev => ({
                        ...prev,
                        pnr_number: e.target.value.toUpperCase()
                      }))}
                      placeholder="e.g., ABC123"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontSize: '9.5px' }}
                    />
                    <button
                      onClick={() => setPnrCreationData(prev => ({
                        ...prev,
                        pnr_number: `PNR${Math.floor(100000 + Math.random() * 900000)}`
                      }))}
                      className="px-2 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-medium"
                      style={{ fontSize: '9px' }}
                      type="button"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* PNR Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                    PNR Type
                  </label>
                  <select
                    value={pnrCreationData.pnr_type}
                    onChange={(e) => setPnrCreationData(prev => ({
                      ...prev,
                      pnr_type: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontSize: '9.5px' }}
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                {/* Pax Count */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                    Total Passengers
                  </label>
                  <input
                    type="number"
                    value={pnrCreationData.pax_count}
                    onChange={(e) => setPnrCreationData(prev => ({
                      ...prev,
                      pax_count: parseInt(e.target.value) || 1,
                      assign_pax_count: Math.min(parseInt(e.target.value) || 1, prev.selected_passengers.length)
                    }))}
                    min="1"
                    max="50"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontSize: '9.5px' }}
                  />
                </div>

                {/* Chair Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                    Class / Chair Type
                  </label>
                  <select
                    value={pnrCreationData.chair_type}
                    onChange={(e) => setPnrCreationData(prev => ({
                      ...prev,
                      chair_type: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontSize: '9.5px' }}
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First Class</option>
                  </select>
                </div>
              </div>

              {/* Selected Vendor Info */}
              {pnrCreationData.vendor_name && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '9.5px' }}>
                          {pnrCreationData.vendor_name}
                        </div>
                        <div className="text-xs text-gray-600" style={{ fontSize: '8.5px' }}>
                          {pnrCreationData.vendor_business} • {pnrCreationData.vendor_email}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full" style={{ fontSize: '8px' }}>
                      Flight Vendor
                    </span>
                  </div>
                </div>
              )}

              {/* Financial Details Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-xs font-semibold text-gray-900 mb-3" style={{ fontSize: '9.5px' }}>
                  Financial Details
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Cost Per Pax */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                      Cost (Per Pax) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-xs" style={{ fontSize: '9px' }}>₹</span>
                      </div>
                      <input
                        type="number"
                        value={pnrCreationData.cost_per_pax}
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          setPnrCreationData(prev => ({
                            ...prev,
                            cost_per_pax: cost,
                            base_fare: Math.round(cost * 0.8),
                            tax_value: Math.round(cost * 0.2),
                            sale_fare: cost
                          }));
                        }}
                        min="0"
                        step="100"
                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontSize: '9.5px' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Base Fare */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                      Base Fare *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-xs" style={{ fontSize: '9px' }}>₹</span>
                      </div>
                      <input
                        type="number"
                        value={pnrCreationData.base_fare}
                        onChange={(e) => {
                          const baseFare = parseFloat(e.target.value) || 0;
                          setPnrCreationData(prev => ({
                            ...prev,
                            base_fare: baseFare,
                            cost_per_pax: baseFare + prev.tax_value,
                            sale_fare: baseFare + prev.tax_value
                          }));
                        }}
                        min="0"
                        step="100"
                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                        style={{ fontSize: '9.5px' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Tax Value */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                      Tax Value *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-xs" style={{ fontSize: '9px' }}>₹</span>
                      </div>
                      <input
                        type="number"
                        value={pnrCreationData.tax_value}
                        onChange={(e) => {
                          const taxValue = parseFloat(e.target.value) || 0;
                          setPnrCreationData(prev => ({
                            ...prev,
                            tax_value: taxValue,
                            cost_per_pax: prev.base_fare + taxValue,
                            sale_fare: prev.base_fare + taxValue
                          }));
                        }}
                        min="0"
                        step="100"
                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-amber-50"
                        style={{ fontSize: '9.5px' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Sale Fare */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9px' }}>
                      Sale Fare *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-xs" style={{ fontSize: '9px' }}>₹</span>
                      </div>
                      <input
                        type="number"
                        value={pnrCreationData.sale_fare}
                        onChange={(e) => {
                          const saleFare = parseFloat(e.target.value) || 0;
                          setPnrCreationData(prev => ({
                            ...prev,
                            sale_fare: saleFare,
                            cost_per_pax: saleFare
                          }));
                        }}
                        min="0"
                        step="100"
                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-green-50"
                        style={{ fontSize: '9.5px' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Cost (Per Pax)</div>
                      <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>
                        {formatPrice(pnrCreationData.cost_per_pax)}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Base Fare</div>
                      <div className="text-xs font-semibold text-blue-600" style={{ fontSize: '10px' }}>
                        {formatPrice(pnrCreationData.base_fare)}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Tax Value</div>
                      <div className="text-xs font-semibold text-amber-600" style={{ fontSize: '10px' }}>
                        {formatPrice(pnrCreationData.tax_value)}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Sale Fare</div>
                      <div className="text-xs font-semibold text-green-600" style={{ fontSize: '10px' }}>
                        {formatPrice(pnrCreationData.sale_fare)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>
                        Total Amount ({pnrCreationData.assign_pax_count} passenger{pnrCreationData.assign_pax_count !== 1 ? 's' : ''})
                      </div>
                      <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                        {formatPrice(pnrCreationData.cost_per_pax * pnrCreationData.assign_pax_count)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {pnrCreationStatus.message && (
              <div className={`mb-3 flex items-center gap-1.5 text-xs ${
                pnrCreationStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`} style={{ fontSize: '9.5px' }}>
                {pnrCreationStatus.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {pnrCreationStatus.message}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                {pnrCreationData.selected_flight_ids?.length || 0} flights • 
                {pnrCreationData.selected_passengers?.length || 0} passengers
                {pnrCreationData.vendor_name && ` • Vendor: ${pnrCreationData.vendor_name}`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPnrCreation(false);
                    setPnrCreationStatus({ type: '', message: '' });
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  style={{ fontSize: '10px' }}
                  type="button"
                >
                  Cancel
                </button>
                
                <button
                  onClick={()=>{createPnr(selectedFlights)}}
                  disabled={creatingPnr || 
                    !pnrCreationData.selected_passengers?.length || 
                    !pnrCreationData.selected_flight_ids?.length}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                    creatingPnr
                      ? 'bg-gray-300 cursor-not-allowed'
                      : pnrCreationData.selected_passengers?.length > 0 && 
                        pnrCreationData.selected_flight_ids?.length > 0
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ fontSize: '10px' }}
                  type="button"
                >
                  {creatingPnr ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating PNR...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Create PNR
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =================== RENDER VENDOR SELECTION MODAL ===================
  const renderVendorSelectionModal = () => {
    if (!showVendorSelection) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '11px' }}>
                    Select Flight Vendor
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5" style={{ fontSize: '9.5px' }}>
                    Choose a vendor to assign to this PNR
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVendorSelection(false);
                  setPnrCreationStatus({
                    type: 'error',
                    message: 'Vendor selection cancelled'
                  });
                  setShowPnrCreation(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="mb-4">
              <p className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                {availableFlightVendors.length} flight vendors available. Select one to continue:
              </p>
            </div>

            <div className="space-y-3">
              {availableFlightVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={() => handleVendorSelect(vendor)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>
                            {vendor.vendor_name}
                          </h4>
                          <p className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                            {vendor.business_name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                            {vendor.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                            {vendor.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                            Category: {vendor.vendor_category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GlobeIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                            {vendor.country}
                          </span>
                        </div>
                      </div>

                      {/* Vendor Status Badge */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          vendor.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : vendor.status === 'Occupied'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`} style={{ fontSize: '8.5px' }}>
                          {vendor.status || 'Active'}
                        </span>
                        {vendor.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-gray-600" style={{ fontSize: '8.5px' }}>
                            <Star className="w-3 h-3 text-yellow-500" />
                            {vendor.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVendorSelect(vendor);
                      }}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
                      style={{ fontSize: '9.5px' }}
                      type="button"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                {availableFlightVendors.length} vendor{availableFlightVendors.length !== 1 ? 's' : ''} available
              </div>
              <button
                onClick={() => {
                  setShowVendorSelection(false);
                  setPnrCreationStatus({
                    type: 'error',
                    message: 'Vendor selection cancelled'
                  });
                  setShowPnrCreation(false);
                }}
                className="px-4 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                style={{ fontSize: '10px' }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =================== RENDER PASSENGER LIST VIEW ===================
  const renderPassengerListView = (activeGroupTabProp, setActiveGroupTabProp) => {
    const selectedCount = selectedPassengers.length;
    const totalCount = passengerData.length;
    
    // Use the props directly
    const activeGroupTab = activeGroupTabProp;
    const setActiveGroupTab = setActiveGroupTabProp;
    
    // Get unique group names and sort them
    const groupNames = [...new Set(passengerData.map(p => p.group_n || 'Ungrouped'))].sort();
    
    // Group passengers by group_n
    const groupedPassengers = passengerData.reduce((groups, passenger) => {
      const groupName = passenger.group_n || 'Ungrouped';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(passenger);
      return groups;
    }, {});
    
    // Filter passengers by selected hub and active group
    const filteredPassengers = passengerData.filter(passenger => {
      const formData = formatPassengerFormData(passenger.form_data);
      const passengerAirportCode = formData.airport_code || formData.airportCode;
      
      // Apply hub filter if selected
      const hubMatch = selectedHub 
        ? passengerAirportCode === selectedHub.airportCode || 
          passengerAirportCode === selectedHub.Code
        : true;
      
      // Apply group filter
      const groupMatch = activeGroupTab === 'all' 
        ? true 
        : (passenger.group_n || 'Ungrouped') === activeGroupTab;
      
      return hubMatch && groupMatch;
    });

    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Content - Table Format */}
        <div className="lg:w-3/4">
          {/* Passenger List Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900" style={{ fontSize: '11px' }}>Passenger Data</h2>
                  <p className="text-xs text-gray-600 mt-0.5" style={{ fontSize: '9.5px' }}>
                    {selectedHub 
                      ? `Viewing passengers for ${selectedHub.hub} (${selectedHub.airportCode}) - ${filteredPassengers.length} of ${totalCount}`
                      : `View all passengers for Lead #${leadID}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPassengerList(false)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  style={{ fontSize: '10px' }}
                  type="button"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Back to Builder
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon className="w-3.5 h-3.5 text-blue-600" />
                  <div className="text-xs text-blue-700 font-medium" style={{ fontSize: '9px' }}>Total</div>
                </div>
                <div className="text-2xl font-bold text-blue-900" style={{ fontSize: '16px' }}>
                  {totalCount}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <div className="text-xs text-purple-700 font-medium" style={{ fontSize: '9px' }}>Groups</div>
                </div>
                <div className="text-2xl font-bold text-purple-900" style={{ fontSize: '16px' }}>
                  {groupNames.length}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-green-600" />
                  <div className="text-xs text-green-700 font-medium" style={{ fontSize: '9px' }}>Completed</div>
                </div>
                <div className="text-2xl font-bold text-green-900" style={{ fontSize: '16px' }}>
                  {passengerData.filter(p => p.pax_status === 'Completed').length}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <div className="text-xs text-amber-700 font-medium" style={{ fontSize: '9px' }}>Pending</div>
                </div>
                <div className="text-2xl font-bold text-amber-900" style={{ fontSize: '16px' }}>
                  {passengerData.filter(p => p.pax_status === 'Pending').length}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
                <div className="flex items-center gap-2 mb-1">
                  <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                  <div className="text-xs text-indigo-700 font-medium" style={{ fontSize: '9px' }}>With PNR</div>
                </div>
                <div className="text-2xl font-bold text-indigo-900" style={{ fontSize: '16px' }}>
                  {passengerData.filter(p => p.attached_pnr && p.attached_pnr.length > 0).length}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
                <div className="flex items-center gap-2 mb-1">
                  <Route className="w-3.5 h-3.5 text-cyan-600" />
                  <div className="text-xs text-cyan-700 font-medium" style={{ fontSize: '9px' }}>With Journey</div>
                </div>
                <div className="text-2xl font-bold text-cyan-900" style={{ fontSize: '16px' }}>
                  {passengerData.filter(p => p.journey_id).length}
                </div>
              </div>
            </div>
            
            {/* API Status */}
            {loadingPassengers ? (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-blue-700 font-medium" style={{ fontSize: '10px' }}>
                    Loading passenger data from API...
                  </span>
                </div>
              </div>
            ) : passengersError ? (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                  <div>
                    <p className="text-xs text-yellow-800 font-medium" style={{ fontSize: '10px' }}>
                      API Connection Issue: {passengersError}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1" style={{ fontSize: '9px' }}>
                      Showing mock data for demonstration
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* Group Tabs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Filter by Group:</span>
                <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                  {filteredPassengers.length} passengers in current view
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* All Groups Tab */}
                <button
                  onClick={() => setActiveGroupTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    activeGroupTab === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  style={{ fontSize: '9.5px' }}
                  type="button"
                >
                  <Layers className="w-3 h-3" />
                  All Groups ({totalCount})
                </button>
                
                {/* Individual Group Tabs */}
                {groupNames.map(groupName => (
                  <button
                    key={groupName}
                    onClick={() => setActiveGroupTab(groupName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      activeGroupTab === groupName
                        ? groupName === 'Ungrouped'
                          ? 'bg-gray-700 text-white shadow-md'
                          : 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                    style={{ fontSize: '9.5px' }}
                    type="button"
                  >
                    {groupName === 'Ungrouped' ? (
                      <UserX className="w-3 h-3" />
                    ) : (
                      <Users className="w-3 h-3" />
                    )}
                    {groupName} ({groupedPassengers[groupName]?.length || 0})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={selectedCount === filteredPassengers.length && filteredPassengers.length > 0}
                    onChange={() => {
                      if (selectedCount === filteredPassengers.length) {
                        setSelectedPassengers([]);
                      } else {
                        setSelectedPassengers(filteredPassengers.map(p => p.id));
                      }
                    }}
                    className="sr-only"
                    id="select-all-passengers-table"
                  />
                  <label
                    htmlFor="select-all-passengers-table"
                    className="cursor-pointer flex items-center gap-1.5"
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                      selectedCount === filteredPassengers.length && filteredPassengers.length > 0
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selectedCount === filteredPassengers.length && filteredPassengers.length > 0 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs text-gray-700 font-medium" style={{ fontSize: '9.5px' }}>
                      Select All ({selectedCount}/{filteredPassengers.length} selected)
                    </span>
                  </label>
                </div>
                
                {selectedCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={createPnrFromPassengers}
                      className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      style={{ fontSize: '9px' }}
                      type="button"
                    >
                      <Ticket className="w-3 h-3" />
                      Create PNR ({selectedCount})
                    </button>
                    
                    <button
                      onClick={() => setSelectedPassengers([])}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
                      style={{ fontSize: '9px' }}
                      type="button"
                    >
                      <X className="w-3 h-3" />
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Passengers by Selected Group */}
          {loadingPassengers ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600 font-medium" style={{ fontSize: '10.5px' }}>
                Loading passenger data...
              </p>
            </div>
          ) : filteredPassengers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '10.5px' }}>
                No passengers found
              </h3>
              <p className="text-xs text-gray-600 mb-4" style={{ fontSize: '9.5px' }}>
                {selectedHub 
                  ? `No passengers found for ${selectedHub.hub} (${selectedHub.airportCode}) in ${activeGroupTab === 'all' ? 'any group' : `group "${activeGroupTab}"`}`
                  : activeGroupTab !== 'all'
                    ? `No passengers found in group "${activeGroupTab}"`
                    : passengersError || 'No passengers have been added to this lead yet'}
              </p>
              <button
                onClick={fetchPassengerData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 text-xs"
                style={{ fontSize: '10px' }}
                type="button"
              >
                <RefreshCw className="w-3.5 h-3.5 inline-block mr-1" />
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show current group header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      {activeGroupTab === 'all' ? (
                        <Layers className="w-5 h-5 text-white" />
                      ) : activeGroupTab === 'Ungrouped' ? (
                        <UserX className="w-5 h-5 text-white" />
                      ) : (
                        <Users className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>
                        {activeGroupTab === 'all' 
                          ? 'All Passengers' 
                          : activeGroupTab === 'Ungrouped'
                            ? 'Ungrouped Passengers'
                            : `Group ${activeGroupTab}`}
                      </h3>
                      <p className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                        {filteredPassengers.length} passengers
                      </p>
                    </div>
                  </div>
                  
                  {/* Group Quick Stats */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-green-600" style={{ fontSize: '9px' }}>
                        {filteredPassengers.filter(p => p.pax_status === 'Completed').length}
                      </div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-amber-600" style={{ fontSize: '9px' }}>
                        {filteredPassengers.filter(p => p.pax_status === 'Pending').length}
                      </div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-purple-600" style={{ fontSize: '9px' }}>
                        {filteredPassengers.filter(p => p.attached_pnr && p.attached_pnr.length > 0).length}
                      </div>
                      <div className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>With PNR</div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-2xs text-gray-500 mb-0.5" style={{ fontSize: '7.5px' }}>
                    <span>Completion Progress</span>
                    <span>{Math.round((filteredPassengers.filter(p => p.pax_status === 'Completed').length / filteredPassengers.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-green-500"
                      style={{ width: `${(filteredPassengers.filter(p => p.pax_status === 'Completed').length / filteredPassengers.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Table Header */}
              <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-3">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-1 text-xs font-semibold text-gray-700 text-center" style={{ fontSize: '9.5px' }}>Select</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Pax Code</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Contact Info</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>FC Code</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Airport</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Email</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Phone</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>Status</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-700" style={{ fontSize: '9.5px' }}>PNR / Journey</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="border border-gray-200 rounded-b-lg divide-y divide-gray-200">
                {filteredPassengers.map((passenger) => {
                  const isSelected = selectedPassengers.includes(passenger.id);
                  const formData = formatPassengerFormData(passenger.form_data);
                  const guestData = passenger.guest_data || {};
                  
                  return (
                    <div key={passenger.id} className="hover:bg-gray-50 transition-colors">
                      <div className="p-3">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Selection Checkbox */}
                          <div className="col-span-1 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePassengerSelection(passenger.id)}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              id={`table-select-${passenger.id}`}
                            />
                          </div>
                          
                          {/* Passenger Code */}
                          <div className="col-span-1">
                            <div className="text-xs font-bold text-gray-900" style={{ fontSize: '9.5px' }}>
                              {passenger.pax_code}
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="col-span-2">
                            <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9px' }}>
                              {guestData['Contact Number'] || formData.phone || 'N/A'}
                            </div>
                            <div className="text-2xs text-gray-500" style={{ fontSize: '7.5px' }}>
                              {guestData['Contact Person'] || 'Primary'}
                            </div>
                          </div>
                          
                          {/* FC Code */}
                          <div className="col-span-1">
                            <div className="text-xs text-gray-900 font-medium" style={{ fontSize: '9px' }}>
                              {formData.fc_code || 'N/A'}
                            </div>
                          </div>
                          
                          {/* Airport */}
                          <div className="col-span-1">
                            <div className="text-xs text-gray-900" style={{ fontSize: '9px' }}>
                              {formData.airport_code || 'N/A'}
                            </div>
                            <div className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>
                              {formData['distance_(km)'] || '0'} km
                            </div>
                          </div>
                          
                          {/* Email */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-900 truncate" style={{ fontSize: '9px' }}>
                              {guestData['Offcial Email ID'] || formData.email || 'N/A'}
                            </div>
                            <div className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>
                              Official
                            </div>
                          </div>
                          
                          {/* Phone */}
                          <div className="col-span-1">
                            <div className="text-xs text-gray-900" style={{ fontSize: '9px' }}>
                              {formData.phone || 'N/A'}
                            </div>
                          </div>
                          
                          {/* Status */}
                          <div className="col-span-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPassengerStatusBadge(passenger.pax_status)}`} style={{ fontSize: '8.5px' }}>
                              {passenger.pax_status}
                            </span>
                          </div>
                          
                          {/* PNR / Journey */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              {passenger.attached_pnr && passenger.attached_pnr.map((pnr, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-2xs rounded border border-purple-200">
                                  {pnr}
                                </span>
                              ))}
                              {passenger.journey_id && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-2xs rounded border border-blue-200">
                                  Journey
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded View */}
                        {expandedPassengerId === passenger.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 rounded-lg p-3">
                            <div className="grid grid-cols-3 gap-4">
                              {/* Passenger Basic Info */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5" style={{ fontSize: '9px' }}>
                                  <User className="w-3 h-3 text-blue-600" />
                                  Passenger Info
                                </h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Group:</span>
                                    <span className="text-2xs text-gray-900 font-medium" style={{ fontSize: '7.5px' }}>{passenger.group_n || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>FC Code:</span>
                                    <span className="text-2xs text-gray-900" style={{ fontSize: '7.5px' }}>{formData.fc_code || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Address:</span>
                                    <span className="text-2xs text-gray-900" style={{ fontSize: '7.5px' }}>{formData.address || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Travel Details */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5" style={{ fontSize: '9px' }}>
                                  <MapPinIcon className="w-3 h-3 text-green-600" />
                                  Travel Details
                                </h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Airport Code:</span>
                                    <span className="text-2xs text-gray-900" style={{ fontSize: '7.5px' }}>{formData.airport_code || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Airport Name:</span>
                                    <span className="text-2xs text-gray-900 truncate" style={{ fontSize: '7.5px' }}>{formData.airport_name || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Distance:</span>
                                    <span className="text-2xs text-gray-900" style={{ fontSize: '7.5px' }}>{formData['distance_(km)'] || '0'} km</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Guest Data */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5" style={{ fontSize: '9px' }}>
                                  <UsersIcon className="w-3 h-3 text-purple-600" />
                                  Guest Data
                                </h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Form Fill:</span>
                                    <span className="text-2xs text-gray-900" style={{ fontSize: '7.5px' }}>{guestData.formfill || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Official Email:</span>
                                    <span className="text-2xs text-gray-900 truncate" style={{ fontSize: '7.5px' }}>{guestData['Offcial Email ID'] || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-2xs text-gray-700" style={{ fontSize: '7.5px' }}>Contact:</span>
                                    <span className="text-2xs text-gray-900" style={{ fontSize: '7.5px' }}>{guestData['Contact Number'] || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Metadata */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-900 mb-2" style={{ fontSize: '9px' }}>System Info</h4>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <span className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>Created:</span>
                                  <span className="text-2xs text-gray-900 ml-1" style={{ fontSize: '7px' }}>
                                    {formatDisplayDate(passenger.created_at)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>Updated:</span>
                                  <span className="text-2xs text-gray-900 ml-1" style={{ fontSize: '7px' }}>
                                    {formatDisplayDate(passenger.updated_at)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>Journey ID:</span>
                                  <span className="text-2xs text-gray-900 ml-1" style={{ fontSize: '7px' }}>
                                    {passenger.journey_id ? passenger.journey_id.substring(0, 8) + '...' : 'None'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Travel Hubs */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>Travel Hubs</h3>
              </div>
              <button
                onClick={fetchTravelHubs}
                className="text-gray-600 hover:text-gray-900"
                type="button"
                title="Refresh Hubs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHubs ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Hub Filter Status */}
            <div className="mb-4">
              {selectedHub ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-600" />
                      <div>
                        <span className="text-xs font-semibold text-gray-900" style={{ fontSize: '9.5px' }}>
                          {selectedHub.hub}
                        </span>
                        <div className="text-xs text-gray-600" style={{ fontSize: '8.5px' }}>
                          {selectedHub.airportCode}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedHub(null)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5" style={{ fontSize: '8.5px' }}>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-2.5 h-2.5" />
                      {selectedHub.pax} travelers
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-2.5 h-2.5" />
                      {selectedHub.distance} km from airport
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" />
                      {selectedHub.submissionIds?.length || 0} submissions
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-100">
                    <div className="text-xs text-green-700 font-medium" style={{ fontSize: '8.5px' }}>
                      {filteredPassengers.length} passengers match {selectedHub.airportCode}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <GlobeIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600" style={{ fontSize: '9px' }}>No hub selected</p>
                    <p className="text-xs text-gray-500 mt-1" style={{ fontSize: '8px' }}>Click a hub to filter by airport code</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Hubs List */}
            {loadingHubs ? (
              <div className="text-center py-4">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-xs text-gray-600" style={{ fontSize: '9px' }}>Loading hubs...</p>
              </div>
            ) : travelHubs.length === 0 ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <Building className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600" style={{ fontSize: '9px' }}>No travel hubs found</p>
                <button
                  onClick={fetchTravelHubs}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  style={{ fontSize: '8.5px' }}
                  type="button"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {travelHubs.map((hub) => {
                  // Count passengers by matching airport code
                  const passengerCount = passengerData.filter(p => {
                    const formData = formatPassengerFormData(p.form_data);
                    const passengerAirportCode = formData.airport_code || formData.airportCode;
                    return passengerAirportCode === hub.airportCode || 
                           passengerAirportCode === hub.Code;
                  }).length;
                  
                  const isSelected = selectedHub?.id === hub.id;
                  
                  return (
                    <button
                      key={hub.id}
                      onClick={() => setSelectedHub(isSelected ? null : hub)}
                      className={`w-full text-left p-2 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            isSelected
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="text-xs font-bold" style={{ fontSize: '9px' }}>
                              {hub.airportCode || hub.Code}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-medium text-gray-900 truncate" style={{ fontSize: '9.5px' }}>
                              {hub.hub}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1" style={{ fontSize: '8px' }}>
                              <UsersIcon className="w-2.5 h-2.5" />
                              {passengerCount} passengers
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <Check className="w-3 h-3 text-green-600" />
                          )}
                        </div>
                      </div>
                      
                      {/* Hub Quick Info */}
                      <div className="mt-1.5 flex items-center justify-between text-xs text-gray-600" style={{ fontSize: '8px' }}>
                        <div className="flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" />
                          {hub.distance} km
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5" />
                          {hub.submissionIds?.length || 0} subs
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-1.5">
                        <div className="flex justify-between text-2xs text-gray-500 mb-0.5" style={{ fontSize: '7.5px' }}>
                          <span>Passengers: {passengerCount}</span>
                          <span>{totalCount > 0 ? Math.round((passengerCount / totalCount) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${
                              isSelected ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.max(5, totalCount > 0 ? (passengerCount / totalCount) * 100 : 5)}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Hub Statistics */}
            {travelHubs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-900 mb-2" style={{ fontSize: '9.5px' }}>
                  Passenger Distribution by Hub
                </h4>
                <div className="space-y-1.5">
                  {travelHubs.map((hub) => {
                    const passengerCount = passengerData.filter(p => {
                      const formData = formatPassengerFormData(p.form_data);
                      const passengerAirportCode = formData.airport_code || formData.airportCode;
                      return passengerAirportCode === hub.airportCode || 
                             passengerAirportCode === hub.Code;
                    }).length;
                    
                    const percentage = totalCount > 0 ? Math.round((passengerCount / totalCount) * 100) : 0;
                    
                    return (
                      <div key={hub.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-700" style={{ fontSize: '8px' }}>
                              {hub.airportCode || hub.Code}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 truncate" style={{ fontSize: '8.5px' }}>
                            {hub.hub?.substring(0, 15)}
                            {hub.hub?.length > 15 ? '...' : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-900 font-medium w-8 text-right" style={{ fontSize: '8.5px' }}>
                            {passengerCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Group Quick Stats */}
            {groupNames.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-900 mb-2" style={{ fontSize: '9.5px' }}>
                  Quick Group Stats
                </h4>
                <div className="space-y-2">
                  {groupNames.map(groupName => {
                    const groupPassengers = groupedPassengers[groupName] || [];
                    const confirmed = groupPassengers.filter(p => p.pax_status === 'Completed').length;
                    const total = groupPassengers.length;
                    
                    return (
                      <button
                        key={groupName}
                        onClick={() => setActiveGroupTab(groupName)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                          activeGroupTab === groupName
                            ? groupName === 'Ungrouped'
                              ? 'bg-gray-100 border-gray-300'
                              : 'bg-purple-50 border-purple-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            groupName === 'Ungrouped'
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {groupName === 'Ungrouped' ? (
                              <UserX className="w-3 h-3" />
                            ) : (
                              <Users className="w-3 h-3" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9px' }}>
                              {groupName === 'Ungrouped' ? 'Ungrouped' : `Group ${groupName}`}
                            </div>
                            <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>
                              {total} passengers
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '9px' }}>
                            {confirmed}/{total}
                          </div>
                          <div className="text-2xs text-gray-500" style={{ fontSize: '7px' }}>
                            Completed
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowHubsList(true);
                  }}
                  className="flex-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                  style={{ fontSize: '9px' }}
                  type="button"
                >
                  View All Hubs
                </button>
                <button
                  onClick={() => {
                    alert('Create new hub functionality');
                  }}
                  className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white font-medium px-2 py-1 rounded-md transition-colors"
                  style={{ fontSize: '9px' }}
                  type="button"
                >
                  Add Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =================== RENDER SUBMITTED JOURNEYS VIEW ===================
  const renderSubmittedJourneysView = () => {
    const filteredJourneys = getFilteredJourneys();
    
    return (
      <div className="space-y-4">
        {/* Stats Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Archive className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900" style={{ fontSize: '11px' }}>Submitted Journeys</h2>
                <p className="text-xs text-gray-600 mt-0.5" style={{ fontSize: '9.5px' }}>
                  {selectedHub 
                    ? `Viewing journeys for ${selectedHub.hub} (${selectedHub.airportCode})`
                    : `View all submitted flight itineraries for Lead #${leadID}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedHub && (
                <button
                  onClick={clearHubSelection}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  style={{ fontSize: '10px' }}
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Hub Filter
                </button>
              )}
              
              <button
                onClick={() => setShowSubmittedJourneys(false)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                style={{ fontSize: '10px' }}
                type="button"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Back to Builder
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                <div className="text-xs text-blue-700 font-medium" style={{ fontSize: '9px' }}>Total Journeys</div>
              </div>
              <div className="text-2xl font-bold text-blue-900" style={{ fontSize: '16px' }}>
                {journeyStats.totalJourneys}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="w-3.5 h-3.5 text-green-600" />
                <div className="text-xs text-green-700 font-medium" style={{ fontSize: '9px' }}>Total Flights</div>
              </div>
              <div className="text-2xl font-bold text-green-900" style={{ fontSize: '16px' }}>
                {journeyStats.totalFlights}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                <div className="text-xs text-purple-700 font-medium" style={{ fontSize: '9px' }}>Avg. Legs</div>
              </div>
              <div className="text-2xl font-bold text-purple-900" style={{ fontSize: '16px' }}>
                {journeyStats.averageLegs}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="w-3.5 h-3.5 text-orange-600" />
                <div className="text-xs text-orange-700 font-medium" style={{ fontSize: '9px' }}>Recent (7d)</div>
              </div>
              <div className="text-2xl font-bold text-orange-900" style={{ fontSize: '16px' }}>
                {journeyStats.recentJourneys}
              </div>
            </div>
          </div>
          
          {/* API Status */}
          {loadingJourneys ? (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-blue-700 font-medium" style={{ fontSize: '10px' }}>
                  Loading journeys from API...
                </span>
              </div>
            </div>
          ) : journeysError && !journeysError.includes('No journeys') ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                <div>
                  <p className="text-xs text-yellow-800 font-medium" style={{ fontSize: '10px' }}>
                    API Connection Issue: {journeysError}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1" style={{ fontSize: '9px' }}>
                    Showing mock data for demonstration
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Filter Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium" style={{ fontSize: '9.5px' }}>Filter:</span>
              <div className="flex gap-1">
                {['all', 'recent', 'multi-leg', 'hub'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => {
                      if (filter === 'hub') {
                        setShowHubsList(true);
                        fetchTravelHubs();
                      } else {
                        setJourneysFilter(filter);
                        if (filter !== 'hub') {
                          setSelectedHub(null);
                        }
                      }
                    }}
                    disabled={filter === 'hub' && selectedHub}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                      journeysFilter === filter
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : filter === 'hub' && selectedHub
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                    style={{ fontSize: '9px' }}
                    type="button"
                  >
                    {filter === 'all' ? 'All Journeys' : 
                     filter === 'recent' ? 'Recent' : 
                     filter === 'multi-leg' ? 'Multi-Leg' : 
                     selectedHub ? `Hub: ${selectedHub.hub}` : 'By Hub'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowHubsList(true);
                  fetchTravelHubs();
                }}
                className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 border border-green-200 rounded-md hover:bg-green-50 transition-colors"
                style={{ fontSize: '9.5px' }}
                type="button"
              >
                <Building className="w-3 h-3" />
                View Hubs
              </button>
              
              <button
                onClick={fetchSubmittedJourneys}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                style={{ fontSize: '9.5px' }}
                type="button"
              >
                <RefreshCw className={`w-3 h-3 ${loadingJourneys ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Hub Info (if selected) */}
          {selectedHub && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>{selectedHub.hub}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                        <span className="font-medium">Code:</span> {selectedHub.airportCode}
                      </div>
                      <div className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                        <span className="font-medium">Travelers:</span> {selectedHub.pax}
                      </div>
                      <div className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                        <span className="font-medium">Type:</span> {selectedHub.travelType || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                        <span className="font-medium">Distance:</span> {selectedHub.distance} km
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearHubSelection}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  style={{ fontSize: '9.5px' }}
                  type="button"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Journeys List */}
        {loadingJourneys ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600 font-medium" style={{ fontSize: '10.5px' }}>
              Loading submitted journeys...
            </p>
          </div>
        ) : journeysError && journeysError.includes('No journeys') ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '10.5px' }}>
              No journeys found
            </h3>
            <p className="text-xs text-gray-600 mb-4" style={{ fontSize: '9.5px' }}>
              {journeysError}
            </p>
            <button
              onClick={fetchSubmittedJourneys}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 text-xs"
              style={{ fontSize: '10px' }}
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 inline-block mr-1" />
              Refresh
            </button>
          </div>
        ) : filteredJourneys.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '10.5px' }}>
              No journeys found
            </h3>
            <p className="text-xs text-gray-600 mb-4" style={{ fontSize: '9.5px' }}>
              {selectedHub 
                ? `No journeys found for ${selectedHub.hub} (${selectedHub.airportCode})`
                : journeysFilter !== 'all' 
                  ? 'No journeys match the selected filter'
                  : 'No journeys have been submitted yet'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setJourneysFilter('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 text-xs"
                style={{ fontSize: '10px' }}
                type="button"
              >
                View All Journeys
              </button>
              <button
                onClick={() => {
                  setShowHubsList(true);
                  fetchTravelHubs();
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 text-xs"
                style={{ fontSize: '10px' }}
                type="button"
              >
                Browse Hubs
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                Showing {filteredJourneys.length} journey{filteredJourneys.length !== 1 ? 's' : ''}
                {selectedHub && ` for ${selectedHub.hub}`}
              </div>
              <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                Click on a journey to expand details
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredJourneys.map((journey, index) => (
                <div key={journey[0]?.journey_id || `journey-${index}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3">
                  {/* Journey Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          journey.length > 1 
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>
                              Journey #{index + 1} • {journey.length} leg{journey.length > 1 ? 's' : ''}
                            </h3>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              journey.length > 1 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`} style={{ fontSize: '9px' }}>
                              {journey.length > 1 ? 'Multi-Leg' : 'Single Leg'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5" style={{ fontSize: '9px' }}>
                            <CalendarDays className="w-3 h-3" />
                            Submitted {formatDisplayDate(journey[0]?.created_at || new Date())}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleJourneyExpansion(journey[0]?.journey_id || `journey-${index}`)}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                          style={{ fontSize: '9.5px' }}
                          type="button"
                        >
                          {expandedJourneyId === (journey[0]?.journey_id || `journey-${index}`) ? 'Collapse' : 'Expand'}
                          {expandedJourneyId === (journey[0]?.journey_id || `journey-${index}`) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        
                        <button
                          onClick={() => copyJourneyDetails(journey)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
                          style={{ fontSize: '9.5px' }}
                          type="button"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                        
                        {/* PNR Creation Button */}
                        <button
                          onClick={() => initPnrCreation(journey)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 border border-purple-200 rounded-md hover:bg-purple-50 transition-colors flex items-center gap-1"
                          style={{ fontSize: '9.5px' }}
                          type="button"
                        >
                          <Ticket className="w-3 h-3" />
                          Create PNR
                        </button>
                      </div>
                    </div>
                    
                    {/* Journey Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '9px' }}>Route</div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1" style={{ fontSize: '10px' }}>
                          <Route className="w-3.5 h-3.5 text-blue-600" />
                          {journey[0]?.from_airport} → {journey[journey.length - 1]?.to_airport}
                        </div>
                        <div className="text-xs text-gray-600 mt-1" style={{ fontSize: '8px' }}>
                          {journey.length} segment{journey.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '9px' }}>Travel Dates</div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1" style={{ fontSize: '10px' }}>
                          <Calendar className="w-3.5 h-3.5 text-green-600" />
                          {formatDisplayDate(journey[0]?.dep_date)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1" style={{ fontSize: '8px' }}>
                          Duration: {getJourneyDuration(journey)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '9px' }}>Flights</div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1" style={{ fontSize: '10px' }}>
                          <Plane className="w-3.5 h-3.5 text-purple-600" />
                          {journey.map(f => f.flight_number).join(', ')}
                        </div>
                        <div className="text-xs text-gray-600 mt-1" style={{ fontSize: '8px' }}>
                          {journey.length} flight{journey.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Flight Details */}
                  {expandedJourneyId === (journey[0]?.journey_id || `journey-${index}`) && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-3">
                        {journey.map((flight, flightIndex) => (
                          <div key={flight.id} className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold" style={{ fontSize: '9px' }}>
                                  {flight.leg_order}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>
                                    Leg {flight.leg_order}: {flight.from_airport} → {flight.to_airport}
                                  </div>
                                  <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                                    Flight {flight.flight_number}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Terminal</div>
                                <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>
                                  {flight.dep_terminal} → {flight.arv_terminal}
                                </div>
                              </div>
                            </div>
                            
                            {/* Flight Timeline */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-center">
                                <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                  {formatDisplayTime(flight.dep_time)}
                                </div>
                                <div className="text-xs text-gray-700" style={{ fontSize: '9.5px' }}>
                                  {flight.from_airport}
                                </div>
                                <div className="text-xs text-gray-500" style={{ fontSize: '8px' }}>
                                  {formatDisplayDate(flight.dep_date)}
                                </div>
                              </div>
                              
                              <div className="flex-1 px-4">
                                <div className="relative">
                                  <div className="h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                                  <div className="h-px bg-gradient-to-r from-transparent to-blue-500"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-xs">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-700" style={{ fontSize: '9px' }}>
                                          Direct
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                  {formatDisplayTime(flight.arv_time)}
                                </div>
                                <div className="text-xs text-gray-700" style={{ fontSize: '9.5px' }}>
                                  {flight.to_airport}
                                </div>
                                <div className="text-xs text-gray-500" style={{ fontSize: '8px' }}>
                                  {formatDisplayDate(flight.arv_date)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-2" style={{ fontSize: '9px' }}>
                              <div>
                                <span className="font-medium">Airport:</span> {getAirportName(flight.from_airport)} → {getAirportName(flight.to_airport)}
                              </div>
                              <div className="text-right">
                                Created: {formatDisplayDate(flight.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>
                            Journey ID: <span className="font-mono">{(journey[0]?.journey_id || `journey-${index}`).substring(0, 8)}...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                alert('Share functionality would be implemented here');
                              }}
                              className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                              style={{ fontSize: '9.5px' }}
                              type="button"
                            >
                              <Share2 className="w-3 h-3" />
                              Share
                            </button>
                            
                            <button
                              onClick={() => {
                                alert('Download functionality would be implemented here');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
                              style={{ fontSize: '9.5px' }}
                              type="button"
                            >
                              <Download className="w-3 h-3" />
                              Export
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add these missing functions before the main return statement (around line 5000-6000)

// =================== RENDER COMPARE VIEW ===================
const renderCompareView = () => {
  const visibleLegsData = journeyLegs.filter((_, idx) => visibleLegs.includes(idx));
  const gridCols = visibleLegsData.length === 1 ? 'lg:grid-cols-1' : 
                  visibleLegsData.length === 2 ? 'lg:grid-cols-2' : 
                  'lg:grid-cols-3';

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Columns className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>Compare View</h3>
              <p className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>View and compare multiple legs side by side</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('single')}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              style={{ fontSize: '9.5px' }}
              type="button"
            >
              <List className="w-3.5 h-3.5" />
              Single View
            </button>
          </div>
        </div>
        
        {/* Leg Visibility Toggle */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {journeyLegs.map((leg, idx) => (
              <button
                key={leg.id}
                onClick={() => toggleLegVisibility(idx)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-all duration-150 ${
                  visibleLegs.includes(idx)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontSize: '9px' }}
                type="button"
              >
                {visibleLegs.includes(idx) ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
                {leg.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legs Grid */}
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {visibleLegsData.map((leg, idx) => {
          const legIndex = journeyLegs.findIndex(l => l.id === leg.id);
          return (
            <div key={leg.id} className={`leg-${legIndex} bg-white rounded-xl border border-gray-200 p-4`}>
              {renderLegSearchForm(legIndex)}
              
              {/* Suggested Flights Section */}
              {renderSuggestedFlightsSection(legIndex)}
              
              {/* Flight Results */}
              <div id={`all-flights-section-${legIndex}`} className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>
                    All Available Flights ({leg.filteredFlights.length - leg.suggestedFlights.length})
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Sort:</span>
                    <select
                      value={leg.sortBy}
                      onChange={(e) => updateLegSort(legIndex, e.target.value)}
                      className="border border-gray-300 rounded-md px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
                      style={{ fontSize: '9px' }}
                    >
                      <option value="price">Price</option>
                      <option value="duration">Duration</option>
                      <option value="departure">Departure</option>
                    </select>
                  </div>
                </div>
                
                {leg.loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-xs text-gray-600" style={{ fontSize: '9.5px' }}>Loading flights...</p>
                  </div>
                ) : leg.filteredFlights.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Plane className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>No flights found</p>
                    <button
                      onClick={() => resetLegFilters(legIndex)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      style={{ fontSize: '9.5px' }}
                      type="button"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {leg.filteredFlights
                      .filter(flight => !leg.suggestedFlights.some(s => s.id === flight.id))
                      .map(flight => renderLegFlightCard(flight, legIndex))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =================== RENDER SINGLE VIEW ===================
const renderSingleView = () => {
  const leg = journeyLegs[currentLeg];
  const isRoundtrip = leg?.searchParams?.trip_type === 'roundtrip';
  
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-4">
      {/* Filters Sidebar */}
      <div className="lg:col-span-3 mb-4 lg:mb-0">
        {renderLegFilters(currentLeg)}
        
        {/* Help Section */}
        <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-3">
          <h3 className="text-xs font-semibold text-gray-900 mb-1.5" style={{ fontSize: '10px' }}>How it works?</h3>
          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold mt-0.5" style={{ fontSize: '8px' }}>1</div>
              <div>
                <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Select flight for current leg</div>
                <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>Search and choose your flight</div>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold mt-0.5" style={{ fontSize: '8px' }}>2</div>
              <div>
                <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Add more legs</div>
                <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>Click "Add Leg" to continue your journey</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
        {renderLegSearchForm(currentLeg)}
        
        {/* Suggested Flights Section */}
        {renderSuggestedFlightsSection(currentLeg)}
        
        {/* Flight Results */}
        <div id={`all-flights-section-${currentLeg}`} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>
                All Available Flights ({leg.filteredFlights.length - leg.suggestedFlights.length})
              </h3>
              <p className="text-xs text-gray-600 mt-0.5" style={{ fontSize: '9.5px' }}>
                {leg.searchParams.from} → {leg.searchParams.to}
                {isRoundtrip && ' • Round Trip'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('compare')}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                style={{ fontSize: '9.5px' }}
                type="button"
              >
                <Columns className="w-3.5 h-3.5" />
                Compare View
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>Sort:</span>
                <select
                  value={leg.sortBy}
                  onChange={(e) => updateLegSort(currentLeg, e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
                  style={{ fontSize: '9.5px' }}
                >
                  <option value="price">Price (Lowest)</option>
                  <option value="duration">Duration (Shortest)</option>
                  <option value="departure">Departure (Earliest)</option>
                </select>
              </div>
            </div>
          </div>
          
          {leg.loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600 font-medium" style={{ fontSize: '10.5px' }}>Searching for flights...</p>
            </div>
          ) : leg.filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '10.5px' }}>No flights found</h3>
              <p className="text-xs text-gray-600 mb-4" style={{ fontSize: '9.5px' }}>Try adjusting your filters or search criteria</p>
              <button
                onClick={() => resetLegFilters(currentLeg)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 text-xs"
                style={{ fontSize: '10px' }}
                type="button"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {leg.filteredFlights
                .filter(flight => !leg.suggestedFlights.some(s => s.id === flight.id))
                .map(flight => renderLegFlightCard(flight, currentLeg))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================== RENDER SUGGESTED FLIGHT CARD ===================
const renderSuggestedFlightCard = (flight, legIndex) => {
  const leg = journeyLegs[legIndex];
  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const isSelected = isFlightSelected(flight, legIndex);
  const suggestion = flight.suggestionReason || suggestionReasons[0];
  const isRoundtrip = flight.trip_type === 'roundtrip';
  const returnFlight = flight.return_flight || flight.return;
  
  return (
    <div key={`suggested-${flight.id}-${legIndex}`} className="relative group">
      <div className={`absolute -top-2 -left-2 z-20 w-8 h-8 rounded-full bg-gradient-to-br ${suggestion.color} text-white flex items-center justify-center font-bold text-sm shadow-lg`}>
        {leg.suggestedFlights.indexOf(flight) + 1}
      </div>
      
      <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden relative ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-xl group-hover:scale-[1.02]'
      }`}>
        <button
          onClick={() => toggleFlightSelection(flight, legIndex)}
          className="absolute inset-0 z-0"
          aria-label={`Select suggested flight ${flight.flight_number}`}
          type="button"
        />
        
        <div className="p-4 relative z-10">
          {/* Suggestion Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${suggestion.color}`}>
                {suggestion.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900" style={{ fontSize: '10.5px' }}>{suggestion.title}</h3>
                <p className="text-xs text-gray-600" style={{ fontSize: '9px' }}>{suggestion.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500" style={{ fontSize: '9px' }}>Score</div>
              <div className={`text-base font-bold bg-gradient-to-r ${suggestion.color} bg-clip-text text-transparent`}>
                {flight.score}/100
              </div>
              {isRoundtrip && (
                <div className="text-xs text-purple-600 font-medium mt-1" style={{ fontSize: '9px' }}>
                  Round Trip
                </div>
              )}
            </div>
          </div>
          
          {/* Flight Details */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                  <Plane className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900" style={{ fontSize: '10px' }}>{flight.airline}</div>
                  <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Flight {flight.flight_number}</div>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                flight.stops === 0 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`} style={{ fontSize: '9px' }}>
                {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>
            
            {/* Outbound Timeline */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-1.5" style={{ fontSize: '9.5px' }}>
                Outbound: {formatDateTime(flight.departure_time)} - {formatDateTime(flight.arrival_time)}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-base font-bold text-gray-900" style={{ fontSize: '11px' }}>{formatDateTime(flight.departure_time)}</div>
                  <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{flight.departure_airport}</div>
                  <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Terminal {flight.departure_terminal}</div>
                </div>
                
                <div className="text-center flex-1 px-3">
                  <div className="relative">
                    <div className="h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                    <div className="h-px bg-gradient-to-r from-transparent to-blue-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>
                            {formatDuration(flight.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-base font-bold text-gray-900" style={{ fontSize: '11px' }}>{formatDateTime(flight.arrival_time)}</div>
                  <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{flight.arrival_airport}</div>
                  <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Terminal {flight.arrival_terminal}</div>
                </div>
              </div>
            </div>
            
            {/* Return Timeline (if roundtrip) */}
            {isRoundtrip && returnFlight && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-1.5" style={{ fontSize: '9.5px' }}>
                  Return: {formatDateTime(returnFlight.departure_time)} - {formatDateTime(returnFlight.arrival_time)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-base font-bold text-gray-900" style={{ fontSize: '11px' }}>{formatDateTime(returnFlight.departure_time)}</div>
                    <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{returnFlight.departure_airport}</div>
                    <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Terminal {returnFlight.departure_terminal}</div>
                  </div>
                  
                  <div className="text-center flex-1 px-3">
                    <div className="relative">
                      <div className="h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
                      <div className="h-px bg-gradient-to-r from-transparent to-purple-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>
                              {formatDuration(returnFlight.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-base font-bold text-gray-900" style={{ fontSize: '11px' }}>{formatDateTime(returnFlight.arrival_time)}</div>
                    <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{returnFlight.arrival_airport}</div>
                    <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>Terminal {returnFlight.arrival_terminal}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Layover Info */}
            {flight.layover_details && flight.layover_details.length > 0 && (
              <div className="mt-2 text-center">
                <div className="inline-flex items-center gap-1 bg-blue-50 rounded-lg px-1.5 py-0.5">
                  <Navigation className="w-2.5 h-2.5 text-blue-600" />
                  <span className="text-xs text-blue-700" style={{ fontSize: '9px' }}>
                    Layover at {flight.layover_details[0].airport_code} ({formatDuration(flight.layover_details[0].duration)})
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Highlights & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Optimal Time</div>
                  <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>
                    {getTimeSlot(departureTime.getHours()).label} departure
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Great Value</div>
                  <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>
                    {flight.stops === 0 ? 'Direct flight' : '1 stop'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Price & Select Button */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-0.5" style={{ fontSize: '9px' }}>Total Price</div>
                <div className="text-lg font-bold text-gray-900" style={{ fontSize: '13px' }}>{formatPrice(flight.price)}</div>
                <div className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>
                  {isRoundtrip ? 'round trip' : 'one way'} • per person
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFlightSelection(flight, legIndex);
                }}
                className={`font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm ${
                  isSelected
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : `bg-gradient-to-r ${suggestion.color} hover:opacity-90 text-white`
                }`}
                style={{ fontSize: '10.5px' }}
                type="button"
              >
                {isSelected ? 'Selected ✓' : 'Select This'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== RENDER SUGGESTED FLIGHTS SECTION ===================
const renderSuggestedFlightsSection = (legIndex) => {
  const leg = journeyLegs[legIndex];
  if (!leg || leg.suggestedFlights.length === 0 || leg.loading) return null;

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>Top 5 Recommended Flights</h2>
                <p className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>AI-powered suggestions based on price, duration, and convenience</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-700" style={{ fontSize: '9px' }}>Best Overall</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-700" style={{ fontSize: '9px' }}>Fastest</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-700" style={{ fontSize: '9px' }}>Most Economical</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-700" style={{ fontSize: '9px' }}>Premium</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-xs text-gray-700" style={{ fontSize: '9px' }}>Smart Choice</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Based on</div>
              <div className="flex items-center gap-2.5 mt-1.5">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Price</div>
                  <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>40% weight</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Duration</div>
                  <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>30% weight</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Stops</div>
                  <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>15% weight</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900" style={{ fontSize: '9.5px' }}>Time</div>
                  <div className="text-2xs text-gray-600" style={{ fontSize: '8px' }}>15% weight</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Suggested Flights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {leg.suggestedFlights.slice(0, 4).map((flight, index) => 
            renderSuggestedFlightCard(flight, legIndex)
          )}
        </div>
        
        {/* Fifth Suggestion (Full Width) */}
        {leg.suggestedFlights.length >= 5 && (
          <div className="mt-3">
            {renderSuggestedFlightCard(leg.suggestedFlights[4], legIndex)}
          </div>
        )}
        
        {/* View All Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              const element = document.getElementById(`all-flights-section-${legIndex}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
            style={{ fontSize: '10px' }}
            type="button"
          >
            <span>View All {leg.filteredFlights.length} Flights</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== RENDER LEG FLIGHT CARD ===================
const renderLegFlightCard = (flight, legIndex) => {
  const leg = journeyLegs[legIndex];
  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const departureHour = departureTime.getHours();
  const arrivalHour = arrivalTime.getHours();
  const departureSlot = getTimeSlot(departureHour);
  const arrivalSlot = getTimeSlot(arrivalHour);
  const isSelected = isFlightSelected(flight, legIndex);
  const isRoundtrip = flight.trip_type === 'roundtrip';
  const returnFlight = flight.return_flight || flight.return;
  const isSuggested = leg.suggestedFlights.some(f => f.id === flight.id);

  // Don't render suggested flights here - they have their own section
  if (isSuggested) return null;

  return (
    <div key={flight.id} className={`bg-white rounded-xl border transition-all duration-200 mb-3 overflow-hidden relative ${
      isSelected 
        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
    }`}>
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm" style={{ fontSize: '9px' }}>
            Selected for {leg.name}
          </div>
        </div>
      )}

      {/* Selection Overlay */}
      <button
        onClick={() => toggleFlightSelection(flight, legIndex)}
        className="absolute inset-0 z-0"
        aria-label={`Select flight ${flight.flight_number}`}
        type="button"
      />
      
      <div className="p-4 relative z-10 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isRoundtrip 
                ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}>
              {isRoundtrip ? (
                <ArrowRightLeft className="w-5 h-5 text-white" />
              ) : (
                <Plane className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>{flight.airline}</h3>
              <p className="text-xs text-gray-500" style={{ fontSize: '9.5px' }}>Flight {flight.flight_number}</p>
              {isRoundtrip && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200" style={{ fontSize: '8.5px' }}>
                    Round Trip
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              flight.stops === 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`} style={{ fontSize: '9px' }}>
              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200" style={{ fontSize: '9px' }}>
              {flight.aircraft}
            </span>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-700" style={{ fontSize: '10px' }}>
              {departureTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <span className={`px-1.5 py-0.5 rounded border ${departureSlot.color}`} style={{ fontSize: '9px' }}>
              {departureSlot.label}
            </span>
          </div>
          
          {/* Outbound Flight */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-2" style={{ fontSize: '9.5px' }}>Outbound</div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900" style={{ fontSize: '12px' }}>{formatDateTime(flight.departure_time)}</div>
                    <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{flight.departure_airport}</div>
                    <div className="text-xs text-gray-500" style={{ fontSize: '9px' }}>Terminal {flight.departure_terminal}</div>
                  </div>
                  
                  {/* Duration */}
                  <div className="text-center flex-1 px-3">
                    <div className="relative">
                      <div className="h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                      <div className="h-px bg-gradient-to-r from-transparent to-blue-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>
                              {formatDuration(flight.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900" style={{ fontSize: '12px' }}>{formatDateTime(flight.arrival_time)}</div>
                    <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{flight.arrival_airport}</div>
                    <div className="text-xs text-gray-500" style={{ fontSize: '9px' }}>Terminal {flight.arrival_terminal}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Return Flight (if roundtrip) */}
          {isRoundtrip && returnFlight && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2" style={{ fontSize: '9.5px' }}>Return</div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900" style={{ fontSize: '12px' }}>{formatDateTime(returnFlight.departure_time)}</div>
                      <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{returnFlight.departure_airport}</div>
                      <div className="text-xs text-gray-500" style={{ fontSize: '9px' }}>Terminal {returnFlight.departure_terminal}</div>
                    </div>
                    
                    {/* Duration */}
                    <div className="text-center flex-1 px-3">
                      <div className="relative">
                        <div className="h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
                        <div className="h-px bg-gradient-to-r from-transparent to-purple-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-gray-500" />
                              <span className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>
                                {formatDuration(returnFlight.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900" style={{ fontSize: '12px' }}>{formatDateTime(returnFlight.arrival_time)}</div>
                      <div className="text-xs font-medium text-gray-700" style={{ fontSize: '10px' }}>{returnFlight.arrival_airport}</div>
                      <div className="text-xs text-gray-500" style={{ fontSize: '9px' }}>Terminal {returnFlight.arrival_terminal}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Direction Toggle (only for one-way flights) */}
        {!isRoundtrip && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2" style={{ fontSize: '9px' }}>
              Is this flight:
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateFlightDirection(legIndex, flight.id, 'onward');
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium border transition-all ${
                  flight.flight_direction === 'onward'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontSize: '9px' }}
                type="button"
              >
                Onward Flight
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateFlightDirection(legIndex, flight.id, 'return');
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium border transition-all ${
                  flight.flight_direction === 'return'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontSize: '9px' }}
                type="button"
              >
                Return Flight
              </button>
            </div>
            
            {flight.flight_direction && (
              <div className="mt-2 text-center">
                <span className={`text-2xs px-2 py-0.5 rounded-full inline-block ${
                  flight.flight_direction === 'onward' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`} style={{ fontSize: '8px' }}>
                  Selected as {flight.flight_direction === 'onward' ? 'Onward' : 'Return'} Flight
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>Flexible booking</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-0.5" style={{ fontSize: '9px' }}>
                {isRoundtrip ? 'Round Trip Price' : 'One Way Price'}
              </div>
              <div className="text-lg font-bold text-gray-900" style={{ fontSize: '13px' }}>{formatPrice(flight.price)}</div>
              <div className="text-xs text-gray-500" style={{ fontSize: '9px' }}>per person</div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFlightSelection(flight, legIndex);
              }}
              className={`font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm ${
                isSelected
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : leg.flights.length > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : isRoundtrip
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              style={{ fontSize: '10.5px' }}
              type="button"
            >
              {isSelected ? 'Selected ✓' : leg.flights.length > 0 ? 'Change Selection' : 'Select Flight'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== RENDER LEG FILTERS ===================
const renderLegFilters = (legIndex) => {
  const leg = journeyLegs[legIndex];
  if (!leg) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-4 overflow-hidden">
      {/* Filters Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5" style={{ fontSize: '10.5px' }}>
            <Sliders className="w-3.5 h-3.5 text-gray-600" />
            Filters
            {leg.activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-2xs font-medium px-1 py-0.5 rounded-full min-w-[18px] text-center" style={{ fontSize: '8px' }}>
                {leg.activeFiltersCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => resetLegFilters(legIndex)}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium px-1.5 py-0.5 hover:bg-gray-100 rounded-md transition-colors"
            style={{ fontSize: '9px' }}
            type="button"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2">
        {/* Stops */}
        <div className="border-b border-gray-100 last:border-b-0">
          <button
            onClick={() => toggleLegSection(legIndex, 'stops')}
            className="w-full py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors"
            type="button"
          >
            <div className="flex items-center gap-1.5">
              <div className="text-gray-600 w-3.5 h-3.5 flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-gray-900" style={{ fontSize: '10px' }}>Stops</span>
            </div>
            {leg.expandedSections.stops ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          {leg.expandedSections.stops && (
            <div className="px-2 pb-2">
              <div className="grid grid-cols-2 gap-1.5">
                {leg.filterOptions.stops.map(stop => (
                  <button
                    key={stop}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleLegCheckboxChange(legIndex, 'stops', stop, e);
                    }}
                    className={`px-1.5 py-1 rounded-md border text-xs font-medium transition-all duration-150 ${
                      leg.filters.stops.includes(stop)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ fontSize: '9px' }}
                    type="button"
                  >
                    {stop === 0 ? 'Non-stop' : `${stop} Stop${stop > 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Airlines */}
        <div className="border-b border-gray-100 last:border-b-0">
          <button
            onClick={() => toggleLegSection(legIndex, 'airlines')}
            className="w-full py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors"
            type="button"
          >
            <div className="flex items-center gap-1.5">
              <div className="text-gray-600 w-3.5 h-3.5 flex items-center justify-center">
                <Plane className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-gray-900" style={{ fontSize: '10px' }}>Airlines</span>
            </div>
            {leg.expandedSections.airlines ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          {leg.expandedSections.airlines && (
            <div className="px-2 pb-2">
              <div className="space-y-1">
                {leg.filterOptions.airlines.map(airline => (
                  <label key={airline} className="flex items-center gap-1.5 cursor-pointer p-1 hover:bg-gray-50 rounded-md transition-colors select-none">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={leg.filters.airlines.includes(airline)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleLegCheckboxChange(legIndex, 'airlines', airline, e);
                        }}
                        className="sr-only"
                      />
                      <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${
                        leg.filters.airlines.includes(airline)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {leg.filters.airlines.includes(airline) && (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-700" style={{ fontSize: '9.5px' }}>{airline}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-b border-gray-100 last:border-b-0">
          <button
            onClick={() => toggleLegSection(legIndex, 'price')}
            className="w-full py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors"
            type="button"
          >
            <div className="flex items-center gap-1.5">
              <div className="text-gray-600 w-3.5 h-3.5 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-gray-900" style={{ fontSize: '10px' }}>Price Range</span>
            </div>
            {leg.expandedSections.price ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          {leg.expandedSections.price && (
            <div className="px-2 pb-2">
              <div className="space-y-3 pt-0.5">
                <div className="w-full px-0.5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-gray-700" style={{ fontSize: '9.5px' }}>Price Range</span>
                    <span className="text-2xs text-gray-500" style={{ fontSize: '8px' }}>
                      {formatPrice(leg.filters.priceRange[0])} - {formatPrice(leg.filters.priceRange[1])}
                    </span>
                  </div>
                  
                  {/* Price Range Slider */}
                  <div className="relative h-8">
                    {/* Track */}
                    <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full"></div>
                    
                    {/* Selected Range */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-blue-500 rounded-full"
                      style={{
                        left: `${(leg.filters.priceRange[0] / 50000) * 100}%`,
                        width: `${((leg.filters.priceRange[1] - leg.filters.priceRange[0]) / 50000) * 100}%`
                      }}
                    />
                    
                    {/* Min Thumb */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform z-10"
                      style={{ left: `${(leg.filters.priceRange[0] / 50000) * 100}%` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const container = e.currentTarget.parentElement;
                        if (!container) return;
                        
                        const rect = container.getBoundingClientRect();
                        const minValue = leg.filters.priceRange[0];
                        const maxValue = leg.filters.priceRange[1];
                        
                        const handleMouseMove = (moveEvent) => {
                          const x = Math.min(Math.max(moveEvent.clientX - rect.left, 0), rect.width);
                          const percentage = (x / rect.width);
                          const newValue = Math.round(percentage * 50000);
                          const steppedValue = Math.max(0, Math.min(newValue, maxValue - 1000));
                          
                          updateLegFilter(legIndex, 'priceRange', [steppedValue, maxValue]);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                    
                    {/* Max Thumb */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform z-10"
                      style={{ left: `${(leg.filters.priceRange[1] / 50000) * 100}%` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const container = e.currentTarget.parentElement;
                        if (!container) return;
                        
                        const rect = container.getBoundingClientRect();
                        const minValue = leg.filters.priceRange[0];
                        const maxValue = leg.filters.priceRange[1];
                        
                        const handleMouseMove = (moveEvent) => {
                          const x = Math.min(Math.max(moveEvent.clientX - rect.left, 0), rect.width);
                          const percentage = (x / rect.width);
                          const newValue = Math.round(percentage * 50000);
                          const steppedValue = Math.max(minValue + 1000, Math.min(newValue, 50000));
                          
                          updateLegFilter(legIndex, 'priceRange', [minValue, steppedValue]);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                  
                  {/* Price Labels */}
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <div className="text-2xs font-medium text-gray-500" style={{ fontSize: '8px' }}>Min</div>
                      <div className="text-xs font-semibold text-gray-700" style={{ fontSize: '9px' }}>
                        {formatPrice(leg.filters.priceRange[0])}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xs font-medium text-gray-500" style={{ fontSize: '8px' }}>Max</div>
                      <div className="text-xs font-semibold text-gray-700" style={{ fontSize: '9px' }}>
                        {formatPrice(leg.filters.priceRange[1])}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Price Presets */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3">
                    {[
                      { label: 'Under ₹10k', range: [0, 10000] },
                      { label: '₹10k-25k', range: [10000, 25000] },
                      { label: '₹25k+', range: [25000, 50000] }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateLegFilter(legIndex, 'priceRange', preset.range)}
                        className={`px-2 py-1 rounded-md border text-xs font-medium transition-all ${
                          leg.filters.priceRange[0] === preset.range[0] && leg.filters.priceRange[1] === preset.range[1]
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{ fontSize: '8.5px' }}
                        type="button"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  // =================== RENDER TRAVEL HUBS LIST ===================
  const renderTravelHubsList = () => {
    return (
      <div className="space-y-4">
        {/* Hubs List Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900" style={{ fontSize: '11px' }}>Travel Hubs</h2>
                <p className="text-xs text-gray-600 mt-0.5" style={{ fontSize: '9.5px' }}>
                  Select a hub to view related journeys
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowHubsList(false)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              style={{ fontSize: '10px' }}
              type="button"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Back to Journeys
            </button>
          </div>
          
          {/* Hubs Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-3.5 h-3.5 text-green-600" />
                <div className="text-xs text-green-700 font-medium" style={{ fontSize: '9px' }}>Total Hubs</div>
              </div>
              <div className="text-2xl font-bold text-green-900" style={{ fontSize: '16px' }}>
                {travelHubs.length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <div className="text-xs text-blue-700 font-medium" style={{ fontSize: '9px' }}>Total Travelers</div>
              </div>
              <div className="text-2xl font-bold text-blue-900" style={{ fontSize: '16px' }}>
                {travelHubs.reduce((sum, hub) => sum + hub.pax, 0)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <MapPinned className="w-3.5 h-3.5 text-purple-600" />
                <div className="text-xs text-purple-700 font-medium" style={{ fontSize: '9px' }}>Avg. Distance</div>
              </div>
              <div className="text-2xl font-bold text-purple-900" style={{ fontSize: '16px' }}>
                {travelHubs.length > 0 
                  ? (travelHubs.reduce((sum, hub) => sum + parseFloat(hub.distance || 0), 0) / travelHubs.length).toFixed(1) 
                  : '0.0'} km
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-orange-600" />
                <div className="text-xs text-orange-700 font-medium" style={{ fontSize: '9px' }}>Total Submissions</div>
              </div>
              <div className="text-2xl font-bold text-orange-900" style={{ fontSize: '16px' }}>
                {travelHubs.reduce((sum, hub) => sum + (hub.submissionIds?.length || 0), 0)}
              </div>
            </div>
          </div>
          
          {/* API Status */}
          {loadingHubs ? (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-blue-700 font-medium" style={{ fontSize: '10px' }}>
                  Loading travel hubs from API...
                </span>
              </div>
            </div>
          ) : hubsError && !hubsError.includes('No travel hubs') ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                <div>
                  <p className="text-xs text-yellow-800 font-medium" style={{ fontSize: '10px' }}>
                    API Connection Issue: {hubsError}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1" style={{ fontSize: '9px' }}>
                    Showing mock data for demonstration
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Hubs List */}
        {loadingHubs ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600 font-medium" style={{ fontSize: '10.5px' }}>
              Loading travel hubs from API...
            </p>
          </div>
        ) : hubsError && hubsError.includes('No travel hubs') ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '10.5px' }}>
              No travel hubs found
            </h3>
            <p className="text-xs text-gray-600 mb-4" style={{ fontSize: '9.5px' }}>
              {hubsError}
            </p>
            <button
              onClick={fetchTravelHubs}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 text-xs"
              style={{ fontSize: '10px' }}
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 inline-block mr-1" />
              Refresh
            </button>
          </div>
        ) : travelHubs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: '10.5px' }}>
              No travel hubs found
            </h3>
            <p className="text-xs text-gray-600 mb-4" style={{ fontSize: '9.5px' }}>
              No travel hubs have been created for this lead yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {travelHubs.map((hub, index) => (
              <div 
                key={hub.id} 
                className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  selectedHub?.id === hub.id 
                    ? 'border-blue-500 ring-2 ring-blue-500/20' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleHubSelect(hub)}
              >
                {/* Hub Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        hub.travelType === 'Business' 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600'
                      }`}>
                        {hub.travelType === 'Business' ? (
                          <Briefcase className="w-5 h-5 text-white" />
                        ) : (
                          <Compass className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>
                          {hub.hub}
                        </h3>
                        <p className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                          {hub.airportCode} • {hub.pax} traveler{hub.pax > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {selectedHub?.id === hub.id && (
                      <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full" style={{ fontSize: '9px' }}>
                        Selected
                      </div>
                    )}
                  </div>
                  
                  {/* Hub Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{hub.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                        <Target className="w-3.5 h-3.5 text-gray-400" />
                        <span>{hub.distance} km from airport</span>
                      </div>
                      
                      <div className="text-xs font-medium" style={{ fontSize: '9.5px' }}>
                        <span className={`px-2 py-0.5 rounded-full ${
                          hub.travelType === 'Business'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {hub.travelType || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                          Submissions: <span className="font-semibold text-gray-900">{hub.submissionIds?.length || 0}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHubSelect(hub);
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                            selectedHub?.id === hub.id
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{ fontSize: '9px' }}
                          type="button"
                        >
                          View Journeys
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hub Footer */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600" style={{ fontSize: '9px' }}>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      <span>Added {formatDisplayDate(hub.createdAt)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">Hub #{hub.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* View All Journeys Button */}
        <div className="text-center">
          <button
            onClick={() => {
              setShowHubsList(false);
              setShowSubmittedJourneys(true);
              setSelectedHub(null);
              setJourneysFilter('all');
              fetchSubmittedJourneys();
            }}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-xs"
            style={{ fontSize: '10px' }}
            type="button"
          >
            <History className="w-3.5 h-3.5" />
            View All Submitted Journeys
          </button>
        </div>
      </div>
    );
  };

  // =================== RENDER LEG SEARCH FORM ===================
  const renderLegSearchForm = (legIndex) => {
    const leg = journeyLegs[legIndex];
    if (!leg) return null;

    const isRoundtrip = leg.searchParams.trip_type === 'roundtrip';

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              leg.flights.length > 0 ? 'bg-emerald-100' : 
              isRoundtrip ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              {leg.flights.length > 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : isRoundtrip ? (
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
              ) : (
                <Plane className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '10.5px' }}>{leg.name}</h3>
              <p className="text-xs text-gray-600" style={{ fontSize: '9.5px' }}>
                {leg.searchParams.from} → {leg.searchParams.to}
                {leg.flights.length > 0 && (
                  <span className="ml-1.5 text-emerald-600 font-medium" style={{ fontSize: '9.5px' }}>
                    • Flight selected ✓
                  </span>
                )}
                {isRoundtrip && (
                  <span className="ml-1.5 text-purple-600 font-medium" style={{ fontSize: '9.5px' }}>
                    • Round Trip
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bulk Direction Buttons */}
            {leg.flightsData.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAllFlightsDirection(legIndex, 'onward')}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors"
                  style={{ fontSize: '8.5px' }}
                  type="button"
                >
                  All Onward
                </button>
                <button
                  onClick={() => setAllFlightsDirection(legIndex, 'return')}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded-md transition-colors"
                  style={{ fontSize: '8.5px' }}
                  type="button"
                >
                  All Return
                </button>
              </div>
            )}
            
            {leg.flights.length > 0 && (
              <button
                onClick={() => clearLegSelection(legIndex)}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                style={{ fontSize: '9.5px' }}
                type="button"
              >
                Clear
              </button>
            )}
            
            <button
              onClick={() => autoSelectBestFlight(legIndex)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity text-xs shadow-sm"
              style={{ fontSize: '10px' }}
              type="button"
              disabled={leg.loading}
            >
              <Sparkles className="w-3 h-3" />
              Auto-Select
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Trip Type Toggle */}
          <div className="md:col-span-12 mb-2">
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-lg p-0.5 inline-flex">
                <button
                  onClick={() => {
                    const newLegs = [...journeyLegs];
                    newLegs[legIndex] = {
                      ...newLegs[legIndex],
                      searchParams: {
                        ...newLegs[legIndex].searchParams,
                        trip_type: 'one-way'
                      }
                    };
                    setJourneyLegs(newLegs);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                    leg.searchParams.trip_type === 'one-way'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ fontSize: '9.5px' }}
                  type="button"
                >
                  <Plane className="w-2.5 h-2.5" />
                  One Way
                </button>
                <button
                  onClick={() => {
                    const newLegs = [...journeyLegs];
                    newLegs[legIndex] = {
                      ...newLegs[legIndex],
                      searchParams: {
                        ...newLegs[legIndex].searchParams,
                        trip_type: 'roundtrip',
                        return_date: new Date(
                          new Date(leg.searchParams.date).getTime() + 7 * 24 * 60 * 60 * 1000
                        ).toISOString().split('T')[0]
                      }
                    };
                    setJourneyLegs(newLegs);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                    leg.searchParams.trip_type === 'roundtrip'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ fontSize: '9.5px' }}
                  type="button"
                >
                  <ArrowRightLeft className="w-2.5 h-2.5" />
                  Round Trip
                </button>
              </div>
            </div>
          </div>
          
          {/* From Airport */}
          <div className="md:col-span-3">
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select
                value={leg.searchParams.from}
                onChange={(e) => {
                  setJourneyLegs(prev => {
                    const newLegs = [...prev];
                    newLegs[legIndex] = {
                      ...newLegs[legIndex],
                      searchParams: {
                        ...newLegs[legIndex].searchParams,
                        from: e.target.value
                      }
                    };
                    return newLegs;
                  });
                }}
                className="w-full pl-7 pr-6 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs appearance-none bg-white"
                style={{ fontSize: '9.5px' }}
              >
                <option value="">From</option>
                <option value="DEL">Delhi (DEL)</option>
                <option value="BOM">Mumbai (BOM)</option>
                <option value="LHR">London (LHR)</option>
                <option value="CDG">Paris (CDG)</option>
                <option value="JFK">New York (JFK)</option>
                <option value="DXB">Dubai (DXB)</option>
                <option value="SIN">Singapore (SIN)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* To Airport */}
          <div className="md:col-span-3">
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select
                value={leg.searchParams.to}
                onChange={(e) => {
                  setJourneyLegs(prev => {
                    const newLegs = [...prev];
                    newLegs[legIndex] = {
                      ...newLegs[legIndex],
                      searchParams: {
                        ...newLegs[legIndex].searchParams,
                        to: e.target.value
                      }
                    };
                    return newLegs;
                  });
                }}
                className="w-full pl-7 pr-6 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs appearance-none bg-white"
                style={{ fontSize: '9.5px' }}
              >
                <option value="">To</option>
                <option value="DEL">Delhi (DEL)</option>
                <option value="BOM">Mumbai (BOM)</option>
                <option value="LHR">London (LHR)</option>
                <option value="CDG">Paris (CDG)</option>
                <option value="JFK">New York (JFK)</option>
                <option value="DXB">Dubai (DXB)</option>
                <option value="SIN">Singapore (SIN)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Departure Date */}
          <div className="md:col-span-3">
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="date"
                value={leg.searchParams.date}
                onChange={(e) => {
                  setJourneyLegs(prev => {
                    const newLegs = [...prev];
                    newLegs[legIndex] = {
                      ...newLegs[legIndex],
                      searchParams: {
                        ...newLegs[legIndex].searchParams,
                        date: e.target.value
                      }
                    };
                    return newLegs;
                  });
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                style={{ fontSize: '9.5px' }}
              />
            </div>
          </div>
          
          {/* Return Date (only for roundtrip) */}
          {isRoundtrip && (
            <div className="md:col-span-3">
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="date"
                  value={leg.searchParams.return_date}
                  onChange={(e) => {
                    setJourneyLegs(prev => {
                      const newLegs = [...prev];
                      newLegs[legIndex] = {
                        ...newLegs[legIndex],
                        searchParams: {
                          ...newLegs[legIndex].searchParams,
                          return_date: e.target.value
                        }
                      };
                      return newLegs;
                    });
                  }}
                  min={leg.searchParams.date}
                  className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                  style={{ fontSize: '9.5px' }}
                />
              </div>
            </div>
          )}
          
          {/* Search Button */}
          <div className={`md:col-span-${isRoundtrip ? '3' : '3'}`}>
            <button
              onClick={() => handleLegSearch(legIndex)}
              disabled={!leg.searchParams.from || !leg.searchParams.to || !leg.searchParams.date || (isRoundtrip && !leg.searchParams.return_date)}
              className={`w-full ${
                isRoundtrip
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } text-white font-semibold py-1.5 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ fontSize: '9.5px' }}
              type="button"
            >
              <Search className="w-3 h-3" />
              Search
            </button>
          </div>
        </div>

        {/* Leg Status */}
        {leg.loading && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Loading flights...</span>
          </div>
        )}
        
        {leg.error && (
          <div className="mt-2 p-1.5 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
              <span className="text-xs text-yellow-700" style={{ fontSize: '9px' }}>{leg.error}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =================== EFFECTS ===================

  // Apply filters when filters change for each leg
  useEffect(() => {
    setJourneyLegs(prev => {
      return prev.map((leg, legIndex) => {
        const filteredFlights = applyFiltersForLeg(legIndex);
        const suggestedFlights = calculateSuggestedFlights(filteredFlights);
        return {
          ...leg,
          filteredFlights: filteredFlights || [],
          suggestedFlights: suggestedFlights || []
        };
      });
    });
  }, [journeyLegs.map(leg => JSON.stringify(leg.filters)).join('|'), journeyLegs.map(leg => leg.sortBy).join('|')]);
  
  // Load initial flights for all legs
  useEffect(() => {
    journeyLegs.forEach((_, index) => {
      fetchFlightsForLeg(index);
    });
    
    fetchSubmittedJourneys();
  }, []);

  // Update search params when current leg changes in single view
  useEffect(() => {
    if (viewMode === 'single' && journeyLegs[currentLeg]) {
      setSearchParams({ ...journeyLegs[currentLeg].searchParams });
    }
  }, [currentLeg, journeyLegs, viewMode]);

  // =================== RENDER ===================

  // Main return function continues...
  // Due to length constraints, the main return function is provided in the previous response
  
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontSize: '10px' }}>
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">SkySearch</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium" style={{ fontSize: '9px' }}>
                  Multi-Leg
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Global Direction Buttons */}
              <button
                onClick={() => setAllFlightsDirectionGlobal('onward')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition-colors"
                style={{ fontSize: '9px' }}
                type="button"
              >
                All Onward
              </button>
              <button
                onClick={() => setAllFlightsDirectionGlobal('return')}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md transition-colors"
                style={{ fontSize: '9px' }}
                type="button"
              >
                All Return
              </button>
              
              <button
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${
                  showPassengerList
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                style={{ fontSize: '10px' }}
                type="button"
              >
                <UsersIcon className="w-3.5 h-3.5" />
                <Link to={`/operations/Uploadticket/${leadID}`}> Ticket Upload</Link>
              </button>
              <button
                onClick={() => setShowJourneyMap(!showJourneyMap)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                style={{ fontSize: '10px' }}
                type="button"
              >
                <Map className="w-3.5 h-3.5" />
                Journey Map
              </button>
              
              {/* Passenger Data Button */}
              <button
                onClick={() => {
                  if (!showPassengerList) {
                    fetchPassengerData();
                  }
                  setShowPassengerList(!showPassengerList);
                  setShowSubmittedJourneys(false);
                  setShowHubsList(false);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${
                  showPassengerList
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                style={{ fontSize: '10px' }}
                type="button"
              >
                <UsersIcon className="w-3.5 h-3.5" />
                Passenger Data
              </button>
              
              {/* View Submitted Journeys Button */}
              <button
                onClick={() => {
                  if (!showSubmittedJourneys) {
                    fetchSubmittedJourneys();
                  }
                  setShowSubmittedJourneys(!showSubmittedJourneys);
                  setShowPassengerList(false);
                  setShowHubsList(false);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${
                  showSubmittedJourneys
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                style={{ fontSize: '10px' }}
                type="button"
              >
                <History className="w-3.5 h-3.5" />
                Submitted Journeys
              </button>
              
              {/* Travel Hubs Button */}
              <button
                onClick={() => {
                  if (!showHubsList) {
                    fetchTravelHubs();
                  }
                  setShowHubsList(!showHubsList);
                  setShowPassengerList(false);
                  setShowSubmittedJourneys(false);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${
                  showHubsList
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                style={{ fontSize: '10px' }}
                type="button"
              >
                <Building className="w-3.5 h-3.5" />
                Travel Hubs
              </button>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: '10px' }} type="button">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Builder Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 py-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white" style={{ fontSize: '11px' }}>Multi-Leg Journey Builder</h2>
                  <p className="text-xs text-white/80" style={{ fontSize: '9.5px' }}>Build your complete itinerary step by step</p>
                </div>
              </div>
              <button
                onClick={addNewLeg}
                className="flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm text-xs"
                style={{ fontSize: '10px' }}
                type="button"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Leg
              </button>
            </div>
            
            {/* Legs Navigation */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {journeyLegs.map((leg, index) => (
                <div
                  key={leg.id}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all flex-shrink-0 ${
                    viewMode === 'single' && currentLeg === index
                      ? 'bg-white text-blue-700 shadow-lg'
                      : leg.flights.length > 0
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : leg.searchParams.trip_type === 'roundtrip'
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => {
                    if (viewMode === 'single') {
                      editLeg(index);
                    } else {
                      setCurrentLeg(index);
                      setViewMode('single');
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      viewMode === 'single' && currentLeg === index
                        ? 'bg-blue-100 text-blue-700'
                        : leg.flights.length > 0
                        ? 'bg-emerald-600 text-white'
                        : leg.searchParams.trip_type === 'roundtrip'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/30 text-white'
                    }`}>
                      {leg.flights.length > 0 ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <span className="text-xs font-bold" style={{ fontSize: '9px' }}>{index + 1}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-medium whitespace-nowrap" style={{ fontSize: '10px' }}>{leg.name}</span>
                      {leg.flights.length > 0 ? (
                        <div className="text-2xs opacity-90" style={{ fontSize: '8px' }}>
                          {leg.flights[0].airline}
                        </div>
                      ) : (
                        <div className="text-2xs opacity-90" style={{ fontSize: '8px' }}>
                          {leg.searchParams.trip_type === 'roundtrip' ? 'Round Trip' : 'Not selected'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {journeyLegs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLeg(index);
                      }}
                      className="ml-1 hover:bg-red-500/20 p-0.5 rounded transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Journey Map Modal */}
      {showJourneyMap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900" style={{ fontSize: '11px' }}>Journey Map</h3>
                </div>
                <button
                  onClick={() => setShowJourneyMap(false)}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              {journeyLegs.length === 0 ? (
                <div className="text-center py-6">
                  <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600" style={{ fontSize: '10px' }}>No legs in your journey yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {journeyLegs.map((leg, index) => (
                    <div key={leg.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            leg.flights.length > 0 ? 'bg-emerald-100 text-emerald-700' : 
                            leg.searchParams.trip_type === 'roundtrip' ? 'bg-purple-100 text-purple-700' : 
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900" style={{ fontSize: '10px' }}>{leg.name}</h4>
                            <p className="text-xs text-gray-600" style={{ fontSize: '9px' }}>{leg.searchParams.from} → {leg.searchParams.to}</p>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          leg.flights.length > 0 ? 'bg-emerald-100 text-emerald-700' : 
                          leg.searchParams.trip_type === 'roundtrip' ? 'bg-purple-100 text-purple-700' : 
                          'bg-amber-100 text-amber-700'
                        }`} style={{ fontSize: '9px' }}>
                          {leg.flights.length > 0 ? 'Complete' : 
                           leg.searchParams.trip_type === 'roundtrip' ? 'Round Trip' : 
                           'Pending'}
                        </span>
                      </div>
                      
                      {leg.flights.length > 0 ? (
                        <div className="bg-white rounded-md p-2 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium" style={{ fontSize: '10px' }}>{leg.flights[0].airline}</div>
                              <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Flight {leg.flights[0].flight_number}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium" style={{ fontSize: '10px' }}>{formatPrice(leg.flights[0].price)}</div>
                              <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>{formatDuration(leg.flights[0].duration)}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-500" style={{ fontSize: '9.5px' }}>
                          No flight selected for this leg
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Total Journey</div>
                  <div className="font-semibold text-gray-900" style={{ fontSize: '10px' }}>{getJourneySummary()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600" style={{ fontSize: '9px' }}>Total Price</div>
                  <div className="font-semibold text-gray-900" style={{ fontSize: '10px' }}>{formatPrice(getTotalPrice())}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Show passenger list, submitted journeys, hubs list, or builder */}
        {showPassengerList ? renderPassengerListView(activeGroupTab, setActiveGroupTab) :
          showSubmittedJourneys ? (
            showHubsList ? renderTravelHubsList() : renderSubmittedJourneysView()
          ) : (
            <>
              {/* Journey Summary & Submit Section */}
              {/* Floating Journey Summary Popup - Bottom Right */}
              {(getTotalSelectedFlights() > 0 || submitStatus.message) && (
                <div className="fixed bottom-4 right-4 z-40 max-w-sm">
                  {/* Collapsed/Summary View */}
                  {!showJourneySummaryPopup && (
                    <button
                      onClick={() => setShowJourneySummaryPopup(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg p-3 flex items-center gap-3 group hover:shadow-xl transition-all duration-200"
                      type="button"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {getTotalSelectedFlights()}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold" style={{ fontSize: '10px' }}>
                          {getTotalSelectedFlights()}/{journeyLegs.length} Legs
                        </div>
                        <div className="text-xs opacity-90" style={{ fontSize: '9px' }}>
                          {formatPrice(getTotalPrice())}
                        </div>
                      </div>
                      <ChevronUp className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                  
                  {/* Expanded Popup */}
                  {showJourneySummaryPopup && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
                      {/* Popup Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xs font-semibold text-white" style={{ fontSize: '10px' }}>
                                Journey Summary
                              </h3>
                              <p className="text-xs text-white/80" style={{ fontSize: '9px' }}>
                                {getTotalSelectedFlights()}/{journeyLegs.length} legs complete
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowJourneySummaryPopup(false)}
                            className="text-white/80 hover:text-white"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Popup Content */}
                      <div className="max-h-96 overflow-y-auto">
                        {/* Quick Stats */}
                        <div className="p-3 border-b border-gray-100">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                {getTotalSelectedFlights()}
                              </div>
                              <div className="text-xs text-gray-600" style={{ fontSize: '8px' }}>Flights</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                {journeyLegs.length}
                              </div>
                              <div className="text-xs text-gray-600" style={{ fontSize: '8px' }}>Legs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900" style={{ fontSize: '11px' }}>
                                {formatPrice(getTotalPrice())}
                              </div>
                              <div className="text-xs text-gray-600" style={{ fontSize: '8px' }}>Total</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Legs Summary */}
                        <div className="p-3 space-y-2">
                          {journeyLegs.map((leg, index) => (
                            <div key={leg.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                              <div className="flex items-center gap-2 flex-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  leg.flights.length > 0 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : leg.searchParams.trip_type === 'roundtrip'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {leg.flights.length > 0 ? (
                                    <Check className="w-2.5 h-2.5" />
                                  ) : (
                                    <span className="text-xs font-bold" style={{ fontSize: '8px' }}>{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                      {leg.name}
                                    </span>
                                    {leg.searchParams.trip_type === 'roundtrip' && leg.flights.length === 0 && (
                                      <span className="text-xs text-purple-600 font-medium" style={{ fontSize: '8px' }}>
                                        (RT)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate" style={{ fontSize: '8px' }}>
                                    {leg.flights.length > 0 
                                      ? `${leg.flights[0].airline} • ${formatPrice(leg.flights[0].price)}`
                                      : 'Not selected'
                                    }
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setCurrentLeg(index);
                                  setViewMode('single');
                                  setShowJourneySummaryPopup(false);
                                }}
                                className="text-xs font-medium px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors whitespace-nowrap"
                                style={{ fontSize: '8px' }}
                                type="button"
                              >
                                {leg.flights.length > 0 ? 'Change' : 'Select'}
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Submit Status Message */}
                        {submitStatus.message && (
                          <div className={`p-3 border-t border-gray-100 ${
                            submitStatus.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
                          }`}>
                            <div className={`flex items-center gap-1.5 text-xs ${
                              submitStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                            }`} style={{ fontSize: '9px' }}>
                              {submitStatus.type === 'success' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              <span>{submitStatus.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Popup Footer */}
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex gap-2">
                          <button
                            onClick={clearAllJourney}
                            className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            style={{ fontSize: '9px' }}
                            type="button"
                          >
                            Clear All
                          </button>
                          
                          <button
                            onClick={addNewLeg}
                            className="flex-1 px-2 py-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 border border-purple-300 rounded-md hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
                            style={{ fontSize: '9px' }}
                            type="button"
                          >
                            <Plus className="w-3 h-3" />
                            Add Leg
                          </button>
                        </div>
                        
                        <button
                          onClick={submitSelectedFlights}
                          disabled={submitting || getTotalSelectedFlights() !== journeyLegs.length}
                          className={`w-full mt-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                            submitting
                              ? 'bg-gray-300 cursor-not-allowed'
                              : getTotalSelectedFlights() === journeyLegs.length
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm hover:shadow'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          style={{ fontSize: '10px' }}
                          type="button"
                        >
                          {submitting ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Submit Complete Journey
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Main Content Area */}
              {viewMode === 'compare' ? renderCompareView() : renderSingleView()}
            </>
          )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Plane className="w-5 h-5" />
              <span className="text-lg font-bold">SkySearch Multi-Leg</span>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-base font-bold text-emerald-400">{getTotalSelectedFlights()}</div>
                <div className="text-xs text-gray-400" style={{ fontSize: '9px' }}>Flights Selected</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-blue-400">{journeyLegs.length}</div>
                <div className="text-xs text-gray-400" style={{ fontSize: '9px' }}>Journey Legs</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-purple-400">{formatPrice(getTotalPrice())}</div>
                <div className="text-xs text-gray-400" style={{ fontSize: '9px' }}>Total Price</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-orange-400">{journeyStats.totalJourneys}</div>
                <div className="text-xs text-gray-400" style={{ fontSize: '9px' }}>Submitted Journeys</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-cyan-400">{passengerData.length}</div>
                <div className="text-xs text-gray-400" style={{ fontSize: '9px' }}>Passengers</div>
              </div>
            </div>
            <div className="text-xs text-gray-400" style={{ fontSize: '9px' }}>
              © 2024 SkySearch. Build complex itineraries with ease.
            </div>
          </div>
        </div>
      </footer>

      {/* PNR Creation Modal */}
      {renderPnrCreationModal()}

      {/* Vendor Selection Modal */}
      {renderVendorSelectionModal()}
      
    </div>
  );
};
   
export default FlightListingPage;