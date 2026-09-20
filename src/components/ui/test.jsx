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
    Edit,
    Trash2,
    Search,
    Filter,
    Settings,
    Home,
    Building,
    Bed,
    Plane,
    User,
    Calendar,
    MapPin,
    CreditCard,
    Phone,
    Mail,
    Globe,
    Briefcase,
    RefreshCw,
    Hotel,
    Clock,
    CheckCircle,
    Star,
    AlertCircle,
    Check,
    CheckCheck,
    Tag,
    Paperclip
} from 'lucide-react';

export default function HotelRoomListing() {
    const { id } = useParams();
    
    // Tab state
    const [activeTab, setActiveTab] = useState("pnr");
    
    // PNR Passengers state
    const [pnrPassengers, setPnrPassengers] = useState([]);
    const [pnrLoading, setPnrLoading] = useState(false);
    const [pnrError, setPnrError] = useState("");
    
    // Hotel Listing for dropdown
    const [availableHotels, setAvailableHotels] = useState([]);
    const [hotelsLoading, setHotelsLoading] = useState(false);
    
    // Form state for hotel assignment
    const [hotelAssignments, setHotelAssignments] = useState({});
    
    // Selected PNRs for batch operations
    const [selectedPnrRows, setSelectedPnrRows] = useState([]);
    
    // Room types
    const roomTypes = ["Standard", "Deluxe", "Suite", "Executive", "Family", "Transit Hotel"];
    
    // Guest types
    const guestTypes = ["Child", "Teenager", "Adult", "Business", "Leisure", "Transit", "Group", "Family", "Couple"];
    
    // Direct Flight Hotels data
    const [directFlights, setDirectFlights] = useState([]);
    
    // Transit Flight Hotels data
    const [transitFlights, setTransitFlights] = useState([]);
    
    // Settings state
    const [settings, setSettings] = useState({
        autoRefresh: true,
        refreshInterval: 30,
        defaultRoomType: "Standard",
        defaultStatus: "Available",
        enableNotifications: true,
        exportFormat: "csv"
    });

    // Pagination states
    const [currentPnrPage, setCurrentPnrPage] = useState(0);
    const [pnrPerPage] = useState(10);
    const [currentDirectFlightPage, setCurrentDirectFlightPage] = useState(0);
    const [directFlightsPerPage] = useState(10);
    const [currentTransitFlightPage, setCurrentTransitFlightPage] = useState(0);
    const [transitFlightsPerPage] = useState(10);

    // Search terms
    const [pnrSearchTerm, setPnrSearchTerm] = useState("");
    const [directFlightSearchTerm, setDirectFlightSearchTerm] = useState("");
    const [transitFlightSearchTerm, setTransitFlightSearchTerm] = useState("");

    // Hotel assignment states
    const [assigningHotel, setAssigningHotel] = useState(null);
    const [assignmentError, setAssignmentError] = useState(null);
    const [assignmentSuccess, setAssignmentSuccess] = useState(null);

    // ==================== LABEL MANAGEMENT ====================
    const [showLabelPopup, setShowLabelPopup] = useState(false);
    const [labelText, setLabelText] = useState("");
    const [labelColor, setLabelColor] = useState("#3B82F6");
    const [labelPriority, setLabelPriority] = useState("medium");
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [labels, setLabels] = useState({});

    // Color options for labels
    const labelColors = [
        { name: "Blue", value: "#3B82F6" },
        { name: "Red", value: "#EF4444" },
        { name: "Green", value: "#10B981" },
        { name: "Yellow", value: "#F59E0B" },
        { name: "Purple", value: "#8B5CF6" },
        { name: "Pink", value: "#EC4899" },
        { name: "Gray", value: "#6B7280" }
    ];

    // Priority options
    const priorityOptions = [
        { value: "low", label: "Low", color: "#10B981" },
        { value: "medium", label: "Medium", color: "#F59E0B" },
        { value: "high", label: "High", color: "#EF4444" },
        { value: "urgent", label: "Urgent", color: "#DC2626" }
    ];

    // ==================== API FUNCTIONS ====================

    // Assign hotel to PNR
    const assignHotelToPNR = async (pnrId, hotelData) => {
        try {
            const API_BASE_URL = 'https://tableware-dweeb-estate.ngrok-free.dev/api';
            const url = `${API_BASE_URL}/vendors/pnr/${pnrId}/hotels`;
            
            console.log('Sending hotel assignment to:', url);
            console.log('Hotel data:', hotelData);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hotelData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                if (result.availableHotels) {
                    throw new Error(`Hotel vendor not found. Available hotels: ${JSON.stringify(result.availableHotels.map(h => h.vendor_name))}`);
                }
                throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('Error in assignHotelToPNR:', error);
            throw error;
        }
    };

    // Fetch PNR passengers by lead ID
    const fetchPnrPassengers = async () => {
        try {
            setPnrLoading(true);
            setPnrError("");
            const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/hotels/done-passengers/lead/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch PNR passengers');
            }

            const normalizedData = (data.data || []).map(pnr => ({
                ...pnr,
                flight_segments: (pnr.flight_segments || []).map(extractFlightSegmentData),
                passengers: (pnr.passengers || []).map(passenger => ({
                    ...passenger,
                    form_data: passenger.form_data || {},
                    first_name: passenger.first_name || passenger.form_data?.first_name,
                    last_name: passenger.last_name || passenger.form_data?.last_name,
                    passenger_id: passenger.passenger_id || passenger.id
                }))
            }));

            setPnrPassengers(normalizedData);
        } catch (error) {
            console.error('Error fetching PNR passengers:', error);
            setPnrError(error.message);
        } finally {
            setPnrLoading(false);
        }
    };

    // Fetch available hotels from API
    const fetchAvailableHotels = async () => {
        try {
            setHotelsLoading(true);
            const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/vendors/hotels');
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch hotels');
            }
            
            const formattedHotels = data.data.map(hotel => ({
                id: hotel.vendor_id || hotel.id,
                vendor_id: hotel.vendor_id,
                name: hotel.vendor_name,
                address: `${hotel.address_line1 || ''} ${hotel.city || ''} ${hotel.state || ''}`.trim(),
                rating: hotel.rating,
                email: hotel.email,
                phone: hotel.phone
            }));
            
            setAvailableHotels(formattedHotels);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        } finally {
            setHotelsLoading(false);
        }
    };

    // ==================== HOTEL ASSIGNMENT FUNCTIONS ====================

    const handleAssignHotel = async (passengerData, hotelId, checkInDate = null, checkOutDate = null) => {
        if (!passengerData?.pnrData) {
            setAssignmentError("Missing passenger data");
            return;
        }

        try {
            setAssigningHotel(passengerData.id);
            setAssignmentError(null);
            setAssignmentSuccess(null);

            const { pnrId, passengerId, hasExistingHotel, existingHotelVendorId, existingHotelName } = passengerData.pnrData;
            
            const isFromDirectFlightTab = directFlights.some(h => h.id === passengerData.id);
            const isFromTransitFlightTab = transitFlights.some(th => th.id === passengerData.id);
            
            if (!hotelId) {
                setAssignmentError("Please select a hotel");
                setAssigningHotel(null);
                return;
            }
            
            if (hasExistingHotel && existingHotelVendorId === hotelId) {
                setAssignmentError("This hotel is already assigned to this PNR");
                setAssigningHotel(null);
                return;
            }

            // Get user ID
            let currentUserId = null;
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    currentUserId = user.id || user.user_id || null;
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
            
            // Find passenger index
            let passengerIndex = 0;
            if (passengerData.pnrData.passengers && Array.isArray(passengerData.pnrData.passengers)) {
                const foundIndex = passengerData.pnrData.passengers.findIndex(p => 
                    p.passenger_id === passengerId || p.id === passengerId
                );
                if (foundIndex !== -1) {
                    passengerIndex = foundIndex;
                }
            }

            // Prepare hotel assignment data
            const hotelData = {
                hotelVendorId: hotelId,
                check_in: checkInDate || getDefaultCheckInDate(),
                check_out: checkOutDate || getDefaultCheckOutDate(),
                room_type: "Standard",
                passenger_index: passengerIndex,
                remarks: hasExistingHotel 
                    ? `Hotel changed from "${existingHotelName}" to new hotel for ${passengerData.fullName}`
                    : `Assigned from Hotel Management System - ${passengerData.fullName}`,
                assigned_by: currentUserId || null,
                hotel_status: "confirmed",
                currency: "INR",
                amount: null
            };

            console.log('Assigning hotel:', { 
                pnrId, 
                passengerId, 
                hotelId, 
                isChange: hasExistingHotel,
                previousHotel: hasExistingHotel ? existingHotelVendorId : 'none',
                hotelData 
            });

            const result = await assignHotelToPNR(pnrId, hotelData);
            
            if (result.success) {
                const action = hasExistingHotel ? "changed" : "assigned";
                const successMessage = `Hotel ${action} successfully for ${passengerData.fullName}`;
                const confirmationNumber = result.data?.pnr?.hotel_confirmation_number;
                const hotelName = result.data?.hotel?.vendor_name;
                
                setAssignmentSuccess({
                    message: successMessage,
                    confirmation: confirmationNumber,
                    hotel: hotelName,
                    passengerName: passengerData.fullName,
                    action: action
                });

                if (isFromDirectFlightTab) {
                    handleDirectFlightAssignment(passengerData.id, hotelId);
                } else if (isFromTransitFlightTab) {
                    handleTransitFlightAssignment(passengerData.id, hotelId);
                }

                setTimeout(() => {
                    fetchPnrPassengers();
                }, 1000);

                setTimeout(() => {
                    setAssignmentSuccess(null);
                }, 5000);

            } else {
                throw new Error(result.message || "Failed to assign hotel");
            }

        } catch (error) {
            console.error('Hotel assignment error:', error);
            
            let errorMessage = error.message;
            
            if (error.message.includes('already has a hotel assigned')) {
                errorMessage = "This PNR already has a hotel assigned. Please cancel the existing assignment first.";
            } else if (error.message.includes('already occupied')) {
                errorMessage = "Selected hotel is already occupied by another PNR.";
            } else if (error.message.includes('vendor not found')) {
                errorMessage = "Invalid hotel vendor ID. Please check the vendor ID.";
            } else if (error.message.includes('Check-out date must be after check-in')) {
                errorMessage = "Check-out date must be after check-in date.";
            } else if (error.message.includes('Check-in date cannot be in the past')) {
                errorMessage = "Check-in date cannot be in the past.";
            } else if (errorMessage.includes('Failed to fetch')) {
                errorMessage = "Network error. Please check your connection and try again.";
            }
            
            setAssignmentError(errorMessage);
            
            setTimeout(() => {
                setAssignmentError(null);
            }, 10000);
            
        } finally {
            setAssigningHotel(null);
        }
    };

    const getDefaultCheckInDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getDefaultCheckOutDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleDirectFlightAssignment = (passengerId, hotelId) => {
        const passenger = directFlights.find(h => h.id === passengerId);
        if (passenger && passenger.pnrData) {
            const { pnrId, passengerId: paxId } = passenger.pnrData;
            
            setHotelAssignments(prev => ({
                ...prev,
                [`${pnrId}_${paxId}`]: hotelId
            }));
        }
    };

    const handleTransitFlightAssignment = (passengerId, hotelId) => {
        const passenger = transitFlights.find(h => h.id === passengerId);
        if (passenger && passenger.pnrData) {
            const { pnrId, passengerId: paxId } = passenger.pnrData;
            
            setHotelAssignments(prev => ({
                ...prev,
                [`${pnrId}_${paxId}`]: hotelId
            }));
        }
    };

    const clearAssignmentMessages = () => {
        setAssignmentError(null);
        setAssignmentSuccess(null);
    };

    // ==================== HELPER FUNCTIONS ====================

    const calculateGuestTypeFromDOB = (dateOfBirth) => {
        if (!dateOfBirth) return { age: null, guestType: "Adult", ageCategory: "Adult" };
        
        try {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            let ageCategory;
            if (age <= 10) {
                ageCategory = "Child";
            } else if (age <= 18) {
                ageCategory = "Teenager";
            } else {
                ageCategory = "Adult";
            }
            
            return { 
                age, 
                guestType: ageCategory,
                ageCategory: ageCategory,
                originalDOB: dateOfBirth
            };
        } catch (error) {
            console.error("Error calculating age from DOB:", error);
            return { age: null, guestType: "Adult", ageCategory: "Adult" };
        }
    };

    const calculateGapBetweenSegments = (segments) => {
        const flightSegments = segments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        
        if (!flightSegments || flightSegments.length < 2) return { gap: "N/A", details: "Single segment" };
        
        const sortedSegments = [...flightSegments].sort((a, b) => a.segment_order - b.segment_order);
        let totalGap = 0;
        
        for (let i = 0; i < sortedSegments.length - 1; i++) {
            const current = sortedSegments[i];
            const next = sortedSegments[i + 1];
            
            if (current.arrival_date && current.arrival_time && 
                next.departure_date && next.departure_time) {
                
                try {
                    const arrivalDateTime = new Date(`${current.arrival_date}T${current.arrival_time}:00`);
                    const departureDateTime = new Date(`${next.departure_date}T${next.departure_time}:00`);
                    
                    const gapMs = departureDateTime - arrivalDateTime;
                    
                    if (gapMs > 0) {
                        totalGap += gapMs;
                    }
                } catch (error) {
                    console.error("Error calculating gap:", error);
                }
            }
        }
        
        if (totalGap > 0) {
            const gapHours = Math.floor(totalGap / (1000 * 60 * 60));
            const gapMinutes = Math.floor((totalGap % (1000 * 60 * 60)) / (1000 * 60));
            
            return {
                gap: `${gapHours}h ${gapMinutes}m`,
                details: `${sortedSegments.length} segments`
            };
        }
        
        return { gap: "N/A", details: "Check flight times" };
    };

    const getFlightLocations = (flightSegments, passengerData) => {
        const segments = flightSegments.filter(segment => 
            !segment.type || segment.type !== "hotel"
        );
        
        if (!segments || segments.length === 0) {
            if (passengerData) {
                const airportCode = passengerData.form_data?.airport_code;
                const airportName = passengerData.form_data?.airport_name;
                const nationality = passengerData.form_data?.nationality;
                
                if (airportCode && airportCode !== "N/A") {
                    return { 
                        departure: airportCode, 
                        arrival: airportCode,
                        departureFull: airportName || airportCode,
                        arrivalFull: airportName || airportCode
                    };
                } else if (airportName && airportName !== "N/A") {
                    return { 
                        departure: airportName, 
                        arrival: airportName,
                        departureFull: airportName,
                        arrivalFull: airportName
                    };
                } else if (nationality) {
                    return { 
                        departure: nationality, 
                        arrival: nationality,
                        departureFull: nationality,
                        arrivalFull: nationality
                    };
                }
            }
            
            return { 
                departure: "N/A", 
                arrival: "N/A",
                departureFull: "Not Available",
                arrivalFull: "Not Available"
            };
        }
        
        const sortedSegments = [...segments].sort((a, b) => a.segment_order - b.segment_order);
        const firstSegment = sortedSegments[0];
        const lastSegment = sortedSegments[sortedSegments.length - 1];
        
        const extractAirportInfo = (segment, type) => {
            if (!segment) return {
                code: "N/A",
                fullName: "Not Available"
            };
            
            let airportCode = "";
            let airportName = "";
            
            if (type === 'departure') {
                airportCode = segment.from_airport || segment.departure_airport || segment.origin || "N/A";
                airportName = segment.from_airport_name || segment.departure_airport_name || segment.origin_name || airportCode;
            } else if (type === 'arrival') {
                airportCode = segment.to_airport || segment.arrival_airport || segment.destination || "N/A";
                airportName = segment.to_airport_name || segment.arrival_airport_name || segment.destination_name || airportCode;
            }
            
            airportCode = (airportCode !== "N/A" && airportCode !== "" && airportCode !== null) 
                ? airportCode.trim().toUpperCase() 
                : "N/A";
                
            airportName = (airportName !== "N/A" && airportName !== "" && airportName !== null) 
                ? airportName.trim() 
                : airportCode;
            
            return {
                code: airportCode,
                fullName: airportName
            };
        };
        
        const departureInfo = extractAirportInfo(firstSegment, 'departure');
        const arrivalInfo = extractAirportInfo(lastSegment, 'arrival');
        
        return { 
            departure: departureInfo.code, 
            arrival: arrivalInfo.code,
            departureFull: departureInfo.fullName,
            arrivalFull: arrivalInfo.fullName
        };
    };

    const extractFlightSegmentData = (segment) => {
        const isHotelSegment = segment.type === "hotel" || segment.segment_type === "transit_hotel";
        
        if (isHotelSegment) {
            return {
                ...segment,
                type: "hotel",
                segment_type: segment.segment_type || "transit_hotel",
                isHotel: true
            };
        }
        
        return {
            segment_order: segment.segment_order || 0,
            flight_number: segment.flight_number || "Unknown",
            departure_date: segment.departure_date,
            departure_time: segment.departure_time,
            arrival_date: segment.arrival_date,
            arrival_time: segment.arrival_time,
            from_airport: segment.from_airport,
            to_airport: segment.to_airport,
            from_airport_name: segment.from_airport_name,
            to_airport_name: segment.to_airport_name,
            departure_airport: segment.departure_airport,
            arrival_airport: segment.arrival_airport,
            departure_airport_name: segment.departure_airport_name,
            arrival_airport_name: segment.arrival_airport_name,
            origin: segment.origin,
            destination: segment.destination,
            origin_name: segment.origin_name,
            destination_name: segment.destination_name,
            duration: segment.duration,
            dep_terminal: segment.dep_terminal,
            arv_terminal: segment.arv_terminal,
            leg_id: segment.leg_id,
            ...segment
        };
    };

    // ==================== LABEL FUNCTIONS ====================

    const handleOpenLabelPopup = () => {
        if (selectedPnrRows.length === 0) {
            alert("Please select at least one row to add a label");
            return;
        }
        setShowLabelPopup(true);
    };

    const handleCloseLabelPopup = () => {
        setShowLabelPopup(false);
        setLabelText("");
        setLabelColor("#3B82F6");
        setLabelPriority("medium");
        setAttachedFiles([]);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        }));
        setAttachedFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (fileId) => {
        setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const handleApplyLabel = () => {
        if (!labelText.trim()) {
            alert("Please enter label text");
            return;
        }

        const newLabel = {
            text: labelText.trim(),
            color: labelColor,
            priority: labelPriority,
            timestamp: new Date().toISOString(),
            files: attachedFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }))
        };

        const updatedLabels = { ...labels };
        selectedPnrRows.forEach(rowKey => {
            if (!updatedLabels[rowKey]) {
                updatedLabels[rowKey] = [];
            }
            updatedLabels[rowKey].push(newLabel);
        });

        setLabels(updatedLabels);
        alert(`Label "${labelText}" applied to ${selectedPnrRows.length} passenger(s)`);
        handleCloseLabelPopup();
    };

    const handleRemoveLabel = (rowKey, labelIndex) => {
        const updatedLabels = { ...labels };
        if (updatedLabels[rowKey]) {
            updatedLabels[rowKey].splice(labelIndex, 1);
            if (updatedLabels[rowKey].length === 0) {
                delete updatedLabels[rowKey];
            }
            setLabels(updatedLabels);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // ==================== EFFECT HOOKS ====================

    useEffect(() => {
        if (id) {
            fetchPnrPassengers();
            fetchAvailableHotels();
        }
    }, [id]);

    useEffect(() => {
        if (pnrPassengers.length > 0) {
            processPnrPassengers();
        }
    }, [pnrPassengers, hotelAssignments]);

    useEffect(() => {
        if (assignmentError || assignmentSuccess) {
            const timer = setTimeout(() => {
                clearAssignmentMessages();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [assignmentError, assignmentSuccess]);

    // ==================== PROCESSING FUNCTIONS ====================

    const processPnrPassengers = () => {
        const directFlightList = [];
        const transitFlightList = [];
        let directFlightIndex = 1;
        let transitFlightIndex = 1;

        const existingDirectFlightPassengers = new Map();
        const existingTransitFlightPassengers = new Map();
        
        directFlights.forEach(h => existingDirectFlightPassengers.set(h.id, h));
        transitFlights.forEach(th => existingTransitFlightPassengers.set(th.id, th));

        pnrPassengers.forEach((pnr) => {
            if (pnr.passengers && Array.isArray(pnr.passengers)) {
                pnr.passengers.forEach((passenger) => {
                    const flightSegments = pnr.flight_segments || [];
                    const actualFlightSegments = flightSegments.filter(segment => 
                        !segment.type || segment.type !== "hotel"
                    );
                    
                    const sortedSegments = [...actualFlightSegments].sort((a, b) => a.segment_order - b.segment_order);
                    const segmentCount = sortedSegments.length;
                    
                    const hasExistingHotel = pnr.hotel_vendor_id && pnr.hotel_vendor_name;
                    const existingHotelVendorId = pnr.hotel_vendor_id;
                    const existingHotelName = pnr.hotel_vendor_name;
                    
                    const passengerKey = `${pnr.id}_${passenger.passenger_id}`;
                    const hasLocalAssignment = hotelAssignments[passengerKey];
                    
                    const gapInfo = calculateGapBetweenSegments(flightSegments);
                    
                    let nextFlight = null;
                    if (sortedSegments.length > 1) {
                        nextFlight = sortedSegments[1];
                    }
                    
                    const flightLocations = getFlightLocations(flightSegments, passenger);
                    
                    let assignedHotelId = null;
                    if (hasExistingHotel) {
                        assignedHotelId = existingHotelVendorId;
                    } else {
                        assignedHotelId = hotelAssignments[passengerKey];
                    }
                    const assignedHotel = availableHotels.find(h => h.id === assignedHotelId);
                    
                    const dateOfBirth = passenger.form_data?.date_of_birth || passenger.date_of_birth;
                    const ageInfo = calculateGuestTypeFromDOB(dateOfBirth);
                    
                    const guestType = ageInfo.ageCategory;
                    
                    let locationDisplay = "";
                    if (flightLocations.departure !== "N/A" && flightLocations.arrival !== "N/A") {
                        locationDisplay = `${flightLocations.departure} → ${flightLocations.arrival}`;
                    } else if (sortedSegments.length > 0) {
                        const flightNo = sortedSegments[0]?.flight_number || "Unknown";
                        locationDisplay = `Flight ${flightNo}`;
                    } else {
                        locationDisplay = "Location N/A";
                    }
                    
                    const getSegmentTime = (segment, type) => {
                        if (!segment) return "N/A";
                        if (type === 'arrival') {
                            return segment.arrival_time || "N/A";
                        } else {
                            return segment.departure_time || "N/A";
                        }
                    };
                    
                    const getSegmentDate = (segment, type) => {
                        if (!segment) return "N/A";
                        if (type === 'arrival') {
                            return segment.arrival_date || "N/A";
                        } else {
                            return segment.departure_date || "N/A";
                        }
                    };

                    const passengerData = {
                        id: passengerKey,
                        rowKey: `${pnrPassengers.indexOf(pnr)}_${pnr.passengers.indexOf(passenger)}`,
                        srNo: 0,
                        title: passenger.form_data?.title || passenger.title || "Mr.",
                        fullName: `${passenger.form_data?.first_name || passenger.first_name || ''} ${passenger.form_data?.last_name || passenger.last_name || ''}`.trim() || "Unknown Passenger",
                        guestType: guestType,
                        age: ageInfo.age,
                        dateOfBirth: dateOfBirth,
                        ageCategory: ageInfo.ageCategory,
                        departureLocation: flightLocations.departure,
                        arrivalLocation: flightLocations.arrival,
                        departureLocationFull: flightLocations.departureFull,
                        arrivalLocationFull: flightLocations.arrivalFull,
                        location: locationDisplay,
                        hotel: assignedHotel ? assignedHotel.name : (hasExistingHotel ? existingHotelName : ""),
                        roomNo: assignedHotel || hasExistingHotel ? `T${Math.floor(Math.random() * 900) + 100}` : "",
                        hotelRoomNo: assignedHotel || hasExistingHotel ? `HR${Math.floor(Math.random() * 1000)}` : "",
                        roomType: (assignedHotel || hasExistingHotel) ? "Standard" : "",
                        remarks: `PNR: ${pnr.pnr_number || 'N/A'}, Passenger ID: ${passenger.passenger_id}${ageInfo.age ? `, Age: ${ageInfo.age}` : ''}`,
                        durationOfNextFlight: gapInfo.gap,
                        arvFlightFlightNo: sortedSegments[0]?.flight_number || "N/A",
                        arvFlightDate: getSegmentDate(sortedSegments[0], 'arrival'),
                        arvFlightArvTime: getSegmentTime(sortedSegments[0], 'arrival'),
                        depFlightFlightNo: nextFlight?.flight_number || sortedSegments[0]?.flight_number || "N/A",
                        depFlightDate: getSegmentDate(nextFlight || sortedSegments[0], 'departure'),
                        depFlightDepTime: getSegmentTime(nextFlight || sortedSegments[0], 'departure'),
                        segmentCount: segmentCount,
                        actualFlightSegments: sortedSegments,
                        pnrData: {
                            pnrId: pnr.id,
                            passengerId: passenger.passenger_id,
                            pnr_number: pnr.pnr_number,
                            passenger: passenger,
                            passengers: pnr.passengers,
                            flight_segments: sortedSegments,
                            allSegments: flightSegments,
                            segmentCount: segmentCount,
                            hasExistingHotel: hasExistingHotel,
                            existingHotelVendorId: existingHotelVendorId,
                            existingHotelName: existingHotelName,
                            hotelCheckIn: pnr.hotel_check_in,
                            hotelCheckOut: pnr.hotel_check_out,
                            hotelConfirmationNumber: pnr.hotel_confirmation_number,
                            hotelStatus: pnr.hotel_status
                        }
                    };

                    const wasInDirectFlights = existingDirectFlightPassengers.has(passengerData.id);
                    const wasInTransitFlights = existingTransitFlightPassengers.has(passengerData.id);
                    
                    if (wasInDirectFlights || wasInTransitFlights) {
                        if (wasInDirectFlights) {
                            const existing = existingDirectFlightPassengers.get(passengerData.id);
                            passengerData.srNo = existing.srNo || directFlightIndex++;
                            passengerData.category = "Direct";
                            passengerData.hotelType = "Direct Flight Hotel";
                            directFlightList.push(passengerData);
                        } else {
                            const existing = existingTransitFlightPassengers.get(passengerData.id);
                            passengerData.srNo = existing.srNo || transitFlightIndex++;
                            passengerData.category = "Transit";
                            passengerData.hotelType = "Transit Flight Hotel";
                            passengerData.roomNo = (assignedHotel || hasExistingHotel) ? `TR${Math.floor(Math.random() * 900) + 100}` : "";
                            passengerData.hotelRoomNo = (assignedHotel || hasExistingHotel) ? `THR${Math.floor(Math.random() * 1000)}` : "";
                            transitFlightList.push(passengerData);
                        }
                    } else {
                        if (segmentCount === 1) {
                            passengerData.srNo = directFlightIndex++;
                            passengerData.category = "Direct";
                            passengerData.hotelType = "Direct Flight Hotel";
                            directFlightList.push(passengerData);
                        } else if (segmentCount > 1) {
                            passengerData.srNo = transitFlightIndex++;
                            passengerData.category = "Transit";
                            passengerData.hotelType = "Transit Flight Hotel";
                            passengerData.roomNo = (assignedHotel || hasExistingHotel) ? `TR${Math.floor(Math.random() * 900) + 100}` : "";
                            passengerData.hotelRoomNo = (assignedHotel || hasExistingHotel) ? `THR${Math.floor(Math.random() * 1000)}` : "";
                            transitFlightList.push(passengerData);
                        }
                    }
                });
            }
        });
        
        setDirectFlights(directFlightList);
        setTransitFlights(transitFlightList);
    };

    const handlePnrRowSelection = (rowKey) => {
        setSelectedPnrRows(prev => {
            if (prev.includes(rowKey)) {
                return prev.filter(key => key !== rowKey);
            } else {
                return [...prev, rowKey];
            }
        });
    };

    const handleSelectAllPnrRows = () => {
        const allPassengers = getAllPassengers();
        const allRowKeys = allPassengers.map(p => p.rowKey);
        
        if (selectedPnrRows.length === allRowKeys.length) {
            setSelectedPnrRows([]);
        } else {
            setSelectedPnrRows(allRowKeys);
        }
    };

    const getAllPassengers = () => {
        const allPassengers = [];
        
        currentPnrPassengers.forEach((pnr) => {
            if (pnr.passengers && Array.isArray(pnr.passengers)) {
                pnr.passengers.forEach((passenger, passengerIndex) => {
                    allPassengers.push({
                        rowKey: `${pnrPassengers.indexOf(pnr)}_${passengerIndex}`,
                        pnr,
                        passenger
                    });
                });
            }
        });
        
        return allPassengers;
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    };

    const handleRefreshPnrData = () => {
        fetchPnrPassengers();
        clearAssignmentMessages();
    };

    const filteredPnrPassengers = pnrPassengers.filter(pnr => {
        const searchTermLower = pnrSearchTerm.toLowerCase();
        return pnr.pnr_number?.toLowerCase().includes(searchTermLower) ||
               (Array.isArray(pnr.passengers) && pnr.passengers.some(p => 
                   p.first_name?.toLowerCase().includes(searchTermLower) ||
                   p.last_name?.toLowerCase().includes(searchTermLower) ||
                   p.passport_number?.toLowerCase().includes(searchTermLower)
               ));
    });

    const totalPnrPages = Math.ceil(filteredPnrPassengers.length / pnrPerPage);
    const currentPnrPassengers = filteredPnrPassengers.slice(
        currentPnrPage * pnrPerPage,
        (currentPnrPage + 1) * pnrPerPage
    );

    const filteredDirectFlights = directFlights.filter(flight => {
        const searchTermLower = directFlightSearchTerm.toLowerCase();
        return flight.fullName?.toLowerCase().includes(searchTermLower) ||
               flight.hotel?.toLowerCase().includes(searchTermLower) ||
               flight.location?.toLowerCase().includes(searchTermLower);
    });

    const filteredTransitFlights = transitFlights.filter(flight => {
        const searchTermLower = transitFlightSearchTerm.toLowerCase();
        return flight.fullName?.toLowerCase().includes(searchTermLower) ||
               flight.hotel?.toLowerCase().includes(searchTermLower) ||
               flight.location?.toLowerCase().includes(searchTermLower);
    });

    const totalDirectFlightPages = Math.ceil(filteredDirectFlights.length / directFlightsPerPage);
    const currentDirectFlights = filteredDirectFlights.slice(
        currentDirectFlightPage * directFlightsPerPage,
        (currentDirectFlightPage + 1) * directFlightsPerPage
    );

    const totalTransitFlightPages = Math.ceil(filteredTransitFlights.length / transitFlightsPerPage);
    const currentTransitFlights = filteredTransitFlights.slice(
        currentTransitFlightPage * transitFlightsPerPage,
        (currentTransitFlightPage + 1) * transitFlightsPerPage
    );

    const goToNextPnrPage = () => {
        if (currentPnrPage < totalPnrPages - 1) {
            setCurrentPnrPage(prev => prev + 1);
        }
    };

    const goToPrevPnrPage = () => {
        if (currentPnrPage > 0) {
            setCurrentPnrPage(prev => prev - 1);
        }
    };

    const goToNextDirectFlightPage = () => {
        if (currentDirectFlightPage < totalDirectFlightPages - 1) {
            setCurrentDirectFlightPage(prev => prev + 1);
        }
    };

    const goToPrevDirectFlightPage = () => {
        if (currentDirectFlightPage > 0) {
            setCurrentDirectFlightPage(prev => prev - 1);
        }
    };

    const goToNextTransitFlightPage = () => {
        if (currentTransitFlightPage < totalTransitFlightPages - 1) {
            setCurrentTransitFlightPage(prev => prev + 1);
        }
    };

    const goToPrevTransitFlightPage = () => {
        if (currentTransitFlightPage > 0) {
            setCurrentTransitFlightPage(prev => prev - 1);
        }
    };

    const handleExportData = () => {
        const allData = {
            directFlights: directFlights,
            transitFlights: transitFlights,
            labels: labels,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'hotel-assignments-with-labels.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // ==================== RENDER LABEL POPUP ====================
    const renderLabelPopup = () => {
        if (!showLabelPopup) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center">
                                <Tag size={18} className="mr-2" />
                                Add Label to {selectedPnrRows.length} Selected Passenger(s)
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This label will be applied to all selected passengers
                            </p>
                        </div>
                        <button
                            onClick={handleCloseLabelPopup}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto max-h-[60vh]">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Label Text *
                            </label>
                            <input
                                type="text"
                                value={labelText}
                                onChange={(e) => setLabelText(e.target.value)}
                                placeholder="Enter label (e.g., VIP, Special Needs, Follow-up Required)"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={100}
                            />
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>Maximum 100 characters</span>
                                <span>{labelText.length}/100</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Label Color
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                                {labelColors.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setLabelColor(color.value)}
                                        className={`h-8 rounded-lg flex items-center justify-center ${labelColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {labelColor === color.value && (
                                            <Check size={14} className="text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority Level
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {priorityOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setLabelPriority(option.value)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium ${labelPriority === option.value ? 'ring-2 ring-offset-1' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        style={{
                                            backgroundColor: labelPriority === option.value ? option.color : '',
                                            color: labelPriority === option.value ? 'white' : 'black',
                                            borderColor: labelPriority === option.value ? option.color : ''
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attach Files (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Paperclip size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-1">Max 5 files, 10MB each</p>
                                </label>
                            </div>

                            {attachedFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Attached Files:</p>
                                    {attachedFiles.map(file => (
                                        <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <div className="flex items-center">
                                                <File size={14} className="text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-xs font-medium truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(file.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Label Preview:</p>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                 style={{ backgroundColor: `${labelColor}20`, color: labelColor }}>
                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: labelColor }}></div>
                                {labelText || "Your Label Text"}
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                                      style={{ 
                                          backgroundColor: priorityOptions.find(p => p.value === labelPriority)?.color + '20',
                                          color: priorityOptions.find(p => p.value === labelPriority)?.color 
                                      }}>
                                    {priorityOptions.find(p => p.value === labelPriority)?.label}
                                </span>
                                {attachedFiles.length > 0 && (
                                    <Paperclip size={10} className="ml-2" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end space-x-3">
                        <button
                            onClick={handleCloseLabelPopup}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApplyLabel}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            disabled={!labelText.trim()}
                        >
                            <Tag size={14} className="mr-2" />
                            Apply Label to {selectedPnrRows.length} Passenger(s)
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER FUNCTIONS ====================

    const renderPnrTab = () => {
        const allPassengers = [];
        let srNo = 1;
        
        currentPnrPassengers.forEach((pnr) => {
            if (pnr.passengers && Array.isArray(pnr.passengers)) {
                pnr.passengers.forEach((passenger) => {
                    const flightSegments = pnr.flight_segments || [];
                    const actualFlightSegments = flightSegments.filter(segment => 
                        !segment.type || segment.type !== "hotel"
                    );
                    
                    const sortedSegments = [...actualFlightSegments].sort((a, b) => a.segment_order - b.segment_order);
                    const segmentCount = sortedSegments.length;
                    const isDirectFlight = segmentCount === 1;
                    const isTransitFlight = segmentCount > 1;
                    
                    const flightLocations = getFlightLocations(flightSegments, passenger);
                    
                    const dateOfBirth = passenger.form_data?.date_of_birth || passenger.date_of_birth;
                    const ageInfo = calculateGuestTypeFromDOB(dateOfBirth);
                    
                    const travelPurpose = passenger.form_data?.travel_purpose || 
                                        passenger.travel_purpose || 
                                        (ageInfo.ageCategory === "Child" ? "Family" : "Business");
                    
                    const guestType = ageInfo.ageCategory 
                        ? `${ageInfo.ageCategory} (${travelPurpose})`
                        : travelPurpose;
                    
                    let locationDisplay = "";
                    if (flightLocations.departure !== "N/A" && flightLocations.arrival !== "N/A") {
                        locationDisplay = `${flightLocations.departure} → ${flightLocations.arrival}`;
                    } else if (sortedSegments.length > 0) {
                        const flightNo = sortedSegments[0]?.flight_number || "Unknown";
                        locationDisplay = `Flight ${flightNo}`;
                    } else {
                        locationDisplay = "Location N/A";
                    }
                    
                    const passengerData = {
                        id: `${pnr.id}_${passenger.passenger_id}`,
                        rowKey: `${pnrPassengers.indexOf(pnr)}_${pnr.passengers.indexOf(passenger)}`,
                        srNo: srNo++,
                        title: passenger.form_data?.title || passenger.title || "Mr.",
                        fullName: `${passenger.form_data?.first_name || passenger.first_name || ''} ${passenger.form_data?.last_name || passenger.last_name || ''}`.trim() || "Unknown Passenger",
                        guestType: guestType,
                        age: ageInfo.age,
                        dateOfBirth: dateOfBirth,
                        departureLocation: flightLocations.departure,
                        arrivalLocation: flightLocations.arrival,
                        departureLocationFull: flightLocations.departureFull,
                        arrivalLocationFull: flightLocations.arrivalFull,
                        location: locationDisplay,
                        remarks: `PNR: ${pnr.pnr_number || 'N/A'}, Passenger ID: ${passenger.passenger_id}${ageInfo.age ? `, Age: ${ageInfo.age}` : ''}`,
                        segmentCount: segmentCount,
                        pnrData: {
                            pnrId: pnr.id,
                            passengerId: passenger.passenger_id,
                            pnr_number: pnr.pnr_number,
                            passenger: passenger,
                            flight_segments: sortedSegments,
                            allSegments: flightSegments,
                            segmentCount: segmentCount,
                            isDirectFlight: isDirectFlight,
                            isTransitFlight: isTransitFlight
                        }
                    };
                    
                    allPassengers.push(passengerData);
                });
            }
        });
        
        return (
            <div className="text-[10px] leading-tight">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Total PNRs</p>
                            <p className="font-bold text-sm">{pnrPassengers.length}</p>
                        </div>
                        <Briefcase size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Total Passengers</p>
                            <p className="font-bold text-sm text-green-600">
                                {pnrPassengers.reduce(
                                    (t, p) => t + (Array.isArray(p.passengers) ? p.passengers.length : 0),
                                    0
                                )}
                            </p>
                        </div>
                        <User size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Direct Flight Passengers</p>
                            <p className="font-bold text-sm text-orange-600">
                                {pnrPassengers.reduce((total, pnr) => {
                                    if (!pnr.passengers || !pnr.flight_segments) return total;
                                    const actualSegments = pnr.flight_segments.filter(segment => 
                                        !segment.type || segment.type !== "hotel"
                                    );
                                    const segmentCount = actualSegments.length;
                                    return total + pnr.passengers.filter(() => segmentCount === 1).length;
                                }, 0)}
                            </p>
                        </div>
                        <Plane size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Transit Flight Passengers</p>
                            <p className="font-bold text-sm text-purple-600">
                                {pnrPassengers.reduce((total, pnr) => {
                                    if (!pnr.passengers || !pnr.flight_segments) return total;
                                    const actualSegments = pnr.flight_segments.filter(segment => 
                                        !segment.type || segment.type !== "hotel"
                                    );
                                    const segmentCount = actualSegments.length;
                                    return total + pnr.passengers.filter(() => segmentCount > 1).length;
                                }, 0)}
                            </p>
                        </div>
                        <Hotel size={18} className="text-purple-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleRefreshPnrData}
                            disabled={pnrLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={10} className={`mr-1 ${pnrLoading ? 'animate-spin' : ''}`} />
                            {pnrLoading ? 'Refreshing...' : 'Refresh PNR Data'}
                        </button>
                        <button
                            onClick={handleSelectAllPnrRows}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <CheckSquare size={10} className="mr-1" />
                            Select All ({allPassengers.length})
                        </button>
                        <button
                            onClick={handleOpenLabelPopup}
                            disabled={selectedPnrRows.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Tag size={10} className="mr-1" />
                            Add Label ({selectedPnrRows.length})
                        </button>
                        <button
                            onClick={handleExportData}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-[10px] rounded-lg flex items-center transition-colors"
                        >
                            <Download size={10} className="mr-1" />
                            Export Data
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                            <input
                                type="text"
                                placeholder="Search PNRs..."
                                value={pnrSearchTerm}
                                onChange={(e) => setPnrSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">PNR Passengers</h2>
                        <span className="text-gray-600">
                            Showing {currentPnrPage * pnrPerPage + 1} to {Math.min((currentPnrPage + 1) * pnrPerPage, allPassengers.length)} of {allPassengers.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={allPassengers.length > 0 && allPassengers.every(p => 
                                                    selectedPnrRows.includes(p.rowKey)
                                                )}
                                                onChange={handleSelectAllPnrRows}
                                                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            SR.NO
                                        </div>
                                    </th>
                                    <th className="px-2 py-1 text-left font-semibold border-r">
                                        Labels
                                    </th>
                                    {[
                                        "Title",
                                        "Full Name",
                                        "Guest Type",
                                        "Location",
                                        "Flight Segments",
                                        "Hotel Type",
                                        "Remarks",
                                        "Actions"
                                    ].map(h => (
                                        <th key={h} className="px-2 py-1 text-left font-semibold border-r last:border-r-0">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {allPassengers.length > 0 ? (
                                    allPassengers.map((passenger) => {
                                        const isSelected = selectedPnrRows.includes(passenger.rowKey);
                                        const segmentCount = passenger.segmentCount || passenger.pnrData.segmentCount || 0;
                                        const isDirectFlight = segmentCount === 1;
                                        const isTransitFlight = segmentCount > 1;
                                        const hotelType = isDirectFlight ? "Direct Flight Hotel" : 
                                                         isTransitFlight ? "Transit Flight Hotel" : "N/A";
                                        const passengerLabels = labels[passenger.rowKey] || [];
                                        
                                        return (
                                            <tr key={passenger.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handlePnrRowSelection(passenger.rowKey)}
                                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        {passenger.srNo}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex flex-wrap gap-1 min-w-[100px]">
                                                        {passengerLabels.map((label, index) => (
                                                            <div key={index} className="relative group">
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium"
                                                                     style={{ backgroundColor: `${label.color}20`, color: label.color }}>
                                                                    <div className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: label.color }}></div>
                                                                    {label.text}
                                                                    {label.files && label.files.length > 0 && (
                                                                        <Paperclip size={8} className="ml-1" />
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleRemoveLabel(passenger.rowKey, index)}
                                                                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={8} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {passengerLabels.length === 0 && (
                                                            <span className="text-gray-400 italic text-[9px]">No labels</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{passenger.title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{passenger.fullName}</span>
                                                    <div className="text-[9px] text-gray-500">
                                                        PNR: {passenger.pnrData.pnr_number}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            passenger.guestType.includes("Child") ? "bg-yellow-100 text-yellow-800" :
                                                            passenger.guestType.includes("Teenager") ? "bg-orange-100 text-orange-800" :
                                                            passenger.guestType.includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            passenger.guestType.includes("Transit") ? "bg-orange-100 text-orange-800" :
                                                            passenger.guestType.includes("Business") ? "bg-gray-100 text-gray-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {passenger.guestType}
                                                        </span>
                                                        {passenger.age !== null && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {passenger.age}
                                                                {passenger.dateOfBirth && (
                                                                    <div className="text-[7px] text-gray-400">
                                                                        DOB: {passenger.dateOfBirth}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <MapPin size={8} className="mr-1 flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-[9px]">
                                                                        {passenger.departureLocation !== "N/A" ? passenger.departureLocation : "N/A"}
                                                                    </span>
                                                                    <span className="mx-1 text-[8px]">→</span>
                                                                    <span className="font-medium text-[9px]">
                                                                        {passenger.arrivalLocation !== "N/A" ? passenger.arrivalLocation : "N/A"}
                                                                    </span>
                                                                </div>
                                                                {passenger.departureLocationFull && passenger.arrivalLocationFull && 
                                                                passenger.departureLocationFull !== "N/A" && passenger.arrivalLocationFull !== "N/A" && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        <div className="truncate max-w-[120px]" title={passenger.departureLocationFull}>
                                                                            From: {passenger.departureLocationFull}
                                                                        </div>
                                                                        <div className="truncate max-w-[120px]" title={passenger.arrivalLocationFull}>
                                                                            To: {passenger.arrivalLocationFull}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {passenger.pnrData?.flight_segments?.length > 0 && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        {segmentCount} actual flight segment(s) • 
                                                                        Flight: {passenger.pnrData.flight_segments[0]?.flight_number || "Unknown"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div className="flex items-center">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            segmentCount > 1 
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {segmentCount} Flight Segment{segmentCount !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="ml-2 text-gray-500 text-[9px]">
                                                            {segmentCount === 1 ? "Single segment → Direct Flight Tab" : "Multi-segment → Transit Flight Tab"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                        hotelType === "Direct Flight Hotel" 
                                                            ? "bg-green-100 text-green-800"
                                                            : hotelType === "Transit Flight Hotel" 
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {hotelType}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{passenger.remarks}</span>
                                                </td>

                                                <td className="px-2 py-1 align-top">
                                                    <div className="flex space-x-1">
                                                        <button
                                                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                            title="View Details"
                                                            onClick={() => {
                                                                const pnr = passenger.pnrData;
                                                                const assignedHotel = hotelAssignments[`${pnr.pnrId}_${pnr.passengerId}`];
                                                                const hotelInfo = assignedHotel ? 
                                                                    `Assigned Hotel: ${availableHotels.find(h => h.id === assignedHotel)?.name || assignedHotel}` : 
                                                                    "No hotel assigned";
                                                                
                                                                alert(`Passenger Details:\n\nName: ${passenger.fullName}\nPNR: ${pnr.pnr_number}\nPassenger ID: ${pnr.passengerId}\nAge: ${passenger.age || 'N/A'}\nDate of Birth: ${passenger.dateOfBirth || 'N/A'}\nGuest Type: ${passenger.guestType}\nDeparture: ${passenger.departureLocation}\nArrival: ${passenger.arrivalLocation}\nActual Flight Segments: ${segmentCount}\nHotel Type: ${hotelType}\n${hotelInfo}`);
                                                            }}
                                                        >
                                                            <Eye size={10} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="text-center py-6 text-gray-500">
                                            {pnrLoading ? 'Loading PNR data...' : 'No PNR passengers found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {allPassengers.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <span className="text-gray-600">
                                Page {currentPnrPage + 1} of {totalPnrPages}
                            </span>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevPnrPage}
                                    disabled={currentPnrPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextPnrPage}
                                    disabled={currentPnrPage >= totalPnrPages - 1}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDirectFlightTab = () => {
        return (
            <div className="text-[10px] leading-tight">
                {assignmentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle size={14} className="text-red-500 mr-2" />
                                <span className="text-red-700 text-[10px]">{assignmentError}</span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {assignmentSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                <span className="text-green-700 text-[10px]">
                                    {assignmentSuccess.message}
                                    {assignmentSuccess.confirmation && (
                                        <span className="ml-2 font-semibold">
                                            Confirmation: {assignmentSuccess.confirmation}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-green-500 hover:text-green-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-4">
                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Direct Flight Passengers</p>
                            <p className="font-bold text-sm">{directFlights.length}</p>
                        </div>
                        <Plane size={18} className="text-blue-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Assigned Hotels</p>
                            <p className="font-bold text-sm text-green-600">
                                {directFlights.filter(h => h.hotel || h.pnrData.hasExistingHotel).length}
                            </p>
                        </div>
                        <CheckCircle size={18} className="text-green-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Pending Assignment</p>
                            <p className="font-bold text-sm text-orange-600">
                                {directFlights.filter(h => !h.hotel && !h.pnrData.hasExistingHotel).length}
                            </p>
                        </div>
                        <AlertCircle size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Flight Segments = 1</p>
                            <p className="font-bold text-sm text-purple-600">
                                {directFlights.length}
                            </p>
                        </div>
                        <Building size={18} className="text-purple-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Children (0-10)</p>
                            <p className="font-bold text-sm text-yellow-600">
                                {directFlights.filter(h => h.ageCategory === "Child").length}
                            </p>
                        </div>
                        <User size={18} className="text-yellow-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Teenagers (11-18)</p>
                            <p className="font-bold text-sm text-orange-600">
                                {directFlights.filter(h => h.ageCategory === "Teenager").length}
                            </p>
                        </div>
                        <User size={18} className="text-orange-600" />
                    </div>

                    <div className="bg-white p-2 border rounded flex justify-between">
                        <div>
                            <p className="text-gray-500">Adults (18+)</p>
                            <p className="font-bold text-sm text-blue-600">
                                {directFlights.filter(h => h.ageCategory === "Adult").length}
                            </p>
                        </div>
                        <User size={18} className="text-blue-600" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                            <input
                                type="text"
                                placeholder="Search direct flights..."
                                value={directFlightSearchTerm}
                                onChange={(e) => setDirectFlightSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Direct Flight Hotel Assignments (Single-segment Passengers)</h2>
                        <span className="text-gray-600">
                            Showing {currentDirectFlightPage * directFlightsPerPage + 1} to {Math.min((currentDirectFlightPage + 1) * directFlightsPerPage, filteredDirectFlights.length)} of {filteredDirectFlights.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">
                                        SR.NO
                                    </th>
                                    {[
                                        "Title",
                                        "Full Name",
                                        "Guest Type",
                                        "Location",
                                        "Hotel Assignment",
                                        "Room No",
                                        "Hotel Room No",
                                        "Room Type",
                                        "Remarks",
                                        "Duration of Next Flight",
                                        "ARV Flight – Flight No",
                                        "ARV Flight – Date",
                                        "ARV Flight – ARV Time",
                                        "DEP Flight – Flight No",
                                        "DEP Flight – Date",
                                        "DEP Flight – DEP Time",
                                        "Actions"
                                    ].map(h => (
                                        <th key={h} className="px-2 py-1 text-left font-semibold border-r last:border-r-0">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {currentDirectFlights.length > 0 ? (
                                    currentDirectFlights.map((directFlight) => {
                                        const assignedHotelId = hotelAssignments[`${directFlight.pnrData.pnrId}_${directFlight.pnrData.passengerId}`];
                                        const assignedHotel = availableHotels.find(h => h.id === assignedHotelId);
                                        const segmentCount = directFlight.segmentCount || directFlight.pnrData.segmentCount || 0;
                                        
                                        return (
                                            <tr key={directFlight.id} className="border-b hover:bg-gray-50">
                                                <td className="px-2 py-1 border-r align-top">
                                                    {directFlight.srNo}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{directFlight.title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{directFlight.fullName}</span>
                                                    <div className="text-[9px] text-gray-500">
                                                        PNR: {directFlight.pnrData?.pnr_number}
                                                        <div className="mt-0.5">
                                                            Flight Segments: {segmentCount} (Direct Flight)
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            directFlight.guestType.includes("Child") ? "bg-yellow-100 text-yellow-800" :
                                                            directFlight.guestType.includes("Teenager") ? "bg-orange-100 text-orange-800" :
                                                            directFlight.guestType.includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            directFlight.guestType.includes("Business") ? "bg-gray-100 text-gray-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {directFlight.guestType}
                                                        </span>
                                                        {directFlight.age !== null && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {directFlight.age}
                                                                {directFlight.dateOfBirth && (
                                                                    <div className="text-[7px] text-gray-400">
                                                                        DOB: {directFlight.dateOfBirth}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <MapPin size={8} className="mr-1 flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-[9px]">
                                                                        {directFlight.departureLocation !== "N/A" ? directFlight.departureLocation : "N/A"}
                                                                    </span>
                                                                    <span className="mx-1 text-[8px]">→</span>
                                                                    <span className="font-medium text-[9px]">
                                                                        {directFlight.arrivalLocation !== "N/A" ? directFlight.arrivalLocation : "N/A"}
                                                                    </span>
                                                                </div>
                                                                {directFlight.departureLocationFull && directFlight.arrivalLocationFull && 
                                                                directFlight.departureLocationFull !== "N/A" && directFlight.arrivalLocationFull !== "N/A" && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        <div className="truncate max-w-[120px]" title={directFlight.departureLocationFull}>
                                                                            From: {directFlight.departureLocationFull}
                                                                        </div>
                                                                        <div className="truncate max-w-[120px]" title={directFlight.arrivalLocationFull}>
                                                                            To: {directFlight.arrivalLocationFull}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {directFlight.pnrData?.flight_segments?.length > 0 && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        {segmentCount} flight segment(s) • 
                                                                        Flight: {directFlight.pnrData.flight_segments[0]?.flight_number || "Unknown"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading hotels...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <select
                                                                value={directFlight.pnrData.hasExistingHotel ? directFlight.pnrData.existingHotelVendorId : (assignedHotelId || "")}
                                                                onChange={(e) => {
                                                                    const selectedHotelId = e.target.value;
                                                                    if (selectedHotelId) {
                                                                        if (directFlight.pnrData.hasExistingHotel && directFlight.pnrData.existingHotelVendorId === selectedHotelId) {
                                                                            return;
                                                                        }
                                                                        
                                                                        const action = directFlight.pnrData.hasExistingHotel ? "change" : "assign";
                                                                        const message = directFlight.pnrData.hasExistingHotel 
                                                                            ? `Change hotel from "${directFlight.pnrData.existingHotelName}" to new hotel?`
                                                                            : `Assign hotel to ${directFlight.fullName}?`;
                                                                        
                                                                        if (window.confirm(message)) {
                                                                            handleAssignHotel(directFlight, selectedHotelId);
                                                                        } else {
                                                                            e.target.value = directFlight.pnrData.hasExistingHotel ? directFlight.pnrData.existingHotelVendorId : (assignedHotelId || "");
                                                                        }
                                                                    } else {
                                                                        if (!directFlight.pnrData.hasExistingHotel) {
                                                                            if (window.confirm("Clear hotel assignment?")) {
                                                                                handleDirectFlightAssignment(directFlight.id, "");
                                                                            } else {
                                                                                e.target.value = assignedHotelId || "";
                                                                            }
                                                                        } else {
                                                                            alert("Hotel assignment is stored in database. Please use API to clear it.");
                                                                            e.target.value = directFlight.pnrData.existingHotelVendorId;
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={assigningHotel === directFlight.id}
                                                                className="w-full p-1 border border-gray-300 rounded text-[9px] disabled:opacity-50"
                                                            >
                                                                <option value="">{directFlight.pnrData.hasExistingHotel ? "Change Hotel..." : "Select Hotel"}</option>
                                                                {availableHotels.map(h => (
                                                                    <option key={h.id} value={h.id}>
                                                                        {h.name} {h.rating ? `(${h.rating}⭐)` : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {assigningHotel === directFlight.id && (
                                                                <div className="text-[8px] text-blue-600 flex items-center">
                                                                    <RefreshCw size={8} className="animate-spin mr-1" />
                                                                    {directFlight.pnrData.hasExistingHotel ? "Changing..." : "Assigning..."}
                                                                </div>
                                                            )}
                                                            {directFlight.pnrData.hasExistingHotel && !assigningHotel && (
                                                                <div className="text-[8px] text-green-600 flex items-center">
                                                                    <Check size={8} className="mr-1" />
                                                                    Currently: {directFlight.pnrData.existingHotelName}
                                                                    {directFlight.pnrData.hotelConfirmationNumber && (
                                                                        <span className="ml-1 text-[7px] text-gray-500">
                                                                            (Conf: {directFlight.pnrData.hotelConfirmationNumber})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {!directFlight.pnrData.hasExistingHotel && assignedHotel && !assigningHotel && (
                                                                <div className="text-[8px] text-green-600 flex items-center">
                                                                    <Check size={8} className="mr-1" />
                                                                    {assignedHotel.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">No hotels available</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{directFlight.roomNo || "-"}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{directFlight.hotelRoomNo || "-"}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {directFlight.roomType ? (
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            directFlight.roomType === "Suite" ? "bg-purple-100 text-purple-800" :
                                                            directFlight.roomType === "Deluxe" ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {directFlight.roomType}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{directFlight.remarks}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{directFlight.durationOfNextFlight}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{directFlight.arvFlightFlightNo}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {directFlight.arvFlightDate}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{directFlight.arvFlightArvTime}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{directFlight.depFlightFlightNo}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {directFlight.depFlightDate}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{directFlight.depFlightDepTime}</span>
                                                </td>

                                                <td className="px-2 py-1 align-top">
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => {
                                                                if (directFlight.pnrData) {
                                                                    handleDirectFlightAssignment(directFlight.id, "");
                                                                    alert("Hotel assignment cleared locally");
                                                                }
                                                            }}
                                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                            title="Clear Local Assignment"
                                                            disabled={!assignedHotelId || assigningHotel || directFlight.pnrData.hasExistingHotel}
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={17} className="text-center py-6 text-gray-500">
                                            No single-segment passengers found. Passengers with exactly 1 actual flight segment will appear here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredDirectFlights.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <div className="text-gray-600">
                                Page {currentDirectFlightPage + 1} of {totalDirectFlightPages}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevDirectFlightPage}
                                    disabled={currentDirectFlightPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextDirectFlightPage}
                                    disabled={currentDirectFlightPage >= totalDirectFlightPages - 1}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTransitFlightTab = () => {
        return (
            <div className="text-[10px] leading-tight">
                {assignmentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle size={14} className="text-red-500 mr-2" />
                                <span className="text-red-700 text-[10px]">{assignmentError}</span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {assignmentSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                <span className="text-green-700 text-[10px]">
                                    {assignmentSuccess.message}
                                    {assignmentSuccess.confirmation && (
                                        <span className="ml-2 font-semibold">
                                            Confirmation: {assignmentSuccess.confirmation}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <button 
                                onClick={clearAssignmentMessages}
                                className="text-green-500 hover:text-green-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                            <input
                                type="text"
                                placeholder="Search transit flights..."
                                value={transitFlightSearchTerm}
                                onChange={(e) => setTransitFlightSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border rounded-lg text-[10px] w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded shadow">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Transit Flight Hotel Assignments (Multi-segment Passengers)</h2>
                        <span className="text-gray-600">
                            Showing {currentTransitFlightPage * transitFlightsPerPage + 1} to {Math.min((currentTransitFlightPage + 1) * transitFlightsPerPage, filteredTransitFlights.length)} of {filteredTransitFlights.length} passengers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[10px]">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="px-2 py-1 text-left font-semibold border-r">
                                        SR.NO
                                    </th>
                                    {[
                                        "Title",
                                        "Full Name",
                                        "Guest Type",
                                        "Location",
                                        "Transit Hotel Assignment",
                                        "Transit Room No",
                                        "Transit Hotel Room No",
                                        "Room Type",
                                        "Remarks",
                                        "Duration of Next Flight",
                                        "ARV Flight – Flight No",
                                        "ARV Flight – Date",
                                        "ARV Flight – ARV Time",
                                        "DEP Flight – Flight No",
                                        "DEP Flight – Date",
                                        "DEP Flight – DEP Time",
                                        "Actions"
                                    ].map(h => (
                                        <th key={h} className="px-2 py-1 text-left font-semibold border-r last:border-r-0">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {currentTransitFlights.length > 0 ? (
                                    currentTransitFlights.map((transitFlight) => {
                                        const assignedHotelId = hotelAssignments[`${transitFlight.pnrData.pnrId}_${transitFlight.pnrData.passengerId}`];
                                        const assignedHotel = availableHotels.find(h => h.id === assignedHotelId);
                                        const segmentCount = transitFlight.segmentCount || transitFlight.pnrData.segmentCount || 0;
                                        
                                        return (
                                            <tr key={transitFlight.id} className="border-b hover:bg-gray-50">
                                                <td className="px-2 py-1 border-r align-top">
                                                    {transitFlight.srNo}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{transitFlight.title}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-semibold">{transitFlight.fullName}</span>
                                                    <div className="text-[9px] text-gray-500">
                                                        PNR: {transitFlight.pnrData?.pnr_number}
                                                        <div className="mt-0.5">
                                                            Flight Segments: {segmentCount} (Transit Flight)
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] mb-1 block ${
                                                            transitFlight.guestType.includes("Child") ? "bg-yellow-100 text-yellow-800" :
                                                            transitFlight.guestType.includes("Teenager") ? "bg-orange-100 text-orange-800" :
                                                            transitFlight.guestType.includes("Adult") ? "bg-blue-100 text-blue-800" :
                                                            transitFlight.guestType.includes("Business") ? "bg-gray-100 text-gray-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {transitFlight.guestType}
                                                        </span>
                                                        {transitFlight.age !== null && (
                                                            <div className="text-[8px] text-gray-500">
                                                                Age: {transitFlight.age}
                                                                {transitFlight.dateOfBirth && (
                                                                    <div className="text-[7px] text-gray-400">
                                                                        DOB: {transitFlight.dateOfBirth}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <MapPin size={8} className="mr-1 flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-[9px]">
                                                                        {transitFlight.departureLocation !== "N/A" ? transitFlight.departureLocation : "N/A"}
                                                                    </span>
                                                                    <span className="mx-1 text-[8px]">→</span>
                                                                    <span className="font-medium text-[9px]">
                                                                        {transitFlight.arrivalLocation !== "N/A" ? transitFlight.arrivalLocation : "N/A"}
                                                                    </span>
                                                                </div>
                                                                {transitFlight.departureLocationFull && transitFlight.arrivalLocationFull && 
                                                                transitFlight.departureLocationFull !== "N/A" && transitFlight.arrivalLocationFull !== "N/A" && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        <div className="truncate max-w-[120px]" title={transitFlight.departureLocationFull}>
                                                                            From: {transitFlight.departureLocationFull}
                                                                        </div>
                                                                        <div className="truncate max-w-[120px]" title={transitFlight.arrivalLocationFull}>
                                                                            To: {transitFlight.arrivalLocationFull}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {transitFlight.pnrData?.flight_segments?.length > 0 && (
                                                                    <div className="text-[7px] text-gray-500 mt-0.5">
                                                                        {segmentCount} flight segment(s) • 
                                                                        First Flight: {transitFlight.pnrData.flight_segments[0]?.flight_number || "Unknown"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {hotelsLoading ? (
                                                        <div className="text-gray-500 text-[9px]">Loading hotels...</div>
                                                    ) : availableHotels.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <select
                                                                value={transitFlight.pnrData.hasExistingHotel ? transitFlight.pnrData.existingHotelVendorId : (assignedHotelId || "")}
                                                                onChange={(e) => {
                                                                    const selectedHotelId = e.target.value;
                                                                    if (selectedHotelId) {
                                                                        if (transitFlight.pnrData.hasExistingHotel && transitFlight.pnrData.existingHotelVendorId === selectedHotelId) {
                                                                            return;
                                                                        }
                                                                        
                                                                        const action = transitFlight.pnrData.hasExistingHotel ? "change" : "assign";
                                                                        const message = transitFlight.pnrData.hasExistingHotel 
                                                                            ? `Change transit hotel from "${transitFlight.pnrData.existingHotelName}" to new hotel?`
                                                                            : `Assign transit hotel to ${transitFlight.fullName}?`;
                                                                        
                                                                        if (window.confirm(message)) {
                                                                            handleAssignHotel(transitFlight, selectedHotelId);
                                                                        } else {
                                                                            e.target.value = transitFlight.pnrData.hasExistingHotel ? transitFlight.pnrData.existingHotelVendorId : (assignedHotelId || "");
                                                                        }
                                                                    } else {
                                                                        if (!transitFlight.pnrData.hasExistingHotel) {
                                                                            if (window.confirm("Clear transit hotel assignment?")) {
                                                                                handleTransitFlightAssignment(transitFlight.id, "");
                                                                            } else {
                                                                                e.target.value = assignedHotelId || "";
                                                                            }
                                                                        } else {
                                                                            alert("Transit hotel assignment is stored in database. Please use API to clear it.");
                                                                            e.target.value = transitFlight.pnrData.existingHotelVendorId;
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={assigningHotel === transitFlight.id}
                                                                className="w-full p-1 border border-gray-300 rounded text-[9px] disabled:opacity-50"
                                                            >
                                                                <option value="">{transitFlight.pnrData.hasExistingHotel ? "Change Transit Hotel..." : "Select Transit Hotel"}</option>
                                                                {availableHotels.map(h => (
                                                                    <option key={h.id} value={h.id}>
                                                                        {h.name} {h.rating ? `(${h.rating}⭐)` : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {assigningHotel === transitFlight.id && (
                                                                <div className="text-[8px] text-blue-600 flex items-center">
                                                                    <RefreshCw size={8} className="animate-spin mr-1" />
                                                                    {transitFlight.pnrData.hasExistingHotel ? "Changing..." : "Assigning..."}
                                                                </div>
                                                            )}
                                                            {transitFlight.pnrData.hasExistingHotel && !assigningHotel && (
                                                                <div className="text-[8px] text-green-600 flex items-center">
                                                                    <Check size={8} className="mr-1" />
                                                                    Currently: {transitFlight.pnrData.existingHotelName}
                                                                    {transitFlight.pnrData.hotelConfirmationNumber && (
                                                                        <span className="ml-1 text-[7px] text-gray-500">
                                                                            (Conf: {transitFlight.pnrData.hotelConfirmationNumber})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {!transitFlight.pnrData.hasExistingHotel && assignedHotel && !assigningHotel && (
                                                                <div className="text-[8px] text-green-600 flex items-center">
                                                                    <Check size={8} className="mr-1" />
                                                                    {assignedHotel.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">No hotels available</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{transitFlight.roomNo || "-"}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{transitFlight.hotelRoomNo || "-"}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {transitFlight.roomType ? (
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                            transitFlight.roomType === "Suite" ? "bg-purple-100 text-purple-800" :
                                                            transitFlight.roomType === "Deluxe" ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {transitFlight.roomType}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-[9px]">Not assigned</span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="text-gray-600">{transitFlight.remarks}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-medium">{transitFlight.durationOfNextFlight}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{transitFlight.arvFlightFlightNo}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {transitFlight.arvFlightDate}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{transitFlight.arvFlightArvTime}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{transitFlight.depFlightFlightNo}</span>
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    {transitFlight.depFlightDate}
                                                </td>

                                                <td className="px-2 py-1 border-r align-top">
                                                    <span className="font-mono">{transitFlight.depFlightDepTime}</span>
                                                </td>

                                                <td className="px-2 py-1 align-top">
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => {
                                                                if (transitFlight.pnrData) {
                                                                    handleTransitFlightAssignment(transitFlight.id, "");
                                                                    alert("Transit hotel assignment cleared locally");
                                                                }
                                                            }}
                                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                            title="Clear Local Assignment"
                                                            disabled={!assignedHotelId || assigningHotel || transitFlight.pnrData.hasExistingHotel}
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={17} className="text-center py-6 text-gray-500">
                                            No multi-segment passengers found. Passengers with 2 or more actual flight segments will appear here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredTransitFlights.length > 0 && (
                        <div className="p-2 border-t flex justify-between items-center">
                            <div className="text-gray-600">
                                Page {currentTransitFlightPage + 1} of {totalTransitFlightPages}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={goToPrevTransitFlightPage}
                                    disabled={currentTransitFlightPage === 0}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={goToNextTransitFlightPage}
                                    disabled={currentTransitFlightPage >= totalTransitFlightPages - 1}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSettingsTab = () => (
        <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Application Settings</h2>
                
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">General Settings</h3>
                            
                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="autoRefresh"
                                        checked={settings.autoRefresh}
                                        onChange={handleSettingsChange}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Auto Refresh Data</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Automatically refresh PNR data at specified intervals</p>
                            </div>

                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="enableNotifications"
                                        checked={settings.enableNotifications}
                                        onChange={handleSettingsChange}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Enable Notifications</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Receive notifications for hotel assignments</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refresh Interval (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="refreshInterval"
                                    value={settings.refreshInterval}
                                    onChange={handleSettingsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="10"
                                    max="300"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Default Values</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Hotel Room Type
                                </label>
                                <select
                                    name="defaultRoomType"
                                    value={settings.defaultRoomType}
                                    onChange={handleSettingsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {roomTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Guest Type
                                </label>
                                <select
                                    name="defaultGuestType"
                                    value={settings.defaultGuestType}
                                    onChange={handleSettingsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {guestTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Export Format
                                </label>
                                <select
                                    name="exportFormat"
                                    value={settings.exportFormat}
                                    onChange={handleSettingsChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="csv">CSV</option>
                                    <option value="excel">Excel</option>
                                    <option value="pdf">PDF</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => setSettings({
                                autoRefresh: true,
                                refreshInterval: 30,
                                defaultRoomType: "Standard",
                                defaultGuestType: "Business",
                                enableNotifications: true,
                                exportFormat: "csv"
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Reset to Defaults
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "pnr":
                return renderPnrTab();
            case "directFlight":
                return renderDirectFlightTab();
            case "transitFlight":
                return renderTransitFlightTab();
            case "settings":
                return renderSettingsTab();
            default:
                return renderPnrTab();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-bold text-gray-800">Hotel Management System</h1>
                    <p className="text-gray-600 text-[12px]">Manage hotel assignments for PNR passengers</p>
                </div>
            </div>

            <div className="rounded-lg mb-6">
                <div className="border-b">
                    <nav className="flex space-x-4 px-4">
                        <button
                            onClick={() => {
                                setActiveTab("pnr");
                                setCurrentPnrPage(0);
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "pnr"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Plane size={10} />
                            <span>PNR Passengers</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    activeTab === "pnr"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {pnrPassengers.reduce((t, p) => t + (p.passengers?.length || 0), 0)}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("directFlight");
                                setCurrentDirectFlightPage(0);
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "directFlight"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Plane size={10} />
                            <span>Direct Flight</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    activeTab === "directFlight"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {directFlights.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("transitFlight");
                                setCurrentTransitFlightPage(0);
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "transitFlight"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Hotel size={10} />
                            <span>Transit Flight</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                    activeTab === "transitFlight"
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {transitFlights.length}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab("settings");
                                clearAssignmentMessages();
                            }}
                            className={`flex items-center gap-1 py-1 px-2 border-b-2 font-medium text-[10px] transition-colors ${
                                activeTab === "settings"
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Settings size={10} />
                            <span>Settings</span>
                        </button>
                    </nav>
                </div>
            </div>

            {renderTabContent()}
            {renderLabelPopup()}
        </div>
    );
}