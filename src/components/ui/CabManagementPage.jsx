import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Users,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MoreVertical,
  ChevronDown,
  Upload,
  Download,
  Hotel,
  Plane,
  Navigation,
  Home,
  Building,
  UserCheck,
  ShieldCheck,
  CalendarDays,
  User,
  Tag,
  FileText,
  Package,
  ArrowRight,
  ArrowLeftRight,
  UserPlus
} from 'lucide-react';
import axios from 'axios';
import bookImage  from "../../assets/book.png"
const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';


const CabManagementPage = () => {

  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('vehicle-listing');
  const [transferSubTab, setTransferSubTab] = useState('all');
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [transportVendors, setTransportVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [flightPassengers, setFlightPassengers] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [finalDestinationAssignments, setFinalDestinationAssignments] = useState([]);
  const [transitCabAssignments, setTransitCabAssignments] = useState([]);
  const [expandedPassengers, setExpandedPassengers] = useState({});
  
  const [assignmentDropdown, setAssignmentDropdown] = useState({
    isOpen: false,
    assignment: null,
    availableCabs: [],
    position: { x: 0, y: 0 }
  });
  
  const [formData, setFormData] = useState({
    cabNumber: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    cabType: 'Sedan',
    capacity: 4,
    companyName: '',
    baseLocation: '',
    acAvailable: true,
    notes: '',
  });

  const cabTypes = ['Sedan', 'SUV', 'MPV', 'Luxury', 'Mini Bus', 'Bus'];
  const statuses = ['Available', 'Booked', 'Maintenance', 'Offline'];
  const transferTypes = ['Onward', 'Return'];
  const dropdownRef = useRef(null);

  // Fetch cabs data
  const fetchCabs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/cabs`);
      
      if (response.data?.success) {
        const transformedCabs = response.data.data.map(cab => {
          let assignedPassengers = [];
          try {
            if (cab.assigned_passengers) {
              assignedPassengers = JSON.parse(cab.assigned_passengers);
              if (!Array.isArray(assignedPassengers)) {
                assignedPassengers = [];
              }
            }
          } catch (error) {
            console.error('Error parsing assigned_passengers:', error);
            assignedPassengers = [];
          }
          
          return {
            id: cab.id,
            cabNumber: cab.cab_number,
            driverName: cab.driver_name,
            driverPhone: cab.driver_phone,
            driverLicense: cab.driver_license_number,
            cabType: cab.cab_type,
            capacity: cab.capacity,
            companyName: cab.company_name,
            baseLocation: cab.base_location,
            currentStatus: cab.current_status || 'Available',
            acAvailable: Boolean(cab.ac_available),
            notes: cab.notes,
            assignedPassengers: assignedPassengers,
            createdAt: cab.created_at,
            updatedAt: cab.updated_at
          };
        });
        
        setCabs(transformedCabs || []);
      } else {
        setCabs([]);
        setError(response.data?.message || 'Failed to fetch cab data');
      }
    } catch (err) {
      console.error('Error fetching cabs:', err);
      setCabs([]);
      setError('Failed to load cab data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transport vendors
  const fetchTransportVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await axios.get(`${API_BASE_URL}/cabs/searchAllTransport`);
      
      if (response.data?.success) {
        setTransportVendors(response.data.data || []);
      } else {
        console.error('Failed to fetch transport vendors:', response.data?.message);
      }
    } catch (err) {
      console.error('Error fetching transport vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch flight passengers with hotel assignments
  const fetchFlightPassengers = async () => {
    try {
      setLoadingFlights(true);
      const response = await axios.get(`${API_BASE_URL}/hotels/done-passengers/lead/${id}`);
      
      if (response.data?.success) {
        setFlightPassengers(response.data.data || []);
        processFlightAssignments(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching flight passengers:', err);
    } finally {
      setLoadingFlights(false);
    }
  };

  // Helper function to determine assignment type for backend API
  const getAssignmentType = (assignment) => {
    const { type, transferType } = assignment;
    
    console.log('Determining assignment type:', { type, transferType });
    
    let result;
    
    if (type === 'FinalDestination') {
      result = transferType === 'Onward' ? 'final_onward' : 'final_return';
    } else if (type === 'TransitCab') {
      result = transferType === 'Onward' ? 'transit_onward' : 'transit_return';
    } else {
      result = 'final_onward'; // Default fallback
    }
    
    console.log('Resulting assignment type:', result);
    return result;
  };

  // Helper function to get PNR ID from assignment
  const getPnrIdFromAssignment = (assignment) => {
    console.log('Getting PNR ID from assignment:', assignment);
    
    // First try to use the pnrId from assignment
    if (assignment.pnrId) {
      console.log('Using pnrId from assignment:', assignment.pnrId);
      return assignment.pnrId;
    }
    
    // If not found, try to find it by pnrNumber from flightPassengers
    if (assignment.pnrNumber) {
      console.log('Looking up pnrId by pnrNumber:', assignment.pnrNumber);
      const pnrData = flightPassengers.find(p => p.pnr_number === assignment.pnrNumber);
      if (pnrData) {
        console.log('Found pnrData:', pnrData.id);
        return pnrData.id;
      }
    }
    
    console.log('No PNR ID found');
    return null;
  };

  // Process flight assignments - categorize as final destination or transit cab
  const processFlightAssignments = (passengerData) => {
    const finalDest = [];
    const transitCabs = [];
    
    passengerData.forEach(pnr => {
      const segments = pnr.flight_segments || [];
      const flightSegments = segments.filter(s => s.type !== 'hotel');
      const hotelSegments = segments.filter(s => s.type === 'hotel');
      
      // Skip if no flight segments
      if (flightSegments.length === 0) return;
      
      // Process each passenger individually
      pnr.passengers.forEach(passenger => {
        const passengerName = getPassengerName(passenger);
        const passengerId = passenger.passenger_id;
        
        // Sort flight segments by departure time
        const sortedSegments = [...flightSegments].sort((a, b) => {
          const dateA = new Date(`${a.departure_date}T${a.departure_time}`);
          const dateB = new Date(`${b.departure_date}T${b.departure_time}`);
          return dateA - dateB;
        });
        
        // If there's only one flight segment, it's always final destination
        if (sortedSegments.length === 1) {
          const flightSegment = sortedSegments[0];
          
          // Create final destination transfers for each hotel
          hotelSegments.forEach(hotelSegment => {
            // Onward: Airport to Hotel
            finalDest.push({
              id: `final-${pnr.id}-${flightSegment.id}-${passengerId}-onward`,
              type: 'FinalDestination',
              transferType: 'Onward',
              pnrNumber: pnr.pnr_number,
              pnrId: pnr.id,
              passengerId: passengerId,
              passengerName: passengerName,
              passengerData: passenger, // Store complete passenger data
              passengerCount: 1,
              flightNumber: flightSegment.flight_number,
              fromAirport: flightSegment.from_airport,
              toAirport: flightSegment.to_airport,
              arrivalDate: flightSegment.arrival_date,
              arrivalTime: flightSegment.arrival_time,
              terminal: flightSegment.arv_terminal,
              status: 'Pending',
              cabAssigned: null,
              segmentId: flightSegment.id,
              details: {
                type: 'Airport to Hotel',
                from: `${flightSegment.to_airport} Airport`,
                to: hotelSegment.vendor_name,
                duration: flightSegment.duration,
                isFinalDestination: true
              },
              flightRoute: `${flightSegment.from_airport} → ${flightSegment.to_airport}`,
              hotelId: hotelSegment.vendor_id,
              hotelName: hotelSegment.vendor_name,
              hotelCheckIn: hotelSegment.check_in,
              hotelCheckOut: hotelSegment.check_out
            });
            
            // Return: Hotel to Airport
            finalDest.push({
              id: `final-${pnr.id}-${flightSegment.id}-${passengerId}-return`,
              type: 'FinalDestination',
              transferType: 'Return',
              pnrNumber: pnr.pnr_number,
              pnrId: pnr.id,
              passengerId: passengerId,
              passengerName: passengerName,
              passengerData: passenger, // Store complete passenger data
              passengerCount: 1,
              flightNumber: flightSegment.flight_number,
              fromAirport: flightSegment.from_airport,
              toAirport: flightSegment.to_airport,
              departureDate: flightSegment.departure_date,
              departureTime: flightSegment.departure_time,
              terminal: flightSegment.dep_terminal,
              status: 'Pending',
              cabAssigned: null,
              segmentId: flightSegment.id,
              details: {
                type: 'Hotel to Airport',
                from: hotelSegment.vendor_name,
                to: `${flightSegment.from_airport} Airport`,
                duration: flightSegment.duration,
                isFinalDestination: true
              },
              flightRoute: `${flightSegment.to_airport} → ${flightSegment.from_airport}`,
              hotelId: hotelSegment.vendor_id,
              hotelName: hotelSegment.vendor_name,
              hotelCheckIn: hotelSegment.check_in,
              hotelCheckOut: hotelSegment.check_out
            });
          });
        }
        // Multiple flight segments - need to identify final destination vs transit
        else if (sortedSegments.length > 1) {
          // The LAST flight segment (final flight) is for FINAL DESTINATION
          const finalFlightSegment = sortedSegments[sortedSegments.length - 1];
          
          // Create final destination transfers for each hotel (connected to last flight)
          hotelSegments.forEach(hotelSegment => {
            // Onward: Last Airport to Hotel
            finalDest.push({
              id: `final-${pnr.id}-${finalFlightSegment.id}-${passengerId}-onward`,
              type: 'FinalDestination',
              transferType: 'Onward',
              pnrNumber: pnr.pnr_number,
              pnrId: pnr.id,
              passengerId: passengerId,
              passengerName: passengerName,
              passengerData: passenger, // Store complete passenger data
              passengerCount: 1,
              flightNumber: finalFlightSegment.flight_number,
              fromAirport: finalFlightSegment.from_airport,
              toAirport: finalFlightSegment.to_airport,
              arrivalDate: finalFlightSegment.arrival_date,
              arrivalTime: finalFlightSegment.arrival_time,
              terminal: finalFlightSegment.arv_terminal,
              status: 'Pending',
              cabAssigned: null,
              segmentId: finalFlightSegment.id,
              details: {
                type: 'Final Airport to Hotel',
                from: `${finalFlightSegment.to_airport} Airport (Final)`,
                to: hotelSegment.vendor_name,
                duration: finalFlightSegment.duration,
                isFinalDestination: true
              },
              flightRoute: `${finalFlightSegment.from_airport} → ${finalFlightSegment.to_airport}`,
              hotelId: hotelSegment.vendor_id,
              hotelName: hotelSegment.vendor_name,
              hotelCheckIn: hotelSegment.check_in,
              hotelCheckOut: hotelSegment.check_out
            });
            
            // Return: Hotel to First Airport (for return journey)
            const firstFlightSegment = sortedSegments[0];
            finalDest.push({
              id: `final-${pnr.id}-${firstFlightSegment.id}-${passengerId}-return`,
              type: 'FinalDestination',
              transferType: 'Return',
              pnrNumber: pnr.pnr_number,
              pnrId: pnr.id,
              passengerId: passengerId,
              passengerName: passengerName,
              passengerData: passenger, // Store complete passenger data
              passengerCount: 1,
              flightNumber: firstFlightSegment.flight_number,
              fromAirport: firstFlightSegment.from_airport,
              toAirport: firstFlightSegment.to_airport,
              departureDate: firstFlightSegment.departure_date,
              departureTime: firstFlightSegment.departure_time,
              terminal: firstFlightSegment.dep_terminal,
              status: 'Pending',
              cabAssigned: null,
              segmentId: firstFlightSegment.id,
              details: {
                type: 'Hotel to First Airport',
                from: hotelSegment.vendor_name,
                to: `${firstFlightSegment.from_airport} Airport`,
                duration: firstFlightSegment.duration,
                isFinalDestination: true
              },
              flightRoute: `${firstFlightSegment.to_airport} → ${firstFlightSegment.from_airport}`,
              hotelId: hotelSegment.vendor_id,
              hotelName: hotelSegment.vendor_name,
              hotelCheckIn: hotelSegment.check_in,
              hotelCheckOut: hotelSegment.check_out
            });
          });
          
          // All flight segments EXCEPT the last one are for TRANSIT CAB
          for (let i = 0; i < sortedSegments.length - 1; i++) {
            const currentSegment = sortedSegments[i];
            const nextSegment = sortedSegments[i + 1];
            
            // Create transit transfer if airports are different
            if (currentSegment.to_airport !== nextSegment.from_airport) {
              // Onward transit (arrival airport to next departure airport)
              transitCabs.push({
                id: `transit-${pnr.id}-${currentSegment.id}-${nextSegment.id}-${passengerId}-onward`,
                type: 'TransitCab',
                transferType: 'Onward',
                pnrNumber: pnr.pnr_number,
                pnrId: pnr.id,
                passengerId: passengerId,
                passengerName: passengerName,
                passengerData: passenger, // Store complete passenger data
                passengerCount: 1,
                flightNumber: `${currentSegment.flight_number} → ${nextSegment.flight_number}`,
                fromAirport: currentSegment.to_airport,
                toAirport: nextSegment.from_airport,
                arrivalDate: currentSegment.arrival_date,
                arrivalTime: currentSegment.arrival_time,
                departureDate: nextSegment.departure_date,
                departureTime: nextSegment.departure_time,
                terminal: currentSegment.arv_terminal,
                status: 'Pending',
                cabAssigned: null,
                details: {
                  type: 'Transit Between Flights',
                  from: `${currentSegment.to_airport} Airport`,
                  to: `${nextSegment.from_airport} Airport`,
                  duration: 'Transit',
                  isTransit: true
                },
                flightRoute: `${currentSegment.to_airport} → ${nextSegment.from_airport}`,
                segmentIndex: i,
                totalSegments: sortedSegments.length,
                currentFlight: currentSegment.flight_number,
                nextFlight: nextSegment.flight_number,
                layoverTime: calculateLayoverTime(
                  currentSegment.arrival_date, currentSegment.arrival_time,
                  nextSegment.departure_date, nextSegment.departure_time
                )
              });
            }
          }
        }
      });
    });
    
    // Check assignments based on actual cab assignments in PNR data
    const filteredFinalDest = finalDest.map(assignment => {
      // Find the PNR data for this assignment
      const pnrData = passengerData.find(p => p.pnr_number === assignment.pnrNumber);
      let isAssigned = false;
      let assignedCabNumber = null;
      
      if (pnrData) {
        if (assignment.type === 'FinalDestination') {
          if (assignment.transferType === 'Onward') {
            isAssigned = !!pnrData.final_dest_onward_cab_number;
            assignedCabNumber = pnrData.final_dest_onward_cab_number;
          } else if (assignment.transferType === 'Return') {
            isAssigned = !!pnrData.final_dest_return_cab_number;
            assignedCabNumber = pnrData.final_dest_return_cab_number;
          }
        }
      }
      
      return {
        ...assignment,
        isAssigned,
        assignedCabNumber,
        finalDestOnwardCabNumber: pnrData?.final_dest_onward_cab_number,
        finalDestReturnCabNumber: pnrData?.final_dest_return_cab_number,
        transitOnwardCabNumber: pnrData?.transit_onward_cab_number,
        transitReturnCabNumber: pnrData?.transit_return_cab_number
      };
    });
    
    const filteredTransitCabs = transitCabs.map(assignment => {
      // Find the PNR data for this assignment
      const pnrData = passengerData.find(p => p.pnr_number === assignment.pnrNumber);
      let isAssigned = false;
      let assignedCabNumber = null;
      
      if (pnrData) {
        if (assignment.type === 'TransitCab') {
          if (assignment.transferType === 'Onward') {
            isAssigned = !!pnrData.transit_onward_cab_number;
            assignedCabNumber = pnrData.transit_onward_cab_number;
          } else if (assignment.transferType === 'Return') {
            isAssigned = !!pnrData.transit_return_cab_number;
            assignedCabNumber = pnrData.transit_return_cab_number;
          }
        }
      }
      
      return {
        ...assignment,
        isAssigned,
        assignedCabNumber,
        finalDestOnwardCabNumber: pnrData?.final_dest_onward_cab_number,
        finalDestReturnCabNumber: pnrData?.final_dest_return_cab_number,
        transitOnwardCabNumber: pnrData?.transit_onward_cab_number,
        transitReturnCabNumber: pnrData?.transit_return_cab_number
      };
    });
    
    setFinalDestinationAssignments(filteredFinalDest);
    setTransitCabAssignments(filteredTransitCabs);
  };

  // Helper function to calculate layover time
  const calculateLayoverTime = (arrivalDate, arrivalTime, departureDate, departureTime) => {
    const arrival = new Date(`${arrivalDate}T${arrivalTime}`);
    const departure = new Date(`${departureDate}T${departureTime}`);
    const diffMinutes = Math.floor((departure - arrival) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
    }
  };

  // Helper function to get passenger name
  const getPassengerName = (passenger) => {
    if (!passenger) return 'Unknown Passenger';
    
    // Check if passenger has form_data
    if (passenger.form_data) {
      const firstName = passenger.form_data.first_name || '';
      const lastName = passenger.form_data.last_name || '';
      const name = `${firstName} ${lastName}`.trim();
      
      if (name) return name;
    }
    
    // Fallback to pax_code or passenger_id
    if (passenger.pax_code) return passenger.pax_code;
    if (passenger.passenger_id) return `Passenger ${passenger.passenger_id}`;
    
    return 'Unknown Passenger';
  };

  // Handle form submission for add cab
  const handleAddCab = async (e) => {
    e.preventDefault();
    try {
      const cabData = {
        cab_number: formData.cabNumber.trim(),
        cab_type: formData.cabType,
        capacity: parseInt(formData.capacity) || 4,
        base_location: formData.baseLocation.trim(),
        ac_available: Boolean(formData.acAvailable),
        driver_name: formData.driverName.trim(),
        driver_phone: formData.driverPhone.trim(),
        driver_license_number: formData.driverLicense?.trim() || null,
        company_name: formData.companyName?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      const response = await axios.post(`${API_BASE_URL}/cabs`, cabData);
      
      if (response.data?.success) {
        fetchCabs();
        setIsAddModalOpen(false);
        resetForm();
        alert('Cab added successfully!');
      } else {
        alert(response.data?.message || 'Failed to add cab');
      }
    } catch (err) {
      console.error('Error adding cab:', err);
      alert('Error adding cab. Please try again.');
    }
  };

  // Handle edit cab
  const handleEditCab = async (e) => {
    e.preventDefault();
    try {
      const cabData = {
        cab_number: formData.cabNumber.trim(),
        cab_type: formData.cabType,
        capacity: parseInt(formData.capacity) || 4,
        base_location: formData.baseLocation.trim(),
        ac_available: Boolean(formData.acAvailable),
        driver_name: formData.driverName.trim(),
        driver_phone: formData.driverPhone.trim(),
        driver_license_number: formData.driverLicense?.trim() || null,
        company_name: formData.companyName?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      const response = await axios.put(`${API_BASE_URL}/cabs/${selectedCab.id}`, cabData);
      
      if (response.data?.success) {
        fetchCabs();
        setIsEditModalOpen(false);
        setSelectedCab(null);
        resetForm();
        alert('Cab updated successfully!');
      } else {
        alert(response.data?.message || 'Failed to update cab');
      }
    } catch (err) {
      console.error('Error updating cab:', err);
      alert('Error updating cab. Please try again.');
    }
  };

  // Handle delete cab
  const handleDeleteCab = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cab?')) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/cabs/${id}`);
      
      if (response.data?.success) {
        fetchCabs();
        alert('Cab deleted successfully!');
      } else {
        alert(response.data?.message || 'Failed to delete cab');
      }
    } catch (err) {
      console.error('Error deleting cab:', err);
      alert('Error deleting cab. Please try again.');
    }
  };

  // Open assign cab dropdown
  const openAssignDropdown = (assignment, event) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Opening assign dropdown for:', assignment);
    
    // Find all available cabs (not just Available status, but all cabs)
    const allCabs = cabs.map(cab => ({
      ...cab,
      isAvailable: cab.currentStatus === 'Available' && cab.capacity >= assignment.passengerCount
    }));
    
    // Calculate dropdown position
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate position to ensure dropdown stays within viewport
    let left = buttonRect.left;
    let top = buttonRect.bottom + 5;
    
    // Adjust if dropdown would go off screen
    const dropdownWidth = 320;
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 10;
    }
    
    const dropdownHeight = 300;
    if (top + dropdownHeight > viewportHeight) {
      top = buttonRect.top - dropdownHeight - 5;
    }
    
    setAssignmentDropdown({
      isOpen: true,
      assignment: assignment,
      availableCabs: allCabs,
      position: { x: left, y: top }
    });
    
    // Add event listener to close dropdown when clicking outside
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
  };

  // Handle click outside dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
        !event.target.closest('.assign-button')) {
      closeAssignDropdown();
    }
  };

  // Handle escape key
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      closeAssignDropdown();
    }
  };

  // Close assign dropdown
  const closeAssignDropdown = () => {
    setAssignmentDropdown({
      isOpen: false,
      assignment: null,
      availableCabs: [],
      position: { x: 0, y: 0 }
    });
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscapeKey);
  };

  // Assign cab to assignment with complete passenger details
  const assignCabToAssignment = async (cab, assignment) => {
    try {
      closeAssignDropdown();
      
      console.log('Assigning cab to assignment:', {
        cab: cab.cabNumber,
        assignment: assignment,
        passengerName: assignment.passengerName
      });
      
      // Get the PNR ID from assignment
      const pnrId = getPnrIdFromAssignment(assignment);
      
      console.log('PNR ID found:', pnrId);
      
      if (!pnrId) {
        alert('PNR ID not found. Please try refreshing the data.');
        return;
      }

      // Use the passengerData stored in assignment
      const passengerData = assignment.passengerData;

      // Create payload with complete passenger details
      const assignmentType = getAssignmentType(assignment);
      const payload = {
        cab_number: cab.cabNumber,
        assignment_type: assignmentType,
        passenger_details: {
          // Basic passenger info
          passenger_name: assignment.passengerName,
          passenger_id: assignment.passengerId,
          pax_code: passengerData?.pax_code || null,
          
          // PNR and flight info
          pnr_number: assignment.pnrNumber,
          flight_number: assignment.flightNumber,
          transfer_type: assignment.transferType,
          assignment_type: assignment.type === 'FinalDestination' ? 'final_destination' : 'transit_cab',
          
          // Location info
          from_airport: assignment.fromAirport,
          to_airport: assignment.toAirport,
          hotel_name: assignment.hotelName || null,
          
          // Timing info
          transfer_date: assignment.transferType === 'Onward' ? assignment.arrivalDate : assignment.departureDate,
          transfer_time: assignment.transferType === 'Onward' ? assignment.arrivalTime : assignment.departureTime,
          terminal: assignment.terminal || null,
          
          // Complete form data from passenger
          form_data: passengerData?.form_data || {},
          
          // Passenger status and codes
          pax_status: passengerData?.pax_status || 'Pending',
          fc_code: passengerData?.form_data?.fc_code || null,
          airport_code: passengerData?.form_data?.airport_code || null,
          airport_name: passengerData?.form_data?.airport_name || null,
          
          // Contact details
          email: passengerData?.form_data?.email || '',
          phone: passengerData?.form_data?.['mobile_number_(preferably_whatsapp_number)'] || '',
          alternate_phone: passengerData?.form_data?.['alternate_mobile_number'] || '',
          official_email: passengerData?.form_data?.['official_email_id'] || '',
          
          // Personal details
          date_of_birth: passengerData?.form_data?.date_of_birth || null,
          nationality: passengerData?.form_data?.nationality || null,
          place_of_birth: passengerData?.form_data?.place_of_birth || null,
          address: passengerData?.form_data?.address || null,
          
          // Passport details
          passport_number: passengerData?.form_data?.passport_number || null,
          passport_expiry: passengerData?.form_data?.date_of_expiry || null,
          
          // Meal preference
          meal_type: passengerData?.form_data?.['meal_type_(only_for_hotel)'] || null,
          
          // Additional metadata
          attached_pnr: passengerData?.attached_pnr || [],
          guest_data: passengerData?.guest_data || {},
          selected_fields: passengerData?.selected_fields || [],
          
          // Timestamps
          created_at: passengerData?.created_at || new Date().toISOString(),
          updated_at: passengerData?.updated_at || new Date().toISOString()
        },
        // Transfer details
        transfer_details: {
          from: assignment.details?.from || `${assignment.fromAirport} Airport`,
          to: assignment.details?.to || `${assignment.toAirport} Airport`,
          transfer_type: assignment.transferType,
          date: assignment.transferType === 'Onward' ? assignment.arrivalDate : assignment.departureDate,
          time: assignment.transferType === 'Onward' ? assignment.arrivalTime : assignment.departureTime,
          terminal: assignment.terminal || null,
          layover_time: assignment.layoverTime || null
        },
        // Cab details
        cab_details: {
          driver_name: cab.driverName,
          driver_phone: cab.driverPhone,
          driver_license: cab.driverLicense,
          cab_type: cab.cabType,
          capacity: cab.capacity,
          company_name: cab.companyName,
          base_location: cab.baseLocation,
          ac_available: cab.acAvailable
        }
      };

      console.log('Sending payload with complete passenger details:', payload);
      console.log('API URL:', `${API_BASE_URL}/cabs/${pnrId}/assign`);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/cabs/${pnrId}/assign`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('API Response:', response.data);
        
        if (response.data?.success) {
          // Refresh all data
          await Promise.all([
            fetchCabs(),
            fetchFlightPassengers()
          ]);
          
          alert(`✓ Cab ${cab.cabNumber} assigned for ${assignment.passengerName}'s ${assignment.transferType} ${assignment.type === 'FinalDestination' ? 'Final Destination' : 'Transit'} transfer`);
        } else {
          alert(`Failed to assign cab: ${response.data?.message || 'Unknown error'}`);
        }
      } catch (apiError) {
        console.error('API Error details:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status
        });
        
        if (apiError.response?.status === 404) {
          alert('API endpoint not found. Please check the server is running.');
        } else if (apiError.response?.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert(`Error: ${apiError.message}`);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please check the console for details.');
    }
  };

  // Remove assignment from cab with passenger details
  const removeAssignment = async (assignment) => {
    const { type, transferType, passengerName, pnrNumber, passengerId } = assignment;
    
    let assignmentType = '';
    if (type === 'FinalDestination') {
      assignmentType = `Final Destination ${transferType}`;
    } else if (type === 'TransitCab') {
      assignmentType = `Transit ${transferType}`;
    }
    
    if (!window.confirm(`Are you sure you want to remove the cab assignment for ${assignmentType} transfer?\n\nPassenger: ${passengerName}\nPNR: ${pnrNumber}`)) {
      return;
    }
    
    try {
      // Get the PNR ID from assignment
      const pnrId = getPnrIdFromAssignment(assignment);
      
      if (!pnrId) {
        alert('PNR ID not found. Please try refreshing the data.');
        return;
      }

      // Use the passengerData stored in assignment
      const passengerData = assignment.passengerData;

      const payload = {
        assignment_type: getAssignmentType(assignment),
        passenger_details: {
          passenger_name: assignment.passengerName,
          passenger_id: assignment.passengerId,
          pax_code: passengerData?.pax_code || null,
          pnr_number: assignment.pnrNumber,
          transfer_type: assignment.transferType,
          form_data: passengerData?.form_data || {}
        }
      };

      console.log('Removing assignment payload with passenger details:', payload);

      const response = await axios.post(
        `${API_BASE_URL}/cabs/${pnrId}/remove`,
        payload
      );
      
      if (response.data?.success) {
        await Promise.all([
          fetchCabs(),
          fetchFlightPassengers()
        ]);
        alert(`Cab assignment removed for ${assignment.passengerName}`);
      } else {
        alert(response.data?.message || 'Failed to remove assignment');
      }
    } catch (err) {
      console.error('Error removing assignment:', err);
      alert('Error removing assignment');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      cabNumber: '',
      driverName: '',
      driverPhone: '',
      driverLicense: '',
      cabType: 'Sedan',
      capacity: 4,
      companyName: '',
      baseLocation: '',
      acAvailable: true,
      notes: '',
    });
  };

  // Open edit modal with cab data
  const openEditModal = (cab) => {
    setSelectedCab(cab);
    setFormData({
      cabNumber: cab.cabNumber || '',
      driverName: cab.driverName || '',
      driverPhone: cab.driverPhone || '',
      driverLicense: cab.driverLicense || '',
      cabType: cab.cabType || 'Sedan',
      capacity: cab.capacity || 4,
      companyName: cab.companyName || '',
      baseLocation: cab.baseLocation || '',
      acAvailable: cab.acAvailable !== undefined ? cab.acAvailable : true,
      notes: cab.notes || '',
    });
    setIsEditModalOpen(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Booked': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Maintenance': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Offline': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  // Get transfer type color
  const getTransferTypeColor = (type) => {
    switch (type) {
      case 'Onward': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Return': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get assignment type badge color
  const getAssignmentTypeColor = (type) => {
    switch (type) {
      case 'FinalDestination': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'TransitCab': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Helper function to render cab assignment status
  const renderCabAssignmentStatus = (assignment) => {
    const { assignedCabNumber, passengerName } = assignment;
    
    // Try to get the cab details from the cab list
    const assignedCab = cabs.find(cab => cab.cabNumber === assignedCabNumber);
    
    if (assignedCabNumber && assignedCab) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-emerald-600">
              <Car size={10} />
              <span className="font-medium">{assignedCabNumber}</span>
            </div>
            <span className={`px-1 py-0.5 rounded-full text-[8px] font-medium ${getStatusColor('Booked')}`}>
              Assigned
            </span>
          </div>
          <div className="text-xs text-sky-700">
            <span className="font-medium">Passenger:</span> {passengerName}
          </div>
          {assignedCab.driverName && (
            <div className="text-xs text-sky-600">
              <span className="font-medium">Driver:</span> {assignedCab.driverName}
            </div>
          )}
          {assignedCab.driverPhone && (
            <div className="text-xs text-sky-600">
              <span className="font-medium">Phone:</span> {assignedCab.driverPhone}
            </div>
          )}
        </div>
      );
    } else if (assignedCabNumber) {
      // Cab number exists but cab details not found in local list
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-emerald-600">
              <Car size={10} />
              <span className="font-medium">{assignedCabNumber}</span>
            </div>
            <span className={`px-1 py-0.5 rounded-full text-[8px] font-medium ${getStatusColor('Booked')}`}>
              Assigned
            </span>
          </div>
          <div className="text-xs text-sky-700">
            <span className="font-medium">Passenger:</span> {passengerName}
          </div>
        </div>
      );
    } else {
      return <div className="text-gray-500 text-xs italic">No cab assigned</div>;
    }
  };

  // Toggle passenger expansion
  const togglePassengerExpansion = (pnrId, passengerId) => {
    const key = `${pnrId}-${passengerId}`;
    setExpandedPassengers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter cabs
  const filteredCabs = cabs.filter(cab => {
    const matchesSearch = 
      cab.cabNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.baseLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || cab.currentStatus === statusFilter;
    const matchesType = typeFilter === 'All' || cab.cabType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter final destination assignments based on transferSubTab
  const filteredFinalDestAssignments = finalDestinationAssignments.filter(assignment => {
    const matchesSearch = 
      assignment.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.pnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.hotelName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTransferType = 
      transferSubTab === 'all' || 
      assignment.transferType?.toLowerCase() === transferSubTab;
    
    return matchesSearch && matchesTransferType;
  });

  // Filter transit cab assignments based on transferSubTab
  const filteredTransitCabAssignments = transitCabAssignments.filter(assignment => {
    const matchesSearch = 
      assignment.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.pnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.fromAirport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.toAirport?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTransferType = 
      transferSubTab === 'all' || 
      assignment.transferType?.toLowerCase() === transferSubTab;
    
    return matchesSearch && matchesTransferType;
  });

  // Statistics
  const stats = {
    totalCabs: cabs.length,
    availableCabs: cabs.filter(c => c.currentStatus === 'Available').length,
    bookedCabs: cabs.filter(c => c.currentStatus === 'Booked').length,
    assignedCabs: cabs.filter(c => c.assignedPassengers && c.assignedPassengers.length > 0).length,
    totalAssignedPassengers: cabs.reduce((total, cab) => 
      total + (cab.assignedPassengers ? cab.assignedPassengers.length : 0), 0),
    finalDestination: finalDestinationAssignments.length,
    transitCabs: transitCabAssignments.length,
    pendingFinalDest: finalDestinationAssignments.filter(d => !d.isAssigned).length,
    pendingTransit: transitCabAssignments.filter(t => !t.isAssigned).length,
    onwardFinalDest: finalDestinationAssignments.filter(d => d.transferType === 'Onward').length,
    returnFinalDest: finalDestinationAssignments.filter(d => d.transferType === 'Return').length,
    onwardTransit: transitCabAssignments.filter(m => m.transferType === 'Onward').length,
    returnTransit: transitCabAssignments.filter(m => m.transferType === 'Return').length
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cabs`);
      alert(`✓ API Connection Successful!\nFound ${response.data?.data?.length || 0} cabs`);
    } catch (err) {
      alert(`✗ API Connection Failed:\n${err.message}`);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCabs();
      fetchFlightPassengers();
      fetchTransportVendors();
    }
  }, [id]);

  useEffect(() => {
    if (flightPassengers.length > 0) {
      processFlightAssignments(flightPassengers);
    }
  }, [flightPassengers, cabs]);

  // Reset transfer subtab when switching between final destination and transit cab
  useEffect(() => {
    setTransferSubTab('all');
  }, [activeTab]);

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-6 text-[10px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-sky-900">🚗 Cab & Transit Management</h1>
            <p className="text-sky-600 mt-1">
              Manage vehicle listings, final destination transfers, and transit cabs
            </p>
          </div>


          <div>

          
           <p className='mb-0 text-[10px] flex gap-1'>
                                                                    <img src={bookImage} className='mt-0 w-[15px] mb-4 h-[15px]'/>
                                                                    Learn More About The Cabs
                                                                </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                fetchCabs();
                fetchFlightPassengers();
              }}
              className="px-3 py-2 bg-white text-sky-700 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md border border-sky-200 hover:bg-sky-50 text-[10px]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            
            <button
              onClick={testApiConnection}
              className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md border border-amber-200 hover:bg-amber-50 text-[10px]"
            >
              <ShieldCheck size={14} />
              Test API
            </button>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md text-[10px]"
            >
              <Plus size={14} />
              Add New Cab
            </button>
          </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-600 text-[10px]">Total Cabs</p>
                <p className="text-base font-bold text-sky-900">{stats.totalCabs}</p>
                <p className="text-[9px] text-sky-500 mt-1">{stats.availableCabs} available</p>
              </div>
              <div className="p-2 bg-sky-100 rounded-lg">
                <Car size={14} className="text-sky-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-[10px]">Final Destination Cabs</p>
                <p className="text-base font-bold text-emerald-900">{stats.finalDestination}</p>
                <p className="text-[9px] text-emerald-500 mt-1">
                  {stats.onwardFinalDest} onward, {stats.returnFinalDest} return
                </p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Home size={14} className="text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-[10px]">Transit Cabs</p>
                <p className="text-base font-bold text-amber-900">{stats.transitCabs}</p>
                <p className="text-[9px] text-amber-500 mt-1">
                  {stats.onwardTransit} onward, {stats.returnTransit} return
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Navigation size={14} className="text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-violet-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-600 text-[10px]">Assigned Passengers</p>
                <p className="text-base font-bold text-violet-900">{stats.totalAssignedPassengers}</p>
                <p className="text-[9px] text-violet-500 mt-1">Across {stats.assignedCabs} cabs</p>
              </div>
              <div className="p-2 bg-violet-100 rounded-lg">
                <UserCheck size={14} className="text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-lg border border-sky-200 shadow-sm mb-6">
          <div className="flex border-b border-sky-100">
            <button
              onClick={() => {
                setActiveTab('vehicle-listing');
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-2 font-medium text-[10px] transition-all ${
                activeTab === 'vehicle-listing'
                  ? 'text-sky-700 border-b-2 border-sky-500 bg-gradient-to-b from-white to-sky-50/50'
                  : 'text-sky-500 hover:text-sky-700 hover:bg-sky-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Car size={14} />
                Vehicle Listing  
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('final-destination');
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-2 font-medium text-[10px] transition-all ${
                activeTab === 'final-destination'
                  ? 'text-sky-700 border-b-2 border-sky-500 bg-gradient-to-b from-white to-sky-50/50'
                  : 'text-sky-500 hover:text-sky-700 hover:bg-sky-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Home size={14} />
                Final Destination Cab ({finalDestinationAssignments.length})
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('transit-cab');
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-2 font-medium text-[10px] transition-all ${
                activeTab === 'transit-cab'
                  ? 'text-sky-700 border-b-2 border-sky-500 bg-gradient-to-b from-white to-sky-50/50'
                  : 'text-sky-500 hover:text-sky-700 hover:bg-sky-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Navigation size={14} />
                Transit Cab ({transitCabAssignments.length})
              </div>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-3 border-b border-sky-100">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sky-400" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'vehicle-listing' 
                        ? "Search by cab number, driver, location..." 
                        : activeTab === 'final-destination'
                        ? "Search by passenger, PNR, flight, hotel..."
                        : "Search by passenger, PNR, airports, flight..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-[10px]"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {activeTab === 'vehicle-listing' && (
                  <>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-2 pr-6 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent bg-white text-sky-700 text-[10px]"
                      >
                        <option value="All">All Status</option>
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sky-400 pointer-events-none" />
                    </div>
                    
                    <div className="relative">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="appearance-none pl-2 pr-6 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent bg-white text-sky-700 text-[10px]"
                      >
                        <option value="All">All Types</option>
                        {cabTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sky-400 pointer-events-none" />
                    </div>
                  </>
                )}
                
                {(activeTab === 'final-destination' || activeTab === 'transit-cab') && (
                  <div className="flex bg-sky-50 rounded-lg p-1">
                    <button
                      onClick={() => setTransferSubTab('all')}
                      className={`px-3 py-1 rounded-md font-medium transition-all text-[10px] ${
                        transferSubTab === 'all'
                          ? 'bg-white text-sky-700 shadow-sm'
                          : 'text-sky-600 hover:text-sky-700 hover:bg-sky-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTransferSubTab('onward')}
                      className={`px-3 py-1 rounded-md font-medium transition-all text-[10px] ${
                        transferSubTab === 'onward'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      Onward
                    </button>
                    <button
                      onClick={() => setTransferSubTab('return')}
                      className={`px-3 py-1 rounded-md font-medium transition-all text-[10px] ${
                        transferSubTab === 'return'
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      Return
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setTypeFilter('All');
                    setTransferSubTab('all');
                  }}
                  className="px-3 py-2 bg-sky-50 text-sky-700 rounded-lg font-medium transition-all duration-300 hover:bg-sky-100 border border-sky-200 flex items-center gap-1 text-[10px]"
                >
                  <Filter size={12} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-3">
            {/* Loading State */}
            {loading && activeTab === 'vehicle-listing' && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-2"></div>
                  <p className="text-sky-600 text-[10px]">Loading data...</p>
                </div>
              </div>
            )}

            {loadingFlights && (activeTab === 'final-destination' || activeTab === 'transit-cab') && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-2"></div>
                  <p className="text-sky-600 text-[10px]">Loading passenger data...</p>
                </div>
              </div>
            )}

            {/* Vehicle Listing Tab */}
            {activeTab === 'vehicle-listing' && !loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-sky-50">
                    <tr>
                      <th className="text-left p-2 font-semibold text-sky-900 border-b border-sky-200">Cab Details</th>
                      <th className="text-left p-2 font-semibold text-sky-900 border-b border-sky-200">Driver Info</th>
                      <th className="text-left p-2 font-semibold text-sky-900 border-b border-sky-200">Specifications</th>
                      <th className="text-left p-2 font-semibold text-sky-900 border-b border-sky-200">Status & Assignments</th>
                      <th className="text-left p-2 font-semibold text-sky-900 border-b border-sky-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCabs.length > 0 ? (
                      filteredCabs.map((cab) => (
                        <tr key={cab.id} className="border-b border-sky-100 hover:bg-sky-50/30 transition-colors">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-sky-100 rounded">
                                <Car size={14} className="text-sky-600" />
                              </div>
                              <div>
                                <div className="font-bold text-sky-900">{cab.cabNumber}</div>
                                <div className="flex items-center gap-1 text-sky-600 mt-0.5">
                                  <MapPin size={10} />
                                  <span>{cab.baseLocation || 'Location not set'}</span>
                                </div>
                                {cab.companyName && (
                                  <div className="text-sky-500 mt-0.5 flex items-center gap-1">
                                    <Building size={10} />
                                    {cab.companyName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="font-medium text-sky-900 flex items-center gap-1">
                                <User size={10} />
                                {cab.driverName || 'Driver not assigned'}
                              </div>
                              {cab.driverPhone && (
                                <div className="flex items-center gap-1 text-sky-600 mt-0.5">
                                  <Phone size={10} />
                                  <span>{cab.driverPhone}</span>
                                </div>
                              )}
                              {cab.driverLicense && (
                                <div className="text-sky-500 mt-0.5">License: {cab.driverLicense}</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <span className="px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-full font-medium">
                                  {cab.cabType}
                                </span>
                                <div className="flex items-center gap-1 text-sky-600">
                                  <Users size={10} />
                                  <span>{cab.capacity} seats</span>
                                </div>
                              </div>
                              {cab.acAvailable && (
                                <div className="text-emerald-600">✓ AC Available</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${getStatusColor(cab.currentStatus)}`}>
                                {cab.currentStatus === 'Available' ? <CheckCircle size={10} /> : 
                                 cab.currentStatus === 'Booked' ? <Clock size={10} /> : 
                                 <XCircle size={10} />}
                                {cab.currentStatus}
                              </span>
                              {cab.assignedPassengers && cab.assignedPassengers.length > 0 && (
                                <div className="text-xs text-sky-700">
                                  <span className="font-medium">Assigned: </span>
                                  {cab.assignedPassengers.length} passenger{cab.assignedPassengers.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(cab)}
                                className="p-1 hover:bg-sky-100 rounded transition-colors border border-sky-200 bg-white"
                                title="Edit Cab"
                              >
                                <Edit2 size={12} className="text-sky-600" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteCab(cab.id)}
                                className="p-1 hover:bg-rose-50 rounded transition-colors border border-rose-200 bg-white"
                                title="Delete Cab"
                              >
                                <Trash2 size={12} className="text-rose-600" />
                              </button>
                              
                              <button
                                onClick={() => {/* View details logic */}}
                                className="p-1 hover:bg-sky-100 rounded transition-colors border border-sky-200 bg-white"
                                title="View Details"
                              >
                                <Eye size={12} className="text-sky-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Car size={32} className="text-sky-300 mb-2" />
                            <h3 className="text-sky-900 font-medium mb-1">No cabs found</h3>
                            <p className="text-sky-600 mb-4">Add your first cab to get started</p>
                            <button
                              onClick={() => setIsAddModalOpen(true)}
                              className="px-3 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-1 shadow-sm hover:shadow-md text-[10px]"
                            >
                              <Plus size={12} />
                              Add New Cab
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Final Destination Tab - PNR column removed */}
            {activeTab === 'final-destination' && !loadingFlights && (
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Passenger</th>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Transfer Type</th>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Flight Details</th>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Transfer Route</th>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Hotel</th>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Cab Assignment</th>
                      <th className="text-left p-2 font-semibold text-emerald-900 border-b border-emerald-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFinalDestAssignments.length > 0 ? (
                      filteredFinalDestAssignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b border-emerald-100 hover:bg-emerald-50/30 transition-colors">
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <User size={10} className="text-emerald-600" />
                              <span className="font-medium text-emerald-900">{assignment.passengerName}</span>
                              {assignment.passengerData?.pax_code && (
                                <div className="text-xs text-emerald-500">
                                  ({assignment.passengerData.pax_code})
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div className="flex flex-col gap-0.5">
                              <span className={`px-1.5 py-0.5 rounded-full font-medium ${getTransferTypeColor(assignment.transferType)}`}>
                                {assignment.transferType}
                              </span>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{assignment.flightNumber}</div>
                              <div className="text-emerald-600 mt-0.5">
                                {assignment.flightRoute}
                              </div>
                              <div className="text-emerald-600 mt-0.5">
                                {assignment.transferType === 'Onward' ? 'Arrival' : 'Departure'}: {assignment.transferType === 'Onward' ? assignment.arrivalDate : assignment.departureDate} {assignment.transferType === 'Onward' ? assignment.arrivalTime : assignment.departureTime}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                <ArrowRight size={10} className="text-emerald-500" />
                                <span>{assignment.details.from} → {assignment.details.to}</span>
                              </div>
                              <div className="text-emerald-600 mt-0.5">
                                {assignment.details.type}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              {assignment.hotelName ? (
                                <>
                                  <div className="font-medium flex items-center gap-1">
                                    <Hotel size={10} className="text-emerald-500" />
                                    {assignment.hotelName}
                                  </div>
                                  {assignment.hotelCheckIn && (
                                    <div className="text-emerald-600 mt-0.5">
                                      Check-in: {assignment.hotelCheckIn}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-500 italic">No hotel</span>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              {renderCabAssignmentStatus(assignment)}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div className="flex items-center gap-1 relative">
                              {!assignment.isAssigned ? (
                                <button
                                  onClick={(e) => openAssignDropdown(assignment, e)}
                                  className="assign-button px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-1"
                                >
                                  <Car size={10} />
                                  Assign Cab
                                </button>
                              ) : (
                                <button
                                  onClick={() => removeAssignment(assignment)}
                                  className="px-2 py-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-1"
                                >
                                  <XCircle size={10} />
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Home size={32} className="text-emerald-300 mb-2" />
                            <p className="text-emerald-600">
                              No {transferSubTab === 'all' ? '' : transferSubTab} final destination cab transfers found
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Transit Cab Tab - PNR column removed */}
            {activeTab === 'transit-cab' && !loadingFlights && (
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Passenger</th>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Transfer Type</th>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Flight Connection</th>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Transit Route</th>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Layover Time</th>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Cab Assignment</th>
                      <th className="text-left p-2 font-semibold text-amber-900 border-b border-amber-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransitCabAssignments.length > 0 ? (
                      filteredTransitCabAssignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b border-amber-100 hover:bg-amber-50/30 transition-colors">
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <User size={10} className="text-amber-600" />
                              <span className="font-medium text-amber-900">{assignment.passengerName}</span>
                              {assignment.passengerData?.pax_code && (
                                <div className="text-xs text-amber-500">
                                  ({assignment.passengerData.pax_code})
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div className="flex flex-col gap-0.5">
                              <span className={`px-1.5 py-0.5 rounded-full font-medium ${getTransferTypeColor(assignment.transferType)}`}>
                                {assignment.transferType}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                Transit Cab
                              </span>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="font-medium">
                                {assignment.currentFlight} → {assignment.nextFlight}
                              </div>
                              <div className="text-amber-600 mt-0.5">
                                {assignment.fromAirport} → {assignment.toAirport}
                              </div>
                              <div className="text-amber-500 mt-0.5 font-medium">
                                Segment {assignment.segmentIndex + 1} of {assignment.totalSegments}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                <Navigation size={10} className="text-amber-500" />
                                <span>Airport Transit</span>
                              </div>
                              <div className="text-amber-600 mt-0.5">
                                {assignment.details.from} → {assignment.details.to}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{assignment.layoverTime}</div>
                              <div className="text-amber-600 mt-0.5">
                                Arr: {assignment.arrivalTime}
                              </div>
                              <div className="text-amber-600 mt-0.5">
                                Dep: {assignment.departureTime}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div>
                              {renderCabAssignmentStatus(assignment)}
                            </div>
                          </td>
                          
                          <td className="p-2">
                            <div className="flex items-center gap-1 relative">
                              {!assignment.isAssigned ? (
                                <button
                                  onClick={(e) => openAssignDropdown(assignment, e)}
                                  className="assign-button px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-1"
                                >
                                  <Car size={10} />
                                  Assign Cab
                                </button>
                              ) : (
                                <button
                                  onClick={() => removeAssignment(assignment)}
                                  className="px-2 py-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-1"
                                >
                                  <XCircle size={10} />
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Navigation size={32} className="text-amber-300 mb-2" />
                            <p className="text-amber-600">
                              No {transferSubTab === 'all' ? '' : transferSubTab} transit cab transfers found
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Cab Dropdown */}
      {assignmentDropdown.isOpen && assignmentDropdown.assignment && (
        <div 
          className="fixed inset-0 z-50"
          onClick={closeAssignDropdown}
        >
          <div 
            ref={dropdownRef}
            className="assign-dropdown absolute bg-white rounded-lg shadow-xl border border-sky-200 max-w-xs w-full max-h-80 overflow-y-auto z-50 text-[10px]"
            style={{
              left: `${assignmentDropdown.position.x}px`,
              top: `${assignmentDropdown.position.y}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-sky-200 p-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sky-900">Assign Cab for Passenger</h3>
                <button
                  onClick={closeAssignDropdown}
                  className="p-0.5 hover:bg-sky-100 rounded transition"
                >
                  <XCircle size={14} className="text-sky-600" />
                </button>
              </div>
              <div className="mt-1">
                <div className="font-medium text-sky-900">{assignmentDropdown.assignment.passengerName}</div>
                <div className="text-sky-600 text-[9px]">
                  PNR: {assignmentDropdown.assignment.pnrNumber} | {assignmentDropdown.assignment.transferType} Transfer
                </div>
                {assignmentDropdown.assignment.passengerData?.pax_code && (
                  <div className="text-sky-500 text-[9px]">
                    PAX Code: {assignmentDropdown.assignment.passengerData.pax_code}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`px-1.5 py-0.5 rounded-full font-medium text-[9px] ${
                  assignmentDropdown.assignment.type === 'FinalDestination' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {assignmentDropdown.assignment.type === 'FinalDestination' ? 'Final Destination' : 'Transit Cab'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full font-medium text-[9px] ${getTransferTypeColor(assignmentDropdown.assignment.transferType)}`}>
                  {assignmentDropdown.assignment.transferType}
                </span>
              </div>
            </div>
            
            <div className="p-1">
              {assignmentDropdown.availableCabs.length > 0 ? (
                <div className="space-y-1">
                  {assignmentDropdown.availableCabs.map((cab) => {
                    // Find if this assignment is already assigned to this cab
                    const isAlreadyAssigned = cab.cabNumber === assignmentDropdown.assignment.assignedCabNumber;
                    
                    return (
                      <div
                        key={cab.id}
                        onClick={() => !isAlreadyAssigned && assignCabToAssignment(cab, assignmentDropdown.assignment)}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          isAlreadyAssigned
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-sky-200 hover:border-sky-300 hover:bg-sky-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-0.5 bg-sky-100 rounded">
                              <Car size={12} className="text-sky-600" />
                            </div>
                            <div>
                              <div className="font-bold text-sky-900">{cab.cabNumber}</div>
                              <div className="text-sky-600 flex items-center gap-1 mt-0.5">
                                <User size={10} />
                                {cab.driverName}
                              </div>
                              {cab.driverPhone && (
                                <div className="text-sky-500 text-[9px] mt-0.5">
                                  📞 {cab.driverPhone}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                                cab.currentStatus === 'Available' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : cab.currentStatus === 'Booked'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {cab.currentStatus}
                              </span>
                              <span className="px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-full font-medium">
                                {cab.cabType}
                              </span>
                            </div>
                            <div className="text-sky-600 mt-0.5">
                              {cab.capacity} seats
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-sky-100">
                          <div className="text-sky-600 text-[9px]">
                            <span className="flex items-center gap-0.5">
                              <MapPin size={10} />
                              {cab.baseLocation || 'No location'}
                            </span>
                          </div>
                          
                          {isAlreadyAssigned ? (
                            <div className="text-emerald-600 font-medium flex items-center gap-0.5 text-[9px]">
                              <CheckCircle size={10} />
                              Already Assigned
                            </div>
                          ) : cab.currentStatus === 'Available' ? (
                            <div className="text-blue-600 font-medium flex items-center gap-0.5 text-[9px]">
                              <Car size={10} />
                              Click to Assign
                            </div>
                          ) : (
                            <div className="text-amber-600 text-[9px]">
                              {cab.currentStatus}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Car size={24} className="text-sky-300 mx-auto mb-2" />
                  <p className="text-sky-600">No cabs available</p>
                  <p className="text-sky-500 mt-0.5">
                    Add cabs from Vehicle Listing tab
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Cab Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto text-[10px]">
            <div className="sticky top-0 bg-white border-b border-sky-200 p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-sky-900">Add New Cab</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-0.5 hover:bg-sky-100 rounded transition"
                >
                  <XCircle size={16} className="text-sky-600" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddCab}>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Cab Details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sky-900 border-b border-sky-200 pb-1">Cab Details</h3>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Cab Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cabNumber}
                        onChange={(e) => setFormData({...formData, cabNumber: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                        placeholder="MH04AB1234"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Cab Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.cabType}
                        onChange={(e) => setFormData({...formData, cabType: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      >
                        {cabTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Capacity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 4})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                        placeholder="4"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Base Location <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.baseLocation}
                        onChange={(e) => setFormData({...formData, baseLocation: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                        placeholder="Mumbai, Maharashtra"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.acAvailable}
                        onChange={(e) => setFormData({...formData, acAvailable: e.target.checked})}
                        className="w-3 h-3 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                      />
                      <label className="text-sky-700">AC Available</label>
                    </div>
                  </div>
                  
                  {/* Driver Details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sky-900 border-b border-sky-200 pb-1">Driver Details</h3>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Driver Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.driverName}
                        onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Driver Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.driverPhone}
                        onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                        placeholder="9876543210"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">Driver License Number</label>
                      <input
                        type="text"
                        value={formData.driverLicense}
                        onChange={(e) => setFormData({...formData, driverLicense: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                        placeholder="DL1234567890123"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">Company Name</label>
                      <div className="relative mb-1">
                        <select
                          value={formData.companyName}
                          onChange={(e) => {
                            setFormData({...formData, companyName: e.target.value});
                          }}
                          className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent appearance-none bg-white text-[10px]"
                        >
                          <option value="">-- Select from vendors --</option>
                          {loadingVendors ? (
                            <option disabled>Loading vendors...</option>
                          ) : (
                            transportVendors.map(vendor => (
                              <option key={vendor.id} value={vendor.vendor_name}>
                                {vendor.vendor_name}
                              </option>
                            ))
                          )}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sky-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mt-4">
                  <label className="block font-medium text-sky-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                    placeholder="Any additional information about the cab or driver..."
                  />
                </div>
                
                {/* Required Fields Note */}
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700">
                    <span className="font-medium">Note:</span> Fields marked with <span className="text-rose-500">*</span> are required.
                  </p>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-sky-200 p-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 text-sky-700 bg-white border border-sky-200 rounded-lg font-medium hover:bg-sky-50 transition text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md text-[10px]"
                  >
                    Add Cab
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cab Modal */}
      {isEditModalOpen && selectedCab && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto text-[10px]">
            <div className="sticky top-0 bg-white border-b border-sky-200 p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-sky-900">Edit Cab: {selectedCab.cabNumber}</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-0.5 hover:bg-sky-100 rounded transition"
                >
                  <XCircle size={16} className="text-sky-600" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditCab}>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Cab Details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sky-900 border-b border-sky-200 pb-1">Cab Details</h3>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Cab Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cabNumber}
                        onChange={(e) => setFormData({...formData, cabNumber: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Cab Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.cabType}
                        onChange={(e) => setFormData({...formData, cabType: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      >
                        {cabTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Capacity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 4})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Base Location <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.baseLocation}
                        onChange={(e) => setFormData({...formData, baseLocation: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.acAvailable}
                        onChange={(e) => setFormData({...formData, acAvailable: e.target.checked})}
                        className="w-3 h-3 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                      />
                      <label className="text-sky-700">AC Available</label>
                    </div>
                  </div>
                  
                  {/* Driver Details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sky-900 border-b border-sky-200 pb-1">Driver Details</h3>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Driver Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.driverName}
                        onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">
                        Driver Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.driverPhone}
                        onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">Driver License</label>
                      <input
                        type="text"
                        value={formData.driverLicense}
                        onChange={(e) => setFormData({...formData, driverLicense: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-sky-700 mb-0.5">Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mt-4">
                  <label className="block font-medium text-sky-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-[10px]"
                  />
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-sky-200 p-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3 py-1.5 text-sky-700 bg-white border border-sky-200 rounded-lg font-medium hover:bg-sky-50 transition text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md text-[10px]"
                  >
                    Update Cab
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabManagementPage;